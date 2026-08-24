import { FileText, Clock, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import type { ReportStats } from '../../services/reports';

interface ReportStatsCardsProps {
  stats: ReportStats;
}

export default function ReportStatsCards({ stats }: ReportStatsCardsProps) {
  const cards = [
    {
      title: 'Total Reports Generated',
      value: stats.totalReports,
      growth: stats.totalReportsGrowth,
      description: 'Audit, asset & system logs',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      borderColor: 'hover:border-blue-200',
      badgeBg: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Automated Schedules',
      value: stats.scheduledActive,
      growth: '100% On Time',
      description: stats.scheduledDescription,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      borderColor: 'hover:border-purple-200',
      badgeBg: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Compliance & Audit Readiness',
      value: stats.complianceScore,
      growth: stats.complianceScoreGrowth,
      description: 'ISO 27001 & SOC-2 ready',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      borderColor: 'hover:border-emerald-200',
      badgeBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Cryptographic Ledger Proofs',
      value: stats.verifiedProofs,
      growth: stats.verifiedProofsGrowth,
      description: 'Zero hash discrepancies',
      icon: CheckCircle2,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      borderColor: 'hover:border-indigo-200',
      badgeBg: 'bg-indigo-50 text-indigo-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-white p-5 rounded-xl border border-slate-200 shadow-xs transition-all duration-200 hover:shadow-md ${card.borderColor} flex flex-col justify-between group`}
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <div
                  className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</h3>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${card.badgeBg}`}>
                  <TrendingUp className="w-3 h-3" />
                  {card.growth}
                </span>
              </div>
              <span className="text-xs text-slate-400 truncate max-w-[130px]" title={card.description}>
                {card.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
