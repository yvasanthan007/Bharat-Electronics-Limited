import { ethers } from 'ethers';

/**
 * Bharat Electronics Limited (BEL) — DID Authentication core.
 *
 * PURE cryptographic + policy layer for the employee DID challenge/response
 * login. This module contains NO Firebase, NO wallet and NO browser APIs so
 * that the exact same verification logic can be:
 *   • executed by the server-side verification service (didAuthServer.ts), and
 *   • unit-tested headlessly (scripts/did-auth-selftest.ts).
 *
 * SECURITY MODEL
 *   • The private key NEVER leaves the employee wallet. Only
 *       { DID, challenge, signature } are ever submitted for verification.
 *   • The verifier trusts ONLY data read from Firebase (challenge document +
 *       employee record: DID, public key, role, status). Client-supplied
 *       DID/employeeID/role values are treated as unverified claims.
 *   • Every check below must pass or authentication is rejected (fail-closed).
 */

/** Challenge lifetime — short-lived, single-use. */
export const DID_CHALLENGE_TTL_MS = 5 * 60 * 1000;

/** Shape of the Firestore `didChallenges/{challengeId}` document. */
export interface DidChallengeDoc {
  challenge: string;
  DID: string;
  employeeID: string;
  createdAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
  used: boolean;
  /** Extra server-side binding fields (defense in depth). */
  walletAddress?: string;
  nonce?: string;
  usedAt?: string;
}

/** Minimal employee fields the verifier relies on (from `employees/{id}`). */
export interface DidEmployeeDoc {
  employeeId: string;
  did?: string;
  publicKey?: string;
  role?: string;
  name?: string;
  employeeName?: string;
  email?: string;
  walletAddress?: string;
  status?: string;
  employmentStatus?: string;
}

export interface DidChallengeEvaluationInput {
  nowMs: number;
  challengeId: string;
  /** Unverified claims submitted by the client / wallet. */
  didClaim: string;
  signature: string;
  /** Server data read from Firebase. */
  challengeDoc: DidChallengeDoc | null;
  employeeDoc: DidEmployeeDoc | null;
}

export interface DidAuthStep {
  label: string;
  passed: boolean;
  detail: string;
}

export interface DidAuthSessionInfo {
  did: string;
  employeeId: string;
  name: string;
  role: string;
  walletAddress: string;
  email?: string;
}

export interface DidChallengeEvaluation {
  ok: boolean;
  error?: string;
  steps: DidAuthStep[];
  session?: DidAuthSessionInfo;
}

/* ------------------------------ crypto helpers ------------------------------ */

/** Recovers the signer address of an EIP-191 personal_sign signature. */
export function recoverSignerAddress(challenge: string, signature: string): string | null {
  try {
    return ethers.recoverAddress(ethers.hashMessage(challenge), signature).toLowerCase();
  } catch {
    return null; // malformed signature
  }
}

/**
 * Derives the on-chain address from a stored DID public key.
 * Accepts compressed / uncompressed secp256k1 keys (did:ethr compatible).
 */
export function addressFromPublicKey(publicKey: string): string | null {
  try {
    return ethers.computeAddress(publicKey).toLowerCase();
  } catch {
    return null; // unparseable public key
  }
}

/** True when the challenge expiry instant has passed. */
export function isChallengeExpired(expiresAtIso: string, nowMs: number): boolean {
  const t = Date.parse(expiresAtIso);
  if (Number.isNaN(t)) return true; // unparsable expiry ⇒ treat as expired
  return nowMs > t;
}

/* --------------------------- server-side evaluation -------------------------- */

/**
 * The FULL server-side verification pipeline for a DID login attempt.
 * Implements, in order:
 *   1.  Challenge exists in Firebase
 *   2.  Challenge has not been used (single-use / anti-replay)
 *   3.  Challenge has not expired
 *   4.  Submitted DID matches the DID the challenge was issued for
 *   5.  Employee record exists in Firebase
 *   6.  Challenge belongs to that employee (employeeID binding)
 *   7.  DID belongs to the authenticated employee (employee.did == DID)
 *   8.  DID public key exists in Firebase
 *   9.  Employee account is active
 *   10. Signature is cryptographically valid against THAT public key
 *   11. (defense in depth) signer == challenge-bound wallet address
 *
 * The returned session carries the role read from Firebase — never a
 * client-supplied role.
 */
export function evaluateDidChallenge(input: DidChallengeEvaluationInput): DidChallengeEvaluation {
  const steps: DidAuthStep[] = [];
  const { nowMs, challengeId, didClaim, signature, challengeDoc, employeeDoc } = input;

  const fail = (error: string): DidChallengeEvaluation => ({ ok: false, error, steps });

  // — 1. Challenge exists —
  if (!challengeDoc) {
    return fail(
      `Challenge '${challengeId}' not found in Firebase. Restart the sign-in to get a fresh challenge.`
    );
  }
  steps.push({
    label: 'Challenge found',
    passed: true,
    detail: `didChallenges/${challengeId}`,
  });

  // — 2. Single-use —
  if (challengeDoc.used === true) {
    return fail('Challenge has already been used (replay detected). Restart the sign-in.');
  }
  steps.push({
    label: 'Challenge single-use',
    passed: true,
    detail: 'used = false — challenge not consumed yet',
  });

  // — 3. Expiry —
  if (isChallengeExpired(challengeDoc.expiresAt, nowMs)) {
    return fail('Challenge expired. Restart the sign-in to get a fresh challenge.');
  }
  steps.push({
    label: 'Challenge unexpired',
    passed: true,
    detail: `valid until ${challengeDoc.expiresAt}`,
  });

  // — 4. DID claim matches the challenged DID —
  const challengedDid = (challengeDoc.DID || '').trim();
  if (!didClaim || didClaim.trim().toLowerCase() !== challengedDid.toLowerCase()) {
    return fail('Submitted DID does not match the DID this challenge was issued for.');
  }
  steps.push({
    label: 'DID match',
    passed: true,
    detail: challengedDid,
  });

  // — 5. Employee record exists —
  if (!employeeDoc) {
    return fail(
      `No employee record found in Firebase for '${challengeDoc.employeeID}'. Contact BEL IT Security.`
    );
  }

  // — 6. Challenge ↔ employee binding —
  const empId = (employeeDoc.employeeId || '').trim();
  if (!empId || empId.toLowerCase() !== (challengeDoc.employeeID || '').trim().toLowerCase()) {
    return fail('Challenge does not belong to the resolved employee record.');
  }
  steps.push({
    label: 'Employee binding',
    passed: true,
    detail: `${empId} · ${employeeDoc.name || employeeDoc.employeeName || employeeDoc.email || ''}`,
  });

  // — 7. DID belongs to the authenticated employee —
  const empDid = (employeeDoc.did || '').trim();
  if (!empDid || empDid.toLowerCase() !== challengedDid.toLowerCase()) {
    return fail('DID is not registered to this employee in the BEL identity registry.');
  }
  steps.push({
    label: 'DID ownership',
    passed: true,
    detail: 'DID belongs to the authenticated employee',
  });

  // — 8. Public key exists —
  const publicKey = (employeeDoc.publicKey || '').trim();
  if (!publicKey) {
    return fail('No DID public key on file for this employee. Contact BEL IT Security.');
  }
  const pubAddress = addressFromPublicKey(publicKey);
  if (!pubAddress) {
    return fail('Stored DID public key is unparseable. Contact BEL IT Security.');
  }

  // — 9. Account active —
  if (!isEmployeeActive(employeeDoc)) {
    return fail('Employee account is inactive. Access denied — contact BEL IT Security.');
  }
  steps.push({
    label: 'Account status',
    passed: true,
    detail: `${employeeDoc.status || 'Verified'}${employeeDoc.employmentStatus ? ` · ${employeeDoc.employmentStatus}` : ''}`,
  });

  // — 10. Cryptographic signature proof against the Firebase public key —
  const recovered = recoverSignerAddress(challengeDoc.challenge, signature);
  if (!recovered) {
    return fail('Signature malformed — verification failed.');
  }
  if (recovered !== pubAddress) {
    return fail(
      'Signature does not verify against the DID public key stored in Firebase.'
    );
  }
  steps.push({
    label: 'Signature verification',
    passed: true,
    detail: `Recovered signer matches DID public key (${pubAddress.substring(0, 10)}…)`,
  });

  // — 11. Defense in depth: signer == wallet bound to the challenge —
  const boundWallet = (challengeDoc.walletAddress || employeeDoc.walletAddress || '')
    .trim()
    .toLowerCase();
  if (boundWallet && recovered !== boundWallet) {
    return fail('Signature does not match the wallet bound to this challenge.');
  }

  // — Authenticated. Role comes from Firebase (never from the client). —
  const session: DidAuthSessionInfo = {
    did: challengedDid,
    employeeId: empId,
    name: employeeDoc.name || employeeDoc.employeeName || empId,
    role: (employeeDoc.role || 'Employee').trim(),
    walletAddress: employeeDoc.walletAddress || boundWallet || pubAddress,
    email: employeeDoc.email,
  };

  return { ok: true, steps, session };
}

/* ------------------------------ challenge build ----------------------------- */

/**
 * Cryptographically secure random nonce (32 bytes → 64 hex chars) using the
 * platform CSPRNG (Web Crypto in the browser, crypto in Node).
 */
export function generateDidNonce(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Builds the human-readable challenge text the employee's wallet signs.
 * The DID and nonce are embedded so a signature can never be replayed for a
 * different identity or a different challenge.
 */
export function buildChallengeText(params: {
  did: string;
  walletAddress: string;
  nonce: string;
  issuedAtMs: number;
  expiresAtMs: number;
}): string {
  return [
    'BEL Trust Platform',
    '',
    'Sign this one-time challenge to prove control of your DID.',
    '',
    `DID: ${params.did}`,
    `Address: ${params.walletAddress}`,
    `Nonce: ${params.nonce}`,
    `Issued At: ${new Date(params.issuedAtMs).toISOString()}`,
    `Expires At: ${new Date(params.expiresAtMs).toISOString()}`,
  ].join('\n');
}

const INACTIVE_STATUSES = new Set([
  'revoked',
  'suspended',
  'inactive',
  'terminated',
  'disabled',
  'blocked',
]);

/** Account-status gate: employees must be active/verified to authenticate. */
export function isEmployeeActive(employee: DidEmployeeDoc | null): boolean {
  if (!employee) return false;
  const status = (employee.status || '').trim().toLowerCase();
  if (status && INACTIVE_STATUSES.has(status)) return false;
  const employment = (employee.employmentStatus || '').trim().toLowerCase();
  if (employment && employment !== 'active') return false;
  return true;
}
