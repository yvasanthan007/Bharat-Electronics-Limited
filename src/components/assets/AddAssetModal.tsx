import { useState } from 'react';
import { X, ShieldCheck, Sparkles } from 'lucide-react';
import type { Asset } from '../../services/assets';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAsset: (newAsset: Asset) => void;
}

export default function AddAssetModal({ isOpen, onClose, onAddAsset }: AddAssetModalProps) {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('100000');
  const [category, setCategory] = useState('Defense Hardware NFT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const qty = parseFloat(quantity) || 1;
      const curPrice = parseFloat(price) || 100000;
      const marketVal = qty * curPrice;

      const newAsset: Asset = {
        id: `ast-${Date.now()}`,
        name: name || 'BEL Avionics Module NFT',
        ticker: ticker || 'BEL-AV-01',
        logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200',
        quantity: qty,
        currentPrice: curPrice,
        change24h: 12.5,
        marketValue: marketVal,
        allocation: 15,
        pnl: Math.round(marketVal * 0.12),
        averageBuyPrice: curPrice * 0.9,
        realizedGains: 0,
        unrealizedGains: Math.round(marketVal * 0.12),
        transactionCount: 1,
        history: [
          { timestamp: '2026-08-20', price: curPrice * 0.9 },
          { timestamp: '2026-08-24', price: curPrice }
        ],
        purchaseHistory: [
          { date: new Date().toISOString().split('T')[0], amount: qty, price: curPrice }
        ],
        linkedWallets: ['0x7f82c4412f9e110b77c5d41a99b21a8d76e0a3b9']
      };

      onAddAsset(newAsset);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Mint / Tokenize Digital Asset</h2>
              <p className="text-xs text-slate-500">Issue verifiable defense hardware certificate or token</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Asset Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BEL Sonar Acoustic Module Mk-II"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Ticker / Token Symbol</label>
              <input
                required
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g. BEL-SONAR-02"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Defense Hardware NFT">Defense Hardware NFT</option>
                <option value="Stablecoin (bUSD)">Stablecoin (bUSD)</option>
                <option value="Cryptographic Key NFT">Cryptographic Key NFT</option>
                <option value="Tokenized Securities">Tokenized Securities</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Quantity / Units</label>
              <input
                required
                type="number"
                min="1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Unit Valuation (USD $)</label>
              <input
                required
                type="number"
                min="0.01"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Minting will broadcast a transaction to <strong>BEL Sovereign Testnet</strong> (Chain ID 98234) and assign verifiable Merkle proof of custody to the master vault.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Minting On-Chain...
                </>
              ) : (
                'Mint Asset'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
