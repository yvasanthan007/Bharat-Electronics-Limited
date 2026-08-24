import { ethers } from 'ethers';

export interface DIDDocument {
  '@context': string[];
  id: string;
  controller: string;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod: string[];
  created: string;
  updated: string;
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyHex: string;
  blockchainAccountId: string;
}

export interface GeneratedDID {
  did: string;
  walletAddress: string;
  publicKey: string;
  didDocument: DIDDocument;
  // privateKey returned ONLY during generation — caller must discard it
  _privateKeyForSigning: string;
}

/**
 * Generates a new did:ethr DID using a cryptographic Ethereum key pair.
 * The private key is embedded in _privateKeyForSigning — it must NOT be
 * persisted to any storage. Use it only within the same session to sign
 * the initial credential, then discard.
 */
export function generateDID(): GeneratedDID {
  const wallet = ethers.Wallet.createRandom();
  const address = wallet.address;
  const did = `did:ethr:${address}`;
  const now = new Date().toISOString();

  const verificationMethod: VerificationMethod = {
    id: `${did}#controller`,
    type: 'EcdsaSecp256k1RecoveryMethod2020',
    controller: did,
    publicKeyHex: wallet.publicKey,
    blockchainAccountId: `eip155:1:${address}`,
  };

  const didDocument: DIDDocument = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/secp256k1-2019/v1',
    ],
    id: did,
    controller: did,
    verificationMethod: [verificationMethod],
    authentication: [`${did}#controller`],
    assertionMethod: [`${did}#controller`],
    created: now,
    updated: now,
  };

  return {
    did,
    walletAddress: address,
    publicKey: wallet.publicKey,
    didDocument,
    _privateKeyForSigning: wallet.privateKey,
  };
}

/**
 * Resolves a DID to its stored DID Document.
 * In production, this would query a DID Registry contract or a resolver.
 * Here it reconstructs the document from stored data.
 */
export function resolveDIDDocument(
  did: string,
  publicKey: string,
  walletAddress: string,
  createdAt: string
): DIDDocument {
  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/secp256k1-2019/v1',
    ],
    id: did,
    controller: did,
    verificationMethod: [
      {
        id: `${did}#controller`,
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: did,
        publicKeyHex: publicKey,
        blockchainAccountId: `eip155:1:${walletAddress}`,
      },
    ],
    authentication: [`${did}#controller`],
    assertionMethod: [`${did}#controller`],
    created: createdAt,
    updated: createdAt,
  };
}

/**
 * Signs a message with a private key.
 * ONLY called transiently — the private key is never stored by this function.
 */
export async function signWithDID(
  message: string,
  privateKey: string
): Promise<string> {
  const wallet = new ethers.Wallet(privateKey);
  return await wallet.signMessage(message);
}

/**
 * Verifies that a signature was produced by the DID's controlling key.
 * Returns true if the recovered address matches the DID's wallet address.
 */
export function verifyDIDSignature(
  message: string,
  signature: string,
  expectedWalletAddress: string
): boolean {
  try {
    const recovered = ethers.verifyMessage(message, signature);
    return recovered.toLowerCase() === expectedWalletAddress.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Truncates a DID or address for display purposes.
 */
export function truncateDID(did: string, chars = 8): string {
  if (did.length <= chars * 2 + 3) return did;
  const prefix = did.startsWith('did:ethr:') ? 'did:ethr:' : '';
  const addr = did.replace('did:ethr:', '');
  return `${prefix}${addr.substring(0, chars)}...${addr.substring(addr.length - 4)}`;
}
