/**
 * BEL Trust Platform — end-to-end validation of a PROVISIONED employee DID.
 *
 * Proves against the REAL Firebase project that a DID issued by
 * scripts/provision-did.mjs completes the app's actual signature-verification
 * login flow:
 *   1. employee record has did/publicKey/walletAddress, status active,
 *   2. the generated private key signs a fresh single-use challenge,
 *   3. the app's own evaluateDidChallenge (src/lib/did/didAuthCrypto.ts)
 *      ACCEPTS the signature and returns the session WITH the Firestore role,
 *   4. the RBAC route is derived from that role,
 *   5. cleanup removes the test challenge.
 *
 * Run:  backend\node_modules\.bin\tsx.cmd scripts\did-verify-provisioned.ts BEL1015
 */
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  runTransaction,
} from 'firebase/firestore';
import { ethers } from 'ethers';
import {
  buildChallengeText,
  generateDidNonce,
  evaluateDidChallenge,
  type DidChallengeDoc,
  type DidEmployeeDoc,
} from '../src/lib/did/didAuthCrypto';

/* ------------------------- config from .env.local ------------------------- */
const envRaw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const env: Record<string, string> = {};
for (const line of envRaw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
if (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_PROJECT_ID) {
  console.error('Missing VITE_FIREBASE_* values in .env.local');
  process.exit(1);
}

const EMPLOYEE_ID = process.argv[2] || 'BEL1015';
const keyArtifact = JSON.parse(
  readFileSync(new URL(`./.did-keys/${EMPLOYEE_ID}.json`, import.meta.url), 'utf8')
) as {
  did: string;
  walletAddress: string;
  publicKey: string;
  privateKey: string;
};

const app = initializeApp(
  {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  },
  'did-provisioned-test'
);
const db = getFirestore(app);

let pass = 0;
let failCount = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    pass++;
    console.log(`  ✔ ${name}${detail ? ` — ${detail}` : ''}`);
  } else {
    failCount++;
    console.error(`  ✘ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/* --------------------------- 1. employee record --------------------------- */
console.log(`\n[1] Employee record in Firebase (employees/${EMPLOYEE_ID})`);
const empSnap = await getDoc(doc(db, 'employees', EMPLOYEE_ID));
check('employee document exists', empSnap.exists());
const emp = empSnap.data() as (DidEmployeeDoc & { employmentStatus?: string }) | undefined;
check('has DID matching artifact', emp?.did === keyArtifact.did, emp?.did);
check('has publicKey matching artifact', emp?.publicKey === keyArtifact.publicKey);
check('walletAddress matches artifact', (emp?.walletAddress || '').toLowerCase() === keyArtifact.walletAddress.toLowerCase());
check('didStatus is Created', emp?.didStatus === 'Created');
check(
  'account active',
  (emp?.status || '').toLowerCase() !== 'revoked' &&
    (emp?.employmentStatus || 'active').toLowerCase() === 'active',
  `${emp?.status} · ${emp?.employmentStatus}`
);
const pubAddr = ethers.computeAddress(emp?.publicKey || '');
check('publicKey derives to walletAddress', pubAddr.toLowerCase() === (emp?.walletAddress || '').toLowerCase());

/* ---------------- 2. challenge + signature via app verifier ---------------- */
console.log('\n[2] Sign challenge with the provisioned key → app verifier accepts');
const did = (emp?.did || '').trim();
const walletAddress = (emp?.walletAddress || '').toLowerCase();
const now = Date.now();
const nonce = generateDidNonce();
const challengeText = buildChallengeText({
  did,
  walletAddress,
  nonce,
  issuedAtMs: now,
  expiresAtMs: now + 60 * 1000,
});
const challengeDoc: DidChallengeDoc = {
  challenge: challengeText,
  DID: did,
  employeeID: EMPLOYEE_ID,
  createdAt: new Date(now).toISOString(),
  expiresAt: new Date(now + 60 * 1000).toISOString(),
  used: false,
  walletAddress,
  nonce,
};
const testChallengeId = `provisioned-test-${now}`;
await setDoc(doc(db, 'didChallenges', testChallengeId), challengeDoc);

const employeeWallet = new ethers.Wallet(keyArtifact.privateKey);
check('artifact key derives to registered address', employeeWallet.address.toLowerCase() === walletAddress);
const signature = await employeeWallet.signMessage(challengeText);

async function verifyLive(sig: string, didClaim: string) {
  try {
    return await runTransaction(db, async (tx) => {
      const ref = doc(db, 'didChallenges', testChallengeId);
      const snap = await tx.get(ref);
      const cDoc = snap.exists() ? (snap.data() as DidChallengeDoc) : null;
      const evaluation = evaluateDidChallenge({
        nowMs: Date.now(),
        challengeId: testChallengeId,
        didClaim,
        signature: sig,
        challengeDoc: cDoc,
        employeeDoc: emp ?? null,
      });
      if (!evaluation.ok || !evaluation.session) {
        throw new Error(evaluation.error || 'DID verification failed.');
      }
      tx.update(ref, { used: true, usedAt: new Date().toISOString() });
      return evaluation.session;
    });
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) } as const;
  }
}

const session = await verifyLive(signature, did);
// NOTE: on success runTransaction resolves to the DidAuthSessionInfo (no `ok`
// field); on failure it rejects with an error → { ok: false, error }.
const s = session as
  | { ok: false; error?: string }
  | { ok?: undefined; role: string; walletAddress: string; employeeId: string };
const accepted = s.ok !== false && !!(s as { role?: string }).role;
if (!accepted) {
  console.log(`  [verifier error] ${(s as { error?: string }).error || 'unknown'}`);
}
check('app verifier ACCEPTED the provisioned key', accepted);

/* --------------------------------- cleanup -------------------------------- */
console.log('\n[cleanup] Removing test challenge document');
await deleteDoc(doc(db, 'didChallenges', testChallengeId));
check('test challenge removed', !(await getDoc(doc(db, 'didChallenges', testChallengeId))).exists());

/* --------------------------------- report --------------------------------- */
if (accepted) {
  check('session role read from Firebase', s.role === (emp?.role || ''), s.role);
  check('session walletAddress matches', s.walletAddress.toLowerCase() === walletAddress);
  const roleUpper = s.role.toUpperCase();
  const route = ['ADMIN', 'ADMINISTRATOR', 'SECURITY OFFICER'].includes(roleUpper)
    ? '/bel (Admin dashboard)'
    : roleUpper === 'MANAGER'
    ? '/manager (Manager dashboard)'
    : roleUpper === 'AUDITOR'
    ? '/auditor (Auditor dashboard)'
    : '/user (User dashboard)';
  console.log(`\n  → RBAC: role "${s.role}" → ${route}`);
}

console.log('\n────────────────────────────────────────────────────────────');
console.log(` PROVISIONED-DID TEST RESULT: ${pass} passed · ${failCount} failed`);
console.log('────────────────────────────────────────────────────────────');
if (failCount > 0) process.exit(1);