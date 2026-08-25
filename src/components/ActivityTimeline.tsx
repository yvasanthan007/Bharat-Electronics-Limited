import type { ActivityItem } from '../data/managerMockData';
import {
  ShieldCheck,
  Database,
  Users,
  LogIn,
  Info,
} from 'lucide-react';

interface ActivityTimelineProps {
  activities: ActivityItem[];
  limit?: number;
  showSections?: boolean;
}

const categoryIcons: Record<string, any> = {
  Access: ShieldCheck,
  Assets: Database,
  Team: Users,
  Authentication: LogIn,
};



export default function ActivityTimeline({
  activities,
  limit,
  showSections = false,
}: ActivityTimelineProps) {
  const displayActivities = limit ? activities.slice(0, limit) : activities;

  const groupedBySection = showSections
    ? displayActivities.reduce((acc, activity) => {
        if (!acc[activity.section]) acc[activity.section] = [];
        acc[activity.section].push(activity);
        return acc;
      }, {} as Record<string, ActivityItem[]>)
    : { '': displayActivities };

  const sectionOrder = ['Today', 'Yesterday', 'This Week'];

  return (
    <div className="space-y-4">
      {sectionOrder.map((section) => {
        const items = groupedBySection[section];
        if (!items || items.length === 0) return null;

        return (
          <div key={section}>
            {showSections && section && (
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-2">
                {section}
              </h4>
            )}
            <div className="space-y-1">
              {items.map((activity: any) => {
                const Icon = (categoryIcons as any)[activity.category] || Info;

                const userName = typeof activity.user === 'string'
                  ? activity.user
                  : activity.user?.full_name || 'System';
                const userAvatar = activity.userAvatar
                  || (typeof activity.user === 'object' ? activity.user?.avatar_url : null)
                  || userName.substring(0, 2).toUpperCase();

                return (
                  <div key={activity.id} className="relative flex gap-4">
                    {/* Line */}
                    <div className="absolute left-4 top-10 bottom-[-16px] w-px bg-slate-200 last:hidden" />

                    {/* Avatar */}
                    <div className="relative z-10 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-600 shadow-sm mt-1">
                      {userAvatar}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-slate-50/50 hover:bg-slate-50 p-3 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                      <p className="text-sm text-slate-800 leading-snug">
                        <span className="font-semibold text-slate-900">{userName}</span>{' '}
                        {activity.action}{' '}
                        <span className="font-medium text-slate-700">{activity.resource}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                        <span>{activity.time || (activity.created_at ? new Date(activity.created_at).toLocaleString() : '—')}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1 font-medium capitalize">
                          <Icon className="w-3 h-3" />
                          {activity.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
