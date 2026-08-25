import { useEffect, useState } from 'react';
import { Download, FileText, Link, UploadCloud } from 'lucide-react';
import { getTransactions, getTransactionSummary, type Transaction, type TransactionSummaryData } from '../services/transactions';
import { getDIDTransactions } from '../lib/did/eventMappers';
import TransactionSummary from '../components/transactions/TransactionSummary';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionsTable from '../components/transactions/TransactionsTable';
import TransactionCharts from '../components/transactions/TransactionCharts';
import FraudWidget from '../components/transactions/FraudWidget';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txData, sumData, didTx] = await Promise.all([
          getTransactions(),
          getTransactionSummary(),
          Promise.resolve(getDIDTransactions()),
        ]);
        // Merge live DID/blockchain events with wallet transactions (newest first)
        const merged = [...didTx, ...txData].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(merged);
        setSummary(sumData);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle empty state
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <UploadCloud className="w-16 h-16 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Transactions Yet</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          You haven't made any transactions yet. Import your transaction history or start using your wallets.
        </p>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Import Transaction History
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500 text-sm mt-1">Track every transaction across your wallets — including DID, credential and access-control events.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Generate Report</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors text-sm">
            <Link className="w-4 h-4" />
            Sync Wallet
          </button>
        </div>
      </div>

      <FraudWidget />
      <TransactionSummary summary={summary} />
      <TransactionCharts />
      <TransactionFilters />
      <TransactionsTable transactions={transactions} />
    </div>
  );
}
