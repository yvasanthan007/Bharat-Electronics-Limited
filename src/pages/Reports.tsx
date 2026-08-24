import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Clock,
  Download,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import {
  getReports,
  getReportStats,
  getScheduledReports,
  generateReport,
  deleteReport,
  toggleScheduledReport
} from '../services/reports';
import type {
  ReportItem,
  ReportStats,
  ScheduledReport
} from '../services/reports';
import ReportStatsCards from '../components/reports/ReportStatsCards';
import ReportsOverviewCharts from '../components/reports/ReportsOverviewCharts';
import ReportsTable from '../components/reports/ReportsTable';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'all' | 'scheduled'>('all');
  
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
      addToast(
        'success',
        'Report Generated & Sealed',
        `Report "${newReport.name}" (${newReport.format}) created with on-chain cryptographic proof.`
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
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${report.id}_${report.name.replace(/\s+/g, '_')}.${report.format.toLowerCase()}`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast(
      'success',
      'Download Started',
      `Downloading ${report.format} archive for "${report.name}".`
    );
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
            Generate, verify, and export tamper-proof compliance logs, asset tokenization trails, and transaction ledgers.
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
            onClick={() => setActiveTab('scheduled')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            Schedules ({schedules.filter(s => s.active).length})
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

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            All Reports ({reports.length})
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics & Compliance Charts
          </button>

          <button
            onClick={() => setActiveTab('scheduled')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'scheduled'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Automated Schedules ({schedules.length})
          </button>
        </div>

        <button
          onClick={loadData}
          title="Refresh Data"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content: All Reports View */}
      {activeTab === 'all' && (
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

      {/* Tab Content: Analytics & Compliance Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <ReportsOverviewCharts stats={stats} />
        </div>
      )}

      {/* Tab Content: Scheduled Reports */}
      {activeTab === 'scheduled' && (
        <div className="space-y-6">
          <ScheduledReportsSection
            schedules={schedules}
            onToggleSchedule={handleToggleSchedule}
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
