import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { createAuditLog } from '../auditService';
import { isNftContractConfigured } from '../../config/blockchain';
import { ownerOfTokenId } from './nftContract';

/**
 * BEL asset registry — Firestore `assets/{assetId}`.
 *
 * Firestore stores APPLICATION METADATA and blockchain REFERENCES only.
 * The blockchain (ownerOf on the ERC-721 contract) is the AUTHORITATIVE
 * source of NFT ownership — never the ownerWallet field stored here.
 *
 * Structure per asset (adapted to the existing Firestore-first conventions):
 *   assets/BEL-LAP-001 = {
 *     assetId, assetType, description?,
 *     tokenId, contractAddress, blockchainNetwork,
 *     ownerWallet, ownerDID, ownerEmployeeId, ownerName,
 *     status: 'Created' | 'Active' | 'Revoked',
 *     mintTxHash, lastTransferTxHash, burnTxHash,
 *     createdBy, createdAt, updatedAt, history[]
 *   }
 */

const ASSETS_COLLECTION = 'assets';

export type BelAssetStatus = 'Created' | 'Active' | 'Revoked';

export interface BelAssetHistoryEntry {
  action: string;
  txHash?: string;
  from?: string;
  to?: string;
  at: string;
  by?: string;
}

export interface BelAsset {
  assetId: string;
  assetType: string;
  description?: string;
  tokenId?: number;
  contractAddress?: string;
  blockchainNetwork?: string;
  /** Display cache only — blockchain ownerOf() is authoritative. */
  ownerWallet?: string;
  ownerDID?: string;
  ownerEmployeeId?: string;
  ownerName?: string;
  status: BelAssetStatus;
  mintTxHash?: string;
  mintAt?: string;
  lastTransferTxHash?: string;
  burnTxHash?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  history?: BelAssetHistoryEntry[];
}

export interface NftOwnershipResult {
  tokenId?: number;
  /** True ONLY when ownerOf(tokenId) == expected wallet on the live chain. */
  verified: boolean;
  onChainOwner?: string;
  checkedAt: string;
  reason?:
    | 'NOT_MINTED'
    | 'REVOKED'
    | 'CONTRACT_NOT_CONFIGURED'
    | 'RPC_ERROR'
    | 'OWNER_MISMATCH'
    | 'NO_WALLET_TO_COMPARE';
  error?: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Full audit actor (matches the existing AuditLogEvent['actor'] shape). */
function auditActor(name: string, wallet?: string) {
  const initials = (name || 'BEL Admin')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return {
    name: name || 'BEL Admin',
    role: 'Administrator',
    address: wallet || '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
    ip: '—',
    device: 'BEL Asset Management (browser)',
    avatarBg: 'bg-blue-100 text-blue-700',
    avatarText: initials || 'BA',
  };
}

/* ------------------------------- CRUD ------------------------------------- */

/** Creates the asset record (pre-mint). Rejects duplicate assetIds. */
export async function createAssetRecord(input: {
  assetId: string;
  assetType: string;
  description?: string;
  createdBy?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const assetId = input.assetId.trim();
  if (!assetId) return { ok: false, error: 'Asset ID is required.' };
  if (!input.assetType.trim()) return { ok: false, error: 'Asset type is required.' };

  const ref = doc(db, ASSETS_COLLECTION, assetId);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    return { ok: false, error: `Asset "${assetId}" already exists in the registry.` };
  }

  const record: BelAsset = {
    assetId,
    assetType: input.assetType.trim(),
    description: input.description?.trim() || undefined,
    status: 'Created',
    createdBy: input.createdBy || undefined,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    history: [{ action: 'Asset Created', at: nowIso(), by: input.createdBy || 'Admin' }],
  };

  await setDoc(ref, record);

  try {
    await createAuditLog({
      action: `Asset ${assetId} created (pre-mint)`,
      eventType: 'Asset Created',
      actor: auditActor(input.createdBy || 'BEL Admin'),
      resource: { name: assetId, type: 'BEL Asset', id: assetId },
      network: 'BEL Testnet',
      status: 'Success',
      metadata: { assetType: record.assetType, stage: 'created' },
    });
  } catch {
    /* audit failures never block the flow */
  }

  return { ok: true };
}

/** All assets in the registry (newest first). */
export async function listAssets(): Promise<BelAsset[]> {
  try {
    const snap = await getDocs(collection(db, ASSETS_COLLECTION));
    const assets = snap.docs.map((d) => d.data() as BelAsset);
    assets.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return assets;
  } catch (err) {
    console.warn('[assetRegistry] listAssets failed:', err);
    return [];
  }
}

export async function getAssetRecord(assetId: string): Promise<BelAsset | null> {
  try {
    const snap = await getDoc(doc(db, ASSETS_COLLECTION, assetId));
    return snap.exists() ? (snap.data() as BelAsset) : null;
  } catch (err) {
    console.warn('[assetRegistry] getAssetRecord failed:', err);
    return null;
  }
}

/**
 * Assets whose NFT is (per Firestore reference) assigned to this wallet/DID.
 * Two equality queries merged client-side (no composite index needed).
 */
export async function getAssetsForWallet(
  wallet?: string | null,
  did?: string | null
): Promise<BelAsset[]> {
  const results = new Map<string, BelAsset>();
  try {
    if (wallet) {
      const q = query(
        collection(db, ASSETS_COLLECTION),
        where('ownerWallet', '==', wallet.trim().toLowerCase())
      );
      const snap = await getDocs(q);
      snap.docs.forEach((d) => results.set(d.id, d.data() as BelAsset));
    }
    if (did) {
      const q = query(collection(db, ASSETS_COLLECTION), where('ownerDID', '==', did.trim()));
      const snap = await getDocs(q);
      snap.docs.forEach((d) => results.set(d.id, d.data() as BelAsset));
    }
  } catch (err) {
    console.warn('[assetRegistry] getAssetsForWallet failed:', err);
  }
  const assets = [...results.values()];
  assets.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return assets;
}

/* --------------------------- blockchain result sync ------------------------ */

function appendHistory(
  current: BelAsset | null,
  entry: BelAssetHistoryEntry
): BelAssetHistoryEntry[] {
  const history = current?.history ? [...current.history] : [];
  history.push(entry);
  return history.slice(-25);
}

/**
 * Called ONLY after the mint transaction is confirmed on-chain.
 * Stores the tokenId / tx hash / contract reference and marks the asset Active.
 */
export async function applyMintedRecord(
  assetId: string,
  params: {
    tokenId: number;
    txHash: string;
    blockNumber?: number;
    adminName?: string;
    adminWallet?: string;
  }
): Promise<void> {
  const ref = doc(db, ASSETS_COLLECTION, assetId);
  const snap = await getDoc(ref);
  const current = snap.exists() ? (snap.data() as BelAsset) : null;

  await updateDoc(ref, {
    tokenId: params.tokenId,
    contractAddress: isNftContractConfigured()
      ? (import.meta.env.VITE_NFT_CONTRACT_ADDRESS as string).trim()
      : '',
    blockchainNetwork: (import.meta.env.VITE_NFT_NETWORK_NAME as string) || 'Polygon Amoy',
    status: 'Active',
    mintTxHash: params.txHash,
    mintAt: nowIso(),
    updatedAt: nowIso(),
    history: appendHistory(current, {
      action: `NFT Minted (token #${params.tokenId})`,
      txHash: params.txHash,
      at: nowIso(),
      by: params.adminName || 'Admin',
    }),
  });

  try {
    await createAuditLog({
      action: `Asset NFT #${params.tokenId} minted for ${assetId}`,
      eventType: 'Asset Minted',
      actor: auditActor(params.adminName || 'BEL Admin', params.adminWallet),
      resource: { name: assetId, type: 'BEL Asset NFT', id: `NFT-${params.tokenId}` },
      network: 'Polygon',
      status: 'Success',
      txHash: params.txHash,
      metadata: { tokenId: params.tokenId, blockNumber: params.blockNumber, assetId },
    });
  } catch {
    /* best effort */
  }
}

/**
 * Called ONLY after the assignment/transfer transaction is confirmed on-chain.
 * Updates the Firestore owner reference (blockchain remains source of truth).
 */
export async function applyAssignmentRecord(
  assetId: string,
  params: {
    toWallet: string;
    toDID?: string;
    toEmployeeId?: string;
    toName?: string;
    txHash: string;
    action?: 'Assigned' | 'Transferred';
    fromWallet?: string;
    adminName?: string;
  }
): Promise<void> {
  const action = params.action || 'Assigned';
  const ref = doc(db, ASSETS_COLLECTION, assetId);
  const snap = await getDoc(ref);
  const current = snap.exists() ? (snap.data() as BelAsset) : null;

  await updateDoc(ref, {
    ownerWallet: params.toWallet.trim().toLowerCase(),
    ownerDID: params.toDID || '',
    ownerEmployeeId: params.toEmployeeId || '',
    ownerName: params.toName || '',
    lastTransferTxHash: params.txHash,
    status: 'Active',
    updatedAt: nowIso(),
    history: appendHistory(current, {
      action: `NFT ${action}`,
      txHash: params.txHash,
      from: params.fromWallet,
      to: params.toWallet,
      at: nowIso(),
      by: params.adminName || 'Admin',
    }),
  });

  try {
    await createAuditLog({
      action: `Asset NFT ${action.toLowerCase()} — ${assetId}`,
      eventType: action === 'Assigned' ? 'Asset Assigned' : 'Asset Transferred',
      actor: auditActor(params.adminName || 'BEL Admin'),
      resource: { name: assetId, type: 'BEL Asset NFT', id: assetId },
      network: 'Polygon',
      status: 'Success',
      txHash: params.txHash,
      metadata: {
        toWallet: params.toWallet,
        toEmployeeId: params.toEmployeeId,
        toDID: params.toDID,
      },
    });
  } catch {
    /* best effort */
  }
}

/** Called ONLY after the burn/revoke transaction is confirmed on-chain. */
export async function applyBurnRecord(
  assetId: string,
  params: { txHash: string; adminName?: string; fromWallet?: string }
): Promise<void> {
  const ref = doc(db, ASSETS_COLLECTION, assetId);
  const snap = await getDoc(ref);
  const current = snap.exists() ? (snap.data() as BelAsset) : null;

  await updateDoc(ref, {
    status: 'Revoked',
    burnTxHash: params.txHash,
    updatedAt: nowIso(),
    history: appendHistory(current, {
      action: 'NFT Revoked (burned)',
      txHash: params.txHash,
      from: params.fromWallet,
      at: nowIso(),
      by: params.adminName || 'Admin',
    }),
  });

  try {
    await createAuditLog({
      action: `Asset NFT revoked (burned) — ${assetId}`,
      eventType: 'Asset Revoked',
      actor: auditActor(params.adminName || 'BEL Admin'),
      resource: { name: assetId, type: 'BEL Asset NFT', id: assetId },
      network: 'Polygon',
      status: 'Success',
      txHash: params.txHash,
      metadata: { assetId },
    });
  } catch {
    /* best effort */
  }
}

/* ----------------------------- verification ------------------------------- */

/**
 * LIVE BLOCKCHAIN OWNERSHIP CHECK.
 *
 * SECURITY: the expected wallet is compared against ownerOf(tokenId) read
 * from the ERC-721 contract over the public RPC. The Firestore `ownerWallet`
 * field is NEVER used as the answer — it is only display metadata.
 *
 * @param asset          Firestore asset record
 * @param expectedWallet wallet the ownership should be verified against
 *                       (employee session wallet). When omitted, verified
 *                       stays false and the raw on-chain owner is returned.
 */
export async function verifyAssetOwnershipOnChain(
  asset: BelAsset,
  expectedWallet?: string | null
): Promise<NftOwnershipResult> {
  const checkedAt = nowIso();

  if (asset.status === 'Revoked') {
    return { verified: false, checkedAt, reason: 'REVOKED' };
  }
  if (!asset.tokenId) {
    return { verified: false, checkedAt, reason: 'NOT_MINTED' };
  }
  if (!isNftContractConfigured()) {
    return { tokenId: asset.tokenId, verified: false, checkedAt, reason: 'CONTRACT_NOT_CONFIGURED' };
  }

  try {
    const onChainOwner = await ownerOfTokenId(asset.tokenId);
    if (!expectedWallet) {
      return {
        tokenId: asset.tokenId,
        verified: false,
        onChainOwner,
        checkedAt,
        reason: 'NO_WALLET_TO_COMPARE',
      };
    }
    const verified = onChainOwner.toLowerCase() === expectedWallet.trim().toLowerCase();
    return {
      tokenId: asset.tokenId,
      verified,
      onChainOwner,
      checkedAt,
      reason: verified ? undefined : 'OWNER_MISMATCH',
    };
  } catch (err) {
    return {
      tokenId: asset.tokenId,
      verified: false,
      checkedAt,
      reason: 'RPC_ERROR',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** True when any asset in the list passes the live on-chain ownership check. */
export function hasVerifiedAsset(results: NftOwnershipResult[]): boolean {
  return results.some((r) => r.verified);
}

