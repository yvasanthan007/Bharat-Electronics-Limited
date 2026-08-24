import { useState, Fragment } from 'react';
import { ChevronDown, ChevronRight, Search, SlidersHorizontal, ArrowUpRight, ArrowDownRight, ExternalLink, ArrowRightLeft, Check } from 'lucide-react';
import type { Asset } from '../../services/assets';

interface HoldingsTableProps {
  assets: Asset[];
}

export default function HoldingsTable({ assets }: HoldingsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [tradedId, setTradedId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleTrade = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    setTradedId(asset.id);
    setTimeout(() => {
      setTradedId(null);
      alert(`Transfer order initiated for ${asset.name} (${asset.ticker}) to Engineering Station 0x33b8...1023 on BEL Sovereign Testnet.`);
    }, 500);
  };

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Tokenized Defense Hardware & Assets</h3>
          <p className="text-xs text-slate-500">Live verified holdings on sovereign smart contracts</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search assets, tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <button
            title="Filter options"
            className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-semibold sticky top-0">
            <tr>
              <th className="px-4 py-3.5 w-10"></th>
              <th className="px-4 py-3.5">Asset</th>
              <th className="px-4 py-3.5 text-right">Quantity</th>
              <th className="px-4 py-3.5 text-right">Price</th>
              <th className="px-4 py-3.5 text-right">24H %</th>
              <th className="px-4 py-3.5 text-right">Market Value</th>
              <th className="px-4 py-3.5 text-right">Allocation</th>
              <th className="px-4 py-3.5 text-right">PnL</th>
              <th className="px-4 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAssets.map(asset => (
              <Fragment key={asset.id}>
                <tr className="hover:bg-slate-50/80 cursor-pointer transition-colors group" onClick={() => toggleRow(asset.id)}>
                  <td className="px-4 py-4 text-slate-400">
                    {expandedRows.has(asset.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img src={asset.logo} alt={asset.name} className="w-8 h-8 rounded-lg bg-slate-100 object-cover border border-slate-200 shadow-2xs" />
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{asset.name}</p>
                        <p className="text-[11px] font-mono text-slate-400 font-semibold">{asset.ticker}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="font-mono font-bold text-slate-900">{asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-semibold text-slate-800">
                    ${asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`inline-flex items-center font-bold ${asset.change24h >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {asset.change24h >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                      {Math.abs(asset.change24h)}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-bold text-slate-900">
                    ${asset.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-slate-600">
                    {asset.allocation}%
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className={`font-mono font-bold ${asset.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {asset.pnl >= 0 ? '+' : '-'}${Math.abs(asset.pnl).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button 
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1 mx-auto"
                      onClick={(e) => handleTrade(asset, e)}
                    >
                      {tradedId === asset.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          Authorized
                        </>
                      ) : (
                        <>
                          <ArrowRightLeft className="w-3 h-3" />
                          Transfer
                        </>
                      )}
                    </button>
                  </td>
                </tr>
                {expandedRows.has(asset.id) && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={9} className="px-4 py-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 md:px-6">
                        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Performance Metrics</h4>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-[11px] text-slate-400">Avg. Buy Price</p>
                              <p className="font-mono font-bold text-slate-800">${asset.averageBuyPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-400">Realized Gains</p>
                              <p className="font-mono font-bold text-emerald-600">+${asset.realizedGains.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-400">Unrealized Gains</p>
                              <p className="font-mono font-bold text-emerald-600">+${asset.unrealizedGains.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-400">On-Chain TXs</p>
                              <p className="font-mono font-bold text-slate-800">{asset.transactionCount}</p>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Purchase History</h4>
                          <div className="overflow-hidden rounded-lg border border-slate-100">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-slate-50 text-slate-500 font-semibold">
                                <tr>
                                  <th className="px-3 py-1.5">Date</th>
                                  <th className="px-3 py-1.5 text-right">Amount</th>
                                  <th className="px-3 py-1.5 text-right">Price</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {asset.purchaseHistory.map((ph, idx) => (
                                  <tr key={idx}>
                                    <td className="px-3 py-1.5 text-slate-600 font-mono">{ph.date}</td>
                                    <td className="px-3 py-1.5 text-right font-mono font-bold">{ph.amount}</td>
                                    <td className="px-3 py-1.5 text-right font-mono font-bold text-slate-800">${ph.price.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Linked Vaults</h4>
                          <div className="space-y-2">
                            {asset.linkedWallets.map(wallet => (
                              <div key={wallet} className="flex justify-between items-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-[11px]">
                                <span className="font-mono text-slate-700 font-bold">{wallet}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
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
