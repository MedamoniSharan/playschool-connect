import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, StatusBadge, Avatar } from "@/components/ui-custom/SharedComponents";
import { Plus, X } from "lucide-react";
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
      <div className="bg-card rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Create Fee Entry</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none">
            {allStudents.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="number" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={handleSave} className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
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
        action={currentUser.role === "admin" ? (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Create Fee
          </button>
        ) : undefined}
      />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Student</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Description</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Due Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Status</th>
                {currentUser.role === "parent" && <th className="text-right text-xs font-medium text-muted-foreground py-3 px-4">Action</th>}
              </tr>
            </thead>
            <tbody>
              {displayFees.map((fee) => {
                const student = allStudents.find((s) => s.id === fee.studentId);
                return (
                  <tr key={fee.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar initials={student?.avatar || ""} size="sm" />
                        <span className="text-sm font-medium">{student?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{fee.description}</td>
                    <td className="py-3 px-4 text-sm font-medium">₹{fee.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{fee.dueDate}</td>
                    <td className="py-3 px-4"><StatusBadge status={fee.status} /></td>
                    {currentUser.role === "parent" && (
                      <td className="py-3 px-4 text-right">
                        {fee.status !== "paid" && (
                          <button onClick={() => handlePay(fee.id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-success text-success-foreground font-medium hover:opacity-90">
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

      {displayFees.length === 0 && (
        <div className="text-center py-16 text-muted-foreground"><p>No fee entries found</p></div>
      )}

      {showCreate && <CreateFeeModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
    </div>
  );
}
