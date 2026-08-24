import { useState, useEffect } from 'react';
import {
  Building2,
  Database,
  ShieldCheck,
  Bell,
  Key,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import {
  getSettings,
  saveGeneralSettings,
  saveBlockchainSettings,
  saveSecuritySettings,
  saveNotificationSettings,
  saveBackupSettings
} from '../services/settings';
import type { AllSettings } from '../services/settings';
import GeneralSettings from '../components/settings/GeneralSettings';
import BlockchainSettings from '../components/settings/BlockchainSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import ApiKeysSettings from '../components/settings/ApiKeysSettings';
import LedgerBackupSettings from '../components/settings/LedgerBackupSettings';
import { CardSkeleton } from '../components/common/Skeleton';
import Toast from '../components/common/Toast';
import type { ToastMessage } from '../components/common/Toast';
import Badge from '../components/common/Badge';

type SettingsTab = 'general' | 'blockchain' | 'security' | 'notifications' | 'apikeys' | 'backup';

export default function Settings() {
  const [settings, setSettings] = useState<AllSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'error' | 'warning', title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      addToast('error', 'Failed to load settings', 'Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async (data: any) => {
    await saveGeneralSettings(data);
    setSettings((prev) => (prev ? { ...prev, general: data } : prev));
    addToast('success', 'Profile Updated', 'Organization profile & locale settings saved successfully.');
  };

  const handleSaveBlockchain = async (data: any) => {
    await saveBlockchainSettings(data);
    setSettings((prev) => (prev ? { ...prev, blockchain: data } : prev));
    addToast('success', 'Blockchain Config Saved', 'RPC endpoints & gas limits updated.');
  };

  const handleSaveSecurity = async (data: any) => {
    await saveSecuritySettings(data);
    setSettings((prev) => (prev ? { ...prev, security: data } : prev));
    addToast('success', 'Security Policy Enforced', 'MFA, IP allowlists and session timeouts applied.');
  };

  const handleSaveNotifications = async (data: any) => {
    await saveNotificationSettings(data);
    setSettings((prev) => (prev ? { ...prev, notifications: data } : prev));
    addToast('success', 'Notifications Saved', 'Alert routing and event triggers configured.');
  };

  const handleSaveBackup = async (data: any) => {
    await saveBackupSettings(data);
    setSettings((prev) => (prev ? { ...prev, backup: data } : prev));
    addToast('success', 'Backup Policy Saved', 'IPFS cold storage archival cadence updated.');
  };

  const tabs: { id: SettingsTab; label: string; icon: any; badge?: string }[] = [
    { id: 'general', label: 'Organization & Profile', icon: Building2 },
    { id: 'blockchain', label: 'Blockchain & Node', icon: Database, badge: 'Healthy' },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck, badge: 'Zero-Trust' },
    { id: 'notifications', label: 'Alerts & Channels', icon: Bell },
    { id: 'apikeys', label: 'API Keys & Webhooks', icon: Key },
    { id: 'backup', label: 'Ledger Archival & IPFS', icon: HardDrive },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Configuration</h1>
            <Badge variant="indigo" size="sm">BEL Sovereign Node</Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            Configure platform parameters, blockchain RPC nodes, Zero-Trust security policies, and developer API integrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSettings}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Reload Settings
          </button>
        </div>
      </div>

      {/* Main Settings Grid: Left Tabs Sidebar, Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Tabs Navigation (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-xs p-3 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && !isActive && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-100 text-slate-600">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Settings Form Content (9 cols) */}
        <div className="lg:col-span-9">
          {loading || !settings ? (
            <div className="space-y-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === 'general' && (
                <GeneralSettings
                  initialData={settings.general}
                  onSave={handleSaveGeneral}
                />
              )}

              {activeTab === 'blockchain' && (
                <BlockchainSettings
                  initialData={settings.blockchain}
                  onSave={handleSaveBlockchain}
                />
              )}

              {activeTab === 'security' && (
                <SecuritySettings
                  initialData={settings.security}
                  onSave={handleSaveSecurity}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationSettings
                  initialData={settings.notifications}
                  onSave={handleSaveNotifications}
                />
              )}

              {activeTab === 'apikeys' && (
                <ApiKeysSettings
                  initialKeys={settings.apiKeys}
                  initialWebhooks={settings.webhooks}
                />
              )}

              {activeTab === 'backup' && (
                <LedgerBackupSettings
                  initialData={settings.backup}
                  onSave={handleSaveBackup}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
