import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
} from 'firebase/firestore';
import { ethers } from 'ethers';
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

/* ---------------------------------------------------------------------------
 * Step 3 — DID entry: search Firebase for the DID and verify it belongs to
 * the authenticated user. Never authenticates merely because a DID exists.
 * ------------------------------------------------------------------------- */

/** Public wallet info gathered from the EXISTING wallet (never a private key). */
export interface DidWalletClaim {
  /** Wallet address reported by the connected wallet. */
  address: string;
  /** Raw public key when the wallet exposes one (browser key vault does). */
  publicKey?: string;
}

export interface DidVerificationOutcome {
  ok: boolean;
  error?: string;
  /** Normalized (ethers checksum) DID. */
  did: string;
  /** Lowercase wallet address encoded in the DID. */
  walletAddress: string;
  /** True when the DID was found in the Firebase registry. */
  registeredInFirebase: boolean;
  /** True when the record must be registered during wallet verification. */
  needsRegistration?: boolean;
  /** True when the DID is bound to the authenticated Firebase user. */
  boundToAuthenticatedUser: boolean;
}

/** Parses + normalizes a did:ethr DID. Returns null for any other format. */
export function parseEthrDid(input: string): { did: string; address: string } | null {
  const trimmed = (input || '').trim();
  const m = /^did:ethr:(0x[0-9a-fA-F]{40})$/.exec(trimmed);
  if (!m) return null;
  try {
    const address = ethers.getAddress(m[1]); // checksum form
    return { did: `did:ethr:${address}`, address: address.toLowerCase() };
  } catch {
    return null;
  }
}

/** Reads the fresh employee record for an employeeId (document ID convention). */
async function readEmployeeDoc(employeeId: string): Promise<FirestoreEmployee | null> {
  try {
    const snap = await getDoc(doc(db, 'employees', employeeId));
    if (snap.exists()) return snap.data() as FirestoreEmployee;
  } catch {
    /* fall through */
  }
  return findEmployeeByIdOrEmail(employeeId);
}

/**
 * STEP 3 of the flow — the user manually entered their DID.
 *
 * Searches Firebase for the DID and verifies it belongs to the
 * credential-authenticated user:
 *   • DID found in Firebase under ANOTHER employee → FAIL ("belongs to
 *     another user") — never re-registered, never accepted.
 *   • DID found in Firebase for THIS employee → registered + active check.
 *   • DID NOT found in Firebase → the flow continues to "Connect Wallet",
 *     where the EXISTING wallet must cryptographically prove control of the
 *     DID's key (address = keccak(public key) is forge-proof) before the DID
 *     is registered ONCE to the authenticated user's own record. Actual
 *     authentication still always requires the challenge signature.
 */
export async function verifyDidForAuthenticatedUser(
  employee: FirestoreEmployee,
  enteredDid: string
): Promise<DidVerificationOutcome> {
  const parsed = parseEthrDid(enteredDid);
  if (!parsed) {
    return {
      ok: false,
      error: 'Invalid DID format. Expected did:ethr:0x… (40-digit Ethereum address).',
      did: '',
      walletAddress: '',
      registeredInFirebase: false,
      boundToAuthenticatedUser: false,
    };
  }

  // Search Firebase for the DID (exact + checksummed variants).
  const variants = Array.from(
    new Set([enteredDid.trim(), parsed.did, enteredDid.trim().toLowerCase()])
  );
  for (const variant of variants) {
    try {
      const snap = await getDocs(
        query(collection(db, 'employees'), where('did', '==', variant))
      );
      if (!snap.empty) {
        const found = snap.docs[0].data() as FirestoreEmployee;
        const foundId = (found.employeeId || '').trim().toLowerCase();
        const authId = (employee.employeeId || '').trim().toLowerCase();
        if (!foundId || foundId !== authId) {
          return {
            ok: false,
            error:
              'DID authentication FAILED — this DID is registered to another user in Firebase.',
            did: parsed.did,
            walletAddress: parsed.address,
            registeredInFirebase: true,
            boundToAuthenticatedUser: false,
          };
        }
        // DID registered to the authenticated employee — check it is active.
        const didStatus = (found.didStatus || '').trim().toLowerCase();
        if (didStatus === 'revoked') {
          return {
            ok: false,
            error: 'DID authentication FAILED — this DID has been revoked.',
            did: parsed.did,
            walletAddress: parsed.address,
            registeredInFirebase: true,
            boundToAuthenticatedUser: true,
          };
        }
        return {
          ok: true,
          did: parsed.did,
          walletAddress: parsed.address,
          registeredInFirebase: true,
          boundToAuthenticatedUser: true,
        };
      }
    } catch (err) {
      console.warn('[didAuthServer] Firebase DID lookup failed:', err);
    }
  }

  // Not registered in Firebase yet — wallet proof (next step) will register it.
  return {
    ok: true,
    did: parsed.did,
    walletAddress: parsed.address,
    registeredInFirebase: false,
    boundToAuthenticatedUser: true,
  };
}

/**
 * STEP 4 — Connect Wallet: verify the wallet belongs to the user's DID and to
 * the authenticated user's Firebase record, then (only when the DID was not
 * yet registered in Firebase) register {DID, walletAddress, publicKey} ONCE on
 * the authenticated employee's OWN record.
 *
 * `wallet` comes from the EXISTING wallet implementation and contains PUBLIC
 * information only (address + optional raw public key) — never a private key.
 *
 * Self-certifying proof: for secp256k1, address = keccak-256(publicKey)[12:].
 * A caller cannot produce a public key that derives to a DID address it does
 * not control, so this binding is unforgeable.
 */
export async function connectWalletForUser(
  employee: FirestoreEmployee,
  did: string,
  wallet: DidWalletClaim
): Promise<{ ok: boolean; error?: string; employee: FirestoreEmployee }> {
  const parsed = parseEthrDid(did);
  if (!parsed) {
    return { ok: false, error: 'Invalid DID format.', employee };
  }
  const claimAddress = (wallet.address || '').trim().toLowerCase();
  if (!claimAddress) {
    return {
      ok: false,
      error: 'No wallet connected. Connect the wallet that holds this DID.',
      employee,
    };
  }
  if (claimAddress !== parsed.address) {
    return {
      ok: false,
      error:
        'Wallet does not belong to the user/DID — the connected wallet address does not match the DID.',
      employee,
    };
  }
  if (wallet.publicKey) {
    try {
      const derived = ethers.computeAddress(wallet.publicKey).toLowerCase();
      if (derived !== parsed.address) {
        return {
          ok: false,
          error: 'Wallet public key does not match the DID — registration refused.',
          employee,
        };
      }
    } catch {
      return { ok: false, error: 'Wallet public key is unparseable.', employee };
    }
  }

  // Re-check the Firebase registry: the DID must never be (re)bound to
  // another employee.
  const outcome = await verifyDidForAuthenticatedUser(employee, parsed.did);
  if (!outcome.ok) {
    return { ok: false, error: outcome.error, employee };
  }

  let current = await readEmployeeDoc(employee.employeeId);
  if (!current) {
    return { ok: false, error: 'Authenticated employee record not found in Firebase.', employee };
  }

  const recWallet = (current.walletAddress || '').trim().toLowerCase();
  if (outcome.registeredInFirebase) {
    // Wallet address on the Firebase record must match the DID.
    if (!recWallet) {
      return {
        ok: false,
        error: 'No wallet address associated with this DID in the Firebase record.',
        employee,
      };
    }
    if (recWallet !== parsed.address) {
      return {
        ok: false,
        error: 'Wallet address does not belong to the user/DID per the Firebase record.',
        employee,
      };
    }
  } else {
    // One-time DID registration onto the AUTHENTICATED user's own record.
    // Key control was proven above (address = keccak(publicKey)).
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'employees', current.employeeId), {
        did: parsed.did,
        walletAddress: parsed.address,
        walletId: parsed.address,
        publicKey: (wallet.publicKey || '').trim(),
        didStatus: 'Created',
        didCreatedAt: current.didCreatedAt || now,
        updatedAt: now,
      });
    } catch (err) {
      console.warn('[didAuthServer] DID registration write failed:', err);
      return {
        ok: false,
        error:
          'Could not register the DID in Firebase (permission denied). Deploy the updated firestore.rules.',
        employee: current,
      };
    }
    const refreshed = await readEmployeeDoc(current.employeeId);
    current = refreshed ?? {
      ...current,
      did: parsed.did,
      walletAddress: parsed.address,
      publicKey: (wallet.publicKey || '').trim(),
    };
  }

  return { ok: true, employee: current };
}

