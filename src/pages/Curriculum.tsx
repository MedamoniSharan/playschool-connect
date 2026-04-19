import { useMemo, useState } from "react";
import type { Subject, Activity } from "@/types";
import { useApp } from "@/context/AppContext";
import { Plus, BookOpen, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Curriculum() {
  const { currentUser, classes, students, curriculum, addSubject, addActivity, removeSubject, removeActivity } =
    useApp();
  const [classId, setClassId] = useState(
    currentUser?.role === "teacher" ? currentUser.classId ?? classes[0]?.id : classes[0]?.id ?? "",
  );
  const [subjectOpen, setSubjectOpen] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [activityDraft, setActivityDraft] = useState<Record<string, string>>({});

  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "teacher")) {
    return (
      <div className="rounded-[24px] border border-dash-subtle bg-dash-surface p-8 text-center text-dash-muted">
        You don&apos;t have access to curriculum management.
      </div>
    );
  }

  /** Prefer real class from roster / linked class — not stale profile `classId` (e.g. c1 vs c177…). */
  const teacherCurriculumClassId = useMemo(() => {
    if (currentUser.role !== "teacher") return "";
    const fromStudents = [...new Set(students.map((s) => s.classId).filter(Boolean))];
    if (fromStudents.length === 1) return fromStudents[0];
    if (fromStudents.length > 0) return fromStudents[0];
    const linked = classes.find((c) => c.teacherId === currentUser.id)?.id;
    if (linked) return linked;
    if (classes[0]?.id) return classes[0].id;
    return currentUser.classId ?? "";
  }, [currentUser, classes, students]);

  const effectiveClassId = currentUser.role === "teacher" ? teacherCurriculumClassId : classId;
  const cc = curriculum.find((c) => c.classId === effectiveClassId);

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error("Enter a subject name");
      return;
    }
    if (!effectiveClassId) {
      toast.error("No class selected — add students or a class first, then reload.");
      return;
    }
    const ok = await addSubject(effectiveClassId, newSubjectName.trim());
    if (ok) toast.success("Subject saved");
    else
      toast.warning("Subject added only in this session", {
        description: "The server did not return success — check Network tab or curriculum Lambda.",
      });
    setNewSubjectName("");
  };

  const handleAddActivity = async (subjectId: string) => {
    const name = (activityDraft[subjectId] || "").trim();
    if (!name) {
      toast.error("Enter an activity name");
      return;
    }
    if (!effectiveClassId) {
      toast.error("No class selected");
      return;
    }
    const ok = await addActivity(effectiveClassId, subjectId, name);
    if (ok) toast.success("Activity saved");
    else toast.warning("Activity added only in this session", { description: "The server did not return success." });
    setActivityDraft((d) => ({ ...d, [subjectId]: "" }));
  };

  const handleRemoveSubject = async (sub: Subject) => {
    if (!effectiveClassId) return;
    if (!window.confirm(`Remove “${sub.name}” and all ${sub.activities.length} activities?`)) return;
    const ok = await removeSubject(effectiveClassId, sub.id);
    if (ok) {
      toast.success("Subject removed");
      if (subjectOpen === sub.id) setSubjectOpen(null);
    } else toast.error("Could not remove subject — check API or redeploy curriculum Lambda.");
  };

  const handleRemoveActivity = async (subjectId: string, act: Activity) => {
    if (!effectiveClassId) return;
    const ok = await removeActivity(effectiveClassId, subjectId, act.id);
    if (ok) toast.success(`Removed “${act.name}”`);
    else toast.error("Could not remove activity.");
  };

  const inputClass =
    "w-full rounded-2xl border border-dash-subtle bg-dash-surface px-4 py-2.5 text-sm font-medium text-dash-ink outline-none focus:ring-2 focus:ring-dash-ink/10";

  return (
    <div className="dashboard-modern -mx-4 -mt-1 mb-8 rounded-[32px] bg-dash-canvas px-4 py-8 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-dash-muted">Montessori</p>
          <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-dash-ink md:text-4xl">
            <BookOpen className="h-8 w-8 md:h-9 md:w-9" strokeWidth={1.75} />
            Curriculum
          </h1>
          <p className="mt-2 max-w-xl text-sm text-dash-muted">
            Subjects and activities for each class — keep it light; expand as you go.
          </p>
        </div>
        {currentUser.role === "admin" && (
          <div className="relative min-w-[200px]">
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className={cn(
                "min-h-[48px] w-full appearance-none rounded-2xl border border-dash-subtle bg-dash-surface py-3 pl-4 pr-10 text-sm font-semibold text-dash-ink",
              )}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dash-muted" />
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-[24px] border border-dash-subtle bg-dash-surface p-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-xs font-bold uppercase text-dash-muted">New subject</label>
          <input
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="e.g. Cultural — Geography"
            className={inputClass}
          />
        </div>
        <button
          type="button"
          onClick={handleAddSubject}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-dash-ink px-6 py-3 text-sm font-bold text-white shadow-lg shadow-dash-ink/15"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add subject
        </button>
      </div>

      <div className="space-y-4">
        {cc?.subjects.map((sub) => {
          const open = subjectOpen === sub.id;
          return (
            <div key={sub.id} className="overflow-hidden rounded-[24px] border border-dash-subtle bg-dash-surface shadow-sm">
              <div className="flex w-full items-stretch gap-1 border-b border-transparent">
                <button
                  type="button"
                  onClick={() => setSubjectOpen(open ? null : sub.id)}
                  className="flex min-w-0 flex-1 items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-dash-canvas/80"
                >
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-dash-ink">{sub.name}</p>
                    <p className="text-xs font-medium text-dash-muted">{sub.activities.length} activities</p>
                  </div>
                  <ChevronDown
                    className={cn("h-5 w-5 shrink-0 text-dash-muted transition-transform", open && "rotate-180")}
                  />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleRemoveSubject(sub);
                  }}
                  className="flex shrink-0 items-center justify-center px-4 text-red-600 transition-colors hover:bg-red-500/10"
                  aria-label={`Remove subject ${sub.name}`}
                  title="Remove subject"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              {open && (
                <div className="space-y-3 border-t border-dash-subtle px-5 py-4">
                  <ul className="space-y-2">
                    {sub.activities.map((a) => (
                      <li
                        key={a.id}
                        className="flex flex-col gap-2 rounded-2xl bg-dash-canvas/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-dash-ink">{a.name}</span>
                          {a.description && <span className="mt-0.5 block text-sm text-dash-muted">{a.description}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleRemoveActivity(sub.id, a)}
                          className="inline-flex shrink-0 items-center justify-center self-end rounded-full p-2 text-red-600 hover:bg-red-500/10 sm:self-center"
                          aria-label={`Remove activity ${a.name}`}
                          title="Remove activity"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      value={activityDraft[sub.id] || ""}
                      onChange={(e) => setActivityDraft((d) => ({ ...d, [sub.id]: e.target.value }))}
                      placeholder="New activity name"
                      className={cn(inputClass, "sm:flex-1")}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddActivity(sub.id)}
                      className="rounded-full border border-dash-subtle bg-white px-5 py-2.5 text-sm font-bold text-dash-ink"
                    >
                      Add activity
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!cc?.subjects.length && (
        <p className="mt-8 text-center text-sm text-dash-muted">No subjects yet — add your first area above.</p>
      )}
    </div>
  );
}
