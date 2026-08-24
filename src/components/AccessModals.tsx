import { useState } from 'react';
import { X, CheckCircle2, ShieldPlus, UserPlus, Sparkles } from 'lucide-react';
import { mockPermissions, type Role } from '../data/mockData';

interface AccessModalsProps {
  createRoleOpen: boolean;
  setCreateRoleOpen: (val: boolean) => void;
  assignAccessOpen: boolean;
  setAssignAccessOpen: (val: boolean) => void;
  roles?: Role[];
  onRoleCreated?: (newRole: Role, permissionsArray: boolean[]) => void;
  onAssignAccess?: (userName: string, roleName: string, resource: string, department: string) => void;
}

export default function AccessModals({
  createRoleOpen,
  setCreateRoleOpen,
  assignAccessOpen,
  setAssignAccessOpen,
  roles = [],
  onRoleCreated,
  onAssignAccess
}: AccessModalsProps) {
  // Create Role State
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([mockPermissions[0], mockPermissions[2]]);
  const [roleQuorum, setRoleQuorum] = useState('Single Signature');
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Assign Access State
  const [userName, setUserName] = useState('');
  const [selectedRole, setSelectedRole] = useState(roles.length > 0 ? roles[0].name : 'Engineer');
  const [resource, setResource] = useState('');
  const [department, setDepartment] = useState('Defense R&D');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);

  const togglePermission = (perm: string) => {
    setSelectedPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setIsCreatingRole(true);

    const nameToSave = roleName.trim();
    const descToSave = roleDescription.trim() || 'Custom security policy cluster';

    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: nameToSave,
      description: descToSave,
      usersCount: 0,
      permissionsCount: selectedPerms.length > 0 ? selectedPerms.length : 1,
      status: 'Active',
    };

    const permArray = mockPermissions.map(p => selectedPerms.includes(p));

    if (onRoleCreated) {
      onRoleCreated(newRole, permArray);
    }

    setTimeout(() => {
      setIsCreatingRole(false);
      setCreateSuccess(true);
      setTimeout(() => {
        setCreateSuccess(false);
        setCreateRoleOpen(false);
        setRoleName('');
        setRoleDescription('');
      }, 1000);
    }, 400);
  };

  const handleAssignAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setIsAssigning(true);

    const targetUser = userName.trim();
    const targetRole = selectedRole || (roles[0]?.name ?? 'Administrator');
    const targetResource = resource.trim() || 'Defense Platform Master Node';

    if (onAssignAccess) {
      onAssignAccess(targetUser, targetRole, targetResource, department);
    }

    setTimeout(() => {
      setIsAssigning(false);
      setAssignSuccess(true);
      setTimeout(() => {
        setAssignSuccess(false);
        setAssignAccessOpen(false);
        setUserName('');
        setResource('');
      }, 1000);
    }, 400);
  };

  return (
    <>
      {/* Create Role Modal */}
      {createRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Create New Role</h2>
                  <p className="text-xs text-slate-500">Configure permission cluster and quorum policies</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateRoleOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {createSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Role Created & Displayed!</h3>
                  <p className="text-xs text-slate-500">Role "{roleName}" is now active in your Configured Roles list.</p>
                </div>
              ) : (
                <form onSubmit={handleCreateRoleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Role Name</label>
                    <input
                      required
                      type="text"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="e.g. Compliance Lead, Security Auditor, Station Master"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Description</label>
                    <textarea
                      required
                      rows={2}
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      placeholder="Specify the operational responsibilities of this role"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Quorum Signing Requirement</label>
                    <select
                      value={roleQuorum}
                      onChange={(e) => setRoleQuorum(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Single Signature">Single Administrator Signature</option>
                      <option value="Multisig 2-of-3">Multisig 2-of-3 Hardware Approval</option>
                      <option value="Multisig 3-of-5">Multisig 3-of-5 Station Quorum</option>
                    </select>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Select Permissions</label>
                      <span className="text-[11px] font-bold text-blue-600">{selectedPerms.length} selected</span>
                    </div>
                    <div className="border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2 bg-slate-50/50">
                      {mockPermissions.map(p => (
                        <label key={p} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-blue-600 font-medium">
                          <input
                            type="checkbox"
                            checked={selectedPerms.includes(p)}
                            onChange={() => togglePermission(p)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          />
                          {p}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Form Submit Buttons directly inside form */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCreateRoleOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingRole || !roleName.trim()}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isCreatingRole ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating Role...
                        </>
                      ) : (
                        'Create Role'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Access Modal */}
      {assignAccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Assign Role & Access</h2>
                  <p className="text-xs text-slate-500">Authorize user or station with verifiable role privileges</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssignAccessOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {assignSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Access Granted!</h3>
                  <p className="text-xs text-slate-500">
                    Role "{selectedRole}" has been assigned to <strong>{userName || 'User'}</strong> on-chain.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAssignAccessSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Identity Name or Email / DID</label>
                    <input
                      required
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Ravi Kishore or did:bel:ab31...e5f7"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Role to Assign</label>
                      <select
                        required
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        {roles.map(r => (
                          <option key={r.id} value={r.name}>{r.name} ({r.permissionsCount} perms)</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Defense R&D">Defense R&D</option>
                        <option value="IT & Cryptographic Security">IT & Cryptographic Security</option>
                        <option value="Sonar & Radar Avionics">Sonar & Radar Avionics</option>
                        <option value="Regulatory & Compliance">Regulatory & Compliance</option>
                        <option value="Manufacturing & Logistics">Manufacturing & Logistics</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Resource / Module Scope</label>
                    <input
                      type="text"
                      value={resource}
                      onChange={(e) => setResource(e.target.value)}
                      placeholder="e.g. Project Varuna Radar Node #4"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p>
                      Assigning will emit a cryptographic role elevation event recorded on the immutable audit trail.
                    </p>
                  </div>

                  {/* Submit buttons inside form */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setAssignAccessOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAssigning || !userName.trim()}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isAssigning ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Authorizing...
                        </>
                      ) : (
                        'Authorize & Assign'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
