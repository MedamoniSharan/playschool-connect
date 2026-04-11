import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui-custom/SharedComponents";
import { Send, Check } from "lucide-react";
import type { Notification } from "@/types";

export default function Communications() {
  const { currentUser, classes, setNotifications } = useApp();
  const [adminClassId, setAdminClassId] = useState(classes[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (!currentUser || (currentUser.role !== "teacher" && currentUser.role !== "admin")) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Class messages are available to teachers and admins.
      </div>
    );
  }

  const classId = currentUser.role === "teacher" ? currentUser.classId : adminClassId;
  const cls = classes.find((c) => c.id === classId);

  const handleSend = () => {
    if (!title.trim() || !message.trim() || !classId) return;
    const n: Notification = {
      id: `n-class-${Date.now()}`,
      type: "announcement",
      title: title.trim(),
      message: message.trim(),
      date: new Date().toISOString().split("T")[0],
      read: false,
      targetRoles: ["parent"],
      scope: "class",
      classId,
    };
    setNotifications((prev) => [n, ...prev]);
    setTitle("");
    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Class messages"
        description={
          cls
            ? `Announcements go to parents of ${cls.name} only.`
            : "Link a class to your account to send class-scoped notes."
        }
      />
      <div className="max-w-lg">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          {currentUser.role === "admin" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Class</label>
              <select
                value={adminClassId}
                onChange={(e) => setAdminClassId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Field trip next Wednesday"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Short and friendly — parents read this on their phone."
              rows={5}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!classId}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send to class parents
          </button>
          {sent && (
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" />
              Sent — parents will see this in Notifications.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
