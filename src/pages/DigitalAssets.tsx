import { useEffect, useState } from 'react';
import { Download, Plus, UploadCloud, Check, ShieldCheck } from 'lucide-react';
import { 
  getAssets, 
  getPortfolioSummary, 
  getActivities, 
  saveAssets,
  saveActivities,
  getWatchlistIds,
  saveWatchlistIds,
  getSavedCurrency,
  saveCurrency,
  type Asset, 
  type PortfolioSummary, 
  type AssetActivity, 
  type Currency 
} from '../services/assets';
import AssetsSummary from '../components/assets/AssetsSummary';
import PortfolioCharts from '../components/assets/PortfolioCharts';
import HoldingsTable from '../components/assets/HoldingsTable';
import Watchlist from '../components/assets/Watchlist';
import RecentActivity from '../components/assets/RecentActivity';
import AddAssetModal from '../components/assets/AddAssetModal';
import AllActivitiesModal from '../components/assets/AllActivitiesModal';

export default function DigitalAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [activities, setActivities] = useState<AssetActivity[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAllActivitiesOpen, setIsAllActivitiesOpen] = useState(false);
  const [isExported, setIsExported] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, activitiesData] = await Promise.all([
          getAssets(),
          getActivities(),
        ]);
        const summaryData = await getPortfolioSummary(assetsData);
        const savedWatchlist = getWatchlistIds();
        const savedCurr = getSavedCurrency();

        setAssets(assetsData);
        setSummary(summaryData);
        setActivities(activitiesData);
        setWatchlistIds(savedWatchlist);
        setCurrency(savedCurr);
      } catch (error) {
        console.error("Failed to fetch assets data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCurrencyToggle = (newCurr: Currency) => {
    setCurrency(newCurr);
    saveCurrency(newCurr);
  };

  const handleToggleWatchlist = (id: string) => {
    setWatchlistIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      saveWatchlistIds(updated);
      return updated;
    });
  };

  const handleExport = () => {
    const exportPayload = {
      exportTimestamp: new Date().toISOString(),
      currency,
      totalHoldings: summary?.totalHoldings,
      totalValueUsd: summary?.totalValue,
      assets: assets.map((a) => ({
        id: a.id,
        name: a.name,
        ticker: a.ticker,
        category: a.category,
        serialNumber: a.serialNumber,
        tokenStandard: a.tokenStandard,
        quantity: a.quantity,
        currentPriceUsd: a.currentPrice,
        marketValueUsd: a.marketValue,
        allocationPct: a.allocation,
        contractAddress: a.contractAddress,
        linkedWallets: a.linkedWallets,
      })),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download", 
      `BEL_Tokenized_Defense_Portfolio_${currency}_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setIsExported(true);
    setTimeout(() => setIsExported(false), 2500);
  };

  const handleAddAsset = async (newAsset: Asset) => {
    const updatedAssets = [newAsset, ...assets];
    setAssets(updatedAssets);
    saveAssets(updatedAssets);

    // Recalculate summary
    const updatedSummary = await getPortfolioSummary(updatedAssets);
    setSummary(updatedSummary);

    // Auto-create on-chain minting activity
    const newActivity: AssetActivity = {
      id: `act-${Date.now()}`,
      type: 'Minted',
      asset: newAsset.name,
      ticker: newAsset.ticker,
      amount: newAsset.quantity,
      unitPriceUsd: newAsset.currentPrice,
      status: 'Completed',
      timestamp: new Date().toISOString(),
      wallet: newAsset.linkedWallets[0] || '0x33b8...1023 (Radar Vault)',
      txHash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      blockNumber: 4892200 + Math.floor(Math.random() * 100),
      gasFee: '0.0032 ETH',
    };

    const updatedActivities = [newActivity, ...activities];
    setActivities(updatedActivities);
    saveActivities(updatedActivities);

    // Add to watchlist
    handleToggleWatchlist(newAsset.id);
  };

  const handleTransferAsset = async (asset: Asset) => {
    const newActivity: AssetActivity = {
      id: `act-${Date.now()}`,
      type: 'Transferred',
      asset: asset.name,
      ticker: asset.ticker,
      amount: Math.min(asset.quantity, 1),
      unitPriceUsd: asset.currentPrice,
      status: 'Completed',
      timestamp: new Date().toISOString(),
      wallet: '0x33b8...1023 (Engineering Station)',
      txHash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      blockNumber: 4892250 + Math.floor(Math.random() * 100),
      gasFee: '0.0024 ETH',
    };

    const updatedActivities = [newActivity, ...activities];
    setActivities(updatedActivities);
    saveActivities(updatedActivities);
  };

  if (loading || !summary) {
    return (
      <div className="flex-1 h-96 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600"></div>
        <p className="text-xs font-semibold text-slate-500">Loading Sovereign Digital Assets...</p>
      </div>
    );
  }

  // Handle empty state
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-16 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 border border-blue-100 shadow-2xs">
          <UploadCloud className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Defense Assets Found</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-6 text-xs">
          Manage and monitor all Bharat Electronics Limited tokenized defense hardware and sovereign tokens in one place.
        </p>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Mint First Defense Hardware Asset
        </button>

        <AddAssetModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddAsset={handleAddAsset}
          defaultCurrency={currency}
        />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Digital Assets & Tokenized Hardware
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Sovereign Node
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Manage and monitor verified Bharat Electronics Limited defense hardware certificates, radar telemetry tokens and sovereign pools.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
          {/* Currency Switcher Toggle: USD / INR */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => handleCurrencyToggle('INR')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                currency === 'INR'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>₹</span>
              <span>INR</span>
            </button>
            <button
              onClick={() => handleCurrencyToggle('USD')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                currency === 'USD'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>$</span>
              <span>USD</span>
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all text-xs cursor-pointer shadow-2xs"
          >
            {isExported ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Exported</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-500" />
                Export ({currency})
              </>
            )}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-xs cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Mint / Add Asset
          </button>
        </div>
      </div>

      {/* Main Content Sections */}
      <AssetsSummary summary={summary} currency={currency} />

      <PortfolioCharts assets={assets} currency={currency} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <HoldingsTable 
            assets={assets} 
            currency={currency}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            onTransferAsset={handleTransferAsset}
          />
        </div>
        <div className="xl:col-span-1 space-y-6">
          <Watchlist 
            assets={assets}
            watchlistIds={watchlistIds}
            currency={currency}
            onToggleWatchlist={handleToggleWatchlist}
          />
          <RecentActivity 
            activities={activities} 
            currency={currency}
            onViewAll={() => setIsAllActivitiesOpen(true)}
          />
        </div>
      </div>

      {/* Mint Modal */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAsset={handleAddAsset}
        defaultCurrency={currency}
      />

      {/* View All Activities Modal */}
      <AllActivitiesModal
        isOpen={isAllActivitiesOpen}
        onClose={() => setIsAllActivitiesOpen(false)}
        activities={activities}
        currency={currency}
      />
    </div>
  );
}
