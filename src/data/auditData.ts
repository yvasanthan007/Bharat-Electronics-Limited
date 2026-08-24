export interface ActorInfo {
  name: string;
  role: string;
  address: string;
  ip: string;
  device: string;
  avatarBg?: string;
  avatarText?: string;
}

export interface ResourceInfo {
  name: string;
  type: string;
  id: string;
}

export interface IntegrityProof {
  verified: boolean;
  blockNumber: string;
  gasUsed: string;
  txHash: string;
  prevEventHash: string;
  currEventHash: string;
  algorithm: string;
  network: string;
}

export interface AuditLogEvent {
  id: string;
  eventNumber: number;
  actor: ActorInfo;
  action: string;
  eventType: string;
  resource: ResourceInfo;
  network: 'Ethereum' | 'Polygon' | 'BNB Chain' | 'BEL Testnet' | 'Internal';
  timestamp: string;
  timeAgo: string;
  status: 'Success' | 'Failed' | 'Pending' | 'Warning';
  txHash?: string;
  integrity: IntegrityProof;
  prevState?: Record<string, any>;
  newState?: Record<string, any>;
  metadata: Record<string, any>;
}

export const auditStats = [
  {
    title: 'Total Events',
    value: '18,642',
    growth: '↑ 14.8%',
    description: 'Lifetime platform events',
    icon: 'FileText'
  },
  {
    title: "Today's Events",
    value: '428',
    growth: '↑ 9.2%',
    description: 'Logged in the last 24 hours',
    icon: 'Activity'
  },
  {
    title: 'Blockchain Events',
    value: '7,284',
    growth: '↑ 24.1%',
    description: 'Verified on-chain transactions',
    icon: 'ShieldCheck'
  },
  {
    title: 'Security Alerts',
    value: '12',
    growth: '↓ 3.4%',
    description: 'Requires admin attention',
    icon: 'AlertTriangle'
  }
];

export const auditEventsMock: AuditLogEvent[] = [
  {
    id: 'EVT-008421',
    eventNumber: 8421,
    actor: {
      name: 'Rahul Verma',
      role: 'Administrator',
      address: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
      ip: '192.168.10.45',
      device: 'Chrome 124.0 (macOS)',
      avatarBg: 'bg-blue-100 text-blue-700',
      avatarText: 'RV'
    },
    action: 'Asset Issued',
    eventType: 'Asset Issued',
    resource: {
      name: 'Certificate NFT #1024',
      type: 'Digital Asset',
      id: 'NFT-1024-BEL'
    },
    network: 'Ethereum',
    timestamp: '2026-08-24 11:18:22 UTC',
    timeAgo: '2 mins ago',
    status: 'Success',
    txHash: '0x7f82e145b23049102cfa98b1049281a8f901a3b9',
    integrity: {
      verified: true,
      blockNumber: '#2489102',
      gasUsed: '48,210 gas (0.0014 ETH)',
      txHash: '0x7f82e145b23049102cfa98b1049281a8f901a3b9',
      prevEventHash: '0xa419e918237bfcd8991204918230192840192481029381029381902830192830',
      currEventHash: '0x3b82190382910481092830192830192830192830192830192830192830192831',
      algorithm: 'Keccak-256 (EVM Compatible)',
      network: 'Ethereum Mainnet'
    },
    prevState: {
      status: 'Unminted',
      owner: null,
      tokenId: null
    },
    newState: {
      status: 'Minted & Assigned',
      owner: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
      tokenId: 1024,
      metadataURI: 'ipfs://bafybeicg.../1024.json'
    },
    metadata: {
      standard: 'ERC-721',
      contractAddress: '0x32bf901c56ab81d3940176ef8120bcde19ac7721',
      issuer: 'BEL Trust Authority',
      verificationMethod: 'Multi-Sig Consensus'
    }
  },
  {
    id: 'EVT-008420',
    eventNumber: 8420,
    actor: {
      name: 'Neha Gupta',
      role: 'Manager',
      address: '0x3a4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
      ip: '192.168.10.112',
      device: 'Firefox 125.0 (Windows 11)',
      avatarBg: 'bg-emerald-100 text-emerald-700',
      avatarText: 'NG'
    },
    action: 'Role Assigned',
    eventType: 'Role Assigned',
    resource: {
      name: 'Engineer Role',
      type: 'Role / Permission',
      id: 'ROLE_ENGINEER_L2'
    },
    network: 'Internal',
    timestamp: '2026-08-24 11:05:10 UTC',
    timeAgo: '15 mins ago',
    status: 'Success',
    integrity: {
      verified: true,
      blockNumber: 'State-Tree #8420',
      gasUsed: 'N/A (Off-chain Log)',
      txHash: '0x88bb192301928301928301928301928301928301928301928301928301928302',
      prevEventHash: '0x7128930192830192830192830192830192830192830192830192830192830193',
      currEventHash: '0xa419e918237bfcd8991204918230192840192481029381029381902830192830',
      algorithm: 'SHA-256 Merkle Leaf',
      network: 'BEL Internal Trust Ledger'
    },
    prevState: {
      roles: ['User']
    },
    newState: {
      roles: ['User', 'Engineer']
    },
    metadata: {
      approvedBy: 'Admin (Rahul Verma)',
      justification: 'Project Atlas Onboarding',
      scope: 'Engineering & Defense Systems'
    }
  },
  {
    id: 'EVT-008419',
    eventNumber: 8419,
    actor: {
      name: 'Priya Singh',
      role: 'Staff Engineer',
      address: '0x91ac3b290145ef20a7b05612c892fa4df82d5510',
      ip: '10.0.4.18',
      device: 'Safari 17.4 (macOS)',
      avatarBg: 'bg-purple-100 text-purple-700',
      avatarText: 'PS'
    },
    action: 'Asset Transfer',
    eventType: 'Asset Transferred',
    resource: {
      name: 'NFT #0987',
      type: 'Digital Asset',
      id: 'NFT-0987-BEL'
    },
    network: 'Polygon',
    timestamp: '2026-08-24 10:20:45 UTC',
    timeAgo: '1 hour ago',
    status: 'Success',
    txHash: '0x91ac772183902184918293810293810928301928f82d',
    integrity: {
      verified: true,
      blockNumber: '#58912401',
      gasUsed: '32,100 gas (0.0008 MATIC)',
      txHash: '0x91ac772183902184918293810293810928301928f82d',
      prevEventHash: '0x1290381092380192830192830192830192830192830192830192830192830194',
      currEventHash: '0x7128930192830192830192830192830192830192830192830192830192830193',
      algorithm: 'Keccak-256 (Polygon POS)',
      network: 'Polygon POS'
    },
    prevState: {
      currentHolder: '0x91ac3b290145ef20a7b05612c892fa4df82d5510 (Priya Singh)'
    },
    newState: {
      currentHolder: '0x55aa31f99c82410a82b400921f57cd4399e82103 (Amit Kumar)'
    },
    metadata: {
      transferReason: 'Departmental Equipment Handover',
      escrowReleased: true
    }
  },
  {
    id: 'EVT-008418',
    eventNumber: 8418,
    actor: {
      name: 'Smart Contract',
      role: 'Automated Bot',
      address: '0x91ac3b290145ef20a7b05612c892fa4df82d5510',
      ip: '127.0.0.1 (Node daemon)',
      device: 'Go-Ethereum RPC Worker',
      avatarBg: 'bg-slate-100 text-slate-700',
      avatarText: 'SC'
    },
    action: 'Contract Call',
    eventType: 'Contract Called',
    resource: {
      name: 'AccessControl.sol',
      type: 'Smart Contract',
      id: '0x91ac...f82d'
    },
    network: 'Ethereum',
    timestamp: '2026-08-24 09:15:30 UTC',
    timeAgo: '2 hours ago',
    status: 'Success',
    txHash: '0x44ee8812bb9930129fec88102391023910283910',
    integrity: {
      verified: true,
      blockNumber: '#2489088',
      gasUsed: '52,481 gas (0.0018 ETH)',
      txHash: '0x44ee8812bb9930129fec88102391023910283910',
      prevEventHash: '0x8891029381029381029381029381029381029381029381029381029381029385',
      currEventHash: '0x1290381092380192830192830192830192830192830192830192830192830194',
      algorithm: 'Keccak-256 (EVM)',
      network: 'Ethereum Mainnet'
    },
    prevState: {
      functionName: 'grantRole',
      role: 'ROLE_AUDITOR',
      target: '0x11cc9832aa012356ff4421aa871092ef5531b992'
    },
    newState: {
      roleGranted: true,
      effectiveTimestamp: '2026-08-24 09:15:30 UTC'
    },
    metadata: {
      caller: 'MultiSig Governance Treasury',
      executionMethod: 'EIP-712 Typed Signature'
    }
  },
  {
    id: 'EVT-008417',
    eventNumber: 8417,
    actor: {
      name: 'System Monitor',
      role: 'Security Agent',
      address: '0x0000000000000000000000000000000000000000',
      ip: '10.24.192.1',
      device: 'BEL Sentinel Daemon',
      avatarBg: 'bg-amber-100 text-amber-700',
      avatarText: 'SM'
    },
    action: 'Security Alert',
    eventType: 'Security Alert',
    resource: {
      name: 'Anomaly in Wallet #0x992b',
      type: 'Security Alert',
      id: 'SEC-ALRT-892'
    },
    network: 'BNB Chain',
    timestamp: '2026-08-24 08:50:11 UTC',
    timeAgo: '3 hours ago',
    status: 'Warning',
    txHash: '0x55aa31f99c82410a82b400921f57cd4399e82103',
    integrity: {
      verified: true,
      blockNumber: '#39102948',
      gasUsed: '21,000 gas',
      txHash: '0x55aa31f99c82410a82b400921f57cd4399e82103',
      prevEventHash: '0x6610293810293810293810293810293810293810293810293810293810293816',
      currEventHash: '0x8891029381029381029381029381029381029381029381029381029381029385',
      algorithm: 'Keccak-256 (BNB Chain)',
      network: 'BNB Smart Chain'
    },
    prevState: {
      riskScore: 12,
      status: 'Normal'
    },
    newState: {
      riskScore: 78,
      status: 'Flagged for Review'
    },
    metadata: {
      threatLevel: 'Medium',
      reason: 'Rapid multiple failed signature authorizations within 60 seconds',
      actionTaken: 'Temporary rate limit enforced'
    }
  },
  {
    id: 'EVT-008416',
    eventNumber: 8416,
    actor: {
      name: 'Rahul Verma',
      role: 'Administrator',
      address: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
      ip: '192.168.10.45',
      device: 'Chrome 124.0 (macOS)',
      avatarBg: 'bg-blue-100 text-blue-700',
      avatarText: 'RV'
    },
    action: 'Identity Created',
    eventType: 'Identity Created',
    resource: {
      name: 'did:bel:7f82...a3b9',
      type: 'DID Identity',
      id: 'did:bel:7f824589d1b09872e45210c4391a82f3a3b910cd'
    },
    network: 'BEL Testnet',
    timestamp: '2026-08-24 07:30:19 UTC',
    timeAgo: '4 hours ago',
    status: 'Success',
    txHash: '0x22ab881920391029381029381029381029381029',
    integrity: {
      verified: true,
      blockNumber: '#2345670',
      gasUsed: '64,120 gas',
      txHash: '0x22ab881920391029381029381029381029381029',
      prevEventHash: '0x5510293810293810293810293810293810293810293810293810293810293817',
      currEventHash: '0x6610293810293810293810293810293810293810293810293810293810293816',
      algorithm: 'Keccak-256 (BEL Consensus)',
      network: 'BEL Testnet'
    },
    prevState: {
      registered: false
    },
    newState: {
      registered: true,
      did: 'did:bel:7f824589d1b09872e45210c4391a82f3a3b910cd',
      publicKey: '0x0481729381029381029381029381029381029381029381029381029381029381...'
    },
    metadata: {
      didDocument: 'W3C DID Standard v1.0',
      credentialSubject: 'Defense Engineering Unit 4'
    }
  },
  {
    id: 'EVT-008415',
    eventNumber: 8415,
    actor: {
      name: 'Amit Kumar',
      role: 'Auditor',
      address: '0x55aa31f99c82410a82b400921f57cd4399e82103',
      ip: '192.168.12.8',
      device: 'Edge 123.0 (Windows 11)',
      avatarBg: 'bg-indigo-100 text-indigo-700',
      avatarText: 'AK'
    },
    action: 'Access Approved',
    eventType: 'Access Approved',
    resource: {
      name: 'Project Atlas Vault',
      type: 'Access Grant',
      id: 'SEC-PRJ-ATLAS-V1'
    },
    network: 'Internal',
    timestamp: '2026-08-24 06:10:04 UTC',
    timeAgo: '5 hours ago',
    status: 'Success',
    integrity: {
      verified: true,
      blockNumber: 'State-Tree #8415',
      gasUsed: 'N/A (Off-chain)',
      txHash: '0x1920381029381029381029381029381029381029',
      prevEventHash: '0x4410293810293810293810293810293810293810293810293810293810293818',
      currEventHash: '0x5510293810293810293810293810293810293810293810293810293810293817',
      algorithm: 'SHA-256 Audit Log',
      network: 'BEL Internal Security Bus'
    },
    prevState: {
      approvalStatus: 'Pending Review'
    },
    newState: {
      approvalStatus: 'Approved & Signed',
      validUntil: '2026-12-31 23:59:59 UTC'
    },
    metadata: {
      securityClearance: 'Secret Level 3',
      complianceCheck: 'Passed (ISO 27001)'
    }
  },
  {
    id: 'EVT-008414',
    eventNumber: 8414,
    actor: {
      name: 'Smart Contract',
      role: 'Automated Bot',
      address: '0x32bf901c56ab81d3940176ef8120bcde19ac7721',
      ip: '127.0.0.1 (Validator node)',
      device: 'BEL Core Engine',
      avatarBg: 'bg-slate-100 text-slate-700',
      avatarText: 'SC'
    },
    action: 'Contract Deployed',
    eventType: 'Contract Deployed',
    resource: {
      name: 'GovernanceVoting.sol',
      type: 'Smart Contract',
      id: '0x11cc9832aa012356ff4421aa871092ef5531b992'
    },
    network: 'Ethereum',
    timestamp: '2026-08-24 05:00:22 UTC',
    timeAgo: '6 hours ago',
    status: 'Success',
    txHash: '0x11cc9832aa012356ff4421aa871092ef5531b992',
    integrity: {
      verified: true,
      blockNumber: '#2489012',
      gasUsed: '1,450,200 gas (0.042 ETH)',
      txHash: '0x11cc9832aa012356ff4421aa871092ef5531b992',
      prevEventHash: '0x3310293810293810293810293810293810293810293810293810293810293819',
      currEventHash: '0x4410293810293810293810293810293810293810293810293810293810293818',
      algorithm: 'Keccak-256 (EVM)',
      network: 'Ethereum Mainnet'
    },
    prevState: {
      contractDeployed: false
    },
    newState: {
      contractDeployed: true,
      version: 'v1.1.0',
      compiler: '0.8.24'
    },
    metadata: {
      deployer: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
      sourceVerified: true,
      bytecodeHash: '0x9920192830192830192830192830192830192830'
    }
  },
  {
    id: 'EVT-008413',
    eventNumber: 8413,
    actor: {
      name: 'System Monitor',
      role: 'Automated Service',
      address: '0x0000000000000000000000000000000000000000',
      ip: '10.24.192.1',
      device: 'BEL Sentinel Daemon',
      avatarBg: 'bg-amber-100 text-amber-700',
      avatarText: 'SM'
    },
    action: 'Access Revoked',
    eventType: 'Access Revoked',
    resource: {
      name: 'Temporary Admin Role',
      type: 'Role / Permission',
      id: 'ROLE_TEMP_ADMIN'
    },
    network: 'Internal',
    timestamp: '2026-08-24 04:00:00 UTC',
    timeAgo: '7 hours ago',
    status: 'Success',
    integrity: {
      verified: true,
      blockNumber: 'State-Tree #8413',
      gasUsed: 'N/A',
      txHash: '0x9910293810293810293810293810293810293820',
      prevEventHash: '0x2210293810293810293810293810293810293810293810293810293810293820',
      currEventHash: '0x3310293810293810293810293810293810293810293810293810293810293819',
      algorithm: 'SHA-256 Audit Log',
      network: 'BEL Internal Security Bus'
    },
    prevState: {
      active: true,
      expiresAt: '2026-08-24 04:00:00 UTC'
    },
    newState: {
      active: false,
      revokedBy: 'System Auto-Expiry Timer'
    },
    metadata: {
      sessionDuration: '4 hours',
      compliancePolicy: 'POL-AUTO-REVOKE-801'
    }
  },
  {
    id: 'EVT-008412',
    eventNumber: 8412,
    actor: {
      name: 'Rahul Verma',
      role: 'Administrator',
      address: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
      ip: '192.168.10.45',
      device: 'Chrome 124.0 (macOS)',
      avatarBg: 'bg-blue-100 text-blue-700',
      avatarText: 'RV'
    },
    action: 'Transaction Submitted',
    eventType: 'Transaction Submitted',
    resource: {
      name: 'Batch Identity Sync',
      type: 'DID Identity',
      id: 'BATCH-SYNC-2026-08'
    },
    network: 'Polygon',
    timestamp: '2026-08-24 03:15:10 UTC',
    timeAgo: '8 hours ago',
    status: 'Success',
    txHash: '0x88bb192301928301928301928301928301928302',
    integrity: {
      verified: true,
      blockNumber: '#58911980',
      gasUsed: '112,400 gas (0.0028 MATIC)',
      txHash: '0x88bb192301928301928301928301928302',
      prevEventHash: '0x1110293810293810293810293810293810293810293810293810293810293821',
      currEventHash: '0x2210293810293810293810293810293810293810293810293810293810293820',
      algorithm: 'Keccak-256 (Polygon POS)',
      network: 'Polygon POS'
    },
    prevState: {
      syncedCount: 1240
    },
    newState: {
      syncedCount: 1248
    },
    metadata: {
      batchSize: 8,
      merkleRoot: '0xfe89128301928301928301928301928301928301'
    }
  },
  {
    id: 'EVT-008411',
    eventNumber: 8411,
    actor: {
      name: 'External Gateway',
      role: 'Integration Service',
      address: '0x1928301928301928301928301928301928301928',
      ip: '198.51.100.42',
      device: 'API Gateway v3.1',
      avatarBg: 'bg-rose-100 text-rose-700',
      avatarText: 'EG'
    },
    action: 'Transaction Failed',
    eventType: 'Transaction Failed',
    resource: {
      name: 'Cross-Chain Asset Bridge',
      type: 'Digital Asset',
      id: 'BRIDGE-TX-9901'
    },
    network: 'BNB Chain',
    timestamp: '2026-08-24 02:40:15 UTC',
    timeAgo: '9 hours ago',
    status: 'Failed',
    txHash: '0xfe89128301928301928301928301928301928301',
    integrity: {
      verified: true,
      blockNumber: '#39102810',
      gasUsed: '21,000 gas (Gas limit exceeded)',
      txHash: '0xfe89128301928301928301928301928301928301',
      prevEventHash: '0x0010293810293810293810293810293810293810293810293810293810293822',
      currEventHash: '0x1110293810293810293810293810293810293810293810293810293810293821',
      algorithm: 'Keccak-256 (BNB Chain)',
      network: 'BNB Smart Chain'
    },
    prevState: {
      lockStatus: 'Funds Locked on Source'
    },
    newState: {
      lockStatus: 'Execution Reverted (Refunded)'
    },
    metadata: {
      revertReason: 'OUT_OF_GAS: target execution contract failed assertion',
      retryAllowed: true
    }
  },
  {
    id: 'EVT-008410',
    eventNumber: 8410,
    actor: {
      name: 'Neha Gupta',
      role: 'Manager',
      address: '0x3a4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
      ip: '192.168.10.112',
      device: 'Firefox 125.0 (Windows 11)',
      avatarBg: 'bg-emerald-100 text-emerald-700',
      avatarText: 'NG'
    },
    action: 'Identity Updated',
    eventType: 'Identity Updated',
    resource: {
      name: 'did:bel:3a4b...6a7b',
      type: 'DID Identity',
      id: 'did:bel:3a4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b'
    },
    network: 'Ethereum',
    timestamp: '2026-08-24 01:20:55 UTC',
    timeAgo: '10 hours ago',
    status: 'Success',
    txHash: '0x3310293810293810293810293810293810293819',
    integrity: {
      verified: true,
      blockNumber: '#2488950',
      gasUsed: '38,900 gas',
      txHash: '0x3310293810293810293810293810293810293819',
      prevEventHash: '0xff10293810293810293810293810293810293810293810293810293810293823',
      currEventHash: '0x0010293810293810293810293810293810293810293810293810293810293822',
      algorithm: 'Keccak-256 (EVM)',
      network: 'Ethereum Mainnet'
    },
    prevState: {
      department: 'Software Testing'
    },
    newState: {
      department: 'Systems Architecture & Verification'
    },
    metadata: {
      updatedBy: 'Admin Authority',
      verificationSignature: '0x88ac77...'
    }
  },
  {
    id: 'EVT-008409',
    eventNumber: 8409,
    actor: {
      name: 'Rahul Verma',
      role: 'Administrator',
      address: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
      ip: '192.168.10.45',
      device: 'Chrome 124.0 (macOS)',
      avatarBg: 'bg-blue-100 text-blue-700',
      avatarText: 'RV'
    },
    action: 'Asset Issued',
    eventType: 'Asset Issued',
    resource: {
      name: 'Security Clearance Badge #509',
      type: 'Digital Asset',
      id: 'NFT-0509-BEL'
    },
    network: 'Ethereum',
    timestamp: '2026-08-23 23:45:10 UTC',
    timeAgo: '11 hours ago',
    status: 'Success',
    txHash: '0xaa12830192830192830192830192830192830192',
    integrity: {
      verified: true,
      blockNumber: '#2488890',
      gasUsed: '45,100 gas',
      txHash: '0xaa12830192830192830192830192830192830192',
      prevEventHash: '0xee10293810293810293810293810293810293810293810293810293810293824',
      currEventHash: '0xff10293810293810293810293810293810293810293810293810293810293823',
      algorithm: 'Keccak-256 (EVM)',
      network: 'Ethereum Mainnet'
    },
    prevState: {
      issued: false
    },
    newState: {
      issued: true,
      recipient: '0x3a4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b'
    },
    metadata: {
      level: 'Class 4 Defense Engineer',
      issuanceType: 'Direct Mint'
    }
  },
  {
    id: 'EVT-008408',
    eventNumber: 8408,
    actor: {
      name: 'System Monitor',
      role: 'Security Agent',
      address: '0x0000000000000000000000000000000000000000',
      ip: '10.24.192.1',
      device: 'BEL Sentinel Daemon',
      avatarBg: 'bg-amber-100 text-amber-700',
      avatarText: 'SM'
    },
    action: 'Transaction Confirmed',
    eventType: 'Transaction Confirmed',
    resource: {
      name: 'State Finality Epoch #492',
      type: 'DID Identity',
      id: 'EPOCH-492-FINAL'
    },
    network: 'BEL Testnet',
    timestamp: '2026-08-23 22:15:00 UTC',
    timeAgo: '13 hours ago',
    status: 'Success',
    txHash: '0xcc99281029381029381029381029381029381029',
    integrity: {
      verified: true,
      blockNumber: '#2345600',
      gasUsed: '18,500 gas',
      txHash: '0xcc99281029381029381029381029381029381029',
      prevEventHash: '0xdd10293810293810293810293810293810293810293810293810293810293825',
      currEventHash: '0xee10293810293810293810293810293810293810293810293810293810293824',
      algorithm: 'Keccak-256 (BEL Consensus)',
      network: 'BEL Testnet'
    },
    prevState: {
      finalized: false
    },
    newState: {
      finalized: true,
      checkpoint: '0x8891290381092381092830192830192830192830'
    },
    metadata: {
      validatorsConsensus: '100% (21/21 nodes)',
      latency: '340ms'
    }
  }
];

export const eventTypeFilterOptions = [
  'All Types',
  'Identity Created',
  'Identity Updated',
  'Role Assigned',
  'Access Approved',
  'Access Revoked',
  'Asset Issued',
  'Asset Transferred',
  'Contract Deployed',
  'Contract Called',
  'Transaction Submitted',
  'Transaction Confirmed',
  'Transaction Failed',
  'Security Alert'
];

export const actorFilterOptions = [
  'All Actors',
  'Rahul Verma',
  'Neha Gupta',
  'Priya Singh',
  'Amit Kumar',
  'Smart Contract',
  'System Monitor',
  'External Gateway'
];

export const resourceTypeFilterOptions = [
  'All Resources',
  'Digital Asset',
  'Role / Permission',
  'DID Identity',
  'Smart Contract',
  'Access Grant',
  'Security Alert'
];

export const statusFilterOptions = [
  'All Statuses',
  'Success',
  'Failed',
  'Pending',
  'Warning'
];

export const networkFilterOptions = [
  'All Networks',
  'Ethereum',
  'Polygon',
  'BNB Chain',
  'BEL Testnet',
  'Internal'
];

export const dateRangeFilterOptions = [
  'All Time',
  'Today',
  'Last 7 Days',
  'Last 30 Days'
];
