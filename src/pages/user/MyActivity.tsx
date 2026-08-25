import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle, User, ShieldCheck } from 'lucide-react';
import { getUserActivities, type ActivityItem } from '../../services/userPortal';

const statusStyle: Record<string, string> = {
  Success: 'bg-green-50 text-green-700 border border-green-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Failed:  'bg-red-50 text-red-700 border border-red-200',
};

const iconBg: Record<string, string> = {
  Success: 'bg-green-100 text-green-600',
  Pending: 'bg-amber-100 text-amber-600',
  Failed:  'bg-red-100 text-red-600',
};

const activityIcons: Record<string, React.ElementType> = {
  Auth:     CheckCircle2,
  Access:   AlertCircle,
  Identity: ShieldCheck,
  Assets:   CheckCircle2,
  Profile:  User,
};

const failedIcon = XCircle;

export default function MyActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getUserActivities();
      setActivities(data);
      setLoading(false);
    };
    load();
  }, []);

  const filters = ['All', ...Array.from(new Set(activities.map(a => a.category)))];
  const filtered = filter === 'All' ? activities : activities.filter(a => a.category === filter);

  // Group by date
  const grouped = filtered.reduce<Record<string, ActivityItem[]>>((acc, act) => {
    if (!acc[act.date]) acc[act.date] = [];
    acc[act.date].push(act);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Activity</h2>
          <p className="text-sm text-slate-500 mt-0.5">A full log of your account activity.</p>
        </div>
        <div className="flex gap-2 text-xs flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                f === filter ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(grouped).length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-400">
          No activities found
        </div>
      ) : (
        Object.entries(grouped).map(([date, acts]) => (
          <div key={date} className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{date}</p>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-50">
              {acts.map((act) => {
                const Icon = act.status === 'Failed' ? failedIcon : (activityIcons[act.category] || CheckCircle2);
                return (
                  <div key={act.id} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg[act.status]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{act.title}</p>
                      <p className="text-xs text-slate-500 truncate">{act.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 text-right">
                      <span className="text-xs text-slate-400">{act.time}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[act.status]}`}>
                        {act.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
