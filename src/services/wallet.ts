import { ethers } from 'ethers';
import { recordBlockchainEvent } from '../lib/did/blockchainLayer';

/**
 * Wallet service — connects browser wallets (MetaMask etc.) via EIP-1193.
 * Falls back to a clearly-labelled in-browser demo wallet when no provider
 * is available so the prototype flow always works end-to-end.
 *
 * SECURITY: private keys are NEVER persisted or exposed by this module.
 * Demo-mode keys stay in memory for the tab session only.
 */

const WALLET_SESSION_KEY = 'bel_wallet_session';
const WALLET_DID_LINK_KEY = 'bel_wallet_did_links';

export interface Eip1193Provider {
    request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
    on?(event: string, handler: (...args: any[]) => void): void;
    removeListener?(event: string, handler: (...args: any[]) => void): void;
    isMetaMask?: boolean;
}

declare global {
    interface Window {
        ethereum?: Eip1193Provider;
    }
}

export interface WalletSession {
    address: string;
    isDemo: boolean;
    connectedAt: string;
}

export class WalletRejectedError extends Error {
    constructor() {
        super('Connection request was rejected in the wallet.');
        this.name = 'WalletRejectedError';
    }
}

/* ---------------------------- session persistence --------------------------- */

function saveSession(session: WalletSession): void {
    try {
        localStorage.setItem(WALLET_SESSION_KEY, JSON.stringify(session));
    } catch {
        /* storage unavailable */
    }
}

function clearSession(): void {
    try {
        localStorage.removeItem(WALLET_SESSION_KEY);
    } catch {
        /* storage unavailable */
    }
}

export function getSavedSession(): WalletSession | null {
    try {
        const raw = localStorage.getItem(WALLET_SESSION_KEY);
        return raw ? (JSON.parse(raw) as WalletSession) : null;
    } catch {
        return null;
    }
}

/* -------------------------------- detection -------------------------------- */

export function hasBrowserWallet(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum;
}

/* ------------------------------- demo fallback ------------------------------ */

// In-memory demo wallet — never persisted, regenerated per tab session.
let _demoWallet: ethers.HDNodeWallet | null = null;

function getDemoWallet(): ethers.HDNodeWallet {
    if (!_demoWallet) _demoWallet = ethers.Wallet.createRandom();
    return _demoWallet;
}

/* --------------------------------- connect ---------------------------------- */

/**
 * Connects the user's wallet.
 * 1. If a browser provider (MetaMask) exists → eth_requestAccounts.
 * 2. Otherwise → generates an ephemeral demo wallet (clearly labelled).
 * Rejects with WalletRejectedError when the user denies the request.
 */
export async function connectWallet(): Promise<WalletSession> {
    const existing = getSavedSession();
    if (existing) return existing;

    if (hasBrowserWallet()) {
        try {
            const accounts = (await window.ethereum!.request({
                method: 'eth_requestAccounts',
            })) as string[];

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts returned by wallet.');
            }

            const session: WalletSession = {
                address: ethers.getAddress(accounts[0]),
                isDemo: false,
                connectedAt: new Date().toISOString(),
            };
            saveSession(session);
            await recordWalletConnectedEvent(session);
            return session;
        } catch (err: any) {
            // MetaMask rejection code
            if (err?.code === 4001 || err?.message?.includes('User rejected')) {
                throw new WalletRejectedError();
            }
            throw new Error(err?.message ?? 'Failed to connect wallet.');
        }
    }

    // No injected provider — safe demo fallback for the prototype
    const wallet = getDemoWallet();
    const session: WalletSession = {
        address: wallet.address,
        isDemo: true,
        connectedAt: new Date().toISOString(),
    };
    saveSession(session);
    await recordWalletConnectedEvent(session);
    return session;
}

/** Disconnects the app session (browser wallets cannot be force-disconnected). */
export function disconnectWallet(): void {
    clearSession();
}

async function recordWalletConnectedEvent(session: WalletSession): Promise<void> {
    try {
        await recordBlockchainEvent({
            eventType: 'WALLET_CONNECTED',
            actorDID: getLinkedDID(session.address) ?? `did:ethr:${session.address}`,
            walletAddress: session.address,
            details: {
                mode: session.isDemo ? 'demo-wallet' : 'browser-wallet',
                network: import.meta.env.VITE_BLOCKCHAIN_NETWORK ?? 'testnet',
            },
            verificationResult: 'SUCCESS',
        });
    } catch {
        /* event recording must never block connection */
    }
}

/* ----------------------------- wallet ↔ DID link ---------------------------- */

interface WalletDIDLinks {
    [walletAddress: string]: string; // address → full DID
}

function loadLinks(): WalletDIDLinks {
    try {
        const raw = localStorage.getItem(WALLET_DID_LINK_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveLinks(links: WalletDIDLinks): void {
    try {
        localStorage.setItem(WALLET_DID_LINK_KEY, JSON.stringify(links));
    } catch {
        /* storage unavailable */
    }
}

/** Associates a wallet address with a DID (wallet ↔ DID binding). */
export function associateWalletWithDID(walletAddress: string, did: string): void {
    const links = loadLinks();
    links[walletAddress.toLowerCase()] = did;
    saveLinks(links);
}

/** Returns the DID linked to a wallet address, if any. */
export function getLinkedDID(walletAddress: string): string | undefined {
    return loadLinks()[walletAddress.toLowerCase()];
}

/* ------------------------------ provider events ----------------------------- */

/**
 * Subscribes to wallet account changes. Returns an unsubscribe function.
 * When the user switches accounts the callback receives the new address;
 * when they lock/disconnect the wallet the callback receives null.
 */
export function subscribeToAccountChanges(
    callback: (address: string | null) => void
): () => void {
    if (!hasBrowserWallet() || !window.ethereum!.on) return () => { };

    const handler = (accounts: string[]) => {
        if (!accounts || accounts.length === 0) {
            clearSession();
            callback(null);
        } else {
            const session: WalletSession = {
                address: ethers.getAddress(accounts[0]),
                isDemo: false,
                connectedAt: new Date().toISOString(),
            };
            saveSession(session);
            callback(session.address);
        }
    };

    window.ethereum!.on('accountsChanged', handler);
    return () => window.ethereum!.removeListener?.('accountsChanged', handler);
}