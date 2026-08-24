import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Fingerprint,
  KeyRound,
  Link2,
  Lock,
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/bel/SiteChrome";
import { Pill } from "@/components/bel/primitives";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security & Assurance — BEL Digital Trust" },
      { name: "description", content: "Zero-Trust architecture, cryptographic proofs, and compliance standards." },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="relative surface-navy py-20 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl relative z-10">
          <Pill tone="info" className="border-white/20 bg-white/10 text-navy-foreground mb-4">
            <Shield className="size-3.5" /> Security Architecture &amp; Assurance
          </Pill>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl max-w-3xl leading-tight">
            Cryptographically Anchored Security at Scale
          </h1>
          <p className="mt-6 text-lg text-navy-foreground/80 max-w-2xl leading-relaxed">
            BEL enforces continuous attestation, non-repudiation, and tamper-evident audit chains
            across all identity and privileged access operations.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
            >
              Access Demo Workspace <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
            <span className="grid size-12 place-items-center rounded-xl bg-success-soft text-success">
              <ShieldCheck className="size-6" />
            </span>
            <h3 className="text-lg font-bold mt-4">Zero-Trust Authorization</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Never trust, always verify. Every request is re-authenticated against real-time identity state and risk signals before token issuance.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
            <span className="grid size-12 place-items-center rounded-xl bg-info-soft text-info">
              <Link2 className="size-6" />
            </span>
            <h3 className="text-lg font-bold mt-4">Tamper-Proof Audit Chain</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Each state mutation is cryptographically signed and hash-chained to the previous block. Any retrospective manipulation breaks the chain.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
            <span className="grid size-12 place-items-center rounded-xl bg-warning-soft text-warning">
              <ShieldAlert className="size-6" />
            </span>
            <h3 className="text-lg font-bold mt-4">Continuous Threat Telemetry</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Instant detection of off-network logins, sudden role escalation attempts, and anomalous bulk download activities with automatic revocation.
            </p>
          </div>
        </div>

        {/* Security Controls Table */}
        <div className="mt-16 rounded-2xl border bg-card overflow-hidden shadow-[var(--shadow-card)]">
          <div className="border-b px-6 py-5">
            <h3 className="text-lg font-bold">Standard Security Controls</h3>
            <p className="text-xs text-muted-foreground mt-1">Built-in governance capabilities implemented across BEL.</p>
          </div>
          <div className="divide-y text-sm">
            {[
              ["Identity Anchoring", "Hardware-backed asymmetric keys with FIDO2 / WebAuthn and DID signatures"],
              ["Access Grants", "Explicit ephemeral grants with automated lifecycle expiry and just-in-time elevation"],
              ["Data Classification", "Strict isolation of Confidential and Restricted tiers with mandatory step-up MFA"],
              ["Audit Integrity", "Linear SHA-256 hash chaining with public audit verification proofs"],
              ["Incident Response", "One-click identity suspension and immediate global permission revocation"],
            ].map(([ctrl, desc]) => (
              <div key={ctrl} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-4">
                <span className="font-semibold text-foreground">{ctrl}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
