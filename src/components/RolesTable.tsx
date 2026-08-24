import { useState, useRef, useEffect } from 'react';
import { MoreVertical, ShieldCheck, Users, Key, Edit3, UserCheck, Copy, Power, Trash2, CheckCircle2, ShieldAlert, Lock, Check, X } from 'lucide-react';
import { mockPermissions, type Role } from '../data/mockData';
import { PERMISSION_DEFINITIONS } from './AccessModals';

interface RolesTableProps {
  roles?: Role[];
  onRolesChange?: (roles: Role[]) => void;
  onViewAllRoles?: () => void;
  searchTerm?: string;
  statusFilter?: string;
}

export default function RolesTable({
  roles = [],
  onRolesChange,
  onViewAllRoles,
  searchTerm = '',
  statusFilter = 'All'
}: RolesTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedRoleMembers, setSelectedRoleMembers] = useState<Role | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editPerms, setEditPerms] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRoles = roles.filter(role => {
    const matchesSearch = !searchTerm.trim() || 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || role.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (role: Role) => {
    setEditingRole({ ...role });
    // Seed initial permissions for editing
    if (role.name.toLowerCase().includes('auditor')) {
      setEditPerms(['View Audit Trail', 'Export Reports']);
    } else if (role.name.toLowerCase().includes('admin')) {
      setEditPerms([...mockPermissions]);
    } else {
      setEditPerms(['Manage Assets (NFTs)', 'Smart Contracts', 'View Audit Trail']);
    }
    setActiveMenuId(null);
  };

  const isRoleAuditor = editingRole?.name.toLowerCase().includes('auditor') ?? false;

  const isEditPermBlocked = (permName: string): boolean => {
    if (!isRoleAuditor) return false;
    const def = PERMISSION_DEFINITIONS.find(p => p.name === permName);
    return def ? def.restrictedForTemplates.includes('Auditor') : false;
  };

  const toggleEditPerm = (permName: string) => {
    if (isEditPermBlocked(permName)) {
      alert(`Zero-Trust Rule: "${permName}" cannot be assigned to Auditor roles to prevent privilege escalation.`);
      return;
    }
    setEditPerms(prev =>
      prev.includes(permName) ? prev.filter(p => p !== permName) : [...prev, permName]
    );
  };

  const handleToggleStatus = (roleId: string) => {
    if (onRolesChange) {
      const updated = roles.map(r => (r.id === roleId ? { ...r, status: r.status === 'Active' ? ('Inactive' as const) : ('Active' as const) } : r));
      onRolesChange(updated);
    }
    setActiveMenuId(null);
  };

  const handleCloneRole = (role: Role) => {
    const cloned: Role = {
      ...role,
      id: `role-${Date.now()}`,
      name: `${role.name} (Copy)`,
      description: `Cloned policy from ${role.name}`,
      usersCount: 0,
    };
    if (onRolesChange) {
      onRolesChange([cloned, ...roles]);
    }
    setActiveMenuId(null);
  };

  const handleDeleteRole = (roleId: string, roleName: string) => {
    if (confirm(`Are you sure you want to revoke and delete the role "${roleName}"?`)) {
      if (onRolesChange) {
        onRolesChange(roles.filter(r => r.id !== roleId));
      }
      setActiveMenuId(null);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    const updatedRole: Role = {
      ...editingRole,
      permissionsCount: editPerms.length > 0 ? editPerms.length : 1
    };
    if (onRolesChange) {
      onRolesChange(roles.map(r => r.id === editingRole.id ? updatedRole : r));
    }
    setEditingRole(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col h-full relative" ref={menuRef}>
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Configured Roles ({filteredRoles.length})</h2>
          <p className="text-xs text-slate-500">Zero-Trust permission clusters and quorum thresholds</p>
        </div>
        {onViewAllRoles && (
          <button
            onClick={onViewAllRoles}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer shadow-2xs"
          >
            View all roles →
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[600px] text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-semibold">
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Assigned Users</th>
              <th className="px-5 py-3.5">Permissions</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Role Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRoles.map((role: Role) => (
              <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-bold text-slate-900 leading-tight">{role.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{role.description}</div>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => setSelectedRoleMembers(role)}
                    className="flex items-center gap-1.5 font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    {role.usersCount} users
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 font-mono text-slate-700 font-semibold">
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    {role.permissionsCount} policies
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    role.status === 'Active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}>
                    {role.status === 'Active' ? <ShieldCheck className="w-3 h-3 text-emerald-600" /> : <ShieldAlert className="w-3 h-3 text-slate-400" />}
                    {role.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right relative">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === role.id ? null : role.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Role actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Interactive Role Actions Popover */}
                  {activeMenuId === role.id && (
                    <div className="absolute right-4 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-left animate-in fade-in slide-in-from-top-1 duration-100">
                      <button
                        onClick={() => handleOpenEdit(role)}
                        className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        Edit Role Policies
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRoleMembers(role);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        View Members ({role.usersCount})
                      </button>
                      <button
                        onClick={() => handleCloneRole(role)}
                        className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <Copy className="w-3.5 h-3.5 text-purple-600" />
                        Duplicate / Clone Role
                      </button>
                      <button
                        onClick={() => handleToggleStatus(role.id)}
                        className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <Power className="w-3.5 h-3.5 text-amber-600" />
                        Toggle {role.status === 'Active' ? 'Inactive' : 'Active'}
                      </button>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={() => handleDeleteRole(role.id, role.name)}
                        className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        Revoke Role
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRoles.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No roles found matching current search/filter.
          </div>
        )}
      </div>
      
      {onViewAllRoles && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
          <button
            onClick={onViewAllRoles}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View all configured roles and member rosters →
          </button>
        </div>
      )}

      {/* Member Roster Modal */}
      {selectedRoleMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Assigned Members: {selectedRoleMembers.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Identities currently authorized with {selectedRoleMembers.name} permissions.
            </p>
            <div className="space-y-2.5 max-h-60 overflow-y-auto mb-5">
              {[
                { name: 'Rahul Verma', email: 'rahul.verma@bel.co.in', did: 'did:bel:7f82e391' },
                { name: 'Neha Gupta', email: 'neha.gupta@bel.co.in', did: 'did:bel:9a21b44c' },
                { name: 'Amit Kumar', email: 'amit.kumar@bel.co.in', did: 'did:bel:33b81023' },
              ].map((member, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{member.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{member.email}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {member.did}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedRoleMembers(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close Roster
            </button>
          </div>
        </div>
      )}

      {/* Edit Role Modal with Custom Permission Chooser & Blocked Guardrails */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">Edit Role: {editingRole.name}</h3>
            <p className="text-xs text-slate-500 mb-4">Modify role details and choose/remove assigned permissions.</p>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Role Name</label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isRoleAuditor && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>Auditor Zero-Trust Rule: Root System Settings and Role Assignment permissions are locked.</span>
                </div>
              )}

              {/* Permission Tags */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Assigned Permissions ({editPerms.length})</label>
                  <span className="text-[11px] text-blue-600 font-semibold">Click to add/remove</span>
                </div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {mockPermissions.map(perm => {
                    const isSelected = editPerms.includes(perm);
                    const isBlocked = isEditPermBlocked(perm);
                    return (
                      <div
                        key={perm}
                        onClick={() => toggleEditPerm(perm)}
                        className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer border transition-all ${
                          isBlocked
                            ? 'bg-slate-100 opacity-50 cursor-not-allowed border-slate-200'
                            : isSelected
                            ? 'bg-blue-50 border-blue-200 text-blue-800 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          {perm}
                        </span>
                        {isBlocked ? (
                          <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Blocked
                          </span>
                        ) : isSelected ? (
                          <X className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Status:</span>
                  <button
                    type="button"
                    onClick={() => setEditingRole({ ...editingRole, status: editingRole.status === 'Active' ? 'Inactive' : 'Active' })}
                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                      editingRole.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {editingRole.status}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingRole(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Save Role
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
