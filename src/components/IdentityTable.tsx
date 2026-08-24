import { useState, useMemo } from 'react';
import { 
  Search, LayoutGrid, List, MoreVertical, Copy, Check, 
  ShieldCheck, ShieldAlert, ShieldX, UserX, UserCheck, Eye, 
  Trash2, Award, Users, Shield 
} from 'lucide-react';
import type { Identity, IdentityStatus, SecurityClearance } from '../services/identities';

interface IdentityTableProps {
  identities: Identity[];
  onToggleStatus: (id: string) => void;
  onDeleteIdentity: (id: string) => void;
  onInspectIdentity: (identity: Identity) => void;
}

export default function IdentityTable({
  identities,
  onToggleStatus,
  onDeleteIdentity,
  onInspectIdentity,
}: IdentityTableProps) {
  const [activeTab, setActiveTab] = useState<'All Identities' | IdentityStatus>('All Identities');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [clearanceFilter, setClearanceFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [copiedDid, setCopiedDid] = useState<string | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const tabs: Array<'All Identities' | IdentityStatus> = ['All Identities', 'Verified', 'Pending', 'Revoked'];

  const departments = useMemo(() => {
    const set = new Set(identities.map((i) => i.department));
    return ['All', ...Array.from(set)];
  }, [identities]);

  const filteredIdentities = useMemo(() => {
    return identities.filter((identity) => {
      const matchesTab = activeTab === 'All Identities' || identity.status === activeTab;
      const matchesSearch =
        identity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        identity.did.toLowerCase().includes(searchTerm.toLowerCase()) ||
        identity.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        identity.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        identity.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        identity.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = departmentFilter === 'All' || identity.department === departmentFilter;
      const matchesClearance = clearanceFilter === 'All' || identity.securityClearance === clearanceFilter;

      return matchesTab && matchesSearch && matchesDept && matchesClearance;
    });
  }, [identities, activeTab, searchTerm, departmentFilter, clearanceFilter]);

  // Pagination slice
  const paginatedIdentities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredIdentities.slice(start, start + itemsPerPage);
  }, [filteredIdentities, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredIdentities.length / itemsPerPage) || 1;

  const copyToClipboard = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedDid(text);
    setTimeout(() => setCopiedDid(null), 2000);
  };

  const getStatusBadge = (status: IdentityStatus) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
      case 'Revoked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldX className="w-3.5 h-3.5 text-rose-600" />
            Revoked
          </span>
        );
    }
  };

  const getClearanceBadge = (clearance: SecurityClearance) => {
    switch (clearance) {
      case 'Top Secret (SCI)':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-3 h-3 text-purple-600" /> Top Secret
          </span>
        );
      case 'Secret':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Secret
          </span>
        );
      case 'Confidential':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Confidential
          </span>
        );
      case 'Restricted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Restricted
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Manager':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Engineer':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Auditor':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Security Officer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xs border border-slate-200 overflow-hidden">
      {/* Table Controls & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto gap-0.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, DID, role..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Departments</option>
              {departments.filter((d) => d !== 'All').map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Clearance Filter */}
            <select
              value={clearanceFilter}
              onChange={(e) => {
                setClearanceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Clearances</option>
              <option value="Top Secret (SCI)">Top Secret (SCI)</option>
              <option value="Secret">Secret</option>
              <option value="Confidential">Confidential</option>
              <option value="Restricted">Restricted</option>
            </select>

            {/* Layout Toggle */}
            <div className="flex border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main View: List or Grid */}
      {viewMode === 'list' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-3.5">Personnel & Avatar</th>
                <th className="px-6 py-3.5">Decentralized DID</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Clearance</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Credentials</th>
                <th className="px-6 py-3.5">Last Active</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedIdentities.map((identity) => (
                <tr
                  key={identity.id}
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  onClick={() => onInspectIdentity(identity)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {identity.avatar ? (
                        <img
                          src={identity.avatar}
                          alt={identity.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                          {identity.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                          {identity.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {identity.email}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 rounded">
                            {identity.employeeId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {identity.did}
                      </span>
                      <button
                        onClick={(e) => copyToClipboard(identity.did, e)}
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getRoleBadge(identity.role)}`}>
                      {identity.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{identity.department}</td>
                  <td className="px-6 py-4">{getClearanceBadge(identity.securityClearance)}</td>
                  <td className="px-6 py-4">{getStatusBadge(identity.status)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      <Award className="w-3 h-3 text-blue-600" />
                      {identity.verifiableCredentialsCount} VCs
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">{identity.lastActive}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedActionId(selectedActionId === identity.id ? null : identity.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {selectedActionId === identity.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-6 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 text-left animate-in fade-in duration-100"
                      >
                        <button
                          onClick={() => {
                            onInspectIdentity(identity);
                            setSelectedActionId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          Inspect DID Document
                        </button>
                        <button
                          onClick={() => {
                            onToggleStatus(identity.id);
                            setSelectedActionId(null);
                          }}
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
                          onClick={(e) => {
                            copyToClipboard(identity.did, e);
                            setSelectedActionId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          Copy Verified DID
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          onClick={() => {
                            onDeleteIdentity(identity.id);
                            setSelectedActionId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Decommission DID
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Card View */
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedIdentities.map((identity) => (
            <div
              key={identity.id}
              onClick={() => onInspectIdentity(identity)}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer hover:border-blue-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {identity.avatar ? (
                      <img
                        src={identity.avatar}
                        alt={identity.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-2xs">
                        {identity.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {identity.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {identity.employeeId}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(identity.status)}
                </div>

                <div className="space-y-2 py-2 border-y border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-bold text-slate-700">{identity.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadge(identity.role)}`}>
                      {identity.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clearance:</span>
                    <span>{getClearanceBadge(identity.securityClearance)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Decentralized DID:</span>
                  <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-200 mt-1 font-mono text-[11px]">
                    <span className="truncate max-w-[200px] text-blue-600 font-semibold">{identity.did}</span>
                    <button
                      onClick={(e) => copyToClipboard(identity.did, e)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      {copiedDid === identity.did ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  Active: {identity.lastActive}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectIdentity(identity);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredIdentities.length === 0 && (
        <div className="p-12 text-center text-slate-400">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs font-bold">No decentralized identities found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
        <div>
          Showing {Math.min(filteredIdentities.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredIdentities.length, currentPage * itemsPerPage)} of {filteredIdentities.length} total identities
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-xs text-slate-700 font-bold cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer"
            >
              Prev
            </button>
            <span className="px-2 font-mono font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
