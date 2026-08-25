import { useState, useEffect, useRef } from 'react';
import { 
  Search, Sun, Moon, Bell, ChevronDown, User, Settings, 
  Shield, LogOut, CheckCircle2, ExternalLink, X, Wallet, Copy, Link2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { address, isConnected, isDemo, isConnecting, error: walletError, linkedDID, connect, disconnect } = useWallet();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Hardware NFT #1024 Minted',
      desc: 'BEL Radar Sensor Mk-IV certificate sealed on-chain.',
      time: '10m ago',
      read: false,
      link: '/bel/digital-assets',
    },
    {
      id: 'n2',
      title: 'Zero-Trust SOC-2 Sealed',
      desc: 'Daily ledger integrity verified at block #2,345,678.',
      time: '1h ago',
      read: false,
      link: '/reports',
    },
    {
      id: 'n3',
      title: 'Role Authorization Granted',
      desc: 'Engineer access assigned to Neha Gupta.',
      time: '3h ago',
      read: true,
      link: '/access-control',
    },
  ]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const walletMenuRef = useRef<HTMLDivElement>(null);

  // Initialize and synchronize Dark Mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('bel_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('bel_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('bel_theme', 'light');
      }
      return next;
    });
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (walletMenuRef.current && !walletMenuRef.current.contains(event.target as Node)) {
        setWalletMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSignOut = () => {
    localStorage.removeItem('bel_user');
    localStorage.removeItem('bel_access_token');
    navigate('/login');
  };

  const searchableLinks = [
    { title: 'Digital Assets & Tokenized Hardware', category: 'Assets', path: '/bel/digital-assets' },
    { title: 'Transactions Ledger & Gas Analytics', category: 'Transactions', path: '/bel/transactions' },
    { title: 'Identities & Decentralized DIDs', category: 'Identities', path: '/identities' },
    { title: 'Role-Based Access Control (RBAC)', category: 'Security', path: '/access-control' },
    { title: 'Cryptographic Audit Trail', category: 'Audit', path: '/audit-trail' },
    { title: 'Smart Contracts Governance', category: 'Contracts', path: '/smart-contracts' },
    { title: 'Sealed Ledger Reports & Compliance', category: 'Reports', path: '/reports' },
    { title: 'Defense Node Settings & Keys', category: 'Settings', path: '/settings' },
  ];

  const filteredSearchResults = searchQuery.trim()
    ? searchableLinks.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-30 transition-colors">
      {/* Global Search Bar */}
      <div className="flex-1 flex items-center max-w-2xl relative" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search assets, identities, transactions, smart contracts, reports..."
            className="w-full pl-10 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-slate-400 font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Ctrl /
            </div>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 z-50">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Navigation Results
            </div>
            {filteredSearchResults.length > 0 ? (
              filteredSearchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(result.path);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50/70 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="text-sm font-medium text-slate-800 group-hover:text-blue-600">
                    {result.title}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 font-medium">
                    {result.category}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">
                No matching pages or records found for "{searchQuery}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-6">
        {/* Theme Toggle (Dark / Light Mode) */}
        <button
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
        </button>

        {/* Wallet Connect / Status */}
        {!isConnected ? (
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={connect}
              disabled={isConnecting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
            {walletError && (
              <span className="text-[10px] text-red-600 font-medium max-w-[180px] truncate" title={walletError}>
                {walletError}
              </span>
            )}
          </div>
        ) : (
          <div className="relative" ref={walletMenuRef}>
            <button
              onClick={() => setWalletMenuOpen(!walletMenuOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                isDemo
                  ? 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                  : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isDemo ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <Wallet className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-mono text-xs font-semibold text-slate-700">
                {address && truncateAddress(address)}
              </span>
              {isDemo && (
                <span className="text-[9px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                  Demo
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {walletMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 text-xs">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[11px] text-slate-500 mb-1">Connected Wallet</p>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-xs text-slate-800 break-all flex-1">{address}</code>
                    <button
                      onClick={copyAddress}
                      className="shrink-0 p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                      title="Copy address"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {isDemo ? 'Demo mode — ephemeral defense wallet active' : 'Browser Web3 wallet connected'}
                  </p>
                </div>

                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[11px] text-slate-500 mb-1">Linked DID</p>
                  {linkedDID ? (
                    <div className="flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <code className="font-mono text-xs text-slate-700 truncate">{linkedDID}</code>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      No DID linked yet — generate or link in Identities
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    disconnect();
                    setWalletMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            title="Notifications"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Popover */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      navigate(n.link);
                      setIsNotificationsOpen(false);
                    }}
                    className={`p-3 px-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !n.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800">{n.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 px-4 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    navigate('/reports');
                    setIsNotificationsOpen(false);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  View All Audit Logs <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 hover:bg-slate-50 p-1.5 px-2 rounded-xl transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs">
              RV
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">Rahul Verma</p>
              <p className="text-[11px] font-semibold text-blue-600">Administrator</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Rahul Verma</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">rahul.verma@bel.co.in</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  DID: did:bel:7f82e391
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/identities');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile & Identity
                </button>
                <button
                  onClick={() => {
                    navigate('/access-control');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  Role Permissions
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Node Settings
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleSignOut}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}