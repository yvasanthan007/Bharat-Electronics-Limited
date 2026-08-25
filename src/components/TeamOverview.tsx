import {
  Users,
  ShieldCheck,
  Database,
  TrendingUp,
  Download,
} from 'lucide-react';

interface TeamOverviewProps {
  activeMembers: number;
  totalMembers: number;
  activeAccess: number;
  assetsOwned: number;
  requestsThisMonth: number;
  onExport: () => void;
}

export default function TeamOverview({
  activeMembers,
  totalMembers,
  activeAccess,
  assetsOwned,
  requestsThisMonth,
  onExport,
}: TeamOverviewProps) {
  const activePercent = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  const metrics = [
    {
      label: 'Active Members',
      value: activeMembers,
      sub: `${activePercent}% of total team`,
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Access',
      value: activeAccess,
      sub: 'Permissions granted',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Assets Owned',
      value: assetsOwned,
      sub: 'Across team',
      icon: Database,
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Requests This Month',
      value: requestsThisMonth,
      sub: '+12% from last month',
      icon: TrendingUp,
      iconBg: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">Team Overview</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            This Month
          </span>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-5 flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${metric.iconBg}`}>
              <metric.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{metric.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{metric.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
