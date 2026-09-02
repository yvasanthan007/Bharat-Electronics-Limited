import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, type Transaction } from 'firebase-admin/firestore';
import { randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import {
  CHALLENGE_TTL_MS,
  buildChallengeText,
  evaluateDidOwnership,
  evaluateSignatureProof,
  isValidDidFormat,
  toChecksumAddress,
  type ChallengeDoc,
  type DidSession,
  type EmployeeDoc,
  type VerifyStep,
} from './didCore';

/**
 * BEL Trust Platform — DID authentication Cloud Functions.
 *
 *   verifyDID        → is the submitted DID registered to the AUTHENTICATED
 *                      Firebase user? (Auth context ⇒ UID, never client claims)
 *   createChallenge  → server-side CSPRNG one-time challenge (60 s), bound to
 *                      { uid, DID, walletAddress }, single-use. The company
 *                      password ("BEL-2026") is validated HERE, server-side —
 *                      it is NEVER the cryptographic challenge itself.
 *   verifySignature  → the wallet signs the server challenge (private key
 *                      never leaves the wallet); the function re-reads the
 *                      challenge + employee record from Firestore, verifies
 *                      the EIP-191 signature against the registered public
 *                      key / wallet address and atomically consumes the
 *                      challenge inside a transaction (replay-proof).
 *
 * The Admin SDK runs ONLY here — never in frontend code. Private keys are
 * never accepted, stored, or logged by any function.
 */

initializeApp();
const db = getFirestore();

const CHALLENGES = 'didChallenges';
const FUNCTION_OPTS = { region: 'us-central1', cors: true, enforceAppCheck: false } as const;

/* ------------------------------- helpers ---------------------------------- */

/** Constant-time string comparison (length-safe via sha256 digest). */
function safeEqual(a: string, b: string): boolean {
  const da = createHash('sha256').update(a, 'utf8').digest();
  const dbb = createHash('sha256').update(b, 'utf8').digest();
  return timingSafeEqual(da, dbb);
}

/** Company password — validated ONLY here, server-side. */
function companyPasswordValid(supplied: unknown): boolean {
  const expected = (process.env.BEL_COMPANY_PASSWORD || 'BEL-2026').trim();
  return safeEqual(String(supplied ?? ''), expected);
}

/** Require a verified Firebase Auth context (never trust a client-sent UID). */
function requireAuth(req: CallableRequest): { uid: string; email: string } {
  const auth = req.auth;
  if (!auth) {
    throw new HttpsError(
      'unauthenticated',
      'Sign in with your BEL credentials before DID verification.'
    );
  }
  const email = String(auth.token?.email || '').toLowerCase().trim();
  return { uid: auth.uid, email };
}

/** employees/{employeeId} by document id, then by the employeeId field. */
async function findEmployeeDoc(employeeId: string): Promise<EmployeeDoc | null> {
  const id = (employeeId || '').trim();
  if (!id) return null;
  try {
    const snap = await db.collection('employees').doc(id).get();
    if (snap.exists) return snap.data() as EmployeeDoc;
  } catch {
    /* fall through to the field query */
  }
  const q = await db.collection('employees').where('employeeId', '==', id).limit(1).get();
  return q.empty ? null : (q.docs[0].data() as EmployeeDoc);
}

/**
 * Resolves the employee record bound to the VERIFIED Firebase Auth context:
 *   1. employees where email == Auth token email (the existing project links
 *      Firebase Auth accounts to employee records by email),
 *   2. users/{uid} → employeeId → employees/{id} (email cross-checked).
 */
async function resolveEmployeeForAuth(uid: string, email: string): Promise<EmployeeDoc | null> {
  if (email) {
    try {
      const snap = await db.collection('employees').where('email', '==', email).limit(5).get();
      if (!snap.empty) return snap.docs[0].data() as EmployeeDoc;
      const official = await db
        .collection('employees')
        .where('officialEmail', '==', email)
        .limit(5)
        .get();
      if (!official.empty) return official.docs[0].data() as EmployeeDoc;
    } catch {
      /* fall through to the users/{uid} path */
    }
  }
  try {
    const userSnap = await db.collection('users').doc(uid).get();
    const employeeId = String(userSnap.get('employeeId') || '').trim();
    if (employeeId) {
      const emp = await findEmployeeDoc(employeeId);
      if (emp) {
        const empEmail = String(emp.email || '').toLowerCase().trim();
        if (!empEmail || !email || empEmail === email) return emp;
      }
    }
  } catch {
    /* no users/{uid} profile — acceptable */
  }
  return null;
}

/** Fire-and-forget audit trail entry (append-only `auditLogs` collection). */
function audit(eventType: string, actorDID: string, uid: string, details: Record<string, string>): void {
  db.collection('auditLogs')
    .add({
      eventType,
      actorDID,
      uid,
      details,
      verificationResult: 'SUCCESS',
      timestamp: new Date().toISOString(),
    })
    .catch((err: unknown) => console.warn('audit write skipped:', err));
}

function toSteps(steps: VerifyStep[]): Array<{ label: string; passed: boolean; detail: string }> {
  return steps.map((s) => ({ label: s.label, passed: s.passed, detail: s.detail }));
}


/* ------------------------------ 1. verifyDID ------------------------------- */

/**
 * Callable: verifyDID({ did })
 * Verifies the submitted DID is registered to the AUTHENTICATED Firebase user
 * (Auth-context UID/email ⇒ employee record ⇒ employee.did == did).
 * Returns the server-verified DID/wallet binding for the next steps.
 */
export const verifyDID = onCall(FUNCTION_OPTS, async (req) => {
  const { uid, email } = requireAuth(req);

  const didRaw = String(req.data?.did ?? '').trim();
  if (!didRaw) throw new HttpsError('invalid-argument', 'Enter your DID to continue.');
  if (!isValidDidFormat(didRaw)) {
    throw new HttpsError(
      'invalid-argument',
      'Invalid DID format. Expected did:ethr:0x… (40-digit Ethereum address).'
    );
  }

  const employee = await resolveEmployeeForAuth(uid, email);
  const ownership = evaluateDidOwnership({ did: didRaw, employee });
  if (!ownership.ok) {
    throw new HttpsError('permission-denied', ownership.error || 'DID verification failed.');
  }

  return {
    ok: true,
    verifiedBy: 'cloud-function',
    did: String(employee?.did || didRaw).trim(),
    walletAddress: ownership.walletAddress || '',
    employeeId: String(employee?.employeeId || '').trim(),
    name: String(employee?.name || employee?.employeeName || '').trim(),
    role: String(employee?.role || 'Employee').trim(),
    registeredInFirebase: true,
    boundToAuthenticatedUser: true,
  };
});

/* ---------------------------- 2. createChallenge ---------------------------- */

/**
 * Callable: createChallenge({ did, walletAddress, companyPassword })
 * Issues a FRESH, single-use, 60-second challenge generated with the server's
 * CSPRNG (never "BEL-2026" or any predictable value), bound to the verified
 * { uid, DID, walletAddress }. The company password is validated SERVER-SIDE
 * here and never returned to the client.
 */
export const createChallenge = onCall(FUNCTION_OPTS, async (req) => {
  const { uid, email } = requireAuth(req);

  const didRaw = String(req.data?.did ?? '').trim();
  if (!isValidDidFormat(didRaw)) {
    throw new HttpsError(
      'invalid-argument',
      'Invalid DID format. Expected did:ethr:0x… (40-digit Ethereum address).'
    );
  }
  const employee = await resolveEmployeeForAuth(uid, email);
  const ownership = evaluateDidOwnership({ did: didRaw, employee });
  if (!ownership.ok) {
    throw new HttpsError('permission-denied', ownership.error || 'DID verification failed.');
  }

  // Optional separate company-password factor — NEVER the crypto challenge.
  // Validated only when a client supplies one; the server-side secret stays
  // out of the frontend entirely. The cryptographic challenge below is always
  // a fresh CSPRNG nonce.
  const suppliedCompanyPassword = req.data?.companyPassword;
  if (
    suppliedCompanyPassword != null &&
    String(suppliedCompanyPassword).trim() !== ''
  ) {
    if (!companyPasswordValid(suppliedCompanyPassword)) {
      throw new HttpsError('permission-denied', 'Invalid company challenge password.');
    }
  }

  // The wallet address must match the one registered for this DID/employee.
  const registeredWallet = String(
    employee?.walletAddress || employee?.walletId || ownership.walletAddress || ''
  )
    .trim()
    .toLowerCase();
  const claimedWallet = String(req.data?.walletAddress ?? '').trim().toLowerCase();
  if (registeredWallet && claimedWallet && claimedWallet !== registeredWallet) {
    throw new HttpsError(
      'permission-denied',
      'Connected wallet does not match the wallet registered to this DID. Access denied.'
    );
  }
  const walletAddress = toChecksumAddress(registeredWallet || claimedWallet);
  if (!walletAddress) {
    throw new HttpsError(
      'failed-precondition',
      'No valid wallet address is registered for this employee. Contact BEL IT Security.'
    );
  }

  // Server-side CSPRNG nonce — fresh for every authentication attempt.
  const nonce = randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAtMs = now + CHALLENGE_TTL_MS;
  const did = String(employee?.did || didRaw).trim();
  const employeeID = String(employee?.employeeId || '').trim();

  const challenge = buildChallengeText({
    did,
    walletAddress: walletAddress.toLowerCase(),
    nonce,
    issuedAtMs: now,
    expiresAtMs,
  });

  const challengeDoc: ChallengeDoc = {
    challenge,
    DID: did,
    employeeID,
    uid,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(expiresAtMs).toISOString(),
    used: false,
    walletAddress: walletAddress.toLowerCase(),
    nonce,
  };

  const ref = db.collection(CHALLENGES).doc();
  await ref.set(challengeDoc);

  return {
    ok: true,
    verifiedBy: 'cloud-function',
    challengeId: ref.id,
    challenge,
    did,
    employeeID,
    walletAddress: walletAddress.toLowerCase(),
    expiresAt: challengeDoc.expiresAt,
    ttlSeconds: Math.round(CHALLENGE_TTL_MS / 1000),
  };
});

/* ---------------------------- 3. verifySignature ---------------------------- */

type TxOutcome =
  | { kind: 'ok'; session: DidSession; steps: VerifyStep[] }
  | { kind: 'fail'; error: string; steps: VerifyStep[] };

/**
 * Callable: verifySignature({ challengeId, did, walletAddress, signature })
 *
 * The ONLY values accepted from the client are the four fields above. The
 * authenticated Firebase UID comes from the Auth context, the challenge and
 * employee records are re-read from Firestore by this function, the EIP-191
 * signature is recovered HERE, and the challenge is atomically consumed in a
 * transaction so it can never be used twice (replay-proof, race-safe).
 */
export const verifySignature = onCall(FUNCTION_OPTS, async (req) => {
  const { uid } = requireAuth(req);

  const challengeId = String(req.data?.challengeId ?? '').trim();
  const didClaim = String(req.data?.did ?? '').trim();
  const walletAddressClaim = String(req.data?.walletAddress ?? '').trim();
  const signature = String(req.data?.signature ?? '').trim();

  if (!challengeId || !didClaim || !signature) {
    throw new HttpsError(
      'invalid-argument',
      'Missing challenge ID, DID or signature.'
    );
  }

  const challengeRef = db.collection(CHALLENGES).doc(challengeId);

  const outcome: TxOutcome = await db.runTransaction(async (tx: Transaction): Promise<TxOutcome> => {
    const challengeSnap = await tx.get(challengeRef);
    const challengeDoc: ChallengeDoc | null = challengeSnap.exists
      ? (challengeSnap.data() as ChallengeDoc)
      : null;

    // Resolve the employee record FROM THE CHALLENGE (server-side binding —
    // never from a client-supplied identifier).
    let employeeDoc: EmployeeDoc | null = null;
    const claimedEmployeeID = String(challengeDoc?.employeeID || '').trim();
    if (claimedEmployeeID) {
      const empSnap = await tx.get(db.collection('employees').doc(claimedEmployeeID));
      employeeDoc = empSnap.exists ? (empSnap.data() as EmployeeDoc) : null;
      if (!employeeDoc) {
        const q = await tx
          .get(db.collection('employees').where('employeeId', '==', claimedEmployeeID).limit(1));
        employeeDoc = q.empty ? null : (q.docs[0].data() as EmployeeDoc);
      }
    }

    // Full checklist (a–h): UID binding, DID/wallet match, expiry, single-use,
    // account status, public key, EIP-191 signature recovery + ownership proof.
    const evaluation = evaluateSignatureProof({
      nowMs: Date.now(),
      authUid: uid,
      challengeIdClaim: challengeId,
      didClaim,
      walletAddressClaim,
      signature,
      challengeDoc,
      employeeDoc,
    });

    if (!evaluation.ok || !evaluation.session) {
      // Abort WITHOUT consuming — a failed attempt never burns the owner's
      // challenge; replay/expiry/UID-mismatch attempts are rejected here.
      return { kind: 'fail', error: evaluation.error || 'DID verification failed.', steps: evaluation.steps };
    }

    // Atomic single-use consume — a concurrent duplicate sees used=true and
    // is rejected (race-safe by Firestore transaction semantics).
    tx.update(challengeRef, { used: true, usedAt: new Date().toISOString() });

    return { kind: 'ok', session: evaluation.session, steps: evaluation.steps };
  });

  if (outcome.kind === 'fail') {
    throw new HttpsError('permission-denied', outcome.error);
  }

  const session = outcome.session;
  audit('DID_AUTH_SUCCESS', session.did, uid, {
    employeeId: session.employeeId,
    role: session.role,
    verifiedBy: 'cloud-function',
  });

  return {
    ok: true,
    verifiedBy: 'cloud-function',
    steps: toSteps(outcome.steps),
    session,
  };
});

