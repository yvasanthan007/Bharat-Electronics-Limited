import { useState } from 'react';
import { Plus, Shield, Search, Filter, Layers } from 'lucide-react';
import AccessStats from '../components/AccessStats';
import RolesTable from '../components/RolesTable';
import PermissionMatrix from '../components/PermissionMatrix';
import AccessRequests from '../components/AccessRequests';
import AccessModals from '../components/AccessModals';

export default function AccessControl() {
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [assignAccessOpen, setAssignAccessOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Roles');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = ['Roles', 'Permissions', 'Access Requests'];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Control & Role Hierarchy</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage Zero-Trust roles, smart contract permissions, and quorum authorizations</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={() => setCreateRoleOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Create Role
          </button>
          <button
            onClick={() => setActiveTab('Permissions')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            Permission Matrix
          </button>
          <button 
            onClick={() => setAssignAccessOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 border border-transparent rounded-xl text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Assign Access
          </button>
        </div>
      </div>

      <AccessStats />

      {/* Tabs and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
              placeholder="Search roles, actions..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <button
            title="Filter"
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Tab Views */}
      {activeTab === 'Roles' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RolesTable />
          <PermissionMatrix />
        </div>
      )}

      {activeTab === 'Permissions' && (
        <div className="space-y-6">
          <PermissionMatrix />
        </div>
      )}

      {activeTab === 'Access Requests' && (
        <div className="space-y-6">
          <AccessRequests />
        </div>
      )}

      <AccessModals 
        createRoleOpen={createRoleOpen}
        setCreateRoleOpen={setCreateRoleOpen}
        assignAccessOpen={assignAccessOpen}
        setAssignAccessOpen={setAssignAccessOpen}
      />
    </div>
  );
}
