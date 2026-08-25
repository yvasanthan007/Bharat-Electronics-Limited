
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

interface Activity {
  id: number;
  title: string;
  time: string;
  actor: string;
  badge: string;
  badgeColor: string;
  icon: string;
}

interface ActivityListProps {
  activities: Activity[];
}

export default function ActivityList({ activities }: ActivityListProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
        <h3 className="text-base font-semibold text-slate-900">Recent Activities</h3>
        <button 
          onClick={() => navigate('/audit-trail')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          View all
        </button>
      </div>
      <div className="p-2 flex-1 overflow-y-auto">
        {activities.map((activity) => {
          const IconComponent = (Icons as any)[activity.icon] || Icons.Activity;
          
          return (
            <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="mt-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.badgeColor}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate mb-1">
                  {activity.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{activity.time}</span>
                  <span>•</span>
                  <span>{activity.actor}</span>
                </div>
              </div>
              <div className="shrink-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${activity.badgeColor.replace('bg-', 'bg-opacity-10 border-').replace('100', '200')}`}>
                  {activity.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
