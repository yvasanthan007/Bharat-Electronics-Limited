
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
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Identities', path: '/identities', icon: Users },
  { name: 'Access Control', path: '/access-control', icon: ShieldCheck },
  { name: 'Digital Assets', path: '/digital-assets', icon: Database },
  { name: 'Transactions', path: '/transactions', icon: Activity },
  { name: 'Audit Trail', path: '/audit-trail', icon: FileText },
  { name: 'Smart Contracts', path: '/smart-contracts', icon: Code2 },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full hidden md:flex transition-all">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">BEL</h1>
        <p className="text-xs font-semibold text-slate-500 tracking-wider">TRUST PLATFORM</p>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 mb-2">Connected Wallet</p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-mono text-slate-700">0x7f82...a3b9</span>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            All systems operational
          </div>
        </div>
      </div>
    </div>
  );
}
