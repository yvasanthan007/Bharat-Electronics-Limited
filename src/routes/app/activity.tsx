import { createFileRoute } from "@tanstack/react-router";
import { Activity, CheckCircle2, Clock, Filter, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import { PageHeader, Panel, Pill } from "@/components/bel/primitives";
import { useBel } from "@/lib/bel-store";

export const Route = createFileRoute("/app/activity")({
  head: () => ({
    meta: [
      { title: "Activity Feed — BEL Digital Trust" },
      { name: "description", content: "Real-time log of security, identity, and authorization events." },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  return (
    <AppShell>
      <ActivityContent />
    </AppShell>
  );
}

function ActivityContent() {
  const { activity } = useBel();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Personal &amp; Security Activity"
        subtitle="Chronological trail of session attestations, resource lookups, and access request statuses."
      />

      <Panel title="Recent Activity Events" description="Events logged for your active session and identity">
        <div className="space-y-6 pt-2">
          {activity.map((item) => (
            <div key={item.id} className="flex items-start gap-4 text-sm pb-4 border-b last:border-0 last:pb-0">
              <span className="grid size-9 place-items-center rounded-xl bg-accent/10 text-accent shrink-0 mt-0.5">
                <Activity className="size-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-foreground">{item.text}</h4>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                <div className="mt-2">
                  <Pill tone={item.tone} className="text-[10px] py-0.5">
                    {item.tone === "success" ? "Verified Event" : item.tone === "warning" ? "Under Review" : "Info"}
                  </Pill>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
