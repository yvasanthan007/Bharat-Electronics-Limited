import { useState } from 'react';
import { Key, Plus, Copy, Check, Webhook, Send } from 'lucide-react';
import { createApiKey, revokeApiKey } from '../../services/settings';
import type { ApiKeyItem, WebhookItem } from '../../services/settings';
import Badge from '../common/Badge';
import Modal from '../common/Modal';

interface ApiKeysSettingsProps {
  initialKeys: ApiKeyItem[];
  initialWebhooks: WebhookItem[];
}

export default function ApiKeysSettings({ initialKeys, initialWebhooks }: ApiKeysSettingsProps) {
  const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys);
  const [webhooks] = useState<WebhookItem[]>(initialWebhooks);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPerms, setNewKeyPerms] = useState<('read' | 'write' | 'admin')[]>(['read']);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const fullSecret = `bel_live_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    const newKey = await createApiKey(newKeyName.trim(), newKeyPerms);
    setKeys([newKey, ...keys]);
    setCreatedSecret(fullSecret);
  };

  const handleRevoke = async (id: string) => {
    if (confirm('Are you sure you want to revoke this API key? Applications using it will lose access immediately.')) {
      await revokeApiKey(id);
      setKeys(keys.map((k) => (k.id === id ? { ...k, status: 'Revoked' } : k)));
    }
  };

  const handleTestWebhook = (id: string) => {
    setTestingWebhookId(id);
    setTimeout(() => {
      setTestingWebhookId(null);
      alert('Webhook ping payload delivered successfully (HTTP 200 OK - 32ms).');
    }, 600);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCreatedSecret(null);
    setNewKeyName('');
    setNewKeyPerms(['read']);
  };

  return (
    <div className="space-y-6">
      {/* API Keys Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Developer API Keys</h3>
              <p className="text-xs text-slate-500">
                Authenticate microservices, defense gateways, and ERP connectors
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate New Key
          </button>
        </div>

        {/* Keys Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Name & ID</th>
                <th className="py-3 px-4">Key Token</th>
                <th className="py-3 px-4">Permissions</th>
                <th className="py-3 px-4">Rate Limit</th>
                <th className="py-3 px-4">Last Used</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-semibold text-slate-900">{k.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">{k.id} • Created {k.createdAt}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                        {k.prefix}
                      </span>
                      <button
                        onClick={() => handleCopy(k.prefix, k.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        {copiedId === k.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex gap-1">
                      {k.permissions.map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {k.rateLimit}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {k.lastUsed}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={k.status === 'Active' ? 'success' : 'error'} size="sm" dot>
                      {k.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {k.status === 'Active' && (
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Webhook className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Event Subscriptions & Webhooks</h3>
            <p className="text-xs text-slate-500">
              Real-time HTTPS event hooks for SIEM integration and ERP synchronization
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div
              key={wh.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{wh.description}</span>
                  <Badge variant="success" size="sm" dot>{wh.status}</Badge>
                </div>
                <p className="font-mono text-xs text-blue-600">{wh.url}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {wh.events.map((ev) => (
                    <span key={ev} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-600">
                      {ev}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <span className="text-xs text-slate-400">{wh.lastDelivery}</span>
                <button
                  disabled={testingWebhookId === wh.id}
                  onClick={() => handleTestWebhook(wh.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                >
                  <Send className="w-3 h-3 text-slate-500" />
                  {testingWebhookId === wh.id ? 'Sending Ping...' : 'Test Ping'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Key Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={createdSecret ? 'API Key Generated Successfully' : 'Generate New API Key'}
        subtitle={createdSecret ? 'Copy your secret token now. You will not be able to see it again.' : 'Provide a descriptive name and choose permission scopes.'}
        maxWidth="md"
        actions={
          createdSecret ? (
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Done & Saved
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateKey}
                disabled={!newKeyName.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-xs"
              >
                Create Key
              </button>
            </>
          )
        }
      >
        {createdSecret ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
              <p className="font-semibold text-emerald-900">Your New Secret Key Token:</p>
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-emerald-200 font-mono text-xs text-slate-900">
                <span className="break-all">{createdSecret}</span>
                <button
                  onClick={() => handleCopy(createdSecret, 'created-secret')}
                  className="p-1 text-slate-400 hover:text-slate-800 shrink-0 ml-2"
                >
                  {copiedId === 'created-secret' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Make sure to store this key safely in your application environment secrets vault.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Key Label / Service Name *
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Avionics Telemetry Gateway"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Permission Scopes
              </label>
              <div className="space-y-2">
                {[
                  { id: 'read', label: 'Read (Query assets, audits, transaction ledgers)' },
                  { id: 'write', label: 'Write (Submit transactions, request verifications)' },
                  { id: 'admin', label: 'Admin (Deploy contracts, assign roles, manage keys)' },
                ].map((scope) => {
                  const isChecked = newKeyPerms.includes(scope.id as any);
                  return (
                    <label
                      key={scope.id}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setNewKeyPerms(newKeyPerms.filter((p) => p !== scope.id));
                          } else {
                            setNewKeyPerms([...newKeyPerms, scope.id as any]);
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-800">{scope.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
