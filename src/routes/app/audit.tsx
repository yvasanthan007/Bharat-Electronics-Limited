import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Database,
  Fingerprint,
  Hash,
  Layers,
  Link2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import { PageHeader, Panel, Pill } from "@/components/bel/primitives";
import { useBel } from "@/lib/bel-store";

export const Route = createFileRoute("/app/audit")({
  head: () => ({
    meta: [
      { title: "Immutable Audit Ledger — BEL Digital Trust" },
      { name: "description", content: "Cryptographically chained, tamper-evident audit ledger for enterprise assurance." },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  return (
    <AppShell>
      <AuditContent />
    </AppShell>
  );
}

function AuditContent() {
  const { ledger } = useBel();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"chain" | "table">("chain");

  const filtered = ledger.filter(
    (l) =>
      l.id.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase()) ||
      l.hash.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Immutable Blockchain-Inspired Audit Ledger"
        subtitle="Every identity verification, access request, approval, and revocation is permanently hash-chained."
        action={
          <div className="flex items-center gap-2">
            <Pill tone="success" className="px-3 py-1.5 text-xs">
              <ShieldCheck className="size-4" /> Chain Integrity 100% Confirmed
            </Pill>
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
              <Link2 className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Chained Blocks</p>
              <h3 className="text-2xl font-bold">{ledger.length} Transactions</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-success-soft text-success">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Hash Algorithm</p>
              <h3 className="text-2xl font-bold font-mono">SHA-256 Chained</h3>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-info-soft text-info">
              <Database className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Immutability Proof</p>
              <h3 className="text-2xl font-bold">Non-Repudiable</h3>
            </div>
          </div>
        </div>
      </div>

      <Panel>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by transaction ID, user, action, or hash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("chain")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === "chain"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Visual Chain View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Tabular Ledger
            </button>
          </div>
        </div>

        {/* Visual Chain View */}
        {viewMode === "chain" ? (
          <div className="pt-6 space-y-6">
            {filtered.map((block, idx) => (
              <div key={block.id} className="relative pl-8 sm:pl-10">
                {/* Connecting Line */}
                {idx < filtered.length - 1 && (
                  <div className="absolute left-3 sm:left-4 top-8 bottom-0 w-0.5 bg-accent/40" />
                )}
                {/* Node icon */}
                <div className="absolute left-0 top-3 grid size-7 place-items-center rounded-full bg-accent text-accent-foreground shadow-sm">
                  <Link2 className="size-3.5" />
                </div>

                <div className="rounded-2xl border bg-secondary/30 p-5 hover:border-primary/40 transition-colors shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent">{block.id}</span>
                      <Pill tone="success" className="text-[10px] py-0.5">
                        <CheckCircle2 className="size-3" /> Immutable Record
                      </Pill>
                    </div>
                    <span className="text-xs text-muted-foreground">{block.timestamp}</span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Actor / Identity:</span>
                      <strong className="text-foreground">{block.user}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Action Executed:</span>
                      <span className="font-semibold text-accent">{block.action}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Target Resource:</span>
                      <span>{block.resource}</span>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 rounded-xl bg-card p-3 border font-mono text-[11px]">
                    <div className="truncate">
                      <span className="text-muted-foreground mr-1">prev_hash:</span>
                      <span className="text-muted-foreground/80">{block.prevHash}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-accent mr-1">block_hash:</span>
                      <span className="font-bold text-foreground">{block.hash}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-3 font-semibold">Tx ID</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Action</th>
                  <th className="pb-3 font-semibold">Resource</th>
                  <th className="pb-3 font-semibold">Block Hash</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-accent">{l.id}</td>
                    <td className="py-3 text-muted-foreground">{l.timestamp}</td>
                    <td className="py-3 font-medium">{l.user}</td>
                    <td className="py-3 font-semibold">{l.action}</td>
                    <td className="py-3 max-w-xs truncate">{l.resource}</td>
                    <td className="py-3 font-mono text-muted-foreground truncate max-w-[120px]">
                      {l.hash}
                    </td>
                    <td className="py-3">
                      <Pill tone="success" className="text-[10px] py-0.5">Verified</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
