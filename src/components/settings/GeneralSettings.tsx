import { useState } from 'react';
import { Building2, Globe, Shield, Save, RotateCcw } from 'lucide-react';
import type { GeneralSettingsData } from '../../services/settings';

interface GeneralSettingsProps {
  initialData: GeneralSettingsData;
  onSave: (data: GeneralSettingsData) => void;
}

export default function GeneralSettings({ initialData, onSave }: GeneralSettingsProps) {
  const [formData, setFormData] = useState<GeneralSettingsData>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
    }, 400);
  };

  const handleReset = () => {
    setFormData(initialData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Organization Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Organization & Entity Profile</h3>
            <p className="text-xs text-slate-500">
              Identity details for Bharat Electronics Limited sovereign trust node
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Organization Name
            </label>
            <input
              type="text"
              value={formData.orgName}
              onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Defense Entity Identifier
            </label>
            <input
              type="text"
              disabled
              value={formData.entityId}
              className="w-full px-3.5 py-2 text-sm bg-slate-100/80 border border-slate-200 rounded-lg font-mono text-slate-600 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 mt-1">Cryptographically bound to genesis block</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Defense Classification Level
            </label>
            <input
              type="text"
              value={formData.defenseClassification}
              onChange={(e) => setFormData({ ...formData, defenseClassification: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Primary Administrator Email
            </label>
            <input
              type="email"
              value={formData.adminEmail}
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Regional & Locale Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Regional & Compliance Jurisdiction</h3>
            <p className="text-xs text-slate-500">
              Sovereign data residency, time standards, and platform routing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Data Residency Zone
            </label>
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-xs font-semibold text-emerald-800">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              {formData.dataResidency}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Platform Domain
            </label>
            <input
              type="text"
              value={formData.platformDomain}
              onChange={(e) => setFormData({ ...formData, platformDomain: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              System Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Asia/Kolkata (IST +05:30)">Asia/Kolkata (IST +05:30)</option>
              <option value="UTC (Coordinated Universal Time)">UTC (Coordinated Universal Time)</option>
              <option value="Asia/Dubai (GST +04:00)">Asia/Dubai (GST +04:00)</option>
              <option value="Europe/London (GMT/BST)">Europe/London (GMT/BST)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Interface Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((th) => (
                <button
                  type="button"
                  key={th}
                  onClick={() => setFormData({ ...formData, theme: th })}
                  className={`py-2 text-xs font-semibold capitalize rounded-lg border transition-all ${
                    formData.theme === th
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {th}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
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
          {isSaving ? 'Saving Changes...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  );
}
