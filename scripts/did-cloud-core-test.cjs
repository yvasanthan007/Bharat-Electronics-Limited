/**
 * BEL Trust Platform — Cloud Function verification core: ATTACK-SCENARIO SUITE.
 *
 * Runs the PURE server-side verification pipeline (functions/src/didCore.ts —
 * the exact logic executed by the `verifySignature` / `verifyDID` Cloud
 * Functions) against every attack scenario required by the security spec.
 *
 * Prereq: cd functions && npm run build   (produces functions/lib/didCore.js)
 * Run:    node scripts/did-cloud-core-test.cjs
 */
const assert = require('node:assert');
const { ethers } = require('ethers');
const path = require('node:path');

const core = require(path.join(__dirname, '..', 'functions', 'lib', 'didCore.js'));

let pass = 0;
let fail = 0;

function check(name, cond, detail) {
  if (cond) {
    pass += 1;
    console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
  } else {
    fail += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/* ----------------------------- fixtures ---------------------------------- */

// "Aditya" — legitimate employee with a registered DID + wallet.
const adityaKey = ethers.Wallet.createRandom();
const attackerKey = ethers.Wallet.createRandom(); // no control of Aditya's key

const ADITYA = {
  did: `did:ethr:${adityaKey.address}`,
  walletAddress: adityaKey.address.toLowerCase(),
  publicKey: adityaKey.publicKey,
  employeeId: 'BEL-2024-1031',
  name: 'Aditya Singh',
  role: 'Engineer',
  email: 'aditya.singh1@bel.co.in',
  status: 'Verified',
};

const AUTH_UID = 'firebase-uid-aditya';

/** Issues a challenge exactly like the `createChallenge` Cloud Function. */
function issueChallenge({ nonce, issuedAtMs, expiresAtMs, uid = AUTH_UID, walletAddress } = {}) {
  const now = issuedAtMs ?? Date.now();
  const expires = expiresAtMs ?? now + core.CHALLENGE_TTL_MS;
  const n = nonce ?? require('node:crypto').randomBytes(32).toString('hex');
  const challenge = core.buildChallengeText({
    did: ADITYA.did,
    walletAddress: ADITYA.walletAddress,
    nonce: n,
    issuedAtMs: now,
    expiresAtMs: expires,
  });
  return {
    challenge,
    DID: ADITYA.did,
    employeeID: ADITYA.employeeId,
    uid,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(expires).toISOString(),
    used: false,
    walletAddress: ADITYA.walletAddress,
    nonce: n,
  };
}

/** Runs the full `verifySignature` evaluation (a–h checklist). */
function verify({ challengeDoc, signature, authUid = AUTH_UID, did = ADITYA.did, wallet = ADITYA.walletAddress, employeeDoc } = {}) {
  return core.evaluateSignatureProof({
    nowMs: Date.now(),
    authUid,
    challengeIdClaim: 'test-challenge',
    didClaim: did,
    walletAddressClaim: wallet,
    signature,
    challengeDoc,
    employeeDoc: employeeDoc ?? ADITYA,
  });
}

/* ------------------------------- tests ------------------------------------ */

(async () => {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log(' BEL DID Cloud Function verification core — attack scenarios');
  console.log('════════════════════════════════════════════════════════════\n');

  // [1] Legitimate user: fresh server challenge, wallet signs, all checks pass.
  console.log('[1] Legitimate user (Aditya) — wallet signs fresh challenge → SUCCESS');
  const legit = issueChallenge();
  const legitSig = await adityaKey.signMessage(legit.challenge);
  {
    const r = verify({ challengeDoc: legit, signature: legitSig });
    check('authenticated', r.ok === true, r.error);
    check('session role from Firebase', r.session?.role === 'Engineer');
    check('session DID binding', r.session?.did === ADITYA.did);
    check('session employee binding', r.session?.employeeId === ADITYA.employeeId);
  }

  // [2] Attacker: correct email/password/DID/wallet but NO private-key control.
  console.log('[2] Attacker with everything except the private key → FAIL at signature');
  {
    const fresh = issueChallenge();
    const attackerSig = await attackerKey.signMessage(fresh.challenge);
    const r = verify({ challengeDoc: fresh, signature: attackerSig });
    check('rejected', r.ok === false, r.error);
    check('challenge NOT consumed by failure', fresh.used === false);
  }

  // [3] Replay: same valid signature submitted twice.
  console.log('[3] Replay of a valid signature → FAIL (challenge.used = true)');
  {
    const fresh = issueChallenge();
    const sig = await adityaKey.signMessage(fresh.challenge);
    const first = verify({ challengeDoc: fresh, signature: sig });
    check('first use succeeds', first.ok === true);
    fresh.used = true; // what the Cloud Function's atomic transaction writes
    const second = verify({ challengeDoc: fresh, signature: sig });
    check('replay rejected', second.ok === false, second.error);
  }

  // [4] Expired challenge (60 s TTL elapsed).
  console.log('[4] Expired challenge → FAIL');
  {
    const expired = issueChallenge({ expiresAtMs: Date.now() - 1000, issuedAtMs: Date.now() - 61000 });
    const sig = await adityaKey.signMessage(expired.challenge);
    const r = verify({ challengeDoc: expired, signature: sig });
    check('rejected', r.ok === false, r.error);
  }

  // [5] Wrong DID submitted (belongs to another employee).
  console.log('[5] Wrong DID (belongs to another employee) → FAIL');
  {
    const fresh = issueChallenge();
    const sig = await adityaKey.signMessage(fresh.challenge);
    const r = verify({ challengeDoc: fresh, signature: sig, did: `did:ethr:${attackerKey.address}` });
    check('rejected', r.ok === false, r.error);
  }

  // [6] Wrong wallet address submitted.
  console.log('[6] Wrong wallet address submitted → FAIL');
  {
    const fresh = issueChallenge();
    const sig = await adityaKey.signMessage(fresh.challenge);
    const r = verify({ challengeDoc: fresh, signature: sig, wallet: attackerKey.address.toLowerCase() });
    check('rejected', r.ok === false, r.error);
  }

  // [7] Signature created by another wallet over the same challenge text.
  console.log('[7] Signature by another wallet → FAIL');
  {
    const fresh = issueChallenge();
    const sig = await attackerKey.signMessage(fresh.challenge);
    const r = verify({ challengeDoc: fresh, signature: sig });
    check('rejected', r.ok === false, r.error);
  }

  // [8] Firebase UID mismatch (challenge issued to a different uid).
  console.log('[8] Firebase UID mismatch → FAIL');
  {
    const fresh = issueChallenge({ uid: 'firebase-uid-someone-else' });
    const sig = await adityaKey.signMessage(fresh.challenge);
    const r = verify({ challengeDoc: fresh, signature: sig });
    check('rejected', r.ok === false, r.error);
  }



  // [9] Signature over a MODIFIED challenge text (tampering).
  console.log('[9] Modified challenge text → FAIL');
  {
    const fresh = issueChallenge();
    const sig = await adityaKey.signMessage(fresh.challenge);
    const tampered = { ...fresh, challenge: `${fresh.challenge}\nMODIFIED`, nonce: 'deadbeef' };
    const r = verify({ challengeDoc: tampered, signature: sig });
    check('rejected', r.ok === false, r.error);
  }

  // [10] Missing public key in Firebase.
  console.log('[10] Missing DID public key in Firebase → FAIL');
  {
    const fresh = issueChallenge();
    const sig = await adityaKey.signMessage(fresh.challenge);
    const r = verify({ challengeDoc: fresh, signature: sig, employeeDoc: { ...ADITYA, publicKey: '' } });
    check('rejected', r.ok === false, r.error);
  }

  // [11] Inactive employee.
  console.log('[11] Inactive employee → FAIL');
  {
    const fresh = issueChallenge();
    const sig = await adityaKey.signMessage(fresh.challenge);
    const r = verify({ challengeDoc: fresh, signature: sig, employeeDoc: { ...ADITYA, status: 'Suspended' } });
    check('rejected', r.ok === false, r.error);
  }

  // [12] DID ownership checks (verifyDID Cloud Function core).
  console.log('[12] verifyDID ownership checks');
  {
    const r = core.evaluateDidOwnership({ did: `did:ethr:${attackerKey.address}`, employee: ADITYA });
    check('DID owned by another employee rejected', r.ok === false, r.error);
  }
  {
    const r = core.evaluateDidOwnership({ did: 'not-a-did', employee: ADITYA });
    check('invalid DID format rejected', r.ok === false, r.error);
  }
  {
    const r = core.evaluateDidOwnership({ did: ADITYA.did, employee: null });
    check('user without employee record rejected', r.ok === false, r.error);
  }
  {
    const r = core.evaluateDidOwnership({ did: ADITYA.did.toLowerCase(), employee: ADITYA });
    check('lowercase-address DID accepted', r.ok === true, r.error);
  }

  // [13] Malformed signature garbage.
  console.log('[13] Malformed signature → FAIL');
  {
    const fresh = issueChallenge();
    const r = verify({ challengeDoc: fresh, signature: '0xdeadbeef' });
    check('rejected', r.ok === false, r.error);
  }

  console.log('\n────────────────────────────────────────────────────────────');
  console.log(` RESULT: ${pass} passed, ${fail} failed`);
  console.log('────────────────────────────────────────────────────────────\n');
  process.exit(fail === 0 ? 0 : 1);
})().catch((err) => {
  console.error('Suite crashed:', err);
  process.exit(1);
});
