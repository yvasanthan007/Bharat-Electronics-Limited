export type IdentityStatus = 'Verified' | 'Pending' | 'Revoked';

export type SecurityClearance = 
  | 'Top Secret (SCI)' 
  | 'Secret' 
  | 'Confidential' 
  | 'Restricted';

export interface Identity {
  id: string;
  name: string;
  did: string;
  employeeId: string;
  email: string;
  role: string;
  department: string;
  status: IdentityStatus;
  securityClearance: SecurityClearance;
  walletAddress: string;
  publicKey: string;
  keyType: 'Ed25519' | 'Secp256k1' | 'RSA-4096';
  avatar?: string;
  createdOn: string;
  lastActive: string;
  verifiableCredentialsCount: number;
}

export interface IdentityStatsSummary {
  total: number;
  verified: number;
  pending: number;
  revoked: number;
  totalGrowth: string;
  verifiedGrowth: string;
  pendingGrowth: string;
  revokedGrowth: string;
}

const STORAGE_KEY = 'bel_identities_data_v2';

export const INITIAL_IDENTITIES: Identity[] = [
  {
    id: 'bel-id-01',
    name: 'Rahul Verma',
    did: 'did:bel:sov:7f82c441a3b9',
    employeeId: 'BEL-IT-0104',
    email: 'rahul.verma@bel.co.in',
    role: 'Administrator',
    department: 'IT Security',
    status: 'Verified',
    securityClearance: 'Top Secret (SCI)',
    walletAddress: '0x7f82c4412f9e110b77c5d41a99b21a8d76e0a3b9',
    publicKey: '0x04f32a8849b219e88bca120934812f890192847120a',
    keyType: 'Ed25519',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdOn: '2026-01-15',
    lastActive: 'Just now',
    verifiableCredentialsCount: 8,
  },
  {
    id: 'bel-id-02',
    name: 'Neha Gupta',
    did: 'did:bel:sov:3c91e0a2b7d2',
    employeeId: 'BEL-OPS-0892',
    email: 'neha.gupta@bel.co.in',
    role: 'Manager',
    department: 'Operations',
    status: 'Verified',
    securityClearance: 'Secret',
    walletAddress: '0x3c91e0a2b7d28901238491203481239812903812',
    publicKey: '0x02b8812903481290381203948102938401928340192',
    keyType: 'Secp256k1',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdOn: '2026-02-10',
    lastActive: '15 min ago',
    verifiableCredentialsCount: 5,
  },
  {
    id: 'bel-id-03',
    name: 'Dr. Amit Kumar',
    did: 'did:bel:sov:9a11f7c4f801',
    employeeId: 'BEL-RD-0441',
    email: 'amit.kumar@bel.co.in',
    role: 'Engineer',
    department: 'R&D Avionics',
    status: 'Verified',
    securityClearance: 'Top Secret (SCI)',
    walletAddress: '0x9a11f7c4f8019283740192830192837192830192',
    publicKey: '0x03aa991203948102938401928340192830192847120',
    keyType: 'Ed25519',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdOn: '2026-03-22',
    lastActive: '1 hr ago',
    verifiableCredentialsCount: 12,
  },
  {
    id: 'bel-id-04',
    name: 'Priya Singh',
    did: 'did:bel:sov:6d44c8e1a299',
    employeeId: 'BEL-AUD-0231',
    email: 'priya.singh@bel.co.in',
    role: 'Auditor',
    department: 'Audit & Compliance',
    status: 'Verified',
    securityClearance: 'Secret',
    walletAddress: '0x6d44c8e1a2993481273941bca908234120341234',
    publicKey: '0x04cc88239401928340192830192847120a881290348',
    keyType: 'RSA-4096',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdOn: '2026-04-05',
    lastActive: '3 hrs ago',
    verifiableCredentialsCount: 6,
  },
  {
    id: 'bel-id-05',
    name: 'Ajay Sharma',
    did: 'did:bel:sov:f2b8a0d9c188',
    employeeId: 'BEL-LOG-0552',
    email: 'ajay.sharma@bel.co.in',
    role: 'User',
    department: 'Logistics & Supply',
    status: 'Pending',
    securityClearance: 'Confidential',
    walletAddress: '0xf2b8a0d9c1884b78912eac781934bc00827361ab',
    publicKey: '0x02ff9910293840192830192847120a8812903481290',
    keyType: 'Secp256k1',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdOn: '2026-08-20',
    lastActive: 'Awaiting Verification',
    verifiableCredentialsCount: 1,
  },
  {
    id: 'bel-id-06',
    name: 'Ravi Kishore',
    did: 'did:bel:sov:ab3107e5f723',
    employeeId: 'BEL-HR-0119',
    email: 'ravi.kishore@bel.co.in',
    role: 'User',
    department: 'HR & Personnel',
    status: 'Pending',
    securityClearance: 'Restricted',
    walletAddress: '0xab3107e5f7238f3c4e9b21a8d76e053a992bc441',
    publicKey: '0x03ee110293840192830192847120a88129034812903',
    keyType: 'Ed25519',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdOn: '2026-08-23',
    lastActive: 'Awaiting Verification',
    verifiableCredentialsCount: 1,
  },
  {
    id: 'bel-id-07',
    name: 'Vikramaditya Rao',
    did: 'did:bel:sov:88ce991204bb',
    employeeId: 'BEL-NAV-0071',
    email: 'vikram.rao@bel.co.in',
    role: 'Security Officer',
    department: 'Radar Systems',
    status: 'Verified',
    securityClearance: 'Top Secret (SCI)',
    walletAddress: '0x88ce991204bb12a994ef88210bc93481273941bc',
    publicKey: '0x04dd338192039481029384019283401928301928471',
    keyType: 'Ed25519',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    createdOn: '2026-05-18',
    lastActive: '12 min ago',
    verifiableCredentialsCount: 9,
  }
];

export const getIdentities = (): Identity[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading identities from localStorage', e);
  }
  return INITIAL_IDENTITIES;
};

export const saveIdentities = (identities: Identity[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identities));
  } catch (e) {
    console.error('Error saving identities', e);
  }
};

export const calculateIdentityStats = (identities: Identity[]): IdentityStatsSummary => {
  const total = identities.length;
  const verified = identities.filter((i) => i.status === 'Verified').length;
  const pending = identities.filter((i) => i.status === 'Pending').length;
  const revoked = identities.filter((i) => i.status === 'Revoked').length;

  return {
    total,
    verified,
    pending,
    revoked,
    totalGrowth: '↑ 14.2%',
    verifiedGrowth: '↑ 11.5%',
    pendingGrowth: pending > 0 ? `+${pending} new` : '0%',
    revokedGrowth: revoked > 0 ? `${revoked} flags` : '0%',
  };
};

export const generateDid = (prefix = 'did:bel:sov:'): string => {
  const hash = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `${prefix}${hash}`;
};
