import { useState, Fragment } from 'react';
import { 
  ChevronDown, ChevronRight, Search, SlidersHorizontal, ArrowUpRight, ArrowDownRight, 
  ExternalLink, ArrowRightLeft, Check, Star, ShieldCheck, FileCode2, Copy, Sparkles 
} from 'lucide-react';
import { 
  formatCurrency, 
  type Asset, 
  type Currency, 
  type DefenseCategory 
} from '../../services/assets';

interface HoldingsTableProps {
  assets: Asset[];
  currency: Currency;
  watchlistIds: string[];
  onToggleWatchlist: (id: string) => void;
  onTransferAsset?: (asset: Asset) => void;
}

export default function HoldingsTable({
  assets,
  currency,
  watchlistIds,
  onToggleWatchlist,
  onTransferAsset,
}: HoldingsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [tradedId, setTradedId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [showTransferSuccess, setShowTransferSuccess] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleTrade = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    setTradedId(asset.id);
    setTimeout(() => {
      setTradedId(null);
      setShowTransferSuccess(asset.id);
      if (onTransferAsset) {
        onTransferAsset(asset);
      }
      setTimeout(() => setShowTransferSuccess(null), 4000);
    }, 600);
  };

  const categories: Array<'All' | DefenseCategory> = [
    'All',
    'Radar & Sensors',
    'Avionics & EW',
    'Comm & Crypto',
    'Sovereign Tokens',
  ];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.contractAddress?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || asset.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden mb-6">
      {/* Table Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Tokenized Defense Hardware & Assets
              </h3>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-md border border-blue-100">
                {filteredAssets.length} Holdings
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live cryptographically verified defense inventory & smart contract certificates
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search defense assets, serial no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {showTransferSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Custody Reassignment Initiated:</strong> Broadcasted to BEL Sovereign Testnet (Proof ID: 0x8a9f...41a2)
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-600">Conf. in 1 block</span>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-semibold sticky top-0">
            <tr>
              <th className="px-3 py-3.5 w-8"></th>
              <th className="px-2 py-3.5 w-8 text-center">★</th>
              <th className="px-4 py-3.5">Defense Asset & Identifier</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5 text-right">Units</th>
              <th className="px-4 py-3.5 text-right">Unit Price ({currency})</th>
              <th className="px-4 py-3.5 text-right">24H %</th>
              <th className="px-4 py-3.5 text-right">Market Value ({currency})</th>
              <th className="px-4 py-3.5 text-right">Allocation</th>
              <th className="px-4 py-3.5 text-right">PnL ({currency})</th>
              <th className="px-4 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAssets.map((asset) => {
              const isWatchlisted = watchlistIds.includes(asset.id);

              return (
                <Fragment key={asset.id}>
                  <tr
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    onClick={() => toggleRow(asset.id)}
                  >
                    <td className="px-3 py-4 text-slate-400">
                      {expandedRows.has(asset.id) ? (
                        <ChevronDown className="w-4 h-4 text-blue-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </td>
                    <td className="px-2 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(asset.id);
                        }}
                        className="p-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                        title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            isWatchlisted ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={asset.logo}
                          alt={asset.name}
                          className="w-9 h-9 rounded-xl bg-slate-100 object-cover border border-slate-200 shadow-2xs shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                            {asset.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                              {asset.ticker}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {asset.serialNumber || 'SN-DEF-2026'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700">
                        {asset.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <p className="font-mono font-bold text-slate-900">
                        {asset.quantity.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-semibold text-slate-800">
                      {formatCurrency(asset.currentPrice, currency)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`inline-flex items-center font-bold ${
                          asset.change24h >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {asset.change24h >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                        )}
                        {Math.abs(asset.change24h)}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-extrabold text-slate-900">
                      {formatCurrency(asset.marketValue, currency)}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-slate-600">
                      {asset.allocation}%
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`font-mono font-bold ${
                          asset.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {asset.pnl >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(asset.pnl), currency)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 mx-auto"
                        onClick={(e) => handleTrade(asset, e)}
                      >
                        {tradedId === asset.id ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sign Tx...
                          </>
                        ) : (
                          <>
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            Transfer
                          </>
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row Detail Drawer */}
                  {expandedRows.has(asset.id) && (
                    <tr className="bg-slate-50/70 animate-in fade-in duration-200">
                      <td colSpan={11} className="px-4 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-2 md:px-4">
                          {/* Hardware & Contract Specs */}
                          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                Defense Hardware Specs
                              </h4>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Verified
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5 text-xs">
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Token Standard</p>
                                <p className="font-mono font-bold text-slate-800">{asset.tokenStandard || 'ERC-721'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Buy Price</p>
                                <p className="font-mono font-bold text-slate-800">{formatCurrency(asset.averageBuyPrice, currency)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Realized Gain</p>
                                <p className="font-mono font-bold text-emerald-600">+{formatCurrency(asset.realizedGains, currency)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Unrealized Gain</p>
                                <p className="font-mono font-bold text-emerald-600">+{formatCurrency(asset.unrealizedGains, currency)}</p>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-slate-100">
                              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Contract Address</p>
                              <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-[11px] font-mono">
                                <span className="truncate max-w-[200px] text-slate-700 font-medium">{asset.contractAddress}</span>
                                <button
                                  onClick={(e) => handleCopy(asset.contractAddress, e)}
                                  className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors cursor-pointer"
                                  title="Copy contract"
                                >
                                  {copiedHash === asset.contractAddress ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Purchase & Issuance History */}
                          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                              <FileCode2 className="w-4 h-4 text-blue-600" />
                              Mint & Custody Issuance
                            </h4>
                            <div className="overflow-hidden rounded-lg border border-slate-100">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold">
                                  <tr>
                                    <th className="px-3 py-1.5">Date</th>
                                    <th className="px-3 py-1.5 text-right">Units</th>
                                    <th className="px-3 py-1.5 text-right">Valuation</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {asset.purchaseHistory.map((ph, idx) => (
                                    <tr key={idx}>
                                      <td className="px-3 py-1.5 text-slate-600 font-mono">{ph.date}</td>
                                      <td className="px-3 py-1.5 text-right font-mono font-bold text-slate-900">{ph.amount}</td>
                                      <td className="px-3 py-1.5 text-right font-mono font-bold text-slate-800">
                                        {formatCurrency(ph.price, currency)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Linked Vaults & Nodes */}
                          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-indigo-600" />
                              Assigned Defense Vaults
                            </h4>
                            <div className="space-y-2">
                              {asset.linkedWallets.map((wallet) => (
                                <div
                                  key={wallet}
                                  className="flex justify-between items-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-[11px]"
                                >
                                  <span className="font-mono text-slate-800 font-bold truncate max-w-[200px]">
                                    {wallet}
                                  </span>
                                  <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {filteredAssets.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No defense assets found matching your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
