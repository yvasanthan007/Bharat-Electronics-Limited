import { useState, useEffect } from 'react';
import { Package, ExternalLink } from 'lucide-react';
import { getUserAssets, type UserAsset } from '../../services/userPortal';

const typeBg: Record<string, string> = {
  Repository:    'bg-blue-50 text-blue-700',
  'Document Set':'bg-purple-50 text-purple-700',
  License:       'bg-emerald-50 text-emerald-700',
  'Access Token':'bg-amber-50 text-amber-700',
  Software:      'bg-rose-50 text-rose-700',
};

const statusStyle: Record<string, string> = {
  Active:  'bg-green-50 text-green-700 border border-green-200',
  Expired: 'bg-red-50 text-red-700 border border-red-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
};

export default function MyAssets() {
  const [assets, setAssets] = useState<UserAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getUserAssets();
      setAssets(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const activeCount  = assets.filter(a => a.status === 'Active').length;
  const pendingCount = assets.filter(a => a.status === 'Pending').length;
  const expiredCount = assets.filter(a => a.status === 'Expired').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Assets</h2>
          <p className="text-sm text-slate-500 mt-0.5">Digital assets assigned to your identity.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-full">
          <Package className="w-4 h-4" />
          {assets.length} Total Assets
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active',  count: activeCount,  cls: 'text-green-600' },
          { label: 'Pending', count: pendingCount, cls: 'text-amber-600' },
          { label: 'Expired', count: expiredCount, cls: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Asset Registry</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Asset ID', 'Name', 'Type', 'NFT Token', 'Issued', 'Status', ''].map(col => (
                  <th key={col} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{asset.id}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{asset.name}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeBg[asset.type] || 'bg-slate-50 text-slate-700'}`}>
                      {asset.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-blue-600">{asset.nft}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">{asset.issued}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[asset.status]}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
