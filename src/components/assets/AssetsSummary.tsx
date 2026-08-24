import { ArrowUpRight, ArrowDownRight, Wallet, Activity, TrendingUp, AlertCircle, Percent } from 'lucide-react';
import { formatCurrency, type PortfolioSummary, type Currency } from '../../services/assets';

interface AssetsSummaryProps {
  summary: PortfolioSummary;
  currency: Currency;
}

export default function AssetsSummary({ summary, currency }: AssetsSummaryProps) {
  const isPositiveYield = summary.netYield24h >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Portfolio Value */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Total Portfolio Value
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(summary.totalValue, currency)}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {currency === 'INR'
                ? `≈ ${formatCurrency(summary.totalValue, 'USD')}`
                : `≈ ${formatCurrency(summary.totalValue, 'INR')}`}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-2xs">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center ${
            isPositiveYield ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
          }`}>
            {isPositiveYield ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {isPositiveYield ? '+' : ''}{summary.netYield24h}%
          </span>
          <span className="text-[11px] text-slate-400 font-medium">portfolio 24h yield</span>
        </div>
      </div>

      {/* Total Holdings & Verified Tokens */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Total Defense Units
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {summary.totalHoldings.toLocaleString()} <span className="text-sm font-semibold text-slate-500">Units</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Across {summary.activeTokensCount} tokenized series
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-2xs">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md flex items-center">
            Sovereign Chain
          </span>
          <span className="text-[11px] text-slate-400 font-medium">100% custody verified</span>
        </div>
      </div>

      {/* Best Performer */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Top Appreciated Asset
            </p>
            <h3 className="text-lg font-bold text-slate-900 truncate max-w-[160px]" title={summary.bestPerformer.name}>
              {summary.bestPerformer.ticker}
            </h3>
            <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
              {summary.bestPerformer.name}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            +{summary.bestPerformer.change}%
          </span>
          <span className="text-[11px] text-slate-400 font-medium">past 24h market</span>
        </div>
      </div>

      {/* Lowest / Stable Asset */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Lowest / Rebalancing
            </p>
            <h3 className="text-lg font-bold text-slate-900 truncate max-w-[160px]" title={summary.worstPerformer.name}>
              {summary.worstPerformer.ticker}
            </h3>
            <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
              {summary.worstPerformer.name}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-2xs">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center ${
            summary.worstPerformer.change < 0
              ? 'text-red-700 bg-red-50'
              : 'text-slate-700 bg-slate-100'
          }`}>
            {summary.worstPerformer.change < 0 ? (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            ) : (
              <Percent className="w-3 h-3 mr-0.5" />
            )}
            {summary.worstPerformer.change}%
          </span>
          <span className="text-[11px] text-slate-400 font-medium">past 24h movement</span>
        </div>
      </div>
    </div>
  );
}
