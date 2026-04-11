import { useApp } from "@/context/AppContext";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Image, CalendarCheck, DollarSign, Bell, Send, Users, X, Menu } from "lucide-react";
import { useState } from "react";
import { Role } from "@/types";
import { users } from "@/data/mockData";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/gallery", label: "Gallery", icon: Image, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/fees", label: "Fees", icon: DollarSign, roles: ["admin", "parent"] as Role[] },
  { to: "/notifications", label: "Notifications", icon: Bell, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/broadcast", label: "Broadcast", icon: Send, roles: ["admin"] as Role[] },
];

export default function Sidebar() {
  const { currentUser, setCurrentUser } = useApp();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNav = navItems.filter((item) => item.roles.includes(currentUser.role));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-sm">Smart Playschool</h1>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>
      </div>

      {/* Role Switcher */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Switch Role</label>
        <div className="flex gap-1">
          {(["admin", "teacher", "parent"] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => {
                const u = users.find((u) => u.role === role);
                if (u) setCurrentUser(u);
                setMobileOpen(false);
              }}
              className={`flex-1 text-xs py-1.5 px-2 rounded-md font-medium capitalize transition-colors ${
                currentUser.role === role
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-sidebar-hover"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-sidebar-active-bg text-sidebar-active"
                  : "text-sidebar-foreground hover:bg-sidebar-hover"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary text-xs font-semibold">{currentUser.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-md"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform lg:hidden ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1 rounded-md hover:bg-sidebar-hover">
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        {sidebarContent}
      </aside>
    </>
  );
}
