import { useMemo } from 'react';
import { Users, UserCheck, UserPlus, UserX } from 'lucide-react';
import { getAllDIDIdentities } from '../services/did';

interface IdentityStatsProps {
  /** Changing this value re-computes stats (used after DID creation/verification) */
  refreshKey?: number;
}

export default function IdentityStats({ refreshKey = 0 }: IdentityStatsProps) {
  const stats = useMemo(() => {
    const identities = getAllDIDIdentities();
    const verified = identities.filter(i => i.status === 'Verified').length;
    const pending = identities.filter(i => i.status === 'Pending').length;
    const revoked = identities.filter(i => i.status === 'Revoked').length;

    return [
      {
        title: 'Total Identities',
        value: String(identities.length),
        growth: 'live',
        growthColor: 'text-blue-600',
        description: 'All registered DIDs',
        icon: Users,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
      },
      {
        title: 'Verified Identities',
        value: String(verified),
        growth: `${identities.length ? Math.round((verified / identities.length) * 100) : 0}%`,
        growthColor: 'text-green-600',
        description: 'Successfully verified',
        icon: UserCheck,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
      },
      {
        title: 'Pending Verification',
        value: String(pending),
        growth: pending > 0 ? 'action needed' : 'clear',
        growthColor: pending > 0 ? 'text-amber-600' : 'text-slate-500',
        description: 'Awaiting verification',
        icon: UserPlus,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
      },
      {
        title: 'Revoked Identities',
        value: String(revoked),
        growth: revoked === 0 ? '0%' : `${revoked}`,
        growthColor: revoked === 0 ? 'text-slate-500' : 'text-red-600',
        description: 'Revoked or inactive',
        icon: UserX,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
      },
    ];
  }, [refreshKey]);

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