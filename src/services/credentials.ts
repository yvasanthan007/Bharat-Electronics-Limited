import {
  issueVerifiableCredential,
  verifyVerifiableCredential,
  createMockVC,
  demoIssuerAddressFor,
  type VerifiableCredential,
  type CredentialType,
  type VerificationResult,
} from '../lib/did/vcEngine';
import { recordBlockchainEvent } from '../lib/did/blockchainLayer';
import { mockVerifiableCredentials, BEL_ISSUER_DID, BEL_ISSUER_WALLET } from '../data/mockDIDData';
import { getAllDIDIdentities } from './did';

const VC_STORAGE_KEY = 'bel_verifiable_credentials';

function loadStoredVCs(): VerifiableCredential[] {
  try {
    const raw = localStorage.getItem(VC_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveVCs(vcs: VerifiableCredential[]): void {
  try {
    localStorage.setItem(VC_STORAGE_KEY, JSON.stringify(vcs));
  } catch { }
}

/** Persists a credential into the local VC store (used by provisioning flows). */
export function storeCredential(vc: VerifiableCredential): void {
  const vcs = loadStoredVCs();
  if (!vcs.some((v) => v.id === vc.id)) {
    vcs.push(vc);
    saveVCs(vcs);
  }
}

/** Returns all credentials (seed + session) */
export function getAllCredentials(): VerifiableCredential[] {
  const stored = loadStoredVCs();
  const storedIds = new Set(stored.map((v) => v.id));
  const seed = mockVerifiableCredentials.filter((v) => !storedIds.has(v.id));
  return [...seed, ...stored];
}

/** Returns credentials for a specific holder DID */
export function getCredentialsByHolder(holderDID: string): VerifiableCredential[] {
  return getAllCredentials().filter((vc) => vc.credentialSubject.id === holderDID);
}

export interface IssueCredentialInput {
  holderDID: string;
  credentialType: CredentialType;
  role: string;
  department: string;
  employeeId: string;
  holderName: string;
  expiryMonths?: number;
  // Issuer private key — only provided when a real key pair was just generated
  // If absent, a mock signed credential is created for seed identities
  issuerPrivateKey?: string;
}

/**
 * Issues a Verifiable Credential to a holder DID.
 * When a real issuer private key is provided, produces a cryptographically valid signature.
 * Otherwise creates a mock-signed credential (for demo identities).
 */
export async function issueCredential(
  input: IssueCredentialInput
): Promise<VerifiableCredential> {
  let vc: VerifiableCredential;

  if (input.issuerPrivateKey) {
    vc = await issueVerifiableCredential({
      holderDID: input.holderDID,
      issuerDID: BEL_ISSUER_DID,
      issuerWalletAddress: BEL_ISSUER_WALLET,
      issuerPrivateKey: input.issuerPrivateKey,
      credentialType: input.credentialType,
      subject: {
        role: input.role,
        department: input.department,
        employeeId: input.employeeId,
        name: input.holderName,
      },
      expiryMonths: input.expiryMonths ?? 12,
    });
  } else {
    const now = new Date().toISOString();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + (input.expiryMonths ?? 12));

    vc = createMockVC({
      id: `vc:bel:${Date.now()}`,
      holderDID: input.holderDID,
      issuerDID: BEL_ISSUER_DID,
      credentialType: input.credentialType,
      subject: {
        role: input.role,
        department: input.department,
        employeeId: input.employeeId,
        name: input.holderName,
      },
      issuanceDate: now,
      expirationDate: expiry.toISOString(),
    });
  }

  // Persist
  const stored = loadStoredVCs();
  stored.push(vc);
  saveVCs(stored);

  // Record on blockchain
  await recordBlockchainEvent({
    eventType: 'VC_ISSUED',
    actorDID: BEL_ISSUER_DID,
    walletAddress: BEL_ISSUER_WALLET,
    details: {
      holderDID: input.holderDID,
      credentialType: input.credentialType,
      vcId: vc.id,
      role: input.role,
    },
    verificationResult: 'SUCCESS',
  });

  return vc;
}

export interface FullVerificationResult extends VerificationResult {
  vc: VerifiableCredential;
  txHash?: string;
}

/**
 * Verifies a Verifiable Credential and records the result on blockchain.
 * For seed/mock VCs, uses a mock-verified result since we don't have the issuer private key.
 */
export async function verifyCredential(
  vcId: string
): Promise<FullVerificationResult> {
  const all = getAllCredentials();
  const vc = all.find((v) => v.id === vcId);

  if (!vc) {
    return {
      valid: false,
      vc: {} as VerifiableCredential,
      checks: {
        signatureValid: false,
        notExpired: false,
        issuerResolved: false,
        subjectMatches: false,
      },
      error: 'Credential not found',
    };
  }

  // Every prototype credential is signed by a deterministic demo issuer key
  // derived from its own ID — so verification runs the REAL cryptographic
  // path (recover signer from JWS → compare with expected issuer address).
  // VCs signed with a live issuer key would be verified against that key's
  // address instead (see issueVerifiableCredential / BEL_ISSUER_WALLET).
  const result = verifyVerifiableCredential(vc, demoIssuerAddressFor(vc.id));

  // Record verification
  const event = await recordBlockchainEvent({
    eventType: 'VC_VERIFIED',
    actorDID: vc.credentialSubject.id,
    walletAddress: BEL_ISSUER_WALLET,
    details: {
      vcId,
      credentialType: vc.type[1] ?? 'VerifiableCredential',
      result: result.valid ? 'VERIFIED' : 'FAILED',
    },
    verificationResult: result.valid ? 'SUCCESS' : 'FAILURE',
  });

  return { ...result, vc, txHash: event.txHash };
}

export interface AccessDecision {
  allowed: boolean;
  did: string;
  resource: string;
  action: string;
  steps: {
    label: string;
    passed: boolean;
    detail: string;
  }[];
  txHash?: string;
}

/**
 * Authorizes access using DID → VC → Role → Permission chain.
 * Records the decision on the blockchain audit trail.
 */
export async function authorizeAccess(params: {
  did: string;
  resource: string;
  action: string;
}): Promise<AccessDecision> {
  const allIdentities = getAllDIDIdentities();
  const identity = allIdentities.find(
    (d) => d.fullDID === params.did || d.did === params.did
  );

  const steps: AccessDecision['steps'] = [];

  // Step 1: DID resolved
  steps.push({
    label: 'DID Verified',
    passed: !!identity && identity.status === 'Verified',
    detail: identity
      ? identity.status === 'Verified'
        ? `DID resolved — ${identity.name} (${identity.role})`
        : `DID found but status is ${identity.status}`
      : 'DID not found in registry',
  });

  // Step 2: VC verified
  const credentials = identity ? getCredentialsByHolder(identity.fullDID) : [];
  const validVC = credentials.find((vc) => new Date(vc.expirationDate) > new Date());
  steps.push({
    label: 'Credential Verified',
    passed: !!validVC,
    detail: validVC
      ? `${validVC.type[1]} — Issued by BEL, expires ${validVC.expirationDate.split('T')[0]}`
      : 'No valid credential found for this DID',
  });

  // Step 3: Permission check
  const rolePermissions: Record<string, string[]> = {
    Administrator: ['Manage Identities', 'Assign Roles', 'Manage Assets (NFTs)', 'Smart Contracts', 'View Audit Trail', 'System Settings', 'Export Reports'],
    Manager: ['Manage Identities', 'Assign Roles', 'Manage Assets (NFTs)', 'View Audit Trail', 'Export Reports'],
    Engineer: ['Manage Assets (NFTs)', 'Smart Contracts', 'View Audit Trail'],
    Auditor: ['View Audit Trail', 'Export Reports'],
    User: [],
  };
  const role = identity?.role ?? 'User';
  const allowed_perms = rolePermissions[role] ?? [];
  const hasPermission =
    steps[0].passed && steps[1].passed && allowed_perms.includes(params.resource);

  steps.push({
    label: 'Permission Granted',
    passed: hasPermission,
    detail: hasPermission
      ? `Role "${role}" has "${params.resource}" permission`
      : `Role "${role}" does not have "${params.resource}" permission`,
  });

  const allowed = steps.every((s) => s.passed);

  // Record on blockchain
  const event = await recordBlockchainEvent({
    eventType: allowed ? 'ACCESS_GRANTED' : 'ACCESS_DENIED',
    actorDID: identity?.fullDID ?? params.did,
    walletAddress: identity?.walletAddress ?? '',
    details: {
      resource: params.resource,
      action: params.action,
      role,
      credentialVerified: validVC?.type[1] ?? 'None',
    },
    verificationResult: allowed ? 'SUCCESS' : 'FAILURE',
  });

  return {
    allowed,
    did: params.did,
    resource: params.resource,
    action: params.action,
    steps,
    txHash: event.txHash,
  };
}
