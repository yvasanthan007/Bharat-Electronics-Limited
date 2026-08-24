import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertOctagon, AlertTriangle, CheckCircle2, Filter, Radio, ShieldAlert, ShieldCheck, UserX } from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import { PageHeader, Panel, Pill, SeverityBadge, StatCard } from "@/components/bel/primitives";
import { SECURITY_EVENTS, type SecurityEvent, type Severity } from "@/lib/bel-store";

export const Route = createFileRoute("/app/monitoring")({
  head: () => ({
    meta: [
      { title: "Security Monitoring — BEL Digital Trust" },
      { name: "description", content: "Real-time threat monitoring, anomaly detection, and incident response." },
    ],
  }),
  component: MonitoringPage,
});

function MonitoringPage() {
  return (
    <AppShell>
      <MonitoringContent />
    </AppShell>
  );
}

function MonitoringContent() {
  const [events, setEvents] = useState<SecurityEvent[]>(SECURITY_EVENTS);
  const [filter, setFilter] = useState<string>("all");

  const filtered = events.filter((e) => (filter === "all" ? true : e.severity === filter));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Live Security Telemetry &amp; Monitoring"
        subtitle="Continuous behavioral analysis, abnormal request flagging, and automated incident containment."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Critical Incidents"
          value={events.filter((e) => e.severity === "Critical").length}
          hint="Immediate review"
          icon={AlertOctagon}
          tone="danger"
        />
        <StatCard
          label="High-Risk Signals"
          value={events.filter((e) => e.severity === "High").length}
          hint="Elevated scrutiny"
          icon={ShieldAlert}
          tone="warning"
        />
        <StatCard
          label="Automated Defenses"
          value="100%"
          hint="MFA rate-limiting active"
          icon={ShieldCheck}
          tone="success"
        />
        <StatCard
          label="Telemetry Stream"
          value="Active"
          hint="Sub-second log sync"
          icon={Radio}
          tone="info"
        />
      </div>

      {/* Event Stream */}
      <Panel title="Security Event Feed" description="Anomalous access behaviors detected across corporate infrastructure">
        <div className="flex items-center gap-2 pb-6 border-b overflow-x-auto">
          {["all", "Critical", "High", "Medium", "Low"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === sev
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="divide-y pt-2">
          {filtered.map((evt) => (
            <div key={evt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-accent">{evt.id}</span>
                  <h4 className="font-bold text-sm text-foreground">{evt.type}</h4>
                  <SeverityBadge level={evt.severity} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Target / Source: <span className="font-medium text-foreground">{evt.source}</span>
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Identity: {evt.user} · {evt.time}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => alert(`Incident investigation report opened for ${evt.id}.`)}
                  className="rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary transition-colors"
                >
                  Investigate
                </button>
                {evt.severity === "Critical" || evt.severity === "High" ? (
                  <button
                    onClick={() => alert(`Emergency temporary block applied to ${evt.user}.`)}
                    className="inline-flex items-center gap-1 rounded-lg bg-danger-soft text-danger border border-danger/30 px-3 py-1.5 text-xs font-semibold hover:bg-danger hover:text-danger-foreground transition-colors"
                  >
                    <UserX className="size-3" /> Contain
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
