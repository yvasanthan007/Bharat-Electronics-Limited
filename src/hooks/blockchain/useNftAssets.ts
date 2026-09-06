import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getAssetsForWallet,
  verifyAssetOwnershipOnChain,
  type BelAsset,
  type NftOwnershipResult,
} from '../../services/blockchain/assetRegistry';

/**
 * React hook: loads the Firestore assets assigned to a wallet/DID and verifies
 * EACH of them against the live blockchain (ownerOf on the ERC-721 contract).
 * Used by the employee portal ("My Assets" + dashboard) — the badge shown in
 * the UI is always the result of this live check, never the Firestore cache.
 */

export interface VerifiedNftAsset {
  asset: BelAsset;
  ownership: NftOwnershipResult;
}

export interface NftStats {
  total: number;
  verified: number;
  failed: number;
  pending: number;
}

export function useNftAssetsForWallet(
  wallet?: string | null,
  did?: string | null,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== false;
  const [items, setItems] = useState<VerifiedNftAsset[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(
    async (silent = false) => {
      if (!enabled || (!wallet && !did)) {
        setItems([]);
        setLoading(false);
        return;
      }
      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const assets = await getAssetsForWallet(wallet, did);
        const collected: VerifiedNftAsset[] = [];
        for (const asset of assets) {
          // Progressive render — each row appears as its on-chain check returns.
          const ownership = await verifyAssetOwnershipOnChain(asset, wallet || null);
          collected.push({ asset, ownership });
          if (mounted.current) setItems([...collected]);
        }
        if (mounted.current) setItems(collected);
      } catch (err) {
        console.warn('[useNftAssets] verification pass failed:', err);
      } finally {
        if (mounted.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [wallet, did, enabled]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stats: NftStats = {
    total: items.length,
    verified: items.filter((i) => i.ownership.verified).length,
    failed: items.filter((i) => !i.ownership.verified && i.asset.status === 'Active').length,
    pending: items.filter((i) => i.asset.status === 'Created').length,
  };

  return { items, loading, refreshing, refresh, stats };
}
