import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { API_URLS } from "@/config/api";
import { parseApiResponse } from "@/lib/apiResponse";
import { PageHeader } from "@/components/ui-custom/SharedComponents";
import { Building2, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { Branch } from "@/types";

export default function Branches() {
  const { branches, refreshBranches, sessionBranchId, currentUser } = useApp();
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState(false);

  const inputClass =
    "w-full min-h-[44px] rounded-2xl border border-dash-subtle bg-dash-surface px-4 py-3 text-sm font-medium text-dash-ink outline-none placeholder:text-dash-muted focus:ring-2 focus:ring-dash-ink/10";

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(API_URLS.users, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_branch",
          name: name.trim(),
          ...(sortOrder.trim() ? { sortOrder: sortOrder.trim() } : {}),
        }),
      });
      const raw = await res.json();
      const data = parseApiResponse(raw);
      if (res.ok) {
        toast.success("Campus created");
        setName("");
        setSortOrder("");
        await refreshBranches();
        return;
      }
      toast.error(typeof data.error === "string" ? data.error : "Could not create campus");
    } catch {
      toast.error("Could not create campus");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBranches();
    setRefreshing(false);
    toast.message("Campus list updated");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(API_URLS.users, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_branch", id: deleteTarget.id }),
      });
      const raw = await res.json();
      const data = parseApiResponse(raw);
      if (res.ok) {
        toast.success("Campus removed");
        setDeleteTarget(null);
        await refreshBranches();
        return;
      }
      toast.error(typeof data.error === "string" ? data.error : "Could not delete campus");
    } catch {
      toast.error("Could not delete campus");
    } finally {
      setDeleting(false);
    }
  };

  const sorted = [...branches].sort((a, b) =>
    String(a.sortOrder ?? "").localeCompare(String(b.sortOrder ?? ""), undefined, { numeric: true }),
  );

  return (
    <div className="dashboard-modern -mx-4 -mt-1 mb-8 rounded-[32px] bg-dash-canvas px-4 py-8 sm:px-6 lg:-mx-8 lg:px-8">
      <PageHeader
        title="Campuses"
        description="Add or remove school branches. Deleting is blocked while classes, students, or staff still reference a campus."
      />

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-dash-subtle bg-dash-surface px-4 py-2 text-sm font-bold text-dash-ink shadow-sm"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} aria-hidden />
          Refresh list
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={handleAdd}
          className="rounded-[28px] border border-dash-subtle bg-dash-surface p-5 shadow-sm sm:p-6"
        >
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-dash-ink">
            <Plus className="h-5 w-5 text-dash-lime-deep" strokeWidth={2} aria-hidden />
            Add campus
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dash-muted">
                Display name
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Little Berries — Whitefield"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dash-muted">
                Sort order (optional)
              </label>
              <input
                className={inputClass}
                placeholder="e.g. 1"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-dash-ink text-sm font-bold text-white shadow-lg shadow-dash-ink/15 disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
              Create campus
            </button>
          </div>
        </form>

        <div className="rounded-[28px] border border-dash-subtle bg-dash-surface p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-dash-ink">All campuses</h2>
          {currentUser?.role === "admin" && sessionBranchId === null && (
            <p className="mb-4 rounded-2xl border border-dash-lime/40 bg-dash-lime/15 px-4 py-3 text-sm font-medium text-dash-ink">
              You are signed in across <span className="font-bold">all campuses</span>. Pick a campus on the login screen if you prefer a default filter in the header.
            </p>
          )}
          {sorted.length === 0 ? (
            <p className="text-sm font-medium text-dash-muted">No campuses loaded yet. Pull to refresh or check the auth API.</p>
          ) : (
            <ul className="space-y-3">
              {sorted.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-col gap-3 rounded-[20px] border border-dash-subtle bg-dash-canvas/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold text-dash-ink">{b.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-dash-muted">id: {b.id}</p>
                    {b.sortOrder != null && b.sortOrder !== "" && (
                      <p className="mt-1 text-xs font-semibold text-dash-muted">Order: {b.sortOrder}</p>
                    )}
                    {sessionBranchId === b.id && (
                      <span className="mt-2 inline-block rounded-full bg-dash-lime/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-dash-ink">
                        Your current session
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(b)}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-[24px] border-dash-subtle">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this campus?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? (
                <>
                  <strong className="text-dash-ink">{deleteTarget.name}</strong> will be removed from the login list.
                  This only succeeds if no classes, students, or users still reference this campus.
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
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete campus"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
