import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileClock,
  Fingerprint,
  HelpCircle,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import {
  AssetIcon,
  ClassificationBadge,
  PageHeader,
  Panel,
  Pill,
  RequestBadge,
  SeverityBadge,
} from "@/components/bel/primitives";
import {
  actions,
  getAsset,
  getUser,
  useBel,
  type AccessRequest,
  type RequestStatus,
} from "@/lib/bel-store";

export const Route = createFileRoute("/app/approvals")({
  head: () => ({
    meta: [
      { title: "Access Approvals — BEL Digital Trust" },
      { name: "description", content: "Review, risk-score, and decide employee access requests." },
    ],
  }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  return (
    <AppShell>
      <ApprovalsContent />
    </AppShell>
  );
}

function ApprovalsContent() {
  const { currentUserId, requests } = useBel();
  const user = getUser(currentUserId);
  const [selectedReq, setSelectedReq] = useState<AccessRequest | null>(null);
  const [decisionNote, setDecisionNote] = useState("");

  if (!user) return null;

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  const handleDecision = (status: RequestStatus) => {
    if (!selectedReq) return;
    actions.decide(selectedReq.id, status, decisionNote || `Decided by ${user.name}`, user.name);
    setSelectedReq(null);
    setDecisionNote("");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pending Access Approvals"
        subtitle="Evaluate employee permission requests with full identity attestation and risk context."
        action={
          <Link
            to="/app/history"
            className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <FileClock className="size-4" /> Approval History
          </Link>
        }
      />

      {/* Main Pending Table */}
      <Panel title={`Requests Requiring Action (${pendingRequests.length})`} description="Click Review to inspect full security telemetry before deciding">
        {pendingRequests.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            <CheckCircle2 className="size-10 text-success mx-auto mb-2" />
            <p className="font-semibold text-foreground">Queue is completely clear</p>
            <p className="mt-1">All employee access requests have been reviewed and decided.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-3 font-semibold">Request ID</th>
                  <th className="pb-3 font-semibold">Employee</th>
                  <th className="pb-3 font-semibold">Asset Requested</th>
                  <th className="pb-3 font-semibold">Level</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Risk Level</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingRequests.map((req) => {
                  const reqUser = getUser(req.userId);
                  const asset = getAsset(req.assetId);
                  return (
                    <tr key={req.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-4 font-mono text-xs font-bold text-accent">{req.id}</td>
                      <td className="py-4">
                        <p className="font-semibold">{reqUser?.name}</p>
                        <p className="text-xs text-muted-foreground">{reqUser?.department}</p>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <AssetIcon icon={asset.icon} className="size-8" />
                          <span className="font-medium">{asset.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold">{req.level}</td>
                      <td className="py-4 text-xs text-muted-foreground">{req.date}</td>
                      <td className="py-4">
                        <SeverityBadge level={req.risk} />
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setDecisionNote("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                        >
                          <Eye className="size-3.5" /> Review Request
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Review Modal / Drawer */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border bg-card p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-accent">{selectedReq.id}</span>
                <h2 className="text-xl font-bold mt-1">Access Request Review</h2>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="rounded-lg p-2 hover:bg-secondary text-muted-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Employee info */}
            {(() => {
              const reqUser = getUser(selectedReq.userId);
              const asset = getAsset(selectedReq.assetId);

              return (
                <div className="space-y-6">
                  {/* Section 1: Employee Information */}
                  <div className="rounded-2xl border bg-secondary/30 p-4 space-y-2 text-xs">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                      <User className="size-4" /> Employee Identity Context
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div>
                        <span className="text-muted-foreground block">Name:</span>
                        <strong className="text-foreground">{reqUser?.name}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Employee ID:</span>
                        <strong className="font-mono">{reqUser?.employeeId}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Department:</span>
                        <span>{reqUser?.department}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">DID Status:</span>
                        <span className="text-success font-semibold flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Requested Access & Reason */}
                  <div className="rounded-2xl border bg-secondary/30 p-4 space-y-3 text-xs">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                      <KeyRound className="size-4" /> Target Resource &amp; Justification
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AssetIcon icon={asset.icon} className="size-9" />
                        <div>
                          <p className="font-semibold text-sm">{asset.name}</p>
                          <p className="text-muted-foreground">{asset.type} · Level: {selectedReq.level}</p>
                        </div>
                      </div>
                      <ClassificationBadge level={asset.classification} />
                    </div>

                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground block mb-1">Business Reason Provided:</span>
                      <p className="rounded-lg bg-card p-3 border text-xs text-foreground/90 leading-relaxed italic">
                        "{selectedReq.reason}"
                      </p>
                    </div>
                  </div>

                  {/* Section 3: Risk Assessment */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="size-5 text-accent" />
                      <div>
                        <p className="font-semibold text-xs">Security Risk Rating</p>
                        <p className="text-[11px] text-muted-foreground">Calculated from classification &amp; privilege elevation</p>
                      </div>
                    </div>
                    <SeverityBadge level={selectedReq.risk} />
                  </div>

                  {/* Decision Note */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Decision Note / Approver Comment (Optional)
                    </label>
                    <input
                      type="text"
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      placeholder="Add an optional explanation or sign-off condition..."
                      className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Decision Panel Buttons */}
                  <div className="grid gap-3 sm:grid-cols-3 pt-2 border-t">
                    <button
                      onClick={() => handleDecision("approved")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-success text-success-foreground px-4 py-3 text-sm font-bold shadow-sm hover:bg-success/90 transition-colors"
                    >
                      <CheckCircle2 className="size-4" /> Approve Access
                    </button>
                    <button
                      onClick={() => handleDecision("info")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-warning-soft text-warning-foreground border border-warning/30 px-4 py-3 text-sm font-semibold hover:bg-warning hover:text-warning-foreground transition-colors"
                    >
                      <HelpCircle className="size-4" /> Request Info
                    </button>
                    <button
                      onClick={() => handleDecision("rejected")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-danger-soft text-danger border border-danger/30 px-4 py-3 text-sm font-semibold hover:bg-danger hover:text-danger-foreground transition-colors"
                    >
                      <XCircle className="size-4" /> Reject Request
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
