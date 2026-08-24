import { useState } from 'react';
import {
  Search, Filter, LayoutGrid, List, MoreVertical,
  Copy, Shield, ShieldAlert, ShieldCheck,
  FileText, QrCode, Award, Eye, CheckCircle2
} from 'lucide-react';
import { getAllDIDIdentities } from '../services/did';
import type { DIDIdentity } from '../data/mockDIDData';
import DIDDocumentModal from './did/DIDDocumentModal';
import VerifyDIDModal from './did/VerifyDIDModal';
import QRCodeModal from './did/QRCodeModal';
import IssueCredentialModal from './credentials/IssueCredentialModal';
import VerifyCredentialModal from './credentials/VerifyCredentialModal';
import CredentialCard from './credentials/CredentialCard';
import { getCredentialsByHolder } from '../services/credentials';
import type { VerifiableCredential } from '../lib/did/vcEngine';

interface IdentityTableProps {
  identities?: DIDIdentity[];
  onRefresh?: () => void;
}

type ActiveModal = 'doc' | 'verify' | 'qr' | 'issue' | 'credentials' | null;

export default function IdentityTable({ identities: propIdentities, onRefresh }: IdentityTableProps) {
  const [activeTab, setActiveTab] = useState('All Identities');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdentity, setSelectedIdentity] = useState<DIDIdentity | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [credentialsForView, setCredentialsForView] = useState<VerifiableCredential[]>([]);
  const [vcToVerify, setVcToVerify] = useState<VerifiableCredential | null>(null);
  const [verifyVCOpen, setVerifyVCOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tabs = ['All Identities', 'Verified', 'Pending', 'Revoked'];

  const allIdentities = propIdentities ?? getAllDIDIdentities();

  const filteredIdentities = allIdentities.filter(identity => {
    const matchesTab = activeTab === 'All Identities' || identity.status === activeTab;
    const matchesSearch = !searchQuery ||
      identity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      identity.did.toLowerCase().includes(searchQuery.toLowerCase()) ||
      identity.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified': return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <ShieldCheck className="w-3.5 h-3.5" />Verified
        </span>
      );
      case 'Pending': return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <ShieldAlert className="w-3.5 h-3.5" />Pending
        </span>
      );
      case 'Revoked': return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          <Shield className="w-3.5 h-3.5" />Revoked
        </span>
      );
      default: return null;
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const openModal = (identity: DIDIdentity, modal: ActiveModal) => {
    setSelectedIdentity(identity);
    setOpenMenuId(null);

    if (modal === 'credentials') {
      const creds = getCredentialsByHolder(identity.fullDID);
      setCredentialsForView(creds);
    }
    setActiveModal(modal);
  };

  const handleIssued = (_vc: VerifiableCredential) => {
    // Refresh credentials view
    if (selectedIdentity) {
      const creds = getCredentialsByHolder(selectedIdentity.fullDID);
      setCredentialsForView(creds);
    }
    onRefresh?.();
  };

  const truncate = (s: string, n = 14) =>
    s.length > n ? `${s.slice(0, n)}...${s.slice(-4)}` : s;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Controls & Tabs */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search identities..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
              <div className="hidden sm:flex border border-slate-200 rounded-lg p-1">
                <button className="p-1.5 bg-slate-100 rounded text-slate-700">
                  <List className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-700">
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4 font-medium">Identity</th>
                <th className="px-6 py-4 font-medium">DID</th>
                <th className="px-6 py-4 font-medium">Wallet</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIdentities.map((identity) => (
                <tr key={identity.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                        {identity.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{identity.name}</div>
                        <div className="text-xs text-slate-500">{identity.department}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-slate-600 max-w-[120px] truncate">{identity.did}</span>
                      <button
                        onClick={() => copyToClipboard(identity.fullDID, `did-${identity.id}`)}
                        className="text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                        title="Copy full DID"
                      >
                        {copiedId === `did-${identity.id}`
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          : <Copy className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-slate-500">{truncate(identity.walletAddress, 10)}</span>
                      <button
                        onClick={() => copyToClipboard(identity.walletAddress, `wallet-${identity.id}`)}
                        className="text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                        title="Copy wallet address"
                      >
                        {copiedId === `wallet-${identity.id}`
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          : <Copy className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {identity.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">{getStatusBadge(identity.status)}</td>

                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{identity.createdOn}</td>

                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === identity.id ? null : identity.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuId === identity.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-sm">
                          {[
                            { icon: <FileText className="w-4 h-4" />, label: 'View DID Document', action: () => openModal(identity, 'doc') },
                            { icon: <ShieldCheck className="w-4 h-4" />, label: 'Verify DID', action: () => openModal(identity, 'verify') },
                            { icon: <QrCode className="w-4 h-4" />, label: 'QR Code', action: () => openModal(identity, 'qr') },
                            { icon: <Award className="w-4 h-4" />, label: 'Issue Credential', action: () => openModal(identity, 'issue') },
                            { icon: <Eye className="w-4 h-4" />, label: 'View Credentials', action: () => openModal(identity, 'credentials') },
                          ].map(({ icon, label, action }) => (
                            <button
                              key={label}
                              onClick={action}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <span className="text-slate-400">{icon}</span>
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredIdentities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Shield className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No identities found</p>
              <p className="text-xs mt-1">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
          <div>Showing 1 to {filteredIdentities.length} of {filteredIdentities.length} entries</div>
          <div className="flex items-center gap-2">
            <select className="border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>10 / page</option>
              <option>20 / page</option>
            </select>
            <div className="flex items-center border border-slate-200 rounded-md overflow-hidden">
              <button className="px-3 py-1 bg-slate-50 text-slate-400 border-r border-slate-200" disabled>Previous</button>
              <button className="px-3 py-1 bg-white text-blue-600 font-medium">1</button>
              <button className="px-3 py-1 bg-slate-50 text-slate-400 border-l border-slate-200" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}

      {/* Modals */}
      <DIDDocumentModal
        isOpen={activeModal === 'doc'}
        onClose={() => setActiveModal(null)}
        identity={selectedIdentity}
      />

      <VerifyDIDModal
        isOpen={activeModal === 'verify'}
        onClose={() => setActiveModal(null)}
        identity={selectedIdentity}
      />

      <QRCodeModal
        isOpen={activeModal === 'qr'}
        onClose={() => setActiveModal(null)}
        identity={selectedIdentity}
      />

      <IssueCredentialModal
        isOpen={activeModal === 'issue'}
        onClose={() => setActiveModal(null)}
        identity={selectedIdentity}
        onIssued={handleIssued}
      />

      {/* View Credentials modal */}
      {activeModal === 'credentials' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setActiveModal(null)} aria-hidden="true" />
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Verifiable Credentials</h3>
                <p className="text-xs text-slate-500">{selectedIdentity?.name}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                <Copy className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {credentialsForView.length > 0 ? (
                credentialsForView.map(vc => (
                  <CredentialCard
                    key={vc.id}
                    vc={vc}
                    onVerify={(vcId) => {
                      const found = credentialsForView.find(v => v.id === vcId);
                      if (found) {
                        setVcToVerify(found);
                        setVerifyVCOpen(true);
                      }
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Award className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No credentials issued yet</p>
                  <p className="text-xs mt-1">Use "Issue Credential" from the actions menu</p>
                </div>
              )}
            </div>
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <VerifyCredentialModal
        isOpen={verifyVCOpen}
        onClose={() => setVerifyVCOpen(false)}
        vc={vcToVerify}
      />
    </>
  );
}
