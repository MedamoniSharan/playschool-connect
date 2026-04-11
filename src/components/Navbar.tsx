import { useApp } from "@/context/AppContext";
import { Bell, Search } from "lucide-react";

export default function Navbar() {
  const { currentUser, notifications } = useApp();
  if (!currentUser) return null;

  const unread = notifications.filter((n) => !n.read && n.targetRoles.includes(currentUser.role)).length;

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 lg:px-8">
      <div className="flex items-center gap-4 flex-1 ml-12 lg:ml-0">
        <div className="hidden sm:flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 max-w-md flex-1">
          <Search size={16} className="text-muted-foreground" />
          <input type="text" placeholder="Search..." className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell size={20} className="text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary text-xs font-semibold">{currentUser.avatar}</span>
          </div>
          <span className="text-sm font-medium hidden sm:block">{currentUser.name}</span>
        </div>
      </div>
    </header>
  );
}
