import { useMemo } from 'react';
import { Users, UserCheck, Clock, UserX } from 'lucide-react';
import { getIdentities, type IdentityStatsSummary } from '../services/identities';
import { getAllDIDIdentities } from '../services/did';

interface IdentityStatsProps {
  stats?: IdentityStatsSummary;
  refreshKey?: number;
}

export default function IdentityStats({ stats: propStats, refreshKey = 0 }: IdentityStatsProps) {
  const cards = useMemo(() => {
    if (propStats) {
      return [
        {
          title: 'Total Registered DIDs',
          value: propStats.total.toLocaleString(),
          growth: propStats.totalGrowth || 'live',
          growthColor: 'text-emerald-700 bg-emerald-50',
          description: 'All defense personnel & nodes',
          icon: Users,
          iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
        },
        {
          title: 'Verified Identities',
          value: propStats.verified.toLocaleString(),
          growth: propStats.verifiedGrowth || '100%',
          growthColor: 'text-emerald-700 bg-emerald-50',
          description: 'Cryptographically anchored',
          icon: UserCheck,
          iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        },
        {
          title: 'Pending Verification',
          value: propStats.pending.toLocaleString(),
          growth: propStats.pendingGrowth || '0%',
          growthColor: propStats.pending > 0 ? 'text-amber-700 bg-amber-50' : 'text-slate-600 bg-slate-100',
          description: 'Awaiting clearance approval',
          icon: Clock,
          iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
        },
        {
          title: 'Revoked Identities',
          value: propStats.revoked.toLocaleString(),
          growth: propStats.revokedGrowth || '0%',
          growthColor: propStats.revoked > 0 ? 'text-rose-700 bg-rose-50' : 'text-slate-600 bg-slate-100',
          description: 'Access revoked or decommissioned',
          icon: UserX,
          iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
        },
      ];
    }

    const identities = getAllDIDIdentities?.() || getIdentities();
    const total = identities.length;
    const verified = identities.filter((i) => i.status === 'Verified').length;
    const pending = identities.filter((i) => i.status === 'Pending').length;
    const revoked = identities.filter((i) => i.status === 'Revoked').length;

    return [
      {
        title: 'Total Registered DIDs',
        value: total.toLocaleString(),
        growth: 'live',
        growthColor: 'text-emerald-700 bg-emerald-50',
        description: 'All defense personnel & nodes',
        icon: Users,
        iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      },
      {
        title: 'Verified Identities',
        value: verified.toLocaleString(),
        growth: total ? `${Math.round((verified / total) * 100)}%` : '0%',
        growthColor: 'text-emerald-700 bg-emerald-50',
        description: 'Cryptographically anchored',
        icon: UserCheck,
        iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      },
      {
        title: 'Pending Verification',
        value: pending.toLocaleString(),
        growth: pending > 0 ? `${pending} pending` : 'clear',
        growthColor: pending > 0 ? 'text-amber-700 bg-amber-50' : 'text-slate-600 bg-slate-100',
        description: 'Awaiting clearance approval',
        icon: Clock,
        iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      },
      {
        title: 'Revoked Identities',
        value: revoked.toLocaleString(),
        growth: revoked === 0 ? '0%' : `${revoked} flags`,
        growthColor: revoked === 0 ? 'text-slate-600 bg-slate-100' : 'text-rose-700 bg-rose-50',
        description: 'Access revoked or decommissioned',
        icon: UserX,
        iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      },
    ];
  }, [propStats, refreshKey]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-2xl shadow-2xs border border-slate-200 p-5 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${card.iconBg} shadow-2xs`}>
              <card.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${card.growthColor}`}>
              {card.growth}
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
            {card.value}
          </h3>
          <p className="text-xs font-bold text-slate-700">{card.title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{card.description}</p>
        </div>
      ))}
    </div>
  );
}