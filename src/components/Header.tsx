import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sun,
  Bell,
  ChevronDown,
  Wallet,
  LogOut,
  Link2,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Header() {
  const navigate = useNavigate();

  const {
    address,
    isConnected,
    isDemo,
    isConnecting,
    error,
    linkedDID,
    connect,
    disconnect,
  } = useWallet();

  const [userName, setUserName] = useState('Rithvik Aadhiran');
  const [userRole, setUserRole] = useState('Admin');
  const [userInitials, setUserInitials] = useState('RA');

  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Load logged-in user information.
   */
  useEffect(() => {
    const userStr = localStorage.getItem('user');

    if (userStr) {
      try {
        const user = JSON.parse(userStr);

        const firstName = user.firstName || 'User';
        const lastName = user.lastName || '';

        setUserName(
          `${firstName} ${lastName}`.trim()
        );

        setUserRole(
          user.role?.name ||
          user.role ||
          'User'
        );

        setUserInitials(
          `${firstName[0] || 'U'}${lastName[0] || 'S'}`
        );
      } catch {
        // Keep default user information.
      }
    }
  }, []);

  /**
   * Close wallet dropdown when clicking outside.
   */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handler
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handler
      );
    };
  }, []);

  /**
   * Shorten wallet address for display.
   */
  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  /**
   * Copy wallet address.
   */
  const copyAddress = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard may be unavailable.
    }
  };

  /**
   * Logout admin.
   *
   * Firebase session is signed out first.
   * Local application session is then cleared.
   */
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Continue clearing the local session
      // even if Firebase sign-out fails.
    }

    try {
      disconnect();
    } catch {
      // Wallet may already be disconnected.
    }

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    setShowDropdown(false);
    setMenuOpen(false);

    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative">

      {/* ================= SEARCH ================= */}

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

      {/* ================= RIGHT SIDE ================= */}

      <div className="flex items-center gap-4 ml-6">

        {/* Theme */}
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          title="Toggle theme"
        >
          <Sun className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />

          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* ================= WALLET ================= */}

        {!isConnected ? (
          <div className="flex flex-col items-end gap-1">

            <button
              type="button"
              onClick={connect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Wallet className="w-4 h-4" />

              {isConnecting
                ? 'Connecting...'
                : 'Connect Wallet'}
            </button>

            {error && (
              <span
                className="text-[11px] text-red-600 font-medium max-w-[220px] truncate"
                title={error}
              >
                {error}
              </span>
            )}

          </div>
        ) : (
          <div
            className="relative"
            ref={menuRef}
          >

            {/* Connected wallet button */}
            <button
              type="button"
              onClick={() =>
                setMenuOpen(!menuOpen)
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                isDemo
                  ? 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                  : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >

              <span
                className={`w-2 h-2 rounded-full ${
                  isDemo
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />

              <Wallet className="w-4 h-4 text-slate-600" />

              <span className="font-mono text-xs font-semibold text-slate-700">
                {address &&
                  truncateAddress(address)}
              </span>

              {isDemo && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  Demo
                </span>
              )}

              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />

            </button>

            {/* Wallet dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 text-sm">

                {/* Wallet address */}
                <div className="px-4 py-2 border-b border-slate-100">

                  <p className="text-xs text-slate-500 mb-1">
                    Connected Wallet
                  </p>

                  <div className="flex items-center gap-2">

                    <code className="font-mono text-xs text-slate-800 break-all flex-1">
                      {address}
                    </code>

                    <button
                      type="button"
                      onClick={copyAddress}
                      className="shrink-0 p-1 text-slate-400 hover:text-blue-600"
                      title="Copy address"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                  </div>

                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {isDemo
                      ? 'Demo mode — no browser wallet detected'
                      : 'Browser wallet connected'}
                  </p>

                </div>

                {/* Linked DID */}
                <div className="px-4 py-2 border-b border-slate-100">

                  <p className="text-xs text-slate-500 mb-1">
                    Linked DID
                  </p>

                  {linkedDID ? (
                    <div className="flex items-center gap-1.5">

                      <Link2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />

                      <code className="font-mono text-xs text-slate-700 truncate">
                        {linkedDID}
                      </code>

                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No DID linked yet — create one in Identities
                    </p>
                  )}

                </div>

                {/* Disconnect wallet */}
                <button
                  type="button"
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

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 mx-2" />

        {/* ================= USER PROFILE ================= */}

        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setShowDropdown(!showDropdown)
            }
            className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
          >

            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
              {userInitials}
            </div>

            <div className="text-left hidden sm:block">

              <p className="text-sm font-semibold text-slate-700 leading-tight">
                {userName}
              </p>

              <p className="text-xs text-slate-500">
                {userRole}
              </p>

            </div>

            <ChevronDown className="w-4 h-4 text-slate-400" />

          </button>

          {/* Profile dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-100">

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>

            </div>
          )}

        </div>

      </div>
    </header>
  );
}