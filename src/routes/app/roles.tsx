import { createFileRoute } from "@tanstack/react-router";
import { Check, CheckCircle2, Shield, ShieldAlert, User, UserCheck, UserCog, Users, X } from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import { PageHeader, Panel, Pill } from "@/components/bel/primitives";

export const Route = createFileRoute("/app/roles")({
  head: () => ({
    meta: [
      { title: "Role-Based Access Control — BEL Digital Trust" },
      { name: "description", content: "RBAC hierarchy, permissions matrix, and role assignment governance." },
    ],
  }),
  component: RolesPage,
});

function RolesPage() {
  return (
    <AppShell>
      <RolesContent />
    </AppShell>
  );
}

function RolesContent() {
  const roles = [
    {
      title: "Employee",
      icon: User,
      tone: "info" as const,
      desc: "Standard corporate identity with self-service asset discovery and request capabilities.",
      perms: [
        "View own digital identity and credentials",
        "Browse authorized digital asset catalog",
        "Submit access elevation requests",
        "View personal activity and audit trail",
      ],
    },
    {
      title: "Manager / Approver",
      icon: UserCheck,
      tone: "success" as const,
      desc: "Line authorization lead responsible for reviewing and approving team requests.",
      perms: [
        "Review incoming team access requests",
        "Approve or reject with mandatory justification",
        "View department approval history",
        "Monitor team active permissions",
      ],
    },
    {
      title: "Security Administrator",
      icon: ShieldAlert,
      tone: "warning" as const,
      desc: "Platform governance lead overseeing identities, policies, and ledger integrity.",
      perms: [
        "Provision & suspend enterprise users",
        "Configure RBAC matrices & security policies",
        "Inspect full tamper-evident audit ledger",
        "Real-time security telemetry & threat monitoring",
      ],
    },
  ];

  const matrix = [
    { feature: "View Own Identity", emp: "✓", mgr: "✓", adm: "✓" },
    { feature: "Request Access", emp: "✓", mgr: "✓", adm: "✓" },
    { feature: "Approve Requests", emp: "✗", mgr: "✓", adm: "✓" },
    { feature: "Manage Users", emp: "✗", mgr: "✗", adm: "✓" },
    { feature: "Manage Roles & Policies", emp: "✗", mgr: "✗", adm: "✓" },
    { feature: "View Audit Ledger", emp: "Personal", mgr: "Team", adm: "Full Ledger" },
    { feature: "Security Monitoring", emp: "✗", mgr: "Limited", adm: "Full Telemetry" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Role-Based Access Control (RBAC)"
        subtitle="Least-privilege permission matrix and role assignments enforced by the BEL policy engine."
      />

      {/* Role Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {roles.map((r) => (
          <div key={r.title} className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-accent">
                  <r.icon className="size-5" />
                </span>
                <h3 className="font-bold text-lg">{r.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{r.desc}</p>
              <ul className="mt-5 space-y-2 border-t pt-4 text-xs">
                {r.perms.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-foreground/90">
                    <Check className="size-3.5 text-success shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <Panel title="Enterprise Permission Matrix" description="System capability access across role tiers">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="pb-3 font-semibold">Feature / Capability</th>
                <th className="pb-3 font-semibold text-center">Employee</th>
                <th className="pb-3 font-semibold text-center">Manager</th>
                <th className="pb-3 font-semibold text-center">Security Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {matrix.map((row) => (
                <tr key={row.feature} className="hover:bg-secondary/40 transition-colors">
                  <td className="py-4 font-semibold text-xs sm:text-sm">{row.feature}</td>
                  <td className="py-4 text-center">
                    {row.emp === "✓" ? (
                      <span className="inline-grid size-6 place-items-center rounded-full bg-success-soft text-success text-xs font-bold">
                        ✓
                      </span>
                    ) : row.emp === "✗" ? (
                      <span className="inline-grid size-6 place-items-center rounded-full bg-muted text-muted-foreground text-xs">
                        —
                      </span>
                    ) : (
                      <Pill tone="info" className="text-[11px] py-0.5">{row.emp}</Pill>
                    )}
                  </td>
                  <td className="py-4 text-center">
                    {row.mgr === "✓" ? (
                      <span className="inline-grid size-6 place-items-center rounded-full bg-success-soft text-success text-xs font-bold">
                        ✓
                      </span>
                    ) : row.mgr === "✗" ? (
                      <span className="inline-grid size-6 place-items-center rounded-full bg-muted text-muted-foreground text-xs">
                        —
                      </span>
                    ) : (
                      <Pill tone="info" className="text-[11px] py-0.5">{row.mgr}</Pill>
                    )}
                  </td>
                  <td className="py-4 text-center">
                    {row.adm === "✓" ? (
                      <span className="inline-grid size-6 place-items-center rounded-full bg-success-soft text-success text-xs font-bold">
                        ✓
                      </span>
                    ) : row.adm === "✗" ? (
                      <span className="inline-grid size-6 place-items-center rounded-full bg-muted text-muted-foreground text-xs">
                        —
                      </span>
                    ) : (
                      <Pill tone="success" className="text-[11px] py-0.5">{row.adm}</Pill>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
