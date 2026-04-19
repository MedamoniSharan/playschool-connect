import { useMemo, useState } from "react";
import { API_URLS } from "@/config/api";
import { useApp } from "@/context/AppContext";
import { PageHeader, PersonAvatar } from "@/components/ui-custom/SharedComponents";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO, isSameDay } from "date-fns";
import { CalendarDays, LayoutGrid, List, Plus, Trash2 } from "lucide-react";
import type { LessonPlan } from "@/types";

type View = "calendar" | "list" | "grid";

export default function LessonPlans() {
  const {
    currentUser,
    classes,
    students,
    lessonPlans,
    addLessonPlan,
    removeLessonPlan,
    getStudentsForTeacher,
    getChildrenForParent,
    getActivitiesWithSubjects,
  } = useApp();

  const [view, setView] = useState<View>("list");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date("2026-04-11"));
  const [studentId, setStudentId] = useState("");
  const [activityId, setActivityId] = useState("");

  const teacherStudents = currentUser?.role === "teacher" ? getStudentsForTeacher(currentUser.id) : [];

  /** Class ids this teacher should see plans for (roster + linked class; avoids empty filter when `teacherId` is missing on class rows). */
  const teacherPlanClassIds = useMemo(() => {
    const ids = new Set<string>();
    if (currentUser?.role !== "teacher") return ids;
    teacherStudents.forEach((s) => {
      if (s.classId) ids.add(s.classId);
    });
    const linked = classes.find((c) => c.teacherId === currentUser.id)?.id;
    if (linked) ids.add(linked);
    if (currentUser.classId) ids.add(currentUser.classId);
    if (classes[0]?.id) ids.add(classes[0].id);
    return ids;
  }, [currentUser, classes, teacherStudents]);

  const visiblePlans = useMemo(() => {
    if (!currentUser) return [];
    let list = lessonPlans;
    if (currentUser.role === "teacher" && teacherPlanClassIds.size > 0) {
      list = list.filter((p) => teacherPlanClassIds.has(p.classId));
    }
    if (currentUser.role === "parent") {
      const parentChildren = getChildrenForParent(currentUser.id);
      const ids = parentChildren.map((c) => c.id);
      list = list.filter((p) => ids.includes(p.studentId));
    }
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [lessonPlans, currentUser, teacherPlanClassIds, getChildrenForParent]);

  const plansForCalendar = useMemo(() => {
    if (!selectedDate) return visiblePlans;
    return visiblePlans.filter((p) => isSameDay(parseISO(p.date), selectedDate));
  }, [visiblePlans, selectedDate]);

  const canManage = currentUser?.role === "teacher" || currentUser?.role === "admin";
  const rosterForForm =
    currentUser?.role === "admin"
      ? students
      : currentUser?.role === "teacher"
        ? teacherStudents
        : [];

  const firstStudent = rosterForForm[0];
  const effectiveStudentId = studentId || firstStudent?.id || "";
  const stu = students.find((s) => s.id === effectiveStudentId);
  const activityOptions = stu ? getActivitiesWithSubjects(stu.classId) : [];

  const handleAdd = () => {
    if (!stu || !activityId || !selectedDate) return;
    addLessonPlan({
      classId: stu.classId,
      studentId: stu.id,
      activityId,
      date: format(selectedDate, "yyyy-MM-dd"),
      notes: "",
    });
    setActivityId("");
  };

  if (!currentUser) return null;

  const renderPlanRow = (p: LessonPlan) => {
    const s = students.find((x) => x.id === p.studentId);
    const cls = classes.find((c) => c.id === p.classId);
    const act = getActivitiesWithSubjects(p.classId).find((x) => x.activity.id === p.activityId);
    return (
      <div
        key={p.id}
        className="flex flex-col gap-3 rounded-[24px] border border-dash-subtle bg-dash-surface p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          {s && <PersonAvatar kind="student" id={s.id} gender={s.gender} size="sm" />}
          <div>
            <p className="font-semibold">{s?.name}</p>
            <p className="text-sm text-dash-muted">
              {act?.activity.name ?? "Activity"} · {cls?.name}
            </p>
            <p className="text-xs text-dash-muted">{p.date}</p>
          </div>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => removeLessonPlan(p.id)}
            className="inline-flex items-center gap-1 self-end rounded-[16px] px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 sm:self-auto"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Lesson plans"
        description={
          currentUser.role === "parent"
            ? "Scheduled work for your children"
            : "Assign Montessori activities by date — calendar or list"
        }
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "inline-flex items-center gap-2 rounded-[16px] px-3 py-2 text-sm font-medium",
                view === "list" ? "bg-dash-ink text-white shadow-md shadow-dash-ink/20" : "bg-dash-canvas",
              )}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              className={cn(
                "inline-flex items-center gap-2 rounded-[16px] px-3 py-2 text-sm font-medium",
                view === "grid" ? "bg-dash-ink text-white shadow-md shadow-dash-ink/20" : "bg-dash-canvas",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={cn(
                "inline-flex items-center gap-2 rounded-[16px] px-3 py-2 text-sm font-medium",
                view === "calendar" ? "bg-dash-ink text-white shadow-md shadow-dash-ink/20" : "bg-dash-canvas",
              )}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </button>
          </div>
        }
      />

      {!API_URLS.lessons && (
        <div className="mb-6 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Lesson plans are not loading from the server because no lessons API URL is set. Add{" "}
          <span className="font-mono font-semibold">VITE_LESSONS_API_URL</span> to{" "}
          <span className="font-mono">.env.local</span> (your deployed lessons Lambda URL), then restart{" "}
          <span className="font-mono">npm run dev</span>.
        </div>
      )}

      {canManage && rosterForForm.length > 0 && (
        <div className="mb-8 rounded-[24px] border border-dash-subtle bg-dash-surface p-4">
          <p className="mb-3 text-sm font-medium">Quick assign</p>
          <div className="grid gap-3 md:grid-cols-4">
            <select
              value={effectiveStudentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setActivityId("");
              }}
              className="rounded-[16px] border border-input bg-background px-3 py-2 text-sm"
            >
              {rosterForForm.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              className="rounded-[16px] border border-input bg-background px-3 py-2 text-sm md:col-span-2"
            >
              <option value="">Select activity</option>
              {activityOptions.map(({ activity, subjectName }) => (
                <option key={activity.id} value={activity.id}>
                  {subjectName} — {activity.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!activityId || !selectedDate}
              className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-primary px-4 py-2 text-sm font-medium text-dash-lime-deep-foreground disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add to date
            </button>
          </div>
          <p className="mt-2 text-xs text-dash-muted">Uses the highlighted calendar day (below in calendar view).</p>
        </div>
      )}

      {view === "calendar" && (
        <div className="mb-8 grid gap-6 lg:grid-cols-[auto,1fr]">
          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-[24px] border border-dash-subtle" />
          <div className="space-y-3">
            <p className="text-sm font-medium">
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </p>
            {plansForCalendar.length === 0 ? (
              <p className="text-sm text-dash-muted">No lessons on this day.</p>
            ) : (
              plansForCalendar.map((p) => renderPlanRow(p))
            )}
          </div>
        </div>
      )}

      {view === "list" && <div className="space-y-3">{visiblePlans.map((p) => renderPlanRow(p))}</div>}

      {view === "grid" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePlans.map((p) => {
            const s = students.find((x) => x.id === p.studentId);
            const cls = classes.find((c) => c.id === p.classId);
            const act = getActivitiesWithSubjects(p.classId).find((x) => x.activity.id === p.activityId);
            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-[24px] border border-dash-subtle bg-dash-surface p-5 shadow-sm transition-all hover:border-dash-ring hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-3">
                  {s && <PersonAvatar kind="student" id={s.id} gender={s.gender} />}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-dash-ink">{s?.name}</h4>
                    <p className="text-xs text-dash-muted">{cls?.name}</p>
                  </div>
                </div>
                <div className="space-y-2 border-t border-dash-subtle pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-dash-muted">Activity</span>
                    <span className="font-semibold text-dash-ink text-right max-w-[60%] truncate">{act?.activity.name ?? "Activity"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-dash-muted">Subject</span>
                    <span className="font-semibold text-dash-ink">{act?.subjectName ?? "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-dash-muted">Date</span>
                    <span className="font-semibold text-dash-ink">{p.date}</span>
                  </div>
                  {p.notes && (
                    <p className="text-xs text-dash-muted italic pt-1">{p.notes}</p>
                  )}
                </div>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => removeLessonPlan(p.id)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-red-200 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {visiblePlans.length === 0 && (
        <div className="py-16 text-center text-dash-muted">
          <p>No lesson plans yet.</p>
        </div>
      )}
    </div>
  );
}
