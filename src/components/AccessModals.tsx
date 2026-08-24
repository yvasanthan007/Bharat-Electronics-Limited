import { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldPlus, UserPlus, Sparkles, Lock, AlertTriangle, Check } from 'lucide-react';
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

export interface PermissionDefinition {
  name: string;
  category: string;
  description: string;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Standard';
  restrictedForTemplates: string[]; // Role templates that are forbidden from having this
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    name: 'Manage Identities',
    category: 'Identity',
    description: 'Allows creating, verifying biometric credentials, and revoking decentralized DIDs for defense personnel.',
    riskLevel: 'High',
    restrictedForTemplates: ['Auditor', 'Operator']
  },
  {
    name: 'Assign Roles',
    category: 'Security',
    description: 'Grants power to elevate user permissions, assign roles, and approve access requests. (Privilege escalation risk)',
    riskLevel: 'Critical',
    restrictedForTemplates: ['Auditor', 'Engineer', 'Operator']
  },
  {
    name: 'Manage Assets (NFTs)',
    category: 'Digital Assets',
    description: 'Allows minting, tokenizing, burning, or transferring custody of defense hardware certificates and stablecoin pools.',
    riskLevel: 'High',
    restrictedForTemplates: ['Auditor']
  },
  {
    name: 'Smart Contracts',
    category: 'Governance',
    description: 'Allows deploying, pausing circuit-breakers, and interacting with on-chain sovereign smart contracts.',
    riskLevel: 'High',
    restrictedForTemplates: ['Auditor']
  },
  {
    name: 'View Audit Trail',
    category: 'Audit',
    description: 'Allows viewing immutable cryptographic event logs, Merkle proof receipts, and compliance records.',
    riskLevel: 'Standard',
    restrictedForTemplates: []
  },
  {
    name: 'System Settings',
    category: 'Root Node',
    description: 'High-privilege root access to defense hardware vault keys, HSM rotation, and blockchain node configuration.',
    riskLevel: 'Critical',
    restrictedForTemplates: ['Auditor', 'Operator', 'Engineer']
  },
  {
    name: 'Export Reports',
    category: 'Compliance',
    description: 'Grants rights to export tamper-proof SOC-2 compliance reports and sealed ledger CSV/JSON archives.',
    riskLevel: 'Standard',
    restrictedForTemplates: []
  }
];

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
  const [roleTemplate, setRoleTemplate] = useState<'Custom' | 'Auditor' | 'Engineer' | 'Manager' | 'Administrator'>('Custom');
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([mockPermissions[4], mockPermissions[6]]);
  const [roleQuorum, setRoleQuorum] = useState('Single Signature');
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [blockedNotice, setBlockedNotice] = useState<string | null>(null);

  // Assign Access State
  const [userName, setUserName] = useState('');
  const [selectedRole, setSelectedRole] = useState(roles.length > 0 ? roles[0].name : 'Engineer');
  const [resource, setResource] = useState('');
  const [department, setDepartment] = useState('Defense R&D');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Synchronize permissions and rules when Template changes
  useEffect(() => {
    if (roleTemplate === 'Auditor') {
      setRoleName('Auditor');
      setRoleDescription('Read-only compliance verification, Merkle audit log inspection, and sealed reporting.');
      // Auto-select allowed auditor permissions and strip blocked ones
      setSelectedPerms(['View Audit Trail', 'Export Reports']);
    } else if (roleTemplate === 'Engineer') {
      setRoleName('Defense Engineer');
      setRoleDescription('Smart contract deployment, hardware token management, and asset verification.');
      setSelectedPerms(['Manage Assets (NFTs)', 'Smart Contracts', 'View Audit Trail']);
    } else if (roleTemplate === 'Manager') {
      setRoleName('Operations Manager');
      setRoleDescription('Identity administration, hardware token approvals, and compliance verification.');
      setSelectedPerms(['Manage Identities', 'Assign Roles', 'Manage Assets (NFTs)', 'View Audit Trail', 'Export Reports']);
    } else if (roleTemplate === 'Administrator') {
      setRoleName('Administrator');
      setRoleDescription('Full root access to defense trust ledger & node configuration.');
      setSelectedPerms([...mockPermissions]);
    }
  }, [roleTemplate]);

  const isPermissionBlocked = (permName: string): boolean => {
    const def = PERMISSION_DEFINITIONS.find(p => p.name === permName);
    if (!def) return false;
    return def.restrictedForTemplates.includes(roleTemplate);
  };

  const togglePermission = (permName: string) => {
    if (isPermissionBlocked(permName)) {
      setBlockedNotice(`Zero-Trust Rule: "${permName}" cannot be granted to ${roleTemplate} roles to prevent privilege escalation.`);
      setTimeout(() => setBlockedNotice(null), 4000);
      return;
    }

    setSelectedPerms(prev =>
      prev.includes(permName) ? prev.filter(p => p !== permName) : [...prev, permName]
    );
  };

  const removePermission = (permName: string) => {
    setSelectedPerms(prev => prev.filter(p => p !== permName));
  };

  const handleSelectAllAllowed = () => {
    const allowed = mockPermissions.filter(p => !isPermissionBlocked(p));
    setSelectedPerms(allowed);
  };

  const handleClearAll = () => {
    setSelectedPerms([]);
  };

  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    // Filter out any accidentally selected blocked permissions
    const validPerms = selectedPerms.filter(p => !isPermissionBlocked(p));

    setIsCreatingRole(true);

    const nameToSave = roleName.trim();
    const descToSave = roleDescription.trim() || 'Custom security policy cluster';

    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: nameToSave,
      description: descToSave,
      usersCount: 0,
      permissionsCount: validPerms.length > 0 ? validPerms.length : 1,
      status: 'Active',
    };

    const permArray = mockPermissions.map(p => validPerms.includes(p));

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
      {/* Create Role Modal with Role Template Restrictions */}
      {createRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Create Role & Configure Policies</h2>
                  <p className="text-xs text-slate-500">Zero-Trust least-privilege role builder with guardrail protection</p>
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

            <div className="p-6 overflow-y-auto space-y-4">
              {createSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Role Created & Enforced!</h3>
                  <p className="text-xs text-slate-500">Role "{roleName}" is active with {selectedPerms.length} assigned policies.</p>
                </div>
              ) : (
                <form onSubmit={handleCreateRoleSubmit} className="space-y-4">
                  {/* Role Template Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Role Category / Template</span>
                      <span className="text-[11px] text-blue-600 font-semibold">Pre-enforces Zero-Trust rules</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {(['Custom', 'Auditor', 'Engineer', 'Manager', 'Administrator'] as const).map(tmpl => (
                        <button
                          key={tmpl}
                          type="button"
                          onClick={() => setRoleTemplate(tmpl)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${
                            roleTemplate === tmpl
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {tmpl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Blocked Rule Notice Banner */}
                  {blockedNotice && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Permission Selection Blocked</p>
                        <p className="text-[11px] mt-0.5">{blockedNotice}</p>
                      </div>
                    </div>
                  )}

                  {roleTemplate === 'Auditor' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Auditor Zero-Trust Policy Active</p>
                        <p className="text-[11px] mt-0.5">
                          Auditors are strictly read-only. Modifying <strong>System Settings</strong>, <strong>Assigning Roles</strong>, or <strong>Managing Identities</strong> is blocked by defense security protocol.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Role Name</label>
                      <input
                        required
                        type="text"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder="e.g. Defense Auditor, Compliance Lead"
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
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Role Scope & Description</label>
                    <textarea
                      required
                      rows={2}
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      placeholder="Specify the operational responsibilities of this role"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Active Selected Permission Tags */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-800">Assigned Permissions & Policies</label>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                          {selectedPerms.length} Active
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={handleSelectAllAllowed}
                          className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Select All Allowed
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    {/* Selected Badges with Remove (X) button */}
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 min-h-10">
                      {selectedPerms.length > 0 ? (
                        selectedPerms.map(p => (
                          <span
                            key={p}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-blue-200 text-blue-800 rounded-lg text-xs font-semibold shadow-2xs animate-in zoom-in-95 duration-100"
                          >
                            <Check className="w-3 h-3 text-blue-600" />
                            {p}
                            <button
                              type="button"
                              onClick={() => removePermission(p)}
                              className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                              title={`Remove ${p}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 p-1">No permissions selected yet. Choose from below.</span>
                      )}
                    </div>
                  </div>

                  {/* Detailed Interactive Permission Policy Cards */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Policy Directory & Meaning (Click to Toggle / Blocked Rules Enforced)
                    </label>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {PERMISSION_DEFINITIONS.map(def => {
                        const isSelected = selectedPerms.includes(def.name);
                        const isBlocked = isPermissionBlocked(def.name);

                        return (
                          <div
                            key={def.name}
                            onClick={() => togglePermission(def.name)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isBlocked
                                ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                                : isSelected
                                ? 'bg-blue-50/70 border-blue-300'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isBlocked}
                                onChange={() => {}}
                                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 pointer-events-none"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">{def.name}</span>
                                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {def.category}
                                  </span>
                                  {isBlocked && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                      <Lock className="w-2.5 h-2.5" />
                                      Blocked for {roleTemplate}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                  {def.description}
                                </p>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              def.riskLevel === 'Critical'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : def.riskLevel === 'High'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {def.riskLevel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Buttons */}
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
                          Enforcing Policies...
                        </>
                      ) : (
                        'Save & Create Role'
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
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
