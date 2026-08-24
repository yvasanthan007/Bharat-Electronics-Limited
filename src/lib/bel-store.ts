import { useSyncExternalStore } from "react";

export type Role = "employee" | "manager" | "admin";

export type RequestStatus = "pending" | "approved" | "rejected" | "info";
export type AccessStatus = "active" | "pending" | "expired" | "revoked";
export type Classification = "Public" | "Internal" | "Confidential" | "Restricted";
export type Severity = "Low" | "Medium" | "High" | "Critical";

export interface DemoUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  title: string;
  status: "Active" | "Suspended";
  lastActive: string;
  identityId: string;
  verified: boolean;
}

export interface Asset {
  id: string;
  name: string;
  icon: string;
  type: string;
  owner: string;
  classification: Classification;
  authorizedUsers: number;
  updated: string;
  description: string;
}

export interface Permission {
  id: string;
  userId: string;
  assetId: string;
  level: string;
  grantedBy: string;
  grantedDate: string;
  expiry: string;
  status: AccessStatus;
}

export interface AccessRequest {
  id: string;
  userId: string;
  assetId: string;
  level: string;
  reason: string;
  date: string;
  risk: Severity;
  status: RequestStatus;
  note?: string;
  decidedBy?: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  prevHash: string;
  hash: string;
}

export interface Notification {
  id: string;
  tone: "success" | "warning" | "danger" | "info";
  title: string;
  body: string;
  time: string;
  read: boolean;
  audience: Role | "all";
}

export interface ActivityItem {
  id: string;
  text: string;
  detail: string;
  time: string;
  tone: "success" | "warning" | "danger" | "info";
}

export interface SecurityEvent {
  id: string;
  type: string;
  source: string;
  user: string;
  time: string;
  severity: Severity;
}

export const USERS: DemoUser[] = [
  {
    id: "u-alex",
    employeeId: "BEL-40218",
    name: "Alex Mercer",
    email: "alex.mercer@bel.enterprise",
    role: "employee",
    department: "Research & Development",
    title: "Senior Research Engineer",
    status: "Active",
    lastActive: "2 minutes ago",
    identityId: "DID:BEL:8F31-A902-7C4E",
    verified: true,
  },
  {
    id: "u-sarah",
    employeeId: "BEL-20147",
    name: "Sarah Okafor",
    email: "sarah.okafor@bel.enterprise",
    role: "manager",
    department: "Research & Development",
    title: "Engineering Manager",
    status: "Active",
    lastActive: "12 minutes ago",
    identityId: "DID:BEL:2B77-D104-9AA1",
    verified: true,
  },
  {
    id: "u-rhea",
    employeeId: "BEL-10003",
    name: "Rhea Kapoor",
    email: "rhea.kapoor@bel.enterprise",
    role: "admin",
    department: "Information Security",
    title: "Security Administrator",
    status: "Active",
    lastActive: "Just now",
    identityId: "DID:BEL:0C15-77E3-4410",
    verified: true,
  },
  {
    id: "u-dmitri",
    employeeId: "BEL-40871",
    name: "Dmitri Vale",
    email: "dmitri.vale@bel.enterprise",
    role: "employee",
    department: "Finance",
    title: "Financial Analyst",
    status: "Active",
    lastActive: "1 hour ago",
    identityId: "DID:BEL:91AC-2D40-6B18",
    verified: true,
  },
  {
    id: "u-mei",
    employeeId: "BEL-40922",
    name: "Mei Tanaka",
    email: "mei.tanaka@bel.enterprise",
    role: "employee",
    department: "Research & Development",
    title: "Data Scientist",
    status: "Active",
    lastActive: "4 hours ago",
    identityId: "DID:BEL:5510-B7C2-3E99",
    verified: true,
  },
  {
    id: "u-jonas",
    employeeId: "BEL-40655",
    name: "Jonas Feld",
    email: "jonas.feld@bel.enterprise",
    role: "employee",
    department: "People Operations",
    title: "HR Business Partner",
    status: "Suspended",
    lastActive: "3 days ago",
    identityId: "DID:BEL:73F0-11DA-8C05",
    verified: false,
  },
];

export const ASSETS: Asset[] = [
  {
    id: "a-fin",
    name: "Financial Analytics Dashboard",
    icon: "chart",
    type: "Analytics Workspace",
    owner: "Finance Operations",
    classification: "Confidential",
    authorizedUsers: 42,
    updated: "12 Aug 2026",
    description: "Consolidated revenue, spend and forecast reporting for the enterprise.",
  },
  {
    id: "a-proj",
    name: "Project Documentation",
    icon: "folder",
    type: "Document Repository",
    owner: "Programme Office",
    classification: "Internal",
    authorizedUsers: 318,
    updated: "19 Aug 2026",
    description: "Delivery plans, architecture records and programme status packs.",
  },
  {
    id: "a-res",
    name: "Research Database",
    icon: "flask",
    type: "Structured Datastore",
    owner: "R&D Division",
    classification: "Restricted",
    authorizedUsers: 27,
    updated: "21 Aug 2026",
    description: "Experimental results, prototype telemetry and classified test data.",
  },
  {
    id: "a-hr",
    name: "HR Employee Records",
    icon: "users",
    type: "Records System",
    owner: "People Operations",
    classification: "Restricted",
    authorizedUsers: 15,
    updated: "10 Aug 2026",
    description: "Employment, payroll and personal records governed by data policy.",
  },
  {
    id: "a-strat",
    name: "Confidential Strategy Documents",
    icon: "lock",
    type: "Document Repository",
    owner: "Executive Office",
    classification: "Restricted",
    authorizedUsers: 9,
    updated: "05 Aug 2026",
    description: "Board strategy, M&A analysis and long range planning material.",
  },
  {
    id: "a-intel",
    name: "Internal Analytics Dashboard",
    icon: "activity",
    type: "Analytics Workspace",
    owner: "Data Platform",
    classification: "Internal",
    authorizedUsers: 260,
    updated: "22 Aug 2026",
    description: "Operational KPIs, usage telemetry and department scorecards.",
  },
];

const initialPermissions: Permission[] = [
  {
    id: "p-1",
    userId: "u-alex",
    assetId: "a-proj",
    level: "Edit",
    grantedBy: "Sarah Okafor",
    grantedDate: "02 Mar 2026",
    expiry: "02 Mar 2027",
    status: "active",
  },
  {
    id: "p-2",
    userId: "u-alex",
    assetId: "a-intel",
    level: "View",
    grantedBy: "System Policy",
    grantedDate: "14 Jan 2026",
    expiry: "No expiry",
    status: "active",
  },
  {
    id: "p-3",
    userId: "u-alex",
    assetId: "a-fin",
    level: "View",
    grantedBy: "Rhea Kapoor",
    grantedDate: "08 Nov 2025",
    expiry: "08 Aug 2026",
    status: "expired",
  },
  {
    id: "p-4",
    userId: "u-alex",
    assetId: "a-hr",
    level: "View",
    grantedBy: "Rhea Kapoor",
    grantedDate: "19 Apr 2026",
    expiry: "Revoked",
    status: "revoked",
  },
  {
    id: "p-5",
    userId: "u-mei",
    assetId: "a-res",
    level: "View",
    grantedBy: "Sarah Okafor",
    grantedDate: "11 Jun 2026",
    expiry: "11 Dec 2026",
    status: "active",
  },
  {
    id: "p-6",
    userId: "u-dmitri",
    assetId: "a-fin",
    level: "Edit",
    grantedBy: "Rhea Kapoor",
    grantedDate: "21 May 2026",
    expiry: "21 May 2027",
    status: "active",
  },
];

const initialRequests: AccessRequest[] = [
  {
    id: "REQ-2041",
    userId: "u-mei",
    assetId: "a-strat",
    level: "View",
    reason:
      "Preparing the quarterly innovation briefing and need the strategy context for alignment.",
    date: "23 Aug 2026",
    risk: "High",
    status: "pending",
  },
  {
    id: "REQ-2040",
    userId: "u-dmitri",
    assetId: "a-proj",
    level: "Download",
    reason: "Reconciling programme spend against delivery milestones for the audit pack.",
    date: "23 Aug 2026",
    risk: "Medium",
    status: "pending",
  },
  {
    id: "REQ-2038",
    userId: "u-alex",
    assetId: "a-intel",
    level: "View",
    reason: "Tracking prototype adoption metrics.",
    date: "18 Aug 2026",
    risk: "Low",
    status: "approved",
    decidedBy: "Sarah Okafor",
  },
  {
    id: "REQ-2035",
    userId: "u-jonas",
    assetId: "a-fin",
    level: "Admin",
    reason: "Requested elevated rights for payroll reconciliation.",
    date: "14 Aug 2026",
    risk: "Critical",
    status: "rejected",
    decidedBy: "Rhea Kapoor",
    note: "Admin rights exceed role requirement. Use delegated view instead.",
  },
];

const initialLedger: LedgerEntry[] = [
  {
    id: "TXN-0x9f21",
    timestamp: "18 Aug 2026 · 09:14:22",
    user: "Alex Mercer",
    action: "Identity verification completed",
    resource: "DID:BEL:8F31-A902-7C4E",
    prevHash: "0000000000000000",
    hash: "4b91c7de20af6135",
  },
  {
    id: "TXN-0xa044",
    timestamp: "18 Aug 2026 · 10:02:51",
    user: "Alex Mercer",
    action: "Access request submitted",
    resource: "Internal Analytics Dashboard",
    prevHash: "4b91c7de20af6135",
    hash: "8c02fa71bd4e9930",
  },
  {
    id: "TXN-0xa118",
    timestamp: "18 Aug 2026 · 11:47:09",
    user: "Sarah Okafor",
    action: "Access request approved",
    resource: "Internal Analytics Dashboard",
    prevHash: "8c02fa71bd4e9930",
    hash: "d7411ea6c0b38255",
  },
  {
    id: "TXN-0xa119",
    timestamp: "18 Aug 2026 · 11:47:10",
    user: "BEL Policy Engine",
    action: "Permission granted",
    resource: "Internal Analytics Dashboard · View",
    prevHash: "d7411ea6c0b38255",
    hash: "1fa30c8b95d67e42",
  },
  {
    id: "TXN-0xa205",
    timestamp: "22 Aug 2026 · 08:31:44",
    user: "Rhea Kapoor",
    action: "Permission revoked",
    resource: "HR Employee Records · View",
    prevHash: "1fa30c8b95d67e42",
    hash: "63be0947ac1152fd",
  },
];

const initialNotifications: Notification[] = [
  {
    id: "n-1",
    tone: "success",
    title: "Access request approved",
    body: "Your request REQ-2038 for the Internal Analytics Dashboard was approved.",
    time: "18 Aug 2026 · 11:47",
    read: false,
    audience: "employee",
  },
  {
    id: "n-2",
    tone: "warning",
    title: "Access request under review",
    body: "REQ-2040 is awaiting manager approval.",
    time: "23 Aug 2026 · 09:12",
    read: false,
    audience: "all",
  },
  {
    id: "n-3",
    tone: "danger",
    title: "Permission revoked",
    body: "Access to HR Employee Records has been revoked by Security Administration.",
    time: "22 Aug 2026 · 08:31",
    read: true,
    audience: "all",
  },
  {
    id: "n-4",
    tone: "info",
    title: "Security policy updated",
    body: "Restricted assets now require step-up MFA for download and edit actions.",
    time: "20 Aug 2026 · 16:05",
    read: true,
    audience: "all",
  },
];

export const SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: "se-1",
    type: "Failed login attempts (5x)",
    source: "203.0.113.44 · Unrecognised device",
    user: "jonas.feld@bel.enterprise",
    time: "23 Aug 2026 · 03:14",
    severity: "High",
  },
  {
    id: "se-2",
    type: "Suspicious access attempt",
    source: "Restricted asset · Off-network",
    user: "unknown@external",
    time: "23 Aug 2026 · 02:41",
    severity: "Critical",
  },
  {
    id: "se-3",
    type: "Permission revoked",
    source: "HR Employee Records",
    user: "alex.mercer@bel.enterprise",
    time: "22 Aug 2026 · 08:31",
    severity: "Medium",
  },
  {
    id: "se-4",
    type: "High-risk access request",
    source: "Confidential Strategy Documents",
    user: "mei.tanaka@bel.enterprise",
    time: "23 Aug 2026 · 08:02",
    severity: "High",
  },
  {
    id: "se-5",
    type: "MFA challenge passed",
    source: "Research Database",
    user: "sarah.okafor@bel.enterprise",
    time: "22 Aug 2026 · 19:20",
    severity: "Low",
  },
];

interface State {
  currentUserId: string | null;
  permissions: Permission[];
  requests: AccessRequest[];
  ledger: LedgerEntry[];
  notifications: Notification[];
  activity: ActivityItem[];
}

let state: State = {
  currentUserId: null,
  permissions: initialPermissions,
  requests: initialRequests,
  ledger: initialLedger,
  notifications: initialNotifications,
  activity: [
    {
      id: "act-1",
      text: "Identity verification completed",
      detail: "Biometric + MFA challenge passed",
      time: "Today · 08:04",
      tone: "success",
    },
    {
      id: "act-2",
      text: "Asset accessed securely",
      detail: "Project Documentation · Edit session",
      time: "Yesterday · 17:22",
      tone: "info",
    },
    {
      id: "act-3",
      text: "Permission granted",
      detail: "Internal Analytics Dashboard · View",
      time: "18 Aug · 11:47",
      tone: "success",
    },
    {
      id: "act-4",
      text: "Manager approved access",
      detail: "Approved by Sarah Okafor",
      time: "18 Aug · 11:47",
      tone: "success",
    },
    {
      id: "act-5",
      text: "Access request submitted",
      detail: "REQ-2038 · Internal Analytics Dashboard",
      time: "18 Aug · 10:02",
      tone: "warning",
    },
  ],
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  emit();
};

export function useBel() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const actions = {
  login(userId: string) {
    set({ currentUserId: userId });
  },
  logout() {
    set({ currentUserId: null });
  },
  markAllRead() {
    set({ notifications: state.notifications.map((n) => ({ ...n, read: true })) });
  },
  submitRequest(input: { userId: string; assetId: string; level: string; reason: string }) {
    const asset = ASSETS.find((a) => a.id === input.assetId)!;
    const user = USERS.find((u) => u.id === input.userId)!;
    const id = `REQ-${2042 + state.requests.length}`;
    const risk: Severity =
      asset.classification === "Restricted"
        ? input.level === "View"
          ? "High"
          : "Critical"
        : asset.classification === "Confidential"
          ? "Medium"
          : "Low";
    const req: AccessRequest = {
      id,
      userId: input.userId,
      assetId: input.assetId,
      level: input.level,
      reason: input.reason,
      date: todayLabel(),
      risk,
      status: "pending",
    };
    set({
      requests: [req, ...state.requests],
      permissions: [
        {
          id: `p-${id}`,
          userId: input.userId,
          assetId: input.assetId,
          level: input.level,
          grantedBy: "—",
          grantedDate: todayLabel(),
          expiry: "—",
          status: "pending",
        },
        ...state.permissions,
      ],
      ledger: appendLedger(user.name, "Access request submitted", `${asset.name} · ${input.level}`),
      activity: [
        {
          id: `act-${id}`,
          text: "Access request submitted",
          detail: `${id} · ${asset.name}`,
          time: "Just now",
          tone: "warning",
        },
        ...state.activity,
      ],
      notifications: [
        {
          id: `n-${id}`,
          tone: "warning",
          title: "Access request under review",
          body: `${id} for ${asset.name} is pending manager approval.`,
          time: "Just now",
          read: false,
          audience: "all",
        },
        ...state.notifications,
      ],
    });
    return id;
  },
  decide(requestId: string, decision: RequestStatus, note: string, deciderName: string) {
    const req = state.requests.find((r) => r.id === requestId);
    if (!req) return;
    const asset = ASSETS.find((a) => a.id === req.assetId)!;
    const user = USERS.find((u) => u.id === req.userId)!;

    const requests = state.requests.map((r) =>
      r.id === requestId ? { ...r, status: decision, note, decidedBy: deciderName } : r,
    );

    let permissions = state.permissions;
    let ledger = state.ledger;

    if (decision === "approved") {
      ledger = appendLedger(deciderName, "Access request approved", `${asset.name} · ${req.level}`, ledger);
      ledger = appendLedger("BEL Policy Engine", "Permission granted", `${asset.name} · ${req.level}`, ledger);
      const existing = permissions.find((p) => p.userId === req.userId && p.assetId === req.assetId);
      const granted: Permission = {
        id: existing?.id ?? `p-${requestId}`,
        userId: req.userId,
        assetId: req.assetId,
        level: req.level,
        grantedBy: deciderName,
        grantedDate: todayLabel(),
        expiry: "23 Aug 2027",
        status: "active",
      };
      permissions = existing
        ? permissions.map((p) => (p.id === existing.id ? granted : p))
        : [granted, ...permissions];
    } else if (decision === "rejected") {
      ledger = appendLedger(deciderName, "Access request rejected", `${asset.name} · ${req.level}`, ledger);
      permissions = permissions.filter(
        (p) => !(p.userId === req.userId && p.assetId === req.assetId && p.status === "pending"),
      );
    } else {
      ledger = appendLedger(deciderName, "More information requested", `${asset.name} · ${req.level}`, ledger);
    }

    const tone = decision === "approved" ? "success" : decision === "rejected" ? "danger" : "warning";
    set({
      requests,
      permissions,
      ledger,
      activity: [
        {
          id: `act-${requestId}-${decision}`,
          text:
            decision === "approved"
              ? "Manager approved access"
              : decision === "rejected"
                ? "Access request rejected"
                : "More information requested",
          detail: `${asset.name} · ${user.name}`,
          time: "Just now",
          tone,
        },
        ...state.activity,
      ],
      notifications: [
        {
          id: `n-${requestId}-${decision}`,
          tone,
          title:
            decision === "approved"
              ? "Your access request has been approved"
              : decision === "rejected"
                ? "Your access request was rejected"
                : "More information required",
          body: `${requestId} · ${asset.name} (${req.level})`,
          time: "Just now",
          read: false,
          audience: "all",
        },
        ...state.notifications,
      ],
    });
  },
};

function todayLabel() {
  return "23 Aug 2026";
}

function hash16(seed: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  const a = h.toString(16).padStart(8, "0");
  const b = Math.imul(h ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  return a + b.toString(16).padStart(8, "0");
}

function appendLedger(user: string, action: string, resource: string, base?: LedgerEntry[]) {
  const chain = base ?? state.ledger;
  const prev = chain[chain.length - 1];
  const prevHash = prev ? prev.hash : "0000000000000000";
  const hash = hash16(prevHash + user + action + resource + chain.length);
  return [
    ...chain,
    {
      id: `TXN-0x${hash.slice(0, 4)}`,
      timestamp: `${todayLabel()} · ${new Date().toLocaleTimeString("en-GB")}`,
      user,
      action,
      resource,
      prevHash,
      hash,
    },
  ];
}

export const getUser = (id: string | null) => USERS.find((u) => u.id === id) ?? null;
export const getAsset = (id: string) => ASSETS.find((a) => a.id === id)!;

export const ROLE_LABEL: Record<Role, string> = {
  employee: "Employee",
  manager: "Manager / Approver",
  admin: "Security Administrator",
};
