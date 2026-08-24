import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Database,
  Fingerprint,
  KeyRound,
  Layers,
  LineChart,
  Link2,
  Lock,
  Network,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/bel/SiteChrome";
import { Pill } from "@/components/bel/primitives";

export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: "Platform Architecture — BEL Digital Trust" },
      { name: "description", content: "Explore the architecture, capabilities, and trust engine of BEL." },
    ],
  }),
  component: PlatformPage,
});

function PlatformPage() {
  const pillars = [
    {
      icon: Fingerprint,
      title: "Decentralized Digital Identity (DID)",
      desc: "Anchors each corporate entity, worker, and machine account in a cryptographically verifiable root of trust with MFA attestation.",
      points: ["W3C compliant DID identifiers", "Hardware token & biometric MFA", "Continuous session attestation"],
    },
    {
      icon: KeyRound,
      title: "Context-Aware RBAC & ABAC",
      desc: "Dynamically calculates authorization using role hierarchies, security classifications, location bounds, and time-restricted grants.",
      points: ["Least-privilege permission matrix", "Time-bound ephemeral access", "Just-in-time access elevation"],
    },
    {
      icon: Boxes,
      title: "Enterprise Asset Guard",
      desc: "Categorizes files, structured databases, APIs, and analytics workspaces from Public to Restricted with automated policy enforcement.",
      points: ["4-tier data classification", "Granular read/edit/admin scoping", "Automated policy-driven revocation"],
    },
    {
      icon: Link2,
      title: "Tamper-Evident Audit Ledger",
      desc: "Chains every request, approval, permission change, and security alert into SHA-256 block hashes preventing historical alteration.",
      points: ["Cryptographic hash chaining", "Real-time state proof verification", "Zero-alteration compliance audit"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero Header */}
      <section className="relative surface-navy py-20 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl relative z-10">
          <Pill tone="info" className="border-white/20 bg-white/10 text-navy-foreground mb-4">
            <Layers className="size-3.5" /> Platform Architecture
          </Pill>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl max-w-3xl leading-tight">
            Unified Security Engine for the Zero-Trust Enterprise
          </h1>
          <p className="mt-6 text-lg text-navy-foreground/80 max-w-2xl leading-relaxed">
            BEL integrates identity governance, policy decision points, privileged access workflows,
            and cryptographic ledger assurance into a unified control plane.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
            >
              Open Live Console <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-navy-foreground hover:bg-white/10 transition-colors"
            >
              See Workflow Details
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Pill tone="info">Core Capabilities</Pill>
          <h2 className="text-3xl font-bold mt-4">Architectural Foundation</h2>
          <p className="text-muted-foreground mt-3">
            Designed to eliminate permission creep and guarantee verifiable compliance across distributed teams.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border bg-card p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-xl bg-accent/10 text-accent">
                  <p.icon className="size-6" />
                </span>
                <h3 className="text-xl font-bold">{p.title}</h3>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              <ul className="mt-6 space-y-2.5 border-t pt-5">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2.5 text-xs font-medium text-foreground/90">
                    <CheckCircle2 className="size-4 text-success shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive System Flow Diagram Section */}
      <section className="bg-secondary/40 border-y py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl mb-12">
            <Pill tone="info">System Topology</Pill>
            <h2 className="text-3xl font-bold mt-4">Zero-Trust Access Pipeline</h2>
            <p className="text-muted-foreground mt-2">
              How identity, policy, approval, and audit communicate in real-time.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                name: "Identity & MFA Verification",
                icon: Fingerprint,
                desc: "Validates caller credentials against biometric and hardware key registry.",
              },
              {
                step: "02",
                name: "Policy Decision Point",
                icon: ShieldCheck,
                desc: "Evaluates role permissions and required classification thresholds.",
              },
              {
                step: "03",
                name: "Quorum / Approval Routing",
                icon: Zap,
                desc: "Dispatches risk-scored approval request to authorized line managers.",
              },
              {
                step: "04",
                name: "Ledger State Commit",
                icon: Database,
                desc: "Records resulting authorization event into immutable hash chain.",
              },
            ].map((node) => (
              <div key={node.step} className="rounded-2xl border bg-card p-6 shadow-sm">
                <span className="font-mono text-xs font-bold text-accent">{node.step}</span>
                <node.icon className="size-6 text-primary mt-3" />
                <h4 className="font-semibold text-base mt-2">{node.name}</h4>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{node.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl surface-navy p-10 sm:p-14 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold">Experience the Complete Prototype</h2>
          <p className="mt-4 text-navy-foreground/80">
            Log in as an Employee, Manager, or Security Administrator to test live end-to-end workflows.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
            >
              Sign In to Demo <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
