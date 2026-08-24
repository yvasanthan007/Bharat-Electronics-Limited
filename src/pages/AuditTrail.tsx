import { useState } from 'react';
import { Download, Filter, Search, Radio } from 'lucide-react';
import AuditStats from '../components/AuditStats';
import EventOverview from '../components/EventOverview';
import EventCategories from '../components/EventCategories';
import RecentActivity from '../components/RecentActivity';
import AuditEventTable from '../components/AuditEventTable';

export default function AuditTrail() {
  const [liveMonitor, setLiveMonitor] = useState(false);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Audit Trail</h1>
          <p className="text-sm text-slate-500">Track, monitor and verify all platform activities and events</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Logs
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Search className="w-4 h-4" />
            Advanced Search
          </button>
          <button
            onClick={() => setLiveMonitor(!liveMonitor)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${
              liveMonitor
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Radio className={`w-4 h-4 ${liveMonitor ? 'animate-pulse' : ''}`} />
            {liveMonitor ? 'Live' : 'Live Monitor'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <AuditStats />

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EventOverview />
        </div>
        <EventCategories />
      </div>

      {/* Table + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <AuditEventTable />
        </div>
        <RecentActivity />
      </div>
    </div>
  );
}
