import { useState } from 'react';
import { Download, Upload, Plus, Check } from 'lucide-react';
import IdentityStats from '../components/IdentityStats';
import IdentityTable from '../components/IdentityTable';
import CreateIdentityModal from '../components/CreateIdentityModal';
import { mockIdentities } from '../data/mockData';

export default function Identities() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExported, setIsExported] = useState(false);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mockIdentities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BEL_Identities_Ledger_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setIsExported(true);
    setTimeout(() => setIsExported(false), 2000);
  };

  const handleImport = () => {
    alert('Import identity wizard: Select JSON / CSV identity directory or connect defense LDAP / Active Directory.');
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Decentralized Identities (DIDs)</h1>
          <p className="text-xs text-slate-500 mt-1">Manage tamper-proof digital identities, roles, and cryptographic verification status.</p>
        </div>
        
        <div className="flex items-center gap-2.5">
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
                Export
              </>
            )}
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Import
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

      <IdentityStats />
      <IdentityTable />

      <CreateIdentityModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
