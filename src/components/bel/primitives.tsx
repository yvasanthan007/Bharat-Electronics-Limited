import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  FlaskConical,
  FolderClosed,
  Lock,
  Users,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { AccessStatus, Classification, RequestStatus, Severity } from "@/lib/bel-store";

export function BelLogo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl",
          inverted ? "bg-sidebar-primary text-sidebar-primary-foreground" : "surface-navy",
        )}
      >
        <ShieldCheck className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-extrabold tracking-tight">BEL</span>
        <span
          className={cn(
            "block text-[10px] font-medium uppercase tracking-[0.16em]",
            inverted ? "text-sidebar-foreground/70" : "text-muted-foreground",
          )}
        >
          Digital Trust
        </span>
      </span>
    </span>
  );
}

const toneMap = {
  success: "bg-success-soft text-success border-success/25",
  warning: "bg-warning-soft text-warning-foreground border-warning/35",
  danger: "bg-danger-soft text-danger border-danger/25",
  info: "bg-info-soft text-info border-info/25",
  neutral: "bg-muted text-muted-foreground border-border",
} as const;

export type Tone = keyof typeof toneMap;

export function Pill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ tone }: { tone: Tone }) {
  const bg = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
    neutral: "bg-muted-foreground",
  }[tone];
  return <span className={cn("size-1.5 rounded-full", bg)} />;
}

const accessTone: Record<AccessStatus, Tone> = {
  active: "success",
  pending: "warning",
  expired: "neutral",
  revoked: "danger",
};

export function AccessBadge({ status }: { status: AccessStatus }) {
  const tone = accessTone[status];
  return (
    <Pill tone={tone}>
      <Dot tone={tone} />
      {status[0].toUpperCase() + status.slice(1)}
    </Pill>
  );
}

const requestTone: Record<RequestStatus, Tone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  info: "info",
};

const requestLabel: Record<RequestStatus, string> = {
  pending: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
  info: "Info requested",
};

export function RequestBadge({ status }: { status: RequestStatus }) {
  return (
    <Pill tone={requestTone[status]}>
      <Dot tone={requestTone[status]} />
      {requestLabel[status]}
    </Pill>
  );
}

const severityTone: Record<Severity, Tone> = {
  Low: "success",
  Medium: "info",
  High: "warning",
  Critical: "danger",
};

export function SeverityBadge({ level }: { level: Severity }) {
  return <Pill tone={severityTone[level]}>{level}</Pill>;
}

const classTone: Record<Classification, Tone> = {
  Public: "success",
  Internal: "info",
  Confidential: "warning",
  Restricted: "danger",
};

export function ClassificationBadge({ level }: { level: Classification }) {
  return <Pill tone={classTone[level]}>{level}</Pill>;
}

export const assetIcons: Record<string, LucideIcon> = {
  chart: BarChart3,
  folder: FolderClosed,
  flask: FlaskConical,
  users: Users,
  lock: Lock,
  activity: Activity,
};

export function AssetIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = assetIcons[icon] ?? FolderClosed;
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent",
        className,
      )}
    >
      <Icon className="size-5" />
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "info",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={cn("grid size-9 place-items-center rounded-lg border", toneMap[tone])}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-2xl border bg-card shadow-[var(--shadow-card)]", className)}>
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action}
        </header>
      ) : null}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
