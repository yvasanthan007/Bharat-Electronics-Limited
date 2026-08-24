import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  FileClock,
  Fingerprint,
  Gauge,
  KeyRound,
  Link2,
  Lock,
  Plus,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import {
  AccessBadge,
  AssetIcon,
  PageHeader,
  Panel,
  Pill,
  RequestBadge,
  SeverityBadge,
  StatCard,
} from "@/components/bel/primitives";
import {
  actions,
  ASSETS,
  getAsset,
  getUser,
  ROLE_LABEL,
  SECURITY_EVENTS,
  useBel,
  USERS,
} from "@/lib/bel-store";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Workspace Dashboard — BEL Digital Trust" },
      { name: "description", content: "Active workspace dashboard tailored to your enterprise role." },
    ],
  }),
  component: AppDashboard,
});

function AppDashboard() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  );
}

function DashboardContent() {
  const { currentUserId, permissions, requests, ledger, activity } = useBel();
  const user = getUser(currentUserId);

  if (!user) return null;

  if (user.role === "manager") {
    return <ManagerDashboard user={user} />;
  }

  if (user.role === "admin") {
    return <AdminDashboard user={user} />;
  }

  return <EmployeeDashboard user={user} />;
}

// -------------------------------------------------------------
// 1. EMPLOYEE DASHBOARD
// -------------------------------------------------------------
function EmployeeDashboard({ user }: { user: ReturnType<typeof getUser> & {} }) {
  const { permissions, requests, activity } = useBel();
  const myPermissions = permissions.filter((p) => p.userId === user.id);
  const activeCount = myPermissions.filter((p) => p.status === "active").length;
  const myRequests = requests.filter((r) => r.userId === user.id);
  const pendingCount = myRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Welcome back, {user.name.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your digital identity, access permissions, and authorized resources.
          </p>
        </div>
        <Link
          to="/app/request"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" /> Request New Access
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Permissions"
          value={activeCount}
          hint="Across enterprise assets"
          icon={KeyRound}
          tone="success"
        />
        <StatCard
          label="Available Assets"
          value={ASSETS.length}
          hint="Catalog resources"
          icon={Boxes}
          tone="info"
        />
        <StatCard
          label="Pending Requests"
          value={pendingCount}
          hint="Awaiting manager review"
          icon={ClipboardCheck}
          tone="warning"
        />
        <StatCard
          label="Security Status"
          value="Verified"
          hint="Hardware MFA Active"
          icon={ShieldCheck}
          tone="success"
        />
      </div>

      {/* Quick Action Cards */}
      <div>
        <h2 className="text-lg font-bold mb-3">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/app/request"
            className="group rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent group-hover:scale-105 transition-transform">
                <Plus className="size-5" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-base">Request Access</h3>
              <p className="text-xs text-muted-foreground mt-1">Submit resource access justification</p>
            </div>
          </Link>

          <Link
            to="/app/assets"
            className="group rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-info-soft text-info group-hover:scale-105 transition-transform">
                <Boxes className="size-5" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-base">View Digital Assets</h3>
              <p className="text-xs text-muted-foreground mt-1">Browse enterprise data &amp; systems</p>
            </div>
          </Link>

          <Link
            to="/app/identity"
            className="group rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-success-soft text-success group-hover:scale-105 transition-transform">
                <Fingerprint className="size-5" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-base">View Digital Identity</h3>
              <p className="text-xs text-muted-foreground mt-1">Inspect DID certificate &amp; MFA credentials</p>
            </div>
          </Link>

          <Link
            to="/app/activity"
            className="group rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-warning-soft text-warning group-hover:scale-105 transition-transform">
                <Activity className="size-5" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-base">View Activity</h3>
              <p className="text-xs text-muted-foreground mt-1">Check recent security &amp; session logs</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Grid: My Permissions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Panel
            title="My Current Access Permissions"
            description="Active entitlements assigned to your identity"
            action={
              <Link to="/app/access" className="text-xs font-semibold text-accent hover:underline">
                View all ({myPermissions.length})
              </Link>
            }
          >
            <div className="divide-y text-sm">
              {myPermissions.slice(0, 4).map((p) => {
                const asset = getAsset(p.assetId);
                return (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <AssetIcon icon={asset.icon} className="size-9" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.level} Access · Granted by {p.grantedBy}
                        </p>
                      </div>
                    </div>
                    <AccessBadge status={p.status} />
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-5">
          <Panel
            title="Recent Activity"
            description="Real-time security and permission events"
            action={
              <Link to="/app/activity" className="text-xs font-semibold text-accent hover:underline">
                All Activity
              </Link>
            }
          >
            <div className="space-y-4">
              {activity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-xs">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-primary mt-0.5">
                    <Activity className="size-3" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{item.text}</p>
                    <p className="text-muted-foreground text-[11px] truncate">{item.detail}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. MANAGER DASHBOARD
// -------------------------------------------------------------
function ManagerDashboard({ user }: { user: ReturnType<typeof getUser> & {} }) {
  const { requests } = useBel();
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const approvedToday = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;
  const teamUsers = USERS.filter((u) => u.department === user.department);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Manager Approval Hub</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and govern team access requests with risk-aware authorization.
          </p>
        </div>
        <Link
          to="/app/approvals"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <ClipboardCheck className="size-4" /> Open Approvals Queue ({pendingRequests.length})
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending Requests"
          value={pendingRequests.length}
          hint="Requires manager action"
          icon={ClipboardCheck}
          tone="warning"
        />
        <StatCard
          label="Approved Access"
          value={approvedToday}
          hint="Active in ledger"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Rejected / Info"
          value={rejectedCount}
          hint="Flagged requests"
          icon={XCircle}
          tone="danger"
        />
        <StatCard
          label="Team Members"
          value={teamUsers.length}
          hint={user.department}
          icon={Users}
          tone="info"
        />
      </div>

      {/* Pending Access Requests Table */}
      <Panel
        title="Pending Access Requests"
        description="Review requests requiring your explicit sign-off"
        action={
          <Link to="/app/approvals" className="text-xs font-semibold text-accent hover:underline">
            View full portal →
          </Link>
        }
      >
        {pendingRequests.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            <CheckCircle2 className="size-8 text-success mx-auto mb-2" />
            No pending access requests at this time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-3 font-semibold">Employee</th>
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold">Requested Asset</th>
                  <th className="pb-3 font-semibold">Level</th>
                  <th className="pb-3 font-semibold">Risk</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingRequests.map((req) => {
                  const reqUser = getUser(req.userId);
                  const asset = getAsset(req.assetId);
                  return (
                    <tr key={req.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3.5 font-medium">{reqUser?.name}</td>
                      <td className="py-3.5 text-xs text-muted-foreground">{reqUser?.department}</td>
                      <td className="py-3.5 font-medium">{asset.name}</td>
                      <td className="py-3.5 text-xs">{req.level}</td>
                      <td className="py-3.5">
                        <SeverityBadge level={req.risk} />
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => actions.decide(req.id, "approved", "Approved by line manager", user.name)}
                          className="inline-flex items-center gap-1 rounded-lg bg-success-soft text-success border border-success/30 px-2.5 py-1 text-xs font-semibold hover:bg-success hover:text-success-foreground transition-colors"
                        >
                          <CheckCircle2 className="size-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => actions.decide(req.id, "rejected", "Rejected by manager", user.name)}
                          className="inline-flex items-center gap-1 rounded-lg bg-danger-soft text-danger border border-danger/30 px-2.5 py-1 text-xs font-semibold hover:bg-danger hover:text-danger-foreground transition-colors"
                        >
                          <XCircle className="size-3.5" /> Reject
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

// -------------------------------------------------------------
// 3. SECURITY ADMIN DASHBOARD
// -------------------------------------------------------------
function AdminDashboard({ user }: { user: ReturnType<typeof getUser> & {} }) {
  const { permissions, requests, ledger } = useBel();
  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Security Control Plane</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enterprise-wide digital trust, identity governance, and cryptographic audit monitoring.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/app/audit"
            className="inline-flex items-center gap-2 rounded-xl bg-card border px-4 py-2.5 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <Link2 className="size-4 text-accent" /> Audit Ledger
          </Link>
          <Link
            to="/app/monitoring"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <ShieldAlert className="size-4" /> Security Monitoring
          </Link>
        </div>
      </div>

      {/* 6 Security Overview Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Managed Users"
          value={USERS.length}
          hint="Enterprise Directory"
          icon={Users}
          tone="info"
        />
        <StatCard
          label="Active Identities"
          value={USERS.filter((u) => u.verified).length}
          hint="Cryptographically Verified"
          icon={Fingerprint}
          tone="success"
        />
        <StatCard
          label="Active Permissions"
          value={permissions.filter((p) => p.status === "active").length}
          hint="Least-privilege grants"
          icon={KeyRound}
          tone="info"
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequests.length}
          hint="Access request pipeline"
          icon={ClipboardCheck}
          tone="warning"
        />
        <StatCard
          label="Security Events Today"
          value={SECURITY_EVENTS.length}
          hint="Continuous telemetry"
          icon={ShieldAlert}
          tone="danger"
        />
        <StatCard
          label="Ledger State Proofs"
          value={ledger.length}
          hint="100% hash-verified chain"
          icon={Link2}
          tone="success"
        />
      </div>

      {/* Security Monitoring Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Panel
            title="Real-Time Security Monitoring"
            description="Live anomaly detection & threat indicators"
            action={
              <Link to="/app/monitoring" className="text-xs font-semibold text-accent hover:underline">
                Full telemetry →
              </Link>
            }
          >
            <div className="divide-y text-xs">
              {SECURITY_EVENTS.slice(0, 4).map((evt) => (
                <div key={evt.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm">{evt.type}</p>
                    <p className="text-muted-foreground mt-0.5">
                      {evt.source} · {evt.user}
                    </p>
                  </div>
                  <SeverityBadge level={evt.severity} />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-5">
          <Panel
            title="Immutable Ledger Stream"
            description="Latest chained transaction blocks"
            action={
              <Link to="/app/audit" className="text-xs font-semibold text-accent hover:underline">
                Inspect chain →
              </Link>
            }
          >
            <div className="space-y-3">
              {ledger.slice(-4).reverse().map((entry) => (
                <div key={entry.id} className="rounded-xl border bg-secondary/40 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-accent font-semibold">{entry.id}</span>
                    <span className="text-[10px] text-muted-foreground">{entry.timestamp}</span>
                  </div>
                  <p className="font-semibold text-foreground mt-1">{entry.action}</p>
                  <p className="text-muted-foreground text-[11px] truncate">{entry.resource}</p>
                  <p className="font-mono text-[10px] text-muted-foreground/70 mt-1 truncate">
                    hash {entry.hash}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
