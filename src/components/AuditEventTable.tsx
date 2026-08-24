import { useState } from 'react';
import { Search, Calendar, MoreVertical, ShieldCheck, Key, FileCode2, Database, ArrowLeftRight, Settings } from 'lucide-react';
import { mockAuditEvents, type AuditEvent } from '../data/mockAuditData';
import EventDetailsModal from './EventDetailsModal';

const tabs = ['All Events', 'Identity', 'Access', 'Transaction', 'Smart Contracts', 'Assets', 'System'];

const moduleTabMap: Record<string, string> = {
  'Identity': 'Authentication',
  'Access': 'Access Control',
  'Transaction': 'Transactions',
  'Smart Contracts': 'Smart Contracts',
  'Assets': 'Digital Assets',
  'System': 'System',
};

const moduleIcon = (module: string) => {
  const cls = 'w-4 h-4';
  switch (module) {
    case 'Authentication': return <ShieldCheck className={`${cls} text-blue-600`} />;
    case 'Access Control': return <Key className={`${cls} text-purple-600`} />;
    case 'Smart Contracts': return <FileCode2 className={`${cls} text-amber-600`} />;
    case 'Digital Assets': return <Database className={`${cls} text-cyan-600`} />;
    case 'Transactions': return <ArrowLeftRight className={`${cls} text-green-600`} />;
    default: return <Settings className={`${cls} text-slate-500`} />;
  }
};

export default function AuditEventTable() {
  const [activeTab, setActiveTab] = useState('All Events');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const filtered = mockAuditEvents.filter((e) => {
    const matchesTab = activeTab === 'All Events' || e.module === moduleTabMap[activeTab];
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      e.user.toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) ||
      e.resource.toLowerCase().includes(q) ||
      e.ip.includes(q);
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return <span className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full">Success</span>;
      case 'Failed':
        return <span className="px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full">Failed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full">Warning</span>;
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Event Log</h2>
          <div className="flex items-center gap-2 text-sm text-slate-500 border border-slate-200 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4" />
            <span>19 May 2024 – 25 May 2024</span>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-56 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Module</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-sm text-slate-500">
                    No events match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{event.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0">
                          {event.userInitials}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{event.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{event.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {moduleIcon(event.module)}
                        <span className="text-sm text-slate-600">{event.module}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">{event.resource}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{event.ip}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(event.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <span>
            Showing <span className="font-medium text-slate-900">1</span> to{' '}
            <span className="font-medium text-slate-900">{filtered.length}</span> of{' '}
            <span className="font-medium text-slate-900">12,456</span> events
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>

      <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  );
}
