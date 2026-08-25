import { useState, useMemo } from 'react';
import {
  Download,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import StatCard from '../components/StatCard';
import AuditFilterBar from '../components/audit/AuditFilterBar';
import AuditTable from '../components/audit/AuditTable';
import AuditDetailsDrawer from '../components/audit/AuditDetailsDrawer';
import ExportLogsModal from '../components/audit/ExportLogsModal';
import { auditStats, auditEventsMock, type AuditLogEvent } from '../data/auditData';
import { getDIDAuditEvents } from '../lib/did/eventMappers';

export default function AuditTrail() {
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('All Types');
  const [selectedActor, setSelectedActor] = useState('All Actors');
  const [selectedResourceType, setSelectedResourceType] = useState('All Resources');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedNetwork, setSelectedNetwork] = useState('All Networks');
  const [selectedDateRange, setSelectedDateRange] = useState('All Time');

  // Interactive UI State
  const [selectedEvent, setSelectedEvent] = useState<AuditLogEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Merge live DID/blockchain ledger events with platform audit events
  const allEvents: AuditLogEvent[] = useMemo(
    () => [...getDIDAuditEvents(), ...auditEventsMock],
    []
  );

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
    selectedDateRange
  ]);

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return allEvents.filter((item) => {
      // Search matching (Event ID, Actor, Wallet, Tx, Resource, IP)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesActor = item.actor.name.toLowerCase().includes(q) || item.actor.role.toLowerCase().includes(q);
        const matchesWallet = item.actor.address.toLowerCase().includes(q);
        const matchesTx = item.txHash ? item.txHash.toLowerCase().includes(q) : false;
        const matchesResource = item.resource.name.toLowerCase().includes(q) || item.resource.id.toLowerCase().includes(q);
        const matchesIp = item.actor.ip.toLowerCase().includes(q);
        const matchesAction = item.action.toLowerCase().includes(q);

        if (!matchesId && !matchesActor && !matchesWallet && !matchesTx && !matchesResource && !matchesIp && !matchesAction) {
          return false;
        }
      }

      // Event Type
      if (selectedEventType !== 'All Types' && item.eventType !== selectedEventType) {
        return false;
      }

      // Actor
      if (selectedActor !== 'All Actors' && item.actor.name !== selectedActor) {
        return false;
      }

      // Resource Type
      if (selectedResourceType !== 'All Resources' && item.resource.type !== selectedResourceType) {
        return false;
      }

      // Status
      if (selectedStatus !== 'All Statuses' && item.status !== selectedStatus) {
        return false;
      }

      // Network
      if (selectedNetwork !== 'All Networks' && item.network !== selectedNetwork) {
        return false;
      }

      return true;
    });
  }, [
    allEvents,
    searchQuery,
    selectedEventType,
    selectedActor,
    selectedResourceType,
    selectedStatus,
    selectedNetwork
  ]);

  // Paginated Events
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  const handleSelectEvent = (event: AuditLogEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Trail</h1>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Blockchain Verified
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track and investigate all platform, identity, access, asset, and blockchain activities.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors shadow-sm"
            title="Refresh Audit Logs"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Logs
          </button>
        </div>
      </div>

      {/* 4 Compact Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {auditStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Filter and Search Controls */}
      <AuditFilterBar
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        selectedEventType={selectedEventType}
        onEventTypeChange={(val) => {
          setSelectedEventType(val);
          setCurrentPage(1);
        }}
        selectedActor={selectedActor}
        onActorChange={(val) => {
          setSelectedActor(val);
          setCurrentPage(1);
        }}
        selectedResourceType={selectedResourceType}
        onResourceTypeChange={(val) => {
          setSelectedResourceType(val);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setCurrentPage(1);
        }}
        selectedNetwork={selectedNetwork}
        onNetworkChange={(val) => {
          setSelectedNetwork(val);
          setCurrentPage(1);
        }}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={(val) => {
          setSelectedDateRange(val);
          setCurrentPage(1);
        }}
        onClearFilters={handleClearFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Audit Events Table */}
      <AuditTable
        events={paginatedEvents}
        onSelectEvent={handleSelectEvent}
        selectedEventId={selectedEvent?.id}
      />

      {/* Pagination & Counter */}
      <div className="bg-white px-5 py-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="font-semibold text-slate-900">{filteredEvents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong>–
            <strong className="font-semibold text-slate-900">{Math.min(currentPage * pageSize, filteredEvents.length)}</strong> of{' '}
            <strong className="font-semibold text-slate-900">{filteredEvents.length < allEvents.length ? `${filteredEvents.length} filtered (${allEvents.length} total)` : `${allEvents.length}`}</strong> events
          </span>

          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
            <span className="text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
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

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${currentPage === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right-Side Event Details Drawer */}
      <AuditDetailsDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedEvent(null);
        }}
      />

      {/* Export Logs Modal */}
      <ExportLogsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filteredEvents={filteredEvents}
        totalEventsCount={18642}
      />
    </div>
  );
}
