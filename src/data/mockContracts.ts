export interface SmartContract {
  id: string;
  name: string;
  type: string;
  address: string;
  status: 'Active' | 'Pending' | 'Paused' | 'Archived';
  network: string;
  deployedOn: string;
  transactions: number;
}

export const mockContracts: SmartContract[] = [
  {
    id: '1',
    name: 'IdentityRegistry',
    type: 'Identity',
    address: '0x8a1f...c3b9d',
    status: 'Active',
    network: 'Polygon',
    deployedOn: '24 May 2024, 10:30 AM',
    transactions: 248,
  },
  {
    id: '2',
    name: 'AccessControlManager',
    type: 'Access Control',
    address: '0x3b7e...d8f2a',
    status: 'Active',
    network: 'Polygon',
    deployedOn: '23 May 2024, 02:15 PM',
    transactions: 156,
  },
  {
    id: '3',
    name: 'AssetRegistry',
    type: 'Asset Management',
    address: '0x6c2d...e7a91',
    status: 'Active',
    network: 'Polygon',
    deployedOn: '21 May 2024, 11:45 AM',
    transactions: 312,
  },
  {
    id: '4',
    name: 'AuditTrailLogger',
    type: 'Audit',
    address: '0x9d4e...f1b7c',
    status: 'Active',
    network: 'Polygon',
    deployedOn: '20 May 2024, 09:12 AM',
    transactions: 428,
  },
  {
    id: '5',
    name: 'RoleManagement',
    type: 'Access Control',
    address: '0xf21a...a9c3e',
    status: 'Active',
    network: 'Polygon',
    deployedOn: '18 May 2024, 04:30 PM',
    transactions: 104,
  },
  {
    id: '6',
    name: 'DocumentVerifier',
    type: 'Verification',
    address: '0x5e7f...b2d4a',
    status: 'Pending',
    network: 'Polygon',
    deployedOn: '24 May 2024, 03:00 PM',
    transactions: 0,
  },
  {
    id: '7',
    name: 'NFTMarketplace',
    type: 'Marketplace',
    address: '0x1a9b...f8e3d',
    status: 'Paused',
    network: 'Polygon',
    deployedOn: '15 May 2024, 01:20 PM',
    transactions: 88,
  },
  {
    id: '8',
    name: 'ComplianceChecker',
    type: 'Compliance',
    address: '0x7b3c...d6e1f',
    status: 'Archived',
    network: 'Polygon',
    deployedOn: '10 May 2024, 08:45 AM',
    transactions: 64,
  },
];

export const recentDeployments = [
  { id: '1', name: 'DocumentVerifier', status: 'Pending', time: '10 mins ago' },
  { id: '2', name: 'IdentityRegistry', status: 'Success', time: '2 hours ago' },
  { id: '3', name: 'AccessControlManager', status: 'Success', time: '1 day ago' },
  { id: '4', name: 'AssetRegistry', status: 'Success', time: '3 days ago' },
  { id: '5', name: 'AuditTrailLogger', status: 'Success', time: '4 days ago' },
];

export const contractMetricsData = [
  { name: 'Mon', executions: 400 },
  { name: 'Tue', executions: 300 },
  { name: 'Wed', executions: 550 },
  { name: 'Thu', executions: 450 },
  { name: 'Fri', executions: 700 },
  { name: 'Sat', executions: 600 },
  { name: 'Sun', executions: 800 },
];
