import { 
  ArrowUpRight, ArrowDownRight, RefreshCw, Send, CheckCircle2, Clock, 
  XCircle, ShieldCheck, Layers, ChevronRight 
} from 'lucide-react';
import { formatCurrency, type AssetActivity, type Currency } from '../../services/assets';

interface RecentActivityProps {
  activities: AssetActivity[];
  currency: Currency;
  onViewAll: () => void;
}

export default function RecentActivity({
  activities,
  currency,
  onViewAll,
}: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Minted':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />;
      case 'Bought':
        return <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Sold':
        return <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />;
      case 'Swapped':
        return <RefreshCw className="w-3.5 h-3.5 text-blue-600" />;
      case 'Transferred':
        return <Send className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Received':
        return <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <RefreshCw className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      case 'Pending':
        return <Clock className="w-3 h-3 text-amber-500" />;
      case 'Failed':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDistanceToNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Show top 4 most recent
  const displayedActivities = activities.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
            <p className="text-[11px] text-slate-400">On-chain transaction logs</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          Live
        </span>
      </div>

      {/* Clean, Non-broken vertical list */}
      <div className="space-y-3">
        {displayedActivities.map((activity) => {
          const totalValUsd = activity.amount * activity.unitPriceUsd;

          return (
            <div
              key={activity.id}
              className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-white transition-all shadow-2xs group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(activity.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {activity.type} {activity.ticker || activity.asset}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-[130px] font-mono">
                      {activity.wallet}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-mono font-bold text-slate-900">
                    {activity.amount.toLocaleString()} units
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {formatCurrency(totalValUsd, currency, true)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
                <span className="text-slate-400 font-medium">
                  {formatDistanceToNow(activity.timestamp)}
                </span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(activity.status)}
                  <span
                    className={`font-semibold ${
                      activity.status === 'Completed'
                        ? 'text-emerald-700'
                        : activity.status === 'Pending'
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onViewAll}
        className="w-full mt-4 py-2.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 bg-slate-50 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
      >
        <span>View All Activities</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
