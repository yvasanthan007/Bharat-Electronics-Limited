import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes, Filter, KeyRound, Plus, Search, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import {
  AssetIcon,
  ClassificationBadge,
  PageHeader,
  Panel,
  Pill,
} from "@/components/bel/primitives";
import {
  ASSETS,
  getUser,
  useBel,
  type Asset,
  type Classification,
} from "@/lib/bel-store";

export const Route = createFileRoute("/app/assets")({
  head: () => ({
    meta: [
      { title: "Digital Asset Management — BEL Digital Trust" },
      { name: "description", content: "Catalog of classified enterprise systems, databases, and document vaults." },
    ],
  }),
  component: AssetsPage,
});

function AssetsPage() {
  return (
    <AppShell>
      <AssetsContent />
    </AppShell>
  );
}

function AssetsContent() {
  const { currentUserId, permissions } = useBel();
  const user = getUser(currentUserId);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  if (!user) return null;

  const filteredAssets = ASSETS.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.owner.toLowerCase().includes(search.toLowerCase()) ||
      asset.type.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || asset.classification === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Digital Asset Inventory"
        subtitle="Enterprise data sources, databases, repositories, and applications governed by classification policy."
        action={
          <Link
            to="/app/request"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-4" /> Request Access
          </Link>
        }
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets by name or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-card pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["all", "Public", "Internal", "Confidential", "Restricted"].map((cls) => (
            <button
              key={cls}
              onClick={() => setFilter(cls)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                filter === cls
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAssets.map((asset) => {
          const userPerm = permissions.find(
            (p) => p.userId === user.id && p.assetId === asset.id && p.status === "active",
          );

          return (
            <div
              key={asset.id}
              className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <AssetIcon icon={asset.icon} />
                  <ClassificationBadge level={asset.classification} />
                </div>

                <h3 className="font-bold text-base mt-4">{asset.name}</h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{asset.type}</p>
                <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                  {asset.description}
                </p>

                <div className="mt-5 space-y-1.5 border-t pt-4 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Owner:</span>
                    <strong className="text-foreground">{asset.owner}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Authorized Users:</span>
                    <strong className="text-foreground">{asset.authorizedUsers} identities</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span>{asset.updated}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex items-center justify-between gap-2">
                {userPerm ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                    <ShieldCheck className="size-4" /> Active ({userPerm.level})
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">No active access</span>
                )}

                <Link
                  to="/app/request"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {userPerm ? "Elevate" : "Request Access"} <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
