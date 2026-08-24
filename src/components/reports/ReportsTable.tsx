import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Eye,
  Trash2,
  Copy,
  Check,
  ArrowUpDown,
  FileText,
  Shield,
  Layers,
  Activity,
  Server,
  FileSpreadsheet,
  FileCode,
  FileDown
} from 'lucide-react';
import type { ReportItem, ReportCategory, ReportFormat } from '../../services/reports';
import Badge, { type BadgeVariant } from '../common/Badge';

interface ReportsTableProps {
  reports: ReportItem[];
  onViewReport: (report: ReportItem) => void;
  onDownloadReport: (report: ReportItem) => void;
  onDeleteReport: (id: string) => void;
}

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

export default function ReportsTable({
  reports,
  onViewReport,
  onDownloadReport,
  onDeleteReport,
}: ReportsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [sortField, setSortField] = useState<'generatedAt' | 'name' | 'size'>('generatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleCopyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSort = (field: 'generatedAt' | 'name' | 'size') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.generatedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cryptographicHash.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || r.category === selectedCategory;

      const matchesFormat =
        selectedFormat === 'All' || r.format === selectedFormat;

      return matchesSearch && matchesCategory && matchesFormat;
    }).sort((a, b) => {
      if (sortField === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortField === 'size') {
        const sizeA = parseFloat(a.size);
        const sizeB = parseFloat(b.size);
        return sortOrder === 'asc' ? sizeA - sizeB : sizeB - sizeA;
      }
      // default: generatedAt
      return sortOrder === 'asc'
        ? a.id.localeCompare(b.id)
        : b.id.localeCompare(a.id);
    });
  }, [reports, searchTerm, selectedCategory, selectedFormat, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage]);

  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedReports.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedReports.map((r) => r.id));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search reports by ID, name, hash, or author..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Audit & Compliance">Audit & Compliance</option>
            <option value="Digital Assets">Digital Assets</option>
            <option value="Transactions & Gas">Transactions & Gas</option>
            <option value="Security & Risk">Security & Risk</option>
            <option value="System Health">System Health</option>
          </select>

          {/* Format Selector */}
          <select
            value={selectedFormat}
            onChange={(e) => {
              setSelectedFormat(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Formats</option>
            <option value="PDF">PDF Documents</option>
            <option value="CSV">CSV Spreadsheets</option>
            <option value="JSON">JSON Data Feeds</option>
            <option value="XLSX">Excel Sheets</option>
          </select>

          {selectedRows.length > 0 && (
            <button
              onClick={() => {
                alert(`Exporting ${selectedRows.length} reports in batch archive.`);
                setSelectedRows([]);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              Export Selected ({selectedRows.length})
            </button>
          )}
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    paginatedReports.length > 0 &&
                    selectedRows.length === paginatedReports.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th
                className="py-3.5 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1.5">
                  Report ID & Title
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Period</th>
              <th className="py-3.5 px-4">Generated By</th>
              <th className="py-3.5 px-4">Format & Size</th>
              <th className="py-3.5 px-4">Cryptographic Hash</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedReports.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <p className="font-medium text-slate-700">No reports found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search filters</p>
                </td>
              </tr>
            ) : (
              paginatedReports.map((report) => {
                const CategoryIcon = categoryIcons[report.category] || Shield;
                const FormatIcon = formatIcons[report.format] || FileText;
                const isSelected = selectedRows.includes(report.id);

                return (
                  <tr
                    key={report.id}
                    onClick={() => onViewReport(report)}
                    className={`hover:bg-slate-50/80 cursor-pointer transition-colors group ${
                      isSelected ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleSelectRow(report.id, e as any)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Report ID & Name */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <FormatIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                            {report.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] text-slate-500 font-medium">
                              {report.id}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] text-slate-500">
                              {report.recordsCount.toLocaleString()} records
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <Badge variant={categoryBadgeVariants[report.category]} size="sm">
                        <CategoryIcon className="w-3 h-3" />
                        {report.category}
                      </Badge>
                    </td>

                    {/* Period */}
                    <td className="py-4 px-4 text-xs font-medium text-slate-600">
                      {report.period}
                    </td>

                    {/* Generated By */}
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-xs font-medium text-slate-800">{report.generatedBy}</p>
                        <p className="text-[11px] text-slate-400">{report.generatedAt}</p>
                      </div>
                    </td>

                    {/* Format & Size */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {report.format}
                        </span>
                        <span className="text-xs text-slate-500">{report.size}</span>
                      </div>
                    </td>

                    {/* Cryptographic Hash */}
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                          {report.cryptographicHash.substring(0, 8)}...{report.cryptographicHash.substring(report.cryptographicHash.length - 6)}
                        </code>
                        <button
                          onClick={(e) => handleCopyHash(report.cryptographicHash, e)}
                          title="Copy Full Hash"
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          {copiedHash === report.cryptographicHash ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <Badge variant="success" size="sm" dot>
                        {report.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewReport(report)}
                          title="Preview Report Details"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDownloadReport(report)}
                          title={`Download ${report.format}`}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteReport(report.id)}
                          title="Delete Report"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {filteredReports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-800">
            {Math.min(currentPage * itemsPerPage, filteredReports.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-800">{filteredReports.length}</span> reports
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
