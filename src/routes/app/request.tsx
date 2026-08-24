import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  KeyRound,
  Lock,
  Plus,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/bel/AppShell";
import {
  AssetIcon,
  ClassificationBadge,
  PageHeader,
  Panel,
  Pill,
} from "@/components/bel/primitives";
import {
  actions,
  ASSETS,
  getAsset,
  getUser,
  useBel,
  type Asset,
} from "@/lib/bel-store";

export const Route = createFileRoute("/app/request")({
  head: () => ({
    meta: [
      { title: "Request Access — BEL Digital Trust" },
      { name: "description", content: "Context-aware access request workflow with manager approval routing." },
    ],
  }),
  component: RequestPage,
});

function RequestPage() {
  return (
    <AppShell>
      <RequestWizard />
    </AppShell>
  );
}

const ACCESS_LEVELS = [
  { level: "View", desc: "Read-only access to browse and inspect resource contents." },
  { level: "Download", desc: "Permission to export or download copies for local analysis." },
  { level: "Edit", desc: "Read, write, and modify resource contents and schemas." },
  { level: "Admin", desc: "Full administrative access including user delegation and settings." },
];

function RequestWizard() {
  const { currentUserId } = useBel();
  const user = getUser(currentUserId);
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("a-res");
  const [selectedLevel, setSelectedLevel] = useState<string>("Edit");
  const [reason, setReason] = useState<string>(
    "Requires edit permission to input upcoming prototype experiment results for the quarterly R&D audit.",
  );
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!user) return null;

  const selectedAsset = getAsset(selectedAssetId);

  const handleSubmit = () => {
    const id = actions.submitRequest({
      userId: user.id,
      assetId: selectedAssetId,
      level: selectedLevel,
      reason,
    });
    setSubmittedId(id);
  };

  if (submittedId) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <span className="grid size-20 place-items-center rounded-3xl bg-success-soft text-success mx-auto shadow-sm">
          <CheckCircle2 className="size-10" />
        </span>
        <div>
          <Pill tone="warning" className="mb-3">
            <Clock className="size-3.5" /> Pending Manager Approval
          </Pill>
          <h1 className="text-3xl font-bold">Access Request Submitted Successfully</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your request <strong>{submittedId}</strong> for <strong>{selectedAsset.name} ({selectedLevel})</strong> has
            been hash-chained into the audit ledger and dispatched to your line manager for review.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 text-left text-xs space-y-2 max-w-md mx-auto shadow-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Request ID:</span>
            <strong className="font-mono text-accent">{submittedId}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Resource:</span>
            <span className="font-semibold">{selectedAsset.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Privilege Level:</span>
            <span>{selectedLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ledger Status:</span>
            <span className="text-success font-semibold">Integrity Verified</span>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <Link
            to="/app/access"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            View My Access List
          </Link>
          <button
            onClick={() => {
              setSubmittedId(null);
              setStep(1);
            }}
            className="rounded-xl border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Request Resource Access"
        subtitle="Submit a contextual, auditable request for enterprise resource permissions."
      />

      {/* Stepper Header */}
      <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-center border-b pb-4">
        {[
          { num: 1, label: "Select Resource" },
          { num: 2, label: "Access Level" },
          { num: 3, label: "Business Reason" },
          { num: 4, label: "Review & Submit" },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center justify-center gap-2 pb-1 ${
              step === s.num
                ? "text-primary font-bold border-b-2 border-primary -mb-4 pb-3"
                : step > s.num
                  ? "text-success"
                  : "text-muted-foreground"
            }`}
          >
            <span
              className={`grid size-6 place-items-center rounded-full text-xs ${
                step === s.num
                  ? "bg-primary text-primary-foreground"
                  : step > s.num
                    ? "bg-success-soft text-success"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {step > s.num ? <Check className="size-3" /> : s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Select Resource */}
      {step === 1 && (
        <Panel title="Step 1 — Select Target Digital Asset" description="Choose the resource you require access to">
          <div className="grid gap-3 sm:grid-cols-2">
            {ASSETS.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setSelectedAssetId(asset.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-start gap-4 ${
                  selectedAssetId === asset.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "bg-card hover:bg-secondary/40"
                }`}
              >
                <AssetIcon icon={asset.icon} className="size-10" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm truncate">{asset.name}</h3>
                    <ClassificationBadge level={asset.classification} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{asset.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              Continue to Access Level <ArrowRight className="size-4" />
            </button>
          </div>
        </Panel>
      )}

      {/* Step 2: Select Access Level */}
      {step === 2 && (
        <Panel title="Step 2 — Select Required Access Level" description={`Configuring privilege tier for ${selectedAsset.name}`}>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACCESS_LEVELS.map((item) => (
              <div
                key={item.level}
                onClick={() => setSelectedLevel(item.level)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  selectedLevel === item.level
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "bg-card hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base">{item.level}</h3>
                  {selectedLevel === item.level && (
                    <span className="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              Continue to Justification <ArrowRight className="size-4" />
            </button>
          </div>
        </Panel>
      )}

      {/* Step 3: Provide Business Reason */}
      {step === 3 && (
        <Panel title="Step 3 — Provide Business Justification" description="Explain why you require this specific permission level">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Business Reason / Project Mandate
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the business need, project task, and why this level is necessary..."
                className="w-full rounded-xl border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                This justification will be permanently stamped into the immutable audit record.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="size-4" /> Back
            </button>
            <button
              disabled={!reason.trim()}
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Continue to Review <ArrowRight className="size-4" />
            </button>
          </div>
        </Panel>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <Panel title="Step 4 — Review &amp; Submit Request" description="Verify all details before submitting for line manager approval">
          <div className="space-y-6">
            <div className="rounded-2xl border bg-secondary/30 p-6 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-muted-foreground">Target Asset:</span>
                <span className="font-bold flex items-center gap-2">
                  {selectedAsset.name}
                  <ClassificationBadge level={selectedAsset.classification} />
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-muted-foreground">Privilege Level:</span>
                <strong className="text-foreground font-semibold">{selectedLevel}</strong>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-muted-foreground">Requesting Identity:</span>
                <span>
                  {user.name} ({user.employeeId})
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Reason:</span>
                <p className="rounded-lg bg-card p-3 border text-xs text-foreground/90 leading-relaxed">
                  {reason}
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="size-4" /> Back
              </button>
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                <ShieldCheck className="size-4" /> Submit Access Request
              </button>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
