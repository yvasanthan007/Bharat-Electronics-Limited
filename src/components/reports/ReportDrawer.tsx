import { useState } from 'react';
import {
  X,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Calendar,
  User,
  HardDrive,
  Database,
} from 'lucide-react';
import type { ReportItem } from '../../services/reports';
import Badge from '../common/Badge';

interface ReportDrawerProps {
  report: ReportItem | null;
  onClose: () => void;
  onDownload: (report: ReportItem) => void;
}

export default function ReportDrawer({
  report,
  onClose,
  onDownload,
}: ReportDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'rawJson' | 'verification'>('summary');

  if (!report) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(report.cryptographicHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {report.id}
                </span>
                <Badge variant="success" size="sm" dot>
                  {report.status}
                </Badge>
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                {report.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 px-6 bg-white gap-6 text-xs font-semibold text-slate-500">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`py-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'verification'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              Ledger Verification
            </button>
            <button
              onClick={() => setActiveTab('rawJson')}
              className={`py-3 border-b-2 transition-all cursor-pointer ${
                activeTab === 'rawJson'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-slate-800'
              }`}
            >
              Raw On-Chain JSON
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {activeTab === 'summary' && (
              <>
                {/* Cryptographic Seal Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-100 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Cryptographically Sealed & Verified</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      This report is permanently anchored on the BEL Sovereign Testnet and validated against defense zero-knowledge specifications.
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description & Scope</h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {report.description}
                  </p>
                </div>

                {/* Key Summary Metrics Grid */}
                {report.summaryMetrics && report.summaryMetrics.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Audit Metrics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {report.summaryMetrics.map((metric, i) => (
                        <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                          <p className="text-xs text-slate-500">{metric.label}</p>
                          <p className="text-base font-bold text-slate-900 mt-1">{metric.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata Properties */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Report Metadata</h4>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Reporting Period
                      </span>
                      <span className="font-semibold text-slate-800">{report.period}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Generated By
                      </span>
                      <span className="font-semibold text-slate-800">{report.generatedBy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" /> File Format & Size
                      </span>
                      <span className="font-semibold text-slate-800">{report.format} ({report.size})</span>
                    </div>
                    {report.blockRange && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5" /> Block Range
                        </span>
                        <span className="font-mono font-semibold text-slate-800">{report.blockRange}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'verification' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-3 shadow-inner">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Ledger Hash:</span>
                    <button
                      onClick={handleCopyHash}
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="break-all text-emerald-400 font-mono">
                    {report.cryptographicHash}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Merkle Root Inclusion Proof</p>
                      <p className="text-[11px] text-slate-500">Verified at block #2,345,678</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      VALID
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Node Signature (BEL-NODE-01)</p>
                      <p className="text-[11px] text-slate-500">ECDSA secp256k1 authorized key</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      MATCHED
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rawJson' && (
              <div className="rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-300 overflow-x-auto shadow-inner">
                <pre>{JSON.stringify(report, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={handleCopyHash}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Hash Copied' : 'Copy Hash'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onDownload(report)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
              >
                <Download className="w-4 h-4" />
                Download {report.format}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
