import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Activity, Boxes, XCircle, BarChart3,
  ArrowRight, ScrollText, FileText, CheckCircle2, ShieldAlert, Box, FileBadge,
} from 'lucide-react';
import AuditStats from '../../components/AuditStats';
import EventOverview from '../../components/EventOverview';

const kpiCards = [
  { title: 'Audit Events',      value: '12,456', sub: 'All recorded events',   icon: Activity,      iconBg: 'bg-amber-100 text-amber-600' },
  { title: 'Verified Blocks',   value: '2,345,678', sub: 'Ledger integrity',   icon: Boxes,         iconBg: 'bg-emerald-100 text-emerald-600' },
  { title: 'Failed Events',     value: '321',     sub: 'Flagged for review',   icon: XCircle,       iconBg: 'bg-red-100 text-red-600' },
  { title: 'Reports Exported',  value: '96',      sub: 'Compliance packages',  icon: BarChart3,     iconBg: 'bg-blue-100 text-blue-600' },
];

const quickLinks = [
  { title: 'Audit Trail',        desc: 'Tamper-proof event history',      icon: ScrollText, path: '/auditor/audit-trail', iconBg: 'bg-amber-100 text-amber-600' },
  { title: 'Compliance Reports', desc: 'Export audit evidence packets',   icon: FileText,   path: '/auditor/reports',     iconBg: 'bg-blue-100 text-blue-600' },
];

export default function AuditorDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Auditor');
  const [userRole, setUserRole] = useState('Auditor');

  useEffect(() => {
    try {
      const belUserStr = localStorage.getItem('bel_user');
      const userStr = localStorage.getItem('user');
      const raw = belUserStr ? JSON.parse(belUserStr) : userStr ? JSON.parse(userStr) : null;
      if (raw) {
        setUserName(raw.name || `${raw.firstName || ''} ${raw.lastName || ''}`.trim() || 'Auditor');
        setUserRole(raw.role?.name || raw.role || 'Auditor');
      }
    } catch {
      /* fallback defaults */
    }
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-6">
      {/* Welcome Banner */}
      <div className="bg-amber-50/60 rounded-2xl p-8 border border-amber-100 flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {userName} 👋</h2>
          <p className="text-lg font-medium text-amber-800 mb-2">You are logged in as {userRole}</p>
          <p className="text-slate-600">
            Read-only compliance workspace. Verify ledger integrity, review audit trails and export evidence for defense stakeholders.
          </p>
          <span className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            Read-Only · Zero-Trust Sealed
          </span>
        </div>
        <div className="hidden md:flex relative z-10 w-24 h-24 bg-white rounded-2xl shadow-sm border border-amber-200 items-center justify-center transform -rotate-3">
          <ShieldCheck className="w-12 h-12 text-amber-600" />
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

      {/* Audit Stats */}
      <AuditStats />

      {/* Event Overview + Ledger Integrity / Merkle Proof */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <EventOverview />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Ledger Integrity / Merkle Proof Verification */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Box className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-900">Ledger Integrity</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Merkle Root Verified</p>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">0x7f82c4…e1a2 · block #2,345,678</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Quorum Agreement</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">2-of-3 multisig signed · BEL Sovereign</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <FileBadge className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Credential Anchors Sealed</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">128 VC anchors · zero tamper detected</p>
                </div>
              </div>
            </div>
            <div className="mt-5 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Ledger State:</span>
                <span className="text-emerald-400">INTEGRITY OK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hash Chain:</span>
                <span className="text-blue-400">Linked · 0 gaps</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1">
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
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
        <span>© {new Date().getFullYear()} Bharat Electronics Limited (BEL). All rights reserved.</span>
        <span>BEL TrustChain Platform v2.0 · Auditor Portal</span>
      </div>
    </div>
  );
}