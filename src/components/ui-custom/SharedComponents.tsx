import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Baby, GraduationCap, Shield, Users } from "lucide-react";
import type { Role } from "@/types";

function hueFromId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * 17) % 360;
  return h;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-[24px] border border-dash-subtle bg-dash-surface p-5 shadow-sm transition-shadow hover:shadow-md", className)}>
      <div className="flex sm:flex-col items-center sm:items-start justify-between">
        <div className="hidden sm:flex mb-4 h-11 w-11 items-center justify-center rounded-2xl bg-dash-canvas text-dash-ink">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-3xl font-extrabold tracking-tight text-dash-ink">{value}</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-dash-muted">{title}</p>
          {trend && <p className="text-xs font-bold text-green-600 mt-2">{trend}</p>}
        </div>
        <div className="flex sm:hidden h-11 w-11 items-center justify-center rounded-2xl bg-dash-canvas text-dash-ink shrink-0 ml-4">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const isGood = ["present", "paid"].includes(status);
  const isBad = ["absent", "overdue"].includes(status);
  const isNeutral = ["pending"].includes(status);

  return (
    <span className={cn("px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest",
      isGood && "bg-dash-lime/30 text-green-700",
      isBad && "bg-red-500/10 text-red-600",
      isNeutral && "bg-dash-ink/5 text-dash-ink",
      (!isGood && !isBad && !isNeutral) && "bg-dash-canvas text-dash-muted"
    )}>
      {status}
    </span>
  );
}

export type PersonAvatarProps =
  | { kind: "user"; id: string; role: Role; size?: "sm" | "md" | "lg" }
  | { kind: "student"; id: string; gender: "male" | "female"; size?: "sm" | "md" | "lg" };

export function PersonAvatar(props: PersonAvatarProps) {
  const size = props.size ?? "md";
  const sizes = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-12 h-12" };
  const iconSizes = { sm: 14, md: 18, lg: 22 };

  let Icon: LucideIcon;
  let bg: string;
  let fg: string;

  if (props.kind === "student") {
    Icon = Baby;
    bg = props.gender === "female" ? "hsl(330, 42%, 93%)" : "hsl(215, 42%, 93%)";
    fg = props.gender === "female" ? "hsl(330, 50%, 40%)" : "hsl(215, 50%, 38%)";
  } else {
    const h = hueFromId(props.id);
    bg = `hsl(${h}, 32%, 93%)`;
    fg = `hsl(${h}, 45%, 36%)`;
    if (props.role === "admin") Icon = Shield;
    else if (props.role === "teacher") Icon = GraduationCap;
    else Icon = Users;
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center shrink-0 shadow-sm ring-1 ring-border/60",
        sizes[size],
      )}
      style={{ backgroundColor: bg, color: fg }}
    >
      <Icon size={iconSizes[size]} strokeWidth={2} />
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-dash-muted">{description || "Page Section"}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-dash-ink md:text-4xl">{title}</h1>
      </div>
      {action && <div className="mt-2 sm:mt-0">{action}</div>}
    </div>
  );
}
