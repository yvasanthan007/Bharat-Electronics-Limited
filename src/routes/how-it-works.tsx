import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ClipboardCheck, Database, Fingerprint, Link2, ShieldCheck, UserCheck } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/bel/SiteChrome";
import { Pill } from "@/components/bel/primitives";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — BEL Digital Trust" },
      { name: "description", content: "Learn how BEL verifies identity, requests access, processes approvals, and records immutable audits." },
    ],
  }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      icon: Fingerprint,
      title: "Digital Identity Verification",
      actor: "Employee / Worker",
      desc: "Each user receives a cryptographically anchored Digital Identity (DID) paired with hardware token MFA, department metadata, and verified status.",
      detail: "Zero trust begins at the identity layer. No access can be requested without verified biometric or cryptographic key attestation.",
    },
    {
      num: "02",
      icon: ClipboardCheck,
      title: "Context-Driven Access Request",
      actor: "Employee / Worker",
      desc: "Users select the target digital asset (e.g. Research Database, Financial Analytics), choose the required permission tier (View/Edit/Admin), and supply a business justification.",
      detail: "Automated risk engine scores the request based on asset classification and privilege level (Low, Medium, High, Critical).",
    },
    {
      num: "03",
      icon: UserCheck,
      title: "Manager Review & Approval Workflow",
      actor: "Manager / Approver",
      desc: "Authorized managers review pending requests in their approval portal, inspecting user history, asset sensitivity, risk scoring, and justifications.",
      detail: "Managers can Approve, Reject with rationale, or Request More Information. Decisions are cryptographically recorded instantly.",
    },
    {
      num: "04",
      icon: Link2,
      title: "Immutable Ledger Chaining & Grant",
      actor: "BEL Policy Engine & Ledger",
      desc: "Upon approval, access is automatically granted and active. A cryptographic transaction block is hash-chained to previous entries with full timestamping.",
      detail: "Security administrators and auditors have real-time tamper-evident proofs confirming every authorization lifecycle event.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="relative surface-navy py-20 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl relative z-10">
          <Pill tone="info" className="border-white/20 bg-white/10 text-navy-foreground mb-4">
            <CheckCircle2 className="size-3.5" /> End-to-End Governance Flow
          </Pill>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl max-w-3xl leading-tight">
            How BEL Orchestrates Digital Trust
          </h1>
          <p className="mt-6 text-lg text-navy-foreground/80 max-w-2xl leading-relaxed">
            From verified employee onboarding to multi-tiered access approval and immutable audit
            anchoring, see how the BEL security pipeline works step-by-step.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
            >
              Try the Interactive Flow <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="space-y-12">
          {steps.map((s, idx) => (
            <div
              key={s.num}
              className="rounded-3xl border bg-card p-8 sm:p-10 shadow-[var(--shadow-card)] grid gap-8 md:grid-cols-12 items-center"
            >
              <div className="md:col-span-4 flex flex-col items-start">
                <span className="font-mono text-3xl font-extrabold text-accent">{s.num}</span>
                <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-accent mt-4">
                  <s.icon className="size-7" />
                </span>
                <Pill tone="info" className="mt-4 text-xs">
                  Actor: {s.actor}
                </Pill>
              </div>

              <div className="md:col-span-8 space-y-3">
                <h3 className="text-2xl font-bold">{s.title}</h3>
                <p className="text-base text-foreground/90 leading-relaxed">{s.desc}</p>
                <div className="rounded-xl bg-secondary/60 p-4 border text-xs text-muted-foreground leading-relaxed mt-4">
                  <strong>Technical Assurance:</strong> {s.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
