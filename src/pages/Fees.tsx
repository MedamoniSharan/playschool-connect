import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, StatusBadge, PersonAvatar } from "@/components/ui-custom/SharedComponents";
import { cn } from "@/lib/utils";
import { Plus, X, LayoutGrid, List } from "lucide-react";
import { students as allStudents } from "@/data/mockData";
import { FeeEntry } from "@/types";

function CreateFeeModal({ onClose, onSave }: { onClose: () => void; onSave: (entry: FeeEntry) => void }) {
  const [studentId, setStudentId] = useState(allStudents[0].id);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!amount || !description) return;
    onSave({
      id: `f${Date.now()}`,
      studentId,
      amount: Number(amount),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      status: "pending",
      description,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-dash-surface rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Create Fee Entry</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-3 py-2 rounded-[16px] border border-input bg-background text-sm outline-none">
            {allStudents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="number" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-[16px] border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-[16px] border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={handleSave} className="w-full py-2.5 bg-dash-ink text-white shadow-md shadow-dash-ink/20 rounded-[16px] text-sm font-medium hover:opacity-90">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Fees() {
  const { currentUser, fees, setFees, getChildrenForParent } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  if (!currentUser) return null;

  let displayFees = fees;
  if (currentUser.role === "parent") {
    const childIds = getChildrenForParent(currentUser.id).map((c) => c.id);
    displayFees = fees.filter((f) => childIds.includes(f.studentId));
  }

  const handlePay = (id: string) => setFees((prev) => prev.map((f) => f.id === id ? { ...f, status: "paid" as const } : f));
  const handleCreate = (entry: FeeEntry) => setFees((prev) => [...prev, entry]);

  return (
    <div>
      <PageHeader
        title="Fees"
        description={currentUser.role === "admin" ? "Manage all fee entries" : "Your fee details"}
        action={
          <div className="flex items-center gap-3">
            {currentUser.role === "admin" && (
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-dash-ink text-white shadow-md shadow-dash-ink/20 rounded-[16px] text-sm font-medium hover:opacity-90">
                <Plus size={16} /> Create Fee
              </button>
            )}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                  viewMode === "table" ? "bg-dash-ink text-white shadow-sm" : "bg-dash-canvas text-dash-muted hover:text-dash-ink"
                )}
                aria-label="Table view"
              >
                <List size={16} strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                  viewMode === "grid" ? "bg-dash-ink text-white shadow-sm" : "bg-dash-canvas text-dash-muted hover:text-dash-ink"
                )}
                aria-label="Grid view"
              >
                <LayoutGrid size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        }
      />

      {viewMode === "table" && (
        <div className="bg-dash-surface rounded-[24px] border border-dash-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-dash-subtle bg-dash-canvas/50">
                  <th className="text-left text-xs font-medium text-dash-muted py-3 px-4">Student</th>
                  <th className="text-left text-xs font-medium text-dash-muted py-3 px-4">Description</th>
                  <th className="text-left text-xs font-medium text-dash-muted py-3 px-4">Amount</th>
                  <th className="text-left text-xs font-medium text-dash-muted py-3 px-4">Due Date</th>
                  <th className="text-left text-xs font-medium text-dash-muted py-3 px-4">Status</th>
                  {currentUser.role === "parent" && <th className="text-right text-xs font-medium text-dash-muted py-3 px-4">Action</th>}
                </tr>
              </thead>
              <tbody>
                {displayFees.map((fee) => {
                  const student = allStudents.find((s) => s.id === fee.studentId);
                  return (
                    <tr key={fee.id} className="border-b border-dash-subtle last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {student ? (
                            <PersonAvatar kind="student" id={student.id} gender={student.gender} size="sm" />
                          ) : (
                            <PersonAvatar kind="student" id={fee.studentId} gender="male" size="sm" />
                          )}
                          <span className="text-sm font-medium">{student?.name ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{fee.description}</td>
                      <td className="py-3 px-4 text-sm font-medium">₹{fee.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-dash-muted">{fee.dueDate}</td>
                      <td className="py-3 px-4"><StatusBadge status={fee.status} /></td>
                      {currentUser.role === "parent" && (
                        <td className="py-3 px-4 text-right">
                          {fee.status !== "paid" && (
                            <button onClick={() => handlePay(fee.id)}
                              className="text-xs px-3 py-1.5 rounded-[16px] bg-success text-success-foreground font-medium hover:opacity-90">
                              Pay Now
                            </button>
                          )}
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

      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayFees.map((fee) => {
            const student = allStudents.find((s) => s.id === fee.studentId);
            return (
              <div
                key={fee.id}
                className="overflow-hidden rounded-[24px] border border-dash-subtle bg-dash-surface p-5 shadow-sm transition-all hover:border-dash-ring hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  {student ? (
                    <PersonAvatar kind="student" id={student.id} gender={student.gender} />
                  ) : (
                    <PersonAvatar kind="student" id={fee.studentId} gender="male" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-dash-ink">{student?.name ?? "Unknown"}</h3>
                    <p className="text-xs text-dash-muted">{fee.description}</p>
                  </div>
                </div>
                <div className="space-y-2 border-t border-dash-subtle pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-dash-muted">Amount</span>
                    <span className="font-bold text-dash-ink">₹{fee.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-dash-muted">Due Date</span>
                    <span className="font-semibold text-dash-ink">{fee.dueDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-dash-muted">Status</span>
                    <StatusBadge status={fee.status} />
                  </div>
                </div>
                {currentUser.role === "parent" && fee.status !== "paid" && (
                  <button
                    onClick={() => handlePay(fee.id)}
                    className="mt-4 w-full rounded-full bg-success py-2.5 text-center text-xs font-bold text-success-foreground transition-transform hover:scale-[1.01]"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {displayFees.length === 0 && (
        <div className="text-center py-16 text-dash-muted"><p>No fee entries found</p></div>
      )}

      {showCreate && <CreateFeeModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
    </div>
  );
}
