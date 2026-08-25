import { ethers } from 'ethers';

export interface BlockchainEvent {
  id: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  eventType:
    | 'DID_CREATED'
    | 'DID_VERIFIED'
    | 'DID_DEACTIVATED'
    | 'DID_VERIFICATION_SUCCESS'
    | 'DID_VERIFICATION_FAILED'
    | 'VC_ISSUED'
    | 'VC_VERIFIED'
    | 'VC_REVOKED'
    | 'ACCESS_GRANTED'
    | 'ACCESS_DENIED'
    | 'WALLET_CONNECTED'
    | 'EMPLOYEE_LOGIN';
  actorDID: string;
  walletAddress: string;
  details: Record<string, string>;
  verificationResult?: 'SUCCESS' | 'FAILURE';
  network: string;
}

const STORAGE_KEY = 'bel_blockchain_events';
const NETWORK = import.meta.env.VITE_BLOCKCHAIN_NETWORK ?? 'testnet';

let _mockBlockNumber = 2_350_000 + Math.floor(Math.random() * 1000);

/** Generate a realistic-looking Ethereum transaction hash */
function generateMockTxHash(): string {
  return `0x${ethers.id(Date.now().toString() + Math.random().toString()).slice(2)}`;
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function loadEvents(): BlockchainEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: BlockchainEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // localStorage not available
  }
}

/**
 * Records a blockchain event to the mock ledger.
 * In production, this would submit a real transaction to an Ethereum testnet
 * via ethers.js + a deployed DID Registry contract.
 */
export async function recordBlockchainEvent(params: {
  eventType: BlockchainEvent['eventType'];
  actorDID: string;
  walletAddress: string;
  details: Record<string, string>;
  verificationResult?: 'SUCCESS' | 'FAILURE';
}): Promise<BlockchainEvent> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 400 + 100));

  _mockBlockNumber++;

  const event: BlockchainEvent = {
    id: generateEventId(),
    txHash: generateMockTxHash(),
    blockNumber: _mockBlockNumber,
    timestamp: new Date().toISOString(),
    network: NETWORK,
    eventType: params.eventType,
    actorDID: params.actorDID,
    walletAddress: params.walletAddress,
    details: params.details,
    verificationResult: params.verificationResult,
  };

  const events = loadEvents();
  events.unshift(event); // newest first
  saveEvents(events.slice(0, 500)); // cap at 500 events

  return event;
}

/** Get all recorded blockchain events */
export function getBlockchainEvents(): BlockchainEvent[] {
  return loadEvents();
}

/** Get events for a specific DID */
export function getEventsByDID(did: string): BlockchainEvent[] {
  return loadEvents().filter((e) => e.actorDID === did || e.details.holderDID === did);
}

/** Seed initial events for demo data */
export function seedBlockchainEventsIfEmpty(seedEvents: BlockchainEvent[]): void {
  const existing = loadEvents();
  if (existing.length === 0) {
    saveEvents(seedEvents);
  }
}

/** Format event type to human-readable label */
export function formatEventType(eventType: BlockchainEvent['eventType']): string {
  const labels: Record<BlockchainEvent['eventType'], string> = {
    DID_CREATED: 'DID Created',
    DID_VERIFIED: 'DID Verified',
    DID_DEACTIVATED: 'DID Deactivated',
    DID_VERIFICATION_SUCCESS: 'DID Verification Success',
    DID_VERIFICATION_FAILED: 'DID Verification Failed',
    VC_ISSUED: 'Credential Issued',
    VC_VERIFIED: 'Credential Verified',
    VC_REVOKED: 'Credential Revoked',
    ACCESS_GRANTED: 'Access Granted',
    ACCESS_DENIED: 'Access Denied',
    WALLET_CONNECTED: 'Wallet Connected',
    EMPLOYEE_LOGIN: 'Employee Login',
  };
  return labels[eventType] ?? eventType;
}
