
export const mockData = {
  kpi: [
    {
      title: 'Total Identities',
      value: '1,248',
      growth: '↑ 12.5%',
      description: 'Active trusted identities',
      icon: 'User'
    },
    {
      title: 'Active Roles',
      value: '24',
      growth: '↑ 8.3%',
      description: 'Role-based access groups',
      icon: 'Lock'
    },
    {
      title: 'Digital Assets (NFTs)',
      value: '536',
      growth: '↑ 18.7%',
      description: 'Minted and assigned',
      icon: 'Tag'
    },
    {
      title: 'Transactions',
      value: '2,856',
      growth: '↑ 22.1%',
      description: 'Total on-chain transactions',
      icon: 'Activity'
    }
  ],
  activities: [
    {
      id: 1,
      title: 'Certificate NFT #1024 was issued to Rahul Verma',
      time: '2 mins ago',
      actor: 'Admin',
      badge: 'Asset Issued',
      badgeColor: 'bg-blue-100 text-blue-700',
      icon: 'Tag'
    },
    {
      id: 2,
      title: 'Access request approved for Project Atlas',
      time: '15 mins ago',
      actor: 'Manager',
      badge: 'Access Approved',
      badgeColor: 'bg-green-100 text-green-700',
      icon: 'ShieldCheck'
    },
    {
      id: 3,
      title: 'NFT #0987 transferred from Priya Singh to Amit Kumar',
      time: '1 hour ago',
      actor: 'Smart Contract',
      badge: 'Asset Transfer',
      badgeColor: 'bg-purple-100 text-purple-700',
      icon: 'ArrowRightLeft'
    },
    {
      id: 4,
      title: 'Role "Engineer" assigned to Neha Gupta',
      time: '2 hours ago',
      actor: 'Admin',
      badge: 'Role Assigned',
      badgeColor: 'bg-orange-100 text-orange-700',
      icon: 'Key'
    },
    {
      id: 5,
      title: 'New identity did:bel:7f82...a3b9 created',
      time: '3 hours ago',
      actor: 'Admin',
      badge: 'Identity Created',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      icon: 'UserPlus'
    }
  ],
  transactionsChart: [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 550 },
    { name: 'Thu', value: 450 },
    { name: 'Fri', value: 700 },
    { name: 'Sat', value: 200 },
    { name: 'Sun', value: 150 }
  ],
  roleDistribution: [
    { name: 'Engineer', value: 499, color: '#3b82f6' }, // blue-500
    { name: 'Manager', value: 224, color: '#8b5cf6' }, // violet-500
    { name: 'User', value: 188, color: '#10b981' }, // emerald-500
    { name: 'Auditor', value: 187, color: '#f59e0b' }, // amber-500
    { name: 'Administrator', value: 150, color: '#ef4444' } // red-500
  ],
  blockchainStatus: {
    status: 'Connected',
    network: 'BEL Testnet',
    latestBlock: '#2345678',
    blockTime: '2.4s',
    gasPrice: '20 Gwei'
  }
};

export type IdentityStatus = 'Verified' | 'Pending' | 'Revoked';

export interface Identity {
  id: string;
  name: string;
  did: string;
  role: string;
  department: string;
  status: IdentityStatus;
  createdOn: string;
  lastActive: string;
}

export const mockIdentities: Identity[] = [
  {
    id: '1',
    name: 'Rahul Verma',
    did: 'did:bel:7f82...a3b9',
    role: 'Administrator',
    department: 'IT Security',
    status: 'Verified',
    createdOn: '2026-01-15',
    lastActive: '2 min ago',
  },
  {
    id: '2',
    name: 'Neha Gupta',
    did: 'did:bel:3c91...b7d2',
    role: 'Manager',
    department: 'Operations',
    status: 'Verified',
    createdOn: '2026-02-10',
    lastActive: '1 hr ago',
  },
  {
    id: '3',
    name: 'Amit Kumar',
    did: 'did:bel:9a11...c4f8',
    role: 'Engineer',
    department: 'R&D',
    status: 'Verified',
    createdOn: '2026-03-22',
    lastActive: '3 hrs ago',
  },
  {
    id: '4',
    name: 'Priya Singh',
    did: 'did:bel:6d44...e1a2',
    role: 'Auditor',
    department: 'Audit',
    status: 'Verified',
    createdOn: '2026-04-05',
    lastActive: '1 day ago',
  },
  {
    id: '5',
    name: 'Ajay Sharma',
    did: 'did:bel:f2b8...d9c1',
    role: 'User',
    department: 'Logistics',
    status: 'Pending',
    createdOn: '2026-08-20',
    lastActive: 'Never',
  },
  {
    id: '6',
    name: 'Ravi Kishore',
    did: 'did:bel:ab31...e5f7',
    role: 'User',
    department: 'HR',
    status: 'Pending',
    createdOn: '2026-08-23',
    lastActive: 'Never',
  },
];

export interface Role {
  id: string;
  name: string;
  usersCount: number;
  permissionsCount: number;
  status: 'Active' | 'Inactive';
  description: string;
}

export const mockRoles: Role[] = [
  { id: '1', name: 'Administrator', usersCount: 150, permissionsCount: 128, status: 'Active', description: 'Full system access' },
  { id: '2', name: 'Manager', usersCount: 224, permissionsCount: 85, status: 'Active', description: 'Manage teams and resources' },
  { id: '3', name: 'Engineer', usersCount: 499, permissionsCount: 42, status: 'Active', description: 'Access to development resources' },
  { id: '4', name: 'Auditor', usersCount: 187, permissionsCount: 28, status: 'Active', description: 'Read-only audit access' },
  { id: '5', name: 'User', usersCount: 188, permissionsCount: 16, status: 'Active', description: 'Basic platform access' },
];

export const mockPermissions = [
  'Manage Identities',
  'Assign Roles',
  'Manage Assets (NFTs)',
  'Smart Contracts',
  'View Audit Trail',
  'System Settings',
  'Export Reports'
];

export const mockPermissionMatrix: Record<string, boolean[]> = {
  'Administrator': [true, true, true, true, true, true, true],
  'Manager': [true, true, true, false, true, false, true],
  'Engineer': [false, false, true, true, true, false, false],
  'Auditor': [false, false, false, false, true, false, true],
  'User': [false, false, false, false, false, false, false],
};

export interface AccessRequest {
  id: string;
  user: string;
  requestedAccess: string;
  resource: string;
  requestedOn: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export const mockAccessRequests: AccessRequest[] = [
  { id: '1', user: 'Neha Gupta', requestedAccess: 'Access to Digital Assets', resource: 'NFT Management', requestedOn: '2026-08-24 10:15 AM', status: 'Approved' },
  { id: '2', user: 'Amit Kumar', requestedAccess: 'Access to Smart Contracts', resource: 'Contract Deployment', requestedOn: '2026-08-24 11:30 AM', status: 'Pending' },
  { id: '3', user: 'Priya Singh', requestedAccess: 'View Audit Logs', resource: 'Audit Trail', requestedOn: '2026-08-23 04:45 PM', status: 'Rejected' },
];
