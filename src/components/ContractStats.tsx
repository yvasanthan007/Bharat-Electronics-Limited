import { FileCode2, Activity, PlayCircle, Percent } from 'lucide-react';

export default function ContractStats() {
  const stats = [
    {
      title: 'Total Contracts',
      value: '32',
      trend: '↑ 14.3%',
      subtitle: 'All deployed contracts',
      icon: FileCode2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trendColor: 'text-green-600',
    },
    {
      title: 'Active Contracts',
      value: '28',
      trend: '↑ 16.7%',
      subtitle: 'Currently active',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trendColor: 'text-green-600',
    },
    {
      title: 'Total Executions',
      value: '1,248',
      trend: '↑ 21.8%',
      subtitle: 'All time executions',
      icon: PlayCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trendColor: 'text-green-600',
    },
    {
      title: 'Success Rate',
      value: '98.6%',
      trend: '↑ 2.4%',
      subtitle: 'Execution success rate',
      icon: Percent,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trendColor: 'text-green-600',
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
            <span className={`text-sm font-medium ${stat.trendColor}`}>
              {stat.trend}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">{stat.title}</h3>
            <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
            <p className="text-xs text-slate-500">{stat.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
