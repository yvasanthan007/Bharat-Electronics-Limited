import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, FileText, BarChart3, LogOut, Shield } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const navItems = [
  { name: 'Dashboard',        path: '/manager',              icon: LayoutDashboard, end: true },
  { name: 'Access Approvals', path: '/manager/access-control', icon: ShieldCheck },
  { name: 'Audit Trail',       path: '/manager/audit-trail',   icon: FileText },
  { name: 'Reports',           path: '/manager/reports',       icon: BarChart3 },
];

export default function ManagerSidebar() {
  const navigate = useNavigate();

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
    <div className="w-56 bg-[#170f2b] flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-violet-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-tight tracking-wide">BEL</p>
            <p className="text-violet-400 text-[9px] font-semibold tracking-widest uppercase leading-tight">Manager Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}