import { useState } from 'react';
import { Search, Filter, MoreVertical, FileCode2 } from 'lucide-react';
import { mockContracts, type SmartContract } from '../data/mockContracts';

const tabs = ['All Contracts', 'Active', 'Pending', 'Deployed', 'Paused', 'Archived'];

export default function ContractTable() {
  const [activeTab, setActiveTab] = useState('All Contracts');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full">Active</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full">Pending</span>;
      case 'Paused':
        return <span className="px-2.5 py-1 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-full">Paused</span>;
      case 'Archived':
        return <span className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-full">Archived</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-full">{status}</span>;
    }
  };

  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          contract.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All Contracts' ? true : contract.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">Smart Contracts</h2>
      </div>

      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contract Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Network</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Deployed On</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Transactions</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContracts.map((contract: SmartContract) => (
              <tr key={contract.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileCode2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{contract.name}</div>
                      <div className="text-xs font-mono text-slate-500">{contract.address}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{contract.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(contract.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    {contract.network}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{contract.deployedOn}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 text-right">{contract.transactions}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
        <div>
          Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">{filteredContracts.length}</span> of <span className="font-medium text-slate-900">{mockContracts.length}</span> contracts
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
