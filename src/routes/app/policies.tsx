import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Lock, Plus, ScrollText, Shield, ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import { PageHeader, Panel, Pill } from "@/components/bel/primitives";

export const Route = createFileRoute("/app/policies")({
  head: () => ({
    meta: [
      { title: "Access Policies — BEL Digital Trust" },
      { name: "description", content: "Zero-Trust policy rules governing data classification and access lifecycles." },
    ],
  }),
  component: PoliciesPage,
});

function PoliciesPage() {
  return (
    <AppShell>
      <PoliciesContent />
    </AppShell>
  );
}

function PoliciesContent() {
  const [policies, setPolicies] = useState([
    {
      id: "POL-101",
      name: "Restricted Tier Step-Up MFA Rule",
      desc: "Requires real-time hardware biometric challenge for any Edit or Admin action on Restricted assets.",
      classification: "Restricted",
      enforced: true,
      lastUpdated: "20 Aug 2026",
    },
    {
      id: "POL-102",
      name: "Ephemeral 90-Day Lifecycle Grant",
      desc: "All elevated permissions automatically expire after 90 days unless explicitly renewed with justification.",
      classification: "All",
      enforced: true,
      lastUpdated: "15 Aug 2026",
    },
    {
      id: "POL-103",
      name: "Off-Network Geofencing Block",
      desc: "Denies access to confidential and restricted records from non-whitelisted VPN / corporate networks.",
      classification: "Confidential & Restricted",
      enforced: true,
      lastUpdated: "12 Aug 2026",
    },
    {
      id: "POL-104",
      name: "Segregation of Duties (SoD) Enforcer",
      desc: "Prevents a single identity from simultaneously holding request creation and manager sign-off authority.",
      classification: "All",
      enforced: true,
      lastUpdated: "08 Aug 2026",
    },
  ]);

  const toggleEnforce = (id: string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enforced: !p.enforced } : p)),
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Security &amp; Access Policies"
        subtitle="Policy Decision Point (PDP) rules evaluated continuously across all resource requests."
        action={
          <button
            onClick={() => alert("Custom security policy builder is available for Security Administrators.")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" /> Create Policy Rule
          </button>
        }
      />

      <Panel title="Active Policy Enforcements" description="System-level policies actively compiled into the BEL engine">
        <div className="divide-y">
          {policies.map((p) => (
            <div key={p.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent shrink-0 mt-0.5">
                  <ScrollText className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-accent">{p.id}</span>
                    <h3 className="font-bold text-base">{p.name}</h3>
                    <Pill tone="info" className="text-[11px] py-0.5">{p.classification}</Pill>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">{p.desc}</p>
                  <p className="text-[11px] text-muted-foreground/75 mt-2">Last updated: {p.lastUpdated}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Pill tone={p.enforced ? "success" : "neutral"}>
                  {p.enforced ? "Enforced" : "Disabled"}
                </Pill>
                <button
                  onClick={() => toggleEnforce(p.id)}
                  className="rounded-lg border p-1.5 hover:bg-secondary transition-colors text-muted-foreground"
                  title="Toggle enforcement"
                >
                  {p.enforced ? (
                    <ToggleRight className="size-6 text-success" />
                  ) : (
                    <ToggleLeft className="size-6 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
