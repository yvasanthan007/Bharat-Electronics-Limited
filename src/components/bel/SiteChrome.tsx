import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { BelLogo } from "./primitives";

const links = [
  { to: "/", label: "Home" },
  { to: "/platform", label: "Platform" },
  { to: "/security", label: "Security" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link to="/">
          <BelLogo />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-secondary text-foreground" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>
        <button
          className="rounded-md border p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t bg-background px-6 py-4 lg:hidden">
          <nav className="grid gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
            >
              Sign In
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <BelLogo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            BEL — Digital Trust &amp; Secure Access Platform for the modern enterprise.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {links.slice(1).map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <Link to="/login" className="hover:text-foreground">
            Sign In
          </Link>
        </nav>
      </div>
      <div className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
        © 2026 BEL Enterprise Systems. All access is monitored and audit-chained.
      </div>
    </footer>
  );
}
