import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { recentDeployments } from '../data/mockContracts';

export default function RecentDeployments() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Deployments</h3>
      
      <div className="space-y-4 mb-6">
        {recentDeployments.map((deployment) => (
          <div key={deployment.id} className="flex items-start gap-3">
            <div className={`p-1.5 rounded-full mt-0.5 ${
              deployment.status === 'Success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {deployment.status === 'Success' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{deployment.name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className={deployment.status === 'Success' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                  {deployment.status}
                </span>
                <span>•</span>
                <span>{deployment.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
        View all deployments
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
