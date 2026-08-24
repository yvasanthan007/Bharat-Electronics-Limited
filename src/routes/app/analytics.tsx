import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  FileText,
  LineChart,
  PieChart,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import { PageHeader, Panel, Pill, StatCard } from "@/components/bel/primitives";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({
    meta: [
      { title: "Security Analytics — BEL Digital Trust" },
      { name: "description", content: "Access patterns, approval velocity, asset utilization, and AI security insights." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <AppShell>
      <AnalyticsContent />
    </AppShell>
  );
}

function AnalyticsContent() {
  const insights = [
    {
      tone: "info" as const,
      title: "Access Request Velocity",
      text: "Access requests increased by 22% this month across the R&D and Data Analytics divisions.",
    },
    {
      tone: "warning" as const,
      title: "Pending Approval Cluster",
      text: "The Research Department has the highest concentration of pending access authorizations (68%).",
    },
    {
      tone: "danger" as const,
      title: "Suspicious Attempt Flag",
      text: "Three unusual off-network access attempts were detected and neutralized within the past 48 hours.",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Security &amp; Access Analytics"
        subtitle="Operational metrics, authorization patterns, and proactive AI-assisted anomaly detection."
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Approval Velocity"
          value="4.2 hrs"
          hint="-35% vs last month"
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Approval Ratio"
          value="87.4%"
          hint="12.6% rejected/info"
          icon={CheckCircle2}
          tone="info"
        />
        <StatCard
          label="High-Risk Requests"
          value="6.1%"
          hint="Restricted tier elevation"
          icon={ShieldAlert}
          tone="warning"
        />
        <StatCard
          label="Audit Hash Rate"
          value="100%"
          hint="Zero dropped commits"
          icon={LineChart}
          tone="success"
        />
      </div>

      {/* AI Security Insights Panel */}
      <div className="rounded-3xl border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground shadow-sm">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold">BEL AI Security Insights</h2>
            <p className="text-xs text-muted-foreground">Synthesized from live identity, access, and audit ledger feeds</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 pt-2">
          {insights.map((item) => (
            <div key={item.title} className="rounded-2xl border bg-card p-4 shadow-sm space-y-2">
              <Pill tone={item.tone} className="text-[11px] py-0.5">{item.title}</Pill>
              <p className="text-xs text-foreground/90 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytical Breakdown Charts / Visual Data */}
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Access Decisions Breakdown" description="Outcome distribution across all requested permissions">
          <div className="space-y-4 pt-2">
            {[
              { label: "Approved Grants", count: "148 requests", pct: 74, tone: "bg-success" },
              { label: "Rejected Requests", count: "28 requests", pct: 14, tone: "bg-danger" },
              { label: "More Info Required", count: "16 requests", pct: 8, tone: "bg-warning" },
              { label: "Auto-Revoked Expiries", count: "8 requests", pct: 4, tone: "bg-muted-foreground" },
            ].map((bar) => (
              <div key={bar.label} className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">{bar.label}</span>
                  <span className="text-muted-foreground">{bar.count} ({bar.pct}%)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full rounded-full ${bar.tone}`} style={{ width: `${bar.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Active Access by Department" description="Distribution of identity authorizations">
          <div className="space-y-4 pt-2">
            {[
              { dept: "Research & Development", count: "114 active grants", pct: 42, tone: "bg-accent" },
              { dept: "Finance Operations", count: "68 active grants", pct: 25, tone: "bg-info" },
              { dept: "Programme & Engineering", count: "52 active grants", pct: 19, tone: "bg-primary" },
              { dept: "People Operations", count: "38 active grants", pct: 14, tone: "bg-success" },
            ].map((d) => (
              <div key={d.dept} className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">{d.dept}</span>
                  <span className="text-muted-foreground">{d.count}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full rounded-full ${d.tone}`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
