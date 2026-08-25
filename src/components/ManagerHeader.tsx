import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Shield,
  Bell,
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';
import type { Notification } from '../data/managerMockData';
import NotificationPanel from './NotificationPanel';

interface ManagerHeaderProps {
  onToggleSidebar: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onLogout: () => void;
}

export default function ManagerHeader({
  onToggleSidebar,
  notifications,
  onMarkNotificationRead,
  onLogout,
}: ManagerHeaderProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfile(false);
    onLogout();
    navigate('/login');
  };

  const handleNotificationClick = (notif: Notification) => {
    onMarkNotificationRead(notif.id);
    setShowNotifications(false);
    navigate(notif.link);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h1 className="text-sm sm:text-base font-semibold text-slate-800 hidden sm:block">
            BEL Digital Trust & Secure Access Platform
          </h1>
          <h1 className="text-sm font-semibold text-slate-800 sm:hidden">BEL Platform</h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-white px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationPanel
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 sm:gap-3 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
              NG
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 leading-tight">Neha Gupta</p>
              <p className="text-xs text-slate-500">Manager</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden sm:block ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg shadow-slate-200/80 border border-slate-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Neha Gupta</p>
                <p className="text-xs text-slate-500">belmanager@gmail.com</p>
              </div>
              <button
                onClick={() => {
                  setShowProfile(false);
                  navigate('/manager');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4" />
                My Profile
              </button>
              <button
                onClick={() => {
                  setShowProfile(false);
                  setShowNotifications(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Bell className="w-4 h-4" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
