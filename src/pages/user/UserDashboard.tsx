import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Package, ShieldCheck, Clock,
  ArrowUpRight, CheckCircle2, AlertCircle,
  KeyRound, ChevronRight, Calendar, Fingerprint,
} from 'lucide-react';
import {
  getDashboardKPI, getRecentActivities,
  type DashboardKPI, type ActivityItem,
} from '../../services/userPortal';

const statusStyle: Record<string, string> = {
  Success: 'bg-green-50 text-green-700 border border-green-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Failed:  'bg-red-50 text-red-700 border border-red-200',
};

const iconBg: Record<string, string> = {
  Success: 'bg-green-100 text-green-600',
  Pending: 'bg-amber-100 text-amber-600',
  Failed:  'bg-red-100 text-red-600',
};

const activityIcons: Record<string, React.ElementType> = {
  Success: CheckCircle2,
  Pending: AlertCircle,
  Failed:  AlertCircle,
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Arun');
  const [userRole, setUserRole] = useState('USER');
  const [userDID, setUserDID] = useState('did:trustchain:ABC123');
  const [kpi, setKpi] = useState<DashboardKPI | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() + ' IST';

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.firstName || user.name || 'Arun');
        setUserRole(typeof user.role === 'string' ? user.role : user.role?.name || 'USER');
        if (user.did) setUserDID(user.did);
      } catch { /* fallback */ }
    }

    const load = async () => {
      setLoading(true);
      const [kpiData, actData] = await Promise.all([
        getDashboardKPI(),
        getRecentActivities(5),
      ]);
      setKpi(kpiData);
      setActivities(actData);
      setLoading(false);
    };
    load();
  }, []);

  const kpiCards = kpi ? [
    { title: 'My Identity',      value: kpi.identityStatus, sub: 'Status',             icon: User,        iconBg: 'bg-blue-100 text-blue-600',   valueCls: 'text-blue-600 font-bold' },
    { title: 'My Assets',        value: String(kpi.totalAssets),   sub: 'Total Assets Owned',  icon: Package,     iconBg: 'bg-emerald-100 text-emerald-600', valueCls: 'text-slate-900 font-bold' },
    { title: 'Active Access',    value: String(kpi.activeAccess),  sub: 'Active Permissions',  icon: ShieldCheck, iconBg: 'bg-purple-100 text-purple-600', valueCls: 'text-slate-900 font-bold' },
    { title: 'Pending Requests', value: String(kpi.pendingRequests), sub: 'Awaiting Approval', icon: Clock,       iconBg: 'bg-amber-100 text-amber-600', valueCls: 'text-slate-900 font-bold' },
  ] : [];

  const quickActions = [
    { title: 'Request New Access',  desc: 'Request access to resources',  icon: KeyRound, path: '/user/request-access', iconBg: 'bg-blue-100 text-blue-600' },
    { title: 'View My Identity',    desc: 'View and manage your identity', icon: User,     path: '/user/identity',       iconBg: 'bg-emerald-100 text-emerald-600' },
    { title: 'Browse My Assets',    desc: 'View all your digital assets',  icon: Package,  path: '/user/assets',         iconBg: 'bg-purple-100 text-purple-600' },
    { title: 'View Activity',       desc: 'View your recent activities',   icon: Clock,    path: '/user/activity',       iconBg: 'bg-amber-100 text-amber-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-8">
      {/* Welcome + Date */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, {userName}! 👋</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage your identity, assets and access requests.</p>
        </div>
        <div className="flex-shrink-0 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-right shadow-sm">
          <div className="flex items-center gap-2 justify-end text-slate-600 text-xs font-medium mb-0.5">
            <Calendar className="w-3.5 h-3.5" />
            {dateStr}
          </div>
          <p className="text-slate-500 text-xs">{timeStr}</p>
        </div>
      </div>

      {/* ================= MY DIGITAL IDENTITY (REQUIREMENT 11) ================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">My Digital Identity</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-mono break-all">
                DID: <span className="text-blue-300 font-bold">{userDID}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                <span>Role: <strong className="text-white font-medium">{userRole}</strong></span>
                <span>•</span>
                <span>Verification: <strong className="text-emerald-400 font-medium">On-Chain Verified</strong></span>
                <span>•</span>
                <span className="text-[11px] text-slate-400">Private key is controlled in your secure wallet</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/user/identity')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm border border-white/20 transition-colors shrink-0"
          >
            View Full Identity
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center`}>
                <card.icon className="w-5 h-5" />
              </div>
              <button className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">{card.title}</p>
            <p className={`text-2xl ${card.valueCls}`}>{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity - 7/12 */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Recent Activity</h3>
            <button onClick={() => navigate('/user/activity')} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">View All</button>
          </div>
          <div className="flex-1 divide-y divide-slate-50">
            {activities.map((act) => {
              const Icon = activityIcons[act.status] || CheckCircle2;
              return (
                <div key={act.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg[act.status]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{act.title}</p>
                    <p className="text-xs text-slate-500 truncate">{act.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400 hidden sm:block">{act.time}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[act.status]}`}>{act.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-4 border-t border-slate-100">
            <button onClick={() => navigate('/user/activity')} className="w-full py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">View All Activity</button>
          </div>
        </div>

        {/* Quick Actions - 5/12 */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-5 pt-5 pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Quick Actions</h3>
          </div>
          <div className="flex-1 divide-y divide-slate-50">
            {quickActions.map((qa) => (
              <button key={qa.title} onClick={() => navigate(qa.path)} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50/60 transition-colors text-left">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${qa.iconBg}`}>
                  <qa.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{qa.title}</p>
                  <p className="text-xs text-slate-500">{qa.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
        <span>© 2024 Bharat Electronics Limited (BEL). All rights reserved.</span>
        <span>BEL TrustChain Platform v2.0</span>
      </div>
    </div>
  );
}
