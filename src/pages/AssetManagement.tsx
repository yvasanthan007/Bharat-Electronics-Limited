import { useCallback, useEffect, useState } from 'react';
import {
  Wallet, Plus, Hammer, ArrowLeftRight, ShieldOff, RefreshCw, ShieldCheck,
  ExternalLink, AlertTriangle, CheckCircle2, Loader2,
} from 'lucide-react';
import {
  NFT_CHAIN_ID,
  NFT_NETWORK_NAME,
  shortAddress,
  txExplorerUrl,
  isNftContractConfigured,
} from '../config/blockchain';
import {
  listAssets,
  verifyAssetOwnershipOnChain,
  type BelAsset,
  type NftOwnershipResult,
} from '../services/blockchain/assetRegistry';
import {
  connectAdminWallet,
  getConnectedAdminWallet,
  isAdminContractOwner,
  NFT_CONFIG,
} from '../services/blockchain/nftContract';
import AssetCreateModal from '../components/assets/nft/AssetCreateModal';
import MintModal from '../components/assets/nft/MintModal';
import TransferModal from '../components/assets/nft/TransferModal';
import BurnModal from '../components/assets/nft/BurnModal';

/**
 * ADMIN — Asset Management (NFT asset registry).
 *
 * Create asset → Mint NFT → Assign to employee → Transfer → Revoke.
 * All on-chain actions are signed by the admin's connected MetaMask wallet
 * (the contract owner). Firestore is updated only AFTER on-chain confirmation,
 * and every ownership display can be re-checked live via ownerOf().
 */

const ADMIN_WALLET_KEY = 'bel_admin_wallet';

function getAdminName(): string {
  try {
    const raw = localStorage.getItem('bel_user');
    if (!raw) return 'BEL Admin';
    const user = JSON.parse(raw) as { name?: string; email?: string };
    return user.name || user.email || 'BEL Admin';
  } catch {
    return 'BEL Admin';
  }
}

type ModalState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'mint'; asset: BelAsset }
  | { kind: 'transfer'; asset: BelAsset; mode: 'Assigned' | 'Transferred' }
  | { kind: 'burn'; asset: BelAsset };

export default function AssetManagement() {
  const [assets, setAssets] = useState<BelAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminWallet, setAdminWallet] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });
  const [rowChecks, setRowChecks] = useState<Record<string, NftOwnershipResult | 'loading'>>({});
  const adminName = getAdminName();

  const configured = isNftContractConfigured();

  const loadAssets = useCallback(async () => {
    setLoading(true);
    const list = await listAssets();
    setAssets(list);
    setLoading(false);
  }, []);

  const checkAdminWallet = useCallback(async () => {
    try {
      const connected = await getConnectedAdminWallet();
      if (connected) {
        setAdminWallet(connected);
        sessionStorage.setItem(ADMIN_WALLET_KEY, connected);
        setIsOwner(await isAdminContractOwner());
      } else {
        setAdminWallet(sessionStorage.getItem(ADMIN_WALLET_KEY));
        setIsOwner(null);
      }
    } catch {
      setIsOwner(null);
    }
  }, []);

  useEffect(() => {
    void loadAssets();
    void checkAdminWallet();
  }, [loadAssets, checkAdminWallet]);

  const handleConnectWallet = async () => {
    setWalletError('');
    setConnecting(true);
    try {
      const address = await connectAdminWallet();
      setAdminWallet(address);
      sessionStorage.setItem(ADMIN_WALLET_KEY, address);
      try {
        setIsOwner(await isAdminContractOwner());
      } catch {
        setIsOwner(null);
      }
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : 'Could not connect the wallet.');
    } finally {
      setConnecting(false);
    }
  };

  const handleVerifyRow = async (asset: BelAsset) => {
    setRowChecks((prev) => ({ ...prev, [asset.assetId]: 'loading' }));
    const result = await verifyAssetOwnershipOnChain(asset);
    setRowChecks((prev) => ({ ...prev, [asset.assetId]: result }));
  };

  const stats = {
    total: assets.length,
    created: assets.filter((a) => a.status === 'Created').length,
    active: assets.filter((a) => a.status === 'Active').length,
    revoked: assets.filter((a) => a.status === 'Revoked').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Asset Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            NFT-backed custody of BEL assets — the blockchain is the source of truth.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadAssets()}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setModal({ kind: 'create' })}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Asset
          </button>
        </div>
      </div>

      {/* Network + admin wallet strip */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className={`w-2 h-2 rounded-full ${configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {NFT_NETWORK_NAME} · Chain {NFT_CHAIN_ID}
          </span>
          <span className="text-slate-500">
            Contract:{' '}
            {configured ? (
              <span className="font-mono text-blue-600">{shortAddress(NFT_CONFIG.contractAddress, 6)}</span>
            ) : (
              <span className="font-mono text-amber-600">not configured</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {adminWallet ? (
            <>
              <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                <Wallet className="w-3.5 h-3.5 text-blue-600" />
                {shortAddress(adminWallet, 4)}
              </span>
              {isOwner === true && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Contract Owner
                </span>
              )}
              {isOwner === false && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Not contract owner
                </span>
              )}
            </>
          ) : (
            <button
              onClick={() => void handleConnectWallet()}
              disabled={connecting}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-xl disabled:opacity-60"
            >
              {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wallet className="w-3.5 h-3.5" />}
              {connecting ? 'Connecting…' : 'Connect Admin Wallet'}
            </button>
          )}
        </div>
      </div>

      {(walletError || !configured) && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            {walletError && <p className="font-semibold">{walletError}</p>}
            {!configured && (
              <p>
                Set <span className="font-mono">VITE_NFT_CONTRACT_ADDRESS</span> in .env.local after
                deploying the contract (see docs/NFT_INTEGRATION.md).
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: stats.total, cls: 'text-slate-900' },
          { label: 'Active (NFT live)', value: stats.active, cls: 'text-green-600' },
          { label: 'Awaiting Mint', value: stats.created, cls: 'text-amber-600' },
          { label: 'Revoked', value: stats.revoked, cls: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Asset registry table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">BEL Asset NFT Registry</h3>
          <span className="text-xs text-slate-400">{assets.length} assets</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Asset ID', 'Type', 'NFT Token', 'Owner', 'Status', 'Tx Hash', 'Actions'].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm">
                    Loading asset registry…
                  </td>
                </tr>
              )}
              {!loading && assets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm">
                    No assets yet — create the first one (e.g. BEL-LAP-001).
                  </td>
                </tr>
              )}
              {assets.map((asset) => {
                const check = rowChecks[asset.assetId];
                const statusCls =
                  asset.status === 'Active'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : asset.status === 'Created'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-red-50 text-red-700 border border-red-200';
                return (
                  <tr key={asset.assetId} className="hover:bg-slate-50/60 transition-colors align-top">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-800">{asset.assetId}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{asset.assetType}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-blue-600">
                      {asset.tokenId ? `#${asset.tokenId}` : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {asset.ownerName ? (
                        <span className="font-semibold text-slate-700">{asset.ownerName}</span>
                      ) : asset.ownerWallet ? (
                        <span className="font-mono text-slate-600">{shortAddress(asset.ownerWallet)}</span>
                      ) : (
                        <span className="text-slate-400">admin custody / unassigned</span>
                      )}
                      {check === 'loading' && (
                        <span className="block mt-1 text-[10px] text-blue-600">
                          checking ownerOf()…
                        </span>
                      )}
                      {check && check !== 'loading' && (
                        <span
                          className={`block mt-1 text-[10px] font-semibold ${
                            check.verified ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {check.verified
                            ? `ownerOf() ✓ ${shortAddress(check.onChainOwner)}`
                            : `ownerOf() ✗ ${check.onChainOwner ? shortAddress(check.onChainOwner) : check.reason}`}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCls}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[10px] text-slate-500 max-w-[140px] truncate">
                      {asset.lastTransferTxHash || asset.mintTxHash ? (
                        <a
                          href={txExplorerUrl(asset.lastTransferTxHash || asset.mintTxHash)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 underline"
                        >
                          {(asset.lastTransferTxHash || asset.mintTxHash)?.slice(0, 10)}…
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {asset.status === 'Created' && (
                          <button
                            onClick={() => setModal({ kind: 'mint', asset })}
                            className="flex items-center gap-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg"
                          >
                            <Hammer className="w-3 h-3" /> Mint
                          </button>
                        )}
                        {asset.status === 'Active' && (
                          <>
                            <button
                              onClick={() =>
                                setModal({
                                  kind: 'transfer',
                                  asset,
                                  mode: asset.ownerName ? 'Transferred' : 'Assigned',
                                })
                              }
                              className="flex items-center gap-1 text-[11px] font-semibold text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg"
                            >
                              <ArrowLeftRight className="w-3 h-3" />
                              {asset.ownerName ? 'Transfer' : 'Assign'}
                            </button>
                            <button
                              onClick={() => setModal({ kind: 'burn', asset })}
                              className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg"
                            >
                              <ShieldOff className="w-3 h-3" /> Revoke
                            </button>
                          </>
                        )}
                        {asset.tokenId && (
                          <button
                            onClick={() => void handleVerifyRow(asset)}
                            title="Live ownerOf() check"
                            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Verify
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {/* Modals */}
      {modal.kind === 'create' && (
        <AssetCreateModal
          open
          adminName={adminName}
          onClose={() => setModal({ kind: 'none' })}
          onCreated={() => void loadAssets()}
        />
      )}
      {modal.kind === 'mint' && (
        <MintModal
          asset={modal.asset}
          adminWallet={adminWallet}
          adminName={adminName}
          onClose={() => setModal({ kind: 'none' })}
          onMinted={() => void loadAssets()}
        />
      )}
      {modal.kind === 'transfer' && (
        <TransferModal
          asset={modal.asset}
          mode={modal.mode}
          adminName={adminName}
          onClose={() => setModal({ kind: 'none' })}
          onTransferred={() => void loadAssets()}
        />
      )}
      {modal.kind === 'burn' && (
        <BurnModal
          asset={modal.asset}
          adminName={adminName}
          onClose={() => setModal({ kind: 'none' })}
          onBurned={() => void loadAssets()}
        />
      )}

    </div>
  );
}
