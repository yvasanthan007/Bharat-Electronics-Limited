import { ethers } from 'ethers';
import { signWithDID, verifyDIDSignature } from './didEngine';

export type CredentialType =
  | 'BELEmployeeCredential'
  | 'BELAdminCredential'
  | 'BELEngineerCredential'
  | 'BELAuditorCredential'
  | 'BELManagerCredential';

export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate: string;
  credentialSubject: CredentialSubject;
  proof: CredentialProof;
}

export interface CredentialSubject {
  id: string; // holder DID
  role: string;
  department: string;
  employeeId: string;
  name: string;
  permissions?: string[];
}

export interface CredentialProof {
  type: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  jws: string; // ethers signature hex
}

export interface IssueCredentialParams {
  holderDID: string;
  issuerDID: string;
  issuerWalletAddress: string;
  issuerPrivateKey: string; // only kept in memory transiently
  credentialType: CredentialType;
  subject: Omit<CredentialSubject, 'id'>;
  expiryMonths?: number;
}

function generateVCId(): string {
  return `vc:bel:${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Issues a W3C-compliant Verifiable Credential.
 * The issuer's private key is used only to sign the credential payload and
 * is NOT stored anywhere in the returned object.
 */
export async function issueVerifiableCredential(
  params: IssueCredentialParams
): Promise<VerifiableCredential> {
  const now = new Date();
  const expiry = new Date(now);
  expiry.setMonth(expiry.getMonth() + (params.expiryMonths ?? 12));

  const vcId = generateVCId();
  const issuanceDate = now.toISOString();
  const expirationDate = expiry.toISOString();

  const credentialSubject: CredentialSubject = {
    id: params.holderDID,
    ...params.subject,
  };

  // Build the payload to sign (a canonical string representation)
  const payload = JSON.stringify({
    id: vcId,
    issuer: params.issuerDID,
    issuanceDate,
    expirationDate,
    credentialSubject,
  });

  const jws = await signWithDID(payload, params.issuerPrivateKey);

  const vc: VerifiableCredential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/suites/secp256k1-2019/v1',
    ],
    id: vcId,
    type: ['VerifiableCredential', params.credentialType],
    issuer: params.issuerDID,
    issuanceDate,
    expirationDate,
    credentialSubject,
    proof: {
      type: 'EcdsaSecp256k1Signature2019',
      created: issuanceDate,
      verificationMethod: `${params.issuerDID}#controller`,
      proofPurpose: 'assertionMethod',
      jws,
    },
  };

  return vc;
}

export interface VerificationResult {
  valid: boolean;
  checks: {
    signatureValid: boolean;
    notExpired: boolean;
    issuerResolved: boolean;
    subjectMatches: boolean;
  };
  error?: string;
}

/**
 * Verifies a Verifiable Credential by:
 * 1. Reconstructing the signed payload
 * 2. Recovering the signer address from the JWS signature
 * 3. Checking it matches the issuer's wallet address
 * 4. Checking expiry
 */
export function verifyVerifiableCredential(
  vc: VerifiableCredential,
  issuerWalletAddress: string
): VerificationResult {
  const checks = {
    signatureValid: false,
    notExpired: false,
    issuerResolved: true,
    subjectMatches: true,
  };

  try {
    // Reconstruct the canonical payload
    const payload = buildVCPayload({
      id: vc.id,
      issuer: vc.issuer,
      issuanceDate: vc.issuanceDate,
      expirationDate: vc.expirationDate,
      credentialSubject: vc.credentialSubject,
    });

    checks.signatureValid = verifyDIDSignature(
      payload,
      vc.proof.jws,
      issuerWalletAddress
    );
    checks.notExpired = new Date(vc.expirationDate) > new Date();
    checks.subjectMatches = vc.credentialSubject.id === vc.credentialSubject.id;

    return {
      valid: checks.signatureValid && checks.notExpired,
      checks,
    };
  } catch (e: any) {
    return {
      valid: false,
      checks,
      error: e.message,
    };
  }
}

/* ------------------------- Deterministic demo issuer ------------------------ */

/**
 * Derives a deterministic secp256k1 key for the prototype's demo issuer from
 * the credential ID. This lets every mock/demo credential carry a REAL,
 * cryptographically verifiable ECDSA signature without persisting any secret:
 * both signer and verifier can re-derive the same key from the public VC id.
 *
 * SECURITY: this scheme is for the local prototype/mock layer ONLY.
 * Production issuers must sign with keys held in a KMS/HSM.
 */
export function demoIssuerKeyFor(vcId: string): string {
  return ethers.id(`bel-demo-issuer:${vcId}`);
}

/** The wallet address of the deterministic demo issuer for a given VC id. */
export function demoIssuerAddressFor(vcId: string): string {
  return new ethers.Wallet(demoIssuerKeyFor(vcId)).address;
}

function buildVCPayload(p: {
  id: string;
  issuer: string;
  issuanceDate: string;
  expirationDate: string;
  credentialSubject: CredentialSubject;
}): string {
  return JSON.stringify({
    id: p.id,
    issuer: p.issuer,
    issuanceDate: p.issuanceDate,
    expirationDate: p.expirationDate,
    credentialSubject: p.credentialSubject,
  });
}

/**
 * Creates a demo VC for seed identities / offline issuance.
 * Signs the canonical payload with the deterministic demo issuer key so the
 * resulting JWS passes full cryptographic verification (see verifyCredential).
 */
export function createMockVC(params: {
  id: string;
  holderDID: string;
  issuerDID: string;
  credentialType: CredentialType;
  subject: Omit<CredentialSubject, 'id'>;
  issuanceDate: string;
  expirationDate: string;
}): VerifiableCredential {
  const credentialSubject: CredentialSubject = {
    id: params.holderDID,
    ...params.subject,
  };

  const payload = buildVCPayload({
    id: params.id,
    issuer: params.issuerDID,
    issuanceDate: params.issuanceDate,
    expirationDate: params.expirationDate,
    credentialSubject,
  });

  // Synchronous equivalent of new ethers.Wallet(key).signMessage(payload)
  const signingKey = new ethers.SigningKey(demoIssuerKeyFor(params.id));
  const signature = signingKey.sign(ethers.hashMessage(payload));

  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/suites/secp256k1-2019/v1',
    ],
    id: params.id,
    type: ['VerifiableCredential', params.credentialType],
    issuer: params.issuerDID,
    issuanceDate: params.issuanceDate,
    expirationDate: params.expirationDate,
    credentialSubject,
    proof: {
      type: 'EcdsaSecp256k1Signature2019',
      created: params.issuanceDate,
      verificationMethod: `${params.issuerDID}#controller`,
      proofPurpose: 'assertionMethod',
      jws: signature.serialized,
    },
  };
}
