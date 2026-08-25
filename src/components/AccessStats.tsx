import { Shield, Key, Users, Activity } from 'lucide-react';

interface AccessStatsProps {
  rolesCount?: number;
  usersCount?: number;
  permissionsCount?: number;
}

export default function AccessStats({ rolesCount = 5, usersCount = 1248, permissionsCount = 128 }: AccessStatsProps) {
  const stats = [
    {
      title: 'Total Configured Roles',
      value: rolesCount.toString(),
      growth: '↑ 14.3%',
      growthColor: 'text-green-600',
      description: 'Active Zero-Trust roles',
      icon: Shield,
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Granular Permissions',
      value: permissionsCount.toString(),
      growth: '↑ 12.7%',
      growthColor: 'text-green-600',
      description: 'Cryptographic policies',
      icon: Key,
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Users with Access',
      value: usersCount.toLocaleString(),
      growth: '↑ 11.5%',
      growthColor: 'text-green-600',
      description: 'Authorized DID identities',
      icon: Users,
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Active Node Sessions',
      value: '316',
      growth: 'Live',
      growthColor: 'text-blue-600',
      description: 'Quorum nodes verifying access',
      icon: Activity,
      iconBg: 'bg-green-100 dark:bg-emerald-900/40',
      iconColor: 'text-green-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700`}>
              {stat.growth}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-0.5">
              {stat.value}
            </h3>
            <p className="text-xs font-bold text-slate-600 mb-0.5">{stat.title}</p>
            <p className="text-[11px] text-slate-400 font-medium">{stat.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
