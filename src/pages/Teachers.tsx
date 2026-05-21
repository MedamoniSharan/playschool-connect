import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PersonAvatar } from "@/components/ui-custom/SharedComponents";
import { API_URLS } from "@/config/api";
import { parseApiResponse } from "@/lib/apiResponse";
import { cn } from "@/lib/utils";
import type { ClassRoom, User } from "@/types";
import { GraduationCap, Loader2, Mail, Plus, RefreshCw, Trash2, User as UserIcon, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-2xl border border-dash-subtle bg-dash-surface px-4 py-3 text-sm font-medium text-dash-ink outline-none placeholder:text-dash-muted focus:ring-2 focus:ring-dash-ink/10";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dash-muted">{label}</label>
      {children}
    </div>
  );
}

function AddTeacherModal({
  onClose,
  onSaved,
  classes,
  setClasses,
}: {
  onClose: () => void;
  onSaved: (teacher: User) => void;
  classes: ClassRoom[];
  setClasses: React.Dispatch<React.SetStateAction<ClassRoom[]>>;
}) {
  const { effectiveBranchScope, branches } = useApp();
  const adminNeedsCampusPick = !effectiveBranchScope;
  const [adminCampusId, setAdminCampusId] = useState("");
  useEffect(() => {
    if (!adminNeedsCampusPick) return;
    setAdminCampusId((prev) => prev || branches[0]?.id || "");
  }, [adminNeedsCampusPick, branches]);
  const branchScope = adminNeedsCampusPick ? adminCampusId : effectiveBranchScope;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [classId, setClassId] = useState("");
  const [saving, setSaving] = useState(false);

  const campusClasses = branchScope ? classes.filter((c) => c.branchId === branchScope) : classes;

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    if (!branchScope) {
      toast.error(
        adminNeedsCampusPick && !branches.length
          ? "Add a campus under Campuses first, then pick it here."
          : "Campus context missing. Sign out and sign in again.",
      );
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(API_URLS.users, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_teacher",
          name: name.trim(),
          email: email.trim(),
          password,
          branchId: branchScope,
          ...(classId ? { classId } : {}),
        }),
      });
      const raw = await res.json();
      const data = parseApiResponse(raw);
      if (res.ok && data.teacher) {
        const teacher = data.teacher as User;
        if (classId) {
          setClasses((prev) =>
            prev.map((c) => (c.id === classId ? { ...c, teacherId: teacher.id } : c)),
          );
        }
        onSaved(teacher);
        toast.success("Teacher added", { description: `Login: ${teacher.email}` });
        onClose();
        return;
      }
      toast.error(typeof data.error === "string" ? data.error : "Could not add teacher.");
    } catch {
      toast.error("Could not add teacher.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dash-ink/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="dashboard-modern w-full max-w-lg rounded-[28px] border border-dash-subtle bg-dash-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-dash-ink">Add teacher</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-dash-canvas text-dash-muted hover:text-dash-ink"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="space-y-4">
          {adminNeedsCampusPick && (
            <FormField label="Campus *">
              {branches.length > 0 ? (
                <select
                  value={adminCampusId}
                  onChange={(e) => {
                    setAdminCampusId(e.target.value);
                    setClassId("");
                  }}
                  className={cn(inputClass, "appearance-none")}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs font-medium text-amber-700">Add a campus under Campuses first.</p>
              )}
            </FormField>
          )}
          <FormField label="Full name *">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Rahul Mehta" />
          </FormField>
          <FormField label="Email *">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="teacher@school.com" />
          </FormField>
          <FormField label="Password *">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Min 6 characters" />
          </FormField>
          <FormField label="Assign to class (optional)">
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className={cn(inputClass, "appearance-none")}>
              <option value="">No class yet</option>
              {campusClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.teacherId ? " (has teacher)" : ""}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || !email.trim() || !password.trim() || saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-dash-ink py-3 text-sm font-bold text-white shadow-lg shadow-dash-ink/15 disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" strokeWidth={2.5} />}
            {saving ? "Saving…" : "Create teacher"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Teachers() {
  const { effectiveBranchScope, branches, classes, setClasses } = useApp();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTeachers = useCallback(async () => {
    const q = effectiveBranchScope
      ? `?action=get_teachers&branchId=${encodeURIComponent(effectiveBranchScope)}`
      : "?action=get_teachers";
    const res = await fetch(`${API_URLS.users}${q}`);
    const raw = await res.json();
    const data = parseApiResponse(raw);
    if (res.ok && Array.isArray(data.teachers)) {
      setTeachers(data.teachers as User[]);
      return;
    }
    throw new Error(typeof data.error === "string" ? data.error : "Failed to load teachers");
  }, [effectiveBranchScope]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await loadTeachers();
      } catch {
        if (!cancelled) toast.error("Could not load teachers");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadTeachers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadTeachers();
      toast.message("Teacher list updated");
    } catch {
      toast.error("Could not refresh teachers");
    } finally {
      setRefreshing(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(API_URLS.users, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_teacher", id: deleteTarget.id }),
      });
      const raw = await res.json();
      const data = parseApiResponse(raw);
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not delete teacher");
        return;
      }
      setTeachers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setClasses((prev) =>
        prev.map((c) => (c.teacherId === deleteTarget.id ? { ...c, teacherId: "" } : c)),
      );
      toast.success("Teacher removed");
      setDeleteTarget(null);
    } catch {
      toast.error("Could not delete teacher");
    } finally {
      setDeleting(false);
    }
  };

  const classNameFor = (teacherId: string, linkedClassId?: string) => {
    const byTeacher = classes.find((c) => c.teacherId === teacherId);
    if (byTeacher) return byTeacher.name;
    if (linkedClassId) return classes.find((c) => c.id === linkedClassId)?.name ?? "—";
    return "—";
  };

  const campusLabel =
    effectiveBranchScope && branches.length
      ? (branches.find((b) => b.id === effectiveBranchScope)?.name ?? "This campus")
      : "All campuses";

  return (
    <div className="dashboard-modern -mx-4 -mt-1 mb-8 rounded-[32px] bg-dash-canvas px-4 py-8 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-dash-muted">Admin · Staff</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-dash-ink md:text-4xl">
            Teachers{" "}
            <GraduationCap className="inline-block h-8 w-8 align-middle text-dash-ink md:h-9 md:w-9" strokeWidth={1.75} />
          </h1>
          <p className="mt-2 max-w-xl text-sm text-dash-muted md:text-base">
            Add teacher accounts for {campusLabel}. They sign in with their email, password, and campus.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-full bg-dash-ink px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-dash-ink/15 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add teacher
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-full border border-dash-subtle bg-dash-surface px-4 py-2.5 text-sm font-bold text-dash-ink transition-colors hover:bg-white disabled:opacity-50"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} strokeWidth={2} />
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-dash-subtle bg-dash-surface shadow-sm">
        <div className="border-b border-dash-subtle px-6 py-4">
          <h2 className="text-base font-bold text-dash-ink">Staff directory</h2>
          <p className="text-xs font-medium text-dash-muted">
            {loading ? "Loading…" : `${teachers.length} teacher${teachers.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm font-medium text-dash-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading teachers…
          </div>
        ) : teachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <UserIcon className="mb-3 h-10 w-10 text-dash-muted" strokeWidth={1.5} />
            <p className="text-sm font-bold text-dash-ink">No teachers yet</p>
            <p className="mt-1 text-xs text-dash-muted">Create the first teacher account to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-dash-canvas/80 text-left">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-dash-muted">Teacher</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-dash-muted">Email</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-dash-muted">Class</th>
                  {!effectiveBranchScope && (
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-dash-muted">Campus</th>
                  )}
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-dash-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="border-t border-dash-subtle transition-colors hover:bg-dash-canvas/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <PersonAvatar kind="user" id={t.id} role="teacher" size="sm" />
                        <span className="text-sm font-bold text-dash-ink">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-dash-muted">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {t.email}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-dash-ink">{classNameFor(t.id, t.classId)}</td>
                    {!effectiveBranchScope && (
                      <td className="px-4 py-4 text-sm font-medium text-dash-muted">
                        {branches.find((b) => b.id === t.branchId)?.name ?? t.branchId ?? "—"}
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(t)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-500/10"
                        aria-label={`Delete ${t.name}`}
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <AddTeacherModal
          onClose={() => setShowAdd(false)}
          onSaved={(teacher) =>
            setTeachers((prev) => [...prev, teacher].sort((a, b) => a.name.localeCompare(b.name)))
          }
          classes={classes}
          setClasses={setClasses}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-[24px] border-dash-subtle">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? (
                <>
                  <strong className="text-dash-ink">{deleteTarget.name}</strong> ({deleteTarget.email}) will lose
                  access. Any class assigned to them will be unassigned.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel className="min-h-[44px] rounded-full border-dash-subtle">Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="min-h-[44px] w-full rounded-full sm:w-auto"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete teacher"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
