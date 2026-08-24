import { Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Watchlist() {
  const watchlistItems = [
    { ticker: 'BTC', price: 65432.10, change: 2.4, chart: [1, 2, 4, 3, 5, 4, 7] },
    { ticker: 'ETH', price: 3500.50, change: -1.2, chart: [5, 4, 3, 4, 2, 3, 1] },
    { ticker: 'SOL', price: 145.20, change: 5.6, chart: [1, 2, 3, 4, 5, 7, 9] },
    { ticker: 'LINK', price: 18.50, change: 1.1, chart: [2, 3, 2, 4, 3, 5, 4] },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <Star className="w-5 h-5 mr-2 text-amber-400 fill-amber-400" />
          Watchlist
        </h3>
      </div>
      
      <div className="space-y-4">
        {watchlistItems.map(item => (
          <div key={item.ticker} className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
            <div>
              <p className="font-bold text-slate-900">{item.ticker}</p>
              <p className="text-sm font-medium text-slate-600">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            
            <div className="flex-1 px-4 h-8 flex items-center justify-center">
              {/* Fake sparkline using flex boxes for styling purposes without extra libs */}
              <div className="flex items-end h-full gap-0.5 opacity-60">
                {item.chart.map((val, i) => (
                  <div 
                    key={i} 
                    className={`w-1 rounded-t-sm ${item.change >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`} 
                    style={{ height: `${val * 10}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md ${
                item.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {item.change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {Math.abs(item.change)}%
              </span>
              <button className="block w-full mt-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                Quick Buy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
