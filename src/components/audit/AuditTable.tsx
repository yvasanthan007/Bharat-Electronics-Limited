import { useState } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Eye, 
  ArrowUpDown, 
  Activity, 
  ChevronRight
} from 'lucide-react';
import type { AuditLogEvent } from '../../data/auditData';

interface AuditTableProps {
  events: AuditLogEvent[];
  onSelectEvent: (event: AuditLogEvent) => void;
  selectedEventId?: string;
}

export default function AuditTable({
  events,
  onSelectEvent,
  selectedEventId
}: AuditTableProps) {
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedTx(text);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const getStatusBadge = (status: AuditLogEvent['status']) => {
    switch (status) {
      case 'Success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Warning':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getNetworkBadge = (network: AuditLogEvent['network']) => {
    switch (network) {
      case 'Ethereum':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Polygon':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'BNB Chain':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'BEL Testnet':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Internal':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('Asset')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('Role') || action.includes('Access')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (action.includes('Contract')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (action.includes('Security') || action.includes('Alert')) return 'bg-red-50 text-red-700 border-red-200';
    if (action.includes('Identity')) return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Event ID</th>
              <th className="py-3.5 px-4">Actor</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Resource</th>
              <th className="py-3.5 px-4">Network</th>
              <th className="py-3.5 px-4">
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                  Timestamp
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Transaction</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Activity className="w-8 h-8 text-slate-300" />
                    <p className="font-medium text-slate-700">No audit events match your filter criteria</p>
                    <p className="text-xs text-slate-400">Try clearing or adjusting search filters to find what you need.</p>
                  </div>
                </td>
              </tr>
            ) : (
              events.map((event) => {
                const isSelected = selectedEventId === event.id;
                return (
                  <tr
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    {/* Event ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-slate-900">{event.id}</span>
                        {event.integrity.verified && (
                          <span title="Integrity Status: Verified on-chain" className="text-emerald-600">
                            <ShieldCheck className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            event.actor.avatarBg || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {event.actor.avatarText || event.actor.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{event.actor.name}</p>
                          <p className="text-xs text-slate-500 truncate">{event.actor.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionBadge(event.action)}`}>
                        {event.action}
                      </span>
                    </td>

                    {/* Resource */}
                    <td className="py-3.5 px-4">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{event.resource.name}</p>
                        <p className="text-xs text-slate-400 font-mono truncate">{event.resource.id}</p>
                      </div>
                    </td>

                    {/* Network */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getNetworkBadge(event.network)}`}>
                        {event.network}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4">
                      <div title={event.timestamp}>
                        <p className="text-slate-800 font-medium">{event.timeAgo}</p>
                        <p className="text-[11px] text-slate-400">{event.timestamp.split(' ')[1]}</p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(event.status)}`}>
                        {event.status === 'Success' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                        {event.status === 'Failed' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                        {event.status === 'Warning' && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
                        {event.status === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                        {event.status}
                      </span>
                    </td>

                    {/* Transaction */}
                    <td className="py-3.5 px-4">
                      {event.txHash ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-slate-600">
                            {event.txHash.slice(0, 6)}...{event.txHash.slice(-4)}
                          </span>
                          <button
                            onClick={(e) => handleCopy(e, event.txHash!)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Copy Transaction Hash"
                          >
                            {copiedTx === event.txHash ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                        <ChevronRight className="w-3 h-3 text-blue-400" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
