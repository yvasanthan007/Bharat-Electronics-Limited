import {
  getAssetsForWallet,
  verifyAssetOwnershipOnChain,
  type NftOwnershipResult,
} from './assetRegistry';

/**
 * Post-RBAC NFT ownership verification (login flow, step between RBAC and
 * Dashboard).
 *
 * SECURITY: every result comes from a LIVE ownerOf(tokenId) call against the
 * ERC-721 contract — the Firestore ownerWallet cache is never trusted.
 *
 * This check NEVER invalidates the DID/RBAC session: if ownership fails, only
 * the NFT-protected asset/resource is denied ("Asset ownership could not be
 * verified."), exactly per the BEL zero-trust policy.
 */

export interface SessionNftAssetResult {
  assetId: string;
  assetType: string;
  tokenId?: number;
  status: string;
  ownership: NftOwnershipResult;
}

export interface SessionNftVerification {
  walletAddress: string;
  did?: string;
  checkedAt: string;
  totalAssets: number;
  verifiedCount: number;
  allVerified: boolean;
  results: SessionNftAssetResult[];
}

const SESSION_CACHE_KEY = 'bel_nft_verification';

/** Verifies all assets assigned (per Firestore reference) to this wallet/DID. */
export async function verifySessionNftOwnership(
  walletAddress?: string | null,
  did?: string | null
): Promise<SessionNftVerification> {
  const checkedAt = new Date().toISOString();
  const assets = await getAssetsForWallet(walletAddress, did);

  const results: SessionNftAssetResult[] = [];
  for (const asset of assets) {
    const ownership = await verifyAssetOwnershipOnChain(asset, walletAddress || null);
    results.push({
      assetId: asset.assetId,
      assetType: asset.assetType,
      tokenId: asset.tokenId,
      status: asset.status,
      ownership,
    });
  }

  const verifiedCount = results.filter((r) => r.ownership.verified).length;
  return {
    walletAddress: walletAddress || '',
    did: did || undefined,
    checkedAt,
    totalAssets: results.length,
    verifiedCount,
    allVerified: results.length > 0 && verifiedCount === results.length,
    results,
  };
}

/** Cached verification result from the login flow (instant dashboard render). */
export function getCachedNftVerification(): SessionNftVerification | null {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    return raw ? (JSON.parse(raw) as SessionNftVerification) : null;
  } catch {
    return null;
  }
}

/** Persists a fresh verification result for the portal pages. */
export function cacheNftVerification(result: SessionNftVerification): void {
  try {
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(result));
  } catch {
    /* storage unavailable — pages will verify live instead */
  }
}

export interface SessionWalletIdentity {
  walletAddress: string | null;
  did: string | null;
  name?: string;
  employeeId?: string;
}

/**
 * Resolves the signature-verified wallet identity of the logged-in employee.
 * Reads the DID-auth session written by the login flow (no secrets — wallet
 * address and DID are public identifiers). Falls back to the legacy
 * `bel_user` localStorage shape.
 */
export function resolveSessionWalletIdentity(): SessionWalletIdentity {
  try {
    const raw = localStorage.getItem('bel_employee_session');
    if (raw) {
      const session = JSON.parse(raw) as {
        walletAddress?: string;
        did?: string;
        name?: string;
        employeeId?: string;
      };
      if (session.walletAddress || session.did) {
        return {
          walletAddress: session.walletAddress || null,
          did: session.did || null,
          name: session.name,
          employeeId: session.employeeId,
        };
      }
    }
  } catch {
    /* fall through to legacy shape */
  }

  try {
    const raw = localStorage.getItem('bel_user');
    if (raw) {
      const user = JSON.parse(raw) as {
        walletAddress?: string;
        did?: string;
        name?: string;
        employeeId?: string;
      };
      return {
        walletAddress: user.walletAddress || null,
        did: user.did && user.did.startsWith('did:') ? user.did : null,
        name: user.name,
        employeeId: user.employeeId,
      };
    }
  } catch {
    /* no session */
  }

  return { walletAddress: null, did: null };
}

