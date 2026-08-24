import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  User,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Lock,
  Mail,
  KeyRound,
} from "lucide-react";
import { BelLogo, Pill } from "@/components/bel/primitives";
import { actions, USERS, ROLE_LABEL, type DemoUser } from "@/lib/bel-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — BEL Digital Trust Platform" },
      { name: "description", content: "Sign in or choose a demo role to access the BEL platform." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("alex.mercer@bel.enterprise");
  const [password, setPassword] = useState("••••••••••••");
  const [remember, setRemember] = useState(true);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? USERS[0];
    actions.login(matched.id);
    navigate({ to: "/app" });
  };

  const handleDemoLogin = (user: DemoUser) => {
    actions.login(user.id);
    navigate({ to: "/app" });
  };

  const roleCards = [
    {
      user: USERS.find((u) => u.role === "employee")!,
      roleName: "Employee",
      icon: User,
      desc: "Manage your digital identity, request access, and securely access authorized digital assets.",
      tone: "info" as const,
      badge: "User Workspace",
    },
    {
      user: USERS.find((u) => u.role === "manager")!,
      roleName: "Manager / Approver",
      icon: CheckCircle2,
      desc: "Review and approve or reject employee access requests with full risk assessment.",
      tone: "success" as const,
      badge: "Approval Portal",
    },
    {
      user: USERS.find((u) => u.role === "admin")!,
      roleName: "Security Administrator",
      icon: ShieldAlert,
      desc: "Manage identities, roles, permissions, security policies, assets, and audit records.",
      tone: "warning" as const,
      badge: "Control Plane",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <header className="border-b bg-card/60 backdrop-blur px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/">
            <BelLogo />
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Pill tone="info" className="mb-3">
            <ShieldCheck className="size-3.5" /> Secure Authentication Portal
          </Pill>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Sign In to BEL Platform
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select a verified demo role for instant evaluation, or authenticate with corporate credentials.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Quick Demo Role Selector */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-lg font-bold">Interactive Demo Role Selector</h2>
              <span className="text-xs text-muted-foreground">One-click simulated access</span>
            </div>

            <div className="grid gap-4">
              {roleCards.map(({ user, roleName, icon: Icon, desc, tone, badge }) => (
                <div
                  key={user.id}
                  className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:border-primary/40 hover:shadow-[var(--shadow-lift)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="size-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base">{user.name}</h3>
                        <Pill tone={tone} className="text-[11px] py-0.5">
                          {badge}
                        </Pill>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {user.title} · {user.department}
                      </p>
                      <p className="text-xs text-muted-foreground/90 mt-2 leading-relaxed max-w-md">
                        {desc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDemoLogin(user)}
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 shadow-sm"
                  >
                    Enter as {roleName.split(" ")[0]} <ArrowRight className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Standard Sign In Form */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="size-5 text-accent" />
                <h2 className="text-lg font-bold">Standard Enterprise Login</h2>
              </div>

              <form onSubmit={handleCustomLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@bel.enterprise"
                      className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Password
                    </label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Use any demo role to log in without credentials."); }} className="text-xs text-accent hover:underline">
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Remember my workstation
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
                >
                  Secure Sign In <ArrowRight className="size-4" />
                </button>
              </form>

              <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
                <p>Protected by hardware token MFA and continuous cryptographic attestation.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © 2026 BEL Enterprise Systems · Digital Trust Platform
      </footer>
    </div>
  );
}
