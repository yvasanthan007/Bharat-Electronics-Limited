import { ArrowUpRight, ArrowDownRight, RefreshCw, Send, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { AssetActivity } from '../../services/assets';

interface RecentActivityProps {
  activities: AssetActivity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Bought': return <ArrowDownRight className="w-4 h-4 text-emerald-600" />;
      case 'Sold': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'Swapped': return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'Transferred': return <Send className="w-4 h-4 text-indigo-600" />;
      case 'Received': return <ArrowDownRight className="w-4 h-4 text-emerald-600" />;
      default: return <RefreshCw className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
      case 'Pending': return <Clock className="w-3 h-3 text-amber-500" />;
      case 'Failed': return <XCircle className="w-3 h-3 text-red-500" />;
      default: return null;
    }
  };

  const formatDistanceToNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {activities.map((activity) => (
          <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 relative">
              {getIcon(activity.type)}
            </div>
            
            {/* Content box */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl shadow-sm border border-slate-200 bg-white md:group-odd:-translate-x-3 md:group-even:translate-x-3 transition-all">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-slate-900 text-sm">
                  {activity.type} {activity.asset}
                </span>
                <span className="text-xs font-medium text-slate-500 whitespace-nowrap ml-2">
                  {formatDistanceToNow(activity.timestamp)}
                </span>
              </div>
              
              <div className="flex flex-col mt-2">
                <span className="text-sm font-bold text-slate-800">
                  {activity.amount} {activity.asset}
                </span>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-500 font-mono truncate max-w-[120px]">
                    {activity.wallet}
                  </span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(activity.status)}
                    <span className="text-xs text-slate-500">{activity.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-6 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
        View All Activity
      </button>
    </div>
  );
}
