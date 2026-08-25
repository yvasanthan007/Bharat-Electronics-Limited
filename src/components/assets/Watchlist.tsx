import { useState } from 'react';
import { Star, ArrowUpRight, ArrowDownRight, Plus, X, ArrowRightLeft, Check } from 'lucide-react';
import { formatCurrency, type Asset, type Currency } from '../../services/assets';

interface WatchlistProps {
  assets: Asset[];
  watchlistIds: string[];
  currency: Currency;
  onToggleWatchlist: (id: string) => void;
}

export default function Watchlist({
  assets,
  watchlistIds,
  currency,
  onToggleWatchlist,
}: WatchlistProps) {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [quickActionId, setQuickActionId] = useState<string | null>(null);

  const watchedAssets = assets.filter((a) => watchlistIds.includes(a.id));
  const unwatchedAssets = assets.filter((a) => !watchlistIds.includes(a.id));

  const handleQuickAction = (ticker: string) => {
    setQuickActionId(ticker);
    setTimeout(() => {
      setQuickActionId(null);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Priority Watchlist</h3>
            <p className="text-[11px] text-slate-400">Target defense assets & tokens</p>
          </div>
        </div>

        {unwatchedAssets.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
              title="Add asset to watchlist"
            >
              <Plus className="w-4 h-4" />
            </button>

            {isAddMenuOpen && (
              <div className="absolute right-0 top-8 z-30 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-1.5 px-2 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Track Asset</span>
                  <button
                    onClick={() => setIsAddMenuOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {unwatchedAssets.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onToggleWatchlist(u.id);
                        setIsAddMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 text-left transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600">
                          {u.ticker}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{u.name}</p>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Watchlist Item List */}
      <div className="space-y-3">
        {watchedAssets.map((item) => {
          const isPositive = item.change24h >= 0;
          // Sparkline heights simulated from history
          const sparkPoints = [2, 4, 3, 6, 5, 8, isPositive ? 10 : 3];

          return (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all shadow-2xs hover:shadow-xs group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.logo}
                    alt={item.name}
                    className="w-7 h-7 rounded-lg object-cover bg-slate-200 border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 text-xs">{item.ticker}</span>
                      <button
                        onClick={() => onToggleWatchlist(item.id)}
                        className="text-amber-400 hover:text-slate-300 opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove from watchlist"
                      >
                        <Star className="w-3 h-3 fill-amber-400" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-[110px]">{item.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-slate-900">
                    {formatCurrency(item.currentPrice, currency)}
                  </p>
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />
                    )}
                    {Math.abs(item.change24h)}%
                  </span>
                </div>
              </div>

              {/* Sparkline & Quick Action */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-end h-4 gap-1 opacity-75">
                  {sparkPoints.map((val, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-t-xs ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ height: `${val * 10}%` }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => handleQuickAction(item.ticker)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {quickActionId === item.ticker ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Tracked</span>
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-3 h-3" />
                      Transfer
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {watchedAssets.length === 0 && (
          <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Star className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
            <p className="text-xs font-semibold">No assets in watchlist</p>
            <p className="text-[10px] mt-0.5">Click the star icon in the holdings table to add items</p>
          </div>
        )}
      </div>
    </div>
  );
}
