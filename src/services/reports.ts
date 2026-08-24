export type ReportCategory = 
  | 'Audit & Compliance'
  | 'Digital Assets'
  | 'Transactions & Gas'
  | 'Security & Risk'
  | 'System Health';

export type ReportStatus = 'Completed' | 'Generating' | 'Scheduled' | 'Failed';
export type ReportFormat = 'PDF' | 'CSV' | 'JSON' | 'XLSX';

export interface ReportItem {
  id: string;
  name: string;
  category: ReportCategory;
  generatedBy: string;
  generatedAt: string;
  period: string;
  format: ReportFormat;
  size: string;
  status: ReportStatus;
  cryptographicHash: string;
  blockRange?: string;
  recordsCount: number;
  description: string;
  summaryMetrics?: { label: string; value: string }[];
}

export interface ScheduledReport {
  id: string;
  title: string;
  category: ReportCategory;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  nextRun: string;
  recipients: string[];
  format: ReportFormat;
  active: boolean;
  lastGenerated?: string;
}

export interface ReportStats {
  totalReports: string;
  totalReportsGrowth: string;
  scheduledActive: string;
  scheduledDescription: string;
  complianceScore: string;
  complianceScoreGrowth: string;
  verifiedProofs: string;
  verifiedProofsGrowth: string;
  monthlyVolume: { month: string; audit: number; assets: number; security: number; transactions: number }[];
  categoryDistribution: { name: string; value: number; color: string }[];
  complianceMetrics: { standard: string; score: number; status: 'Compliant' | 'Warning' | 'Review' }[];
}

// Initial Mock Data
let mockReports: ReportItem[] = [
  {
    id: 'REP-2026-0891',
    name: 'Quarterly Defense Asset Audit & Chain Custody',
    category: 'Audit & Compliance',
    generatedBy: 'Rahul Verma (Admin)',
    generatedAt: '2026-08-24 10:30 AM',
    period: 'Q2 2026 (Apr - Jun)',
    format: 'PDF',
    size: '4.8 MB',
    status: 'Completed',
    cryptographicHash: '0x8f3c4e9b21a8d76e053a992bc4412f9e110b77c5d41a99',
    blockRange: '#2,340,000 - #2,345,678',
    recordsCount: 1420,
    description: 'Comprehensive cryptographic proof of ownership, custody transfers, and NFT minting for BEL defense components.',
    summaryMetrics: [
      { label: 'Total Minted Assets', value: '536' },
      { label: 'Custody Transfers', value: '184' },
      { label: 'Zero-Knowledge Proofs', value: '100% Valid' },
      { label: 'Discrepancies', value: '0' }
    ]
  },
  {
    id: 'REP-2026-0890',
    name: 'Zero Trust Access & Role Hierarchy Verification',
    category: 'Security & Risk',
    generatedBy: 'System Automated',
    generatedAt: '2026-08-24 06:00 AM',
    period: 'Last 7 Days',
    format: 'JSON',
    size: '1.2 MB',
    status: 'Completed',
    cryptographicHash: '0x1a72b94dc83f120e8a7199c08d3e210fa65e9b817c223a',
    blockRange: '#2,344,000 - #2,345,678',
    recordsCount: 890,
    description: 'Detailed analysis of role assignments, privilege escalations, failed authentication bursts, and MFA verifications.',
    summaryMetrics: [
      { label: 'Role Changes', value: '24' },
      { label: 'Revoked Access', value: '3' },
      { label: 'High Risk Flags', value: '0' },
      { label: 'Auth Success Rate', value: '99.94%' }
    ]
  },
  {
    id: 'REP-2026-0889',
    name: 'Smart Contract Gas & Execution Latency Log',
    category: 'Transactions & Gas',
    generatedBy: 'Priya Singh (Auditor)',
    generatedAt: '2026-08-23 04:15 PM',
    period: 'Aug 01 - Aug 23, 2026',
    format: 'CSV',
    size: '3.1 MB',
    status: 'Completed',
    cryptographicHash: '0x43e098dfba21049bc871239aa8e104f65c19280d9e8311',
    blockRange: '#2,310,000 - #2,344,000',
    recordsCount: 3840,
    description: 'Gas consumption trends across BEL Testnet contracts, execution durations, and throughput benchmarks.',
    summaryMetrics: [
      { label: 'Total Invocations', value: '3,840' },
      { label: 'Avg Gas Consumed', value: '42,150' },
      { label: 'Failed Executions', value: '2 (0.05%)' },
      { label: 'Avg Block Latency', value: '2.4s' }
    ]
  },
  {
    id: 'REP-2026-0888',
    name: 'Digital Asset Tokenization & Lifecycle Report',
    category: 'Digital Assets',
    generatedBy: 'Amit Kumar (Manager)',
    generatedAt: '2026-08-22 02:40 PM',
    period: 'Year to Date 2026',
    format: 'PDF',
    size: '6.4 MB',
    status: 'Completed',
    cryptographicHash: '0x99a014bcfe8192305a4d91280bce4910283471029481bc',
    blockRange: '#2,100,000 - #2,340,000',
    recordsCount: 2150,
    description: 'Hardware component certificates tokenized as verifiable NFTs, warranty metadata on-chain, and ownership records.',
    summaryMetrics: [
      { label: 'Active Certificates', value: '536' },
      { label: 'Hardware Badges', value: '312' },
      { label: 'Integrity Rating', value: '100%' },
      { label: 'Storage Used', value: '18.4 GB' }
    ]
  },
  {
    id: 'REP-2026-0887',
    name: 'SOC-2 Type II Blockchain Readiness Assessment',
    category: 'Audit & Compliance',
    generatedBy: 'Rahul Verma (Admin)',
    generatedAt: '2026-08-21 11:00 AM',
    period: 'Jul 01 - Jul 31, 2026',
    format: 'PDF',
    size: '8.9 MB',
    status: 'Completed',
    cryptographicHash: '0x33b81920acdef8719204918239014abcef981023948123',
    blockRange: '#2,200,000 - #2,300,000',
    recordsCount: 5410,
    description: 'Evaluation against trust services criteria: Security, Availability, Processing Integrity, and Confidentiality.',
    summaryMetrics: [
      { label: 'Compliance Score', value: '99.8%' },
      { label: 'Audit Trail Gaps', value: '0' },
      { label: 'Controls Tested', value: '48/48' },
      { label: 'Readiness Level', value: 'Certified' }
    ]
  },
  {
    id: 'REP-2026-0886',
    name: 'Node Validator Performance & Consensus Health',
    category: 'System Health',
    generatedBy: 'System Automated',
    generatedAt: '2026-08-20 08:00 AM',
    period: 'Last 30 Days',
    format: 'XLSX',
    size: '2.5 MB',
    status: 'Completed',
    cryptographicHash: '0x77c210984ba19028340192830198420194812039481029',
    blockRange: '#2,250,000 - #2,330,000',
    recordsCount: 720,
    description: 'Validator uptime, peer count distribution, round-trip consensus timings, and memory footprint across nodes.',
    summaryMetrics: [
      { label: 'Avg Node Uptime', value: '99.99%' },
      { label: 'Connected Peers', value: '18' },
      { label: 'Forks Detected', value: '0' },
      { label: 'Sync Status', value: 'Optimal' }
    ]
  },
  {
    id: 'REP-2026-0885',
    name: 'Continuous Anomaly & Intrusion Detection Audit',
    category: 'Security & Risk',
    generatedBy: 'Security Agent Daemon',
    generatedAt: '2026-08-19 09:30 PM',
    period: 'Aug 12 - Aug 19, 2026',
    format: 'JSON',
    size: '950 KB',
    status: 'Completed',
    cryptographicHash: '0x55d8102938471029384710293847102938471029384710',
    blockRange: '#2,320,000 - #2,335,000',
    recordsCount: 420,
    description: 'Real-time monitoring for contract replay attacks, unexpected parameter mutations, and signature re-use.',
    summaryMetrics: [
      { label: 'Attacks Blocked', value: '0' },
      { label: 'Suspicious IP Hits', value: '4 (Mitigated)' },
      { label: 'Signature Integrity', value: '100%' },
      { label: 'Threat Index', value: 'Low (0.02)' }
    ]
  }
];

let mockScheduled: ScheduledReport[] = [
  {
    id: 'SCH-01',
    title: 'Daily Blockchain State & Transaction Ledger',
    category: 'Transactions & Gas',
    frequency: 'Daily',
    nextRun: 'Tomorrow at 00:00 UTC',
    recipients: ['admin@bel.co.in', 'auditor@bel.co.in'],
    format: 'CSV',
    active: true,
    lastGenerated: 'Today at 00:00 UTC'
  },
  {
    id: 'SCH-02',
    title: 'Weekly SOC-2 & ISO 27001 Access Control Ledger',
    category: 'Audit & Compliance',
    frequency: 'Weekly',
    nextRun: 'Mon, Aug 31 at 06:00 UTC',
    recipients: ['security-lead@bel.co.in', 'rahul.verma@bel.co.in'],
    format: 'PDF',
    active: true,
    lastGenerated: 'Mon, Aug 24 at 06:00 UTC'
  },
  {
    id: 'SCH-03',
    title: 'Monthly Digital Asset Tokenization & Custody Valuation',
    category: 'Digital Assets',
    frequency: 'Monthly',
    nextRun: 'Sep 01, 2026 at 00:00 UTC',
    recipients: ['finance@bel.co.in', 'asset-ops@bel.co.in'],
    format: 'PDF',
    active: true,
    lastGenerated: 'Aug 01, 2026 at 00:00 UTC'
  },
  {
    id: 'SCH-04',
    title: 'Bi-Weekly Threat Matrix & Privilege Escalation Audit',
    category: 'Security & Risk',
    frequency: 'Weekly',
    nextRun: 'Fri, Aug 28 at 18:00 UTC',
    recipients: ['ciso-office@bel.co.in'],
    format: 'JSON',
    active: false,
    lastGenerated: 'Fri, Aug 14 at 18:00 UTC'
  }
];

export const mockReportStats: ReportStats = {
  totalReports: '148',
  totalReportsGrowth: '+18.4% this month',
  scheduledActive: '8 Active',
  scheduledDescription: 'Automated recurring jobs',
  complianceScore: '99.8%',
  complianceScoreGrowth: '+0.4% vs last audit',
  verifiedProofs: '100% Sealed',
  verifiedProofsGrowth: 'Zero ledger discrepancies',
  monthlyVolume: [
    { month: 'Mar', audit: 18, assets: 12, security: 15, transactions: 24 },
    { month: 'Apr', audit: 22, assets: 16, security: 19, transactions: 28 },
    { month: 'May', audit: 28, assets: 21, security: 24, transactions: 35 },
    { month: 'Jun', audit: 34, assets: 25, security: 30, transactions: 42 },
    { month: 'Jul', audit: 41, assets: 32, security: 38, transactions: 51 },
    { month: 'Aug', audit: 48, assets: 39, security: 44, transactions: 58 }
  ],
  categoryDistribution: [
    { name: 'Audit & Compliance', value: 48, color: '#2563eb' }, // blue-600
    { name: 'Digital Assets', value: 39, color: '#8b5cf6' }, // purple-500
    { name: 'Security & Risk', value: 44, color: '#f59e0b' }, // amber-500
    { name: 'Transactions & Gas', value: 58, color: '#10b981' }, // emerald-500
    { name: 'System Health', value: 21, color: '#64748b' } // slate-500
  ],
  complianceMetrics: [
    { standard: 'ISO/IEC 27001:2022 (ISMS)', score: 100, status: 'Compliant' },
    { standard: 'SOC-2 Type II (Trust Principles)', score: 99.8, status: 'Compliant' },
    { standard: 'NIST SP 800-53 (Defense Systems)', score: 99.5, status: 'Compliant' },
    { standard: 'GDPR / Digital Data Protection (DPDP)', score: 100, status: 'Compliant' }
  ]
};

// Async Mock Service Methods
export async function getReports(): Promise<ReportItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...mockReports];
}

export async function getReportStats(): Promise<ReportStats> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { ...mockReportStats };
}

export async function getScheduledReports(): Promise<ScheduledReport[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return [...mockScheduled];
}

export async function generateReport(params: {
  name: string;
  category: ReportCategory;
  format: ReportFormat;
  period: string;
  description: string;
}): Promise<ReportItem> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const randomHash = '0x' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const newReport: ReportItem = {
    id: `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    name: params.name,
    category: params.category,
    generatedBy: 'Rahul Verma (Admin)',
    generatedAt: 'Just now',
    period: params.period,
    format: params.format,
    size: `${(Math.random() * 4 + 1).toFixed(1)} MB`,
    status: 'Completed',
    cryptographicHash: randomHash,
    blockRange: '#2,345,600 - #2,345,678',
    recordsCount: Math.floor(200 + Math.random() * 2500),
    description: params.description || 'Custom generated compliance and state report from BEL Trust Platform.',
    summaryMetrics: [
      { label: 'Status', value: 'Cryptographically Verified' },
      { label: 'Ledger Seal', value: 'SHA-256 Validated' },
      { label: 'Auditor ID', value: 'did:bel:7f82...a3b9' }
    ]
  };

  mockReports = [newReport, ...mockReports];
  return newReport;
}

export async function toggleScheduledReport(id: string): Promise<ScheduledReport | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const found = mockScheduled.find((s) => s.id === id);
  if (found) {
    found.active = !found.active;
  }
  return found;
}

export async function deleteReport(id: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  mockReports = mockReports.filter((r) => r.id !== id);
  return true;
}
