import { cn } from "@/lib/utils";

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

export function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className={cn("rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold", sizes[size])}>
      {initials}
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
