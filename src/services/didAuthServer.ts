import {
  doc,
  setDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  findEmployeeByIdOrEmail,
  type FirestoreEmployee,
} from './firebaseEmployeeService';
import {
  DID_CHALLENGE_TTL_MS,
  buildChallengeText,
  evaluateDidChallenge,
  generateDidNonce,
  type DidAuthSessionInfo,
  type DidAuthStep,
  type DidChallengeDoc,
  type DidEmployeeDoc,
} from '../lib/did/didAuthCrypto';

/**
 * BEL Trust Platform — SERVER-SIDE DID authentication service.
 *
 * This module is the verification authority for employee DID logins
 * (the "server" in the challenge/response protocol):
 *
 *   issueDidChallenge()            — credentials were verified (Firebase Auth)
 *                           and the employee record resolved → generate a
 *                           cryptographically secure, single-use, short-lived
 *                           challenge and persist it in Firestore
 *                           (`didChallenges/{challengeId}`).
 *
 *   verifyDidChallengeResponse()   — the employee wallet returned
 *                           { DID, challengeId, signature } → re-reads the
 *                           challenge AND the employee record from Firebase and
 *                           verifies the signature against the PUBLIC KEY stored
 *                           in Firebase inside an atomic transaction that marks
 *                           the challenge used=true only when EVERY check passes.
 *
 * SECURITY
 *   • This module NEVER imports the wallet / secure key storage — it has no
 *     possible access to private keys. Only { DID, challengeId, signature }
 *     travel to the server side.
 *   • DID ownership, public key, role and account status are read from
 *     Firebase — values supplied by the client are treated as unverified
 *     claims and cross-checked.
 *   • `used` is flipped false→true inside runTransaction, so a challenge can
 *     never be consumed twice even under concurrent replays.
 *   • Firestore rules (firestore.rules → /didChallenges) enforce the same
 *     contract server-side: create requires auth, updates may only flip
 *     used=false→true, deletes are forbidden.
 */

const COLLECTION = 'didChallenges';

export interface IssuedDidChallenge {
  challengeId: string;
  challenge: string;
  did: string;
  employeeID: string;
  walletAddress: string;
  expiresAt: string; // ISO
}

export interface DidVerifyRequest {
  challengeId: string;
  did: string;
  signature: string;
}

export interface DidVerifyResult {
  success: boolean;
  error?: string;
  steps: DidAuthStep[];
  session?: DidAuthSessionInfo;
}

/** Thrown by issueDidChallenge when the employee record fails preconditions. */
export class DidChallengeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DidChallengeError';
  }
}
/**
 * Step 1 of the flow — credentials verified, employee resolved:
 * generate + persist a single-use challenge bound to the employee's DID.
 */
export async function issueDidChallenge(employee: FirestoreEmployee): Promise<IssuedDidChallenge> {
  const did = (employee.did || '').trim();
  const employeeID = (employee.employeeId || '').trim();

  if (!employeeID) {
    throw new DidChallengeError('Employee record has no employee ID. Contact BEL IT Security.');
  }
  if (!did) {
    throw new DidChallengeError(
      'No DID found for this employee in Firebase. Ask BEL IT Security to issue your DID first.'
    );
  }
  const publicKey = (employee.publicKey || '').trim();
  if (!publicKey) {
    throw new DidChallengeError(
      'No DID public key on file for this employee. Contact BEL IT Security.'
    );
  }
  const status = (employee.status || '').trim().toLowerCase();
  if (status && ['revoked', 'suspended', 'inactive', 'terminated', 'disabled', 'blocked'].includes(status)) {
    throw new DidChallengeError('Employee account is inactive. Access denied.');
  }

  const now = Date.now();
  const expiresAtMs = now + DID_CHALLENGE_TTL_MS;
  const nonce = generateDidNonce();
  const walletAddress = (employee.walletAddress || '').toLowerCase();

  const challenge = buildChallengeText({
    did,
    walletAddress: walletAddress || did.replace(/^did:ethr:/, ''),
    nonce,
    issuedAtMs: now,
    expiresAtMs,
  });

  const challengeDoc: DidChallengeDoc = {
    challenge,
    DID: did,
    employeeID,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(expiresAtMs).toISOString(),
    used: false,
    walletAddress,
    nonce,
  };

  const challengeRef = doc(db, COLLECTION);
  try {
    await setDoc(challengeRef, challengeDoc);
  } catch {
    throw new DidChallengeError(
      'Could not store the DID challenge in Firebase (permission denied). Deploy the updated firestore.rules for the didChallenges collection.'
    );
  }

  return {
    challengeId: challengeRef.id,
    challenge,
    did,
    employeeID,
    walletAddress,
    expiresAt: challengeDoc.expiresAt,
  };
}

/**
 * Step 2 of the flow — verify { DID, challengeId, signature } SERVER-SIDE.
 *
 * All checks run inside a single Firestore transaction:
 *   • the challenge and the employee record are re-read from Firebase,
 *   • the signature is verified against the Firebase-stored public key,
 *   • used is atomically flipped false→true ONLY when every check passes.
 * A failed attempt aborts the transaction and leaves the challenge untouched
 * (still usable once by its legitimate owner).
 */
export async function verifyDidChallengeResponse(req: DidVerifyRequest): Promise<DidVerifyResult> {
  const challengeId = (req.challengeId || '').trim();
  const didClaim = (req.did || '').trim();
  const signature = (req.signature || '').trim();

  if (!challengeId || !didClaim || !signature) {
    return { success: false, error: 'Missing DID, challenge ID or signature.', steps: [] };
  }

  try {
    const result = await runTransaction(db, async (tx) => {
      const challengeRef = doc(db, COLLECTION, challengeId);
      const challengeSnap = await tx.get(challengeRef);
      const challengeDoc = challengeSnap.exists()
        ? (challengeSnap.data() as DidChallengeDoc)
        : null;

      // Resolve the employee record from Firebase via the challenge's
      // employeeID (never from a client-supplied identifier).
      let employeeDoc: FirestoreEmployee | null = null;
      const claimedEmployeeID = challengeDoc?.employeeID?.trim() || '';
      if (claimedEmployeeID) {
        try {
          const empSnap = await tx.get(doc(db, 'employees', claimedEmployeeID));
          if (empSnap.exists()) {
            employeeDoc = empSnap.data() as FirestoreEmployee;
          }
        } catch {
          /* fall through to the query-based lookup below */
        }
        if (!employeeDoc) {
          // Document IDs are not always the employeeId — query instead.
          employeeDoc = await findEmployeeByIdOrEmail(claimedEmployeeID);
        }
      }

      // Full server-side verification (pure, shared with the test suite).
      const evaluation = evaluateDidChallenge({
        nowMs: Date.now(),
        challengeId,
        didClaim,
        signature,
        challengeDoc,
        employeeDoc: (employeeDoc as DidEmployeeDoc | null) ?? null,
      });

      if (!evaluation.ok || !evaluation.session) {
        // Abort the transaction → the challenge is NOT consumed on failure.
        const err = new Error(evaluation.error || 'DID verification failed.');
        (err as any).didAuthSteps = evaluation.steps;
        throw err;
      }

      // Atomic single-use consume — replay impossible past this point.
      tx.update(challengeRef, { used: true, usedAt: new Date().toISOString() });

      return { session: evaluation.session, steps: evaluation.steps };
    });

    return { success: true, steps: result.steps, session: result.session };
  } catch (err: unknown) {
    const steps = ((err as any)?.didAuthSteps as DidAuthStep[] | undefined) ?? [];
    const message = err instanceof Error ? err.message : 'DID verification failed.';
    return { success: false, error: message, steps };
  }
}

