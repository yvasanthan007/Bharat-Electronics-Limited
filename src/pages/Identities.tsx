import { useState, useEffect } from 'react';
import { Download, Upload, Plus, Check, ShieldCheck } from 'lucide-react';
import IdentityStats from '../components/IdentityStats';
import IdentityTable from '../components/IdentityTable';
import CreateIdentityModal from '../components/CreateIdentityModal';
import ImportIdentitiesModal from '../components/ImportIdentitiesModal';
import DidDocumentModal from '../components/DidDocumentModal';
import { 
  getIdentities, 
  saveIdentities, 
  calculateIdentityStats, 
  type Identity, 
  type IdentityStatsSummary 
} from '../services/identities';

export default function Identities() {
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedDidForInspection, setSelectedDidForInspection] = useState<Identity | null>(null);
  const [isExported, setIsExported] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const list = getIdentities();
    setIdentities(list);
    setStats(calculateIdentityStats(list));
    setLoading(false);
  }, []);

  const handleAddIdentity = (newIdentity: Identity) => {
    const updated = [newIdentity, ...identities];
    setIdentities(updated);
    saveIdentities(updated);
    setStats(calculateIdentityStats(updated));
  };

  const handleImportIdentities = (newIdentities: Identity[]) => {
    const updated = [...newIdentities, ...identities];
    setIdentities(updated);
    saveIdentities(updated);
    setStats(calculateIdentityStats(updated));
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
  };

  const handleDeleteIdentity = (id: string) => {
    const updated = identities.filter((i) => i.id !== id);
    setIdentities(updated);
    saveIdentities(updated);
    setStats(calculateIdentityStats(updated));
  };

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

  if (loading) {
    return (
      <div className="flex-1 h-96 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-xs font-semibold text-slate-500">Loading Sovereign Identities...</p>
      </div>
    );
  }

  return (
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
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 border border-transparent rounded-xl text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Identity
          </button>
        </div>
      </div>

      {/* Dynamic Stats Cards */}
      <IdentityStats stats={stats} />

      {/* Main Interactive Table */}
      <IdentityTable
        identities={identities}
        onToggleStatus={handleToggleStatus}
        onDeleteIdentity={handleDeleteIdentity}
        onInspectIdentity={(identity) => setSelectedDidForInspection(identity)}
      />

      {/* Create Identity Modal */}
      <CreateIdentityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddIdentity={handleAddIdentity}
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
      />
    </div>
  );
}
