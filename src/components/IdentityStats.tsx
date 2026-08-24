import { Users, UserCheck, UserPlus, UserX } from 'lucide-react';

export default function IdentityStats() {
  const stats = [
    {
      title: 'Total Identities',
      value: '1,248',
      growth: '↑ 12.5%',
      growthColor: 'text-green-600',
      description: 'All registered identities',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Verified Identities',
      value: '1,186',
      growth: '↑ 10.3%',
      growthColor: 'text-green-600',
      description: 'Successfully verified',
      icon: UserCheck,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Pending Verification',
      value: '62',
      growth: '↓ 4.2%',
      growthColor: 'text-amber-600',
      description: 'Awaiting verification',
      icon: UserPlus,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Revoked Identities',
      value: '0',
      growth: '0%',
      growthColor: 'text-slate-500',
      description: 'Revoked or inactive',
      icon: UserX,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
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
