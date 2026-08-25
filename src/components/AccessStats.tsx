import { Shield, Key, Users, Activity } from 'lucide-react';

export default function AccessStats() {
  const stats = [
    {
      title: 'Total Roles',
      value: '24',
      growth: '↑ 8.3%',
      growthColor: 'text-green-600',
      description: 'Active roles configured',
      icon: Shield,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Permissions',
      value: '128',
      growth: '↑ 12.7%',
      growthColor: 'text-green-600',
      description: 'System permissions',
      icon: Key,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Users with Access',
      value: '1,186',
      growth: '↑ 11.5%',
      growthColor: 'text-green-600',
      description: 'Users assigned to roles',
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Active Sessions',
      value: '316',
      growth: 'Live',
      growthColor: 'text-blue-600',
      description: 'Current active sessions',
      icon: Activity,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.iconBg}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <span className={`text-sm font-medium ${stat.growthColor}`}>
              {stat.growth}
            </span>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            {stat.value}
          </h3>
          <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
          <p className="text-xs text-slate-500">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}
