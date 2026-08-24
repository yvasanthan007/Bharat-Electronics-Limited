import { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Layers, TrendingUp } from 'lucide-react';
import { formatCurrency, convertFromUsd, type Asset, type Currency } from '../../services/assets';

interface PortfolioChartsProps {
  assets: Asset[];
  currency: Currency;
}

const ALLOCATION_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#0891b2', '#e11d48', '#4b5563'];

type TimeFrame = '24H' | '7D' | '30D' | '90D' | '1Y' | 'ALL';

export default function PortfolioCharts({ assets, currency }: PortfolioChartsProps) {
  const [timeframe, setTimeframe] = useState<TimeFrame>('30D');

  const totalValueUsd = useMemo(() => {
    return assets.reduce((sum, a) => sum + a.marketValue, 0);
  }, [assets]);

  const allocationData = useMemo(() => {
    return assets.map((asset) => {
      const valueInSelectedCurrency = convertFromUsd(asset.marketValue, currency);
      return {
        name: asset.name,
        ticker: asset.ticker,
        value: valueInSelectedCurrency,
        valueUsd: asset.marketValue,
        percentage: totalValueUsd > 0 ? ((asset.marketValue / totalValueUsd) * 100).toFixed(1) : '0',
        holdings: asset.quantity,
        category: asset.category,
      };
    });
  }, [assets, currency, totalValueUsd]);

  // Generate responsive performance data for each timeframe
  const { performanceData, periodReturnPct, periodGainUsd } = useMemo(() => {
    let dataPoints = 30;
    let labelFormatter: (date: Date) => string = (d) =>
      d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    let daysStep = 1;

    switch (timeframe) {
      case '24H':
        dataPoints = 24;
        labelFormatter = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        daysStep = 1 / 24;
        break;
      case '7D':
        dataPoints = 7;
        labelFormatter = (d) => d.toLocaleDateString(undefined, { weekday: 'short' });
        daysStep = 1;
        break;
      case '30D':
        dataPoints = 30;
        daysStep = 1;
        break;
      case '90D':
        dataPoints = 18;
        daysStep = 5;
        break;
      case '1Y':
        dataPoints = 24;
        labelFormatter = (d) => d.toLocaleDateString(undefined, { month: 'short' });
        daysStep = 15;
        break;
      case 'ALL':
        dataPoints = 30;
        labelFormatter = (d) => d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        daysStep = 30;
        break;
    }

    const now = Date.now();
    const data = [];
    const baseTotal = totalValueUsd || 1400000;
    const startMultiplier = timeframe === '24H' ? 0.985 : timeframe === '7D' ? 0.96 : timeframe === '30D' ? 0.91 : timeframe === '90D' ? 0.84 : 0.72;

    for (let i = 0; i < dataPoints; i++) {
      const pointTime = new Date(now - (dataPoints - 1 - i) * daysStep * 24 * 60 * 60 * 1000);
      const progress = i / (dataPoints - 1);
      
      // smooth growth curve with simulated market fluctuation
      const growthTrend = startMultiplier + progress * (1.0 - startMultiplier);
      const wave = Math.sin(i * 0.7) * (timeframe === '24H' ? 0.008 : 0.025);
      const randomNoise = (Math.cos(i * 1.3) * 0.01);
      const multiplier = growthTrend + wave + randomNoise;

      const pointValueUsd = Math.max(1000, baseTotal * multiplier);
      const pointValueDisplay = convertFromUsd(pointValueUsd, currency);

      data.push({
        timestamp: pointTime.toISOString(),
        date: labelFormatter(pointTime),
        value: pointValueDisplay,
        valueUsd: pointValueUsd,
      });
    }

    const firstValUsd = data[0]?.valueUsd || baseTotal;
    const lastValUsd = data[data.length - 1]?.valueUsd || baseTotal;
    const gainUsd = lastValUsd - firstValUsd;
    const returnPct = ((gainUsd / firstValUsd) * 100);

    return {
      performanceData: data,
      periodReturnPct: returnPct,
      periodGainUsd: gainUsd,
    };
  }, [timeframe, totalValueUsd, currency]);

  const isPeriodPositive = periodReturnPct >= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Portfolio Allocation Pie */}
      <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Portfolio Allocation
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {assets.length} Assets
            </span>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={84}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allocationData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]} 
                      className="cursor-pointer transition-transform hover:opacity-90"
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(_value: any, name: any, item: any) => [
                    `${formatCurrency(item.payload.valueUsd, currency)} (${item.payload.percentage}%)`,
                    item.payload.ticker || name,
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Value</span>
              <span className="text-sm font-extrabold text-slate-900">
                {formatCurrency(totalValueUsd, currency, true)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 max-h-36 overflow-y-auto pr-1">
          {allocationData.map((data, index) => (
            <div key={data.name} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center min-w-0 pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full mr-2 shrink-0"
                  style={{ backgroundColor: ALLOCATION_COLORS[index % ALLOCATION_COLORS.length] }}
                />
                <span className="text-slate-800 font-bold truncate max-w-[130px]">{data.ticker}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono">
                <span className="text-slate-600 font-medium">{formatCurrency(data.valueUsd, currency, true)}</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                  {data.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Performance Area Chart */}
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Portfolio Performance</h3>
                <span className={`inline-flex items-center gap-0.5 text-xs font-extrabold px-2 py-0.5 rounded-md ${
                  isPeriodPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {isPeriodPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {isPeriodPositive ? '+' : ''}{periodReturnPct.toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Net Period PnL: <span className={`font-mono font-bold ${isPeriodPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isPeriodPositive ? '+' : ''}{formatCurrency(periodGainUsd, currency)}
                </span>
              </p>
            </div>

            {/* Timeframe selector buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-0.5">
              {(['24H', '7D', '30D', '90D', '1Y', 'ALL'] as TimeFrame[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeframe(filter)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    timeframe === filter
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                  tickFormatter={(val) => {
                    const symbol = currency === 'INR' ? '₹' : '$';
                    if (currency === 'INR') {
                      if (val >= 10000000) return `${symbol}${(val / 10000000).toFixed(1)}Cr`;
                      if (val >= 100000) return `${symbol}${(val / 100000).toFixed(1)}L`;
                    }
                    if (val >= 1000000) return `${symbol}${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `${symbol}${(val / 1000).toFixed(0)}k`;
                    return `${symbol}${val}`;
                  }}
                  dx={-6}
                />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#ffffff',
                  }}
                  formatter={(_value: any, _: any, item: any) => [
                    `${formatCurrency(item.payload.valueUsd, currency)}`,
                    'Portfolio Valuation',
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#performanceGradient)"
                  activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            Live sovereign telemetry index
          </span>
          <span className="font-mono">Chain: BEL Sovereign Testnet (98234)</span>
        </div>
      </div>
    </div>
  );
}
