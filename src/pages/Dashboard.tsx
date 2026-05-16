import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "@/context/AppContext";
import { PersonAvatar, StatusBadge } from "@/components/ui-custom/SharedComponents";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  GraduationCap,
  Image,
  Megaphone,
  Plus,
  School,
  Settings,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { countActivitiesForClass } from "@/lib/montessori";

function CapsuleMeter({ value, segments = 22 }: { value: number; segments?: number }) {
  const filled = Math.round((Math.min(100, Math.max(0, value)) / 100) * segments);
  return (
    <div className="flex h-14 items-end justify-between gap-0.5 sm:gap-1">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "min-w-[3px] flex-1 max-w-[8px] rounded-full transition-all duration-300",
            i < filled ? "h-full bg-dash-ink" : "h-[55%] self-end border-2 border-dashed border-dash-ring bg-transparent",
          )}
        />
      ))}
    </div>
  );
}

function DashTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-semibold transition-all",
        active ? "bg-dash-ink text-white shadow-sm" : "bg-transparent text-dash-muted hover:text-dash-ink",
      )}
    >
      {children}
    </button>
  );
}

function QuickLinkCard({
  to,
  title,
  description,
  icon: Icon,
}: {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      to={to}
      className="group relative flex gap-4 rounded-[22px] border border-dash-subtle bg-dash-surface p-4 shadow-sm transition-all hover:border-dash-ring hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-dash-canvas text-dash-ink">
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-dash-ink">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-dash-muted">{description}</p>
      </div>
      <ArrowUpRight
        className="absolute right-3 top-3 h-4 w-4 text-dash-muted opacity-0 transition-opacity group-hover:opacity-100"
        strokeWidth={2}
      />
    </Link>
  );
}

function AdminDashboard() {
  const { fees, gallery, students: allStudents, classes } = useApp();
  const [tab, setTab] = useState<"overview" | "insights">("overview");

  const totalRevenue = fees.filter((f) => f.status === "paid").reduce((a, b) => a + b.amount, 0);
  const paidCount = fees.filter((f) => f.status === "paid").length;
  const pendingCount = fees.filter((f) => f.status === "pending").length;
  const overdueCount = fees.filter((f) => f.status === "overdue").length;
  const feeTotal = fees.length || 1;
  const paidRatio = Math.round((paidCount / feeTotal) * 100);
  const enrollmentTarget = Math.max(allStudents.length + 4, 12);
  const enrollmentPct = Math.min(100, Math.round((allStudents.length / enrollmentTarget) * 100));

  const chartData = useMemo(() => {
    const n = allStudents.length;
    const p = fees.filter((f) => f.status === "paid").length;
    const u = fees.filter((f) => f.status !== "paid").length;
    return [
      { name: "Nov", students: Math.max(1, n - 3), feesOpen: Math.max(1, u + 1) },
      { name: "Dec", students: Math.max(1, n - 2), feesOpen: Math.max(1, u) },
      { name: "Jan", students: Math.max(1, n - 2), feesOpen: u + 1 },
      { name: "Feb", students: Math.max(1, n - 1), feesOpen: u },
      { name: "Mar", students: n, feesOpen: Math.max(1, u) },
      { name: "Apr", students: n, feesOpen: u },
    ];
  }, [allStudents.length, fees]);

  const activities = [
    { text: "New photos uploaded for Art Day", time: "2h ago" },
    { text: "Attendance marked for Little Stars", time: "3h ago" },
    { text: "Fee payment received from Meera Patel", time: "5h ago" },
    { text: "New student Vihaan Kumar enrolled", time: "1d ago" },
  ];

  return (
    <div className="dashboard-modern space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-dash-ink md:text-4xl lg:text-[2.75rem]">
            Managing{" "}
            <School className="mx-1 inline-block h-8 w-8 align-middle text-dash-ink md:h-9 md:w-9" strokeWidth={1.75} />{" "}
            your school and{" "}
            <Users className="mx-1 inline-block h-8 w-8 align-middle text-dash-ink md:h-9 md:w-9" strokeWidth={1.75} />{" "}
            classrooms
          </h1>
          <p className="mt-3 max-w-xl text-sm text-dash-muted md:text-base">
            Overview of enrollment, fee health, and day-to-day activity — in a layout designed for fast decisions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/students"
            className="inline-flex items-center gap-2 rounded-full bg-dash-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-dash-ink/15 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add student
          </Link>
          <Link
            to="/teachers"
            className="inline-flex items-center gap-2 rounded-full border border-dash-subtle bg-dash-surface px-4 py-2.5 text-sm font-semibold text-dash-ink transition-colors hover:bg-dash-canvas"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add teacher
          </Link>
          <Link
            to="/broadcast"
            className="inline-flex items-center gap-2 rounded-full border border-dash-subtle bg-dash-surface px-4 py-2.5 text-sm font-semibold text-dash-ink transition-colors hover:bg-dash-canvas"
          >
            <Megaphone className="h-4 w-4" strokeWidth={2} />
            Broadcast
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dash-subtle bg-dash-surface text-dash-muted transition-colors hover:text-dash-ink"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="inline-flex flex-wrap gap-1 rounded-full bg-dash-pill/80 p-1 ring-1 ring-dash-subtle">
        <DashTab active={tab === "overview"} onClick={() => setTab("overview")}>
          Overview
        </DashTab>
        <DashTab active={tab === "insights"} onClick={() => setTab("insights")}>
          Insights
        </DashTab>
        <Link
          to="/fees"
          className="rounded-full px-4 py-2 text-sm font-semibold text-dash-muted transition-colors hover:text-dash-ink"
        >
          Fees
        </Link>
        <Link
          to="/gallery"
          className="rounded-full px-4 py-2 text-sm font-semibold text-dash-muted transition-colors hover:text-dash-ink"
        >
          Gallery
        </Link>
        <Link
          to="/notifications"
          className="rounded-full px-4 py-2 text-sm font-semibold text-dash-muted transition-colors hover:text-dash-ink"
        >
          Alerts
        </Link>
      </div>

      {tab === "overview" && (
        <div className="grid gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col justify-between rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-dash-muted">Active students</p>
                    <p className="mt-2 text-4xl font-extrabold tracking-tight text-dash-ink">{allStudents.length}</p>
                  </div>
                  <span className="rounded-full bg-dash-lime px-2.5 py-1 text-xs font-bold text-dash-ink">
                    {enrollmentPct}%
                  </span>
                </div>
                <div className="mt-6">
                  <CapsuleMeter value={enrollmentPct} />
                  <p className="mt-3 text-xs text-dash-muted">
                    Target {enrollmentTarget} enrollments · {classes.length} classes live
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-[28px] bg-dash-lime p-6 text-dash-ink shadow-sm ring-1 ring-black/5">
                <div>
                  <p className="text-sm font-semibold opacity-80">Fee health</p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight">
                    {paidCount} / {feeTotal}
                  </p>
                  <p className="mt-1 text-xs font-medium opacity-70">Paid vs total invoices</p>
                </div>
                <div className="mt-6">
                  <CapsuleMeter value={paidRatio} />
                  <p className="mt-3 text-xs font-semibold opacity-80">₹{totalRevenue.toLocaleString()} collected</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[28px] bg-dash-ink p-6 text-white shadow-xl">
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-dash-lime/20 blur-2xl" />
                <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-white/5" />
                <Sparkles className="relative h-8 w-8 text-dash-lime" strokeWidth={1.75} />
                <p className="relative mt-4 text-lg font-bold leading-snug">
                  Keep parents in the loop with photos and fee reminders.
                </p>
                <Link
                  to="/gallery"
                  className="relative mt-5 inline-flex w-full items-center justify-center rounded-full bg-white py-3 text-sm font-bold text-dash-ink transition-transform hover:scale-[1.02]"
                >
                  Open gallery
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-dash-ink">Statistics</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-dash-muted">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-dash-ink" />
                      Students
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-dash-lime-deep ring-1 ring-dash-ink/20" />
                      Open fees
                    </span>
                  </div>
                </div>
                <span className="inline-flex w-fit items-center rounded-full border border-dash-subtle bg-dash-canvas px-3 py-1.5 text-xs font-semibold text-dash-ink">
                  2026
                </span>
              </div>
              <div className="mt-8 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={10} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#e5e5e5" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#737373", fontSize: 11, fontWeight: 600 }}
                      dy={8}
                    />
                    <YAxis hide domain={[0, "dataMax + 2"]} />
                    <Tooltip
                      cursor={{ fill: "hsl(0 0% 96% / 0.6)" }}
                      content={({ active, payload, label }) =>
                        active && payload?.length ? (
                          <div className="rounded-2xl border border-dash-subtle bg-dash-surface px-3 py-2 text-xs shadow-lg">
                            <p className="font-bold text-dash-ink">{label}</p>
                            {payload.map((entry) => (
                              <p key={String(entry.dataKey)} className="text-dash-muted">
                                {entry.dataKey === "students" ? "Students" : "Open fees"}:{" "}
                                <span className="font-semibold text-dash-ink">{entry.value}</span>
                              </p>
                            ))}
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="students" fill="#0a0a0a" radius={[14, 14, 6, 6]} maxBarSize={36} name="students" />
                    <Bar dataKey="feesOpen" fill="#c4e636" radius={[14, 14, 6, 6]} maxBarSize={36} name="feesOpen" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm">
              <h3 className="text-base font-bold text-dash-ink">Recent activity</h3>
              <ul className="mt-4 divide-y divide-dash-subtle">
                {activities.map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                    <p className="text-sm font-medium text-dash-ink">{item.text}</p>
                    <span className="shrink-0 text-xs font-semibold text-dash-muted">{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-4 xl:col-span-4">
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/students"
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-[22px] border border-dash-subtle bg-dash-surface p-4 text-center shadow-sm transition-all hover:border-dash-ring"
              >
                <GraduationCap className="h-7 w-7 text-dash-ink" strokeWidth={1.75} />
                <span className="text-xs font-bold text-dash-ink">Students</span>
              </Link>
              <Link
                to="/attendance"
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-[22px] border border-dash-subtle bg-dash-surface p-4 text-center shadow-sm transition-all hover:border-dash-ring"
              >
                <CalendarCheck className="h-7 w-7 text-dash-ink" strokeWidth={1.75} />
                <span className="text-xs font-bold text-dash-ink">Attendance</span>
              </Link>
            </div>
            <QuickLinkCard to="/curriculum" title="Curriculum" description="Subjects and Montessori activities by class." icon={BookOpen} />
            <QuickLinkCard to="/progress" title="Progress" description="Track presented → practiced → mastered." icon={TrendingUp} />
            <QuickLinkCard to="/notifications" title="Notifications" description="Fee alerts, announcements, and gallery updates." icon={Bell} />
            <QuickLinkCard to="/fees" title="Fee center" description="Track pending, paid, and overdue invoices in one place." icon={Wallet} />
            <QuickLinkCard to="/broadcast" title="Broadcast" description="Reach every parent and teacher with one message." icon={Megaphone} />
            <div className="rounded-[22px] border border-dash-subtle bg-dash-canvas/80 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-dash-muted">Snapshot</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex justify-between font-medium">
                  <span className="text-dash-muted">Gallery</span>
                  <span className="text-dash-ink">{gallery.length} items</span>
                </li>
                <li className="flex justify-between font-medium">
                  <span className="text-dash-muted">Pending fees</span>
                  <span className="text-dash-ink">{pendingCount}</span>
                </li>
                <li className="flex justify-between font-medium">
                  <span className="text-dash-muted">Overdue</span>
                  <span className="text-red-600">{overdueCount}</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      )}

      {tab === "insights" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-8 shadow-sm">
            <h3 className="text-lg font-bold text-dash-ink">Fee breakdown</h3>
            <div className="mt-8 space-y-6">
              {[
                { label: "Paid", count: paidCount, pct: (paidCount / feeTotal) * 100, tone: "bg-dash-ink" },
                { label: "Pending", count: pendingCount, pct: (pendingCount / feeTotal) * 100, tone: "bg-dash-lime-deep" },
                { label: "Overdue", count: overdueCount, pct: (overdueCount / feeTotal) * 100, tone: "bg-red-500" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-dash-muted">{row.label}</span>
                    <span className="text-dash-ink">{row.count}</span>
                  </div>
                  <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-dash-canvas">
                    <div className={cn("h-full rounded-full transition-all", row.tone)} style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-dash-lime/40 bg-gradient-to-br from-dash-lime/90 to-dash-lime-deep/90 p-8 text-dash-ink shadow-sm">
            <h3 className="text-lg font-bold">Revenue</h3>
            <p className="mt-2 text-4xl font-extrabold tracking-tight">₹{totalRevenue.toLocaleString()}</p>
            <p className="mt-2 text-sm font-medium opacity-80">Total from paid invoices (demo data).</p>
            <CapsuleMeter value={paidRatio} segments={18} />
            <p className="mt-4 text-xs font-semibold opacity-70">{paidRatio}% of invoices settled</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TeacherDashboard() {
  const { currentUser, getStudentsForTeacher, attendance, classes, lessonPlans, getActivitiesWithSubjects } = useApp();
  const myStudents = currentUser ? getStudentsForTeacher(currentUser.id) : [];
  const myClass = classes.find((c) => currentUser && c.teacherId === currentUser.id);
  const teacherClassIds = useMemo(() => {
    const ids = new Set<string>();
    myStudents.forEach((s) => {
      if (s.classId) ids.add(s.classId);
    });
    if (myClass?.id) ids.add(myClass.id);
    if (currentUser?.classId) ids.add(currentUser.classId);
    if (classes[0]?.id) ids.add(classes[0].id);
    return ids;
  }, [myStudents, myClass, currentUser, classes]);
  const primaryClassId = teacherClassIds.size ? [...teacherClassIds][0] : myClass?.id;
  const displayClass = classes.find((c) => c.id === primaryClassId) ?? myClass ?? classes[0];
  const todayStr = "2026-04-11";
  const todayAttendance = attendance.find((a) => a.classId === primaryClassId && a.date === todayStr);
  const todayPlans = lessonPlans.filter((p) => teacherClassIds.has(p.classId) && p.date === todayStr);
  const presentCount = todayAttendance?.records.filter((r) => r.status === "present").length || 0;
  const attPct = myStudents.length ? Math.round((presentCount / myStudents.length) * 100) : 0;

  return (
    <div className="dashboard-modern space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-dash-ink md:text-4xl">
            Your class,{" "}
            <GraduationCap className="inline-block h-8 w-8 align-middle md:h-9 md:w-9" strokeWidth={1.75} />{" "}
            today
          </h1>
          <p className="mt-2 text-sm text-dash-muted md:text-base">{displayClass?.name ?? "Class"} · quick actions and roster</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/attendance"
            className="inline-flex items-center gap-2 rounded-full bg-dash-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-dash-ink/15"
          >
            <CalendarCheck className="h-4 w-4" strokeWidth={2} />
            Attendance
          </Link>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 rounded-full border border-dash-subtle bg-dash-surface px-4 py-2.5 text-sm font-semibold text-dash-ink"
          >
            <Upload className="h-4 w-4" strokeWidth={2} />
            Upload
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm">
          <p className="text-sm font-medium text-dash-muted">Class</p>
          <p className="mt-2 text-xl font-bold text-dash-ink">{displayClass?.name || "—"}</p>
        </div>
        <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm">
          <p className="text-sm font-medium text-dash-muted">Students</p>
          <p className="mt-2 text-4xl font-extrabold text-dash-ink">{myStudents.length}</p>
        </div>
        <div className="rounded-[28px] bg-dash-lime p-6 text-dash-ink shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold opacity-80">Present today</p>
          <p className="mt-2 text-4xl font-extrabold">
            {presentCount}/{myStudents.length || "—"}
          </p>
          <div className="mt-4">
            <CapsuleMeter value={attPct} segments={16} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm">
          <h3 className="text-base font-bold text-dash-ink">Roster</h3>
          <ul className="mt-4 divide-y divide-dash-subtle">
            {myStudents.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0">
                <PersonAvatar kind="student" id={s.id} gender={s.gender} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dash-ink">{s.name}</p>
                  <p className="text-xs text-dash-muted">Age {s.age}</p>
                </div>
                <StatusBadge status={todayAttendance?.records.find((r) => r.studentId === s.id)?.status || "—"} />
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          {todayPlans.length > 0 && (
            <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-dash-ink">Today&apos;s lesson plans</h3>
                <Link to="/lessons" className="text-xs font-bold text-dash-muted hover:text-dash-ink">
                  Planner
                </Link>
              </div>
              <ul className="mt-3 space-y-2">
                {todayPlans.slice(0, 4).map((p) => {
                  const st = myStudents.find((s) => s.id === p.studentId);
                  const label =
                    getActivitiesWithSubjects(p.classId).find((x) => x.activity.id === p.activityId)?.activity.name ??
                    "Activity";
                  return (
                    <li key={p.id} className="flex justify-between gap-2 text-sm">
                      <span className="font-semibold text-dash-ink">{st?.name}</span>
                      <span className="truncate text-dash-muted">{label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <Link
            to="/progress"
            className="flex items-center gap-4 rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm transition-all hover:border-dash-ring"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dash-canvas">
              <TrendingUp className="h-7 w-7 text-dash-ink" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-bold text-dash-ink">Progress</p>
              <p className="text-sm text-dash-muted">One-tap Montessori stages for your class.</p>
            </div>
            <ArrowUpRight className="ml-auto h-5 w-5 text-dash-muted" />
          </Link>
          <Link
            to="/lessons"
            className="flex items-center gap-4 rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm transition-all hover:border-dash-ring"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dash-canvas">
              <CalendarDays className="h-7 w-7 text-dash-ink" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-bold text-dash-ink">Lesson plans</p>
              <p className="text-sm text-dash-muted">Schedule work per child and activity.</p>
            </div>
            <ArrowUpRight className="ml-auto h-5 w-5 text-dash-muted" />
          </Link>
          <Link
            to="/gallery"
            className="flex items-center gap-4 rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm transition-all hover:border-dash-ring"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dash-canvas">
              <Image className="h-7 w-7 text-dash-ink" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-bold text-dash-ink">Gallery</p>
              <p className="text-sm text-dash-muted">Share class moments with parents.</p>
            </div>
            <ArrowUpRight className="ml-auto h-5 w-5 text-dash-muted" />
          </Link>
          <Link
            to="/attendance"
            className="flex items-center gap-4 rounded-[28px] bg-dash-ink p-6 text-white shadow-xl transition-transform hover:scale-[1.01]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <CalendarCheck className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-bold">Mark attendance</p>
              <p className="text-sm text-white/70">Update today&apos;s roll call.</p>
            </div>
            <ArrowUpRight className="ml-auto h-5 w-5 opacity-70" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ParentDashboard() {
  const { currentUser, getChildrenForParent, gallery, notifications, fees, classes, lessonProgress, curriculum } =
    useApp();
  const children = currentUser ? getChildrenForParent(currentUser.id) : [];
  const childIds = children.map((c) => c.id);
  const childMedia = gallery.filter((m) => m.studentIds.some((id) => childIds.includes(id))).slice(0, 4);
  const childFees = fees.filter((f) => childIds.includes(f.studentId));
  const unreadNotifications = notifications.filter((n) => !n.read && n.targetRoles.includes("parent")).slice(0, 3);
  const pendingFees = childFees.filter((f) => f.status !== "paid").length;
  const paidFees = childFees.filter((f) => f.status === "paid").length;
  const feeHealth = childFees.length ? Math.round((paidFees / childFees.length) * 100) : 0;

  return (
    <div className="dashboard-modern space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-dash-ink md:text-4xl">
            Family{" "}
            <Users className="inline-block h-8 w-8 align-middle md:h-9 md:w-9" strokeWidth={1.75} />{" "}
            overview
          </h1>
          <p className="mt-2 text-sm text-dash-muted md:text-base">Children, photos, and what needs your attention.</p>
        </div>
        <Link
          to="/notifications"
          className="inline-flex items-center gap-2 self-start rounded-full bg-dash-ink px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Bell className="h-4 w-4" strokeWidth={2} />
          Notifications
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm">
          <p className="text-sm font-medium text-dash-muted">Children</p>
          <p className="mt-2 text-4xl font-extrabold text-dash-ink">{children.length}</p>
        </div>
        <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm">
          <p className="text-sm font-medium text-dash-muted">Photos</p>
          <p className="mt-2 text-4xl font-extrabold text-dash-ink">{childMedia.length}</p>
        </div>
        <div className="rounded-[28px] bg-dash-lime p-6 text-dash-ink shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold opacity-80">Pending fees</p>
          <p className="mt-2 text-4xl font-extrabold">{pendingFees}</p>
          <div className="mt-4">
            <CapsuleMeter value={feeHealth} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm">
          <h3 className="text-base font-bold text-dash-ink">My children</h3>
          <ul className="mt-4 divide-y divide-dash-subtle">
            {children.map((child) => {
              const cls = classes.find((c) => c.id === child.classId);
              const totalActs = countActivitiesForClass(curriculum, child.classId);
              const mastered = lessonProgress.filter((p) => p.studentId === child.id && p.stage === "mastered").length;
              const pct = totalActs ? Math.min(100, Math.round((mastered / totalActs) * 100)) : 0;
              return (
                <li key={child.id} className="flex items-center gap-3 py-3 first:pt-0">
                  <PersonAvatar kind="student" id={child.id} gender={child.gender} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-dash-ink">{child.name}</p>
                    <p className="text-xs text-dash-muted">
                      {cls?.name} · Age {child.age}
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-dash-canvas">
                      <div className="h-full rounded-full bg-dash-ink transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-dash-muted">
                      Mastery {pct}% · {mastered}/{totalActs} lessons
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm">
          <h3 className="text-base font-bold text-dash-ink">Updates</h3>
          {unreadNotifications.length === 0 ? (
            <p className="mt-6 text-sm text-dash-muted">No new notifications.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {unreadNotifications.map((n) => (
                <li key={n.id} className="rounded-2xl bg-dash-canvas/80 px-4 py-3">
                  <p className="text-sm font-semibold text-dash-ink">{n.title}</p>
                  <p className="mt-1 text-xs text-dash-muted">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {childMedia.length > 0 && (
        <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-sm">
          <h3 className="text-base font-bold text-dash-ink">Recent photos</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {childMedia.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-2xl ring-1 ring-dash-subtle">
                <img src={m.url} alt={m.title} className="h-32 w-full object-cover transition-transform hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { currentUser } = useApp();
  if (!currentUser) return null;

  const roleLabel = (currentUser.role || "").charAt(0).toUpperCase() + (currentUser.role || "").slice(1);

  return (
    <div className="dashboard-modern -mx-4 -mt-1 mb-8 rounded-[32px] bg-dash-canvas px-4 py-8 sm:px-6 lg:-mx-8 lg:px-8">
      <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-dash-muted">{roleLabel} · Home</p>
      {currentUser.role === "admin" && <AdminDashboard />}
      {currentUser.role === "teacher" && <TeacherDashboard />}
      {currentUser.role === "parent" && <ParentDashboard />}
    </div>
  );
}
