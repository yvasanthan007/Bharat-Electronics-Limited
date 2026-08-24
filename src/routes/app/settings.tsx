import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, Cog, Fingerprint, Lock, Shield, Smartphone, User } from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import { PageHeader, Panel, Pill } from "@/components/bel/primitives";
import { getUser, ROLE_LABEL, useBel } from "@/lib/bel-store";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — BEL Digital Trust" },
      { name: "description", content: "Manage security preferences, MFA authenticators, and notification channels." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell>
      <SettingsContent />
    </AppShell>
  );
}

function SettingsContent() {
  const { currentUserId } = useBel();
  const user = getUser(currentUserId);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [securityEscalations, setSecurityEscalations] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("15");

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="Account &amp; Security Settings"
        subtitle="Configure your hardware authentication rules, session bounds, and notification preferences."
      />

      <Panel title="Identity Profile Details" description="Enterprise identity attributes synchronized via directory service">
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div>
            <span className="text-muted-foreground block">Full Name:</span>
            <strong className="text-sm text-foreground">{user.name}</strong>
          </div>
          <div>
            <span className="text-muted-foreground block">Corporate Email:</span>
            <strong className="text-sm text-foreground">{user.email}</strong>
          </div>
          <div>
            <span className="text-muted-foreground block">Employee Identifier:</span>
            <span className="font-mono text-sm">{user.employeeId}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Department / Role:</span>
            <span className="text-sm">{user.department} ({ROLE_LABEL[user.role]})</span>
          </div>
        </div>
      </Panel>

      <Panel title="Authentication &amp; Session Bounds" description="Hardware security token rules and idle session timeouts">
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl border bg-secondary/30">
            <div>
              <p className="font-semibold text-sm">Hardware Token MFA Enforcement</p>
              <p className="text-muted-foreground">Mandatory FIDO2 WebAuthn prompt on high-risk operations</p>
            </div>
            <Pill tone="success">Always Enforced</Pill>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border bg-secondary/30">
            <div>
              <p className="font-semibold text-sm">Workstation Inactivity Timeout</p>
              <p className="text-muted-foreground">Automatically lock session after period of no user interaction</p>
            </div>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold focus:outline-none"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>
      </Panel>

      <Panel title="Notification Channels" description="Where you receive access approval notices and security alerts">
        <div className="space-y-4 text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-xl border bg-secondary/30 cursor-pointer">
            <div>
              <p className="font-semibold text-sm">Instant Email Notifications</p>
              <p className="text-muted-foreground">Send real-time alerts when access requests are submitted or approved</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="size-4 rounded text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border bg-secondary/30 cursor-pointer">
            <div>
              <p className="font-semibold text-sm">Critical Security Escalations</p>
              <p className="text-muted-foreground">Receive high-priority SMS / app push for anomalous access events</p>
            </div>
            <input
              type="checkbox"
              checked={securityEscalations}
              onChange={(e) => setSecurityEscalations(e.target.checked)}
              className="size-4 rounded text-primary focus:ring-primary"
            />
          </label>
        </div>
      </Panel>
    </div>
  );
}
