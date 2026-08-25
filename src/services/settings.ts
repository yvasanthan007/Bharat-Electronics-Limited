export interface GeneralSettingsData {
  orgName: string;
  entityId: string;
  defenseClassification: string;
  adminEmail: string;
  platformDomain: string;
  timezone: string;
  locale: string;
  theme: 'light' | 'dark' | 'system';
  dataResidency: string;
}

export interface BlockchainSettingsData {
  networkName: string;
  rpcEndpoint: string;
  chainId: number;
  gasPriceStrategy: 'Standard' | 'Fast' | 'Custom';
  customGasLimit: string;
  blockExplorerUrl: string;
  consensusMechanism: string;
  activeValidators: number;
  latestBlock: string;
  blockTime: string;
  nodeStatus: 'Healthy' | 'Degraded' | 'Syncing';
}

export interface SecurityPolicySettings {
  enforceMfa: boolean;
  sessionTimeoutMinutes: number;
  maxFailedAttempts: number;
  ipAllowlistEnabled: boolean;
  ipAllowlist: string[];
  signatureAlgorithm: 'ECDSA secp256k1' | 'Ed25519' | 'RSA-4096';
  auditLogRetentionDays: number;
  roleHierarchyStrict: boolean;
  contractExecutionApprovalRequired: boolean;
  hardwareKeyRequiredForAdmin: boolean;
}

export interface NotificationSettingsData {
  emailAlerts: boolean;
  webhookAlerts: boolean;
  inAppAlerts: boolean;
  smsAlerts: boolean;
  alertOnFailedAuth: boolean;
  alertOnHighValueTransfer: boolean;
  alertOnContractFailure: boolean;
  alertOnRoleEscalation: boolean;
  weeklyComplianceDigest: boolean;
  emergencyBroadcastChannel: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  permissions: ('read' | 'write' | 'admin')[];
  createdAt: string;
  lastUsed: string;
  status: 'Active' | 'Revoked';
  rateLimit: string;
}

export interface WebhookItem {
  id: string;
  url: string;
  description: string;
  events: string[];
  status: 'Active' | 'Inactive' | 'Failing';
  lastDelivery: string;
  secretMasked: string;
}

export interface LedgerBackupSettings {
  autoBackup: boolean;
  backupFrequency: 'Hourly' | 'Daily' | 'Weekly';
  storageTarget: 'IPFS Private Cluster' | 'Encrypted S3 Cold Storage' | 'On-Premises HSM Storage';
  encryptionStandard: string;
  lastBackupTime: string;
  lastBackupHash: string;
  totalSnapshots: number;
  retentionMonths: number;
}

export interface AllSettings {
  general: GeneralSettingsData;
  blockchain: BlockchainSettingsData;
  security: SecurityPolicySettings;
  notifications: NotificationSettingsData;
  apiKeys: ApiKeyItem[];
  webhooks: WebhookItem[];
  backup: LedgerBackupSettings;
}

let mockSettings: AllSettings = {
  general: {
    orgName: 'Bharat Electronics Limited (BEL)',
    entityId: 'BEL-DEFENSE-NODE-01',
    defenseClassification: 'Restricted / Defense Grade',
    adminEmail: 'rahul.verma@bel.co.in',
    platformDomain: 'trust.bel.co.in',
    timezone: 'Asia/Kolkata (IST +05:30)',
    locale: 'en-IN',
    theme: 'light',
    dataResidency: 'India Sovereign Cloud (MeitY Approved)'
  },
  blockchain: {
    networkName: 'BEL Sovereign Testnet / Quorum',
    rpcEndpoint: 'https://rpc-testnet.trust.bel.co.in',
    chainId: 98234,
    gasPriceStrategy: 'Standard',
    customGasLimit: '8000000',
    blockExplorerUrl: 'https://explorer.trust.bel.co.in',
    consensusMechanism: 'IBFT 2.0 (Proof of Authority)',
    activeValidators: 7,
    latestBlock: '#2,345,678',
    blockTime: '2.4s',
    nodeStatus: 'Healthy'
  },
  security: {
    enforceMfa: true,
    sessionTimeoutMinutes: 30,
    maxFailedAttempts: 5,
    ipAllowlistEnabled: true,
    ipAllowlist: ['10.200.0.0/16', '192.168.10.0/24', '14.139.128.0/20'],
    signatureAlgorithm: 'ECDSA secp256k1',
    auditLogRetentionDays: 3650, // 10 years compliance
    roleHierarchyStrict: true,
    contractExecutionApprovalRequired: true,
    hardwareKeyRequiredForAdmin: false
  },
  notifications: {
    emailAlerts: true,
    webhookAlerts: true,
    inAppAlerts: true,
    smsAlerts: false,
    alertOnFailedAuth: true,
    alertOnHighValueTransfer: true,
    alertOnContractFailure: true,
    alertOnRoleEscalation: true,
    weeklyComplianceDigest: true,
    emergencyBroadcastChannel: 'soc-emergency@bel.co.in'
  },
  apiKeys: [
    {
      id: 'KEY-001',
      name: 'Defense Asset Management Gateway',
      prefix: 'bel_live_9f82...3e1a',
      permissions: ['read', 'write'],
      createdAt: '2026-06-15',
      lastUsed: '2 mins ago',
      status: 'Active',
      rateLimit: '1,000 req/min'
    },
    {
      id: 'KEY-002',
      name: 'Auditor External Ingestion Service',
      prefix: 'bel_live_4a11...99bc',
      permissions: ['read'],
      createdAt: '2026-07-01',
      lastUsed: '4 hours ago',
      status: 'Active',
      rateLimit: '250 req/min'
    },
    {
      id: 'KEY-003',
      name: 'Legacy ERP Sync Worker (Deprecated)',
      prefix: 'bel_live_0b77...11de',
      permissions: ['read', 'write', 'admin'],
      createdAt: '2026-01-10',
      lastUsed: '3 weeks ago',
      status: 'Revoked',
      rateLimit: '50 req/min'
    }
  ],
  webhooks: [
    {
      id: 'WH-01',
      url: 'https://siem.bel.co.in/api/v1/ledger-events',
      description: 'BEL Enterprise SIEM Security Stream',
      events: ['security.incident', 'role.changed', 'contract.failed'],
      status: 'Active',
      lastDelivery: '2 mins ago (HTTP 200)',
      secretMasked: 'whsec_88f9...33bc'
    },
    {
      id: 'WH-02',
      url: 'https://erp.bel.co.in/webhooks/asset-custody',
      description: 'ERP Supply Chain Asset Tracking Hook',
      events: ['asset.minted', 'asset.transferred', 'identity.verified'],
      status: 'Active',
      lastDelivery: '1 hour ago (HTTP 200)',
      secretMasked: 'whsec_11da...77fa'
    }
  ],
  backup: {
    autoBackup: true,
    backupFrequency: 'Daily',
    storageTarget: 'IPFS Private Cluster',
    encryptionStandard: 'AES-256-GCM + Post-Quantum Key Wrap',
    lastBackupTime: '2026-08-24 04:00 IST',
    lastBackupHash: 'QmZtmD2qt8f47k8v821mN84918239014abcef981023948',
    totalSnapshots: 142,
    retentionMonths: 120
  }
};

export async function getSettings(): Promise<AllSettings> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return JSON.parse(JSON.stringify(mockSettings));
}

export async function saveGeneralSettings(data: GeneralSettingsData): Promise<GeneralSettingsData> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  mockSettings.general = { ...data };
  return mockSettings.general;
}

export async function saveBlockchainSettings(data: BlockchainSettingsData): Promise<BlockchainSettingsData> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  mockSettings.blockchain = { ...data };
  return mockSettings.blockchain;
}

export async function saveSecuritySettings(data: SecurityPolicySettings): Promise<SecurityPolicySettings> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  mockSettings.security = { ...data };
  return mockSettings.security;
}

export async function saveNotificationSettings(data: NotificationSettingsData): Promise<NotificationSettingsData> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  mockSettings.notifications = { ...data };
  return mockSettings.notifications;
}

export async function saveBackupSettings(data: LedgerBackupSettings): Promise<LedgerBackupSettings> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  mockSettings.backup = { ...data };
  return mockSettings.backup;
}

export async function createApiKey(name: string, permissions: ('read' | 'write' | 'admin')[]): Promise<ApiKeyItem> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const newKey: ApiKeyItem = {
    id: `KEY-00${mockSettings.apiKeys.length + 1}`,
    name,
    prefix: `bel_live_${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
    permissions,
    createdAt: new Date().toISOString().split('T')[0],
    lastUsed: 'Never',
    status: 'Active',
    rateLimit: '1,000 req/min'
  };
  mockSettings.apiKeys = [newKey, ...mockSettings.apiKeys];
  return newKey;
}

export async function revokeApiKey(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const key = mockSettings.apiKeys.find((k) => k.id === id);
  if (key) {
    key.status = 'Revoked';
  }
  return true;
}

export async function pingBlockchainNode(): Promise<{ success: boolean; latencyMs: number; block: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    success: true,
    latencyMs: Math.floor(20 + Math.random() * 15),
    block: '#2,345,679'
  };
}
