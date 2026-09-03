import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShieldCheck, Package, BarChart3,
  ArrowRight, ClipboardCheck, ScrollText, UserCheck, FileText,
} from 'lucide-react';
import AccessStats from '../../components/AccessStats';
import AccessRequests from '../../components/AccessRequests';

const kpiCards = [
  { title: 'Team Members',       value: '224',  sub: 'Under management',  icon: Users,        iconBg: 'bg-violet-100 text-violet-600' },
  { title: 'Pending Approvals',  value: '37',   sub: 'Awaiting decision', icon: ClipboardCheck, iconBg: 'bg-amber-100 text-amber-600' },
  { title: 'Assets In Scope',    value: '286',  sub: 'Managed assets',    icon: Package,       iconBg: 'bg-emerald-100 text-emerald-600' },
  { title: 'Reports Exported',   value: '54',   sub: 'This quarter',      icon: BarChart3,     iconBg: 'bg-blue-100 text-blue-600' },
];

const quickLinks = [
  { title: 'Review Access Approvals', desc: 'Approve or reject resource access', icon: UserCheck,  path: '/manager/access-control', iconBg: 'bg-violet-100 text-violet-600' },
  { title: 'View Audit Trail',        desc: 'Tamper-proof compliance history',   icon: ScrollText, path: '/manager/audit-trail',    iconBg: 'bg-amber-100 text-amber-600' },
  { title: 'Generate Reports',        desc: 'Export compliance reports',         icon: FileText,   path: '/manager/reports',        iconBg: 'bg-blue-100 text-blue-600' },
];

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Manager');
  const [userRole, setUserRole] = useState('Manager');

  useEffect(() => {
    try {
      const belUserStr = localStorage.getItem('bel_user');
      const userStr = localStorage.getItem('user');
      const raw = belUserStr ? JSON.parse(belUserStr) : userStr ? JSON.parse(userStr) : null;
      if (raw) {
        setUserName(raw.name || `${raw.firstName || ''} ${raw.lastName || ''}`.trim() || 'Manager');
        setUserRole(raw.role?.name || raw.role || 'Manager');
      }
    } catch {
      /* fallback defaults */
    }
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-6">
      {/* Welcome Banner */}
      <div className="bg-violet-50/60 rounded-2xl p-8 border border-violet-100 flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {userName} 👋</h2>
          <p className="text-lg font-medium text-violet-800 mb-2">You are logged in as {userRole}</p>
          <p className="text-slate-600">
            Approve access requests, monitor your team, and keep every operation verified on the tamper-proof trust ledger.
          </p>
        </div>
        <div className="hidden md:flex relative z-10 w-24 h-24 bg-white rounded-2xl shadow-sm border border-violet-200 items-center justify-center transform rotate-3">
          <ShieldCheck className="w-12 h-12 text-violet-600" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => (
          <div key={kpi.title} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${kpi.iconBg}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
            <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.value}</div>
            <p className="text-xs text-slate-500">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Access Stats */}
      <AccessStats rolesCount={5} usersCount={1248} permissionsCount={128} />

      {/* Main Grid: Pending Requests + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Access Requests</h3>
            <button
              onClick={() => navigate('/manager/access-control')}
              className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <AccessRequests />
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-5 pt-5 pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Quick Links</h3>
          </div>
          <div className="flex-1 divide-y divide-slate-50">
            {quickLinks.map((qa) => (
              <button
                key={qa.title}
                onClick={() => navigate(qa.path)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50/60 transition-colors text-left"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${qa.iconBg}`}>
                  <qa.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{qa.title}</p>
                  <p className="text-xs text-slate-500">{qa.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
        <span>© {new Date().getFullYear()} Bharat Electronics Limited (BEL). All rights reserved.</span>
        <span>BEL TrustChain Platform v2.0 · Manager Portal</span>
      </div>
    </div>
  );
}