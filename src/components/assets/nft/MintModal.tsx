import { useState } from 'react';
import { X, Hammer, ExternalLink } from 'lucide-react';
import { txExplorerUrl } from '../../../config/blockchain';
import { mintAssetNft, toTxErrorMessage } from '../../../services/blockchain/nftContract';
import { applyMintedRecord, type BelAsset } from '../../../services/blockchain/assetRegistry';
import EmployeePicker, { useEmployeesWithWallets, type EmployeeOption } from './EmployeePicker';

/**
 * Modal: Mint NFT — sends the mintAsset() transaction with the ADMIN's
 * connected MetaMask wallet (contract owner). Firestore is updated ONLY after
 * the transaction is confirmed on-chain.
 */
export default function MintModal({
  asset,
  adminWallet,
  adminName,
  onClose,
  onMinted,
}: {
  asset: BelAsset | null;
  adminWallet: string | null;
  adminName: string;
  onClose: () => void;
  onMinted: () => void;
}) {
  const { employees, loading: employeesLoading } = useEmployeesWithWallets();
  const [mintToEmployee, setMintToEmployee] = useState(false);
  const [employee, setEmployee] = useState<EmployeeOption | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ tokenId: number; txHash: string } | null>(null);

  if (!asset) return null;

  const recipient = mintToEmployee ? employee?.walletAddress : adminWallet;

  const submit = async () => {
    setError('');
    if (!recipient) {
      setError(
        mintToEmployee
          ? 'Select an employee to mint directly to their wallet.'
          : 'Connect the admin wallet first, or choose minting directly to an employee wallet.'
      );
      return;
    }
    setBusy(true);
    try {
      // 1. ON-CHAIN — real transaction signed by the admin's wallet.
      const result = await mintAssetNft({
        assetId: asset.assetId,
        assetType: asset.assetType,
        metadataURI: '',
        to: recipient,
      });
      const { tokenId, txHash, blockNumber } = result;
      if (typeof tokenId !== 'number') {
        throw new Error('Mint receipt did not include a tokenId.');
      }
      // 2. FIRESTORE — only after on-chain confirmation.
      await applyMintedRecord(asset.assetId, {
        tokenId,
        txHash,
        blockNumber,
        adminName,
      });
      setSuccess({ tokenId, txHash });
      onMinted();
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
            <h3 className="font-bold text-slate-900">Mint NFT — {asset.assetId}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ERC-721 mint signed by your connected admin wallet (MetaMask).
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {!success && (
          <>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 space-y-1">
              <p>
                <span className="font-semibold">Asset Type:</span> {asset.assetType}
              </p>
              <p>
                <span className="font-semibold">Contract:</span>{' '}
                <span className="font-mono break-all">
                  {(import.meta.env.VITE_NFT_CONTRACT_ADDRESS as string) || '— not configured —'}
                </span>
              </p>
              <p className="text-slate-500">
                Token IDs start at 1023 — the on-chain tokenId is returned in the mint receipt.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  checked={!mintToEmployee}
                  onChange={() => setMintToEmployee(false)}
                  disabled={busy}
                  className="mt-0.5"
                />
                <span className="text-sm">
                  <span className="font-semibold text-slate-800">Mint to my admin wallet</span>
                  <span className="block text-xs text-slate-500">
                    Custody first, then Assign to an employee (two transactions).
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  checked={mintToEmployee}
                  onChange={() => setMintToEmployee(true)}
                  disabled={busy}
                  className="mt-0.5"
                />
                <span className="text-sm">
                  <span className="font-semibold text-slate-800">Mint directly to employee</span>
                  <span className="block text-xs text-slate-500">
                    One transaction — token lands straight in the employee wallet.
                  </span>
                </span>
              </label>
            </div>

            {mintToEmployee && (
              <EmployeePicker
                value={employee}
                onChange={setEmployee}
                disabled={busy}
                employees={employees}
                loading={employeesLoading}
              />
            )}
          </>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm space-y-1.5">
            <p className="font-bold text-emerald-700">Minted on-chain — NFT #{success.tokenId}</p>
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
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-60"
          >
            {busy ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Hammer className="w-4 h-4" />
            )}
            {busy ? 'Waiting for confirmation…' : 'Sign & Mint on-chain'}
          </button>
        )}

      </div>
    </div>
  );
}
