import { useState, useCallback } from 'react';
import { Download, Upload, Fingerprint } from 'lucide-react';
import IdentityStats from '../components/IdentityStats';
import IdentityTable from '../components/IdentityTable';
import CreateDIDModal from '../components/did/CreateDIDModal';
import { useWallet } from '../context/WalletContext';
import { associateWalletWithDID } from '../services/wallet';
import type { DIDIdentity } from '../data/mockDIDData';
import type { GeneratedDID } from '../lib/did/didEngine';

export default function Identities() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { address: walletAddress, isConnected, refreshLinkedDID } = useWallet();

  const handleDIDCreated = useCallback((_identity: DIDIdentity, generated: GeneratedDID) => {
    // Associate connected wallet ↔ newly created DID
    if (isConnected && walletAddress) {
      associateWalletWithDID(walletAddress, generated.did);
      refreshLinkedDID();
    }
    // Refresh table + stats so the new DID appears immediately
    setRefreshKey(k => k + 1);
  }, [isConnected, walletAddress, refreshLinkedDID]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Identities</h1>
          <p className="text-sm text-slate-500">Manage decentralized identities and their verification status</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Fingerprint className="w-4 h-4" />
            Create DID
          </button>
        </div>
      </div>

      <IdentityStats refreshKey={refreshKey} />
      <IdentityTable key={refreshKey} />

      <CreateDIDModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDIDCreated={handleDIDCreated}
      />
    </div>
  );
}