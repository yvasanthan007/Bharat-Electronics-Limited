import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Fingerprint,
  KeyRound,
  Link2,
  LineChart,
  Lock,
  ShieldCheck,
} from "lucide-react";
import heroImage from "@/assets/bel-hero.jpg";
import { BelLogo, Pill } from "@/components/bel/primitives";
import { SiteNav, SiteFooter } from "@/components/bel/SiteChrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BEL — Digital Trust & Secure Access Platform" },
      {
        name: "description",
        content:
          "BEL helps enterprises manage digital identities, role-based access, secure digital assets, approval workflows and immutable blockchain-inspired audit trails.",
      },
      { property: "og:title", content: "BEL — Digital Trust & Secure Access Platform" },
      {
        property: "og:description",
        content:
          "Secure identity, controlled access and complete trust for large organisations.",
      },
    ],
  }),
  component: Landing,
});

const capabilities = [
  {
    icon: Fingerprint,
    title: "Digital Identity",
    body: "Verified, cryptographically anchored identities for every employee, device and service account.",
  },
  {
    icon: KeyRound,
    title: "Role-Based Access Control",
    body: "Least-privilege permissions governed by roles, policies and time-bound entitlements.",
  },
  {
    icon: Lock,
    title: "Secure Digital Assets",
    body: "Classify, protect and monitor every asset from Public through to Restricted.",
  },
  {
    icon: CheckCircle2,
    title: "Approval Workflows",
    body: "Structured request, review and decision flows with full risk context for approvers.",
  },
  {
    icon: Link2,
    title: "Immutable Audit Ledger",
    body: "Every action is hash-chained into a tamper-evident record that cannot be rewritten.",
  },
  {
    icon: LineChart,
    title: "Security Analytics",
    body: "Real-time monitoring, anomaly detection and AI-assisted insight across the estate.",
  },
];

const steps = [
  { n: "01", t: "Verify identity", d: "Employees are onboarded with a verified digital identity and MFA." },
  { n: "02", t: "Request access", d: "Users request the exact asset and permission level they need." },
  { n: "03", t: "Approve with context", d: "Managers review identity, history and risk before deciding." },
  { n: "04", t: "Record immutably", d: "Every decision is chained into the audit ledger for assurance." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="relative overflow-hidden surface-navy">
        <div className="absolute inset-0 grid-mesh opacity-40" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <Pill tone="info" className="border-white/20 bg-white/10 text-navy-foreground">
              <ShieldCheck className="size-3.5" /> Enterprise Digital Trust Infrastructure
            </Pill>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              Secure Identity. Controlled Access. Complete Trust.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-foreground/75 sm:text-lg">
              BEL is a Digital Trust &amp; Secure Access Platform that helps organizations securely
              manage digital identities, access permissions, digital assets, and transparent audit
              records.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/platform"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
              >
                Explore Platform <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 items-center rounded-xl border border-white/25 px-6 text-sm font-semibold text-navy-foreground transition-colors hover:bg-white/10"
              >
                Sign In
              </Link>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              {[
                ["12,400+", "Managed identities"],
                ["99.99%", "Access decision uptime"],
                ["100%", "Actions audit-chained"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="text-2xl font-bold">{v}</dt>
                  <dd className="mt-1 text-xs text-navy-foreground/65">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-white/15 shadow-[var(--shadow-lift)]">
              <img
                src={heroImage}
                alt="Digital identity nodes connected to secure assets, approval flow and a blockchain-style audit ledger"
                className="w-full"
              />
            </div>
            <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border bg-card p-4 text-card-foreground shadow-[var(--shadow-lift)] sm:left-8 sm:right-8">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-success-soft text-success">
                  <Link2 className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Permission granted · Research Database</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    hash 1fa30c8b95d67e42 · integrity confirmed
                  </p>
                </div>
                <Pill tone="success" className="ml-auto hidden sm:inline-flex">
                  Verified
                </Pill>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <Pill tone="info">Platform</Pill>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            One control plane for identity, access and assurance
          </h2>
          <p className="mt-4 text-muted-foreground">
            BEL unifies the systems that decide who your people are, what they may reach, and how
            every one of those decisions is proven later.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-accent">
                <c.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y bg-secondary/50">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <Pill tone="info">How it works</Pill>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Digital identity to immutable record, in four steps
            </h2>
          </div>
          <ol className="mt-12 grid gap-5 md:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n} className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
                <span className="font-mono text-sm font-bold text-accent">{s.n}</span>
                <h3 className="mt-3 text-base font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="overflow-hidden rounded-3xl surface-navy p-10 sm:p-14">
          <div className="max-w-2xl">
            <BelLogo inverted />
            <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
              Bring provable trust to every access decision
            </h2>
            <p className="mt-4 text-navy-foreground/75">
              Explore the full BEL workspace with employee, manager and security administrator
              demonstration accounts.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground"
            >
              Get Started <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
