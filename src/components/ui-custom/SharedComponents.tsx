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
    <div className={cn("bg-card rounded-xl p-5 border border-border", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && <p className="text-xs text-success mt-1">{trend}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    present: "bg-success/10 text-success",
    absent: "bg-destructive/10 text-destructive",
    paid: "bg-success/10 text-success",
    pending: "bg-accent/10 text-accent",
    overdue: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", styles[status] || "bg-secondary text-secondary-foreground")}>
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
