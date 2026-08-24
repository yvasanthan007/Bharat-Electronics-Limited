import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Clock,
  Download,
  BarChart3,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  Search
} from 'lucide-react';
import {
  getReports,
  getReportStats,
  getScheduledReports,
  generateReport,
  deleteReport,
  toggleScheduledReport,
  triggerScheduledReport,
} from '../services/reports';
import type {
  ReportItem,
  ReportStats,
  ScheduledReport
} from '../services/reports';
import { downloadReportFile } from '../utils/pdfGenerator';
import ReportStatsCards from '../components/reports/ReportStatsCards';
import ReportsOverviewCharts from '../components/reports/ReportsOverviewCharts';
import ReportsTable from '../components/reports/ReportsTable';
import ReportVisualCards from '../components/reports/ReportVisualCards';
import ReportDrawer from '../components/reports/ReportDrawer';
import GenerateReportModal from '../components/reports/GenerateReportModal';
import ScheduledReportsSection from '../components/reports/ScheduledReportsSection';
import { CardSkeleton, TableSkeleton } from '../components/common/Skeleton';
import Toast from '../components/common/Toast';
import type { ToastMessage } from '../components/common/Toast';
import Badge from '../components/common/Badge';

export default function Reports() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'cards' | 'table' | 'scheduled'>('analytics');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Drawer & Modal States
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'error' | 'warning', title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsData, statsData, schedulesData] = await Promise.all([
        getReports(),
        getReportStats(),
        getScheduledReports(),
      ]);
      setReports(reportsData);
      setStats(statsData);
      setSchedules(schedulesData);
    } catch (err) {
      addToast('error', 'Failed to load reports', 'Please refresh the page to try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (params: any) => {
    try {
      const newReport = await generateReport(params);
      setReports((prev) => [newReport, ...prev]);

      if (params.autoDownload !== false) {
        downloadReportFile(newReport);
      }

      setSelectedReport(newReport);

      addToast(
        'success',
        'Report Generated & Exported',
        `Report "${newReport.name}" (${newReport.format}) created with cryptographic seal and exported.`
      );
    } catch (err) {
      addToast('error', 'Generation Failed', 'Could not compile on-chain report.');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (confirm(`Are you sure you want to delete report ${id}?`)) {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
      addToast('info', 'Report Removed', `Report ${id} has been deleted.`);
    }
  };

  const handleDownload = (report: ReportItem) => {
    try {
      downloadReportFile(report);
      addToast(
        'success',
        `${report.format} Exported Successfully`,
        `Report "${report.name}" (${report.format}) generated and downloaded.`
      );
    } catch (err: any) {
      console.error('Download error:', err);
      addToast(
        'error',
        'Download Failed',
        `Could not generate ${report.format} document: ${err.message || 'Unknown error'}`
      );
    }
  };

  const handleRunSchedule = async (id: string) => {
    try {
      const result = await triggerScheduledReport(id);
      if (result) {
        setReports((prev) => [result.report, ...prev]);
        setSchedules((prev) =>
          prev.map((s) => (s.id === id ? { ...s, lastGenerated: 'Just now' } : s))
        );

        downloadReportFile(result.report);

        addToast(
          'success',
          'Automated Job Executed & Downloaded',
          `Report "${result.report.name}" (${result.report.format}) generated, downloaded, and dispatched to ${result.schedule.recipients.join(', ')}.`
        );
      }
    } catch (err) {
      addToast('error', 'Execution Failed', `Could not trigger scheduled job ${id}.`);
    }
  };

  const handleExportAll = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reports, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BEL_All_Ledger_Reports_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast('success', 'Export Complete', `All ${reports.length} report manifests exported as JSON archive.`);
  };

  const handleToggleSchedule = async (id: string) => {
    const updated = await toggleScheduledReport(id);
    if (updated) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: updated.active } : s))
      );
      addToast(
        'info',
        updated.active ? 'Schedule Activated' : 'Schedule Paused',
        `Automated report job ${id} is now ${updated.active ? 'active' : 'paused'}.`
      );
    }
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || r.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [reports, searchTerm, selectedCategory]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Ledger Audits</h1>
            <Badge variant="info" size="sm" dot>Enterprise Verified</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            Interactive visual charts, bar metrics, compliance gauges, and cryptographic state archives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Archive
          </button>

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <ReportStatsCards stats={stats} />
      )}

      {/* View Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Charts & Visual Analytics
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Visual Cards Grid ({reports.length})
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'table'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            Detail Table View
          </button>

          <button
            onClick={() => setActiveTab('scheduled')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'scheduled'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Scheduled Jobs ({schedules.length})
          </button>
        </div>

        <button
          onClick={loadData}
          title="Refresh Data"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer self-end sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Charts & Visual Analytics */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          <ReportsOverviewCharts stats={stats} />

          {/* Quick Preview of Recent Visual Cards */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Sealed Reports</h3>
                <p className="text-xs text-slate-500">Visual cards representation with live progress metrics</p>
              </div>
              <button
                onClick={() => setActiveTab('cards')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                View All {reports.length} Cards &rarr;
              </button>
            </div>

            <ReportVisualCards
              reports={reports.slice(0, 3)}
              onViewReport={(rep) => setSelectedReport(rep)}
              onDownloadReport={handleDownload}
              onDeleteReport={handleDeleteReport}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Visual Cards Grid with Filter Bar */}
      {activeTab === 'cards' && (
        <div className="space-y-5">
          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter visual report cards..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Audit & Compliance">Audit & Compliance</option>
                <option value="Digital Assets">Digital Assets</option>
                <option value="Transactions & Gas">Transactions & Gas</option>
                <option value="Security & Risk">Security & Risk</option>
                <option value="System Health">System Health</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <ReportVisualCards
              reports={filteredReports}
              onViewReport={(rep) => setSelectedReport(rep)}
              onDownloadReport={handleDownload}
              onDeleteReport={handleDeleteReport}
            />
          )}
        </div>
      )}

      {/* Tab 3: Detailed Table */}
      {activeTab === 'table' && (
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <TableSkeleton rows={6} cols={7} />
            </div>
          ) : (
            <ReportsTable
              reports={reports}
              onViewReport={(rep) => setSelectedReport(rep)}
              onDownloadReport={handleDownload}
              onDeleteReport={handleDeleteReport}
            />
          )}
        </div>
      )}

      {/* Tab 4: Scheduled Reports */}
      {activeTab === 'scheduled' && (
        <div className="space-y-6">
          <ScheduledReportsSection
            schedules={schedules}
            onToggleSchedule={handleToggleSchedule}
            onRunSchedule={handleRunSchedule}
            onAddSchedule={() => setIsGenerateModalOpen(true)}
          />
        </div>
      )}

      {/* Details Side Drawer */}
      <ReportDrawer
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onDownload={handleDownload}
      />

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleGenerateReport}
      />
    </div>
  );
}
