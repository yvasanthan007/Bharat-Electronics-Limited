import { useState, useRef, useEffect } from 'react';
import { Plus, Shield, Search, Filter, Layers, Check, X } from 'lucide-react';
import AccessStats from '../components/AccessStats';
import RolesTable from '../components/RolesTable';
import PermissionMatrix from '../components/PermissionMatrix';
import AccessRequests from '../components/AccessRequests';
import AccessModals from '../components/AccessModals';
import FullMatrixModal from '../components/FullMatrixModal';
import { mockRoles, mockPermissionMatrix, type Role } from '../data/mockData';

const ROLES_STORAGE_KEY = 'bel_access_roles';

export default function AccessControl() {
  // Primary Dynamic Roles with localStorage persistence
  const [roles, setRoles] = useState<Role[]>(() => {
    const saved = localStorage.getItem(ROLES_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error loading roles from localStorage', e);
      }
    }
    return mockRoles;
  });

  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [assignAccessOpen, setAssignAccessOpen] = useState(false);
  const [isFullMatrixOpen, setIsFullMatrixOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Roles' | 'Permissions' | 'Access Requests'>('Roles');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter Dropdown State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [quorumFilter, setQuorumFilter] = useState<'All' | 'Multisig' | 'Single'>('All');
  const filterRef = useRef<HTMLDivElement>(null);

  const tabs: Array<'Roles' | 'Permissions' | 'Access Requests'> = ['Roles', 'Permissions', 'Access Requests'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = statusFilter !== 'All' || quorumFilter !== 'All' || searchTerm.trim() !== '';

  const clearFilters = () => {
    setStatusFilter('All');
    setQuorumFilter('All');
    setSearchTerm('');
    setIsFilterOpen(false);
  };

  // Real Dynamic Role Creation Handler with persistence
  const handleRoleCreated = (newRole: Role, permissionsArray: boolean[]) => {
    setRoles(prev => {
      const updated = [newRole, ...prev];
      localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    mockPermissionMatrix[newRole.name] = permissionsArray;
  };

  const handleRolesChange = (newRoles: Role[]) => {
    setRoles(newRoles);
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(newRoles));
  };

  // Real Dynamic Access Assignment Handler with persistence
  const handleAssignAccess = (_userName: string, roleName: string, _resource: string, _department: string) => {
    setRoles(prev => {
      const updated = prev.map(r => (r.name === roleName ? { ...r, usersCount: r.usersCount + 1 } : r));
      localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const totalUsersCount = roles.reduce((sum, r) => sum + r.usersCount, 0);

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
            onClick={() => setIsFullMatrixOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            View Full Matrix
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

      {/* Dynamic KPI Cards */}
      <AccessStats 
        rolesCount={roles.length}
        usersCount={totalUsersCount}
      />

      {/* Tabs and Search / Filter Controls */}
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
          {/* Active Live Search */}
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search roles, policies, requests..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Popover Trigger */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Filter by status or quorum"
              className={`p-2 border rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              )}
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-40 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900">Filter Roles & Requests</h4>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Status</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['All', 'Active', 'Inactive'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          statusFilter === s
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Authorization Quorum</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['All', 'Multisig', 'Single'] as const).map(q => (
                      <button
                        key={q}
                        onClick={() => setQuorumFilter(q)}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          quorumFilter === q
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Tab Views */}
      {activeTab === 'Roles' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RolesTable 
            roles={roles}
            onRolesChange={handleRolesChange}
            onViewAllRoles={() => setActiveTab('Roles')}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
          <PermissionMatrix 
            onOpenFullMatrix={() => setIsFullMatrixOpen(true)}
            searchTerm={searchTerm}
          />
        </div>
      )}

      {activeTab === 'Permissions' && (
        <div className="space-y-6">
          <PermissionMatrix 
            onOpenFullMatrix={() => setIsFullMatrixOpen(true)}
            searchTerm={searchTerm}
          />
        </div>
      )}

      {activeTab === 'Access Requests' && (
        <div className="space-y-6">
          <AccessRequests 
            searchTerm={searchTerm}
          />
        </div>
      )}

      {/* All Access Modals with Active Creation & Assignment */}
      <AccessModals 
        createRoleOpen={createRoleOpen}
        setCreateRoleOpen={setCreateRoleOpen}
        assignAccessOpen={assignAccessOpen}
        setAssignAccessOpen={setAssignAccessOpen}
        roles={roles}
        onRoleCreated={handleRoleCreated}
        onAssignAccess={handleAssignAccess}
      />

      {/* Comprehensive Permission Matrix Modal */}
      <FullMatrixModal
        isOpen={isFullMatrixOpen}
        onClose={() => setIsFullMatrixOpen(false)}
      />
    </div>
  );
}
