import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Coins, HelpCircle, Pickaxe, Flame } from 'lucide-react';
import type { Transaction } from '../../services/transactions';
import TransactionDrawer from './TransactionDrawer';

interface TransactionsTableProps {
  transactions: Transaction[];
}

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Received': return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
      case 'Sent': return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
      case 'Swap': return <ArrowLeftRight className="w-4 h-4 text-purple-600" />;
      case 'Stake': return <Coins className="w-4 h-4 text-indigo-600" />;
      case 'Mint': return <Pickaxe className="w-4 h-4 text-amber-600" />;
      case 'Burn': return <Flame className="w-4 h-4 text-red-600" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Failed': return 'bg-red-50 text-red-600 border-red-200';
      case 'Cancelled': return 'bg-slate-100 text-slate-600 border-slate-300';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium">Hash</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">From / To</th>
                <th className="px-5 py-4 font-medium">Network</th>
                <th className="px-5 py-4 font-medium text-right">Amount</th>
                <th className="px-5 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map(tx => (
                <tr 
                  key={tx.hash} 
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  onClick={() => setSelectedTx(tx)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        {getTypeIcon(tx.type)}
                      </div>
                      <span className="font-medium text-slate-900">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-600">
                    {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col font-mono text-xs text-slate-500">
                      <span>{tx.from.slice(0, 6)}...{tx.from.slice(-4)}</span>
                      <span className="text-slate-300">↓</span>
                      <span>{tx.to.slice(0, 6)}...{tx.to.slice(-4)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {tx.network}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <p className="font-medium text-slate-900">{tx.amount} {tx.asset}</p>
                    <p className="text-xs text-slate-500">${tx.usdValue.toLocaleString()}</p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${getStatusBadgeClass(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
          <span>Showing 1 to 10 of {transactions.length} entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 border border-blue-500 bg-blue-50 text-blue-600 rounded font-medium">1</button>
            <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50">2</button>
            <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50">3</button>
            <button className="px-3 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>

      <TransactionDrawer 
        transaction={selectedTx} 
        onClose={() => setSelectedTx(null)} 
      />
    </>
  );
}
