import { Users, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import type { UsersSummaryData } from '../../services/users';

interface Props {
  summary: UsersSummaryData;
}

const metrics = (s: UsersSummaryData) => [
  { label: 'Total Identities', value: s.total, icon: Users, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
  { label: 'Active Users', value: s.active, icon: UserCheck, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
  { label: 'Inactive Users', value: s.inactive, icon: UserX, color: 'bg-slate-50 text-slate-500', border: 'border-slate-200' },
  { label: 'Admins', value: s.admins, icon: ShieldCheck, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
];

export default function IdentitiesSummary({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics(summary).map(({ label, value, icon: Icon, color, border }) => (
        <div key={label} className={`bg-white rounded-xl border ${border} p-5 flex items-center gap-4 shadow-sm`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
