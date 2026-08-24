import { ArrowUpRight, CreditCard, Activity, RefreshCw } from 'lucide-react';
import type { TransactionSummaryData } from '../../services/transactions';

interface TransactionSummaryProps {
  summary: TransactionSummaryData;
}

export default function TransactionSummary({ summary }: TransactionSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Volume</p>
            <h3 className="text-2xl font-bold text-slate-900">
              ${summary.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            12.5%
          </span>
          <span className="text-xs text-slate-500">vs last period</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Transactions</p>
            <h3 className="text-2xl font-bold text-slate-900">{summary.totalTransactions.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            <span className="font-medium text-emerald-600">{summary.successful} success</span> • {' '}
            <span className="font-medium text-red-500">{summary.failed} fail</span>
          </span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Fees Paid</p>
            <h3 className="text-2xl font-bold text-slate-900">
              ${summary.feesPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            4.2%
          </span>
          <span className="text-xs text-slate-500">increase in gas</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Pending Actions</p>
            <h3 className="text-2xl font-bold text-slate-900">{summary.pending}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Awaiting block confirmation</span>
        </div>
      </div>
    </div>
  );
}
