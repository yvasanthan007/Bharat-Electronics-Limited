import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Fingerprint,
  KeyRound,
  QrCode,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  User,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import { PageHeader, Panel, Pill } from "@/components/bel/primitives";
import { getUser, ROLE_LABEL, useBel, USERS } from "@/lib/bel-store";

export const Route = createFileRoute("/app/identity")({
  head: () => ({
    meta: [
      { title: "Digital Identity — BEL Digital Trust" },
      { name: "description", content: "Cryptographically verified digital identity profile and attestation." },
    ],
  }),
  component: IdentityPage,
});

function IdentityPage() {
  return (
    <AppShell>
      <IdentityContent />
    </AppShell>
  );
}

function IdentityContent() {
  const { currentUserId } = useBel();
  const user = getUser(currentUserId);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        title={user.role === "admin" ? "Enterprise Identity Governance" : "My Digital Identity"}
        subtitle="Cryptographically anchored W3C decentralized identifier and multi-factor attestation."
      />

      {/* Identity Card */}
      <div className="rounded-3xl border surface-navy p-8 sm:p-10 shadow-[var(--shadow-lift)] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Fingerprint className="size-80 text-white" />
        </div>

        <div className="relative z-10 grid gap-8 md:grid-cols-12 items-center">
          <div className="md:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <span className="grid size-20 place-items-center rounded-2xl bg-white/10 text-white font-extrabold text-2xl border border-white/20">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-success text-success-foreground">
                <CheckCircle2 className="size-4" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <Pill tone="success" className="bg-success/20 text-success border-success/40">
                  <ShieldCheck className="size-3.5" /> Verified Identity
                </Pill>
              </div>
              <p className="text-sm text-navy-foreground/75 mt-1">
                {user.title} · {user.department}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono">
                <span className="rounded-lg bg-white/10 px-3 py-1.5 text-navy-foreground border border-white/15">
                  ID: {user.employeeId}
                </span>
                <span className="rounded-lg bg-white/10 px-3 py-1.5 text-navy-foreground border border-white/15">
                  {user.identityId}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 rounded-2xl bg-white/10 border border-white/15 p-5 text-xs text-navy-foreground/80 space-y-2">
            <div className="flex justify-between">
              <span>Authentication Level:</span>
              <strong className="text-white">Tier-3 (Hardware MFA)</strong>
            </div>
            <div className="flex justify-between">
              <span>Last Verified:</span>
              <strong className="text-white">Today · Biometric PASS</strong>
            </div>
            <div className="flex justify-between">
              <span>Corporate Role:</span>
              <strong className="text-white">{ROLE_LABEL[user.role]}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Authentication Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Security & Authentication Factors" description="Configured identity verification authenticators">
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl border bg-secondary/30">
              <div className="flex items-center gap-3">
                <Fingerprint className="size-5 text-accent" />
                <div>
                  <p className="font-semibold text-xs sm:text-sm">Biometric WebAuthn (Touch ID / Windows Hello)</p>
                  <p className="text-xs text-muted-foreground">Primary cryptographic authenticator</p>
                </div>
              </div>
              <Pill tone="success">Active</Pill>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-secondary/30">
              <div className="flex items-center gap-3">
                <Smartphone className="size-5 text-accent" />
                <div>
                  <p className="font-semibold text-xs sm:text-sm">Hardware Token / TOTP Authenticator</p>
                  <p className="text-xs text-muted-foreground">BEL Secure Authenticator App</p>
                </div>
              </div>
              <Pill tone="success">Enrolled</Pill>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-secondary/30">
              <div className="flex items-center gap-3">
                <KeyRound className="size-5 text-accent" />
                <div>
                  <p className="font-semibold text-xs sm:text-sm">Corporate Single Sign-On (SSO)</p>
                  <p className="text-xs text-muted-foreground">SAML 2.0 / OIDC Identity Provider</p>
                </div>
              </div>
              <Pill tone="info">Connected</Pill>
            </div>
          </div>
        </Panel>

        <Panel title="Active Workstation Sessions" description="Devices currently authorized for this digital identity">
          <div className="space-y-4 text-sm">
            <div className="p-3 rounded-xl border bg-secondary/30 flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs sm:text-sm">Primary Workstation · Windows 11 Enterprise</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">IP: 192.168.77.189 · Current active session</p>
              </div>
              <Pill tone="success">This Device</Pill>
            </div>

            <div className="p-3 rounded-xl border bg-secondary/30 flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs sm:text-sm">Secure Mobile Device · iOS 18</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">BEL Mobile Access Hub · Last active 2h ago</p>
              </div>
              <Pill tone="neutral">Idle</Pill>
            </div>
          </div>
        </Panel>
      </div>

      {user.role === "admin" ? (
        <Panel title="Organization Identity Directory" description="All enterprise identities managed in the trust ledger">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Employee ID</th>
                  <th className="pb-3 font-semibold">Decentralized ID</th>
                  <th className="pb-3 font-semibold">Department</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {USERS.map((u) => (
                  <tr key={u.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3 font-medium">{u.name}</td>
                    <td className="py-3 font-mono text-xs">{u.employeeId}</td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">{u.identityId}</td>
                    <td className="py-3 text-xs">{u.department}</td>
                    <td className="py-3">
                      <Pill tone={u.verified ? "success" : "danger"}>
                        {u.verified ? "Verified" : "Suspended"}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
