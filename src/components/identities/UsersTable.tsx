import { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  Copy,
  CheckCircle2,
  X,
  Key,
  AlertCircle,
  PlusCircle,
  Ban,
  RotateCw,
} from 'lucide-react';
import {
  type User,
  provisionUserDID,
  deactivateUserDID,
  reactivateUserDID,
} from '../../services/users';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 border border-purple-200',
  manager: 'bg-blue-100 text-blue-700 border border-blue-200',
  analyst: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  viewer: 'bg-slate-100 text-slate-600 border border-slate-200',
  user: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  engineer: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
};

const getRoleName = (role: User['role']) =>
  typeof role === 'string' ? role : role?.name ?? 'USER';

const getInitials = (u: User) =>
  `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || u.email.slice(0, 2).toUpperCase();

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

interface UsersTableProps {
  users: User[];
  search: string;
  onRefresh?: () => void;
}

export default function UsersTable({ users, search, onRefresh }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const role = getRoleName(u.role).toLowerCase();
    const did = (u.did || '').toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      role.includes(q) ||
      did.includes(q)
    );
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const openManageModal = (user: User) => {
    setSelectedUser(user);
    setActionMessage(null);
    setIsModalOpen(true);
  };

  const handleProvision = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await provisionUserDID(selectedUser.id);
      setSelectedUser(res.user);
      setActionMessage({ text: 'Unique DID provisioned and linked to user account!', type: 'success' });
      onRefresh?.();
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Failed to provision DID', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await deactivateUserDID(selectedUser.id);
      setSelectedUser(res.user);
      setActionMessage({ text: 'DID deactivated successfully. User login with this DID is now blocked.', type: 'success' });
      onRefresh?.();
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Failed to deactivate DID', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await reactivateUserDID(selectedUser.id);
      setSelectedUser(res.user);
      setActionMessage({ text: 'DID reactivated successfully.', type: 'success' });
      onRefresh?.();
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Failed to reactivate DID', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Fingerprint className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-500">No users match your search</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">User</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Email</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Role (RBAC)</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Decentralized ID (DID)</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">DID Status</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Joined</th>
            <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {filtered.map((user) => {
            const roleName = getRoleName(user.role);
            const roleKey = roleName.toLowerCase();
            const roleClass = ROLE_COLORS[roleKey] ?? ROLE_COLORS.user;
            const hasDID = !!user.did;
            const isDIDActive = user.did_status === 'ACTIVE' || (!user.did_status && hasDID);

            return (
              <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                {/* User Name & ID */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      {getInitials(user)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">ID: {user.id.slice(0, 8)}…</p>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-4 py-3 text-slate-600 font-medium text-xs">{user.email}</td>

                {/* Role */}
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleClass}`}>
                    {roleName}
                  </span>
                </td>

                {/* DID */}
                <td className="px-4 py-3">
                  {hasDID ? (
                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60 w-fit">
                      <Fingerprint className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{user.did!.length > 22 ? `${user.did!.slice(0, 14)}…${user.did!.slice(-4)}` : user.did}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(user.did!, user.id)}
                        title="Copy DID"
                        className="text-slate-400 hover:text-blue-600 ml-1"
                      >
                        {copiedText === user.id ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                      No DID Linked
                    </span>
                  )}
                </td>

                {/* DID Status */}
                <td className="px-4 py-3">
                  {hasDID ? (
                    isDIDActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        DEACTIVATED
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>

                {/* Joined */}
                <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(user.createdAt)}</td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openManageModal(user)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 border border-blue-100 hover:border-blue-300 transition-colors"
                  >
                    {hasDID ? 'Manage DID' : 'Provision DID'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ================= ADMIN DID MANAGEMENT MODAL ================= */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Admin DID Management</h3>
                  <p className="text-xs text-slate-500">
                    Provision, view, or manage user decentralized identity (DID)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {actionMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                    actionMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {actionMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  )}
                  <span>{actionMessage.text}</span>
                </div>
              )}

              {/* User Details Box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">User Account</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[getRoleName(selectedUser.role).toLowerCase()] || ROLE_COLORS.user}`}>
                    Role: {getRoleName(selectedUser.role)}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </div>
                <div className="text-xs text-slate-500 font-mono">{selectedUser.email}</div>
              </div>

              {/* DID Status Box */}
              {selectedUser.did ? (
                <div className="space-y-3">
                  {/* DID Identifier */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Fingerprint className="w-3.5 h-3.5 text-blue-600" /> Linked DID
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        selectedUser.did_status === 'ACTIVE' || !selectedUser.did_status
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {selectedUser.did_status || 'ACTIVE'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-mono text-slate-800 break-all">{selectedUser.did}</code>
                      <button
                        type="button"
                        onClick={() => handleCopy(selectedUser.did!, 'modal-did')}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors shrink-0"
                      >
                        {copiedText === 'modal-did' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Public Key & Creation Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-400 font-semibold mb-0.5">Created By</div>
                      <div className="font-medium text-slate-800">{selectedUser.did_created_by || 'Admin'}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-slate-400 font-semibold mb-0.5">Created At</div>
                      <div className="font-medium text-slate-800">{formatDate(selectedUser.did_created_at || selectedUser.createdAt)}</div>
                    </div>
                  </div>

                  {/* Private Key Security Notice */}
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                    <Key className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Private Key Security:</strong> The user's private key is kept strictly in their client wallet and is <strong>never</strong> displayed, stored, or exposed on the platform.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> No DID Linked Yet
                  </div>
                  <p>
                    This user account does not have a decentralized identity linked yet. Click the button below to provision a unique DID permanently bound to this user.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer / Actions */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {!selectedUser.did ? (
                  <button
                    type="button"
                    onClick={handleProvision}
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {actionLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                    Create & Link DID
                  </button>
                ) : selectedUser.did_status === 'ACTIVE' || !selectedUser.did_status ? (
                  <button
                    type="button"
                    onClick={handleDeactivate}
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {actionLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                    Deactivate / Revoke DID
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReactivate}
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {actionLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    Reactivate DID
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

