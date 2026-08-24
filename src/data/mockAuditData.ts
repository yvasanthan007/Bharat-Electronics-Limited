export interface AuditEvent {
  id: string;
  time: string;
  user: string;
  userInitials: string;
  action: string;
  module: 'Authentication' | 'Access Control' | 'Smart Contracts' | 'Digital Assets' | 'Transactions' | 'System';
  resource: string;
  ip: string;
  status: 'Success' | 'Failed' | 'Warning';
  txHash: string;
}

export const mockAuditEvents: AuditEvent[] = [
  {
    id: 'EVT-10021',
    time: '24 May 2024, 03:22 PM',
    user: 'Rahul Verma',
    userInitials: 'RV',
    action: 'User Login',
    module: 'Authentication',
    resource: 'System',
    ip: '192.168.1.10',
    status: 'Success',
    txHash: '0xabc1...f432',
  },
  {
    id: 'EVT-10022',
    time: '24 May 2024, 03:17 PM',
    user: 'Neha Gupta',
    userInitials: 'NG',
    action: 'Role Assigned',
    module: 'Access Control',
    resource: 'Manager',
    ip: '192.168.1.22',
    status: 'Success',
    txHash: '0xd4e2...9b71',
  },
  {
    id: 'EVT-10023',
    time: '24 May 2024, 03:07 PM',
    user: 'Amit Kumar',
    userInitials: 'AK',
    action: 'Smart Contract Deployed',
    module: 'Smart Contracts',
    resource: 'AssetRegistry',
    ip: '192.168.1.15',
    status: 'Success',
    txHash: '0x7f3c...2d9a',
  },
  {
    id: 'EVT-10024',
    time: '24 May 2024, 03:04 PM',
    user: 'Priya Singh',
    userInitials: 'PS',
    action: 'Access Denied',
    module: 'Access Control',
    resource: 'Digital Assets',
    ip: '192.168.1.33',
    status: 'Failed',
    txHash: '0x1e8b...c5f3',
  },
  {
    id: 'EVT-10025',
    time: '24 May 2024, 02:57 PM',
    user: 'Ajay Sharma',
    userInitials: 'AS',
    action: 'Document Verified',
    module: 'Digital Assets',
    resource: 'DOC-7832',
    ip: '192.168.1.18',
    status: 'Success',
    txHash: '0x5c9d...a4b2',
  },
  {
    id: 'EVT-10026',
    time: '24 May 2024, 02:45 PM',
    user: 'Rahul Verma',
    userInitials: 'RV',
    action: 'Identity Created',
    module: 'Authentication',
    resource: 'DID-9921',
    ip: '192.168.1.10',
    status: 'Success',
    txHash: '0xb7e1...d3c9',
  },
  {
    id: 'EVT-10027',
    time: '24 May 2024, 02:30 PM',
    user: 'Kiran Rao',
    userInitials: 'KR',
    action: 'Transaction Initiated',
    module: 'Transactions',
    resource: 'TXN-3341',
    ip: '192.168.1.41',
    status: 'Success',
    txHash: '0x3a2f...e1d8',
  },
  {
    id: 'EVT-10028',
    time: '24 May 2024, 02:14 PM',
    user: 'Sneha Patel',
    userInitials: 'SP',
    action: 'Login Failed',
    module: 'Authentication',
    resource: 'System',
    ip: '192.168.1.55',
    status: 'Failed',
    txHash: '—',
  },
];

export const recentActivityItems = [
  { id: '1', action: 'User Login', detail: 'Rahul Verma', status: 'Success', time: '2 mins ago' },
  { id: '2', action: 'Role Assigned', detail: 'Neha Gupta → Manager', status: 'Success', time: '5 mins ago' },
  { id: '3', action: 'Smart Contract Deployed', detail: 'AssetRegistry', status: 'Success', time: '15 mins ago' },
  { id: '4', action: 'Access Denied', detail: 'Amit Kumar', status: 'Failed', time: '18 mins ago' },
  { id: '5', action: 'Document Verified', detail: 'DOC-7832', status: 'Success', time: '25 mins ago' },
];

export const eventOverviewData = [
  { name: 'Mon', success: 1800, failed: 42 },
  { name: 'Tue', success: 2100, failed: 58 },
  { name: 'Wed', success: 1650, failed: 35 },
  { name: 'Thu', success: 2400, failed: 72 },
  { name: 'Fri', success: 1950, failed: 48 },
  { name: 'Sat', success: 1100, failed: 22 },
  { name: 'Sun', success: 876, failed: 18 },
];

export const eventCategoryData = [
  { name: 'Identity Events', value: 32.4, color: '#3b82f6' },
  { name: 'Access Events', value: 26.1, color: '#8b5cf6' },
  { name: 'Transaction Events', value: 19.8, color: '#10b981' },
  { name: 'Smart Contract', value: 12.2, color: '#f59e0b' },
  { name: 'Asset Events', value: 6.3, color: '#06b6d4' },
  { name: 'System Events', value: 3.2, color: '#6b7280' },
];
