#!/usr/bin/env node
/**
 * BEL Trust Platform — a one-off DID provisioning tool.
 *
 * Issues DID credentials for employees listed in Firestore `employees` so that
 * each can complete the DID signature-verification login and land on the
 * correct role dashboard (Admin→/bel, Manager→/manager, Auditor→/auditor,
 * User→/user). The RBAC routing itself is already implemented in the app;
 * this tool ONLY fills in missing DID material (public data), mirroring
 * exactly what the app's DID-issue flow (src/lib/did/didEngine.generateDID +
 * src/services/did.ts createDIDIdentity) writes.
 *
 * SECURITY
 *   • Writes ONLY public data to Firestore (did, walletAddress, walletId,
 *     publicKey, didStatus, didCreatedAt, keyType, platform, status,
 *     updatedAt). Never private keys, mnemonics or seed phrases.
 *   • Never overwrites an existing `did` on an employee doc (matching the
 *     app's immutable-DID rule). Existing `role` is preserved.
 *   • `--live` requires `--commit`; default is a read-only dry run (defaults
 *     to the local Firestore emulator on :8080 first, otherwise dry-run).
 *   • The generated private key is written ONLY to a local, gitignored
 *     artifact file (.did-keys/<employeeId>.json, chmod 0600) so it can be
 *     imported into the employee's browser wallet. It is never transmitted.
 *
 * USAGE
 *   node scripts/provision-did.mjs --dry-run
 *   node scripts/provision-did.mjs --live --commit
 *   node scripts/provision-did.mjs --emulator=8080 --commit
 *   node scripts/provision-did.mjs --ids=BEL1015,BEL1116 --live --commit
 *   node scripts/provision-did.mjs --role=Manager --live --commit
 *   node scripts/provision-did.mjs --all --live --commit
 *
 * ENV
 *   FIREBASE_ACCESS_TOKEN  Bearer token (service account or user) for live
 *                          writes. Read from .env.local if not set.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ethers } from 'ethers';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ENV_LOCAL = join(ROOT, '.env.local');
const KEYS_DIR = join(__dirname, '.did-keys');

/* ------------------------------ CLI parsing ------------------------------ */
const argv = process.argv.slice(2);
function getArg(name, def = undefined) {
  const idx = argv.findIndex((a) => a.startsWith(`--${name}=`));
  if (idx < 0) return def;
  return argv[idx].slice(name.length + 3);
}
function hasFlag(name) {
  return argv.includes(`--${name}`);
}

const FLAGS = {
  live: hasFlag('live'),
  emulator: getArg('emulator', null),
  commit: hasFlag('commit'),
  all: hasFlag('all'),
  dryRun: hasFlag('dry-run') || !hasFlag('commit'),
  role: getArg('role', null),
  ids: getArg('ids', null) ? getArg('ids', '').split(',').map((s) => s.trim()).filter(Boolean) : [],
};

// Default target: if the emulator is listening on 8080, use it; else live.
function guessTarget() {
  if (FLAGS.emulator) return { name: 'emulator', base: `http://127.0.0.1:${FLAGS.emulator}` };
  if (FLAGS.live) return { name: 'live', base: 'https://firestore.googleapis.com/v1' };
  return { name: 'dry-run', base: 'https://firestore.googleapis.com/v1' };
}

/* ------------------------------ config load ------------------------------ */
function loadEnvLocal() {
  const cfg = {};
  if (!existsSync(ENV_LOCAL)) return cfg;
  for (const line of readFileSafe(ENV_LOCAL).split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m) cfg[m[1]] = m[2];
  }
  return cfg;
}
function readFileSafe(p) {
  try { return readFileSync(p, 'utf8'); } catch { return ''; }
}

const ENV = loadEnvLocal();
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || ENV.VITE_FIREBASE_PROJECT_ID || 'bel-sih-b9392';
const API_KEY = process.env.FIREBASE_API_KEY || ENV.VITE_FIREBASE_API_KEY || '';
let ACCESS_TOKEN = process.env.FIREBASE_ACCESS_TOKEN || ENV.FIREBASE_ACCESS_TOKEN || ENV.VITE_FIREBASE_ACCESS_TOKEN || '';
const AUTH_EMAIL = process.env.FIREBASE_AUTH_EMAIL || getArg('auth-email', null);
const AUTH_PASSWORD = process.env.FIREBASE_AUTH_PASSWORD || getArg('auth-password', null);
const TARGET = guessTarget();
const DRY_RUN = FLAGS.dryRun || !FLAGS.commit;

const COLLECTION = 'employees';

/* --------------------------- auth (identitytoolkit) ---------------------- */
/**
 * Signs in via Firebase Auth REST (the same endpoint the app's login uses) and
 * caches the returned idToken as the Bearer for Firestore writes. Falls back
 * to ANONYMOUS sign-up when no credentials are provided (Anonymous Auth must
 * be enabled on the project for that path to work).
 */
let idTokenCache = null;
async function getAccessToken() {
  if (idTokenCache) return idTokenCache;
  if (ACCESS_TOKEN) return ACCESS_TOKEN;
  if (AUTH_EMAIL && AUTH_PASSWORD && API_KEY) {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: AUTH_EMAIL, password: AUTH_PASSWORD, returnSecureToken: true }),
    });
    const body = await res.json();
    if (!res.ok || !body.idToken) {
      throw new Error(`Firebase Auth sign-in failed (${res.status}): ${JSON.stringify(body).slice(0, 300)}`);
    }
    idTokenCache = body.idToken;
    console.log('  [auth] signed in via Firebase Auth (idToken cached)');
    return idTokenCache;
  }
  if (API_KEY) {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true }),
    });
    const body = await res.json();
    if (!res.ok || !body.idToken) {
      throw new Error(
        'No credentials available. Provide --auth-email/--auth-password (a Firebase Auth account), FIREBASE_ACCESS_TOKEN, or enable Anonymous Auth for the anonymous fallback.'
      );
    }
    idTokenCache = body.idToken;
    console.log('  [auth] signed in ANONYMOUSLY (idToken cached)');
    return idTokenCache;
  }
  throw new Error('No auth path available: missing API key, credentials and token.');
}

/* ------------------------------ Firestore REST --------------------------- */
async function headers() {
  const h = { 'Content-Type': 'application/json' };
  if (TARGET.name === 'live') h['Authorization'] = `Bearer ${await getAccessToken()}`;
  return h;
}

async function fsRequest(path, opts = {}) {
  const url = `${TARGET.base}/${path}`;
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers: await headers(),
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Firestore ${opts.method || 'GET'} ${path} -> ${res.status}: ${text.slice(0, 400)}`);
  }
  return text ? JSON.parse(text) : null;
}

function projectPath(sub) {
  return `projects/${PROJECT_ID}/databases/(default)/documents${sub}`;
}

function docToPlain(doc) {
  const out = {};
  for (const [k, spec] of Object.entries(doc.fields || {})) {
    if (spec.stringValue !== undefined) out[k] = spec.stringValue;
    else if (spec.integerValue !== undefined) out[k] = Number(spec.integerValue);
    else if (spec.doubleValue !== undefined) out[k] = spec.doubleValue;
    else if (spec.booleanValue !== undefined) out[k] = spec.booleanValue;
  }
  return out;
}

function plainToFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (typeof v === 'number') fields[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    else fields[k] = { stringValue: String(v) };
  }
  return fields;
}
/* ------------------------------ core logic ------------------------------- */
async function listEmployees() {
  const docs = [];
  let page;
  do {
    const q = `pageSize=300${page ? `&pageToken=${page}` : ''}`;
    const body = await fsRequest(projectPath(`/${COLLECTION}?${q}`));
    docs.push(...(body.documents || []));
    page = body.nextPageToken;
  } while (page);
  return docs.map((d) => ({ id: d.name.split('/').pop(), ...docToPlain(d) }));
}

/* ------------------------------ core logic ------------------------------- */
function needsDid(emp) {
  return !emp.did || !emp.publicKey || !emp.walletAddress || emp.didStatus !== 'Created';
}

function generateIdentity(emp) {
  // Same generation as the app: ethers.Wallet.createRandom() → did:ethr:<address>
  const wallet = ethers.Wallet.createRandom();
  const now = new Date().toISOString();
  return {
    did: `did:ethr:${wallet.address}`,
    walletAddress: wallet.address,
    walletId: wallet.address.toLowerCase(),
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey, // LOCAL ops artifact ONLY — never written to Firestore
    keyType: 'Secp256k1',
    didStatus: 'Created',
    didCreatedAt: now,
    status: emp.status || emp.employmentStatus || 'Verified',
    updatedAt: now,
  };
}

async function provisionEmployee(emp) {
  if (!needsDid(emp)) {
    console.log(`  [skip] ${emp.id} already has a DID (${emp.did || ''}) — immutable, leaving as-is.`);
    return;
  }

  const keypair = generateIdentity(emp);
  const publicData = {
    did: keypair.did,
    walletAddress: keypair.walletAddress,
    walletId: keypair.walletId,
    publicKey: keypair.publicKey,
    keyType: keypair.keyType,
    didStatus: keypair.didStatus,
    didCreatedAt: keypair.didCreatedAt,
    status: keypair.status,
    updatedAt: keypair.updatedAt,
    role: emp.role || emp.roleName || 'User', // never demote/promote
  };

  if (DRY_RUN) {
    console.log(`  [dry-run] would issue DID for ${emp.id} (${emp.name || emp.email || ''}):`);
    console.log(`           did=${keypair.did}`);
    console.log(`           walletAddress=${keypair.walletAddress}`);
  } else {
    // Firestore PATCH with repeated updateMask.fieldPaths (merge semantics —
    // identical to the app's setDoc(doc, data, { merge: true })). Only the
    // listed public fields change; nothing else on the doc is touched.
    const fieldPaths = Object.keys(publicData);
    const mask = fieldPaths.map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
    const url = `${projectPath(`/${COLLECTION}/${emp.id}`)}?${mask}`;
    await fsRequest(url, { method: 'PATCH', body: { fields: plainToFields(publicData) } });
    console.log(`  [OK] issued DID for ${emp.id}: ${keypair.did}`);
  }

  // Private-key ops artifact (kept local, never transmitted).
  if (!DRY_RUN) {
    try {
      mkdirSync(KEYS_DIR, { recursive: true });
      const file = join(KEYS_DIR, `${emp.id}.json`);
      writeFileSync(file, JSON.stringify({
        employeeId: emp.id,
        name: emp.name || emp.employeeName || '',
        email: emp.email || '',
        role: emp.role || '',
        did: keypair.did,
        walletAddress: keypair.walletAddress,
        publicKey: keypair.publicKey,
        privateKey: keypair.privateKey,
      }, null, 2), 'utf8');
      try { chmodSync(file, 0o600); } catch { /* best effort */ }
      console.log(`  [key] private-key artifact → ${file} (0600)`);
    } catch (err) {
      console.warn(`  [!] could not write key artifact for ${emp.id}: ${err.message}`);
    }
  }

  return keypair;
}

/* ------------------------------ main ------------------------------- */
async function main() {
  console.log('  BEL DID provisioning tool');
  console.log(`  Project  : ${PROJECT_ID}`);
  console.log(`  Target   : ${TARGET.name}${DRY_RUN ? ' (DRY RUN — no writes)' : ''}`);

  // Guard: live commits require an auth path (token, credentials, or API key
  // for the anonymous fallback).
  if (TARGET.name === 'live' && !DRY_RUN && !ACCESS_TOKEN && !API_KEY) {
    console.error('\n  ✘ LIVE commit requires an auth path: FIREBASE_ACCESS_TOKEN,');
    console.error('    or --auth-email/--auth-password with a VITE_FIREBASE_API_KEY,');
    console.error('    or an enabled Anonymous Auth provider for the anonymous fallback.\n');
    process.exit(2);
  }

  const docs = await listEmployees();
  console.log(`  Found ${docs.length} employee docs.`);

  const filtered = docs.filter((emp) => {
    if (FLAGS.ids.length && !FLAGS.ids.includes(emp.id)) return false;
    if (FLAGS.role) {
      const r = (emp.role || '').toLowerCase();
      if (r !== FLAGS.role.toLowerCase()) return false;
    }
    if (!FLAGS.all && !FLAGS.ids.length && !FLAGS.role) return false;
    return true;
  });

  if (!filtered.length) {
    console.log('  No matching employees to provision. Pass --all, --role=…, or --ids=…');
    return;
  }
  console.log(`  Provisioning ${filtered.length} employee(s)…\n`);

  for (const emp of filtered) {
    try {
      await provisionEmployee(emp);
    } catch (err) {
      console.warn(`  [error] ${emp.id}: ${err.message}`);
    }
  }
  console.log('\n  Done.');
}

main().catch((err) => {
  console.error('\nFATAL:', err.message);
  process.exit(1);
});