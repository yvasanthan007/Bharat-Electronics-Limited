export interface ContractFunctionInput {
  name: string;
  type: string;
  placeholder?: string;
  defaultValue?: string;
}

export interface ContractFunction {
  name: string;
  signature: string;
  type: 'read' | 'write';
  accessLevel: 'Public' | 'Admin' | 'Owner' | 'Authorized Role';
  lastCalled: string;
  callsCount: number;
  description: string;
  inputs: ContractFunctionInput[];
  returnType?: string;
}

export interface ContractActivity {
  txHash: string;
  functionName: string;
  caller: string;
  callerAddress: string;
  timestamp: string;
  gasUsed: string;
  status: 'Success' | 'Failed';
}

export interface SmartContractItem {
  id: string;
  name: string;
  symbol: string;
  type: 'Identity' | 'Access Control' | 'Digital Asset' | 'Certificate' | 'Transaction' | 'Governance';
  network: 'Ethereum' | 'Polygon' | 'BNB Chain' | 'BEL Testnet';
  chainId: number;
  address: string;
  version: string;
  verification: {
    status: 'Verified' | 'Unverified';
    sourceVerified: boolean;
    abiAvailable: boolean;
    compiler: string;
    license: string;
    verifiedAt: string;
  };
  status: 'Active' | 'Paused' | 'Deprecated';
  transactionsCount: number;
  lastActivity: string;
  owner: string;
  ownerName: string;
  deployedAt: string;
  lastUpdated: string;
  description: string;
  security: {
    status: 'Healthy' | 'Warning' | 'Critical';
    checks: {
      label: string;
      passed: boolean;
      description: string;
    }[];
  };
  functions: ContractFunction[];
  recentActivity: ContractActivity[];
  chartData: {
    '7d': { name: string; value: number }[];
    '30d': { name: string; value: number }[];
    '90d': { name: string; value: number }[];
  };
}

export const contractStats = [
  {
    title: 'Total Contracts',
    value: '18',
    growth: '↑ 2 new',
    description: 'Across 4 supported networks',
    icon: 'Code2'
  },
  {
    title: 'Active Contracts',
    value: '15',
    growth: '83.3%',
    description: 'Operational & responsive',
    icon: 'CheckCircle2'
  },
  {
    title: 'Verified Contracts',
    value: '14',
    growth: '93.3%',
    description: 'Source code & ABI verified',
    icon: 'ShieldCheck'
  },
  {
    title: 'Transactions',
    value: '2,856',
    growth: '↑ 22.1%',
    description: 'Total on-chain contract calls',
    icon: 'Activity'
  }
];

export const contractsMock: SmartContractItem[] = [
  {
    id: 'CTR-001',
    name: 'IdentityRegistry',
    symbol: 'BEL-IDR',
    type: 'Identity',
    network: 'Ethereum',
    chainId: 1,
    address: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
    version: 'v1.4.2',
    verification: {
      status: 'Verified',
      sourceVerified: true,
      abiAvailable: true,
      compiler: 'v0.8.24+commit.e11b9ed9',
      license: 'MIT / Apache-2.0',
      verifiedAt: '2026-01-15 08:30 UTC'
    },
    status: 'Active',
    transactionsCount: 1248,
    lastActivity: '2 mins ago',
    owner: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
    ownerName: 'Rahul Verma (BEL Admin)',
    deployedAt: '2025-11-10 14:22 UTC',
    lastUpdated: '2026-08-24 11:18 UTC',
    description: 'Core decentralized identity registry managing W3C DID identifiers, public keys, and cryptographic verifiable credentials.',
    security: {
      status: 'Healthy',
      checks: [
        { label: 'Source Code Verified', passed: true, description: 'Bytecode matches Solidity 0.8.24 source code' },
        { label: 'Contract Address Verified', passed: true, description: 'Address registered on BEL Trust Ledger' },
        { label: 'Ownership Configured', passed: true, description: 'Admin multi-sig governance contract attached' },
        { label: 'Access Control Enabled', passed: true, description: 'Role-based access modifiers active' },
        { label: 'No Critical Alerts', passed: true, description: 'Zero high or critical vulnerability findings' }
      ]
    },
    functions: [
      {
        name: 'getIdentity',
        signature: 'getIdentity(bytes32 didHash)',
        type: 'read',
        accessLevel: 'Public',
        lastCalled: '2 mins ago',
        callsCount: 642,
        description: 'Returns DID metadata, public key, and active status for a given identifier.',
        inputs: [{ name: 'didHash', type: 'bytes32', placeholder: '0x7f8245...' }],
        returnType: '(string did, address owner, uint256 createdTime, bool active)'
      },
      {
        name: 'isAuthorized',
        signature: 'isAuthorized(address user, bytes32 role)',
        type: 'read',
        accessLevel: 'Public',
        lastCalled: '14 mins ago',
        callsCount: 388,
        description: 'Verifies whether a wallet address holds a specific active credential role.',
        inputs: [
          { name: 'user', type: 'address', placeholder: '0x3a4b9c...' },
          { name: 'role', type: 'bytes32', placeholder: '0x88bb19...' }
        ],
        returnType: 'bool authorized'
      },
      {
        name: 'createIdentity',
        signature: 'createIdentity(string did, address subject, bytes pubKey)',
        type: 'write',
        accessLevel: 'Admin',
        lastCalled: '4 hours ago',
        callsCount: 142,
        description: 'Mints a new trusted DID onto the ledger and binds cryptographic identity keys.',
        inputs: [
          { name: 'did', type: 'string', placeholder: 'did:bel:engineer:009' },
          { name: 'subject', type: 'address', placeholder: '0x3a4b9c1d2e...' },
          { name: 'pubKey', type: 'bytes', placeholder: '0x048172...' }
        ]
      },
      {
        name: 'revokeIdentity',
        signature: 'revokeIdentity(bytes32 didHash, string reason)',
        type: 'write',
        accessLevel: 'Admin',
        lastCalled: '3 days ago',
        callsCount: 14,
        description: 'Immediately disables an active DID identifier and cascades access revocation.',
        inputs: [
          { name: 'didHash', type: 'bytes32', placeholder: '0x7f8245...' },
          { name: 'reason', type: 'string', placeholder: 'Credential Decommission' }
        ]
      }
    ],
    recentActivity: [
      {
        txHash: '0x7f82e145b23049102cfa98b1049281a8f901a3b9',
        functionName: 'createIdentity()',
        caller: 'Rahul Verma',
        callerAddress: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
        timestamp: '2 mins ago',
        gasUsed: '48,210 gas',
        status: 'Success'
      },
      {
        txHash: '0x44ee8812bb9930129fec88102391023910283910',
        functionName: 'getIdentity()',
        caller: 'Neha Gupta',
        callerAddress: '0x3a4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
        timestamp: '15 mins ago',
        gasUsed: '24,100 gas',
        status: 'Success'
      },
      {
        txHash: '0x22ab881920391029381029381029381029381029',
        functionName: 'isAuthorized()',
        caller: 'Priya Singh',
        callerAddress: '0x91ac3b290145ef20a7b05612c892fa4df82d5510',
        timestamp: '1 hour ago',
        gasUsed: '21,500 gas',
        status: 'Success'
      }
    ],
    chartData: {
      '7d': [
        { name: 'Mon', value: 180 },
        { name: 'Tue', value: 145 },
        { name: 'Wed', value: 210 },
        { name: 'Thu', value: 195 },
        { name: 'Fri', value: 260 },
        { name: 'Sat', value: 120 },
        { name: 'Sun', value: 138 }
      ],
      '30d': [
        { name: 'Week 1', value: 890 },
        { name: 'Week 2', value: 1040 },
        { name: 'Week 3', value: 1180 },
        { name: 'Week 4', value: 1248 }
      ],
      '90d': [
        { name: 'Month 1', value: 2450 },
        { name: 'Month 2', value: 3120 },
        { name: 'Month 3', value: 3680 }
      ]
    }
  },
  {
    id: 'CTR-002',
    name: 'AccessControl',
    symbol: 'BEL-ACL',
    type: 'Access Control',
    network: 'Polygon',
    chainId: 137,
    address: '0x91ac3b290145ef20a7b05612c892fa4df82d5510',
    version: 'v2.1.0',
    verification: {
      status: 'Verified',
      sourceVerified: true,
      abiAvailable: true,
      compiler: 'v0.8.24+commit.e11b9ed9',
      license: 'MIT',
      verifiedAt: '2026-02-01 11:15 UTC'
    },
    status: 'Active',
    transactionsCount: 892,
    lastActivity: '15 mins ago',
    owner: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
    ownerName: 'Rahul Verma (BEL Admin)',
    deployedAt: '2025-12-05 09:10 UTC',
    lastUpdated: '2026-08-24 11:05 UTC',
    description: 'Fine-grained Role-Based Access Control (RBAC) smart contract enforcing permission trees and multi-signature authorization.',
    security: {
      status: 'Healthy',
      checks: [
        { label: 'Source Code Verified', passed: true, description: 'Verified on Polygonscan' },
        { label: 'Contract Address Verified', passed: true, description: 'Canonical access registry' },
        { label: 'Ownership Configured', passed: true, description: 'Multi-Admin Timelock Active' },
        { label: 'Access Control Enabled', passed: true, description: 'Strict OpenZeppelin RBAC v5.0' },
        { label: 'No Critical Alerts', passed: true, description: 'Zero audit flags' }
      ]
    },
    functions: [
      {
        name: 'getRole',
        signature: 'getRole(address user)',
        type: 'read',
        accessLevel: 'Public',
        lastCalled: '15 mins ago',
        callsCount: 420,
        description: 'Fetches role bitmask and active delegations for a given wallet address.',
        inputs: [{ name: 'user', type: 'address', placeholder: '0x91ac3b...' }],
        returnType: 'bytes32 roleId, uint256 expiresAt'
      },
      {
        name: 'assignRole',
        signature: 'assignRole(bytes32 role, address account)',
        type: 'write',
        accessLevel: 'Admin',
        lastCalled: '2 mins ago',
        callsCount: 198,
        description: 'Assigns an enterprise security role to a verified wallet address.',
        inputs: [
          { name: 'role', type: 'bytes32', placeholder: 'ROLE_ENGINEER' },
          { name: 'account', type: 'address', placeholder: '0x3a4b9c1d2e...' }
        ]
      },
      {
        name: 'revokeRole',
        signature: 'revokeRole(bytes32 role, address account)',
        type: 'write',
        accessLevel: 'Admin',
        lastCalled: '7 hours ago',
        callsCount: 45,
        description: 'Revokes a security role from an account and flushes permission cache.',
        inputs: [
          { name: 'role', type: 'bytes32', placeholder: 'ROLE_TEMP_ADMIN' },
          { name: 'account', type: 'address', placeholder: '0x3a4b9c1d2e...' }
        ]
      }
    ],
    recentActivity: [
      {
        txHash: '0x7f82e145b23049102cfa98b1049281a8f901a3b9',
        functionName: 'assignRole()',
        caller: 'Rahul Verma',
        callerAddress: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
        timestamp: '2 mins ago',
        gasUsed: '52,481 gas',
        status: 'Success'
      },
      {
        txHash: '0x91ac772183902184918293810293810928301928f82d',
        functionName: 'getRole()',
        caller: 'Priya Singh',
        callerAddress: '0x91ac3b290145ef20a7b05612c892fa4df82d5510',
        timestamp: '15 mins ago',
        gasUsed: '19,800 gas',
        status: 'Success'
      }
    ],
    chartData: {
      '7d': [
        { name: 'Mon', value: 90 },
        { name: 'Tue', value: 120 },
        { name: 'Wed', value: 160 },
        { name: 'Thu', value: 140 },
        { name: 'Fri', value: 190 },
        { name: 'Sat', value: 80 },
        { name: 'Sun', value: 112 }
      ],
      '30d': [
        { name: 'Week 1', value: 620 },
        { name: 'Week 2', value: 740 },
        { name: 'Week 3', value: 810 },
        { name: 'Week 4', value: 892 }
      ],
      '90d': [
        { name: 'Month 1', value: 1800 },
        { name: 'Month 2', value: 2100 },
        { name: 'Month 3', value: 2580 }
      ]
    }
  },
  {
    id: 'CTR-003',
    name: 'AssetRegistry',
    symbol: 'BEL-AST',
    type: 'Digital Asset',
    network: 'Ethereum',
    chainId: 1,
    address: '0x32bf901c56ab81d3940176ef8120bcde19ac7721',
    version: 'v1.8.3',
    verification: {
      status: 'Verified',
      sourceVerified: true,
      abiAvailable: true,
      compiler: 'v0.8.24+commit.e11b9ed9',
      license: 'Apache-2.0',
      verifiedAt: '2026-01-20 16:40 UTC'
    },
    status: 'Active',
    transactionsCount: 536,
    lastActivity: '1 hour ago',
    owner: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
    ownerName: 'Rahul Verma (BEL Admin)',
    deployedAt: '2026-01-02 12:00 UTC',
    lastUpdated: '2026-08-24 10:20 UTC',
    description: 'Enterprise asset tokenization registry adhering to ERC-721 and ERC-1155 standards for defense hardware, equipment, and digital certificates.',
    security: {
      status: 'Healthy',
      checks: [
        { label: 'Source Code Verified', passed: true, description: 'Verified on Etherscan' },
        { label: 'Contract Address Verified', passed: true, description: 'Official BEL Asset Tokenizer' },
        { label: 'Ownership Configured', passed: true, description: 'Multi-Sig Escrow Active' },
        { label: 'Access Control Enabled', passed: true, description: 'Minter & Burner roles enforced' },
        { label: 'No Critical Alerts', passed: true, description: 'Passed CertiK security scan' }
      ]
    },
    functions: [
      {
        name: 'getAsset',
        signature: 'getAsset(uint256 tokenId)',
        type: 'read',
        accessLevel: 'Public',
        lastCalled: '1 hour ago',
        callsCount: 310,
        description: 'Retrieves asset metadata, current custodian, batch serial, and provenance trail.',
        inputs: [{ name: 'tokenId', type: 'uint256', placeholder: '1024' }],
        returnType: '(string uri, address holder, uint256 mintedTime, string serial)'
      },
      {
        name: 'issueAsset',
        signature: 'issueAsset(address to, uint256 tokenId, string uri)',
        type: 'write',
        accessLevel: 'Admin',
        lastCalled: '2 mins ago',
        callsCount: 120,
        description: 'Mints and assigns a certified defense asset NFT to a verified personnel wallet.',
        inputs: [
          { name: 'to', type: 'address', placeholder: '0x7f8245...' },
          { name: 'tokenId', type: 'uint256', placeholder: '1024' },
          { name: 'uri', type: 'string', placeholder: 'ipfs://bafybeicg...' }
        ]
      },
      {
        name: 'transferAsset',
        signature: 'transferAsset(address from, address to, uint256 tokenId)',
        type: 'write',
        accessLevel: 'Authorized Role',
        lastCalled: '1 hour ago',
        callsCount: 95,
        description: 'Transfers asset custody with cryptographic chain of custody verification.',
        inputs: [
          { name: 'from', type: 'address', placeholder: '0x91ac3b...' },
          { name: 'to', type: 'address', placeholder: '0x55aa31...' },
          { name: 'tokenId', type: 'uint256', placeholder: '0987' }
        ]
      }
    ],
    recentActivity: [
      {
        txHash: '0x91ac772183902184918293810293810928301928f82d',
        functionName: 'transferAsset()',
        caller: 'Priya Singh',
        callerAddress: '0x91ac3b290145ef20a7b05612c892fa4df82d5510',
        timestamp: '1 hour ago',
        gasUsed: '32,100 gas',
        status: 'Success'
      },
      {
        txHash: '0xaa12830192830192830192830192830192830192',
        functionName: 'issueAsset()',
        caller: 'Rahul Verma',
        callerAddress: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
        timestamp: '11 hours ago',
        gasUsed: '45,100 gas',
        status: 'Success'
      }
    ],
    chartData: {
      '7d': [
        { name: 'Mon', value: 60 },
        { name: 'Tue', value: 75 },
        { name: 'Wed', value: 90 },
        { name: 'Thu', value: 85 },
        { name: 'Fri', value: 110 },
        { name: 'Sat', value: 50 },
        { name: 'Sun', value: 66 }
      ],
      '30d': [
        { name: 'Week 1', value: 380 },
        { name: 'Week 2', value: 430 },
        { name: 'Week 3', value: 490 },
        { name: 'Week 4', value: 536 }
      ],
      '90d': [
        { name: 'Month 1', value: 1200 },
        { name: 'Month 2', value: 1450 },
        { name: 'Month 3', value: 1680 }
      ]
    }
  },
  {
    id: 'CTR-004',
    name: 'CertificateNFT',
    symbol: 'BEL-CERT',
    type: 'Certificate',
    network: 'BNB Chain',
    chainId: 56,
    address: '0x55aa31f99c82410a82b400921f57cd4399e82103',
    version: 'v1.0.1',
    verification: {
      status: 'Verified',
      sourceVerified: true,
      abiAvailable: true,
      compiler: 'v0.8.20+commit.a1b79de6',
      license: 'MIT',
      verifiedAt: '2026-02-14 10:00 UTC'
    },
    status: 'Active',
    transactionsCount: 114,
    lastActivity: '3 hours ago',
    owner: '0x55aa31f99c82410a82b400921f57cd4399e82103',
    ownerName: 'Amit Kumar (Auditor)',
    deployedAt: '2026-02-10 14:00 UTC',
    lastUpdated: '2026-08-24 08:50 UTC',
    description: 'Soulbound Non-Transferable Token (SBT) registry for defense training certifications and security accreditations.',
    security: {
      status: 'Healthy',
      checks: [
        { label: 'Source Code Verified', passed: true, description: 'Verified on BscScan' },
        { label: 'Contract Address Verified', passed: true, description: 'Accreditation Authority Linked' },
        { label: 'Ownership Configured', passed: true, description: 'Auditor Multi-Sig' },
        { label: 'Access Control Enabled', passed: true, description: 'Soulbound EIP-5192 compliant' },
        { label: 'No Critical Alerts', passed: true, description: 'Zero vulnerabilities' }
      ]
    },
    functions: [
      {
        name: 'isLocked',
        signature: 'isLocked(uint256 tokenId)',
        type: 'read',
        accessLevel: 'Public',
        lastCalled: '3 hours ago',
        callsCount: 88,
        description: 'Checks whether a certificate is soulbound and cannot be transferred.',
        inputs: [{ name: 'tokenId', type: 'uint256', placeholder: '509' }],
        returnType: 'bool locked'
      },
      {
        name: 'issueCertificate',
        signature: 'issueCertificate(address recipient, string certDataHash)',
        type: 'write',
        accessLevel: 'Admin',
        lastCalled: '11 hours ago',
        callsCount: 26,
        description: 'Issues a soulbound accreditation credential.',
        inputs: [
          { name: 'recipient', type: 'address', placeholder: '0x3a4b9c...' },
          { name: 'certDataHash', type: 'string', placeholder: 'ipfs://bafycert...' }
        ]
      }
    ],
    recentActivity: [
      {
        txHash: '0x55aa31f99c82410a82b400921f57cd4399e82103',
        functionName: 'isLocked()',
        caller: 'Amit Kumar',
        callerAddress: '0x55aa31f99c82410a82b400921f57cd4399e82103',
        timestamp: '3 hours ago',
        gasUsed: '21,000 gas',
        status: 'Success'
      }
    ],
    chartData: {
      '7d': [
        { name: 'Mon', value: 12 },
        { name: 'Tue', value: 18 },
        { name: 'Wed', value: 22 },
        { name: 'Thu', value: 19 },
        { name: 'Fri', value: 25 },
        { name: 'Sat', value: 8 },
        { name: 'Sun', value: 10 }
      ],
      '30d': [
        { name: 'Week 1', value: 75 },
        { name: 'Week 2', value: 90 },
        { name: 'Week 3', value: 105 },
        { name: 'Week 4', value: 114 }
      ],
      '90d': [
        { name: 'Month 1', value: 220 },
        { name: 'Month 2', value: 310 },
        { name: 'Month 3', value: 410 }
      ]
    }
  },
  {
    id: 'CTR-005',
    name: 'GovernanceVoting',
    symbol: 'BEL-GOV',
    type: 'Governance',
    network: 'Ethereum',
    chainId: 1,
    address: '0x11cc9832aa012356ff4421aa871092ef5531b992',
    version: 'v1.1.0',
    verification: {
      status: 'Verified',
      sourceVerified: true,
      abiAvailable: true,
      compiler: 'v0.8.24+commit.e11b9ed9',
      license: 'MIT',
      verifiedAt: '2026-08-24 05:00 UTC'
    },
    status: 'Active',
    transactionsCount: 66,
    lastActivity: '5 hours ago',
    owner: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
    ownerName: 'Rahul Verma (BEL Admin)',
    deployedAt: '2026-08-24 05:00 UTC',
    lastUpdated: '2026-08-24 09:15 UTC',
    description: 'Decentralized multi-sig voting engine for architectural parameter modifications, smart contract upgrades, and emergency stops.',
    security: {
      status: 'Healthy',
      checks: [
        { label: 'Source Code Verified', passed: true, description: 'Verified on Etherscan' },
        { label: 'Contract Address Verified', passed: true, description: 'BEL Council Multi-Sig Linked' },
        { label: 'Ownership Configured', passed: true, description: '3-of-5 threshold required' },
        { label: 'Access Control Enabled', passed: true, description: 'Timelock Controller Enabled' },
        { label: 'No Critical Alerts', passed: true, description: 'OpenZeppelin Governor v5.0' }
      ]
    },
    functions: [
      {
        name: 'getProposalStatus',
        signature: 'getProposalStatus(uint256 proposalId)',
        type: 'read',
        accessLevel: 'Public',
        lastCalled: '5 hours ago',
        callsCount: 42,
        description: 'Returns the current voting quorum, votes in favor, and timelock state.',
        inputs: [{ name: 'proposalId', type: 'uint256', placeholder: '101' }],
        returnType: '(uint8 state, uint256 forVotes, uint256 againstVotes)'
      },
      {
        name: 'submitVote',
        signature: 'submitVote(uint256 proposalId, uint8 support, bytes signature)',
        type: 'write',
        accessLevel: 'Authorized Role',
        lastCalled: '6 hours ago',
        callsCount: 24,
        description: 'Submits a cryptographic governance signature for active platform proposals.',
        inputs: [
          { name: 'proposalId', type: 'uint256', placeholder: '101' },
          { name: 'support', type: 'uint8', placeholder: '1 (For)' },
          { name: 'signature', type: 'bytes', placeholder: '0x88ac...' }
        ]
      }
    ],
    recentActivity: [
      {
        txHash: '0x11cc9832aa012356ff4421aa871092ef5531b992',
        functionName: 'submitVote()',
        caller: 'Rahul Verma',
        callerAddress: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
        timestamp: '5 hours ago',
        gasUsed: '68,400 gas',
        status: 'Success'
      }
    ],
    chartData: {
      '7d': [
        { name: 'Mon', value: 8 },
        { name: 'Tue', value: 12 },
        { name: 'Wed', value: 10 },
        { name: 'Thu', value: 15 },
        { name: 'Fri', value: 14 },
        { name: 'Sat', value: 4 },
        { name: 'Sun', value: 3 }
      ],
      '30d': [
        { name: 'Week 1', value: 30 },
        { name: 'Week 2', value: 45 },
        { name: 'Week 3', value: 58 },
        { name: 'Week 4', value: 66 }
      ],
      '90d': [
        { name: 'Month 1', value: 90 },
        { name: 'Month 2', value: 140 },
        { name: 'Month 3', value: 200 }
      ]
    }
  },
  {
    id: 'CTR-006',
    name: 'AuditLogger',
    symbol: 'BEL-AUD',
    type: 'Transaction',
    network: 'BEL Testnet',
    chainId: 2026,
    address: '0x44ee8812bb9930129fec88102391023910283910',
    version: 'v2.0.0',
    verification: {
      status: 'Verified',
      sourceVerified: true,
      abiAvailable: true,
      compiler: 'v0.8.24+commit.e11b9ed9',
      license: 'Apache-2.0',
      verifiedAt: '2026-03-01 09:00 UTC'
    },
    status: 'Active',
    transactionsCount: 2856,
    lastActivity: '10 mins ago',
    owner: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
    ownerName: 'Rahul Verma (BEL Admin)',
    deployedAt: '2025-10-15 08:00 UTC',
    lastUpdated: '2026-08-24 11:18 UTC',
    description: 'Tamper-proof on-chain event sequencer writing SHA-256 / Keccak-256 Merkle root hashes for continuous compliance tracking.',
    security: {
      status: 'Healthy',
      checks: [
        { label: 'Source Code Verified', passed: true, description: 'Verified on BEL Explorer' },
        { label: 'Contract Address Verified', passed: true, description: 'Core Security Component' },
        { label: 'Ownership Configured', passed: true, description: 'Immutable Validator Set' },
        { label: 'Access Control Enabled', passed: true, description: 'Append-Only Ledger Logic' },
        { label: 'No Critical Alerts', passed: true, description: 'Formal verification passed' }
      ]
    },
    functions: [
      {
        name: 'verifyEventHash',
        signature: 'verifyEventHash(bytes32 eventHash, uint256 blockNo)',
        type: 'read',
        accessLevel: 'Public',
        lastCalled: '10 mins ago',
        callsCount: 1840,
        description: 'Validates whether an event hash is part of the verified on-chain Merkle tree.',
        inputs: [
          { name: 'eventHash', type: 'bytes32', placeholder: '0x3b8219...' },
          { name: 'blockNo', type: 'uint256', placeholder: '2489102' }
        ],
        returnType: 'bool isTamperProof'
      },
      {
        name: 'logEventRoot',
        signature: 'logEventRoot(bytes32 rootHash, uint256 batchSize)',
        type: 'write',
        accessLevel: 'Admin',
        lastCalled: '2 hours ago',
        callsCount: 1016,
        description: 'Commits a batch Merkle state root to the on-chain audit tree.',
        inputs: [
          { name: 'rootHash', type: 'bytes32', placeholder: '0xa419e9...' },
          { name: 'batchSize', type: 'uint256', placeholder: '20' }
        ]
      }
    ],
    recentActivity: [
      {
        txHash: '0x44ee8812bb9930129fec88102391023910283910',
        functionName: 'verifyEventHash()',
        caller: 'Smart Contract',
        callerAddress: '0x91ac3b290145ef20a7b05612c892fa4df82d5510',
        timestamp: '10 mins ago',
        gasUsed: '14,200 gas',
        status: 'Success'
      }
    ],
    chartData: {
      '7d': [
        { name: 'Mon', value: 400 },
        { name: 'Tue', value: 300 },
        { name: 'Wed', value: 550 },
        { name: 'Thu', value: 450 },
        { name: 'Fri', value: 700 },
        { name: 'Sat', value: 200 },
        { name: 'Sun', value: 150 }
      ],
      '30d': [
        { name: 'Week 1', value: 2100 },
        { name: 'Week 2', value: 2400 },
        { name: 'Week 3', value: 2650 },
        { name: 'Week 4', value: 2856 }
      ],
      '90d': [
        { name: 'Month 1', value: 6500 },
        { name: 'Month 2', value: 7800 },
        { name: 'Month 3', value: 8900 }
      ]
    }
  },
  {
    id: 'CTR-007',
    name: 'TokenVault',
    symbol: 'BEL-VLT',
    type: 'Digital Asset',
    network: 'Polygon',
    chainId: 137,
    address: '0x88ac991029381029381029381029381029381029',
    version: 'v1.2.0',
    verification: {
      status: 'Verified',
      sourceVerified: true,
      abiAvailable: true,
      compiler: 'v0.8.24+commit.e11b9ed9',
      license: 'MIT',
      verifiedAt: '2026-02-18 14:20 UTC'
    },
    status: 'Paused',
    transactionsCount: 42,
    lastActivity: '2 days ago',
    owner: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
    ownerName: 'Rahul Verma (BEL Admin)',
    deployedAt: '2026-02-15 10:30 UTC',
    lastUpdated: '2026-08-22 14:00 UTC',
    description: 'Timelocked multi-sig escrow contract temporarily paused for routine annual security audit and key rotation.',
    security: {
      status: 'Warning',
      checks: [
        { label: 'Source Code Verified', passed: true, description: 'Verified on Polygonscan' },
        { label: 'Contract Address Verified', passed: true, description: 'Escrow vault match' },
        { label: 'Ownership Configured', passed: true, description: 'Paused state by Admin' },
        { label: 'Access Control Enabled', passed: true, description: 'Pausable OpenZeppelin module' },
        { label: 'No Critical Alerts', passed: false, description: 'Routine pause for scheduled key rotation' }
      ]
    },
    functions: [
      {
        name: 'getBalance',
        signature: 'getBalance(address token)',
        type: 'read',
        accessLevel: 'Public',
        lastCalled: '2 days ago',
        callsCount: 30,
        description: 'Returns escrowed token balances in vault.',
        inputs: [{ name: 'token', type: 'address', placeholder: '0x32bf...' }],
        returnType: 'uint256 balance'
      }
    ],
    recentActivity: [
      {
        txHash: '0x88ac991029381029381029381029381029381029',
        functionName: 'pause()',
        caller: 'Rahul Verma',
        callerAddress: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
        timestamp: '2 days ago',
        gasUsed: '28,100 gas',
        status: 'Success'
      }
    ],
    chartData: {
      '7d': [
        { name: 'Mon', value: 10 },
        { name: 'Tue', value: 14 },
        { name: 'Wed', value: 12 },
        { name: 'Thu', value: 4 },
        { name: 'Fri', value: 2 },
        { name: 'Sat', value: 0 },
        { name: 'Sun', value: 0 }
      ],
      '30d': [
        { name: 'Week 1', value: 28 },
        { name: 'Week 2', value: 36 },
        { name: 'Week 3', value: 42 },
        { name: 'Week 4', value: 42 }
      ],
      '90d': [
        { name: 'Month 1', value: 110 },
        { name: 'Month 2', value: 85 },
        { name: 'Month 3', value: 50 }
      ]
    }
  },
  {
    id: 'CTR-008',
    name: 'LegacyKeyManager',
    symbol: 'BEL-LKM',
    type: 'Access Control',
    network: 'Ethereum',
    chainId: 1,
    address: '0x0011223344556677889900aabbccddeeff001122',
    version: 'v0.9.1',
    verification: {
      status: 'Unverified',
      sourceVerified: false,
      abiAvailable: true,
      compiler: 'v0.7.6+commit.7338295f',
      license: 'None',
      verifiedAt: 'Legacy Deployed'
    },
    status: 'Deprecated',
    transactionsCount: 8,
    lastActivity: '45 days ago',
    owner: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
    ownerName: 'Rahul Verma (BEL Admin)',
    deployedAt: '2024-06-10 11:00 UTC',
    lastUpdated: '2026-07-10 12:00 UTC',
    description: 'Deprecated initial prototype key manager replaced by AccessControl v2.1.0. Maintained for historical auditing only.',
    security: {
      status: 'Warning',
      checks: [
        { label: 'Source Code Verified', passed: false, description: 'Legacy binary deployment' },
        { label: 'Contract Address Verified', passed: true, description: 'Matched in genesis manifest' },
        { label: 'Ownership Configured', passed: true, description: 'Locked by Admin' },
        { label: 'Access Control Enabled', passed: true, description: 'Decommissioned' },
        { label: 'No Critical Alerts', passed: true, description: 'No active funds held' }
      ]
    },
    functions: [],
    recentActivity: [],
    chartData: {
      '7d': [
        { name: 'Mon', value: 0 },
        { name: 'Tue', value: 0 },
        { name: 'Wed', value: 0 },
        { name: 'Thu', value: 0 },
        { name: 'Fri', value: 0 },
        { name: 'Sat', value: 0 },
        { name: 'Sun', value: 0 }
      ],
      '30d': [
        { name: 'Week 1', value: 2 },
        { name: 'Week 2', value: 4 },
        { name: 'Week 3', value: 6 },
        { name: 'Week 4', value: 8 }
      ],
      '90d': [
        { name: 'Month 1', value: 12 },
        { name: 'Month 2', value: 10 },
        { name: 'Month 3', value: 8 }
      ]
    }
  }
];

export const contractStatusFilterOptions = [
  'All Statuses',
  'Active',
  'Paused',
  'Deprecated'
];

export const contractNetworkFilterOptions = [
  'All Networks',
  'Ethereum',
  'Polygon',
  'BNB Chain',
  'BEL Testnet'
];

export const contractVerificationFilterOptions = [
  'All Verification',
  'Verified',
  'Unverified'
];

export const contractTypeFilterOptions = [
  'All Types',
  'Identity',
  'Access Control',
  'Digital Asset',
  'Certificate',
  'Transaction',
  'Governance'
];
