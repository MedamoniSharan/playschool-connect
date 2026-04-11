import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, PersonAvatar } from "@/components/ui-custom/SharedComponents";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO, isSameDay } from "date-fns";
import { CalendarDays, List, Plus, Trash2 } from "lucide-react";
import type { LessonPlan } from "@/types";

type View = "calendar" | "list";

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

  const myClass = currentUser ? classes.find((c) => c.teacherId === currentUser.id) : undefined;
  const teacherStudents = currentUser?.role === "teacher" ? getStudentsForTeacher(currentUser.id) : [];

  const visiblePlans = useMemo(() => {
    if (!currentUser) return [];
    let list = lessonPlans;
    if (currentUser.role === "teacher" && myClass) {
      list = list.filter((p) => p.classId === myClass.id);
    }
    if (currentUser.role === "parent") {
      const parentChildren = getChildrenForParent(currentUser.id);
      const ids = parentChildren.map((c) => c.id);
      list = list.filter((p) => ids.includes(p.studentId));
    }
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [lessonPlans, currentUser, myClass, getChildrenForParent]);

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
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          {s && <PersonAvatar kind="student" id={s.id} gender={s.gender} size="sm" />}
          <div>
            <p className="font-semibold">{s?.name}</p>
            <p className="text-sm text-muted-foreground">
              {act?.activity.name ?? "Activity"} · {cls?.name}
            </p>
            <p className="text-xs text-muted-foreground">{p.date}</p>
          </div>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => removeLessonPlan(p.id)}
            className="inline-flex items-center gap-1 self-end rounded-lg px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 sm:self-auto"
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
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                view === "list" ? "bg-primary text-primary-foreground" : "bg-secondary",
              )}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                view === "calendar" ? "bg-primary text-primary-foreground" : "bg-secondary",
              )}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </button>
          </div>
        }
      />

      {canManage && rosterForForm.length > 0 && (
        <div className="mb-8 rounded-xl border border-border bg-card p-4">
          <p className="mb-3 text-sm font-medium">Quick assign</p>
          <div className="grid gap-3 md:grid-cols-4">
            <select
              value={effectiveStudentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setActivityId("");
              }}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm md:col-span-2"
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
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add to date
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Uses the highlighted calendar day (below in calendar view).</p>
        </div>
      )}

      {view === "calendar" && (
        <div className="mb-8 grid gap-6 lg:grid-cols-[auto,1fr]">
          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-xl border border-border" />
          <div className="space-y-3">
            <p className="text-sm font-medium">
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </p>
            {plansForCalendar.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lessons on this day.</p>
            ) : (
              plansForCalendar.map((p) => renderPlanRow(p))
            )}
          </div>
        </div>
      )}

      {view === "list" && <div className="space-y-3">{visiblePlans.map((p) => renderPlanRow(p))}</div>}

      {visiblePlans.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <p>No lesson plans yet.</p>
        </div>
      )}
    </div>
  );
}
