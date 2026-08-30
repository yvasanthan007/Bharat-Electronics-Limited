import { ethers } from 'ethers';
import { getAllDIDIdentities, registerExternalDIDIdentity } from './did';
import { getCredentialsByHolder, storeCredential } from './credentials';
import { recordBlockchainEvent } from '../lib/did/blockchainLayer';
import { createMockVC, type VerifiableCredential } from '../lib/did/vcEngine';
import { BEL_ISSUER_DID, type DIDIdentity } from '../data/mockDIDData';
import { getIdentities } from './identities';
import {
  getDemoWalletAddress,
  getDemoWalletPublicKey,
  associateWalletWithDID,
  getLinkedDID,
  hasBrowserWallet,
  getBrowserWalletAccounts,
  personalSign,
  signWithDemoWallet,
} from './wallet';
import {
  hasWalletKey,
  signChallengeWithWalletKey,
} from './secureKeyStorage';
import { getEmployeeFromFirestore, type FirestoreEmployee } from './firebaseEmployeeService';

/**
 * Employee DID login service (challenge / response).
 *
 * This module plays the role of the authentication "backend" in this
 * client-side prototype. It:
 *   • issues a cryptographically-random, expiring, single-use nonce,
 *   • verifies the challenge signature (proof of control of the wallet key),
 *   • checks the DID is registered + active and linked to the wallet,
 *   • checks the employee holds a valid Verifiable Credential,
 *   • issues an opaque authenticated session token.
 *
 * SECURITY:
 *   • Nonces are single-use and expire (prevents replay attacks).
 *   • The signature is verified against the registered wallet address.
 *   • No private key / seed phrase is ever requested, collected or stored.
 */

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const SESSION_KEY = 'bel_employee_session';

function firestoreEmployeeToDIDIdentity(emp: FirestoreEmployee): DIDIdentity {
  const status = emp.status === 'Verified' ? 'Verified'
    : emp.status === 'Revoked' ? 'Revoked'
    : 'Pending';
  return {
    id: emp.employeeId,
    name: emp.name || (emp.email ? emp.email.split('@')[0] : 'Personnel'),
    did: emp.did.length > 20
      ? `${emp.did.substring(0, 12)}...${emp.did.substring(emp.did.length - 4)}`
      : emp.did,
    fullDID: emp.did,
    walletAddress: emp.walletAddress,
    publicKey: emp.publicKey,
    role: emp.role,
    department: emp.department || '',
    status,
    createdOn: (emp.createdAt || '').split('T')[0] || new Date().toISOString().split('T')[0],
    lastActive: 'Just now',
    createdAt: emp.createdAt || new Date().toISOString(),
    verifiedAt: emp.createdAt || new Date().toISOString(),
  };
}

export interface EmployeeSession {
  token: string;
  did: string;
  name: string;
  role: string;
  walletAddress: string;
  employeeId: string;
  createdAt: string;
  expiresAt: string;
}

export interface LoginResult {
  success: boolean;
  session?: EmployeeSession;
  error?: string;
  steps: { label: string; passed: boolean; detail: string }[];
}

interface ChallengeRecord {
  nonce: string;
  did: string; // full DID the challenge was issued for
  walletAddress: string; // lowercased
  challenge: string;
  issuedAt: number;
  expiresAt: number;
  used: boolean;
}

// In-memory "server-side" nonce store (not user-editable).
const challenges = new Map<string, ChallengeRecord>();

/* ------------------------------- crypto helpers ------------------------------ */

function randomHex(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

function randomToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return randomHex(32);
}

/* ------------------------------ challenge request ---------------------------- */

/** Resolves a DID (full, short-display, bare 0x address, name or email) to its identity. */
async function resolveIdentity(didOrAddress: string): Promise<DIDIdentity | undefined> {
  const input = didOrAddress.trim();
  const all = getAllDIDIdentities();

  if (/^0x[0-9a-f]{40}$/i.test(input)) {
    const direct = all.find((d) => d.walletAddress.toLowerCase() === input.toLowerCase());
    if (direct) return direct;
  }
  const needle = input.toLowerCase();
  const directMatch = all.find(
    (d) =>
      d.fullDID.toLowerCase() === needle ||
      d.did.toLowerCase() === needle ||
      d.name.toLowerCase() === needle ||
      (d as any).email?.toLowerCase() === needle ||
      d.fullDID.toLowerCase().includes(needle) ||
      d.did.toLowerCase().includes(needle)
  );
  if (directMatch) return directMatch;

  // Also check identities created via CreateIdentityModal
  const roster = getIdentities();
  const rosterMatch = roster.find(
    (i) =>
      i.did.toLowerCase() === needle ||
      i.name.toLowerCase() === needle ||
      i.email.toLowerCase() === needle ||
      i.employeeId.toLowerCase() === needle ||
      i.did.toLowerCase().includes(needle)
  );

  if (rosterMatch) {
    const fullDID = rosterMatch.did.startsWith('did:') ? rosterMatch.did : `did:bel:sov:${rosterMatch.did}`;
    return {
      id: rosterMatch.id,
      name: rosterMatch.name,
      did: rosterMatch.did,
      fullDID,
      walletAddress: rosterMatch.walletAddress,
      publicKey: rosterMatch.publicKey,
      role: rosterMatch.role,
      department: rosterMatch.department,
      status: rosterMatch.status === 'Verified' ? 'Verified' : 'Pending',
      createdOn: rosterMatch.createdOn,
      createdAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      lastActive: rosterMatch.lastActive,
    };
  }

  // Fallback: check Firebase Firestore (authoritative source for DID + public key)
  try {
    const emp = await getEmployeeFromFirestore(input);
    if (emp) {
      return firestoreEmployeeToDIDIdentity(emp);
    }
  } catch {
    // Firestore unavailable — fall back to local data only
  }

  return undefined;
}

/**
 * Backend — step 2 of the DID login flow ("Generate one-time challenge").
 * Resolves the DID entered by the employee and issues a fresh, single-use,
 * expiring challenge bound to that DID's registered wallet.
 * Throws when the DID is unknown or not verified/active.
 */
export async function requestLoginChallengeByDID(
  didOrAddress: string
): Promise<{ challenge: string; nonce: string; did: string }> {
  const identity = await resolveIdentity(didOrAddress);

  if (!identity) {
    throw new Error('Unknown DID — no such employee in the registry.');
  }
  if (identity.status !== 'Verified') {
    throw new Error('This DID is not verified/active. Access denied.');
  }

  const nonce = randomHex(32);
  const issuedAt = Date.now();
  const expiresAt = issuedAt + CHALLENGE_TTL_MS;
  const challenge = [
    'BEL Trust Platform',
    '',
    'Sign this one-time challenge to prove control of your DID.',
    '',
    `DID: ${identity.fullDID}`,
    `Address: ${identity.walletAddress}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date(issuedAt).toISOString()}`,
    `Expires At: ${new Date(expiresAt).toISOString()}`,
  ].join('\n');

  challenges.set(nonce, {
    nonce,
    did: identity.fullDID,
    walletAddress: identity.walletAddress.toLowerCase(),
    challenge,
    issuedAt,
    expiresAt,
    used: false,
  });

  return { challenge, nonce, did: identity.fullDID };
}

/* --------------------------- signing (key storage) --------------------------- */

/**
 * Employee Wallet / Secure Key Storage — step 3 of the flow.
 * Locates key material capable of signing FOR the given DID and produces an
 * EIP-191 signature over the backend challenge:
 *   1. Browser secure key storage (IndexedDB) holding the DID's private key → ethers.Wallet signMessage
 *   2. Real browser wallet (MetaMask) holding the DID's account → personal_sign.
 *   3. Deterministic demo secure-key-storage (prototype fallback) → local ECDSA.
 * The private key never leaves the wallet / memory.
 */
export async function signChallengeForDID(
  didOrAddress: string,
  challenge: string
): Promise<string> {
  const identity = await resolveIdentity(didOrAddress);
  if (!identity) {
    throw new Error('Unknown DID — no key material to sign with.');
  }
  const target = identity.walletAddress.toLowerCase();

  // 1. Try the browser's secure key storage (IndexedDB) FIRST — this is where
  //    the employee's private key is persisted when Admin creates their DID.
  try {
    if (await hasWalletKey(identity.fullDID)) {
      return await signChallengeWithWalletKey(identity.fullDID, challenge);
    }
  } catch {
    // Fall through to external wallet / demo fallback
  }

  // 2. Real browser wallet that currently holds this DID's account
  if (hasBrowserWallet()) {
    try {
      const accounts = await getBrowserWalletAccounts();
      const match = accounts.find((a) => a.toLowerCase() === target);
      if (match) {
        return await personalSign(match, challenge);
      }
    } catch {
      // Fallback
    }
  }

  // 3. Simulated Secure Key Storage for the pre-provisioned demo employee
  if (target === getDemoWalletAddress().toLowerCase()) {
    return signWithDemoWallet(challenge);
  }

  // 4. For any registered identity created with a DID keypair, derive deterministic signature
  if (identity.walletAddress) {
    try {
      const seed = ethers.id(`bel-key-storage:${identity.fullDID.toLowerCase()}`);
      const derivedWallet = new ethers.Wallet(seed);
      if (derivedWallet.address.toLowerCase() === target) {
        return await derivedWallet.signMessage(challenge);
      }
    } catch {
      // Fall through to the fail-closed guard below
    }
  }

  // SECURITY (fail-closed): never sign with an unrelated key. A signature from
  // any other private key can never satisfy server-side verification against
  // the DID's registered public key, so refuse loudly instead.
  throw new Error(
    `No secure key storage available for ${identity.did}. This browser's wallet does not hold the private key for this DID — sign in on the device where the DID was issued, or connect the wallet holding ${target.substring(0, 10)}…`
  );
}

/** Full DID of the pre-provisioned demo employee (quick-fill helper for the UI). */
export function getDemoEmployeeDID(): string {
  return `did:ethr:${getDemoWalletAddress()}`;
}

/* ------------------------- pre-registered demo employee ---------------------- */

// The deterministic demo wallet (see services/wallet.ts) is pre-provisioned as
// a Verified employee holding a signed VC — mirroring what BEL's HR/IT backend
// would do for a real employee. Public demo data only; no secrets involved.
const DEMO_EMPLOYEE = {
  employeeId: 'BEL100',
  name: 'Ananya Rao',
  role: 'Engineer',
  department: 'R&D',
} as const;

function vcNotExpired(vc: VerifiableCredential): boolean {
  return new Date(vc.expirationDate).getTime() > Date.now();
}

/**
 * Provisions the deterministic demo employee end-to-end (idempotent):
 *   1. registers a Verified DID bound to the demo wallet address,
 *   2. binds wallet ↔ DID,
 *   3. issues and stores a signed Verifiable Credential.
 */
export async function ensureDemoEmployeeRegistered(): Promise<void> {
  const walletAddress = getDemoWalletAddress();
  const fullDID = `did:ethr:${walletAddress}`;

  const alreadyRegistered = getAllDIDIdentities().some(
    (d) => d.walletAddress.toLowerCase() === walletAddress.toLowerCase()
  );

  if (!alreadyRegistered) {
    await registerExternalDIDIdentity({
      ...DEMO_EMPLOYEE,
      walletAddress,
      publicKey: getDemoWalletPublicKey(),
    });
  }

  // Wallet ↔ DID binding
  if (getLinkedDID(walletAddress) !== fullDID) {
    associateWalletWithDID(walletAddress, fullDID);
  }

  // Verifiable Credential (issued once, then persisted)
  if (!getCredentialsByHolder(fullDID).some(vcNotExpired)) {
    const now = new Date();
    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1);

    storeCredential(
      createMockVC({
        id: 'vc:bel:employee-demo',
        holderDID: fullDID,
        issuerDID: BEL_ISSUER_DID,
        credentialType: 'BELEmployeeCredential',
        subject: {
          role: DEMO_EMPLOYEE.role,
          department: DEMO_EMPLOYEE.department,
          employeeId: DEMO_EMPLOYEE.employeeId,
          name: DEMO_EMPLOYEE.name,
          permissions: ['View Dashboard', 'View Audit Trail'],
        },
        issuanceDate: now.toISOString(),
        expirationDate: expiry.toISOString(),
      })
    );
  }
}

/* ---------------------------- challenge completion --------------------------- */

/**
 * Backend: verifies the wallet's signature over the issued challenge and, on
 * success, mints an opaque session token. Never throws — returns LoginResult.
 *
 * Verification pipeline:
 *   1. Challenge exists, is unused and unexpired            (anti-replay)
 *   2. Signature recovers to the challenged wallet address  (proof of key control)
 *   3. DID registered, Verified and bound to that wallet    (identity match)
 *   4. Employee holds an unexpired Verifiable Credential    (authorisation)
 */
export async function completeLoginChallenge(
  nonce: string,
  signature: string
): Promise<LoginResult> {
  const steps: LoginResult['steps'] = [];
  const fail = (error: string): LoginResult => ({ success: false, error, steps });

  // — Step 1: challenge state —
  const record = challenges.get(nonce);
  if (!record) {
    return fail('Login challenge not found or already consumed. Please restart the sign-in.');
  }
  if (record.used) {
    challenges.delete(nonce);
    return fail('Challenge has already been used. Please restart the sign-in.');
  }
  if (Date.now() > record.expiresAt) {
    challenges.delete(nonce);
    return fail('Login challenge expired. Please restart the sign-in.');
  }
  steps.push({ label: 'Challenge validity', passed: true, detail: 'Single-use nonce accepted' });

  // — Step 2: signature proof ("Verify using DID public key") —
  // Recover the signer address from the signature over the challenge digest,
  // then check it against the PUBLIC KEY published in the employee's DID
  // document: a did:ethr address is keccak-256(the public key), so the
  // signature must recover to exactly the address derived from that key.
  let recovered: string;
  try {
    recovered = ethers.recoverAddress(
      ethers.hashMessage(record.challenge),
      signature
    ).toLowerCase();
  } catch {
    return fail('Signature malformed — verification failed.');
  }

  const regIdentity = await resolveIdentity(record.did);
  const storedPub = regIdentity?.publicKey;
  let docKeyAddress: string | null = null;
  if (storedPub) {
    try {
      docKeyAddress = ethers.computeAddress(storedPub).toLowerCase();
    } catch {
      /* registry stores no parseable public key for this DID */
    }
  }

  challenges.delete(nonce); // single-use — replay impossible past this point
  record.used = true;

  // Signature vs DID-document public key
  if (docKeyAddress && recovered !== docKeyAddress) {
    await denyAndAudit(record.walletAddress, 'KEY_MISMATCH');
    return fail('Signature does not match the public key in the DID document.');
  }
  // Signature vs the challenged wallet binding
  if (recovered !== record.walletAddress) {
    await denyAndAudit(record.walletAddress, 'SIGNATURE_MISMATCH');
    return fail('Signature does not match the challenged wallet address.');
  }

  steps.push({
    label: 'Public-key proof',
    passed: true,
    detail:
      (docKeyAddress ? 'Recovered key == DID-document key · ' : 'Recovered ') +
      `${'0x' + recovered.substring(2).slice(0, 8)}…`,
  });

  // — Step 3: DID registry + wallet binding —
  const identity =
    regIdentity ??
    getAllDIDIdentities().find(
      (d) => d.walletAddress.toLowerCase() === record.walletAddress
    );
  if (!identity || identity.status !== 'Verified') {
    await denyAndAudit(record.walletAddress, 'DID_INACTIVE');
    return fail('DID not registered or not verified for this wallet.');
  }
  steps.push({
    label: 'DID registry',
    passed: true,
    detail: `${identity.name} · ${identity.fullDID.substring(0, 26)}…`,
  });

  const linked = getLinkedDID(identity.walletAddress);
  if (linked && linked !== identity.fullDID) {
    await denyAndAudit(record.walletAddress, 'WALLET_BINDING_MISMATCH');
    return fail('Wallet ↔ DID binding mismatch detected.');
  }
  steps.push({ label: 'Wallet binding', passed: true, detail: 'Wallet is bound to this DID' });

  // — Step 4: credential check —
  const validVC = getCredentialsByHolder(identity.fullDID).find(vcNotExpired);
  if (!validVC) {
    await denyAndAudit(record.walletAddress, 'NO_VALID_VC');
    return fail('No valid Verifiable Credential on file. Contact BEL IT Security.');
  }
  steps.push({
    label: 'Credential check',
    passed: true,
    detail: `${validVC.type[1]} · expires ${validVC.expirationDate.split('T')[0]}`,
  });

  // — Success: mint opaque session token (8h TTL) —
  const now = Date.now();
  const session: EmployeeSession = {
    token: `bel_s_${randomToken()}`,
    did: identity.fullDID,
    name: identity.name,
    role: identity.role,
    walletAddress: ethers.getAddress(identity.walletAddress),
    employeeId: validVC.credentialSubject.employeeId || DEMO_EMPLOYEE.employeeId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
  };
  saveSession(session);

  try {
    await recordBlockchainEvent({
      eventType: 'EMPLOYEE_LOGIN',
      actorDID: identity.fullDID,
      walletAddress: session.walletAddress,
      details: { result: 'SUCCESS', credentialType: validVC.type[1], method: 'challenge-response' },
      verificationResult: 'SUCCESS',
    });
  } catch {
    /* audit failures must never block login */
  }

  steps.push({ label: 'Session issued', passed: true, detail: 'Opaque token stored · 8h validity' });

  return { success: true, session, steps };
}

/** Records a failed authentication attempt on the mock ledger (best effort). */
async function denyAndAudit(walletAddress: string, reason: string): Promise<void> {
  try {
    await recordBlockchainEvent({
      eventType: 'ACCESS_DENIED',
      actorDID: getLinkedDID(walletAddress) ?? `did:ethr:${walletAddress}`,
      walletAddress,
      details: { reason, resource: 'EMPLOYEE_LOGIN' },
      verificationResult: 'FAILURE',
    });
  } catch {
    /* best effort */
  }
}

/* ------------------------------ session handling ----------------------------- */

function saveSession(session: EmployeeSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable */
  }
}

/** Returns the current employee session, or null when absent/expired. */
export function getEmployeeSession(): EmployeeSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as EmployeeSession;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/** Ends the employee session (logout). */
export function clearEmployeeSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable */
  }
}

/**
 * Persists an authenticated employee session (opaque 8h token).
 * Used by the DID challenge/response login once server-side verification
 * has succeeded. The session carries no secrets and no private keys.
 */
export function persistEmployeeSession(session: EmployeeSession): void {
  saveSession(session);
}

/** True when a valid employee session exists. */
export function isEmployeeAuthenticated(): boolean {
  return getEmployeeSession() !== null;
}
