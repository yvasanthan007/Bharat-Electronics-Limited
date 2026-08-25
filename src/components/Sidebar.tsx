import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Database, 
  Activity, 
  FileText, 
  Code2, 
  BarChart3, 
  Settings,
  CheckCircle2
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/bel', icon: LayoutDashboard },
  { name: 'Identities', path: '/bel/identities', icon: Users },
  { name: 'Access Control', path: '/bel/access-control', icon: ShieldCheck },
  { name: 'Digital Assets', path: '/bel/digital-assets', icon: Database },
  { name: 'Transactions', path: '/bel/transactions', icon: Activity },
  { name: 'Audit Trail', path: '/bel/audit-trail', icon: FileText },
  { name: 'Smart Contracts', path: '/bel/smart-contracts', icon: Code2 },
  { name: 'Reports', path: '/bel/reports', icon: BarChart3 },
  { name: 'Settings', path: '/bel/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full hidden md:flex transition-all shrink-0">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
          B
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">BEL</h1>
          <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mt-0.5">Trust Platform</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/bel'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Connected Defense Vault</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-800">0x7f82...a3b9</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Node Active (98234)
          </div>
        </div>
      </div>
    </div>
  );
}
