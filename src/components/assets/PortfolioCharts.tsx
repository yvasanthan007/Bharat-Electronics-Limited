import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { Asset } from '../../services/assets';

interface PortfolioChartsProps {
  assets: Asset[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6'];

export default function PortfolioCharts({ assets }: PortfolioChartsProps) {
  const allocationData = assets.map((asset) => ({
    name: asset.name,
    value: asset.marketValue,
    holdings: asset.quantity,
  }));

  // Create mock performance data aggregating all assets' history
  const performanceData = Array.from({ length: 30 }).map((_, i) => {
    let total = 0;
    assets.forEach(asset => {
      if (asset.history[i]) total += asset.history[i].price * asset.quantity;
    });
    return {
      timestamp: assets[0]?.history[i]?.timestamp || new Date().toISOString(),
      value: total,
    };
  }).map(d => ({
    ...d,
    date: new Date(d.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Portfolio Allocation</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {allocationData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: any) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {allocationData.map((data, index) => (
            <div key={data.name} className="flex items-center text-sm">
              <span 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <span className="text-slate-600 truncate">{data.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Portfolio Performance</h3>
          <div className="flex space-x-2">
            {['24H', '7D', '30D', '90D', '1Y'].map((filter) => (
              <button 
                key={filter}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filter === '30D' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                dx={-10}
              />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Value']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
