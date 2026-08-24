import { generateDID, resolveDIDDocument } from '../lib/did/didEngine';
import type { GeneratedDID, DIDDocument } from '../lib/did/didEngine';
import { recordBlockchainEvent } from '../lib/did/blockchainLayer';
import { mockDIDIdentities, type DIDIdentity } from '../data/mockDIDData';

const DID_STORAGE_KEY = 'bel_did_identities';

function loadStoredDIDs(): DIDIdentity[] {
  try {
    const raw = localStorage.getItem(DID_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDIDs(dids: DIDIdentity[]): void {
  try {
    localStorage.setItem(DID_STORAGE_KEY, JSON.stringify(dids));
  } catch { }
}

/**
 * Returns all DID identities (seed + session-created).
 */
export function getAllDIDIdentities(): DIDIdentity[] {
  const stored = loadStoredDIDs();
  // Merge seed data with session-created; session ones override seed if same id
  const storedIds = new Set(stored.map((d) => d.id));
  const seed = mockDIDIdentities.filter((d) => !storedIds.has(d.id));
  return [...seed, ...stored];
}

/**
 * Creates a new DID identity:
 * 1. Generates cryptographic key pair + DID
 * 2. Stores identity (without private key)
 * 3. Records blockchain event
 * Returns the generated DID data (including private key for immediate VC signing)
 */
export async function createDIDIdentity(params: {
  name: string;
  employeeId: string;
  email: string;
  department: string;
  role: string;
}): Promise<{ identity: DIDIdentity; generated: GeneratedDID }> {
  const generated = generateDID();
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  const identity: DIDIdentity = {
    id: `did_${Date.now()}`,
    name: params.name,
    did: `did:ethr:${generated.walletAddress.substring(0, 6)}...${generated.walletAddress.substring(generated.walletAddress.length - 4)}`,
    fullDID: generated.did,
    walletAddress: generated.walletAddress,
    publicKey: generated.publicKey,
    role: params.role,
    department: params.department,
    status: 'Pending',
    createdOn: today,
    createdAt: now,
    lastActive: 'Just now',
  };

  // Save to storage (no private key stored)
  const existing = loadStoredDIDs();
  existing.push(identity);
  saveDIDs(existing);

  // Record on blockchain
  await recordBlockchainEvent({
    eventType: 'DID_CREATED',
    actorDID: generated.did,
    walletAddress: generated.walletAddress,
    details: {
      name: params.name,
      role: params.role,
      department: params.department,
      employeeId: params.employeeId,
    },
    verificationResult: 'SUCCESS',
  });

  return { identity, generated };
}

/**
 * Resolves a DID to its DID Document.
 */
export function resolveDID(did: string): DIDDocument | null {
  const all = getAllDIDIdentities();
  const identity = all.find((d) => d.fullDID === did || d.did === did);
  if (!identity) return null;

  return resolveDIDDocument(
    identity.fullDID,
    identity.publicKey,
    identity.walletAddress,
    identity.createdAt
  );
}

export interface DIDVerificationResult {
  valid: boolean;
  did: string;
  walletAddress: string;
  steps: { label: string; passed: boolean; detail: string }[];
  txHash?: string;
}

/**
 * Verifies a DID by:
 * 1. Resolving it
 * 2. Confirming the document structure is valid
 * 3. Recording the verification on blockchain
 */
export async function verifyDID(did: string): Promise<DIDVerificationResult> {
  const all = getAllDIDIdentities();
  const identity = all.find((d) => d.fullDID === did || d.did === did);

  const steps: DIDVerificationResult['steps'] = [];

  const resolved = identity ? resolveDID(did) : null;
  steps.push({
    label: 'DID Resolution',
    passed: !!resolved,
    detail: resolved ? `Resolved to ${identity!.walletAddress.substring(0, 10)}...` : 'DID not found in registry',
  });

  const documentValid = !!resolved &&
    resolved.verificationMethod.length > 0 &&
    resolved.authentication.length > 0;
  steps.push({
    label: 'DID Document Integrity',
    passed: documentValid,
    detail: documentValid
      ? 'Document structure valid — verification methods present'
      : 'Invalid or missing DID document',
  });

  steps.push({
    label: 'Blockchain Anchoring',
    passed: !!identity,
    detail: identity
      ? `Anchored at block — DID registered on ${identity.createdAt.split('T')[0]}`
      : 'No blockchain record found',
  });

  const valid = steps.every((s) => s.passed);

  // Record verification event
  let txHash: string | undefined;
  if (identity) {
    const event = await recordBlockchainEvent({
      eventType: 'DID_VERIFIED',
      actorDID: identity.fullDID,
      walletAddress: identity.walletAddress,
      details: { did, result: valid ? 'VERIFIED' : 'FAILED' },
      verificationResult: valid ? 'SUCCESS' : 'FAILURE',
    });
    txHash = event.txHash;

    // Update status if it was pending
    if (valid && identity.status === 'Pending') {
      const stored = loadStoredDIDs();
      const idx = stored.findIndex((d) => d.id === identity.id);
      if (idx >= 0) {
        stored[idx].status = 'Verified';
        stored[idx].verifiedAt = new Date().toISOString();
        saveDIDs(stored);
      }
    }
  }

  return {
    valid,
    did,
    walletAddress: identity?.walletAddress ?? '',
    steps,
    txHash,
  };
}
