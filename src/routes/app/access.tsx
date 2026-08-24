import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, Plus, Search, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import {
  AccessBadge,
  AssetIcon,
  PageHeader,
  Panel,
  Pill,
} from "@/components/bel/primitives";
import {
  getAsset,
  getUser,
  useBel,
  type AccessStatus,
} from "@/lib/bel-store";

export const Route = createFileRoute("/app/access")({
  head: () => ({
    meta: [
      { title: "Access Management — BEL Digital Trust" },
      { name: "description", content: "View and manage active, pending, and historical access permissions." },
    ],
  }),
  component: AccessPage,
});

function AccessPage() {
  return (
    <AppShell>
      <AccessContent />
    </AppShell>
  );
}

function AccessContent() {
  const { currentUserId, permissions } = useBel();
  const user = getUser(currentUserId);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  if (!user) return null;

  const relevantPermissions =
    user.role === "admin"
      ? permissions
      : user.role === "manager"
        ? permissions
        : permissions.filter((p) => p.userId === user.id);

  const filtered = relevantPermissions.filter((p) => {
    const asset = getAsset(p.assetId);
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      p.level.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title={user.role === "employee" ? "My Access Permissions" : "Access Governance & Entitlements"}
        subtitle="Audited role-based and ephemeral access entitlements granted across enterprise assets."
        action={
          <Link
            to="/app/request"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" /> Request New Access
          </Link>
        }
      />

      <Panel>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search resource or level..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["all", "active", "pending", "expired", "revoked"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  filter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Table */}
        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="pb-3 font-semibold">Resource / Asset</th>
                {user.role !== "employee" && <th className="pb-3 font-semibold">User</th>}
                <th className="pb-3 font-semibold">Access Level</th>
                <th className="pb-3 font-semibold">Granted By</th>
                <th className="pb-3 font-semibold">Granted Date</th>
                <th className="pb-3 font-semibold">Expiry Date</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">
                    No access permissions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const asset = getAsset(p.assetId);
                  const pUser = getUser(p.userId);
                  return (
                    <tr key={p.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <AssetIcon icon={asset.icon} className="size-9" />
                          <div>
                            <p className="font-semibold">{asset.name}</p>
                            <p className="text-xs text-muted-foreground">{asset.type}</p>
                          </div>
                        </div>
                      </td>
                      {user.role !== "employee" && (
                        <td className="py-4 font-medium text-xs">
                          {pUser?.name}
                          <span className="block text-muted-foreground font-mono text-[10px]">
                            {pUser?.employeeId}
                          </span>
                        </td>
                      )}
                      <td className="py-4 font-medium text-xs">{p.level}</td>
                      <td className="py-4 text-xs text-muted-foreground">{p.grantedBy}</td>
                      <td className="py-4 text-xs text-muted-foreground">{p.grantedDate}</td>
                      <td className="py-4 text-xs text-muted-foreground">{p.expiry}</td>
                      <td className="py-4">
                        <AccessBadge status={p.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
