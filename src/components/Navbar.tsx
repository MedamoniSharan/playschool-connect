import { useApp } from "@/context/AppContext";
import { Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { PersonAvatar } from "@/components/ui-custom/SharedComponents";

export default function Navbar() {
  const { currentUser, notifications } = useApp();
  if (!currentUser) return null;

  const unread = notifications.filter((n) => !n.read && n.targetRoles.includes(currentUser.role)).length;

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 lg:px-8">
      <div className="flex items-center gap-4 flex-1 ml-12 lg:ml-0">
        <div className="hidden sm:flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 max-w-md flex-1">
          <Search size={16} className="text-muted-foreground shrink-0" aria-hidden />
          <input type="search" placeholder="Search..." className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/notifications"
          className="relative inline-flex rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute top-0 right-0 min-w-[1rem] h-4 px-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2">
          <PersonAvatar kind="user" id={currentUser.id} role={currentUser.role} size="sm" />
          <span className="text-sm font-medium hidden sm:block">{currentUser.name}</span>
        </div>
      </div>
    </header>
  );
}
