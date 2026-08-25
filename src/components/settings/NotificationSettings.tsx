import { useState } from 'react';
import { Bell, Mail, Webhook, Smartphone, ShieldAlert, Save, RotateCcw } from 'lucide-react';
import type { NotificationSettingsData } from '../../services/settings';
import Toggle from '../common/Toggle';

interface NotificationSettingsProps {
  initialData: NotificationSettingsData;
  onSave: (data: NotificationSettingsData) => void;
}

export default function NotificationSettings({ initialData, onSave }: NotificationSettingsProps) {
  const [formData, setFormData] = useState<NotificationSettingsData>(initialData);
  const [isSaving, setIsSaving] = useState(false);

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
      {/* Primary Notification Channels */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Notification Delivery Channels</h3>
            <p className="text-xs text-slate-500">
              Select where security alerts and event dispatches are routed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Email Dispatches</p>
                <p className="text-xs text-slate-500">Official BEL inbox</p>
              </div>
            </div>
            <Toggle
              checked={formData.emailAlerts}
              onChange={(checked) => setFormData({ ...formData, emailAlerts: checked })}
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Webhook className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">SIEM & Webhooks</p>
                <p className="text-xs text-slate-500">HTTPS automated payload</p>
              </div>
            </div>
            <Toggle
              checked={formData.webhookAlerts}
              onChange={(checked) => setFormData({ ...formData, webhookAlerts: checked })}
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">In-App Banner Feed</p>
                <p className="text-xs text-slate-500">Header toast and popups</p>
              </div>
            </div>
            <Toggle
              checked={formData.inAppAlerts}
              onChange={(checked) => setFormData({ ...formData, inAppAlerts: checked })}
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Critical SMS Gateway</p>
                <p className="text-xs text-slate-500">Urgent P0 incidents only</p>
              </div>
            </div>
            <Toggle
              checked={formData.smsAlerts}
              onChange={(checked) => setFormData({ ...formData, smsAlerts: checked })}
            />
          </div>
        </div>
      </div>

      {/* Incident Trigger Subscriptions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Security Incident & Compliance Triggers</h3>
            <p className="text-xs text-slate-500">
              Configure automated notifications on sensitive on-chain and off-chain activities
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <Toggle
            checked={formData.alertOnFailedAuth}
            onChange={(checked) => setFormData({ ...formData, alertOnFailedAuth: checked })}
            label="Repeated Failed Authentication Anomaly"
            description="Send instant alert when 3+ unauthorized login or API signature attempts occur."
          />

          <Toggle
            checked={formData.alertOnHighValueTransfer}
            onChange={(checked) => setFormData({ ...formData, alertOnHighValueTransfer: checked })}
            label="High-Value Defense Asset Transfer / NFT Custody Shift"
            description="Notify CISO and asset managers when restricted equipment tokens change ownership."
          />

          <Toggle
            checked={formData.alertOnContractFailure}
            onChange={(checked) => setFormData({ ...formData, alertOnContractFailure: checked })}
            label="Smart Contract Revert & Gas Depletion Warning"
            description="Trigger developer alerts if an on-chain transaction fails or reverts due to gas exhaustion."
          />

          <Toggle
            checked={formData.alertOnRoleEscalation}
            onChange={(checked) => setFormData({ ...formData, alertOnRoleEscalation: checked })}
            label="Privilege Escalation & New Admin Assignment"
            description="Log and broadcast whenever root or auditor privileges are assigned to an identity."
          />

          <Toggle
            checked={formData.weeklyComplianceDigest}
            onChange={(checked) => setFormData({ ...formData, weeklyComplianceDigest: checked })}
            label="Automated Weekly Audit & SOC-2 Compliance Digest"
            description="Receive consolidated weekly summaries with Merkle proof health status."
          />
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Emergency SOC Broadcast Email
          </label>
          <input
            type="email"
            value={formData.emergencyBroadcastChannel}
            onChange={(e) => setFormData({ ...formData, emergencyBroadcastChannel: e.target.value })}
            className="w-full max-w-md px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono text-xs"
          />
        </div>
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
          {isSaving ? 'Saving...' : 'Save Notification Preferences'}
        </button>
      </div>
    </form>
  );
}
