import { X, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import type { Transaction } from '../../services/transactions';

interface TransactionDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionDrawer({ transaction, onClose }: TransactionDrawerProps) {
  if (!transaction) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 animate-in fade-in transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 border-l border-slate-200 animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900">Transaction Details</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center p-3 rounded-full mb-3 ${
              transaction.status === 'Success' ? 'bg-emerald-50 text-emerald-600' :
              transaction.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
              'bg-red-50 text-red-600'
            }`}>
              {transaction.status === 'Success' ? <ShieldCheck className="w-8 h-8" /> : 
               transaction.status === 'Pending' ? <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full" /> : 
               <X className="w-8 h-8" />}
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {transaction.amount} {transaction.asset}
            </h3>
            <p className="text-slate-500 font-medium">${transaction.usdValue.toLocaleString()}</p>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.status === 'Success' ? 'bg-emerald-100 text-emerald-800' :
                  transaction.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {transaction.status}
                </span>
                <span className="text-sm font-medium text-slate-600">{transaction.confirmations} Confirmations</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date & Time</p>
              <p className="text-sm font-medium text-slate-900">{new Date(transaction.date).toLocaleString()}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Network</p>
              <p className="text-sm font-medium text-slate-900">{transaction.network}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Addresses</h4>
            
            <div className="flex justify-between items-center group">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">From</p>
                <p className="text-sm font-mono text-slate-900">{transaction.from.slice(0, 12)}...{transaction.from.slice(-8)}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all">
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center group">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">To</p>
                <p className="text-sm font-mono text-slate-900">{transaction.to.slice(0, 12)}...{transaction.to.slice(-8)}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Blockchain Details</h4>
            
            <div className="flex justify-between items-center group">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Transaction Hash</p>
                <p className="text-sm font-mono text-slate-900">{transaction.hash.slice(0, 12)}...{transaction.hash.slice(-8)}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                  <Copy className="w-4 h-4" />
                </button>
                <a href={transaction.explorerLink} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Block Number</p>
                <p className="text-sm font-mono text-slate-900">{transaction.blockNumber}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Network Fee</p>
                <p className="text-sm font-medium text-slate-900">{transaction.fee} {transaction.asset}</p>
              </div>
            </div>

            {transaction.memo && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5">Memo</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">{transaction.memo}</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-4">
          <button className="flex-1 py-2 font-medium text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            Download PDF
          </button>
          <a 
            href={transaction.explorerLink}
            target="_blank"
            rel="noopener noreferrer" 
            className="flex-1 py-2 font-medium text-center text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
          >
            View on Explorer
          </a>
        </div>
      </div>
    </>
  );
}
