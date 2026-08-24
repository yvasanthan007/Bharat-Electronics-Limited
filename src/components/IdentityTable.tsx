import { useState } from 'react';
import { Search, Filter, LayoutGrid, List, MoreVertical, Copy, Check, Shield, ShieldAlert, ShieldCheck, UserX, UserCheck } from 'lucide-react';
import { mockIdentities, type Identity } from '../data/mockData';

export default function IdentityTable() {
  const [activeTab, setActiveTab] = useState('All Identities');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedDid, setCopiedDid] = useState<string | null>(null);
  const [identitiesList, setIdentitiesList] = useState<Identity[]>(mockIdentities);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  const tabs = ['All Identities', 'Verified', 'Pending', 'Revoked'];

  const filteredIdentities = identitiesList.filter(identity => {
    const matchesTab = activeTab === 'All Identities' || identity.status === activeTab;
    const matchesSearch =
      identity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      identity.did.toLowerCase().includes(searchTerm.toLowerCase()) ||
      identity.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      identity.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
      case 'Revoked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <Shield className="w-3.5 h-3.5 text-rose-600" />
            Revoked
          </span>
        );
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDid(text);
    setTimeout(() => setCopiedDid(null), 2000);
  };

  const toggleStatus = (id: string) => {
    setIdentitiesList(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newStatus = item.status === 'Verified' ? 'Revoked' : 'Verified';
          return { ...item, status: newStatus as any };
        }
        return item;
      })
    );
    setSelectedActionId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Controls & Tabs */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-xs'
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search identities, DIDs, roles..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <button
              title="Filter"
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
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
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-3.5">Identity</th>
              <th className="px-6 py-3.5">DID</th>
              <th className="px-6 py-3.5">Role</th>
              <th className="px-6 py-3.5">Department</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Created On</th>
              <th className="px-6 py-3.5">Last Active</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredIdentities.map((identity: Identity) => (
              <tr key={identity.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                      {identity.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 leading-tight">{identity.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{identity.name.toLowerCase().replace(' ', '.')}@bel.co.in</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-600 font-semibold">{identity.did}</span>
                    <button 
                      onClick={() => copyToClipboard(identity.did)}
                      title="Copy DID"
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {copiedDid === identity.did ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {identity.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-600">{identity.department}</td>
                <td className="px-6 py-4">
                  {getStatusBadge(identity.status)}
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-mono">{identity.createdOn}</td>
                <td className="px-6 py-4 text-xs text-slate-500 font-mono">{identity.lastActive}</td>
                <td className="px-6 py-4 text-right relative">
                  <button
                    onClick={() => setSelectedActionId(selectedActionId === identity.id ? null : identity.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {selectedActionId === identity.id && (
                    <div className="absolute right-6 top-10 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 text-left animate-in fade-in duration-100">
                      <button
                        onClick={() => toggleStatus(identity.id)}
                        className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        {identity.status === 'Verified' ? (
                          <>
                            <UserX className="w-3.5 h-3.5 text-rose-500" />
                            Revoke Status
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                            Verify Identity
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          copyToClipboard(identity.did);
                          setSelectedActionId(null);
                        }}
                        className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Copy className="w-3.5 h-3.5 text-blue-500" />
                        Copy Verified DID
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredIdentities.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            No identities found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <div>Showing {filteredIdentities.length} of {identitiesList.length} verified identities</div>
        <div className="flex items-center gap-2">
          <select className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-xs text-slate-700">
            <option>10 / page</option>
            <option>20 / page</option>
            <option>50 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
}
