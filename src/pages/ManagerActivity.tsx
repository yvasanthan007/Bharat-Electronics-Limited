import { useState } from 'react';
import { Search } from 'lucide-react';
import ActivityTimeline from '../components/ActivityTimeline';
import type { ActivityItem } from '../data/managerMockData';

interface ManagerActivityProps {
  activities: ActivityItem[];
}

const categoryFilters = ['All', 'Access', 'Assets', 'Team', 'Authentication'] as const;

export default function ManagerActivity({ activities }: ManagerActivityProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<typeof categoryFilters[number]>('All');

  const filtered = activities.filter((a) => {
    const matchesSearch =
      a.user.toLowerCase().includes(search.toLowerCase()) ||
      a.action.toLowerCase().includes(search.toLowerCase()) ||
      a.resource.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-[1600px] mx-auto pb-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Team Activity</h2>
        <p className="text-slate-500 mt-1">Monitor all team activities and events</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {categoryFilters.map((f) => (
              <button
                key={f}
                onClick={() => setCategoryFilter(f)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  categoryFilter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="p-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No activities found
            </div>
          ) : (
            <ActivityTimeline activities={filtered} showSections />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          Showing {filtered.length} activities
        </div>
      </div>
    </div>
  );
}
