const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
});

// ─── Types ──────────────────────────────────────────────
export interface UserIdentity {
  name: string;
  role: string;
  department: string;
  employeeId: string;
  did: string;
  status: 'Verified' | 'Pending' | 'Unverified';
  issuedOn: string;
  validUntil: string;
}

export interface Credential {
  name: string;
  id: string;
  date: string;
  status: 'Active' | 'Pending' | 'Revoked';
}

export interface UserAsset {
  id: string;
  name: string;
  type: string;
  issued: string;
  status: 'Active' | 'Expired' | 'Pending';
  nft: string;
}

export interface ActivityItem {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  status: 'Success' | 'Pending' | 'Failed';
  category: string;
}

export interface AccessRequest {
  id: string;
  resource: string;
  submitted: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface DashboardKPI {
  identityStatus: string;
  totalAssets: number;
  activeAccess: number;
  pendingRequests: number;
}

// ─── API helpers ────────────────────────────────────────
async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return fallback;
  }
}

// ─── Dashboard KPI ──────────────────────────────────────
const MOCK_KPI: DashboardKPI = {
  identityStatus: 'Verified',
  totalAssets: 6,
  activeAccess: 8,
  pendingRequests: 2,
};

export const getDashboardKPI = (): Promise<DashboardKPI> =>
  apiGet('/dashboard/user-summary', MOCK_KPI);

// ─── Identity ───────────────────────────────────────────
const MOCK_IDENTITY: UserIdentity = {
  name: 'Rithvik Aadhiran',
  role: 'Engineer',
  department: 'R&D Systems',
  employeeId: 'BEL-2024-1024',
  did: 'did:bel:0x7f82a1b3c9d4e5f6a7b8c9d0e1f2a3b4',
  status: 'Verified',
  issuedOn: '15 Jan 2024',
  validUntil: '14 Jan 2025',
};

const MOCK_CREDENTIALS: Credential[] = [
  { name: 'Employee Certificate',    id: 'NFT-1024', date: '15 Jan 2024', status: 'Active' },
  { name: 'Security Clearance - L2', id: 'NFT-1087', date: '20 Feb 2024', status: 'Active' },
  { name: 'Project Atlas Access',    id: 'NFT-1132', date: '01 Mar 2024', status: 'Pending' },
];

export const getUserIdentity = (): Promise<UserIdentity> =>
  apiGet('/users/me/identity', MOCK_IDENTITY);

export const getUserCredentials = (): Promise<Credential[]> =>
  apiGet('/users/me/credentials', MOCK_CREDENTIALS);

// ─── Assets ─────────────────────────────────────────────
const MOCK_ASSETS: UserAsset[] = [
  { id: 'AST-001', name: 'Project Atlas Repository',   type: 'Repository',    issued: '15 Jan 2024', status: 'Active',  nft: 'NFT-2048' },
  { id: 'AST-002', name: 'R&D Documentation Bundle',   type: 'Document Set',  issued: '20 Feb 2024', status: 'Active',  nft: 'NFT-2049' },
  { id: 'AST-003', name: 'Security Module License',    type: 'License',       issued: '01 Mar 2024', status: 'Active',  nft: 'NFT-2050' },
  { id: 'AST-004', name: 'BEL Intranet Portal Access', type: 'Access Token',  issued: '10 Mar 2024', status: 'Active',  nft: 'NFT-2051' },
  { id: 'AST-005', name: 'CAD Tools Suite',            type: 'Software',      issued: '22 Apr 2024', status: 'Expired', nft: 'NFT-2052' },
  { id: 'AST-006', name: 'Classified Data Read Access', type: 'Access Token', issued: '02 May 2024', status: 'Pending', nft: 'NFT-2053' },
];

export const getUserAssets = (): Promise<UserAsset[]> =>
  apiGet('/assets/portfolio', MOCK_ASSETS);

// ─── Activity ───────────────────────────────────────────
const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: 1,  title: 'User Login',                description: 'Successfully logged in to the platform',          date: '25 May 2024', time: '10:30 AM', status: 'Success', category: 'Auth' },
  { id: 2,  title: 'Access Request Submitted',  description: 'Requested access to "Project Atlas Repository"',  date: '25 May 2024', time: '10:15 AM', status: 'Pending', category: 'Access' },
  { id: 3,  title: 'Certificate NFT #1024',     description: 'Digital certificate issued to your identity',    date: '24 May 2024', time: '03:00 PM', status: 'Success', category: 'Identity' },
  { id: 4,  title: 'Role Assignment',           description: 'Role "Engineer" assigned to your identity',      date: '24 May 2024', time: '11:00 AM', status: 'Success', category: 'Identity' },
  { id: 5,  title: 'Access Granted',            description: 'Access granted to "R&D Documentation"',          date: '24 May 2024', time: '09:45 AM', status: 'Success', category: 'Access' },
  { id: 6,  title: 'Login Failed',              description: 'Failed login attempt from unknown IP',           date: '23 May 2024', time: '8:12 PM',  status: 'Failed',  category: 'Auth' },
  { id: 7,  title: 'Asset NFT-2048 Received',   description: 'Received digital asset from BEL Admin',          date: '22 May 2024', time: '02:30 PM', status: 'Success', category: 'Assets' },
  { id: 8,  title: 'Profile Updated',           description: 'Your profile information was updated',           date: '20 May 2024', time: '11:20 AM', status: 'Success', category: 'Profile' },
];

export const getUserActivities = (): Promise<ActivityItem[]> =>
  apiGet('/dashboard/activity', MOCK_ACTIVITIES);

export const getRecentActivities = async (limit = 5): Promise<ActivityItem[]> => {
  const all = await getUserActivities();
  return all.slice(0, limit);
};

// ─── Access Requests ────────────────────────────────────
const MOCK_REQUESTS: AccessRequest[] = [
  { id: 'REQ-001', resource: 'Project Atlas Repository', submitted: '10 May 2024', status: 'Pending' },
  { id: 'REQ-002', resource: 'Classified Data Drive',    submitted: '02 May 2024', status: 'Approved' },
];

export const getAccessRequests = (): Promise<AccessRequest[]> =>
  apiGet('/access-requests', MOCK_REQUESTS);

export const submitAccessRequest = async (resource: string, reason: string): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/access-requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resource, reason }),
    });
    return res.ok;
  } catch {
    // Simulate success when backend is unavailable
    return true;
  }
};

export const AVAILABLE_RESOURCES = [
  'Project Atlas Repository',
  'R&D Documentation Bundle',
  'BEL Intranet Portal',
  'Classified Data Drive',
  'CAD Tools Suite',
  'Security Module License',
  'HR Management System',
  'Finance Portal',
];
