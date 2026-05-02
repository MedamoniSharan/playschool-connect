import { useApp } from "@/context/AppContext";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Image,
  CalendarCheck,
  DollarSign,
  Bell,
  Send,
  X,
  Menu,
  LogOut,
  GraduationCap,
  BookOpen,
  TrendingUp,
  CalendarDays,
  FileText,
  MessageSquare,
  Building2,
} from "lucide-react";
import { PersonAvatar } from "@/components/ui-custom/SharedComponents";
import { useState } from "react";
import { Role } from "@/types";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/branches", label: "Campuses", icon: Building2, roles: ["admin"] as Role[] },
  { to: "/students", label: "Students", icon: GraduationCap, roles: ["admin", "teacher"] as Role[] },
  { to: "/curriculum", label: "Curriculum", icon: BookOpen, roles: ["admin", "teacher"] as Role[] },
  { to: "/progress", label: "Progress", icon: TrendingUp, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/lessons", label: "Lesson plans", icon: CalendarDays, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/reports", label: "Reports", icon: FileText, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/gallery", label: "Gallery", icon: Image, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck, roles: ["admin", "teacher", "parent"] as Role[] },
  { to: "/fees", label: "Fees", icon: DollarSign, roles: ["admin", "parent"] as Role[] },
  { to: "/communications", label: "Messages", icon: MessageSquare, roles: ["admin", "teacher"] as Role[] },
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
    <div className="flex flex-col h-full font-sans dashboard-modern">
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Little Berries Logo" className="h-10 w-auto object-contain shrink-0 drop-shadow-sm" />
          <div className="min-w-0 pr-1">
            <h1 className="font-extrabold text-dash-ink text-[17px] leading-tight truncate tracking-tight">Little Berries</h1>
            <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-dash-muted mt-0.5">Connect Hub</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-6 pb-6">
        <span className="flex items-center w-fit gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-dash-canvas text-dash-ink rounded-full border border-dash-subtle shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-dash-lime-deep animate-pulse shadow-[0_0_8px_rgba(196,230,54,0.6)]"></span>
          {currentUser.role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 pb-4 space-y-1.5 overflow-y-auto scrollbar-thin">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-full text-[13px] font-bold transition-all duration-200 outline-none ${
                isActive
                  ? "bg-dash-ink text-white shadow-md shadow-dash-ink/25 scale-[1.02] translate-x-1"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-dash-ink focus-visible:bg-neutral-100"
              }`}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-dash-lime" : ""} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-4 mx-3 mb-4 border border-dash-subtle rounded-[24px] bg-dash-canvas space-y-4 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="ring-2 ring-white rounded-full shrink-0 shadow-sm bg-white">
             <PersonAvatar kind="user" id={currentUser.id} role={currentUser.role} size="sm" />
          </div>
          <div className="min-w-0 pr-1">
            <p className="text-[13px] font-extrabold text-dash-ink truncate">{currentUser.name}</p>
            <p className="text-[10px] font-semibold text-dash-muted truncate">{currentUser.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[12px] font-bold text-dash-ink bg-white hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm border border-dash-subtle group">
          <LogOut size={14} strokeWidth={2.5} className="text-dash-muted group-hover:text-white transition-colors" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="fixed left-4 top-4 z-50 rounded-full border border-dash-subtle bg-dash-surface p-2.5 shadow-sm text-dash-ink print:hidden lg:hidden hover:bg-dash-canvas transition-colors">
        <Menu size={20} strokeWidth={2.5} />
      </button>
      
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-dash-ink/40 backdrop-blur-sm print:hidden lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-4 left-4 z-50 w-72 transform rounded-[32px] border border-dash-subtle bg-dash-surface shadow-2xl transition-transform duration-300 print:hidden lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-[120%]"
        }`}
      >
        <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 p-1.5 rounded-full bg-dash-canvas text-dash-muted hover:text-dash-ink transition-colors z-50">
          <X size={16} strokeWidth={2.5} />
        </button>
        {sidebarContent}
      </aside>
      
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-4 left-4 z-40 hidden w-[260px] flex-col rounded-[32px] border border-dash-subtle bg-dash-surface shadow-sm print:hidden lg:flex overflow-hidden transition-all duration-300 hover:shadow-md">
        {sidebarContent}
      </aside>
    </>
  );
}
