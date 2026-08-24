import { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Eye, 
  Code2, 
  Activity, 
  ChevronRight
} from 'lucide-react';
import type { SmartContractItem } from '../../data/contractData';

interface ContractTableProps {
  contracts: SmartContractItem[];
  onSelectContract: (contract: SmartContractItem) => void;
  selectedContractId?: string;
  viewMode: 'table' | 'cards';
}

export default function ContractTable({
  contracts,
  onSelectContract,
  selectedContractId,
  viewMode
}: ContractTableProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getStatusBadge = (status: SmartContractItem['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Paused':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Deprecated':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getNetworkBadge = (network: SmartContractItem['network']) => {
    switch (network) {
      case 'Ethereum':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Polygon':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'BNB Chain':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'BEL Testnet':
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getTypeBadge = (type: SmartContractItem['type']) => {
    switch (type) {
      case 'Identity':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Access Control':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Digital Asset':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Certificate':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Governance':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Transaction':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (contracts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
        <Code2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="font-medium text-slate-700">No smart contracts found</p>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
      </div>
    );
  }

  // Card Grid View
  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {contracts.map((item) => {
          const isSelected = selectedContractId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectContract(item)}
              className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected ? 'ring-2 ring-blue-600 border-transparent' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">{item.name}</h3>
                      <span className="text-xs text-slate-500 font-mono">{item.version}</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                    {item.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                    {item.status === 'Paused' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getTypeBadge(item.type)}`}>
                    {item.type}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getNetworkBadge(item.network)}`}>
                    {item.network}
                  </span>
                  {item.verification.status === 'Verified' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Address Box */}
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-600 truncate">{item.address}</span>
                  <button
                    onClick={(e) => handleCopy(e, item.address)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded ml-1"
                    title="Copy Address"
                  >
                    {copiedAddress === item.address ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  <span><strong>{item.transactionsCount.toLocaleString()}</strong> txs</span>
                </div>
                <span>Active {item.lastActivity}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Standard Table View
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Contract</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4">Network</th>
              <th className="py-3.5 px-4">Address</th>
              <th className="py-3.5 px-4">Version</th>
              <th className="py-3.5 px-4">Verification</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Transactions</th>
              <th className="py-3.5 px-4">Last Activity</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contracts.map((item) => {
              const isSelected = selectedContractId === item.id;
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectContract(item)}
                  className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  {/* Contract */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{item.symbol}</p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadge(item.type)}`}>
                      {item.type}
                    </span>
                  </td>

                  {/* Network */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getNetworkBadge(item.network)}`}>
                      {item.network}
                    </span>
                  </td>

                  {/* Address */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-slate-700">
                        {item.address.slice(0, 6)}...{item.address.slice(-4)}
                      </span>
                      <button
                        onClick={(e) => handleCopy(e, item.address)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        title="Copy Contract Address"
                      >
                        {copiedAddress === item.address ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Version */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {item.version}
                    </span>
                  </td>

                  {/* Verification */}
                  <td className="py-3.5 px-4">
                    {item.verification.status === 'Verified' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
                        Unverified
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(item.status)}`}>
                      {item.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                      {item.status === 'Paused' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                      {item.status}
                    </span>
                  </td>

                  {/* Transactions */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900">{item.transactionsCount.toLocaleString()}</span>
                  </td>

                  {/* Last Activity */}
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    {item.lastActivity}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectContract(item);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                      <ChevronRight className="w-3 h-3 text-blue-400" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
