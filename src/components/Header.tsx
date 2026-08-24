import { useState, useRef, useEffect } from 'react';
import { Search, Sun, Bell, ChevronDown, Wallet, LogOut, Link2, Copy, CheckCircle2 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function Header() {
  const { address, isConnected, isDemo, isConnecting, error, linkedDID, connect, disconnect } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex-1 flex items-center max-w-2xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search for assets, users, transactions..."
            className="w-full pl-10 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-slate-400 font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200">
            Ctrl /
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-6">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
          <Sun className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Wallet */}
        {!isConnected ? (
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={connect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
            {error && (
              <span className="text-[11px] text-red-600 font-medium max-w-[220px] truncate" title={error}>
                {error}
              </span>
            )}
          </div>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${isDemo
                  ? 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                  : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${isDemo ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <Wallet className="w-4 h-4 text-slate-600" />
              <span className="font-mono text-xs font-semibold text-slate-700">
                {address && truncateAddress(address)}
              </span>
              {isDemo && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  Demo
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 text-sm">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Connected Wallet</p>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-xs text-slate-800 break-all flex-1">{address}</code>
                    <button
                      onClick={copyAddress}
                      className="shrink-0 p-1 text-slate-400 hover:text-blue-600"
                      title="Copy address"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {isDemo ? 'Demo mode — no browser wallet detected' : 'Browser wallet connected'}
                  </p>
                </div>

                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Linked DID</p>
                  {linkedDID ? (
                    <div className="flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <code className="font-mono text-xs text-slate-700 truncate">{linkedDID}</code>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No DID linked yet — create one in Identities
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    disconnect();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        )}

        <div className="h-6 w-px bg-slate-200 mx-2"></div>

        <button className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
            RV
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">Rahul Verma</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </header>
  );
}