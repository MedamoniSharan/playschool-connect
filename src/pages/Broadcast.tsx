import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui-custom/SharedComponents";
import { Check, Send } from "lucide-react";
import { Notification } from "@/types";

export default function Broadcast() {
  const { setNotifications } = useApp();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!title || !message) return;
    const newNotification: Notification = {
      id: `n${Date.now()}`,
      type: "announcement",
      title,
      message,
      date: new Date().toISOString().split("T")[0],
      read: false,
      targetRoles: ["parent", "teacher", "admin"],
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setTitle("");
    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div>
      <PageHeader title="Broadcast" description="Send announcements to all users" />
      <div className="max-w-lg">
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <input placeholder="Announcement title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          <textarea placeholder="Write your message..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
          <button onClick={handleSend} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Send size={16} /> Send Broadcast
          </button>
          {sent && (
            <p className="text-sm text-success font-medium flex items-center gap-1.5">
              <Check size={16} strokeWidth={2} className="shrink-0" aria-hidden />
              Broadcast sent successfully.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
