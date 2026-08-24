import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, ShieldAlert, Sparkles } from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import { PageHeader, Panel, Pill } from "@/components/bel/primitives";
import { actions, useBel } from "@/lib/bel-store";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — BEL Digital Trust" },
      { name: "description", content: "Notifications and alerts regarding your access requests and security policies." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <AppShell>
      <NotificationsContent />
    </AppShell>
  );
}

function NotificationsContent() {
  const { notifications } = useBel();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = notifications.filter((n) => (filter === "all" ? true : !n.read));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Notification Center"
        subtitle="System alerts, workflow decision notices, and policy update notifications."
        action={
          <button
            onClick={() => actions.markAllRead()}
            className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <CheckCheck className="size-4" /> Mark all as read
          </button>
        }
      />

      <Panel>
        <div className="flex items-center gap-2 pb-6 border-b">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === "unread"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread ({notifications.filter((n) => !n.read).length})
          </button>
        </div>

        <div className="divide-y pt-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Bell className="size-8 text-muted-foreground/50 mx-auto mb-2" />
              No notifications to display.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`py-4 flex items-start gap-4 transition-colors ${
                  !item.read ? "bg-accent/5 -mx-5 px-5 rounded-xl" : ""
                }`}
              >
                <span className="grid size-9 place-items-center rounded-xl bg-secondary shrink-0 mt-0.5">
                  <Bell className="size-4 text-primary" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                      <Pill tone={item.tone} className="text-[10px] py-0.2">
                        {item.tone.toUpperCase()}
                      </Pill>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
