import { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import Modal from '../common/Modal';
import type { ReportCategory, ReportFormat } from '../../services/reports';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: {
    name: string;
    category: ReportCategory;
    format: ReportFormat;
    period: string;
    description: string;
    autoDownload?: boolean;
  }) => void;
}

interface ReportPreset {
  name: string;
  category: ReportCategory;
  format: ReportFormat;
  period: string;
  description: string;
}

const PRESETS: ReportPreset[] = [
  {
    name: 'Quarterly Defense Asset Audit & Chain Custody',
    category: 'Audit & Compliance',
    format: 'PDF',
    period: 'Q2 2026',
    description: 'Comprehensive cryptographic proof of ownership, custody transfers, and NFT minting for BEL defense components.',
  },
  {
    name: 'Zero Trust Access & Role Hierarchy Verification',
    category: 'Security & Risk',
    format: 'PDF',
    period: '7 Days',
    description: 'Detailed analysis of role assignments, privilege escalations, failed authentication bursts, and MFA verifications.',
  },
  {
    name: 'Smart Contract Gas & Execution Latency Log',
    category: 'Transactions & Gas',
    format: 'CSV',
    period: '30 Days',
    description: 'Gas consumption trends across BEL Testnet contracts, execution durations, and throughput benchmarks.',
  },
  {
    name: 'Digital Asset Tokenization & Lifecycle Report',
    category: 'Digital Assets',
    format: 'PDF',
    period: 'YTD 2026',
    description: 'Hardware component certificates tokenized as verifiable NFTs, warranty metadata on-chain, and ownership records.',
  },
  {
    name: 'SOC-2 Type II Blockchain Readiness Assessment',
    category: 'Audit & Compliance',
    format: 'PDF',
    period: '30 Days',
    description: 'Evaluation against trust services criteria: Security, Availability, Processing Integrity, and Confidentiality.',
  },
];

export default function GenerateReportModal({
  isOpen,
  onClose,
  onGenerate,
}: GenerateReportModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Audit & Compliance');
  const [format, setFormat] = useState<ReportFormat>('PDF');
  const [period, setPeriod] = useState('30 Days');
  const [description, setDescription] = useState('');
  const [autoDownload, setAutoDownload] = useState(true);
  const [includeProof, setIncludeProof] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyPreset = (preset: ReportPreset) => {
    setName(preset.name);
    setCategory(preset.category);
    setFormat(preset.format);
    setPeriod(preset.period);
    setDescription(preset.description);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onGenerate({
        name: name.trim(),
        category,
        format,
        period,
        description: description.trim(),
        autoDownload,
      });
      setIsSubmitting(false);
      setName('');
      setDescription('');
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate New Ledger Report"
      subtitle="Compile, cryptographically seal, and export defense audit and asset state records."
      maxWidth="lg"
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating & Sealing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate & Export {format}
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Presets Banner */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              Quick Templates
            </span>
            <span className="text-[10px] text-slate-400">Click to autofill</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {PRESETS.map((p, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer"
              >
                {p.name.length > 28 ? p.name.slice(0, 28) + '...' : p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Report Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Report Title *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Monthly Defense Hardware NFT Custody Audit"
            className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category & Format in grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory)}
              className="w-full px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Audit & Compliance">Audit & Compliance</option>
              <option value="Digital Assets">Digital Assets</option>
              <option value="Transactions & Gas">Transactions & Gas</option>
              <option value="Security & Risk">Security & Risk</option>
              <option value="System Health">System Health</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Export Format
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['PDF', 'CSV', 'JSON', 'XLSX'] as ReportFormat[]).map((fmt) => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    format === fmt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Time Period */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Reporting Period
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {['24 Hours', '7 Days', '30 Days', 'Q2 2026', 'YTD 2026'].map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPeriod(p)}
                className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                  period === p
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Scope / Verification Notes
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add relevant audit scopes, verification notes, or ledger criteria..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
          />
        </div>

        {/* Options */}
        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={autoDownload}
              onChange={(e) => setAutoDownload(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-slate-800 font-bold">
              Automatically trigger {format} file download immediately after generation
            </span>
          </label>

          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={includeProof}
              onChange={(e) => setIncludeProof(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-slate-700">
              Include <strong className="text-slate-900 font-semibold">Zero-Knowledge cryptographic Merkle proof</strong> and SHA-256 seal
            </span>
          </label>
        </div>
      </form>
    </Modal>
  );
}
