import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { MontessoriStageControls } from "@/components/progress/MontessoriStageControls";
import { PersonAvatar } from "@/components/ui-custom/SharedComponents";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
export default function Progress() {
  const {
    currentUser,
    students,
    classes,
    lessonProgress,
    updateLessonStage,
    getStudentsForTeacher,
    getChildrenForParent,
    getActivitiesWithSubjects,
  } = useApp();

  const [adminClassId, setAdminClassId] = useState(classes[0]?.id ?? "");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const teacherClass = currentUser ? classes.find((c) => c.teacherId === currentUser.id) : undefined;
  const effectiveClassId =
    currentUser?.role === "admin" ? adminClassId : teacherClass?.id ?? "";

  const roster = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "parent") return getChildrenForParent(currentUser.id);
    if (currentUser.role === "teacher") return getStudentsForTeacher(currentUser.id);
    return students.filter((s) => s.classId === effectiveClassId);
  }, [currentUser, getChildrenForParent, getStudentsForTeacher, students, effectiveClassId]);

  const activeStudentId = selectedStudentId || roster[0]?.id || "";
  const activeStudent = roster.find((s) => s.id === activeStudentId);
  const classIdForActivities = activeStudent?.classId ?? effectiveClassId;
  const activitiesFlat = getActivitiesWithSubjects(classIdForActivities);

  const canEdit =
    currentUser && (currentUser.role === "teacher" || currentUser.role === "admin");

  if (!currentUser) return null;

  return (
    <div className="dashboard-modern -mx-4 -mt-1 mb-8 rounded-[32px] bg-neutral-100 px-4 py-8 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm ring-1 ring-neutral-200">
            Montessori · Core
          </p>
          <h1 className="mt-3 flex flex-wrap items-center gap-3 text-3xl font-extrabold tracking-tight text-dash-ink md:text-4xl">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
              <TrendingUp className="h-6 w-6 text-primary" strokeWidth={2} aria-hidden />
            </span>
            Student progress
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-700 md:text-[15px]">
            One-tap stages: presented → practiced → mastered. Parents see a live snapshot.
          </p>
        </div>
        {currentUser.role === "admin" && (
          <div className="flex flex-wrap gap-2">
            <label className="text-xs font-bold uppercase text-dash-muted">Class</label>
            <select
              value={adminClassId}
              onChange={(e) => {
                setAdminClassId(e.target.value);
                setSelectedStudentId("");
              }}
              className="min-h-[44px] rounded-2xl border border-dash-subtle bg-dash-surface px-4 text-sm font-semibold text-dash-ink"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {roster.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-dash-ring bg-dash-surface px-6 py-16 text-center text-dash-muted">
          No students in this view.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-5">
            <div className="rounded-[28px] border border-neutral-200 bg-white p-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.14)]">
              <div className="border-b border-neutral-200 px-4 pb-3 pt-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-600">Learners</p>
                <p className="mt-0.5 text-xs font-medium text-neutral-600">{roster.length} in this class</p>
              </div>
              <ul className="space-y-1 p-2">
                {roster.map((s) => {
                  const cls = classes.find((c) => c.id === s.classId);
                  const sel = s.id === activeStudentId;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedStudentId(s.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                          sel
                            ? "bg-primary/18 text-neutral-900 shadow-sm ring-2 ring-primary/45"
                            : "bg-white text-neutral-900 ring-1 ring-neutral-200 hover:bg-neutral-50 hover:ring-neutral-300 active:bg-neutral-100",
                        )}
                      >
                        <PersonAvatar kind="student" id={s.id} gender={s.gender} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{s.name}</p>
                          <p className={cn("truncate text-xs font-medium", sel ? "text-neutral-700" : "text-neutral-600")}>
                            {cls?.name} · {s.section}
                          </p>
                        </div>
                        {sel && (
                          <span className="hidden shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary sm:inline">
                            Active
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <div className="space-y-4 lg:col-span-7">
            {activeStudent &&
              activitiesFlat.map(({ activity, subjectName }) => (
                <div
                  key={activity.id}
                  className="rounded-[24px] border border-neutral-200 bg-white p-5 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.12)]"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">{subjectName}</p>
                      <p className="mt-1.5 text-lg font-bold leading-snug text-dash-ink">{activity.name}</p>
                      {activity.description && (
                        <p className="mt-2 text-sm leading-relaxed text-neutral-700">{activity.description}</p>
                      )}
                    </div>
                    <div className="w-full shrink-0 sm:max-w-[280px]">
                      <MontessoriStageControls
                        studentId={activeStudent.id}
                        activityId={activity.id}
                        progress={lessonProgress}
                        readOnly={!canEdit}
                        onSetStage={(stage) => updateLessonStage(activeStudent.id, activity.id, stage)}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
