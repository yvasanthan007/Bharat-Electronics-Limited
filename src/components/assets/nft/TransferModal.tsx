import { useState } from 'react';
import { X, ArrowLeftRight, ExternalLink } from 'lucide-react';
import { shortAddress, txExplorerUrl } from '../../../config/blockchain';
import {
  transferAssetNft,
  toTxErrorMessage,
} from '../../../services/blockchain/nftContract';
import {
  applyAssignmentRecord,
  type BelAsset,
} from '../../../services/blockchain/assetRegistry';
import EmployeePicker, { useEmployeesWithWallets, type EmployeeOption } from './EmployeePicker';

/**
 * Modal: Assign / Transfer NFT — sends transferAsset(tokenId, to) with the
 * admin's connected wallet. Firestore owner reference is updated ONLY after
 * the blockchain transaction confirms. If the tx fails or is rejected,
 * Firestore is NOT touched.
 */
export default function TransferModal({
  asset,
  mode,
  adminName,
  onClose,
  onTransferred,
}: {
  asset: BelAsset | null;
  mode: 'Assigned' | 'Transferred';
  adminName: string;
  onClose: () => void;
  onTransferred: () => void;
}) {
  const { employees, loading: employeesLoading } = useEmployeesWithWallets();
  const [employee, setEmployee] = useState<EmployeeOption | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ txHash: string } | null>(null);

  if (!asset) return null;
  const needsMint = !asset.tokenId;

  const submit = async () => {
    setError('');
    if (needsMint || !asset.tokenId) {
      setError('This asset has no NFT yet — mint it first.');
      return;
    }
    if (!employee) {
      setError('Select the employee who should receive the NFT.');
      return;
    }
    setBusy(true);
    try {
      // 1. ON-CHAIN — the smart contract performs the actual transfer.
      const result = await transferAssetNft(asset.tokenId, employee.walletAddress);
      // 2. FIRESTORE — only after confirmation.
      await applyAssignmentRecord(asset.assetId, {
        toWallet: employee.walletAddress,
        toDID: employee.did,
        toEmployeeId: employee.employeeId,
        toName: employee.name,
        txHash: result.txHash,
        action: mode,
        fromWallet: asset.ownerWallet,
        adminName,
      });
      setSuccess({ txHash: result.txHash });
      onTransferred();
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
            <h3 className="font-bold text-slate-900">
              {mode === 'Assigned' ? 'Assign NFT' : 'Transfer NFT'} — {asset.assetId}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {asset.tokenId ? `Token #${asset.tokenId}` : 'Not minted'} · custody handover on
              Polygon Amoy.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {asset.ownerWallet && !success && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600">
            <span className="font-semibold">Current owner (cached):</span>{' '}
            <span className="font-mono">{shortAddress(asset.ownerWallet, 6)}</span>
            <span className="block text-slate-500 mt-1">
              The smart contract moves the token from its live owner — this is authoritative.
            </span>
          </div>
        )}

        {!success && (
          <EmployeePicker
            value={employee}
            onChange={setEmployee}
            disabled={busy}
            employees={employees}
            loading={employeesLoading}
          />
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm space-y-1.5">
            <p className="font-bold text-emerald-700">
              {mode} confirmed on-chain → {employee?.name}
            </p>
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
              <ArrowLeftRight className="w-4 h-4" />
            )}
            {busy ? 'Waiting for confirmation…' : 'Sign & Transfer on-chain'}
          </button>
        )}
      </div>
    </div>
  );
}
