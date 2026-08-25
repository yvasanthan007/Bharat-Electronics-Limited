import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  UserPlus,
  Download,
  Upload,
  RefreshCcw,
  Fingerprint,
} from 'lucide-react';

import {
  getAllUsers,
  getUsersSummary,
  type User,
  type UsersSummaryData,
} from '../services/users';

import IdentitiesSummary from '../components/identities/IdentitiesSummary';
import UsersTable from '../components/identities/UsersTable';

import IdentityStats from '../components/IdentityStats';
import IdentityTable from '../components/IdentityTable';
import CreateDIDModal from '../components/did/CreateDIDModal';
import AddUserModal from '../components/identities/AddUserModal';

import { useWallet } from '../context/WalletContext';
import { associateWalletWithDID } from '../services/wallet';

import type { DIDIdentity } from '../data/mockDIDData';
import type { GeneratedDID } from '../lib/did/didEngine';

export default function Identities() {
  // ================= USER MANAGEMENT =================

  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] =
    useState<UsersSummaryData | null>(null);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // ================= DID MANAGEMENT =================

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] =
    useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const {
    address: walletAddress,
    isConnected,
    refreshLinkedDID,
  } = useWallet();

  // ================= LOAD USERS =================

  const fetchData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const data = await getAllUsers();

      setUsers(data);
      setSummary(getUsersSummary(data));
    } catch (err) {
      console.error(
        'Failed to load users',
        err
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= DID CREATED =================

  const handleDIDCreated = useCallback(
    (
      _identity: DIDIdentity,
      generated: GeneratedDID
    ) => {
      // Associate connected wallet with the new DID.
      if (isConnected && walletAddress) {
        associateWalletWithDID(
          walletAddress,
          generated.did
        );

        refreshLinkedDID();
      }

      // Refresh DID statistics/table.
      setRefreshKey((key) => key + 1);
    },
    [
      isConnected,
      walletAddress,
      refreshLinkedDID,
    ]
  );

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">

      {/* ================= PAGE HEADER ================= */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Identities
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage employees, decentralized identities,
            roles, and verification status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* Refresh users */}
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCcw
              className={`w-4 h-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>

          {/* Export */}
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />

            <span className="hidden sm:inline">
              Export
            </span>
          </button>

          {/* Import */}
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-4 h-4" />

            <span className="hidden sm:inline">
              Import
            </span>
          </button>

          {/* Add user */}
          <button
            type="button"
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
          >
            <UserPlus className="w-4 h-4" />

            <span className="hidden sm:inline">
              Add User
            </span>
          </button>

          {/* Create DID */}
          <button
            type="button"
            onClick={() =>
              setIsCreateModalOpen(true)
            }
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Fingerprint className="w-4 h-4" />

            Create DID
          </button>

        </div>
      </div>

      {/* ================= DID STATISTICS ================= */}

      <IdentityStats
        refreshKey={refreshKey}
      />

      {/* ================= USER KPI SUMMARY ================= */}

      {summary && (
        <div className="mt-6">
          <IdentitiesSummary
            summary={summary}
          />
        </div>
      )}

      {/* ================= DID TABLE ================= */}

      <div className="mt-6">
        <IdentityTable
          key={refreshKey}
        />
      </div>

      {/* ================= USERS TABLE ================= */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-6">

        {/* Table header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-slate-100 gap-3">

          <div>
            <h2 className="text-base font-semibold text-slate-800">
              All Users
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              {users.length} registered identities
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search by name, email, role…"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />

          </div>
        </div>

        {/* Users */}
        <UsersTable
          users={users}
          search={search}
          onRefresh={() => {
            fetchData(true);
            setRefreshKey((k) => k + 1);
          }}
        />

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {users.length} users
          </span>

          <span>
            Last refreshed just now
          </span>
        </div>

      </div>

      {/* ================= CREATE DID MODAL ================= */}

      <CreateDIDModal
        isOpen={isCreateModalOpen}
        onClose={() =>
          setIsCreateModalOpen(false)
        }
        onDIDCreated={handleDIDCreated}
      />

      {/* ================= ADD USER MODAL ================= */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={() => {
          fetchData(true);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}