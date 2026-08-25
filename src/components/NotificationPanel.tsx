import type { Notification } from '../data/managerMockData';
import {
  ShieldCheck,
  Database,
  Users,
  Bell,
  X,
} from 'lucide-react';

interface NotificationPanelProps {
  notifications: Notification[];
  onNotificationClick: (notif: Notification) => void;
  onClose: () => void;
}

const typeIcons: Record<string, typeof ShieldCheck> = {
  request: ShieldCheck,
  asset: Database,
  team: Users,
  system: Bell,
};

const typeBgColors: Record<string, string> = {
  request: 'bg-blue-50 text-blue-600',
  asset: 'bg-purple-50 text-purple-600',
  team: 'bg-emerald-50 text-emerald-600',
  system: 'bg-orange-50 text-orange-600',
};

export default function NotificationPanel({
  notifications,
  onNotificationClick,
  onClose,
}: NotificationPanelProps) {

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg shadow-slate-200/80 border border-slate-200 z-50 max-h-[480px] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <h3 className="font-semibold text-slate-900">Notifications</h3>
        {notifications.filter((n: any) => !n.is_read).length > 0 && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            {notifications.filter((n: any) => !n.is_read).length} New
          </span>
        )}
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => {
            const isUnread = !notification.is_read;
            const Icon = typeIcons[notification.type] || Bell;
            const colorClass = typeBgColors[notification.type] || 'bg-slate-50 text-slate-600';
                
            return (
              <div
                key={notification.id}
                onClick={() => onNotificationClick(notification.id)}
                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${
                  isUnread ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      {notification.description}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1.5 uppercase tracking-wider">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {isUnread && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-2" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
