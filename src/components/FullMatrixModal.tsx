import { useState } from 'react';
import { X, Check, Search, Save, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { mockRoles } from '../data/mockData';

interface FullMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PermissionCategory {
  category: string;
  permissions: string[];
}

const detailedCategories: PermissionCategory[] = [
  {
    category: 'Identity & Decentralized DIDs',
    permissions: ['Create Identity DID', 'Verify Biometrics / Credentials', 'Revoke DID Status', 'Manage Department Roles']
  },
  {
    category: 'Digital Assets & Hardware Tokens',
    permissions: ['Mint Hardware NFT', 'Burn / Decommission Token', 'Transfer Custody', 'Approve Asset Valuation']
  },
  {
    category: 'Transactions & Gas Benchmarks',
    permissions: ['Execute On-Chain Tx', 'Sign Multisig Quorum', 'Override Gas Limit', 'Export Complete Ledger']
  },
  {
    category: 'Smart Contracts Governance',
    permissions: ['Deploy Smart Contract', 'Pause / Unpause Circuit Breaker', 'Upgrade Contract Bytecode', 'Verify Merkle Proof']
  },
  {
    category: 'System Node & Security Settings',
    permissions: ['Manage Defense Vault Keys', 'Rotate HSM Hardware Root', 'Configure Consensus Node', 'Manage Webhook Relays']
  },
  {
    category: 'Cryptographic Audit & Compliance',
    permissions: ['View SOC-2 Sealed Reports', 'Export Merkle Log Receipts', 'Trigger Fraud Detection Scan', 'Sign Off Audit Cycle']
  }
];

export default function FullMatrixModal({ isOpen, onClose }: FullMatrixModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSaved, setIsSaved] = useState(false);

  // Initial matrix state
  const [matrixState, setMatrixState] = useState<Record<string, Record<string, boolean>>>(() => {
    const state: Record<string, Record<string, boolean>> = {};
    mockRoles.forEach((role) => {
      state[role.name] = {};
      detailedCategories.forEach(cat => {
        cat.permissions.forEach((perm, idx) => {
          if (role.name === 'Administrator') {
            state[role.name][perm] = true;
          } else if (role.name === 'Engineer') {
            state[role.name][perm] = idx % 2 === 0 || cat.category.includes('Smart') || cat.category.includes('Digital');
          } else if (role.name === 'Auditor') {
            state[role.name][perm] = cat.category.includes('Audit') || perm.includes('View') || perm.includes('Export');
          } else {
            state[role.name][perm] = idx === 0;
          }
        });
      });
    });
    return state;
  });

  if (!isOpen) return null;

  const togglePermission = (roleName: string, permissionName: string) => {
    setMatrixState(prev => ({
      ...prev,
      [roleName]: {
        ...prev[roleName],
        [permissionName]: !prev[roleName]?.[permissionName]
      }
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const categoriesList = ['All', ...detailedCategories.map(c => c.category)];

  const filteredCategories = detailedCategories.filter(c => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      return c.permissions.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
             c.category.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Zero-Trust Comprehensive Permission Matrix</h2>
              <p className="text-xs text-slate-500">Fine-grained cryptographic access rights across roles and modules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {categoriesList.slice(0, 4).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter specific permissions..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {filteredCategories.map(cat => (
            <div key={cat.category} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{cat.category}</h4>
                <span className="text-[11px] text-slate-500 font-medium">{cat.permissions.length} actions</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-100 bg-white text-slate-400 font-semibold">
                      <th className="px-4 py-2.5 w-1/3">Permission Action</th>
                      {mockRoles.map(role => (
                        <th key={role.name} className="px-4 py-2.5 text-center font-bold text-slate-700">
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cat.permissions
                      .filter(p => !searchTerm.trim() || p.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(perm => (
                        <tr key={perm} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {perm}
                          </td>
                          {mockRoles.map(role => {
                            const isAllowed = matrixState[role.name]?.[perm] ?? false;
                            return (
                              <td key={role.name} className="px-4 py-3 text-center">
                                <button
                                  onClick={() => togglePermission(role.name, perm)}
                                  title={`Click to ${isAllowed ? 'Revoke' : 'Grant'} ${perm} for ${role.name}`}
                                  className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                    isAllowed
                                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-2xs'
                                      : 'bg-rose-50 text-rose-400 hover:bg-rose-100'
                                  }`}
                                >
                                  {isAllowed ? <Check className="w-4 h-4 font-bold" /> : <X className="w-4 h-4 font-bold" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            Tip: Click any checkmark/cross to grant or revoke real-time permissions for that role.
          </p>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={isSaved}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Policy Committed to Ledger!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Permission Matrix
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
