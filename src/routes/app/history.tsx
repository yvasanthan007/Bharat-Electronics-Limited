import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, ClipboardCheck, FileClock, XCircle } from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import {
  AssetIcon,
  PageHeader,
  Panel,
  RequestBadge,
  SeverityBadge,
} from "@/components/bel/primitives";
import { getAsset, getUser, useBel } from "@/lib/bel-store";

export const Route = createFileRoute("/app/history")({
  head: () => ({
    meta: [
      { title: "Approval History — BEL Digital Trust" },
      { name: "description", content: "Historical record of access decisions and managerial reviews." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <AppShell>
      <HistoryContent />
    </AppShell>
  );
}

function HistoryContent() {
  const { requests } = useBel();
  const historyList = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Approval History &amp; Decision Logs"
        subtitle="Permanent chronological log of all approved, rejected, and clarified access requests."
        action={
          <Link
            to="/app/approvals"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <ClipboardCheck className="size-4" /> Pending Approvals
          </Link>
        }
      />

      <Panel title={`Decided Requests (${historyList.length})`} description="Fully recorded and hash-chained in the ledger">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="pb-3 font-semibold">Request ID</th>
                <th className="pb-3 font-semibold">Employee</th>
                <th className="pb-3 font-semibold">Asset</th>
                <th className="pb-3 font-semibold">Level</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Decided By</th>
                <th className="pb-3 font-semibold">Reason / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {historyList.map((req) => {
                const reqUser = getUser(req.userId);
                const asset = getAsset(req.assetId);
                return (
                  <tr key={req.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-4 font-mono text-xs font-bold text-accent">{req.id}</td>
                    <td className="py-4 font-medium">{reqUser?.name}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <AssetIcon icon={asset.icon} className="size-7" />
                        <span>{asset.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-xs font-semibold">{req.level}</td>
                    <td className="py-4">
                      <RequestBadge status={req.status} />
                    </td>
                    <td className="py-4 text-xs text-muted-foreground">{req.decidedBy ?? "System"}</td>
                    <td className="py-4 text-xs text-muted-foreground max-w-xs truncate">
                      {req.note || req.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
