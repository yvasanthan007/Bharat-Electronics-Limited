<<<<<<< HEAD
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

=======
import { useState, useEffect, useCallback } from 'react';
import { Download, Upload, Plus, ShieldCheck, Check, Fingerprint } from 'lucide-react';
>>>>>>> 817b51c8b67faabb1453781a486f85d31c8522b5
import IdentityStats from '../components/IdentityStats';
import IdentityTable from '../components/IdentityTable';
import CreateIdentityModal from '../components/CreateIdentityModal';
import CreateDIDModal from '../components/did/CreateDIDModal';
<<<<<<< HEAD
import AddUserModal from '../components/identities/AddUserModal';

=======
import ImportIdentitiesModal from '../components/ImportIdentitiesModal';
import DidDocumentModal from '../components/DidDocumentModal';
>>>>>>> 817b51c8b67faabb1453781a486f85d31c8522b5
import { useWallet } from '../context/WalletContext';
import { associateWalletWithDID } from '../services/wallet';

import type { DIDIdentity } from '../data/mockDIDData';
import type { GeneratedDID } from '../lib/did/didEngine';
import { 
  getIdentities, 
  saveIdentities, 
  calculateIdentityStats, 
  type Identity, 
  type IdentityStatsSummary 
} from '../services/identities';

export default function Identities() {
<<<<<<< HEAD
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

=======
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [stats, setStats] = useState<IdentityStatsSummary>({
    total: 0,
    verified: 0,
    pending: 0,
    revoked: 0,
    totalGrowth: '0%',
    verifiedGrowth: '0%',
    pendingGrowth: '0%',
    revokedGrowth: '0%',
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateDIDModalOpen, setIsCreateDIDModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedDidForInspection, setSelectedDidForInspection] = useState<Identity | null>(null);
  const [isExported, setIsExported] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const { address: walletAddress, isConnected, refreshLinkedDID } = useWallet();

  const loadData = useCallback(() => {
    const list = getIdentities();
    setIdentities(list);
    setStats(calculateIdentityStats(list));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleAddIdentity = (newIdentity: Identity) => {
    const updated = [newIdentity, ...identities];
    setIdentities(updated);
    saveIdentities(updated);
    setStats(calculateIdentityStats(updated));
    setRefreshKey((k) => k + 1);
  };

  const handleImportIdentities = (newIdentities: Identity[]) => {
    const updated = [...newIdentities, ...identities];
    setIdentities(updated);
    saveIdentities(updated);
    setStats(calculateIdentityStats(updated));
    setRefreshKey((k) => k + 1);
  };

  const handleToggleStatus = (id: string) => {
    const updated = identities.map((item) => {
      if (item.id === id) {
        const nextStatus = item.status === 'Verified' ? 'Revoked' : 'Verified';
        return { ...item, status: nextStatus as any };
      }
      return item;
    });
    setIdentities(updated);
    saveIdentities(updated);
    setStats(calculateIdentityStats(updated));
    setRefreshKey((k) => k + 1);
  };

  const handleDeleteIdentity = (id: string) => {
    const updated = identities.filter((i) => i.id !== id);
    setIdentities(updated);
    saveIdentities(updated);
    setStats(calculateIdentityStats(updated));
    setRefreshKey((k) => k + 1);
  };

  const handleDIDCreated = useCallback((_identity: DIDIdentity, generated: GeneratedDID) => {
    if (isConnected && walletAddress) {
      associateWalletWithDID(walletAddress, generated.did);
      refreshLinkedDID();
    }
    loadData();
    setRefreshKey((k) => k + 1);
  }, [isConnected, walletAddress, refreshLinkedDID, loadData]);

  const handleExport = () => {
    const exportPayload = {
      exportTimestamp: new Date().toISOString(),
      organization: "Bharat Electronics Limited",
      totalIdentities: identities.length,
      identities: identities.map((i) => ({
        id: i.id,
        name: i.name,
        did: i.did,
        employeeId: i.employeeId,
        email: i.email,
        role: i.role,
        department: i.department,
        status: i.status,
        securityClearance: i.securityClearance,
        keyType: i.keyType,
        publicKey: i.publicKey,
        walletAddress: i.walletAddress,
        createdOn: i.createdOn,
        lastActive: i.lastActive,
      })),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BEL_Decentralized_Identities_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setIsExported(true);
    setTimeout(() => setIsExported(false), 2000);
  };

>>>>>>> 817b51c8b67faabb1453781a486f85d31c8522b5
  if (loading) {
    return (
      <div className="flex-1 h-96 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-xs font-semibold text-slate-500">Loading Sovereign Identities...</p>
      </div>
    );
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Decentralized Identities (DIDs)
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              W3C DID Protocol
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage tamper-proof defense identities, role credentials, and cryptographic verification on BEL Sovereign Trust Node.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
          >
            {isExported ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Exported</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Export Directory
              </>
            )}
          </button>
          
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Import DIDs
          </button>

          <button
            onClick={() => setIsCreateDIDModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Fingerprint className="w-3.5 h-3.5 text-indigo-600" />
            Generate DID
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 border border-transparent rounded-xl text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Identity
>>>>>>> 817b51c8b67faabb1453781a486f85d31c8522b5
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

<<<<<<< HEAD
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
=======
      {/* Dynamic Stats Cards */}
      <IdentityStats stats={stats} refreshKey={refreshKey} />

      {/* Main Interactive Table */}
      <IdentityTable
        key={refreshKey}
        identities={identities}
        onToggleStatus={handleToggleStatus}
        onDeleteIdentity={handleDeleteIdentity}
        onInspectIdentity={(identity) => setSelectedDidForInspection(identity)}
        onRefresh={() => setRefreshKey((k) => k + 1)}
      />

      {/* Create Identity Modal */}
      <CreateIdentityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddIdentity={handleAddIdentity}
      />

      {/* Create DID Modal with Crypto Key Generation */}
      <CreateDIDModal
        isOpen={isCreateDIDModalOpen}
        onClose={() => setIsCreateDIDModalOpen(false)}
        onDIDCreated={handleDIDCreated}
      />

      {/* Import Identities Modal */}
      <ImportIdentitiesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportIdentities={handleImportIdentities}
      />

      {/* W3C DID Document & Verifiable Credentials Inspector */}
      <DidDocumentModal
        isOpen={selectedDidForInspection !== null}
        onClose={() => setSelectedDidForInspection(null)}
        identity={selectedDidForInspection}
>>>>>>> 817b51c8b67faabb1453781a486f85d31c8522b5
      />
    </div>
  );
}