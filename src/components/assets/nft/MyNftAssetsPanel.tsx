import { useState } from 'react';
import {
  Package, RefreshCw, CheckCircle2, XCircle, ExternalLink, Loader2, Link2,
} from 'lucide-react';
import { useNftAssetsForWallet } from '../../../hooks/blockchain/useNftAssets';
import { resolveSessionWalletIdentity } from '../../../services/blockchain/nftVerification';
import { shortAddress, txExplorerUrl } from '../../../config/blockchain';

/**
 * "My Assets" — live NFT ownership panel for the employee portal.
 *
 * Every ownership badge is computed from a LIVE ownerOf() call against the
 * ERC-721 contract on the configured testnet (never from the Firestore
 * ownerWallet cache). Rendered on the employee dashboard (compact) and the
 * My Assets page (full).
 */
export default function MyNftAssetsPanel({ variant = 'full' }: { variant?: 'full' | 'compact' }) {
  const identity = resolveSessionWalletIdentity();
  const { items, loading, refreshing, refresh, stats } = useNftAssetsForWallet(
    identity.walletAddress,
    identity.did
  );
  const [expanded, setExpanded] = useState(variant === 'full');

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500">Verifying your asset NFTs on the blockchain…</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              My Assets{variant === 'full' ? ' — NFT Ownership' : ''}
            </h3>
            <p className="text-xs text-slate-500">
              Live ownerOf() check · wallet{' '}
              {identity.walletAddress ? shortAddress(identity.walletAddress) : 'not connected'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              stats.total === 0
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : stats.verified === stats.total
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {stats.total === 0 ? 'No NFT assets' : `${stats.verified}/${stats.total} verified`}
          </span>
          <button
            onClick={() => void refresh(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Re-verify
          </button>
        </div>
      </div>

      {/* Body */}
      {stats.total === 0 ? (
        <div className="px-5 py-6 text-sm text-slate-500">
          No BEL asset NFTs are assigned to your wallet. NFT-protected assets assigned by BEL Admin
          will appear here with live blockchain ownership badges.
        </div>
      ) : (
        <div className={`px-5 py-4 grid gap-3 ${variant === 'full' ? 'sm:grid-cols-2' : ''}`}>
          {(expanded ? items : items.slice(0, 2)).map(({ asset, ownership }) => {
            const verified = ownership.verified;
            return (
              <div
                key={asset.assetId}
                className={`rounded-xl border p-4 ${
                  verified ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-bold text-slate-900">{asset.assetId}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Type: {asset.assetType}</p>
                    <p className="text-xs text-slate-500">
                      NFT: {asset.tokenId ? `#${asset.tokenId}` : 'not minted'}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border whitespace-nowrap ${
                      verified
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                    }`}
                  >
                    {verified ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Unverified
                      </>
                    )}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full ${
                      asset.status === 'Active'
                        ? 'bg-green-50 text-green-700'
                        : asset.status === 'Created'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    Status: {asset.status}
                  </span>
                  {!verified && (
                    <span className="text-red-500 font-medium">
                      Asset ownership could not be verified
                      {ownership.onChainOwner
                        ? ` (held by ${shortAddress(ownership.onChainOwner)})`
                        : ownership.reason
                        ? ` (${ownership.reason.replace(/_/g, ' ').toLowerCase()})`
                        : ''}
                    </span>
                  )}
                  {(asset.lastTransferTxHash || asset.mintTxHash) &&
                    txExplorerUrl(asset.lastTransferTxHash || asset.mintTxHash) && (
                      <a
                        href={txExplorerUrl(asset.lastTransferTxHash || asset.mintTxHash)}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                      >
                        <Link2 className="w-3 h-3" /> tx
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {variant === 'compact' && items.length > 2 && (
        <div className="px-5 pb-4">
          <button
            onClick={() => setExpanded(true)}
            className="w-full py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Show all {items.length} assets
          </button>
        </div>
      )}

    </div>
  );
}
