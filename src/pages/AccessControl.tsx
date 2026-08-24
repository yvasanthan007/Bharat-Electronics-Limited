import { useState } from 'react';
import { Plus, Shield, Search, Filter } from 'lucide-react';
import AccessStats from '../components/AccessStats';
import RolesTable from '../components/RolesTable';
import PermissionMatrix from '../components/PermissionMatrix';
import AccessRequests from '../components/AccessRequests';
import AccessModals from '../components/AccessModals';

export default function AccessControl() {
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [assignAccessOpen, setAssignAccessOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Roles');

  const tabs = ['Roles', 'Users', 'Permissions', 'Access Requests', 'Session Logs'];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-lg text-blue-600">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Access Control</h1>
            <p className="text-sm text-slate-500">Manage roles, permissions and user access across the platform</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setCreateRoleOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Permission Matrix
          </button>
          <button 
            onClick={() => setAssignAccessOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Assign Access
          </button>
        </div>
      </div>

      <AccessStats />

      {/* Tabs and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
              placeholder="Search roles..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Two Column Layout for Roles and Permissions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RolesTable />
        <PermissionMatrix />
      </div>

      {/* Access Requests Full Width */}
      <AccessRequests />

      <AccessModals 
        createRoleOpen={createRoleOpen}
        setCreateRoleOpen={setCreateRoleOpen}
        assignAccessOpen={assignAccessOpen}
        setAssignAccessOpen={setAssignAccessOpen}
      />
    </div>
  );
}
