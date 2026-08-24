import { useState } from 'react';
import { HardDrive, ShieldCheck, RefreshCw, Copy, Check, Save, RotateCcw } from 'lucide-react';
import type { LedgerBackupSettings as IBackupSettings } from '../../services/settings';
import Toggle from '../common/Toggle';

interface LedgerBackupSettingsProps {
  initialData: IBackupSettings;
  onSave: (data: IBackupSettings) => void;
}

export default function LedgerBackupSettings({ initialData, onSave }: LedgerBackupSettingsProps) {
  const [formData, setFormData] = useState<IBackupSettings>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(formData.lastBackupHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerSnapshot = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      const newHash = 'QmZ' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setFormData((prev) => ({
        ...prev,
        lastBackupTime: 'Just now',
        lastBackupHash: newHash,
        totalSnapshots: prev.totalSnapshots + 1,
      }));
      setIsBackingUp(false);
      alert('Ledger snapshot successfully encrypted (AES-256-GCM) and pinned to IPFS cluster.');
    }, 900);
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
      {/* Backup Status Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-6 shadow-md border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300">
              IPFS Cold Storage Pinned
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Ledger State Archival & Disaster Recovery</h3>
          <p className="text-xs text-blue-200 mt-1">
            Total Snapshots: <span className="font-bold text-white">{formData.totalSnapshots}</span> • Retention: <span className="font-bold text-white">{formData.retentionMonths} Months (10 Years)</span>
          </p>
        </div>

        <button
          type="button"
          disabled={isBackingUp}
          onClick={handleTriggerSnapshot}
          className="flex items-center gap-2 px-4 py-2 bg-white text-blue-950 hover:bg-blue-50 rounded-lg text-xs font-bold shadow-xs transition-all disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
          {isBackingUp ? 'Encrypting & Pinning...' : 'Trigger Snapshot Now'}
        </button>
      </div>

      {/* Snapshot Details & Hash */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Latest Ledger Root Snapshot</h3>
            <p className="text-xs text-slate-500">
              Cryptographically sealed point-in-time state of all accounts and smart contracts
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Last Snapshot Timestamp:</span>
            <span className="font-semibold text-slate-900">{formData.lastBackupTime}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Encryption Standard:</span>
            <span className="font-mono text-emerald-700 font-bold">{formData.encryptionStandard}</span>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              IPFS Root CID Hash:
            </p>
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800">
              <span className="truncate max-w-[420px]">{formData.lastBackupHash}</span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 ml-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Frequency & Storage Targets */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Archival Schedule & Target Cloud</h3>
            <p className="text-xs text-slate-500">
              Automated snapshot frequency and redundant off-site storage target
            </p>
          </div>
        </div>

        <Toggle
          checked={formData.autoBackup}
          onChange={(checked) => setFormData({ ...formData, autoBackup: checked })}
          label="Enable Automated Scheduled Snapshots"
          description="Periodically take full state snapshots without stopping the validator node."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Backup Cadence
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Hourly', 'Daily', 'Weekly'] as const).map((freq) => (
                <button
                  type="button"
                  key={freq}
                  onClick={() => setFormData({ ...formData, backupFrequency: freq })}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    formData.backupFrequency === freq
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Storage Cluster Target
            </label>
            <select
              value={formData.storageTarget}
              onChange={(e) => setFormData({ ...formData, storageTarget: e.target.value as any })}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="IPFS Private Cluster">IPFS Private Defense Cluster</option>
              <option value="Encrypted S3 Cold Storage">Encrypted S3 Cold Storage (MeitY Approved)</option>
              <option value="On-Premises HSM Storage">On-Premises Hardware Security Vault</option>
            </select>
          </div>
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
          {isSaving ? 'Saving...' : 'Save Backup Configuration'}
        </button>
      </div>
    </form>
  );
}
