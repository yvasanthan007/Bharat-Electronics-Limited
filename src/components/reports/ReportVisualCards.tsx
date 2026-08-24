import { useState } from 'react';
import {
  Download,
  Eye,
  Trash2,
  Copy,
  Check,
  FileText,
  Shield,
  Layers,
  Activity,
  Server,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Sparkles
} from 'lucide-react';
import type { ReportItem, ReportCategory, ReportFormat } from '../../services/reports';
import Badge, { type BadgeVariant } from '../common/Badge';

interface ReportVisualCardsProps {
  reports: ReportItem[];
  onViewReport: (report: ReportItem) => void;
  onDownloadReport: (report: ReportItem) => void;
  onDeleteReport: (id: string) => void;
}

const categoryColors: Record<ReportCategory, { bg: string; border: string; text: string; lightBg: string; bar: string }> = {
  'Audit & Compliance': {
    bg: 'from-blue-600 to-indigo-600',
    border: 'border-blue-200 hover:border-blue-300',
    text: 'text-blue-600',
    lightBg: 'bg-blue-50',
    bar: 'bg-blue-600'
  },
  'Digital Assets': {
    bg: 'from-purple-600 to-violet-600',
    border: 'border-purple-200 hover:border-purple-300',
    text: 'text-purple-600',
    lightBg: 'bg-purple-50',
    bar: 'bg-purple-600'
  },
  'Transactions & Gas': {
    bg: 'from-emerald-600 to-teal-600',
    border: 'border-emerald-200 hover:border-emerald-300',
    text: 'text-emerald-600',
    lightBg: 'bg-emerald-50',
    bar: 'bg-emerald-600'
  },
  'Security & Risk': {
    bg: 'from-amber-500 to-orange-600',
    border: 'border-amber-200 hover:border-amber-300',
    text: 'text-amber-600',
    lightBg: 'bg-amber-50',
    bar: 'bg-amber-500'
  },
  'System Health': {
    bg: 'from-slate-600 to-slate-800',
    border: 'border-slate-200 hover:border-slate-300',
    text: 'text-slate-700',
    lightBg: 'bg-slate-50',
    bar: 'bg-slate-600'
  }
};

const categoryIcons: Record<ReportCategory, any> = {
  'Audit & Compliance': Shield,
  'Digital Assets': Layers,
  'Transactions & Gas': Activity,
  'Security & Risk': Shield,
  'System Health': Server,
};

const categoryBadgeVariants: Record<ReportCategory, BadgeVariant> = {
  'Audit & Compliance': 'info',
  'Digital Assets': 'purple',
  'Transactions & Gas': 'success',
  'Security & Risk': 'warning',
  'System Health': 'neutral',
};

const formatIcons: Record<ReportFormat, any> = {
  PDF: FileText,
  CSV: FileSpreadsheet,
  JSON: FileCode,
  XLSX: FileSpreadsheet,
};

export default function ReportVisualCards({
  reports,
  onViewReport,
  onDownloadReport,
  onDeleteReport,
}: ReportVisualCardsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (hash: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {reports.map((report) => {
        const CategoryIcon = categoryIcons[report.category] || Shield;
        const FormatIcon = formatIcons[report.format] || FileText;
        const styling = categoryColors[report.category] || categoryColors['Audit & Compliance'];
        const recordPercentage = Math.min(100, Math.round((report.recordsCount / 6000) * 100));

        return (
          <div
            key={report.id}
            onClick={() => onViewReport(report)}
            className={`bg-white rounded-2xl border ${styling.border} shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group`}
          >
            {/* Top Accent Strip */}
            <div className="p-5 pb-4 space-y-3">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <Badge variant={categoryBadgeVariants[report.category]} size="sm">
                  <CategoryIcon className="w-3.5 h-3.5" />
                  {report.category}
                </Badge>

                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    <FormatIcon className="w-3 h-3" />
                    {report.format}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-medium">
                    {report.size}
                  </span>
                </div>
              </div>

              {/* Title & ID */}
              <div>
                <span className="font-mono text-[11px] font-bold text-slate-400">
                  {report.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mt-0.5 line-clamp-2">
                  {report.name}
                </h3>
              </div>

              {/* Visual Meter Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    {report.recordsCount.toLocaleString()} Records Indexed
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{report.period}</span>
                </div>

                {/* Progress bar graph for record depth */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${styling.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(15, recordPercentage)}%` }}
                  />
                </div>
              </div>

              {/* Cryptographic Hash Bar */}
              <div
                onClick={(e) => handleCopy(report.cryptographicHash, report.id, e)}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors text-[11px]"
              >
                <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate max-w-[200px]">
                    {report.cryptographicHash.substring(0, 10)}...{report.cryptographicHash.substring(report.cryptographicHash.length - 8)}
                  </span>
                </div>

                <button
                  type="button"
                  title="Copy Hash"
                  className="text-slate-400 hover:text-slate-700 p-0.5"
                >
                  {copiedId === report.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="p-3.5 px-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{report.generatedAt}</span>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onViewReport(report)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 rounded-lg text-xs font-semibold text-slate-700 transition-all shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
                <button
                  onClick={() => onDownloadReport(report)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white transition-all shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
                <button
                  onClick={() => onDeleteReport(report.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
