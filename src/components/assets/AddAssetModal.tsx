import { useState } from 'react';
import { 
  X, ShieldCheck, Sparkles, Wand2
} from 'lucide-react';
import { 
  convertToUsd, 
  formatCurrency, 
  type Asset, 
  type Currency, 
  type DefenseCategory,
  USD_TO_INR_RATE 
} from '../../services/assets';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAsset: (newAsset: Asset) => void;
  defaultCurrency?: Currency;
}

interface DefensePreset {
  name: string;
  ticker: string;
  category: DefenseCategory;
  tokenStandard: 'ERC-721' | 'ERC-1155' | 'ERC-20';
  defaultPriceUsd: number;
  serialPrefix: string;
  logo: string;
}

const PRESETS: DefensePreset[] = [
  {
    name: 'BEL Coastal Surveillance Radar Mk-IV',
    ticker: 'BEL-CSR-04',
    category: 'Radar & Sensors',
    tokenStandard: 'ERC-721',
    defaultPriceUsd: 110000,
    serialPrefix: 'BEL-BLR-CSR4-2026',
    logo: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'BEL SDR-Handheld Secure Radio',
    ticker: 'BEL-SDR-HH',
    category: 'Comm & Crypto',
    tokenStandard: 'ERC-1155',
    defaultPriceUsd: 15000,
    serialPrefix: 'BEL-KOT-SDRH-2026',
    logo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'BEL Quantum Entropy Key Vault',
    ticker: 'BEL-Q-VAULT',
    category: 'Comm & Crypto',
    tokenStandard: 'ERC-721',
    defaultPriceUsd: 85000,
    serialPrefix: 'BEL-PUN-QENT-2026',
    logo: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'BEL Advanced Helmet Mounted Display',
    ticker: 'BEL-HMD-02',
    category: 'Avionics & EW',
    tokenStandard: 'ERC-721',
    defaultPriceUsd: 65000,
    serialPrefix: 'BEL-HYD-HMD-2026',
    logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'BEL Sovereign Liquidity Token',
    ticker: 'bINR',
    category: 'Sovereign Tokens',
    tokenStandard: 'ERC-20',
    defaultPriceUsd: 1.0,
    serialPrefix: 'BEL-SOV-LIQ-2026',
    logo: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=200&auto=format&fit=crop&q=80',
  },
];

export default function AddAssetModal({
  isOpen,
  onClose,
  onAddAsset,
  defaultCurrency = 'INR',
}: AddAssetModalProps) {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [category, setCategory] = useState<DefenseCategory>('Radar & Sensors');
  const [tokenStandard, setTokenStandard] = useState<'ERC-721' | 'ERC-1155' | 'ERC-20'>('ERC-721');
  const [serialNumber, setSerialNumber] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [inputCurrency, setInputCurrency] = useState<Currency>(defaultCurrency);
  const [priceInput, setPriceInput] = useState(
    defaultCurrency === 'INR' ? (110000 * USD_TO_INR_RATE).toString() : '110000'
  );
  const [targetVault, setTargetVault] = useState('0x33b8...1023 (Radar Master Vault)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: DefensePreset) => {
    setName(preset.name);
    setTicker(preset.ticker);
    setCategory(preset.category);
    setTokenStandard(preset.tokenStandard);
    setSerialNumber(`${preset.serialPrefix}-${Math.floor(100 + Math.random() * 900)}`);
    
    if (inputCurrency === 'INR') {
      setPriceInput((preset.defaultPriceUsd * USD_TO_INR_RATE).toString());
    } else {
      setPriceInput(preset.defaultPriceUsd.toString());
    }
  };

  const handleCurrencyChange = (newCurr: Currency) => {
    if (newCurr === inputCurrency) return;
    const currentNumeric = parseFloat(priceInput) || 0;
    if (newCurr === 'INR') {
      setPriceInput((currentNumeric * USD_TO_INR_RATE).toFixed(2));
    } else {
      setPriceInput((currentNumeric / USD_TO_INR_RATE).toFixed(2));
    }
    setInputCurrency(newCurr);
  };

  const parsedPrice = parseFloat(priceInput) || 0;
  const priceUsd = inputCurrency === 'INR' ? convertToUsd(parsedPrice, 'INR') : parsedPrice;
  const qty = parseFloat(quantity) || 1;
  const totalValUsd = qty * priceUsd;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const generatedId = `bel-ast-${Date.now()}`;
      const contractHex = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const hashHex = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('').slice(0, 16);

      const newAsset: Asset = {
        id: generatedId,
        name: name || 'BEL Defense Avionics Unit',
        ticker: ticker || 'BEL-DEF-01',
        category,
        serialNumber: serialNumber || `BEL-BLR-${Date.now().toString().slice(-6)}`,
        tokenStandard,
        contractAddress: contractHex,
        logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
        quantity: qty,
        currentPrice: priceUsd,
        change24h: Number((Math.random() * 6 - 1).toFixed(1)),
        marketValue: totalValUsd,
        allocation: 10,
        pnl: Math.round(totalValUsd * 0.08),
        averageBuyPrice: priceUsd * 0.92,
        realizedGains: 0,
        unrealizedGains: Math.round(totalValUsd * 0.08),
        transactionCount: 1,
        history: Array.from({ length: 30 }).map((_, i) => ({
          price: priceUsd * (0.9 + (i / 30) * 0.1),
          timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
        })),
        purchaseHistory: [
          {
            date: new Date().toISOString().split('T')[0],
            amount: qty,
            price: priceUsd,
          },
        ],
        linkedWallets: [targetVault],
        isFavorite: true,
        defenseVerificationHash: hashHex,
      };

      onAddAsset(newAsset);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Mint / Tokenize Defense Hardware Asset
              </h2>
              <p className="text-xs text-slate-500">
                Issue verifiable sovereign cryptographic custody certificates
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-blue-600" />
              Quick Fill from Defense Hardware Catalog
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.ticker}
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {preset.ticker}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Asset Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. BEL Akash Fire Control Radar"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Ticker / Token Symbol</label>
              <input
                required
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g. BEL-AFCR-04"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DefenseCategory)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Radar & Sensors">Radar & Sensors</option>
                <option value="Avionics & EW">Avionics & EW</option>
                <option value="Comm & Crypto">Comm & Crypto</option>
                <option value="Defense Hardware">Defense Hardware</option>
                <option value="Sovereign Tokens">Sovereign Tokens</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Token Standard</label>
              <select
                value={tokenStandard}
                onChange={(e) => setTokenStandard(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-mono"
              >
                <option value="ERC-721">ERC-721 (Unique NFT)</option>
                <option value="ERC-1155">ERC-1155 (Multi-Batch)</option>
                <option value="ERC-20">ERC-20 (Fungible Token)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Defense Serial No.</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="BEL-BLR-2026-09"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Pricing with Currency switcher */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Valuation & Quantity</label>
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('INR')}
                  className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    inputCurrency === 'INR' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  ₹ INR
                </button>
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('USD')}
                  className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    inputCurrency === 'USD' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                  Quantity (Units)
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 mb-1 block">
                  Unit Price ({inputCurrency === 'INR' ? '₹ INR' : '$ USD'})
                </label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="any"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Currency conversion preview */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Total Market Value:</span>
              <div className="text-right">
                <span className="font-bold text-slate-900">
                  {formatCurrency(totalValUsd, inputCurrency)}
                </span>
                <span className="text-[11px] text-slate-400 ml-1.5">
                  ({formatCurrency(totalValUsd, inputCurrency === 'INR' ? 'USD' : 'INR')})
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Target Custody Vault / Node</label>
            <select
              value={targetVault}
              onChange={(e) => setTargetVault(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-mono"
            >
              <option value="0x33b8...1023 (Radar Master Vault)">0x33b8...1023 (Radar Master Vault - BEL BLR)</option>
              <option value="0x44a1...99ef (Army Signal Corps Vault)">0x44a1...99ef (Army Signal Corps Vault)</option>
              <option value="0x71a9...c4b2 (Coast Guard Hub)">0x71a9...c4b2 (Coast Guard Hub)</option>
              <option value="0x55dc...3319 (Strategic Cyber Command)">0x55dc...3319 (Strategic Cyber Command)</option>
              <option value="0x1123...88bb (Treasury Liquidity Reserve)">0x1123...88bb (Treasury Liquidity Reserve)</option>
            </select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Minting issues a cryptographically signed contract on <strong>BEL Sovereign Testnet</strong> with SHA-256 defense hardware provenance proof.
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
                  Broadcasting & Minting...
                </>
              ) : (
                'Mint Defense Asset'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
