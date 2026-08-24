import { useEffect, useState } from 'react';
import { Download, Plus, UploadCloud, Check } from 'lucide-react';
import { getAssets, getPortfolioSummary, getActivities, type Asset, type PortfolioSummary, type AssetActivity } from '../services/assets';
import AssetsSummary from '../components/assets/AssetsSummary';
import PortfolioCharts from '../components/assets/PortfolioCharts';
import HoldingsTable from '../components/assets/HoldingsTable';
import Watchlist from '../components/assets/Watchlist';
import RecentActivity from '../components/assets/RecentActivity';
import AddAssetModal from '../components/assets/AddAssetModal';

export default function DigitalAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [activities, setActivities] = useState<AssetActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExported, setIsExported] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsData, summaryData, activitiesData] = await Promise.all([
          getAssets(),
          getPortfolioSummary(),
          getActivities(),
        ]);
        setAssets(assetsData);
        setSummary(summaryData);
        setActivities(activitiesData);
      } catch (error) {
        console.error("Failed to fetch assets data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(assets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BEL_Digital_Assets_Portfolio_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setIsExported(true);
    setTimeout(() => setIsExported(false), 2500);
  };

  const handleAddAsset = (newAsset: Asset) => {
    setAssets((prev) => [newAsset, ...prev]);
    if (summary) {
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              totalValue: prev.totalValue + newAsset.marketValue,
              totalHoldings: prev.totalHoldings + newAsset.quantity,
            }
          : null
      );
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle empty state
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <UploadCloud className="w-16 h-16 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Digital Assets Found</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          Manage and monitor all your digital assets in one place. Import your wallets or manually add assets to get started.
        </p>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Import your first digital asset
        </button>

        <AddAssetModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddAsset={handleAddAsset}
        />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Digital Assets & Tokenized Hardware</h1>
          <p className="text-slate-500 text-xs mt-1">Manage and monitor verified defense hardware certificates, tokens and stablecoin pools.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all text-xs cursor-pointer shadow-2xs"
          >
            {isExported ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Exported</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-500" />
                Export Portfolio
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

      {/* Main Content */}
      <AssetsSummary summary={summary} />

      <PortfolioCharts assets={assets} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <HoldingsTable assets={assets} />
        </div>
        <div className="xl:col-span-1 space-y-6">
          <Watchlist />
          <RecentActivity activities={activities} />
        </div>
      </div>

      {/* Mint Modal */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAsset={handleAddAsset}
      />
    </div>
  );
}
