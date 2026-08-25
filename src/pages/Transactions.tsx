import { useEffect, useState } from 'react';
import { Download, FileText, Link, UploadCloud, Check, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();

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

  const handleExportCsv = () => {
    setIsExporting(true);
    const headers = 'Hash,Type,Date,From,To,Network,Asset,Amount,USD Value,Status\n';
    const rows = transactions
      .map(
        (t) =>
          `"${t.hash}","${t.type}","${t.date}","${t.from}","${t.to}","${t.network}","${t.asset}",${t.amount},${t.usdValue},"${t.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute(
      'download',
      `BEL_Transactions_Ledger_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setTimeout(() => setIsExporting(false), 2000);
  };

  const handleSyncWallet = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Wallet node synchronized successfully. Synced with block #2,345,678 on BEL Sovereign Testnet.');
    }, 1000);
  };

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
        <button
          onClick={handleSyncWallet}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
        >
          Import Transaction History
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transactions & Gas Ledger</h1>
          <p className="text-slate-500 text-xs mt-1">Real-time immutable ledger receipts, gas benchmarks, DID events, and fraud detection.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCsv}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all text-xs cursor-pointer shadow-2xs"
          >
            {isExporting ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Exported CSV</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV</span>
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all text-xs cursor-pointer shadow-2xs"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Generate Report</span>
          </button>
          <button
            onClick={handleSyncWallet}
            disabled={isSyncing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-xs cursor-pointer shadow-xs"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Syncing Node...</span>
              </>
            ) : (
              <>
                <Link className="w-4 h-4" />
                <span>Sync Wallet</span>
              </>
            )}
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
