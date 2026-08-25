import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Download, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import StatCard from '../components/StatCard';
import AuditFilterBar from '../components/audit/AuditFilterBar';
import AuditTable from '../components/audit/AuditTable';
import AuditDetailsDrawer from '../components/audit/AuditDetailsDrawer';
import ExportLogsModal from '../components/audit/ExportLogsModal';
>>>>>>> 817b51c8b67faabb1453781a486f85d31c8522b5
import { type AuditLogEvent } from '../data/auditData';

import {
  getAuditLogs,
  getAuditStatistics,
  subscribeToAuditLogs,
  type AuditStatsResult,
} from '../services/auditService';
<<<<<<< HEAD
=======
import { getDIDAuditEvents } from '../lib/did/eventMappers';

export default function AuditTrail() {
  // ============================================================
  // DATA STATE
  // ============================================================

  const [events, setEvents] = useState<AuditLogEvent[]>([]);

  const [stats, setStats] = useState<AuditStatsResult[]>([
    {
      title: 'Total Events',
      value: '...',
      growth: '...',
      description: 'Lifetime platform events',
      icon: 'FileText',
    },
    {
      title: "Today's Events",
      value: '...',
      growth: '...',
      description: 'Logged in the last 24 hours',
      icon: 'Activity',
    },
    {
      title: 'Blockchain Events',
      value: '...',
      growth: '...',
      description: 'Verified on-chain transactions',
      icon: 'ShieldCheck',
    },
    {
      title: 'Security Alerts',
      value: '...',
      growth: '...',
      description: 'Requires admin attention',
      icon: 'AlertTriangle',
    },
  ]);

  const [totalFilteredCount, setTotalFilteredCount] = useState(0);
  const [totalTotalCount, setTotalTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // FILTER STATE
  // ============================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] =
    useState('All Types');
  const [selectedActor, setSelectedActor] =
    useState('All Actors');
  const [selectedResourceType, setSelectedResourceType] =
    useState('All Resources');
  const [selectedStatus, setSelectedStatus] =
    useState('All Statuses');
  const [selectedNetwork, setSelectedNetwork] =
    useState('All Networks');
  const [selectedDateRange, setSelectedDateRange] =
    useState('All Time');

  // ============================================================
  // UI STATE
  // ============================================================

  const [selectedEvent, setSelectedEvent] =
    useState<AuditLogEvent | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] =
    useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

>>>>>>> 817b51c8b67faabb1453781a486f85d31c8522b5
  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (searchQuery.trim()) count++;

    if (selectedEventType !== 'All Types') count++;

    if (selectedActor !== 'All Actors') count++;

    if (selectedResourceType !== 'All Resources') count++;

    if (selectedStatus !== 'All Statuses') count++;

    if (selectedNetwork !== 'All Networks') count++;

    if (selectedDateRange !== 'All Time') count++;

    return count;
  }, [
    searchQuery,
    selectedEventType,
    selectedActor,
    selectedResourceType,
    selectedStatus,
    selectedNetwork,
<<<<<<< HEAD
=======
    selectedDateRange
  ]);

  // Load audit data from Firestore + local DID event ledger
  const loadAuditData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [logsRes, statsRes] = await Promise.all([
        getAuditLogs({
          searchQuery,
          eventType: selectedEventType,
          actor: selectedActor,
          resourceType: selectedResourceType,
          status: selectedStatus,
          network: selectedNetwork,
          dateRange: selectedDateRange,
          page: currentPage,
          pageSize,
        }),
        getAuditStatistics(),
      ]);

      // Merge newly generated DID events if any are present
      const didEvents = getDIDAuditEvents?.() || [];
      const mergedEvents = [...didEvents, ...logsRes.events];
      const uniqueEvents = Array.from(new Map(mergedEvents.map(e => [e.id, e])).values());

      setEvents(uniqueEvents.slice(0, pageSize));
      setTotalFilteredCount(logsRes.totalFilteredCount + didEvents.length);
      setTotalTotalCount(logsRes.totalTotalCount + didEvents.length);
      setStats(statsRes);
    } catch (err: any) {
      console.error('Error loading audit trail:', err);
      setError('Unable to load audit logs. Showing fallback data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    searchQuery,
    selectedEventType,
    selectedActor,
    selectedResourceType,
    selectedStatus,
    selectedNetwork,
    selectedDateRange,
  ]);

  // ============================================================
  // LOAD AUDIT DATA FROM FIRESTORE
  // ============================================================

  const loadAuditData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const [logsRes, statsRes] = await Promise.all([
          getAuditLogs({
            searchQuery,
            eventType: selectedEventType,
            actor: selectedActor,
            resourceType: selectedResourceType,
            status: selectedStatus,
            network: selectedNetwork,
            dateRange: selectedDateRange,
            page: currentPage,
            pageSize,
          }),

          getAuditStatistics(),
        ]);

        setEvents(logsRes.events);

        setTotalFilteredCount(
          logsRes.totalFilteredCount
        );

        setTotalTotalCount(
          logsRes.totalTotalCount
        );

        setStats(statsRes);
      } catch (err) {
        console.error(
          'Error loading audit trail:',
          err
        );

        setError(
          'Unable to load audit logs. Please try refreshing.'
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      searchQuery,
      selectedEventType,
      selectedActor,
      selectedResourceType,
      selectedStatus,
      selectedNetwork,
      selectedDateRange,
      currentPage,
      pageSize,
    ]
  );

  // ============================================================
  // INITIAL LOAD + FILTER/PAGINATION UPDATES
  // ============================================================

  useEffect(() => {
    loadAuditData();
  }, [loadAuditData]);

  // ============================================================
  // REAL-TIME AUDIT LOG SUBSCRIPTION
  // ============================================================

  useEffect(() => {
    const unsubscribe = subscribeToAuditLogs(() => {
      getAuditStatistics().then(setStats).catch(() => {});
    });

    return () => unsubscribe();
  }, [loadAuditData]);

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedEventType('All Types');
    setSelectedActor('All Actors');
    setSelectedResourceType('All Resources');
    setSelectedStatus('All Statuses');
    setSelectedNetwork('All Networks');
    setSelectedDateRange('All Time');
    setCurrentPage(1);
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = () => {
    loadAuditData(true);
  };

  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));

  const handleSelectEvent = (event: AuditLogEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-8">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <div className="flex items-center gap-2">

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Audit Trail
            </h1>

            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">

              <CheckCircle2 className="w-3 h-3 text-emerald-600" />

              Blockchain Verified

            </span>

          </div>

          <p className="text-sm text-slate-500 mt-1">
            Track and investigate all platform, identity,
            access, asset, and blockchain activities.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-60"
            title="Refresh Audit Logs"
          >
            <RotateCw
              className={`w-4 h-4 ${
                isRefreshing
                  ? 'animate-spin text-blue-600'
                  : ''
              }`}
            />
          </button>

          {/* Export */}
          <button
            onClick={() =>
              setIsExportModalOpen(true)
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />

            Export Logs
          </button>

        </div>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">

          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />

          <span>{error}</span>

        </div>
      )}

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {stats.map((stat, index) => (
          <StatCard
            key={index}
            {...stat}
          />
        ))}

      </div>

      {/* ======================================================
          FILTER BAR
      ====================================================== */}

      <AuditFilterBar
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}

        selectedEventType={selectedEventType}
        onEventTypeChange={(value) => {
          setSelectedEventType(value);
          setCurrentPage(1);
        }}

        selectedActor={selectedActor}
        onActorChange={(value) => {
          setSelectedActor(value);
          setCurrentPage(1);
        }}

        selectedResourceType={selectedResourceType}
        onResourceTypeChange={(value) => {
          setSelectedResourceType(value);
          setCurrentPage(1);
        }}

        selectedStatus={selectedStatus}
        onStatusChange={(value) => {
          setSelectedStatus(value);
          setCurrentPage(1);
        }}

        selectedNetwork={selectedNetwork}
        onNetworkChange={(value) => {
          setSelectedNetwork(value);
          setCurrentPage(1);
        }}

        selectedDateRange={selectedDateRange}
        onDateRangeChange={(value) => {
          setSelectedDateRange(value);
          setCurrentPage(1);
        }}

        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* ======================================================
          AUDIT TABLE
      ====================================================== */}

      {isLoading && !isRefreshing ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">

          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />

          <p className="font-semibold text-slate-700">
            Loading audit events from Firestore...
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Retrieving cryptographically verified platform events
          </p>

        </div>
      ) : (
        <AuditTable
          events={events}
          onSelectEvent={handleSelectEvent}
          selectedEventId={selectedEvent?.id}
        />
      )}

      {/* ======================================================
          PAGINATION
      ====================================================== */}

      <div className="bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">

        <div className="flex items-center gap-3">

          <span>
            Showing <strong className="font-semibold text-slate-900">{totalFilteredCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong>–
            <strong className="font-semibold text-slate-900">{Math.min(currentPage * pageSize, totalFilteredCount)}</strong> of{' '}
            <strong className="font-semibold text-slate-900">
              {totalFilteredCount > 0
                ? (currentPage - 1) * pageSize + 1
                : 0}
            </strong>

            –

            <strong className="font-semibold text-slate-900">
              {Math.min(
                currentPage * pageSize,
                totalFilteredCount
              )}
            </strong>

            {' '}of{' '}

            <strong className="font-semibold text-slate-900">

              {totalFilteredCount <
              totalTotalCount
                ? `${totalFilteredCount} filtered (${totalTotalCount} total)`
                : `${totalTotalCount}`}
            </strong> events
          </span>

          {/* Rows per page */}
          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">

            <span className="text-slate-400">
              Rows per page:
            </span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(
                  Number(e.target.value)
                );
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>

          </div>
        </div>

        {/* Page buttons */}
        <div className="flex items-center gap-1">

          <button
            onClick={() =>
              setCurrentPage((page) =>
                Math.max(1, page - 1)
              )
            }
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() =>
                setCurrentPage(pageNum)
              }
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(
                  totalPages,
                  page + 1
                )
              )
            }
            disabled={
              currentPage === totalPages
            }
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* ======================================================
          EVENT DETAILS DRAWER
      ====================================================== */}

      <AuditDetailsDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedEvent(null);
        }}
      />

      {/* ======================================================
          EXPORT MODAL
      ====================================================== */}

      <ExportLogsModal
        isOpen={isExportModalOpen}
        onClose={() =>
          setIsExportModalOpen(false)
        }
        filteredEvents={events}
        totalEventsCount={totalTotalCount}
      />

    </div>
  );
}