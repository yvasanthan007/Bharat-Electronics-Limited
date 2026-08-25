import { Activity, CheckCircle2, XCircle, Users } from 'lucide-react';

export default function AuditStats() {
  const stats = [
    {
      title: 'Total Events',
      value: '12,456',
      trend: '↑ 18.7%',
      subtitle: 'All recorded events',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trendColor: 'text-green-600',
    },
    {
      title: 'Successful Events',
      value: '11,324',
      trend: '↑ 16.3%',
      subtitle: 'Successful actions',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trendColor: 'text-green-600',
    },
    {
      title: 'Failed Events',
      value: '321',
      trend: '↓ 6.2%',
      subtitle: 'Failed or blocked actions',
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      trendColor: 'text-green-600',
    },
    {
      title: 'Active Users',
      value: '186',
      trend: 'Live',
      subtitle: 'Users active today',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trendColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <span className={`text-sm font-medium ${stat.trendColor}`}>{stat.trend}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
            <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
            <p className="text-xs text-slate-500">{stat.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
