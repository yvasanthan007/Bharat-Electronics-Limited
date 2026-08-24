import { useState } from 'react';
import { ShieldCheck, Lock, Plus, Trash2, Save, RotateCcw, Cpu } from 'lucide-react';
import type { SecurityPolicySettings } from '../../services/settings';
import Toggle from '../common/Toggle';

interface SecuritySettingsProps {
  initialData: SecurityPolicySettings;
  onSave: (data: SecurityPolicySettings) => void;
}

export default function SecuritySettings({ initialData, onSave }: SecuritySettingsProps) {
  const [formData, setFormData] = useState<SecurityPolicySettings>(initialData);
  const [newIp, setNewIp] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddIp = () => {
    if (newIp.trim() && !formData.ipAllowlist.includes(newIp.trim())) {
      setFormData({
        ...formData,
        ipAllowlist: [...formData.ipAllowlist, newIp.trim()]
      });
      setNewIp('');
    }
  };

  const handleRemoveIp = (ipToRemove: string) => {
    setFormData({
      ...formData,
      ipAllowlist: formData.ipAllowlist.filter((ip) => ip !== ipToRemove)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Zero Trust & Authentication Enforcement */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Zero-Trust & Identity Governance</h3>
            <p className="text-xs text-slate-500">
              Enforce multi-factor verification, hardware tokens, and role-based boundaries
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <Toggle
            checked={formData.enforceMfa}
            onChange={(checked) => setFormData({ ...formData, enforceMfa: checked })}
            label="Mandatory Multi-Factor Authentication (MFA)"
            description="Require TOTP or FIDO2 hardware keys for all operators and administrative accounts."
          />

          <Toggle
            checked={formData.hardwareKeyRequiredForAdmin}
            onChange={(checked) => setFormData({ ...formData, hardwareKeyRequiredForAdmin: checked })}
            label="Hardware Security Module / FIDO2 Key for Admin Role"
            description="Strict hardware-backed cryptographic signing for contract deployment and root permissions."
          />

          <Toggle
            checked={formData.roleHierarchyStrict}
            onChange={(checked) => setFormData({ ...formData, roleHierarchyStrict: checked })}
            label="Strict Role Hierarchy & Non-Transitive Privileges"
            description="Prevent automatic inheritance of higher permissions across departmental access groups."
          />

          <Toggle
            checked={formData.contractExecutionApprovalRequired}
            onChange={(checked) => setFormData({ ...formData, contractExecutionApprovalRequired: checked })}
            label="Dual-Authorization for High-Value Asset Actions"
            description="Require secondary auditor signature for asset transfers or revocations above defense thresholds."
          />
        </div>
      </div>

      {/* Session & Signature Cryptography */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Cryptographic Standard & Session Timeouts</h3>
            <p className="text-xs text-slate-500">
              Configure signature algorithms and automated lockout limits
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Signing Algorithm Standard
            </label>
            <select
              value={formData.signatureAlgorithm}
              onChange={(e) => setFormData({ ...formData, signatureAlgorithm: e.target.value as any })}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ECDSA secp256k1">ECDSA secp256k1 (Ethereum/BEL Native)</option>
              <option value="Ed25519">Ed25519 (High Performance Edwards)</option>
              <option value="RSA-4096">RSA-4096 (Defense Legacy Standard)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Inactivity Session Timeout
            </label>
            <select
              value={formData.sessionTimeoutMinutes}
              onChange={(e) => setFormData({ ...formData, sessionTimeoutMinutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes (Recommended)</option>
              <option value={60}>1 Hour</option>
              <option value={120}>2 Hours</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Failed Attempts Before Lockout
            </label>
            <select
              value={formData.maxFailedAttempts}
              onChange={(e) => setFormData({ ...formData, maxFailedAttempts: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value={3}>3 Attempts</option>
              <option value={5}>5 Attempts</option>
              <option value={10}>10 Attempts</option>
            </select>
          </div>
        </div>
      </div>

      {/* IP Whitelisting & Network Perimeter */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Network Perimeter & IP Allowlist</h3>
            <p className="text-xs text-slate-500">
              Restrict administrative dashboard access to designated defense intranet subnets
            </p>
          </div>
        </div>

        <Toggle
          checked={formData.ipAllowlistEnabled}
          onChange={(checked) => setFormData({ ...formData, ipAllowlistEnabled: checked })}
          label="Enforce Subnet IP Restrictions"
          description="Reject incoming traffic from unverified external addresses."
        />

        {formData.ipAllowlistEnabled && (
          <div className="space-y-3 pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 10.240.0.0/16 or 14.139.128.45"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddIp}
                className="flex items-center gap-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Subnet
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.ipAllowlist.map((ip) => (
                <div
                  key={ip}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-800"
                >
                  <span>{ip}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIp(ip)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => setFormData(initialData)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-xs transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Save Security Policies'}
        </button>
      </div>
    </form>
  );
}
