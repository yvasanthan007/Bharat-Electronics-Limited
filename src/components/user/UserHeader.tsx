import { Bell, ChevronDown, Menu, Shield, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function UserHeader() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Rithvik Aadhiran');
  const [userRole, setUserRole] = useState('Engineer');
  const [userInitials, setUserInitials] = useState('RA');
  const [userDID, setUserDID] = useState('did:bel:sov:rithvik01');
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifCount] = useState(2);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const belUserStr = localStorage.getItem('bel_user');
    const userStr = localStorage.getItem('user');

    if (belUserStr) {
      try {
        const u = JSON.parse(belUserStr);
        const name = u.name || 'Defense Personnel';
        setUserName(name);
        const r = u.role || 'Officer';
        setUserRole(r);
        setUserInitials(
          name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()
        );
        if (u.did) setUserDID(u.did);
        const roleUpper = (r || '').toUpperCase();
        setIsAdminUser(roleUpper === 'ADMIN' || roleUpper === 'ADMINISTRATOR' || roleUpper === 'SECURITY OFFICER');
      } catch {}
    } else if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const first = user.firstName || 'Rithvik';
        const last = user.lastName || '';
        const name = `${first} ${last}`.trim() || user.email || 'Personnel';
        setUserName(name);
        const r = user.role?.name || user.role || 'Engineer';
        setUserRole(r);
        setUserInitials(
          name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()
        );
        if (user.did) setUserDID(user.did);
        const roleUpper = (r || '').toUpperCase();
        setIsAdminUser(roleUpper === 'ADMIN' || roleUpper === 'ADMINISTRATOR' || roleUpper === 'SECURITY OFFICER');
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Terminate the Firebase Auth session as well (if one exists).
    signOut(auth).catch(() => {
      /* no Firebase session — nothing to do */
    });
    localStorage.removeItem('user');
    localStorage.removeItem('bel_user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('bel_access_token');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-20">
      {/* Left: logo text + title */}
      <div className="flex items-center gap-3">
        <button className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5 hidden sm:flex">
          <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900">BEL Personnel Portal</span>
            <span className="text-[10px] text-slate-400 block font-mono">DID: {userDID}</span>
          </div>
        </div>
      </div>

      {/* Right: controls + user */}
      <div className="flex items-center gap-3">
        {/* Switch to Admin link if user has admin privileges */}
        {isAdminUser && (
          <button
            onClick={() => navigate('/bel')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Switch to Admin Console
          </button>
        )}

        {/* Notification bell */}
        <button 
          onClick={() => navigate('/user/activity')}
          className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {notifCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 rounded-xl hover:bg-slate-50 p-1.5 px-2 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-2xs">
              {userInitials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{userName}</p>
              <p className="text-[11px] font-semibold text-blue-600 leading-tight">{userRole}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{userName}</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">{userDID}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {userRole}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/user/identity');
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                >
                  My DID Identity
                </button>
                <button
                  onClick={() => {
                    navigate('/user/assets');
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                >
                  My Digital Assets
                </button>
                <button
                  onClick={() => {
                    navigate('/user/request-access');
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                >
                  Request Resource Access
                </button>

                {isAdminUser && (
                  <button
                    onClick={() => {
                      navigate('/bel');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 font-bold transition-colors cursor-pointer border-t border-slate-100"
                  >
                    Admin Control Center
                  </button>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
