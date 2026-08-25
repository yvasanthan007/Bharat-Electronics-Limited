import { Bell, ChevronDown, Menu, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserHeader() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Rithvik Aadhiran');
  const [userRole, setUserRole] = useState('Engineer');
  const [userInitials, setUserInitials] = useState('RA');
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifCount] = useState(2);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const first = user.firstName || 'Rithvik';
        const last = user.lastName || 'Aadhiran';
        setUserName(`${first} ${last}`);
        setUserRole(user.role?.name || user.role || 'Engineer');
        setUserInitials(`${first[0]}${last[0]}`);
      } catch {
        // fallback defaults
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-10">
      {/* Left: logo text + title */}
      <div className="flex items-center gap-3">
        <button className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 hidden sm:flex">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-slate-700">BEL Digital Trust &amp; Secure Access Platform</span>
        </div>
      </div>

      {/* Right: bell + user */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
          <Bell className="w-5 h-5" />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {notifCount}
            </span>
          )}
        </button>

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 rounded-lg hover:bg-slate-50 px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
              {userInitials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{userName}</p>
              <p className="text-xs text-slate-500 leading-tight">{userRole}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
