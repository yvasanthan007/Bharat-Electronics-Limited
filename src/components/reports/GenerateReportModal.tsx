import { useState } from 'react';
import { Sparkles } from 'lucide-react';
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
  }) => void;
}

export default function GenerateReportModal({
  isOpen,
  onClose,
  onGenerate,
}: GenerateReportModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Audit & Compliance');
  const [format, setFormat] = useState<ReportFormat>('PDF');
  const [period, setPeriod] = useState('Last 30 Days');
  const [description, setDescription] = useState('');
  const [includeProof, setIncludeProof] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Proof...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate & Seal Report
              </>
            )}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    format === fmt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
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
                className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all text-center ${
                  period === p
                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
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
            Scope / Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add relevant audit scopes, verification notes, or ledger criteria..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
          />
        </div>

        {/* Proof Option checkbox */}
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-xs">
          <input
            type="checkbox"
            id="proofCheck"
            checked={includeProof}
            onChange={(e) => setIncludeProof(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="proofCheck" className="text-slate-700 cursor-pointer select-none">
            Include <span className="font-semibold text-slate-900">Zero-Knowledge cryptographic Merkle proof</span> and SHA-256 seal
          </label>
        </div>
      </form>
    </Modal>
  );
}
