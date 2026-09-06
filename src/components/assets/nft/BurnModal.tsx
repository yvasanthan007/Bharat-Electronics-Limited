import { useState } from 'react';
import { X, ShieldOff, ExternalLink } from 'lucide-react';
import { txExplorerUrl } from '../../../config/blockchain';
import { burnAssetNft, toTxErrorMessage } from '../../../services/blockchain/nftContract';
import { applyBurnRecord, type BelAsset } from '../../../services/blockchain/assetRegistry';

/**
 * Modal: Revoke (Burn) NFT — sends burnAsset(tokenId) with the admin's
 * connected wallet. Firestore status flips to 'Revoked' ONLY after the
 * burn transaction confirms on-chain.
 */
export default function BurnModal({
  asset,
  adminName,
  onClose,
  onBurned,
}: {
  asset: BelAsset | null;
  adminName: string;
  onClose: () => void;
  onBurned: () => void;
}) {
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ txHash: string } | null>(null);

  if (!asset) return null;
  const confirmed = confirmText.trim().toUpperCase() === asset.assetId.toUpperCase();

  const submit = async () => {
    setError('');
    if (!asset.tokenId) {
      setError('This asset has no NFT on-chain — nothing to burn.');
      return;
    }
    setBusy(true);
    try {
      // 1. ON-CHAIN — burn the token.
      const result = await burnAssetNft(asset.tokenId);
      // 2. FIRESTORE — only after confirmation.
      await applyBurnRecord(asset.assetId, {
        txHash: result.txHash,
        adminName,
        fromWallet: asset.ownerWallet,
      });
      setSuccess({ txHash: result.txHash });
      onBurned();
    } catch (err) {
      setError(toTxErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Revoke NFT — {asset.assetId}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Burns token #{asset.tokenId ?? '—'} and permanently removes custody. The owner loses
              the NFT-protected access immediately.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!success && (
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Type <span className="font-mono text-red-600">{asset.assetId}</span> to confirm
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={asset.assetId}
              disabled={busy}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
            />
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm space-y-1.5">
            <p className="font-bold text-emerald-700">Burn confirmed — asset revoked.</p>
            <p className="text-emerald-700 text-xs break-all">tx: {success.txHash}</p>
            {txExplorerUrl(success.txHash) && (
              <a
                href={txExplorerUrl(success.txHash)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 underline"
              >
                View on explorer <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl">
            {error}
          </div>
        )}

        {success ? (
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl"
          >
            Done
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={busy || !confirmed}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-60"
          >
            {busy ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ShieldOff className="w-4 h-4" />
            )}
            {busy ? 'Waiting for confirmation…' : 'Sign & Burn on-chain'}
          </button>
        )}
      </div>
    </div>
  );
}
