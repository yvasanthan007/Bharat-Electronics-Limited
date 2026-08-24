import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Globe2, ShieldCheck, Users } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/bel/SiteChrome";
import { BelLogo, Pill } from "@/components/bel/primitives";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BEL — Digital Trust & Secure Access Platform" },
      { name: "description", content: "About BEL enterprise digital trust infrastructure and mission." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <section className="relative surface-navy py-20 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl relative z-10">
          <Pill tone="info" className="border-white/20 bg-white/10 text-navy-foreground mb-4">
            <Building2 className="size-3.5" /> About BEL Platform
          </Pill>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl max-w-3xl leading-tight">
            Building Provable Trust for Mission-Critical Organizations
          </h1>
          <p className="mt-6 text-lg text-navy-foreground/80 max-w-2xl leading-relaxed">
            BEL is engineered to give enterprises absolute clarity and cryptographic assurance over
            every identity, access grant, and sensitive digital resource.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              In modern enterprise environments, access governance often suffers from fragmented
              identity silos, slow manual approvals, and unverifiable audit trails.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              BEL unifies digital identity, least-privilege permissioning, time-bound access
              requests, and blockchain-inspired immutable ledger technology into one coherent,
              intuitive operating platform.
            </p>
          </div>

          <div className="rounded-3xl border bg-card p-8 shadow-[var(--shadow-card)] space-y-6">
            <h3 className="text-xl font-bold">Platform Core Principles</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="grid size-7 place-items-center rounded-lg bg-accent/10 text-accent shrink-0">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <strong className="block text-foreground font-semibold">Zero-Trust Baseline</strong>
                  <span className="text-muted-foreground">Every access request must be explicitly granted and verified.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid size-7 place-items-center rounded-lg bg-accent/10 text-accent shrink-0">
                  <Users className="size-4" />
                </span>
                <div>
                  <strong className="block text-foreground font-semibold">Human-Centered Governance</strong>
                  <span className="text-muted-foreground">Clear context, risk levels, and fast approvals for teams.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid size-7 place-items-center rounded-lg bg-accent/10 text-accent shrink-0">
                  <Globe2 className="size-4" />
                </span>
                <div>
                  <strong className="block text-foreground font-semibold">Immutable Assurance</strong>
                  <span className="text-muted-foreground">Tamper-evident records provable across internal and external audits.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
