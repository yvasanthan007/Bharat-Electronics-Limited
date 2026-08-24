import { ArrowUpRight, ArrowDownRight, Wallet, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import type { PortfolioSummary } from '../../services/assets';

interface AssetsSummaryProps {
  summary: PortfolioSummary;
}

export default function AssetsSummary({ summary }: AssetsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Portfolio Value</p>
            <h3 className="text-2xl font-bold text-slate-900">
              ${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Holdings</p>
            <h3 className="text-2xl font-bold text-slate-900">{summary.totalHoldings} Assets</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Best Performer</p>
            <h3 className="text-2xl font-bold text-slate-900">{summary.bestPerformer.ticker}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            {summary.bestPerformer.change}%
          </span>
          <span className="text-xs text-slate-500">past 24h</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Worst Performer</p>
            <h3 className="text-2xl font-bold text-slate-900">{summary.worstPerformer.ticker}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center">
            <ArrowDownRight className="w-3 h-3 mr-1" />
            {Math.abs(summary.worstPerformer.change)}%
          </span>
          <span className="text-xs text-slate-500">past 24h</span>
        </div>
      </div>
    </div>
  );
}
