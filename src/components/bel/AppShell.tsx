import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  ClipboardCheck,
  Cog,
  FileClock,
  Fingerprint,
  Gauge,
  KeyRound,
  Link2,
  LogOut,
  Menu,
  ScrollText,
  ShieldAlert,
  Users,
  UserCog,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { actions, getUser, ROLE_LABEL, useBel, type Role } from "@/lib/bel-store";
import { BelLogo, Pill } from "./primitives";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV: Record<Role, NavItem[]> = {
  employee: [
    { to: "/app", label: "Dashboard", icon: Gauge },
    { to: "/app/identity", label: "My Identity", icon: Fingerprint },
    { to: "/app/access", label: "My Access", icon: KeyRound },
    { to: "/app/assets", label: "Digital Assets", icon: Boxes },
    { to: "/app/request", label: "Access Requests", icon: ClipboardCheck },
    { to: "/app/activity", label: "Activity", icon: Activity },
    { to: "/app/notifications", label: "Notifications", icon: Bell },
    { to: "/app/settings", label: "Settings", icon: Cog },
  ],
  manager: [
    { to: "/app", label: "Dashboard", icon: Gauge },
    { to: "/app/approvals", label: "Pending Approvals", icon: ClipboardCheck },
    { to: "/app/access", label: "Team Access", icon: KeyRound },
    { to: "/app/users", label: "Employees", icon: Users },
    { to: "/app/history", label: "Approval History", icon: FileClock },
    { to: "/app/notifications", label: "Notifications", icon: Bell },
    { to: "/app/settings", label: "Settings", icon: Cog },
  ],
  admin: [
    { to: "/app", label: "Dashboard", icon: Gauge },
    { to: "/app/identity", label: "Identity Management", icon: Fingerprint },
    { to: "/app/users", label: "User Management", icon: Users },
    { to: "/app/roles", label: "Role Management", icon: UserCog },
    { to: "/app/policies", label: "Access Policies", icon: ScrollText },
    { to: "/app/assets", label: "Digital Assets", icon: Boxes },
    { to: "/app/approvals", label: "Access Requests", icon: ClipboardCheck },
    { to: "/app/monitoring", label: "Security Monitoring", icon: ShieldAlert },
    { to: "/app/audit", label: "Audit Ledger", icon: Link2 },
    { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/app/settings", label: "System Settings", icon: Cog },
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const { currentUserId, notifications } = useBel();
  const user = getUser(currentUserId);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div className="max-w-sm space-y-4">
          <BelLogo className="justify-center" />
          <p className="text-sm text-muted-foreground">
            Your session has ended. Sign in to continue to the BEL workspace.
          </p>
          <Link
            to="/login"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  const items = NAV[user.role];
  const unread = notifications.filter((n) => !n.read).length;

  const signOut = () => {
    actions.logout();
    navigate({ to: "/login", replace: true });
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/app" className="text-sidebar-primary-foreground">
          <BelLogo inverted />
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
          aria-label="Close navigation"
        >
          <X className="size-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => {
          const active = item.to === "/app" ? pathname === "/app" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.label === "Notifications" && unread > 0 ? (
                <span className="ml-auto rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-danger-foreground">
                  {unread}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-accent text-sm font-bold text-sidebar-accent-foreground">
            {user.name
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/70">{ROLE_LABEL[user.role]}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 shadow-xl">{sidebar}</div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur sm:px-6">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md border p-2 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>
          <Pill tone="info" className="hidden sm:inline-flex">
            {ROLE_LABEL[user.role]} workspace
          </Pill>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/app/notifications"
              className="relative rounded-lg border p-2 transition-colors hover:bg-secondary"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              {unread > 0 ? (
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-danger text-[10px] font-bold text-danger-foreground">
                  {unread}
                </span>
              ) : null}
            </Link>
            <Link
              to="/login"
              className="rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:bg-secondary"
            >
              Switch role
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
