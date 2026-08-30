/**
 * BEL Trust Platform — LIVE Firestore integration test for DID auth.
 *
 * Proves against the REAL Firebase project (bel-sih-b9392):
 *   1.  The employee record for aditya.singh1@bel.co.in (BEL1001) has the
 *       fields the flow needs (did, publicKey, role, status).
 *   2.  A single-use challenge can be issued into `didChallenges`
 *       (same document shape as src/services/didAuthServer.ts).
 *   3.  A signature from the WRONG key is REJECTED server-side and the
 *       challenge is NOT consumed (used stays false → the legitimate owner
 *       can still use it once).
 *
 * NOTE: the success path cannot be exercised headlessly because BEL1001's
 * private key lives ONLY inside the employee's browser wallet (IndexedDB,
 * AES-GCM encrypted) — by design. Run the app and log in as
 * aditya.singh1@bel.co.in / 123456 to see the full happy path.
 *
 * Run:  backend\node_modules\.bin\tsx.cmd scripts\did-auth-live-test.ts
 */
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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

const app = initializeApp(
  {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  },
  'did-live-test'
);
const auth = getAuth(app);
const db = getFirestore(app);

const EMAIL = 'aditya.singh1@bel.co.in';
const PASSWORD = '123456';

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

/* ------------------------------ 1. credentials ----------------------------- */
console.log('\n[1] Firebase Auth credential verification (existing auth system)');
const cred = await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
check('email/password accepted', !!cred.user, `uid=${cred.user.uid}`);

/* --------------------------- 2. employee record ---------------------------- */
console.log('\n[2] Employee record in Firebase (employees/BEL1001)');
const empSnap = await getDoc(doc(db, 'employees', 'BEL1001'));
check('employee document exists', empSnap.exists());
const emp = empSnap.data() as (DidEmployeeDoc & { employeeName?: string }) | undefined;
check('has DID', !!emp?.did, emp?.did);
check('has publicKey', !!emp?.publicKey);
check('has role', !!emp?.role, emp?.role);
check('account active', emp?.status === 'Verified', emp?.status);
check(
  'publicKey derives to walletAddress',
  !!emp?.publicKey && ethers.computeAddress(emp.publicKey).toLowerCase() === emp?.walletAddress?.toLowerCase()
);

/* -------------------------- 3. issue challenge ----------------------------- */
console.log('\n[3] Issue single-use challenge into Firestore (didChallenges)');
const now = Date.now();
const nonce = generateDidNonce();
const did = (emp!.did as string).trim();
const walletAddress = (emp!.walletAddress as string).toLowerCase();
const challengeText = buildChallengeText({
  did,
  walletAddress,
  nonce,
  issuedAtMs: now,
  expiresAtMs: now + 5 * 60 * 1000,
});
const challengeDoc: DidChallengeDoc = {
  challenge: challengeText,
  DID: did,
  employeeID: 'BEL1001',
  createdAt: new Date(now).toISOString(),
  expiresAt: new Date(now + 5 * 60 * 1000).toISOString(),
  used: false,
  walletAddress,
  nonce,
};
const testChallengeId = `selftest-${now}`;
await setDoc(doc(db, 'didChallenges', testChallengeId), challengeDoc);
const storedSnap = await getDoc(doc(db, 'didChallenges', testChallengeId));
check('challenge stored with used=false', storedSnap.exists() && storedSnap.data().used === false);
check(
  'stored shape matches spec (challenge/DID/employeeID/createdAt/expiresAt/used)',
  ['challenge', 'DID', 'employeeID', 'createdAt', 'expiresAt', 'used'].every((k) => k in (storedSnap.data() ?? {}))
);

/* ----------------- 4. wrong-key signature rejected live -------------------- */
console.log('\n[4] Server-side verification with WRONG key → rejected, challenge NOT consumed');
const attacker = ethers.Wallet.createRandom();
const badSig = await attacker.signMessage(challengeText);

// Same transaction shape as verifyDidChallengeResponse in didAuthServer.ts
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
        const err = new Error(evaluation.error || 'DID verification failed.');
        throw err;
      }
      tx.update(ref, { used: true, usedAt: new Date().toISOString() });
      return evaluation.session;
    });
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) } as const;
  }
}

{
  const r = await verifyLive(badSig, did);
  check('rejected', !r.ok, (r as { error?: string }).error);
  const after = await getDoc(doc(db, 'didChallenges', testChallengeId));
  check(
    'challenge still unused (legitimate owner can still authenticate once)',
    after.exists() && after.data().used === false
  );
}

/* ------------------- 5. tampered challenge rejected live ------------------- */
console.log('\n[5] Signature over a DIFFERENT challenge text → rejected');
{
  const wrongChallengeSig = await attacker.signMessage('some other challenge');
  const r = await verifyLive(wrongChallengeSig, did);
  check('rejected', !r.ok, (r as { error?: string }).error);
}

/* ----------------------------- cleanup ------------------------------------- */
console.log('\n[cleanup] Removing self-test challenge document');
await deleteDoc(doc(db, 'didChallenges', testChallengeId));
const gone = await getDoc(doc(db, 'didChallenges', testChallengeId));
check('test challenge removed', !gone.exists());

console.log('\n────────────────────────────────────────────────────────────');
console.log(` LIVE TEST RESULT: ${pass} passed · ${failCount} failed`);
console.log('────────────────────────────────────────────────────────────');
if (failCount > 0) process.exit(1);
