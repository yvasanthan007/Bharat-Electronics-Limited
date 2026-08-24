import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ShieldCheck, CheckCircle2, BarChart2, PieChart as PieIcon, TrendingUp, HardDrive } from 'lucide-react';
import type { ReportStats } from '../../services/reports';
import Badge from '../common/Badge';

interface ReportsOverviewChartsProps {
  stats: ReportStats;
}

export default function ReportsOverviewCharts({ stats }: ReportsOverviewChartsProps) {
  const [chartType, setChartType] = useState<'bar' | 'donut' | 'area'>('bar');
  const [barGrouping, setBarGrouping] = useState<'grouped' | 'stacked'>('grouped');

  const formatDistribution = [
    { format: 'PDF Documents', count: 68, percentage: 46, color: '#2563eb', size: '184 MB' },
    { format: 'JSON Data Feeds', count: 38, percentage: 26, color: '#f59e0b', size: '52 MB' },
    { format: 'CSV Spreadsheets', count: 28, percentage: 19, color: '#10b981', size: '78 MB' },
    { format: 'Excel (XLSX)', count: 14, percentage: 9, color: '#8b5cf6', size: '36 MB' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Chart Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
        {/* Header with Visualization Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Ledger Reporting Analytics</h3>
              <Badge variant="info" size="sm">Live On-Chain Data</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visual velocity, category distribution, and cryptographic proof throughput
            </p>
          </div>

          {/* Visualization Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartType === 'bar'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Bar Chart
              </button>

              <button
                type="button"
                onClick={() => setChartType('donut')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartType === 'donut'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PieIcon className="w-3.5 h-3.5" />
                Category Donut
              </button>

              <button
                type="button"
                onClick={() => setChartType('area')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  chartType === 'area'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Trend Area
              </button>
            </div>

            {chartType === 'bar' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setBarGrouping('grouped')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    barGrouping === 'grouped' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Clustered
                </button>
                <button
                  type="button"
                  onClick={() => setBarGrouping('stacked')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    barGrouping === 'stacked' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Stacked
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Charts Container */}
        <div className="min-h-[300px] w-full">
          {/* 1. Bar Chart View */}
          {chartType === 'bar' && (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.monthlyVolume}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
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
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="audit"
                    name="Audit & Compliance"
                    fill="#2563eb"
                    radius={barGrouping === 'grouped' ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                    stackId={barGrouping === 'stacked' ? 'stack' : undefined}
                  />
                  <Bar
                    dataKey="assets"
                    name="Digital Assets"
                    fill="#8b5cf6"
                    radius={barGrouping === 'grouped' ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                    stackId={barGrouping === 'stacked' ? 'stack' : undefined}
                  />
                  <Bar
                    dataKey="security"
                    name="Security & Risk"
                    fill="#f59e0b"
                    radius={barGrouping === 'grouped' ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                    stackId={barGrouping === 'stacked' ? 'stack' : undefined}
                  />
                  <Bar
                    dataKey="transactions"
                    name="Transactions & Gas"
                    fill="#10b981"
                    radius={barGrouping === 'stacked' ? [6, 6, 0, 0] : [6, 6, 0, 0]}
                    stackId={barGrouping === 'stacked' ? 'stack' : undefined}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 2. Donut Chart View */}
          {chartType === 'donut' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-2">
              <div className="lg:col-span-6 h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={96}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {stats.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalReports}</span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Reports Total</span>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-3">
                {stats.categoryDistribution.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-900">{cat.value} reports</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                        {Math.round((cat.value / parseInt(stats.totalReports)) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Area Flow View */}
          {chartType === 'area' && (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.monthlyVolume}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="auditGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="transGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="securityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
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
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="audit"
                    name="Audit & Compliance"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#auditGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="transactions"
                    name="Transactions & Gas"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#transGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="security"
                    name="Security & Risk"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#securityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-blue-600"></span>
            <span className="text-slate-700 font-semibold">Audit & Compliance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-purple-500"></span>
            <span className="text-slate-700 font-semibold">Digital Assets</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-amber-500"></span>
            <span className="text-slate-700 font-semibold">Security & Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
            <span className="text-slate-700 font-semibold">Transactions & Gas</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: 2 Visual Cards (Audit Standards Matrix & Export Format Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Compliance Progress Bars (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">Audit Standards & Security Readiness</h4>
                <p className="text-xs text-slate-500">Continuous cryptographic compliance status</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-4">
              {stats.complianceMetrics.map((item, index) => (
                <div key={index} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.standard}</span>
                    <span className="font-bold text-emerald-600 font-mono text-sm">{item.score}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      100% Cryptographically Verified
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">SOC2-Ctrl-0{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formats & Storage Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">Format & Storage Breakdown</h4>
                <p className="text-xs text-slate-500">Total 350 MB proof archival storage</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-4">
              {formatDistribution.map((item) => (
                <div key={item.format} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.format}</span>
                    <span className="font-mono text-slate-600">{item.count} files ({item.size})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ledger Integrity: Sealed</span>
            <span className="font-mono font-bold text-emerald-600">SHA-256 Valid</span>
          </div>
        </div>
      </div>
    </div>
  );
}
