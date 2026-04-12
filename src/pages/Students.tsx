import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PersonAvatar } from "@/components/ui-custom/SharedComponents";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Plus,
  X,
  Trash2,
  Search,
  Users,
  Layers,
  User,
  GraduationCap,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react";
import { Student, ClassRoom } from "@/types";
import { API_URLS } from "@/config/api";
import { toast } from "sonner";

function AddStudentModal({ onClose, onSave, classes, setClasses }: { onClose: () => void; onSave: (s: Student) => void; classes: ClassRoom[]; setClasses: React.Dispatch<React.SetStateAction<ClassRoom[]>> }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [classId, setClassId] = useState(classes[0]?.id || "");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    const newClass: ClassRoom = {
      id: `c${Date.now()}`,
      name: newClassName.trim(),
      teacherId: "",
      sections: [],
      studentIds: [],
    };
    setClasses((prev) => [...prev, newClass]);
    setClassId(newClass.id);
    setNewClassName("");
  };

  const handleSave = async () => {
    if (!name || !age || !classId || !parentEmail || !parentPassword) return;
    setSaving(true);

    try {
      const res = await fetch(`${API_URLS.users}?action=add_student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: name,
          age: Number(age),
          classId,
          gender,
          parentName: parentName || `Parent of ${name}`,
          parentEmail,
          parentPassword,
          enrollmentDate: new Date().toISOString().split("T")[0],
        }),
      });

      const raw = await res.json();
      const data = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;

      if (data.student) {
        onSave(data.student as Student);
        toast.success("Student added successfully", {
          description: `Parent login: ${parentEmail}`,
        });
        onClose();
        return;
      }
    } catch (e) {
      console.error("API error adding student:", e);
    }

    // Fallback: create locally if API failed
    const newStudent: Student = {
      id: `s${Date.now()}`,
      name,
      age: Number(age),
      classId,
      section: "",
      parentId: "",
      gender,
      enrollmentDate: new Date().toISOString().split("T")[0],
    };
    onSave(newStudent);
    onClose();
    setSaving(false);
  };

  const inputClass =
    "w-full rounded-2xl border border-dash-subtle bg-dash-surface px-4 py-3 text-sm font-medium text-dash-ink outline-none transition-shadow placeholder:text-dash-muted focus:ring-2 focus:ring-dash-ink/10";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dash-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="dashboard-modern w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-2xl shadow-dash-ink/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-dash-ink">Add new student</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-dash-canvas text-dash-muted transition-colors hover:text-dash-ink"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-dash-muted">Student Details</p>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dash-muted">Full name</label>
            <input placeholder="e.g. Aarav Kumar" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dash-muted">Age</label>
              <input
                type="number"
                min={2}
                max={7}
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dash-muted">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "male" | "female")}
                className={cn(inputClass, "appearance-none")}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dash-muted">Class *</label>
            {classes.length > 0 ? (
              <select value={classId} onChange={(e) => setClassId(e.target.value)} className={cn(inputClass, "appearance-none")}>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-amber-600 font-medium py-1">No classes yet — create one below</p>
            )}
            <div className="flex gap-2 mt-2">
              <input
                placeholder="New class name (e.g. Nursery)"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddClass(); } }}
                className="flex-1 rounded-xl border border-dash-subtle bg-dash-canvas px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-dash-ink/10"
              />
              <button
                type="button"
                onClick={handleAddClass}
                className="rounded-xl bg-dash-lime px-4 py-2 text-xs font-bold text-dash-ink ring-1 ring-black/5"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dash-subtle" /></div>
            <div className="relative flex justify-center">
              <span className="bg-dash-surface px-3 text-xs font-bold uppercase tracking-[0.15em] text-dash-muted">Parent Login</span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dash-muted">Parent Name</label>
            <input placeholder="e.g. Priya Kumar" value={parentName} onChange={(e) => setParentName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dash-muted">Parent Email *</label>
            <input type="email" placeholder="parent@email.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dash-muted">Password *</label>
            <input type="password" placeholder="Create a password" value={parentPassword} onChange={(e) => setParentPassword(e.target.value)} className={inputClass} />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name || !age || !classId || !parentEmail || !parentPassword}
            className="w-full rounded-full bg-dash-ink py-3.5 text-sm font-bold text-white shadow-lg shadow-dash-ink/20 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Creating..." : "Add student"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageClassesModal({
  onClose,
  classes,
  setClasses,
  teacherClassId,
}: {
  onClose: () => void;
  classes: ClassRoom[];
  setClasses: React.Dispatch<React.SetStateAction<ClassRoom[]>>;
  teacherClassId?: string;
}) {
  const [newClassName, setNewClassName] = useState("");

  // If teacher, only show their class
  const visibleClasses = teacherClassId ? classes.filter((c) => c.id === teacherClassId) : classes;

  const addClass = () => {
    if (!newClassName.trim()) return;
    const newClass: ClassRoom = {
      id: `c${Date.now()}`,
      name: newClassName.trim(),
      teacherId: "",
      sections: [],
      studentIds: [],
    };
    setClasses((prev) => [...prev, newClass]);
    setNewClassName("");
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const studentCount = (cls: ClassRoom) =>
    cls.studentIds.length;

  const inputClass =
    "w-full rounded-2xl border border-dash-subtle bg-dash-surface px-4 py-3 text-sm font-medium text-dash-ink outline-none placeholder:text-dash-muted focus:ring-2 focus:ring-dash-ink/10";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dash-ink/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="dashboard-modern max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-dash-ink">Manage Classes</h3>
            <p className="text-xs font-medium text-dash-muted mt-0.5">{visibleClasses.length} class{visibleClasses.length !== 1 ? "es" : ""}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-dash-canvas text-dash-muted hover:text-dash-ink transition-colors"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Existing classes */}
        <div className="mb-6 space-y-3">
          {visibleClasses.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-dash-ring bg-dash-canvas/50 px-6 py-10 text-center">
              <Layers className="h-8 w-8 text-dash-muted mb-3" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-dash-ink">No classes yet</p>
              <p className="text-xs text-dash-muted mt-1">Create your first class below to get started.</p>
            </div>
          )}
          {visibleClasses.map((cls) => (
            <div
              key={cls.id}
              className="group flex items-center justify-between rounded-[20px] border border-dash-subtle bg-dash-canvas/60 px-5 py-4 transition-all hover:border-dash-ring hover:shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-dash-lime/60 text-dash-ink ring-1 ring-black/5">
                  <GraduationCap size={18} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-bold text-dash-ink">{cls.name}</p>
                  <p className="text-xs font-medium text-dash-muted">{studentCount(cls)} student{studentCount(cls) !== 1 ? "s" : ""}</p>
                </div>
              </div>
              {!teacherClassId && (
                <button
                  type="button"
                  onClick={() => deleteClass(cls.id)}
                  className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-red-500 opacity-0 transition-all hover:bg-red-500/10 group-hover:opacity-100"
                  aria-label={`Delete ${cls.name}`}
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add new class */}
        {!teacherClassId && (
          <div className="space-y-3 border-t border-dash-subtle pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-dash-muted">Add new class</p>
            <div className="flex gap-2">
              <input
                placeholder="Class name (e.g. Nursery, LKG, UKG)"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addClass(); } }}
                className={cn(inputClass, "flex-1")}
              />
              <button
                type="button"
                onClick={addClass}
                disabled={!newClassName.trim()}
                className="shrink-0 rounded-2xl bg-dash-ink px-5 py-3 text-sm font-bold text-white shadow-lg shadow-dash-ink/15 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({
  value,
  label,
  icon: Icon,
  variant = "light",
}: {
  value: number;
  label: string;
  icon: LucideIcon;
  variant?: "light" | "lime" | "ink";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border p-5 shadow-sm transition-shadow hover:shadow-md",
        variant === "light" && "border-dash-subtle bg-dash-surface",
        variant === "lime" && "border-transparent bg-dash-lime text-dash-ink ring-1 ring-black/5",
        variant === "ink" && "border-transparent bg-dash-ink text-white",
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-11 w-11 items-center justify-center rounded-2xl",
          variant === "light" && "bg-dash-canvas text-dash-ink",
          variant === "lime" && "bg-dash-ink/10 text-dash-ink",
          variant === "ink" && "bg-white/10 text-dash-lime",
        )}
      >
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <p className={cn("text-3xl font-extrabold tracking-tight", variant === "ink" && "text-white")}>{value}</p>
      <p className={cn("mt-1 text-xs font-semibold uppercase tracking-wider", variant === "light" && "text-dash-muted", variant === "lime" && "text-dash-ink/70", variant === "ink" && "text-white/70")}>
        {label}
      </p>
    </div>
  );
}

export default function Students() {
  const { currentUser, students, setStudents, classes, setClasses } = useApp();
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showManageClasses, setShowManageClasses] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";

  let displayStudents = students;

  if (isTeacher && currentUser) {
    const myClass = classes.find((c) => c.teacherId === currentUser.id);
    if (myClass) {
      displayStudents = students.filter((s) => s.classId === myClass.id);
    }
  }

  if (searchTerm) {
    displayStudents = displayStudents.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  if (filterClass) {
    displayStudents = displayStudents.filter((s) => s.classId === filterClass);
  }


  const handleAddStudent = (student: Student) => {
    setStudents((prev) => [...prev, student]);
    setClasses((prev) =>
      prev.map((c) => (c.id === student.classId ? { ...c, studentIds: [...c.studentIds, student.id] } : c)),
    );
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setClasses((prev) => prev.map((c) => ({ ...c, studentIds: c.studentIds.filter((sid) => sid !== id) })));
  };

  const handleReassign = (studentId: string, newClassId: string) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, classId: newClassId } : s)));
    setClasses((prev) =>
      prev.map((c) => {
        const withoutStudent = c.studentIds.filter((sid) => sid !== studentId);
        if (c.id === newClassId) return { ...c, studentIds: [...withoutStudent, studentId] };
        return { ...c, studentIds: withoutStudent };
      }),
    );
  };

  const boys = displayStudents.filter((s) => s.gender === "male").length;
  const girls = displayStudents.filter((s) => s.gender === "female").length;

  const selectShell =
    "min-h-[48px] appearance-none rounded-2xl border border-dash-subtle bg-dash-surface pl-4 pr-10 text-sm font-semibold text-dash-ink outline-none focus:ring-2 focus:ring-dash-ink/10";

  return (
    <div className="dashboard-modern -mx-4 -mt-1 mb-8 rounded-[32px] bg-dash-canvas px-4 py-8 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-dash-muted">
            {isAdmin ? "Admin" : isTeacher ? "Teacher" : "Parent"} · Roster
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-dash-ink md:text-4xl">
            Students{" "}
            <GraduationCap className="inline-block h-8 w-8 align-middle text-dash-ink md:h-9 md:w-9" strokeWidth={1.75} />
          </h1>
          <p className="mt-2 max-w-xl text-sm text-dash-muted md:text-base">
            {isAdmin ? "Manage enrollment and classes from one place." : "Manage your class students."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(isAdmin || isTeacher) && (
            <button
              type="button"
              onClick={() => setShowAddStudent(true)}
              className="inline-flex items-center gap-2 rounded-full bg-dash-ink px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-dash-ink/15 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add student
            </button>
          )}
          {(isAdmin || isTeacher) && (
            <button
              type="button"
              onClick={() => setShowManageClasses(true)}
              className="inline-flex items-center gap-2 rounded-full border border-dash-subtle bg-dash-surface px-4 py-2.5 text-sm font-bold text-dash-ink transition-colors hover:bg-white"
            >
              <Layers className="h-4 w-4" strokeWidth={2} />
              Manage Classes
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-8 flex flex-col gap-3 rounded-[28px] border border-dash-subtle bg-dash-surface p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dash-muted" strokeWidth={2} />
          <input
            type="search"
            placeholder="Search students…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 w-full rounded-2xl border border-dash-subtle bg-dash-canvas py-3 pl-11 pr-4 text-sm font-medium text-dash-ink outline-none placeholder:text-dash-muted focus:ring-2 focus:ring-dash-ink/10"
          />
        </div>
        {isAdmin && (
          <div className="relative flex min-w-[160px] flex-1 sm:flex-initial sm:max-w-[220px]">
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className={cn(selectShell, "w-full")}>
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dash-muted" strokeWidth={2} />
          </div>
        )}
        <div className="flex gap-1 ml-auto">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all",
              viewMode === "table" ? "bg-dash-ink text-white shadow-sm" : "bg-dash-canvas text-dash-muted hover:text-dash-ink"
            )}
            aria-label="Table view"
          >
            <List size={18} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all",
              viewMode === "grid" ? "bg-dash-ink text-white shadow-sm" : "bg-dash-canvas text-dash-muted hover:text-dash-ink"
            )}
            aria-label="Grid view"
          >
            <LayoutGrid size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile value={displayStudents.length} label="Total students" icon={Users} variant="light" />
        <StatTile value={classes.length} label="Classes" icon={Layers} variant="lime" />
        <StatTile value={boys} label="Boys" icon={User} variant="light" />
        <StatTile value={girls} label="Girls" icon={User} variant="ink" />
      </div>

      {/* Table view */}
      {viewMode === "table" && (
        <div className="overflow-hidden rounded-[28px] border border-dash-subtle bg-dash-surface shadow-sm">
          <div className="border-b border-dash-subtle px-6 py-4">
            <h2 className="text-base font-bold text-dash-ink">Directory</h2>
            <p className="text-xs font-medium text-dash-muted">Showing {displayStudents.length} student{displayStudents.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-dash-canvas/80 text-left">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-dash-muted">Student</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-dash-muted">Class</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-dash-muted">Reassign</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-dash-muted">Age</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-dash-muted">Gender</th>
                  <th className="hidden px-4 py-4 text-xs font-bold uppercase tracking-wider text-dash-muted sm:table-cell">Enrolled</th>
                  {(isAdmin || isTeacher) && (
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-dash-muted">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayStudents.map((student) => {
                  const cls = classes.find((c) => c.id === student.classId);
                  return (
                    <tr key={student.id} className="border-t border-dash-subtle transition-colors hover:bg-dash-canvas/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <PersonAvatar kind="student" id={student.id} gender={student.gender} size="sm" />
                          <span className="text-sm font-bold text-dash-ink">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-dash-ink">{cls?.name || "—"}</td>
                      <td className="px-4 py-4">
                        {isAdmin || isTeacher ? (
                          <div className="relative inline-block min-w-[140px] max-w-[200px]">
                            <select
                              value={student.classId}
                              onChange={(e) => handleReassign(student.id, e.target.value)}
                              className="w-full cursor-pointer appearance-none rounded-full border border-dash-subtle bg-dash-canvas py-2 pl-3 pr-8 text-xs font-bold text-dash-ink outline-none transition-colors hover:border-dash-ring focus:ring-2 focus:ring-dash-ink/10"
                            >
                              {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dash-muted" />
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-dash-ink">
                            {cls?.name || "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold tabular-nums text-dash-ink">{student.age}</td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize",
                            student.gender === "male"
                              ? "bg-[hsl(215,42%,93%)] text-[hsl(215,50%,38%)]"
                              : "bg-[hsl(330,42%,93%)] text-[hsl(330,50%,40%)]",
                          )}
                        >
                          {student.gender}
                        </span>
                      </td>
                      <td className="hidden px-4 py-4 text-sm font-medium text-dash-muted sm:table-cell">{student.enrollmentDate}</td>
                      {(isAdmin || isTeacher) && (
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-500/10"
                            aria-label={`Remove ${student.name}`}
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid (card) view */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayStudents.map((student) => {
            const cls = classes.find((c) => c.id === student.classId);
            return (
              <div
                key={student.id}
                className="group relative overflow-hidden rounded-[24px] border border-dash-subtle bg-dash-surface p-5 shadow-sm transition-all hover:border-dash-ring hover:shadow-md"
              >
                {(isAdmin || isTeacher) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteStudent(student.id)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-red-500 opacity-0 transition-all hover:bg-red-500/10 group-hover:opacity-100"
                    aria-label={`Remove ${student.name}`}
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                )}
                <div className="mb-4 flex flex-col items-center text-center">
                  <PersonAvatar kind="student" id={student.id} gender={student.gender} />
                  <h3 className="mt-3 text-base font-bold text-dash-ink">{student.name}</h3>
                  <p className="text-xs font-medium text-dash-muted">{cls?.name || "—"}</p>
                </div>
                <div className="space-y-2 border-t border-dash-subtle pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-dash-muted">Age</span>
                    <span className="font-bold text-dash-ink">{student.age}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-dash-muted">Gender</span>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize",
                        student.gender === "male"
                          ? "bg-[hsl(215,42%,93%)] text-[hsl(215,50%,38%)]"
                          : "bg-[hsl(330,42%,93%)] text-[hsl(330,50%,40%)]",
                      )}
                    >
                      {student.gender}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-dash-muted">Enrolled</span>
                    <span className="font-semibold text-dash-ink">{student.enrollmentDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {displayStudents.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-[28px] border border-dashed border-dash-ring bg-dash-surface px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-dash-canvas">
            <Users className="h-7 w-7 text-dash-muted" strokeWidth={1.75} />
          </div>
          <p className="text-lg font-bold text-dash-ink">No students found</p>
          <p className="mt-1 max-w-sm text-sm text-dash-muted">Try adjusting search or filters, or add a new student.</p>
          {(isAdmin || isTeacher) && (
            <button
              type="button"
              onClick={() => setShowAddStudent(true)}
              className="mt-6 rounded-full bg-dash-ink px-6 py-2.5 text-sm font-bold text-white"
            >
              Add student
            </button>
          )}
        </div>
      )}

      {showAddStudent && <AddStudentModal onClose={() => setShowAddStudent(false)} onSave={handleAddStudent} classes={classes} setClasses={setClasses} />}
      {showManageClasses && (
        <ManageClassesModal
          onClose={() => setShowManageClasses(false)}
          classes={classes}
          setClasses={setClasses}
        />
      )}
    </div>
  );
}
