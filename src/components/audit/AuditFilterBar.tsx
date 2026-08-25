import { Search, Filter, X, RotateCcw } from 'lucide-react';
import {
  eventTypeFilterOptions,
  actorFilterOptions,
  resourceTypeFilterOptions,
  statusFilterOptions,
  networkFilterOptions,
  dateRangeFilterOptions
} from '../../data/auditData';

interface AuditFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedEventType: string;
  onEventTypeChange: (value: string) => void;
  selectedActor: string;
  onActorChange: (value: string) => void;
  selectedResourceType: string;
  onResourceTypeChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedNetwork: string;
  onNetworkChange: (value: string) => void;
  selectedDateRange: string;
  onDateRangeChange: (value: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export default function AuditFilterBar({
  searchQuery,
  onSearchChange,
  selectedEventType,
  onEventTypeChange,
  selectedActor,
  onActorChange,
  selectedResourceType,
  onResourceTypeChange,
  selectedStatus,
  onStatusChange,
  selectedNetwork,
  onNetworkChange,
  selectedDateRange,
  onDateRangeChange,
  onClearFilters,
  activeFilterCount
}: AuditFilterBarProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      {/* Top row: Search input & Clear Filter */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search audit events (by Event ID, Actor, Wallet, Tx Hash, Resource, IP)..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            Clear Filters ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Bottom row: Filter Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Event Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Event Type
          </label>
          <select
            value={selectedEventType}
            onChange={(e) => onEventTypeChange(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {eventTypeFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Actor */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Actor
          </label>
          <select
            value={selectedActor}
            onChange={(e) => onActorChange(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {actorFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Resource Type
          </label>
          <select
            value={selectedResourceType}
            onChange={(e) => onResourceTypeChange(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {resourceTypeFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {statusFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Network */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Network
          </label>
          <select
            value={selectedNetwork}
            onChange={(e) => onNetworkChange(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {networkFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Date Range
          </label>
          <select
            value={selectedDateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {dateRangeFilterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
