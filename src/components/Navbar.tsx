import { useApp } from "@/context/AppContext";
import { Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { PersonAvatar } from "@/components/ui-custom/SharedComponents";
import { isNotificationVisible } from "@/lib/notificationsFilter";

export default function Navbar() {
  const { currentUser, notifications, getChildrenForParent, branches, sessionBranchId } = useApp();
  if (!currentUser) return null;

  const branchName =
    branches.find((b) => b.id === sessionBranchId)?.name ?? sessionBranchId ?? "";

  const children = getChildrenForParent(currentUser.id);
  const unread = notifications.filter(
    (n) => !n.read && isNotificationVisible(n, currentUser, children, currentUser.classId),
  ).length;

  return (
    <header className="flex min-h-[64px] sm:h-20 flex-wrap items-center justify-between gap-3 px-3 sm:px-4 lg:px-8 dashboard-modern print:hidden w-full max-w-[1600px] mx-auto mt-2">
      <div className="flex min-w-0 flex-1 flex-col gap-1 ml-14 sm:ml-16 lg:ml-0">
        {branchName ? (
          <p className="truncate text-[11px] font-bold uppercase tracking-wider text-dash-muted">
            Campus · {branchName}
          </p>
        ) : null}
        <div className="hidden md:flex items-center gap-2 bg-dash-surface border border-dash-subtle rounded-full px-5 py-2.5 w-full max-w-sm shadow-sm focus-within:ring-2 focus-within:ring-dash-ink/10 transition-all">
          <Search size={16} className="text-dash-muted shrink-0" strokeWidth={2.5} aria-hidden />
          <input type="search" placeholder="Search for students, activities..." className="bg-transparent text-sm font-semibold outline-none w-full placeholder:text-dash-muted text-dash-ink" />
        </div>
      </div>
      <div className="flex items-center gap-4 lg:gap-6">
        <Link
          to="/notifications"
          className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-dash-subtle bg-dash-surface text-dash-ink hover:bg-dash-canvas hover:border-dash-ring transition-colors shadow-sm"
          aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
        >
          <Bell size={18} strokeWidth={2} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-dash-canvas">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-extrabold text-dash-ink">{currentUser.name}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-dash-muted">{currentUser.role}</span>
          </div>
          <div className="ring-2 ring-white rounded-full shadow-sm bg-white">
            <PersonAvatar kind="user" id={currentUser.id} role={currentUser.role} size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
