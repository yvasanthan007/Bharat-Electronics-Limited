import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { ReportStats } from '../../services/reports';
import Badge from '../common/Badge';

interface ReportsOverviewChartsProps {
  stats: ReportStats;
}

export default function ReportsOverviewCharts({ stats }: ReportsOverviewChartsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'audit' | 'security'>('all');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 8 cols: Generation Volume Area Chart */}
      <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">Report Generation Velocity</h3>
              <Badge variant="info" size="sm">Live Feed</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical report generation and automated cryptographic seal logs
            </p>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setSelectedMetric('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selectedMetric === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedMetric('audit')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selectedMetric === 'audit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit & Compliance
            </button>
            <button
              onClick={() => setSelectedMetric('security')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selectedMetric === 'security'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Security & Risk
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.monthlyVolume}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="auditGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="securityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="transGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              {(selectedMetric === 'all' || selectedMetric === 'audit') && (
                <Area
                  type="monotone"
                  dataKey="audit"
                  name="Audit & Compliance"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#auditGradient)"
                />
              )}
              {(selectedMetric === 'all' || selectedMetric === 'security') && (
                <Area
                  type="monotone"
                  dataKey="security"
                  name="Security & Risk"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#securityGradient)"
                />
              )}
              {selectedMetric === 'all' && (
                <Area
                  type="monotone"
                  dataKey="transactions"
                  name="Transactions & Gas"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#transGradient)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
            <span className="text-slate-600 font-medium">Audit & Compliance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
            <span className="text-slate-600 font-medium">Security & Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">Transactions & Gas</span>
          </div>
        </div>
      </div>

      {/* Right 4 cols: Compliance & Standard Verification Matrix */}
      <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Audit Standards Readiness</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time ledger control compliance</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-4">
            {stats.complianceMetrics.map((item, index) => (
              <div key={index} className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.standard}</span>
                  <span className="font-bold text-emerald-600">{item.score}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified On-Chain
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">SOC2-Ctrl-{101 + index}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Ledger Seal: SHA-256 Valid</span>
          <span className="font-mono text-blue-600 font-medium">Node #01 Validated</span>
        </div>
      </div>
    </div>
  );
}
