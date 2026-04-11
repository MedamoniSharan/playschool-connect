import { useApp } from "@/context/AppContext";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Image, CalendarCheck, DollarSign, Bell, Send, Users, X, Menu, LogOut, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Role } from "@/types";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/students", label: "Students", icon: GraduationCap, roles: ["admin", "teacher"] as Role[] },
  { to: "/gallery", label: "Gallery", icon: Image, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/fees", label: "Fees", icon: DollarSign, roles: ["admin", "parent"] as Role[] },
  { to: "/notifications", label: "Notifications", icon: Bell, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/broadcast", label: "Broadcast", icon: Send, roles: ["admin"] as Role[] },
];

export default function Sidebar() {
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;

  const filteredNav = navItems.filter((item) => item.roles.includes(currentUser.role));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <span className="text-xs font-medium px-2.5 py-1 bg-primary-light text-primary rounded-full capitalize">
          {currentUser.role}
        </span>
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

      {/* User info + logout */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center">
            <span className="text-primary text-xs font-semibold">{currentUser.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-md">
        <Menu size={20} />
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform lg:hidden ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1 rounded-md hover:bg-sidebar-hover">
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        {sidebarContent}
      </aside>
    </>
  );
}
