import { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  User, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  Code
} from 'lucide-react';
import type { AuditLogEvent } from '../../data/auditData';

interface AuditDetailsDrawerProps {
  event: AuditLogEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditDetailsDrawer({
  event,
  isOpen,
  onClose
}: AuditDetailsDrawerProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !event) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{event.id}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(event.status)}`}>
                  {event.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">{event.action} • {event.timestamp}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Tamper-Proof Blockchain Integrity Card */}
          <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/30 rounded-xl border border-emerald-200/80 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tamper-Proof Audit Chain</h3>
                  <p className="text-xs text-slate-600">Cryptographically chained to BEL Distributed Trust Ledger</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Integrity Status: Verified
              </div>
            </div>

            {/* Cryptographic Hash Chain */}
            <div className="bg-white/90 rounded-lg border border-emerald-100 p-4 space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between items-center text-slate-500 mb-1 text-[11px] uppercase tracking-wider font-sans font-semibold">
                  <span>Previous Event Hash (Block-Linked)</span>
                  <button
                    onClick={() => handleCopy('prevHash', event.integrity.prevEventHash)}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-700 font-sans"
                  >
                    {copiedKey === 'prevHash' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'prevHash' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200 text-slate-700 break-all select-all">
                  {event.integrity.prevEventHash}
                </div>
              </div>

              <div className="flex justify-center text-emerald-600">
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>

              <div>
                <div className="flex justify-between items-center text-slate-500 mb-1 text-[11px] uppercase tracking-wider font-sans font-semibold">
                  <span>Current Event Hash (Sha-256 / Keccak-256)</span>
                  <button
                    onClick={() => handleCopy('currHash', event.integrity.currEventHash)}
                    className="flex items-center gap-1 text-slate-400 hover:text-slate-700 font-sans"
                  >
                    {copiedKey === 'currHash' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'currHash' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-emerald-50/50 p-2 rounded border border-emerald-200 text-emerald-900 font-semibold break-all select-all">
                  {event.integrity.currEventHash}
                </div>
              </div>
            </div>

            {/* Block & Gas Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                <span className="text-slate-500 block text-[11px]">Block Number</span>
                <span className="font-semibold text-slate-900 font-mono">{event.integrity.blockNumber}</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                <span className="text-slate-500 block text-[11px]">Gas Used</span>
                <span className="font-semibold text-slate-900">{event.integrity.gasUsed}</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                <span className="text-slate-500 block text-[11px]">Consensus Engine</span>
                <span className="font-semibold text-slate-900">{event.network}</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                <span className="text-slate-500 block text-[11px]">Algorithm</span>
                <span className="font-semibold text-slate-900 truncate" title={event.integrity.algorithm}>
                  {event.integrity.algorithm.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Tx Hash Row with View on Explorer button */}
            {event.txHash && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-emerald-200/60">
                <div className="flex items-center gap-2 min-w-0 font-mono text-xs">
                  <span className="text-slate-500 font-sans">Tx Hash:</span>
                  <span className="text-slate-800 font-semibold truncate select-all">{event.txHash}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy('txHash', event.txHash!)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    {copiedKey === 'txHash' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'txHash' ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href={`https://etherscan.io/tx/${event.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    View on Explorer
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Actor & Resource Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Actor Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Actor Information</h4>
              </div>
              
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Name & Role</span>
                  <span className="font-semibold text-slate-900">{event.actor.name} ({event.actor.role})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Wallet Address</span>
                  <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded border border-slate-200 mt-0.5">
                    <span className="font-mono text-[11px] text-slate-700 truncate select-all">{event.actor.address}</span>
                    <button
                      onClick={() => handleCopy('actorAddress', event.actor.address)}
                      className="text-slate-400 hover:text-slate-700 p-0.5 shrink-0 ml-1"
                    >
                      {copiedKey === 'actorAddress' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-500 block">IP Address</span>
                    <span className="font-mono font-medium text-slate-800">{event.actor.ip}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Client Device</span>
                    <span className="font-medium text-slate-800 truncate block" title={event.actor.device}>
                      {event.actor.device}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Layers className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Target Resource</h4>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Resource Name</span>
                  <span className="font-semibold text-slate-900">{event.resource.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Resource ID</span>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200 font-mono text-[11px] text-slate-700 mt-0.5 truncate select-all">
                    {event.resource.id}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-500 block">Resource Type</span>
                    <span className="font-medium text-slate-800">{event.resource.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Network</span>
                    <span className="font-medium text-slate-800">{event.network}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* State Transition Diff */}
          {(event.prevState || event.newState) && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">State Transition Diff</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Previous State */}
                <div className="bg-rose-50/40 rounded-lg p-3 border border-rose-100 space-y-1">
                  <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Previous State
                  </span>
                  <pre className="text-[11px] font-mono text-slate-700 bg-white p-2.5 rounded border border-rose-100 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(event.prevState || { status: 'None' }, null, 2)}
                  </pre>
                </div>

                {/* New State */}
                <div className="bg-emerald-50/40 rounded-lg p-3 border border-emerald-100 space-y-1">
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    New State
                  </span>
                  <pre className="text-[11px] font-mono text-slate-700 bg-white p-2.5 rounded border border-emerald-100 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(event.newState || { status: 'Updated' }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Event Metadata JSON */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Event Metadata & Payload</h4>
              </div>
              <button
                onClick={() => handleCopy('metadata', JSON.stringify(event.metadata, null, 2))}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                {copiedKey === 'metadata' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'metadata' ? 'Copied' : 'Copy JSON'}
              </button>
            </div>

            <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-lg text-xs font-mono overflow-x-auto">
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Recorded by BEL Distributed Trust Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}
