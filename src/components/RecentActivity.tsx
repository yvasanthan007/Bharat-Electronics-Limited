import { CheckCircle2, XCircle } from 'lucide-react';
import { recentActivityItems } from '../data/mockAuditData';

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-full">
      <h3 className="text-sm font-semibold text-slate-900 mb-5">Recent Activity</h3>
      <div className="space-y-4">
        {recentActivityItems.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className={`p-1.5 rounded-full mt-0.5 flex-shrink-0 ${
              item.status === 'Success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {item.status === 'Success'
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                : <XCircle className="w-3.5 h-3.5 text-red-500" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{item.action}</p>
              <p className="text-xs text-slate-500 truncate">{item.detail}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                item.status === 'Success'
                  ? 'text-green-700 bg-green-50 border-green-200'
                  : 'text-red-700 bg-red-50 border-red-200'
              }`}>
                {item.status}
              </span>
              <span className="text-xs text-slate-400">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
