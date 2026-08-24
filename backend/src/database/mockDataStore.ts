export interface MockUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  did: string;
  status: string;
  role: string;
  isEmailVerified: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockWallet {
  id: string;
  userId: string;
  address: string;
  label: string;
  network: string;
  chainId: number;
  isVerified: boolean;
  balanceEth: number;
  type: string;
  createdAt: Date;
}

export interface MockAsset {
  id: string;
  name: string;
  symbol: string;
  category: string;
  tokenId: string;
  contractAddress: string;
  ownerId: string;
  quantity: number;
  currentPriceUsd: number;
  buyPriceUsd: number;
  allocationPercentage: number;
  pnlPercentage: number;
  marketValueUsd: number;
  image: string;
  isFavorite: boolean;
  blockNumber: number;
  metadata?: any;
  createdAt: Date;
}

export interface MockTransaction {
  id: string;
  hash: string;
  blockNumber: number;
  fromAddress: string;
  toAddress: string;
  assetId?: string;
  amount: number;
  usdValue: number;
  feeEth: number;
  gasUsed: number;
  gasPriceGwei: number;
  type: string;
  status: string;
  network: string;
  timestamp: Date;
  memo?: string;
  rawJson?: any;
}

export interface MockNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

export interface MockAuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress: string;
  status: string;
  timestamp: Date;
  blockHeight: number;
  cryptographicHash: string;
}

class MockDataStore {
  public users: MockUser[] = [];
  public wallets: MockWallet[] = [];
  public assets: MockAsset[] = [];
  public transactions: MockTransaction[] = [];
  public notifications: MockNotification[] = [];
  public auditLogs: MockAuditLog[] = [];
  public roles = [
    { id: 'role-admin', name: 'Administrator', description: 'Full root access to defense trust ledger & node configuration' },
    { id: 'role-manager', name: 'Manager', description: 'Access approval and high-value asset transfer authorization' },
    { id: 'role-engineer', name: 'Engineer', description: 'Smart contract deployment and identity operations' },
    { id: 'role-auditor', name: 'Auditor', description: 'Read-only compliance and Merkle proof verification' },
    { id: 'role-user', name: 'User', description: 'Standard platform participant with assigned tokens' },
  ];

  constructor() {
    this.seedInitialData();
  }

  public seedInitialData() {
    // Admin user (password: Admin@123)
    // bcrypt hash of 'Admin@123'
    const passwordHash = '$2b$12$e8Yy8sJgYl7Z3Q0bE5mK..K.7zUaN03mS7p77C8vOq5L8R4F7iU2S';

    this.users = [
      {
        id: 'usr-admin-01',
        email: 'rahul.verma@bel.co.in',
        passwordHash,
        firstName: 'Rahul',
        lastName: 'Verma',
        did: 'did:bel:7f82e391a3b909f1',
        status: 'ACTIVE',
        role: 'Administrator',
        isEmailVerified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        createdAt: new Date('2026-01-15T08:00:00Z'),
        updatedAt: new Date('2026-08-24T10:00:00Z'),
      },
      {
        id: 'usr-eng-02',
        email: 'neha.gupta@bel.co.in',
        passwordHash,
        firstName: 'Neha',
        lastName: 'Gupta',
        did: 'did:bel:4a11c899bc019283',
        status: 'ACTIVE',
        role: 'Engineer',
        isEmailVerified: true,
        createdAt: new Date('2026-02-10T09:30:00Z'),
        updatedAt: new Date('2026-08-23T14:20:00Z'),
      },
      {
        id: 'usr-aud-03',
        email: 'priya.singh@bel.co.in',
        passwordHash,
        firstName: 'Priya',
        lastName: 'Singh',
        did: 'did:bel:99a014bcfe819230',
        status: 'ACTIVE',
        role: 'Auditor',
        isEmailVerified: true,
        createdAt: new Date('2026-03-01T11:00:00Z'),
        updatedAt: new Date('2026-08-22T16:45:00Z'),
      },
    ];

    this.wallets = [
      {
        id: 'wlt-01',
        userId: 'usr-admin-01',
        address: '0x7f82c4412f9e110b77c5d41a99b21a8d76e0a3b9',
        label: 'BEL Defense Master Cold Vault',
        network: 'BEL Sovereign Testnet',
        chainId: 98234,
        isVerified: true,
        balanceEth: 4850.5,
        type: 'EVM_ENTERPRISE',
        createdAt: new Date('2026-01-15T08:30:00Z'),
      },
      {
        id: 'wlt-02',
        userId: 'usr-eng-02',
        address: '0x33b81920acdef8719204918239014abcef981023',
        label: 'Engineering Node Hot Signer',
        network: 'BEL Sovereign Testnet',
        chainId: 98234,
        isVerified: true,
        balanceEth: 120.25,
        type: 'EVM_ENTERPRISE',
        createdAt: new Date('2026-02-10T10:00:00Z'),
      },
    ];

    this.assets = [
      {
        id: 'ast-01',
        name: 'BEL Radar Sensor Mk-IV Certificate',
        symbol: 'BEL-RS-04',
        category: 'TOKENIZED_DEFENSE_HARDWARE',
        tokenId: '#1024',
        contractAddress: '0x8f3c4e9b21a8d76e053a992bc4412f9e110b77c5',
        ownerId: 'usr-admin-01',
        quantity: 1,
        currentPriceUsd: 145000,
        buyPriceUsd: 120000,
        allocationPercentage: 38.5,
        pnlPercentage: 20.83,
        marketValueUsd: 145000,
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200',
        isFavorite: true,
        blockNumber: 2345678,
        createdAt: new Date('2026-04-10T12:00:00Z'),
      },
      {
        id: 'ast-02',
        name: 'Avionics Cryptographic Module NFT',
        symbol: 'BEL-AV-09',
        category: 'TOKENIZED_DEFENSE_HARDWARE',
        tokenId: '#0987',
        contractAddress: '0x99a014bcfe8192305a4d91280bce491028347102',
        ownerId: 'usr-admin-01',
        quantity: 1,
        currentPriceUsd: 92000,
        buyPriceUsd: 85000,
        allocationPercentage: 24.5,
        pnlPercentage: 8.24,
        marketValueUsd: 92000,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200',
        isFavorite: true,
        blockNumber: 2345610,
        createdAt: new Date('2026-05-18T15:30:00Z'),
      },
      {
        id: 'ast-03',
        name: 'BEL Sovereign Stable Trust Token',
        symbol: 'bUSD',
        category: 'STABLECOIN',
        tokenId: 'FUNGIBLE',
        contractAddress: '0x1a72b94dc83f120e8a7199c08d3e210fa65e9b81',
        ownerId: 'usr-admin-01',
        quantity: 140000,
        currentPriceUsd: 1.0,
        buyPriceUsd: 1.0,
        allocationPercentage: 37.0,
        pnlPercentage: 0.0,
        marketValueUsd: 140000,
        image: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=200',
        isFavorite: false,
        blockNumber: 2340000,
        createdAt: new Date('2026-01-20T10:00:00Z'),
      },
    ];

    this.transactions = [
      {
        id: 'tx-01',
        hash: '0x8f3c4e9b21a8d76e053a992bc4412f9e110b77c5d41a9923',
        blockNumber: 2345678,
        fromAddress: '0x0000000000000000000000000000000000000000',
        toAddress: '0x7f82c4412f9e110b77c5d41a99b21a8d76e0a3b9',
        assetId: 'ast-01',
        amount: 1,
        usdValue: 145000,
        feeEth: 0.00042,
        gasUsed: 42150,
        gasPriceGwei: 20,
        type: 'MINT',
        status: 'SUCCESS',
        network: 'BEL Sovereign Testnet',
        timestamp: new Date('2026-08-24T10:55:00Z'),
        memo: 'Minted Defense Radar NFT #1024 for Bharat Electronics Limited',
      },
      {
        id: 'tx-02',
        hash: '0x1a72b94dc83f120e8a7199c08d3e210fa65e9b817c223a88',
        blockNumber: 2345670,
        fromAddress: '0x7f82c4412f9e110b77c5d41a99b21a8d76e0a3b9',
        toAddress: '0x33b81920acdef8719204918239014abcef981023',
        assetId: 'ast-02',
        amount: 1,
        usdValue: 92000,
        feeEth: 0.00021,
        gasUsed: 21000,
        gasPriceGwei: 20,
        type: 'TRANSFER',
        status: 'SUCCESS',
        network: 'BEL Sovereign Testnet',
        timestamp: new Date('2026-08-24T09:40:00Z'),
        memo: 'Authorized custody handover to Engineering Station',
      },
      {
        id: 'tx-03',
        hash: '0x43e098dfba21049bc871239aa8e104f65c19280d9e8311aa',
        blockNumber: 2345650,
        fromAddress: '0x33b81920acdef8719204918239014abcef981023',
        toAddress: '0x7f82c4412f9e110b77c5d41a99b21a8d76e0a3b9',
        amount: 5000,
        usdValue: 5000,
        feeEth: 0.00021,
        gasUsed: 21000,
        gasPriceGwei: 20,
        type: 'SWAP',
        status: 'SUCCESS',
        network: 'BEL Sovereign Testnet',
        timestamp: new Date('2026-08-23T18:20:00Z'),
        memo: 'Rebalanced liquidity pool for testing gas fees',
      },
    ];

    this.notifications = [
      {
        id: 'notif-01',
        userId: 'usr-admin-01',
        title: 'New Hardware Certificate Minted',
        message: 'Certificate NFT #1024 was issued to Rahul Verma on BEL Sovereign Testnet.',
        type: 'ASSET_MINTED',
        isRead: false,
        createdAt: new Date('2026-08-24T10:55:00Z'),
      },
      {
        id: 'notif-02',
        userId: 'usr-admin-01',
        title: 'Role Authorization Assigned',
        message: 'Role "Engineer" was successfully assigned to Neha Gupta.',
        type: 'ROLE_CHANGED',
        isRead: false,
        createdAt: new Date('2026-08-24T09:00:00Z'),
      },
      {
        id: 'notif-03',
        userId: 'usr-admin-01',
        title: 'SOC-2 Audit Proof Sealed',
        message: 'Daily ledger integrity verified with Merkle root inclusion at block #2,345,678.',
        type: 'AUDIT_TRIGGER',
        isRead: true,
        createdAt: new Date('2026-08-24T06:00:00Z'),
      },
    ];

    this.auditLogs = [
      {
        id: 'aud-01',
        userId: 'usr-admin-01',
        action: 'ASSET_MINTED',
        entity: 'Asset',
        entityId: 'ast-01',
        details: 'Minted Defense Radar Sensor NFT #1024 with zero-knowledge proof.',
        ipAddress: '10.200.1.45',
        status: 'SUCCESS',
        timestamp: new Date('2026-08-24T10:55:00Z'),
        blockHeight: 2345678,
        cryptographicHash: '0x8f3c4e9b21a8d76e053a992bc4412f9e110b77c5d41a99',
      },
      {
        id: 'aud-02',
        userId: 'usr-admin-01',
        action: 'ROLE_ASSIGNED',
        entity: 'User',
        entityId: 'usr-eng-02',
        details: 'Role Engineer granted to Neha Gupta (did:bel:4a11c899bc019283).',
        ipAddress: '10.200.1.45',
        status: 'SUCCESS',
        timestamp: new Date('2026-08-24T09:00:00Z'),
        blockHeight: 2345665,
        cryptographicHash: '0x1a72b94dc83f120e8a7199c08d3e210fa65e9b817c223a',
      },
    ];
  }
}

export const dbStore = new MockDataStore();
