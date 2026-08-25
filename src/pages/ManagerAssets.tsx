import { useState } from 'react';
import {
  Search,
  Database,
  Shield,
  Award,
  Key,
  FileCheck,
  CheckCircle2,
  Clock,
  XCircle,
  X,
} from 'lucide-react';
import type { TeamAsset } from '../data/managerMockData';

interface ManagerAssetsProps {
  teamAssets: TeamAsset[];
}

const typeIcons: Record<string, typeof Shield> = {
  'Digital Certificate': Award,
  'Access Badge': Key,
  'Training Certificate': FileCheck,
  'License': Shield,
  'Security Clearance': Shield,
  'Digital ID': Key,
  'Compliance Certificate': FileCheck,
  'Access Token': Key,
};

const statusConfig = {
  Verified: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  Pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  Revoked: { bg: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
};

export default function ManagerAssets({ teamAssets }: ManagerAssetsProps) {
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<TeamAsset | null>(null);

  const filtered = teamAssets.filter((asset) =>
    asset.name.toLowerCase().includes(search.toLowerCase()) ||
    asset.asset_id.toLowerCase().includes(search.toLowerCase()) ||
    asset.owner?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto pb-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">My Assets</h2>
        <p className="text-slate-500 mt-1">Digital assets assigned to your team</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filtered.map((asset) => {
          const config = (statusConfig as any)[asset.status];
          const StatusIcon = config.icon;
          const TypeIcon = typeIcons[asset.type] || Database;
          const issuedDate = asset.issuedDate || (asset.issued_at ? new Date(asset.issued_at).toLocaleDateString() : '—');

          return (
            <div
              key={asset.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <TypeIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
                    <StatusIcon className="w-3 h-3" />
                    {asset.status}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-800 mb-1">{asset.name}</h4>
                <p className="text-xs text-slate-500 mb-3">{asset.assetId || asset.asset_id}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Owner</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-[9px]">
                        {asset.ownerAvatar || asset.owner?.avatar || '?'}
                      </div>
                      <span className="text-slate-600 font-medium">{typeof asset.owner === 'string' ? asset.owner : asset.owner?.full_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Type</span>
                    <span className="text-slate-600">{asset.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Issued</span>
                    <span className="text-slate-600">{issuedDate}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => setSelectedAsset(asset)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors w-full text-center"
                >
                  View Asset
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-sm text-slate-400">
            No assets found
          </div>
        )}
      </div>

      {/* Asset Details Modal */}
      {selectedAsset && (() => {
        const selectedAssetDate = selectedAsset.issuedDate
          || (selectedAsset.issued_at ? new Date(selectedAsset.issued_at).toLocaleDateString() : '—');
        return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedAsset(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Asset Details</h3>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{selectedAsset.name}</h4>
                  <p className="text-xs text-slate-500">{selectedAsset.assetId || selectedAsset.asset_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-0.5">Owner</p>
                  <p className="text-sm font-medium text-slate-800">{typeof selectedAsset.owner === 'string' ? selectedAsset.owner : (selectedAsset.owner?.full_name || 'Unassigned')}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-0.5">Type</p>
                  <p className="text-sm font-medium text-slate-800">{selectedAsset.type}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-0.5">Status</p>
                  <p className="text-sm font-medium text-slate-800">{selectedAsset.status}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-500">Issued On</span>
                  <span className="text-sm font-semibold text-slate-800">{selectedAssetDate}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-0.5">Description</p>
                <p className="text-sm text-slate-700">{selectedAsset.description}</p>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
