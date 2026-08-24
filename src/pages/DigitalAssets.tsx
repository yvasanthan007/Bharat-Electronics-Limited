import { useEffect, useState } from 'react';
import { Download, Plus, UploadCloud } from 'lucide-react';
import { getAssets, getPortfolioSummary, getActivities, type Asset, type PortfolioSummary, type AssetActivity } from '../services/assets';
import AssetsSummary from '../components/assets/AssetsSummary';
import PortfolioCharts from '../components/assets/PortfolioCharts';
import HoldingsTable from '../components/assets/HoldingsTable';
import Watchlist from '../components/assets/Watchlist';
import RecentActivity from '../components/assets/RecentActivity';

export default function DigitalAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [activities, setActivities] = useState<AssetActivity[]>([]);
  const [loading, setLoading] = useState(true);

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
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          Import your first digital asset
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Digital Assets</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor all digital assets in one place.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors text-sm">
            <Plus className="w-4 h-4" />
            Add Asset
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
        <div className="xl:col-span-1">
          <Watchlist />
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
}
