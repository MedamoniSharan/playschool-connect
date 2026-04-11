import { useApp } from "@/context/AppContext";
import { StatCard, PageHeader, Avatar, StatusBadge } from "@/components/ui-custom/SharedComponents";
import { Users, GraduationCap, DollarSign, Image, CalendarCheck, Upload } from "lucide-react";

function AdminDashboard() {
  const { fees, gallery, students: allStudents } = useApp();
  const totalRevenue = fees.filter((f) => f.status === "paid").reduce((a, b) => a + b.amount, 0);
  const pendingFees = fees.filter((f) => f.status !== "paid").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={allStudents.length} icon={<Users size={20} />} trend="+2 this month" />
        <StatCard title="Classes" value={classes.length} icon={<GraduationCap size={20} />} />
        <StatCard title="Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<DollarSign size={20} />} trend="+12% vs last month" />
        <StatCard title="Gallery Items" value={gallery.length} icon={<Image size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { text: "New photos uploaded for Art Day", time: "2 hours ago" },
              { text: "Attendance marked for Little Stars", time: "3 hours ago" },
              { text: "Fee payment received from Meera Patel", time: "5 hours ago" },
              { text: "New student Vihaan Kumar enrolled", time: "1 day ago" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <p className="text-sm">{item.text}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Fee Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Paid</span>
              <span className="text-sm font-medium text-success">{fees.filter(f => f.status === "paid").length}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: `${(fees.filter(f => f.status === "paid").length / fees.length) * 100}%` }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="text-sm font-medium text-accent">{fees.filter(f => f.status === "pending").length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Overdue</span>
              <span className="text-sm font-medium text-destructive">{fees.filter(f => f.status === "overdue").length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherDashboard() {
  const { currentUser, getStudentsForTeacher, attendance } = useApp();
  const myStudents = getStudentsForTeacher(currentUser.id);
  const myClass = classes.find((c) => c.teacherId === currentUser.id);
  const todayAttendance = attendance.find((a) => a.classId === myClass?.id && a.date === "2025-04-10");
  const presentCount = todayAttendance?.records.filter((r) => r.status === "present").length || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="My Class" value={myClass?.name || ""} icon={<GraduationCap size={20} />} />
        <StatCard title="Students" value={myStudents.length} icon={<Users size={20} />} />
        <StatCard title="Present Today" value={`${presentCount}/${myStudents.length}`} icon={<CalendarCheck size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">My Students</h3>
          <div className="space-y-3">
            {myStudents.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <Avatar initials={s.avatar} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Age {s.age}</p>
                </div>
                <StatusBadge status={todayAttendance?.records.find(r => r.studentId === s.id)?.status || "—"} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Upload Media", icon: Upload, href: "/gallery" },
              { label: "Mark Attendance", icon: CalendarCheck, href: "/attendance" },
            ].map((action, i) => (
              <a key={i} href={action.href} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary hover:bg-sidebar-hover transition-colors">
                <action.icon size={24} className="text-primary" />
                <span className="text-sm font-medium">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParentDashboard() {
  const { currentUser, getChildrenForParent, gallery, notifications, fees } = useApp();
  const children = getChildrenForParent(currentUser.id);
  const childIds = children.map((c) => c.id);
  const childMedia = gallery.filter((m) => m.studentIds.some((id) => childIds.includes(id))).slice(0, 4);
  const childFees = fees.filter((f) => childIds.includes(f.studentId));
  const unreadNotifications = notifications.filter((n) => !n.read && n.targetRoles.includes("parent")).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="My Children" value={children.length} icon={<Users size={20} />} />
        <StatCard title="Photos" value={childMedia.length} icon={<Image size={20} />} />
        <StatCard title="Pending Fees" value={childFees.filter(f => f.status !== "paid").length} icon={<DollarSign size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">My Children</h3>
          <div className="space-y-3">
            {children.map((child) => {
              const cls = classes.find((c) => c.id === child.classId);
              return (
                <div key={child.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <Avatar initials={child.avatar} />
                  <div>
                    <p className="text-sm font-medium">{child.name}</p>
                    <p className="text-xs text-muted-foreground">{cls?.name} · Age {child.age}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            {unreadNotifications.length === 0 && <p className="text-sm text-muted-foreground">No new notifications</p>}
            {unreadNotifications.map((n) => (
              <div key={n.id} className="py-2 border-b border-border last:border-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {childMedia.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Recent Photos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {childMedia.map((m) => (
              <img key={m.id} src={m.url} alt={m.title} className="w-full h-32 object-cover rounded-lg" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { currentUser } = useApp();

  return (
    <div>
      <PageHeader title={`Welcome, ${currentUser.name.split(" ")[0]}!`} description={`${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Dashboard`} />
      {currentUser.role === "admin" && <AdminDashboard />}
      {currentUser.role === "teacher" && <TeacherDashboard />}
      {currentUser.role === "parent" && <ParentDashboard />}
    </div>
  );
}
