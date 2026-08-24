import { useState } from 'react';
import { 
  X, Search, Filter, ArrowDownRight, ArrowUpRight, RefreshCw, Send, CheckCircle2, 
  Clock, XCircle, ShieldCheck, Copy, Check, Download, Layers
} from 'lucide-react';
import { formatCurrency, type AssetActivity, type Currency } from '../../services/assets';

interface AllActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: AssetActivity[];
  currency: Currency;
}

export default function AllActivitiesModal({
  isOpen,
  onClose,
  activities,
  currency,
}: AllActivitiesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.wallet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.txHash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'All' || act.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || act.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'Minted':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case 'Bought':
        return <ArrowDownRight className="w-4 h-4 text-emerald-600" />;
      case 'Sold':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'Swapped':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'Transferred':
        return <Send className="w-4 h-4 text-indigo-600" />;
      case 'Received':
        return <ArrowDownRight className="w-4 h-4 text-emerald-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Minted':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Bought':
      case 'Received':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Sold':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Swapped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Transferred':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  const exportActivities = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredActivities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BEL_Asset_Activities_Audit_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">All Asset Activities & On-Chain Audit Log</h2>
              <p className="text-xs text-slate-500">
                Complete immutable record of all tokenizations, transfers, and minting events
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportActivities}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Audit
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by asset, wallet, tx hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['All', 'Minted', 'Transferred', 'Bought', 'Sold', 'Received'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    typeFilter === type
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Activity Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Type & Asset</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Est. Valuation ({currency})</th>
                <th className="px-4 py-3">Vault / Node</th>
                <th className="px-4 py-3">Tx Hash & Block</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.map((act) => {
                const totalValueUsd = act.amount * act.unitPriceUsd;
                return (
                  <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                          {getIcon(act.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getBadgeColor(act.type)}`}>
                              {act.type}
                            </span>
                            <span className="font-bold text-slate-900">{act.asset}</span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400">{act.ticker}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                      {act.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(totalValueUsd, currency)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 text-[11px]">
                        {act.wallet}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-600 text-[11px]">{act.txHash}</span>
                        <button
                          onClick={() => handleCopy(act.txHash)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="Copy Tx Hash"
                        >
                          {copiedHash === act.txHash ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono">#{act.blockNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(act.status)}</td>
                    <td className="px-4 py-3.5 text-right text-slate-500 font-medium">
                      {new Date(act.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredActivities.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-medium text-xs">No activity records match your filter criteria.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredActivities.length} of {activities.length} recorded events</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
