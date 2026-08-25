import { ethers } from 'ethers';
import { recordBlockchainEvent } from '../lib/did/blockchainLayer';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: { name: string } | string;
  createdAt: string;
  // Admin-Controlled DID fields
  did?: string | null;
  did_public_key?: string | null;
  did_status?: 'ACTIVE' | 'DEACTIVATED' | 'REVOKED' | 'NONE' | string | null;
  did_created_at?: string | null;
  did_created_by?: string | null;
}

export interface UsersSummaryData {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  didsActive: number;
}

const STORAGE_USERS_KEY = 'bel_users_store';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
});

function loadStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_USERS;
}

function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch {}
}

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const res = await fetch(`${BASE_URL}/users`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch users');
    const json = await res.json();
    const data = json.data ?? json;
    if (Array.isArray(data) && data.length > 0) {
      saveStoredUsers(data);
      return data;
    }
  } catch {
    // Return stored/mock data when backend isn't reachable
  }
  return loadStoredUsers();
};

export const getUsersSummary = (users: User[]): UsersSummaryData => ({
  total: users.length,
  active: users.filter((u) => u.isActive).length,
  inactive: users.filter((u) => !u.isActive).length,
  admins: users.filter((u) => {
    const role = typeof u.role === 'string' ? u.role : u.role?.name ?? '';
    return role.toLowerCase() === 'admin';
  }).length,
  didsActive: users.filter((u) => u.did && u.did_status === 'ACTIVE').length,
});

/**
 * Admin creates/provisions a DID permanently linked to an existing user account
 */
export async function provisionUserDID(
  userId: string,
  params?: { customDID?: string; publicKey?: string; walletAddress?: string; adminEmail?: string }
): Promise<{ user: User; txHash: string }> {
  const adminEmail = params?.adminEmail || localStorage.getItem('user_email') || 'admin@bel.com';

  // Try backend endpoint first
  try {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/did`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        customDID: params?.customDID,
        publicKey: params?.publicKey,
        walletAddress: params?.walletAddress,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}

  // Local/Offline Provisioning Fallback
  const users = loadStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error('User not found');
  }

  const user = users[index];
  let walletAddress = params?.walletAddress;
  let publicKey = params?.publicKey;
  let did = params?.customDID;

  if (!did || !walletAddress) {
    const tempWallet = ethers.Wallet.createRandom();
    walletAddress = tempWallet.address;
    publicKey = tempWallet.publicKey;
    did = `did:trustchain:${walletAddress.slice(2, 8).toUpperCase()}${walletAddress.slice(-4).toUpperCase()}`;
  }

  const now = new Date().toISOString();
  const updatedUser: User = {
    ...user,
    did,
    did_public_key: publicKey || `0x04${walletAddress.slice(2)}`,
    did_status: 'ACTIVE',
    did_created_at: now,
    did_created_by: adminEmail,
  };

  users[index] = updatedUser;
  saveStoredUsers(users);

  // Record on mock blockchain ledger
  const txEvent = await recordBlockchainEvent({
    eventType: 'DID_CREATED',
    actorDID: `did:trustchain:ADMIN_BEL_001`,
    walletAddress: walletAddress || '0x7f82a1b3c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    details: {
      action: 'DID_CREATED',
      targetUser: `${user.firstName} ${user.lastName}`,
      targetEmail: user.email,
      targetDID: did,
      role: typeof user.role === 'string' ? user.role : user.role?.name || 'USER',
      createdBy: adminEmail,
    },
    verificationResult: 'SUCCESS',
  });

  return { user: updatedUser, txHash: txEvent.txHash };
}

/**
 * Admin deactivates/revokes a user's DID
 */
export async function deactivateUserDID(
  userId: string,
  adminEmail = 'admin@bel.com'
): Promise<{ user: User; txHash: string }> {
  try {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/did/deactivate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {}

  const users = loadStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error('User not found');

  const user = users[index];
  const updatedUser: User = {
    ...user,
    did_status: 'DEACTIVATED',
  };

  users[index] = updatedUser;
  saveStoredUsers(users);

  const txEvent = await recordBlockchainEvent({
    eventType: 'DID_DEACTIVATED' as any,
    actorDID: `did:trustchain:ADMIN_BEL_001`,
    walletAddress: '0x7f82a1b3c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    details: {
      action: 'DID_DEACTIVATED',
      targetUser: `${user.firstName} ${user.lastName}`,
      targetDID: user.did || 'unknown',
      deactivatedBy: adminEmail,
    },
    verificationResult: 'SUCCESS',
  });

  return { user: updatedUser, txHash: txEvent.txHash };
}

/**
 * Admin reactivates a user's DID
 */
export async function reactivateUserDID(
  userId: string,
  adminEmail = 'admin@bel.com'
): Promise<{ user: User; txHash: string }> {
  const users = loadStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error('User not found');

  const user = users[index];
  const updatedUser: User = {
    ...user,
    did_status: 'ACTIVE',
  };

  users[index] = updatedUser;
  saveStoredUsers(users);

  const txEvent = await recordBlockchainEvent({
    eventType: 'DID_VERIFIED',
    actorDID: `did:trustchain:ADMIN_BEL_001`,
    walletAddress: '0x7f82a1b3c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    details: {
      action: 'DID_REACTIVATED',
      targetUser: `${user.firstName} ${user.lastName}`,
      targetDID: user.did || 'unknown',
      reactivatedBy: adminEmail,
    },
    verificationResult: 'SUCCESS',
  });

  return { user: updatedUser, txHash: txEvent.txHash };
}

export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@bel.com',
    firstName: 'Arjun',
    lastName: 'Mehta',
    isActive: true,
    role: { name: 'Admin' },
    createdAt: '2024-01-15T10:00:00Z',
    did: 'did:trustchain:ADMIN456',
    did_public_key: '0x047f82a1b3c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9',
    did_status: 'ACTIVE',
    did_created_at: '2024-01-15T10:05:00Z',
    did_created_by: 'System Initializer',
  },
  {
    id: '101',
    email: 'arun@bel.com',
    firstName: 'Arun',
    lastName: 'Kumar',
    isActive: true,
    role: { name: 'USER' },
    createdAt: '2024-02-10T08:30:00Z',
    did: 'did:trustchain:ABC123',
    did_public_key: '0x0499238491823749812739812739812398127398127398127398127398127398',
    did_status: 'ACTIVE',
    did_created_at: '2024-02-10T09:00:00Z',
    did_created_by: 'Admin',
  },
  {
    id: '2',
    email: 'priya@bel.com',
    firstName: 'Priya',
    lastName: 'Sharma',
    isActive: true,
    role: { name: 'Manager' },
    createdAt: '2024-02-20T09:30:00Z',
    did: 'did:trustchain:MGR_PRIYA_882',
    did_public_key: '0x0482910394819238491283948192839481928394819283948192839481928394',
    did_status: 'ACTIVE',
    did_created_at: '2024-02-20T10:00:00Z',
    did_created_by: 'Admin',
  },
  {
    id: '3',
    email: 'rahul@bel.com',
    firstName: 'Rahul',
    lastName: 'Verma',
    isActive: true,
    role: { name: 'Analyst' },
    createdAt: '2024-03-10T11:00:00Z',
    did: null,
    did_status: 'NONE',
  },
  {
    id: '4',
    email: 'sneha@bel.com',
    firstName: 'Sneha',
    lastName: 'Patel',
    isActive: false,
    role: { name: 'Viewer' },
    createdAt: '2024-04-05T08:00:00Z',
    did: 'did:trustchain:SNEHA_REVOKED_104',
    did_status: 'DEACTIVATED',
    did_created_at: '2024-04-05T08:30:00Z',
    did_created_by: 'Admin',
  },
  {
    id: '5',
    email: 'vikram@bel.com',
    firstName: 'Vikram',
    lastName: 'Singh',
    isActive: true,
    role: { name: 'Admin' },
    createdAt: '2024-01-28T14:00:00Z',
    did: 'did:trustchain:VIKRAM_ADM_901',
    did_status: 'ACTIVE',
    did_created_at: '2024-01-28T14:15:00Z',
    did_created_by: 'Super Admin',
  },
  {
    id: '6',
    email: 'ananya@bel.com',
    firstName: 'Ananya',
    lastName: 'Rao',
    isActive: true,
    role: { name: 'Engineer' },
    createdAt: '2024-05-18T10:45:00Z',
    did: 'did:ethr:0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    did_public_key: '0x04e123...',
    did_status: 'ACTIVE',
    did_created_at: '2024-05-18T11:00:00Z',
    did_created_by: 'Admin',
  },
  {
    id: '7',
    email: 'karan@bel.com',
    firstName: 'Karan',
    lastName: 'Gupta',
    isActive: false,
    role: { name: 'Viewer' },
    createdAt: '2024-06-01T09:00:00Z',
    did: null,
    did_status: 'NONE',
  },
  {
    id: '8',
    email: 'meera@bel.com',
    firstName: 'Meera',
    lastName: 'Nair',
    isActive: true,
    role: { name: 'Manager' },
    createdAt: '2024-03-22T13:15:00Z',
    did: 'did:trustchain:MEERA_MGR_331',
    did_status: 'ACTIVE',
    did_created_at: '2024-03-22T13:30:00Z',
    did_created_by: 'Admin',
  },
];

