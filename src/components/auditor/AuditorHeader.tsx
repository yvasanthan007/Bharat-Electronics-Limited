import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function AuditorHeader() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('BEL Auditor');
  const [userRole, setUserRole] = useState('Auditor');
  const [userInitials, setUserInitials] = useState('BA');
  const [showDropdown, setShowDropdown] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const belUserStr = localStorage.getItem('bel_user');
      const userStr = localStorage.getItem('user');
      const raw = belUserStr ? JSON.parse(belUserStr) : userStr ? JSON.parse(userStr) : null;
      if (raw) {
        const name = raw.name || `${raw.firstName || ''} ${raw.lastName || ''}`.trim() || 'BEL Auditor';
        const role = raw.role?.name || raw.role || 'Auditor';
        setUserName(name);
        setUserRole(role);
        setUserInitials(
          name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()
        );
      }
    } catch {
      /* fallback defaults */
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
      {/* Left: title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">Auditor Portal</p>
          <p className="text-[11px] font-semibold text-amber-600 leading-tight">Read-only Compliance · Ledger Verification</p>
        </div>
      </div>

      {/* Right: bell + user */}
      <div className="flex items-center gap-3" ref={menuRef}>
        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
        </button>

        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
            {userInitials}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{userName}</p>
            <p className="text-[11px] font-semibold text-amber-600 leading-tight">{userRole}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {showDropdown && (
          <div className="absolute right-6 top-14 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-900">{userName}</p>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                {(() => {
                  try {
                    return JSON.parse(localStorage.getItem('bel_user') || localStorage.getItem('user') || '{}').did || 'did:bel:sov:auditor01';
                  } catch {
                    return 'did:bel:sov:auditor01';
                  }
                })()}
              </p>
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                {userRole}
              </span>
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  navigate('/auditor/audit-trail');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
              >
                Audit Trail
              </button>
              <button
                onClick={() => {
                  navigate('/auditor/reports');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
              >
                Reports
              </button>
              <button
                onClick={() => {
                  navigate('/user');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 font-bold transition-colors cursor-pointer border-t border-slate-100"
              >
                My User Portal
              </button>
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
    </header>
  );
}