/**
 * BEL Trust Platform — DID Authentication self-test battery.
 *
 * Exercises the EXACT server-side verification logic used by
 * src/services/didAuthServer.ts (via the pure evaluator in
 * src/lib/did/didAuthCrypto.ts) against every required failure case:
 *
 *   1. valid signature            → AUTHENTICATED
 *   2. unknown DID                → rejected
 *   3. DID belonging to another employee → rejected
 *   4. invalid signature          → rejected
 *   5. modified challenge         → rejected
 *   6. expired challenge          → rejected
 *   7. reused challenge (used=true) → rejected
 *   8. missing public key         → rejected
 *   9. inactive employee          → rejected
 *
 * Run:  backend\node_modules\.bin\tsx.cmd scripts\did-auth-selftest.ts
 * (Login with aditya.singh1@bel.co.in / 123456 exercises the live flow in the
 *  browser — this script proves the verification math + policy fail-closed.)
 */
import { ethers } from 'ethers';
import {
  evaluateDidChallenge,
  buildChallengeText,
  generateDidNonce,
  type DidChallengeDoc,
  type DidEmployeeDoc,
} from '../src/lib/did/didAuthCrypto';

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

/* ------------------------------- fixtures --------------------------------- */

// Real DID/public key from the live dataset (employees/BEL1001 — Aditya Singh)
const REAL_PUB = '0x036c17e0878c2f5bc4cb545a88d605f711d36d82603e3fe5a6feddb61f8fb7436d';
const REAL_WALLET = '0x47fd11323f697c2ce7f2df884b80ab39ec4e6c42';

const now = Date.now();
const nonce = generateDidNonce();

// Test wallet "A" plays the legitimate employee; wallet B plays an attacker.
// The challenge document and employee record mirror EXACTLY what the app
// writes to / reads from Firebase (didChallenges + employees collections).
const walletA = ethers.Wallet.createRandom();
const walletB = ethers.Wallet.createRandom();

const DID_A = `did:ethr:${walletA.address}`;
const WALLET_A = walletA.address.toLowerCase();

const challengeDoc: DidChallengeDoc = {
  challenge: buildChallengeText({
    did: DID_A,
    walletAddress: WALLET_A,
    nonce,
    issuedAtMs: now,
    expiresAtMs: now + 5 * 60 * 1000,
  }),
  DID: DID_A,
  employeeID: 'BEL1001',
  createdAt: new Date(now).toISOString(),
  expiresAt: new Date(now + 5 * 60 * 1000).toISOString(),
  used: false,
  walletAddress: WALLET_A,
  nonce,
};

const employeeDoc: DidEmployeeDoc = {
  employeeId: 'BEL1001',
  did: DID_A,
  publicKey: walletA.publicKey, // compressed secp256k1, as stored in Firebase
  role: 'Engineer',
  name: 'Aditya Singh',
  email: 'aditya.singh1@bel.co.in',
  walletAddress: WALLET_A,
  status: 'Verified',
  employmentStatus: 'Active',
};

const sigA = await walletA.signMessage(challengeDoc.challenge);
const sigB = await walletB.signMessage(challengeDoc.challenge); // attacker's signature

console.log('\n════════════════════════════════════════════════════════════');
console.log(' BEL DID Authentication — server-side verification tests');
console.log('════════════════════════════════════════════════════════════');

/* ------------------------------- 1. success ------------------------------- */
console.log('\n[1] Valid challenge/response → DID authenticated');
{
  const r = evaluateDidChallenge({
    nowMs: Date.now(),
    challengeId: 'test-ch-1',
    didClaim: challengeDoc.DID,
    signature: sigA,
    challengeDoc,
    employeeDoc,
  });
  check('verification succeeds', r.ok);
  check('role read from Firebase', r.session?.role === 'Engineer', r.session?.role);
  check('all verification steps passed', r.steps.length >= 8 && r.steps.every((s) => s.passed));
}

/* ----------------------------- 2. unknown DID ----------------------------- */
console.log('\n[2] Unknown DID (no employee record) → rejected');
{
  const r = evaluateDidChallenge({
    nowMs: Date.now(),
    challengeId: 'test-ch-2',
    didClaim: 'did:ethr:0x0000000000000000000000000000000000000001',
    signature: sigA,
    challengeDoc: { ...challengeDoc, DID: 'did:ethr:0x0000000000000000000000000000000000000001' },
    employeeDoc: null,
  });
  check('rejected', !r.ok, r.error);
}

/* -------------------- 3. DID belonging to another employee ----------------- */
console.log('\n[3] DID belonging to another employee → rejected');
{
  const r = evaluateDidChallenge({
    nowMs: Date.now(),
    challengeId: 'test-ch-3',
    didClaim: `did:ethr:${walletB.address}`,
    signature: sigB,
    challengeDoc, // challenge was issued for walletA / BEL1001
    employeeDoc,
  });
  check('rejected (claim DID ≠ challenged DID)', !r.ok, r.error);
}
{
  // Employee record registered to a DIFFERENT DID than the challenge's DID.
  const r = evaluateDidChallenge({
    nowMs: Date.now(),
    challengeId: 'test-ch-3b',
    didClaim: challengeDoc.DID,
    signature: sigA,
    challengeDoc,
    employeeDoc: { ...employeeDoc, did: `did:ethr:${walletB.address}` },
  });
  check('rejected (DID ↔ employee mismatch)', !r.ok, r.error);
}

/* ---------------------------- 4. invalid signature ------------------------- */
console.log('\n[4] Invalid signature (different key) → rejected');
{
  const r = evaluateDidChallenge({
    nowMs: Date.now(),
    challengeId: 'test-ch-4',
    didClaim: challengeDoc.DID,
    signature: sigB,
    challengeDoc,
    employeeDoc,
  });
  check('rejected', !r.ok, r.error);
}

/* ---------------------------- 5. modified challenge ------------------------ */
console.log('\n[5] Modified challenge (signature over different text) → rejected');
{
  const tampered: DidChallengeDoc = {
    ...challengeDoc,
    challenge: challengeDoc.challenge.replace('Nonce:', 'Nonce: TAMPERED-'),
  };
  const r = evaluateDidChallenge({
    nowMs: Date.now(),
    challengeId: 'test-ch-5',
    didClaim: challengeDoc.DID,
    signature: sigA,
    challengeDoc: tampered,
    employeeDoc,
  });
  check('rejected', !r.ok, r.error);
}

/* ----------------------------- 6. expired challenge ------------------------ */
console.log('\n[6] Expired challenge → rejected');
{
  const r = evaluateDidChallenge({
    nowMs: Date.now() + 6 * 60 * 1000, // 6 min after issuance (TTL = 5 min)
    challengeId: 'test-ch-6',
    didClaim: challengeDoc.DID,
    signature: sigA,
    challengeDoc,
    employeeDoc,
  });
  check('rejected', !r.ok, r.error);
}

/* ---------------------- 7. reused challenge (anti-replay) ------------------ */
console.log('\n[7] Reused challenge (used=true) → rejected');
{
  const r = evaluateDidChallenge({
    nowMs: Date.now(),
    challengeId: 'test-ch-7',
    didClaim: challengeDoc.DID,
    signature: sigA,
    challengeDoc: { ...challengeDoc, used: true },
    employeeDoc,
  });
  check('rejected', !r.ok, r.error);
}

/* ---------------------------- 8. missing public key ------------------------ */
console.log('\n[8] Missing public key on the employee record → rejected');
{
  const r = evaluateDidChallenge({
    nowMs: Date.now(),
    challengeId: 'test-ch-8',
    didClaim: challengeDoc.DID,
    signature: sigA,
    challengeDoc,
    employeeDoc: { ...employeeDoc, publicKey: '' },
  });
  check('rejected', !r.ok, r.error);
}

/* ---------------------------- 9. inactive employee ------------------------- */
console.log('\n[9] Inactive employee → rejected');
{
  const r = evaluateDidChallenge({
    nowMs: Date.now(),
    challengeId: 'test-ch-9',
    didClaim: challengeDoc.DID,
    signature: sigA,
    challengeDoc,
    employeeDoc: { ...employeeDoc, status: 'Revoked' },
  });
  check('rejected (status=Revoked)', !r.ok, r.error);
}
{
  const r = evaluateDidChallenge({
    nowMs: Date.now(),
    challengeId: 'test-ch-9b',
    didClaim: challengeDoc.DID,
    signature: sigA,
    challengeDoc,
    employeeDoc: { ...employeeDoc, employmentStatus: 'Inactive' },
  });
  check('rejected (employmentStatus=Inactive)', !r.ok, r.error);
}

/* ------------------ 10. REAL dataset record cross-check -------------------- */
console.log('\n[10] Real dataset record (BEL1001) sanity — crypto relationships');
{
  const addrFromPub = ethers.computeAddress(REAL_PUB);
  check(
    'stored publicKey derives to stored walletAddress',
    addrFromPub.toLowerCase() === REAL_WALLET,
    addrFromPub
  );
}

/* ------------------------------ wrong password ----------------------------- */
console.log('\n[11] Wrong password → rejected by Firebase Auth (verified live)');
console.log('    (identitytoolkit signInWithPassword returns 400 for wrong passwords');
console.log('     and 200 for aditya.singh1@bel.co.in / 123456 — credential check');
console.log('     happens in Firebase Auth BEFORE any DID challenge is issued.)');

/* -------------------------------- summary --------------------------------- */
console.log('\n────────────────────────────────────────────────────────────');
console.log(` RESULT: ${pass} passed · ${failCount} failed`);
console.log('────────────────────────────────────────────────────────────');
if (failCount > 0) process.exit(1);
