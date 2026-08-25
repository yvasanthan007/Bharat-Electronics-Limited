import { createMockVC } from '../lib/did/vcEngine';
import type { VerifiableCredential } from '../lib/did/vcEngine';
import type { BlockchainEvent } from '../lib/did/blockchainLayer';
import type { Identity } from './mockData';

// BEL's own issuer DID and wallet (used to sign all employee credentials)
export const BEL_ISSUER_DID = 'did:ethr:0xBEL0000IssuerDID000000000000000000000001';
export const BEL_ISSUER_WALLET = '0xBEL0000IssuerDID000000000000000000000001';

export interface DIDIdentity extends Identity {
  walletAddress: string;
  publicKey: string;
  fullDID: string; // full un-truncated DID
  createdAt: string;
  verifiedAt?: string;
}

// Extended identity data with wallet and public key info
export const mockDIDIdentities: DIDIdentity[] = [
  {
    id: '1',
    name: 'Rahul Verma',
    did: 'did:ethr:0x7f82...a3b9',
    fullDID: 'did:ethr:0x7f8234aB1C2D3e4F5a6B7c8D9e0F1a2B3c4D5e6Fa3b9',
    walletAddress: '0x7f8234aB1C2D3e4F5a6B7c8D9e0F1a2B3c4D5e6Fa3b9',
    publicKey: '0x04a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    role: 'Administrator',
    department: 'IT Security',
    status: 'Verified',
    createdOn: '2026-01-15',
    createdAt: '2026-01-15T09:00:00.000Z',
    verifiedAt: '2026-01-15T09:05:22.000Z',
    lastActive: '2 min ago',
  },
  {
    id: '2',
    name: 'Neha Gupta',
    did: 'did:ethr:0x3c91...b7d2',
    fullDID: 'did:ethr:0x3c91aF2B4C6D8E0A2C4E6F8A0C2E4F6A8C0E2F4b7d2',
    walletAddress: '0x3c91aF2B4C6D8E0A2C4E6F8A0C2E4F6A8C0E2F4b7d2',
    publicKey: '0x04b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d3',
    role: 'Manager',
    department: 'Operations',
    status: 'Verified',
    createdOn: '2026-02-10',
    createdAt: '2026-02-10T10:30:00.000Z',
    verifiedAt: '2026-02-10T10:35:14.000Z',
    lastActive: '1 hr ago',
  },
  {
    id: '3',
    name: 'Amit Kumar',
    did: 'did:ethr:0x9a11...c4f8',
    fullDID: 'did:ethr:0x9a11bC3D5E7F9A1B3C5D7E9F1A3B5C7D9E1F3A5c4f8',
    walletAddress: '0x9a11bC3D5E7F9A1B3C5D7E9F1A3B5C7D9E1F3A5c4f8',
    publicKey: '0x04c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d4',
    role: 'Engineer',
    department: 'R&D',
    status: 'Verified',
    createdOn: '2026-03-22',
    createdAt: '2026-03-22T14:00:00.000Z',
    verifiedAt: '2026-03-22T14:04:55.000Z',
    lastActive: '3 hrs ago',
  },
  {
    id: '4',
    name: 'Priya Singh',
    did: 'did:ethr:0x6d44...e1a2',
    fullDID: 'did:ethr:0x6d44cE5F7A9B1C3E5F7A9B1C3E5F7A9B1C3E5F7e1a2',
    walletAddress: '0x6d44cE5F7A9B1C3E5F7A9B1C3E5F7A9B1C3E5F7e1a2',
    publicKey: '0x04d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d5',
    role: 'Auditor',
    department: 'Audit',
    status: 'Verified',
    createdOn: '2026-04-05',
    createdAt: '2026-04-05T11:15:00.000Z',
    verifiedAt: '2026-04-05T11:19:38.000Z',
    lastActive: '1 day ago',
  },
  {
    id: '5',
    name: 'Ajay Sharma',
    did: 'did:ethr:0xf2b8...d9c1',
    fullDID: 'did:ethr:0xf2b8dF6A8B0C2D4F6A8B0C2D4F6A8B0C2D4F6A8d9c1',
    walletAddress: '0xf2b8dF6A8B0C2D4F6A8B0C2D4F6A8B0C2D4F6A8d9c1',
    publicKey: '0x04e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d6',
    role: 'User',
    department: 'Logistics',
    status: 'Pending',
    createdOn: '2026-08-20',
    createdAt: '2026-08-20T08:00:00.000Z',
    lastActive: 'Never',
  },
  {
    id: '6',
    name: 'Ravi Kishore',
    did: 'did:ethr:0xab31...e5f7',
    fullDID: 'did:ethr:0xab31eA7B9C1D3E5F7A9B1C3E5F7A9B1C3E5F7A9e5f7',
    walletAddress: '0xab31eA7B9C1D3E5F7A9B1C3E5F7A9B1C3E5F7A9e5f7',
    publicKey: '0x04f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d7',
    role: 'User',
    department: 'HR',
    status: 'Pending',
    createdOn: '2026-08-23',
    createdAt: '2026-08-23T16:00:00.000Z',
    lastActive: 'Never',
  },
];

// Mock Verifiable Credentials for seed data
export const mockVerifiableCredentials: VerifiableCredential[] = [
  createMockVC({
    id: 'vc:bel:2026-001',
    holderDID: mockDIDIdentities[0].fullDID,
    issuerDID: BEL_ISSUER_DID,
    credentialType: 'BELAdminCredential',
    subject: {
      role: 'Administrator',
      department: 'IT Security',
      employeeId: 'BEL001',
      name: 'Rahul Verma',
      permissions: ['Manage Identities', 'Assign Roles', 'Manage Assets (NFTs)', 'Smart Contracts', 'View Audit Trail', 'System Settings', 'Export Reports'],
    },
    issuanceDate: '2026-01-15T09:05:22.000Z',
    expirationDate: '2027-01-15T09:05:22.000Z',
  }),
  createMockVC({
    id: 'vc:bel:2026-002',
    holderDID: mockDIDIdentities[1].fullDID,
    issuerDID: BEL_ISSUER_DID,
    credentialType: 'BELManagerCredential',
    subject: {
      role: 'Manager',
      department: 'Operations',
      employeeId: 'BEL002',
      name: 'Neha Gupta',
      permissions: ['Manage Identities', 'Assign Roles', 'Manage Assets (NFTs)', 'View Audit Trail', 'Export Reports'],
    },
    issuanceDate: '2026-02-10T10:35:14.000Z',
    expirationDate: '2027-02-10T10:35:14.000Z',
  }),
  createMockVC({
    id: 'vc:bel:2026-003',
    holderDID: mockDIDIdentities[2].fullDID,
    issuerDID: BEL_ISSUER_DID,
    credentialType: 'BELEngineerCredential',
    subject: {
      role: 'Engineer',
      department: 'R&D',
      employeeId: 'BEL003',
      name: 'Amit Kumar',
      permissions: ['Manage Assets (NFTs)', 'Smart Contracts', 'View Audit Trail'],
    },
    issuanceDate: '2026-03-22T14:04:55.000Z',
    expirationDate: '2027-03-22T14:04:55.000Z',
  }),
  createMockVC({
    id: 'vc:bel:2026-004',
    holderDID: mockDIDIdentities[3].fullDID,
    issuerDID: BEL_ISSUER_DID,
    credentialType: 'BELAuditorCredential',
    subject: {
      role: 'Auditor',
      department: 'Audit',
      employeeId: 'BEL004',
      name: 'Priya Singh',
      permissions: ['View Audit Trail', 'Export Reports'],
    },
    issuanceDate: '2026-04-05T11:19:38.000Z',
    expirationDate: '2027-04-05T11:19:38.000Z',
  }),
];

// Seed blockchain events
export const mockBlockchainEvents: BlockchainEvent[] = [
  {
    id: 'evt_seed_1',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    blockNumber: 2350012,
    timestamp: '2026-01-15T09:05:22.000Z',
    network: 'testnet',
    eventType: 'DID_CREATED',
    actorDID: mockDIDIdentities[0].fullDID,
    walletAddress: mockDIDIdentities[0].walletAddress,
    details: { name: 'Rahul Verma', role: 'Administrator', department: 'IT Security' },
    verificationResult: 'SUCCESS',
  },
  {
    id: 'evt_seed_2',
    txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    blockNumber: 2350050,
    timestamp: '2026-01-15T09:10:00.000Z',
    network: 'testnet',
    eventType: 'VC_ISSUED',
    actorDID: BEL_ISSUER_DID,
    walletAddress: BEL_ISSUER_WALLET,
    details: { holderDID: mockDIDIdentities[0].fullDID, credentialType: 'BELAdminCredential', vcId: 'vc:bel:2026-001' },
    verificationResult: 'SUCCESS',
  },
  {
    id: 'evt_seed_3',
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    blockNumber: 2350078,
    timestamp: '2026-02-10T10:35:14.000Z',
    network: 'testnet',
    eventType: 'DID_CREATED',
    actorDID: mockDIDIdentities[1].fullDID,
    walletAddress: mockDIDIdentities[1].walletAddress,
    details: { name: 'Neha Gupta', role: 'Manager', department: 'Operations' },
    verificationResult: 'SUCCESS',
  },
  {
    id: 'evt_seed_4',
    txHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
    blockNumber: 2350210,
    timestamp: '2026-08-24T08:45:00.000Z',
    network: 'testnet',
    eventType: 'ACCESS_GRANTED',
    actorDID: mockDIDIdentities[0].fullDID,
    walletAddress: mockDIDIdentities[0].walletAddress,
    details: { resource: 'Smart Contracts', action: 'Deploy', credentialVerified: 'BELAdminCredential' },
    verificationResult: 'SUCCESS',
  },
  {
    id: 'evt_seed_5',
    txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    blockNumber: 2350215,
    timestamp: '2026-08-24T09:00:00.000Z',
    network: 'testnet',
    eventType: 'ACCESS_DENIED',
    actorDID: mockDIDIdentities[4].fullDID,
    walletAddress: mockDIDIdentities[4].walletAddress,
    details: { resource: 'System Settings', action: 'Modify', reason: 'Insufficient credential — pending DID' },
    verificationResult: 'FAILURE',
  },
];
