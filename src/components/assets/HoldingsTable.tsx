import { useState, Fragment } from 'react';
import { ChevronDown, ChevronRight, Search, SlidersHorizontal, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import type { Asset } from '../../services/assets';

interface HoldingsTableProps {
  assets: Asset[];
}

export default function HoldingsTable({ assets }: HoldingsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-semibold text-slate-900">Your Holdings</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0">
            <tr>
              <th className="px-4 py-3 font-medium w-10"></th>
              <th className="px-4 py-3 font-medium">Asset</th>
              <th className="px-4 py-3 font-medium text-right">Quantity</th>
              <th className="px-4 py-3 font-medium text-right">Price</th>
              <th className="px-4 py-3 font-medium text-right">24H %</th>
              <th className="px-4 py-3 font-medium text-right">Market Value</th>
              <th className="px-4 py-3 font-medium text-right">Allocation</th>
              <th className="px-4 py-3 font-medium text-right">PnL</th>
              <th className="px-4 py-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAssets.map(asset => (
              <Fragment key={asset.id}>
                <tr className="hover:bg-slate-50 cursor-pointer transition-colors group" onClick={() => toggleRow(asset.id)}>
                  <td className="px-4 py-4 text-slate-400">
                    {expandedRows.has(asset.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img src={asset.logo} alt={asset.name} className="w-8 h-8 rounded-full bg-slate-100 p-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">{asset.name}</p>
                        <p className="text-xs text-slate-500">{asset.ticker}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="font-medium text-slate-900">{asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`inline-flex items-center ${asset.change24h >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {asset.change24h >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {Math.abs(asset.change24h)}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-slate-900">
                    ${asset.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {asset.allocation}%
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={asset.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {asset.pnl >= 0 ? '+' : '-'}${Math.abs(asset.pnl).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button 
                      className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      Trade
                    </button>
                  </td>
                </tr>
                {expandedRows.has(asset.id) && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={9} className="px-4 py-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 md:px-10">
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-slate-900">Performance Metrics</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Avg. Buy Price</p>
                              <p className="text-sm font-medium">${asset.averageBuyPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Realized Gains</p>
                              <p className="text-sm font-medium text-emerald-600">+${asset.realizedGains.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Unrealized Gains</p>
                              <p className="text-sm font-medium text-emerald-600">+${asset.unrealizedGains.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Total TXs</p>
                              <p className="text-sm font-medium">{asset.transactionCount}</p>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                          <h4 className="text-sm font-semibold text-slate-900">Purchase History</h4>
                          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                  <th className="px-3 py-2 font-medium">Date</th>
                                  <th className="px-3 py-2 font-medium text-right">Amount</th>
                                  <th className="px-3 py-2 font-medium text-right">Price</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {asset.purchaseHistory.map((ph, idx) => (
                                  <tr key={idx}>
                                    <td className="px-3 py-2 text-slate-600">{ph.date}</td>
                                    <td className="px-3 py-2 text-right font-medium">{ph.amount}</td>
                                    <td className="px-3 py-2 text-right">${ph.price.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-slate-900">Linked Wallets</h4>
                          <div className="space-y-2">
                            {asset.linkedWallets.map(wallet => (
                              <div key={wallet} className="flex justify-between items-center bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs">
                                <span className="font-mono text-slate-600">{wallet}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 hover:text-blue-500 cursor-pointer" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {filteredAssets.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No assets found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
