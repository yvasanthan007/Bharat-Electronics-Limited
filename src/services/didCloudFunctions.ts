import { getApp } from 'firebase/app';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import type { FunctionsError } from 'firebase/functions';

/**
 * BEL Trust Platform — Cloud Functions bridge for DID authentication.
 *
 * Connects the EXISTING login UI (AuthCard) to the authoritative backend:
 *   verifyDID        → DID registered to the authenticated Firebase user
 *   createChallenge  → server-generated CSPRNG one-time challenge (60 s)
 *                      + server-side company-password validation
 *   verifySignature  → server-side EIP-191 signature verification against the
 *                      Firebase-stored public key / wallet + atomic consume
 *
 * The private key NEVER passes through here — only the resulting signature.
 *
 * UNAVAILABLE SEMANTICS: when the Cloud Functions backend cannot be reached
 * (emulator not running / network error) the caller falls back to the
 * project's existing local verifier (didAuthServer.ts), preserving the
 * current behavior. Definitive server rejections (wrong password, DID not
 * registered to this user, replay, expired…) are returned as errors and are
 * NEVER retried locally.
 */

const USE_EMULATOR = String(import.meta.env.VITE_USE_FUNCTIONS_EMULATOR ?? 'true') === 'true';
const EMULATOR_HOST = String(import.meta.env.VITE_FUNCTIONS_EMULATOR_HOST ?? 'localhost');
const EMULATOR_PORT = Number(import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT ?? 5001);

let functionsInstance: ReturnType<typeof getFunctions> | null = null;

function getFn(): ReturnType<typeof getFunctions> {
  if (!functionsInstance) {
    functionsInstance = getFunctions(getApp(), 'us-central1');
    if (USE_EMULATOR) {
      connectFunctionsEmulator(functionsInstance, EMULATOR_HOST, EMULATOR_PORT);
    }
  }
  return functionsInstance;
}

/** True when the failure means "backend not reachable" (safe to fall back). */
export function isBackendUnavailableError(err: unknown): boolean {
  const code = (err as Partial<FunctionsError>)?.code ?? '';
  return [
    'functions/unavailable',
    'functions/internal',
    'functions/deadline-exceeded',
    'functions/cancelled',
    'functions/unknown',
    'functions/network-error',
  ].includes(code);
}

/** Human-friendly message from a callable error (no internals leaked). */
export function callableErrorMessage(err: unknown): string {
  const e = err as Partial<FunctionsError>;
  if (e?.message) return String(e.message).replace(/^Firebase: /, '');
  return 'DID authentication backend error.';
}

async function callFunction<TReq, TRes>(name: string, data: TReq): Promise<TRes> {
  const callable = httpsCallable<TReq, TRes>(getFn(), name);
  const result = await callable(data);
  return result.data;
}

/* ------------------------------- payloads --------------------------------- */

export interface CloudDidOwnership {
  ok: boolean;
  verifiedBy: string;
  did: string;
  walletAddress: string;
  employeeId: string;
  name: string;
  role: string;
  registeredInFirebase: boolean;
  boundToAuthenticatedUser: boolean;
}

export interface CloudChallenge {
  ok: boolean;
  verifiedBy: string;
  challengeId: string;
  challenge: string;
  did: string;
  employeeID: string;
  walletAddress: string;
  expiresAt: string;
  ttlSeconds: number;
}

export interface CloudSession {
  did: string;
  employeeId: string;
  name: string;
  role: string;
  walletAddress: string;
  email?: string;
  designation?: string;
  department?: string;
}

export interface CloudVerifyResult {
  ok: boolean;
  verifiedBy: string;
  steps?: Array<{ label: string; passed: boolean; detail: string }>;
  session?: CloudSession;
}

/* --------------------------- public API (callers) -------------------------- */

/** Failure shape shared by every cloud call (unavailable ⇒ safe to fall back). */
export type CloudOutcome<T> =
  | { ok: true; data: T }
  | { ok: false; unavailable: boolean; error: string };

/** STEP: Verify DID — server-side ownership check. */
export async function cloudVerifyDID(did: string): Promise<CloudOutcome<CloudDidOwnership>> {
  try {
    const data = await callFunction<{ did: string }, CloudDidOwnership>('verifyDID', { did });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, unavailable: isBackendUnavailableError(err), error: callableErrorMessage(err) };
  }
}

/** STEP: Challenge — server-side CSPRNG challenge bound to {uid, DID, wallet}. */
export async function cloudCreateChallenge(params: {
  did: string;
  walletAddress: string;
  /** Optional separate company-password factor — validated server-side only. */
  companyPassword?: string;
}): Promise<CloudOutcome<CloudChallenge>> {
  try {
    const data = await callFunction<
      { did: string; walletAddress: string; companyPassword?: string },
      CloudChallenge
    >('createChallenge', params);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, unavailable: isBackendUnavailableError(err), error: callableErrorMessage(err) };
  }
}

/** STEP: Signature verification — server-side crypto proof + atomic consume. */
export async function cloudVerifySignature(params: {
  challengeId: string;
  did: string;
  walletAddress: string;
  signature: string;
}): Promise<CloudOutcome<CloudVerifyResult>> {
  try {
    const data = await callFunction<
      { challengeId: string; did: string; walletAddress: string; signature: string },
      CloudVerifyResult
    >('verifySignature', params);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, unavailable: isBackendUnavailableError(err), error: callableErrorMessage(err) };
  }
}
