import { ethers } from 'ethers';
import { getBlockchainEvents, formatEventType, type BlockchainEvent } from './blockchainLayer';
import { getAllDIDIdentities } from '../../services/did';
import type { AuditLogEvent } from '../../data/auditData';
import type { Transaction } from '../../services/transactions';

/**
 * Maps mock-ledger DID/blockchain events into the existing Audit Trail
 * and Transactions data models so all modules share one source of truth.
 */

function timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

function formatTimestamp(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
}

function resolveActor(did: string): { name: string; role: string } {
    const identity = getAllDIDIdentities().find(i => i.fullDID === did || i.did === did);
    if (identity) return { name: identity.name, role: identity.role };
    if (did.includes('Issuer')) return { name: 'BEL Trust Platform', role: 'Issuer' };
    return { name: `${did.slice(0, 18)}…`, role: 'External DID' };
}

function resourceInfo(evt: BlockchainEvent): { name: string; type: string; id: string } {
    switch (evt.eventType) {
        case 'DID_CREATED':
            return { name: evt.details.name ?? 'New DID', type: 'Identity', id: evt.actorDID };
        case 'DID_VERIFIED':
            return { name: 'DID Verification', type: 'Identity', id: evt.details.did ?? evt.actorDID };
        case 'VC_ISSUED':
            return { name: evt.details.credentialType ?? 'Credential', type: 'Credential', id: evt.details.vcId ?? 'vc' };
        case 'VC_VERIFIED':
            return { name: 'Credential Verification', type: 'Credential', id: evt.details.vcId ?? 'vc' };
        case 'VC_REVOKED':
            return { name: 'Credential Revocation', type: 'Credential', id: evt.details.vcId ?? 'vc' };
        case 'ACCESS_GRANTED':
        case 'ACCESS_DENIED':
            return { name: evt.details.resource ?? 'Platform Resource', type: 'Access Control', id: evt.details.resource ?? 'resource' };
        case 'WALLET_CONNECTED':
            return { name: 'Wallet Session', type: 'Wallet', id: evt.walletAddress };
        default:
            return { name: formatEventType(evt.eventType), type: 'System', id: evt.id };
    }
}

/* ------------------------------ Audit Trail ------------------------------- */

export function mapBlockchainEventToAudit(evt: BlockchainEvent, index: number): AuditLogEvent {
    const actor = resolveActor(evt.actorDID);
    const resource = resourceInfo(evt);

    return {
        id: `EVT-${String(900000 + index).padStart(6, '0')}`,
        eventNumber: 900000 + index,
        actor: {
            name: actor.name,
            role: actor.role,
            address: evt.walletAddress,
            ip: '10.20.0.1',
            device: 'BEL DID Ledger',
            avatarBg: 'bg-indigo-100 text-indigo-700',
            avatarText: actor.name.slice(0, 2).toUpperCase(),
        },
        action: formatEventType(evt.eventType),
        eventType: formatEventType(evt.eventType),
        resource,
        network: 'BEL Testnet',
        timestamp: formatTimestamp(evt.timestamp),
        timeAgo: timeAgo(evt.timestamp),
        status: evt.verificationResult === 'FAILURE' ? 'Failed' : 'Success',
        txHash: evt.txHash,
        integrity: {
            verified: evt.verificationResult !== 'FAILURE',
            blockNumber: `#${evt.blockNumber}`,
            gasUsed: '~21,000 gas (mock)',
            txHash: evt.txHash,
            prevEventHash: `0x${ethers.id(evt.id + '-prev').slice(2)}`,
            currEventHash: `0x${ethers.id(evt.id + '-curr').slice(2)}`,
            algorithm: 'Keccak-256 (EVM Compatible)',
            network: 'BEL Testnet',
        },
        metadata: { ...evt.details },
    };
}

/** All DID/blockchain events as AuditLogEvents, newest first. */
export function getDIDAuditEvents(): AuditLogEvent[] {
    return getBlockchainEvents()
        .map((evt, idx) => mapBlockchainEventToAudit(evt, idx))
        .sort((a, b) => new Date(b.timestamp.replace(' UTC', '')).getTime() - new Date(a.timestamp.replace(' UTC', '')).getTime());
}

/* ------------------------------- Transactions ------------------------------ */

const TX_TYPE_MAP: Record<BlockchainEvent['eventType'], Transaction['type']> = {
    DID_CREATED: 'Mint',
    DID_VERIFIED: 'Contract Call',
    VC_ISSUED: 'Mint',
    VC_VERIFIED: 'Contract Call',
    VC_REVOKED: 'Burn',
    ACCESS_GRANTED: 'Contract Call',
    ACCESS_DENIED: 'Contract Call',
    WALLET_CONNECTED: 'Contract Call',
};

const ASSET_MAP: Record<string, string> = {
    Identity: 'DID',
    Credential: 'VC',
    'Access Control': 'ACCESS',
    Wallet: 'WALLET',
    System: 'SYS',
};

export function mapBlockchainEventToTransaction(evt: BlockchainEvent): Transaction {
    const resource = resourceInfo(evt);

    return {
        hash: evt.txHash,
        date: evt.timestamp,
        type: TX_TYPE_MAP[evt.eventType],
        asset: ASSET_MAP[resource.type] ?? 'DID',
        network: 'BEL Testnet',
        from: evt.walletAddress,
        to: evt.details.holderDID ?? evt.actorDID,
        amount: 0,
        fee: 0.00021,
        status: evt.verificationResult === 'FAILURE' ? 'Failed' : 'Success',
        usdValue: 0,
        blockNumber: evt.blockNumber,
        explorerLink: '#',
        memo: `${formatEventType(evt.eventType)} — ${resource.name}`,
        confirmations: 64,
    };
}

/** All DID/blockchain events as Transactions, newest first. */
export function getDIDTransactions(): Transaction[] {
    return getBlockchainEvents()
        .map(mapBlockchainEventToTransaction)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}