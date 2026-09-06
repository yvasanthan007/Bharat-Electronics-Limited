import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { createAssetRecord, type BelAsset } from '../../../services/blockchain/assetRegistry';

const ASSET_TYPES = [
  'Laptop',
  'Desktop Workstation',
  'Tablet',
  'Secure Radio',
  'Radar Module',
  'Test Equipment',
  'Tool Kit',
  'Access Card',
  'Other',
];

/** Modal: Create Asset — writes the pre-mint Firestore record (assets/{assetId}). */
export default function AssetCreateModal({
  open,
  onClose,
  onCreated,
  adminName,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (asset: BelAsset) => void;
  adminName: string;
}) {
  const [assetId, setAssetId] = useState('');
  const [assetType, setAssetType] = useState(ASSET_TYPES[0]);
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const submit = async () => {
    setError('');
    if (!assetId.trim()) {
      setError('Asset ID is required (e.g. BEL-LAP-001).');
      return;
    }
    setBusy(true);
    try {
      const result = await createAssetRecord({
        assetId,
        assetType,
        description: description || undefined,
        createdBy: adminName,
      });
      if (!result.ok) {
        setError(result.error || 'Could not create the asset.');
        return;
      }
      setAssetId('');
      setDescription('');
      onCreated({
        assetId: assetId.trim(),
        assetType,
        description: description || undefined,
        status: 'Created',
        createdBy: adminName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Creating the asset failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Create Asset</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Registers the asset in Firestore before the NFT is minted on-chain.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Asset ID</label>
          <input
            value={assetId}
            onChange={(e) => setAssetId(e.target.value.toUpperCase())}
            placeholder="BEL-LAP-001"
            disabled={busy}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Asset Type</label>
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            disabled={busy}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {ASSET_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            disabled={busy}
            placeholder="Engineering laptop — R&D Bay 2"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl">
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-60"
        >
          {busy ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {busy ? 'Creating…' : 'Create Asset'}
        </button>
      </div>
    </div>
  );
}
