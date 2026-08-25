import { useState } from 'react';
import { X, UserPlus, Fingerprint, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { provisionUserDID, type User } from '../../services/users';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: (user: User) => void;
}

export default function AddUserModal({ isOpen, onClose, onUserAdded }: AddUserModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [provisionDID, setProvisionDID] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !email.trim()) {
      setError('First name and email are required');
      return;
    }

    setLoading(true);

    try {
      const newUserId = `usr_${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        isActive: true,
        role: { name: role },
        createdAt: new Date().toISOString(),
      };

      // If user selected to provision DID immediately
      if (provisionDID) {
        // Save user first into storage
        const currentStored: User[] = JSON.parse(localStorage.getItem('bel_users_store') || '[]');
        currentStored.push(newUser);
        localStorage.setItem('bel_users_store', JSON.stringify(currentStored));

        // Provision DID linked to this user
        const provisionResult = await provisionUserDID(newUserId);
        onUserAdded(provisionResult.user);
      } else {
        const currentStored: User[] = JSON.parse(localStorage.getItem('bel_users_store') || '[]');
        currentStored.push(newUser);
        localStorage.setItem('bel_users_store', JSON.stringify(currentStored));
        onUserAdded(newUser);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Add New User</h3>
              <p className="text-xs text-slate-500">Create user account & assign RBAC role</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Arun"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Kumar"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. arun@bel.com"
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Assigned Role (RBAC)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              <option value="USER">USER (Employee)</option>
              <option value="Engineer">Engineer</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
              <option value="Analyst">Analyst</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          {/* Provision DID Checkbox */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={provisionDID}
                onChange={(e) => setProvisionDID(e.target.checked)}
                className="mt-0.5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-blue-900 flex items-center gap-1">
                  <Fingerprint className="w-3.5 h-3.5 text-blue-600" />
                  Provision Unique DID Immediately
                </span>
                <p className="text-blue-700 mt-0.5 text-[11px] leading-relaxed">
                  Automatically generates and anchors a unique DID on the DID Registry, permanently linked to this user account.
                </p>
              </div>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating User & DID…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Create User Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
