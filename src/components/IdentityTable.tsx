import { useState } from 'react';
import { Search, Filter, LayoutGrid, List, MoreVertical, Copy, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { mockIdentities, type Identity } from '../data/mockData';

export default function IdentityTable() {
  const [activeTab, setActiveTab] = useState('All Identities');
  const tabs = ['All Identities', 'Verified', 'Pending', 'Revoked'];

  const filteredIdentities = mockIdentities.filter(identity => {
    if (activeTab === 'All Identities') return true;
    return identity.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'Revoked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <Shield className="w-3.5 h-3.5" />
            Revoked
          </span>
        );
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Controls & Tabs */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab
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
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Created On</th>
              <th className="px-6 py-4 font-medium">Last Active</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredIdentities.map((identity: Identity) => (
              <tr key={identity.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {identity.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{identity.name}</div>
                      <div className="text-xs text-slate-500">{identity.name.toLowerCase().replace(' ', '.')}@bel.co.in</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-slate-600">{identity.did}</span>
                    <button 
                      onClick={() => copyToClipboard(identity.did)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                    {identity.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{identity.department}</td>
                <td className="px-6 py-4">
                  {getStatusBadge(identity.status)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{identity.createdOn}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{identity.lastActive}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
        <div>Showing 1 to {filteredIdentities.length} of {filteredIdentities.length} entries</div>
        <div className="flex items-center gap-2">
          <select className="border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>10 / page</option>
            <option>20 / page</option>
            <option>50 / page</option>
          </select>
          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden">
            <button className="px-3 py-1 bg-slate-50 text-slate-400 border-r border-slate-200" disabled>Previous</button>
            <button className="px-3 py-1 bg-white text-blue-600 font-medium">1</button>
            <button className="px-3 py-1 bg-slate-50 text-slate-400 border-l border-slate-200" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
