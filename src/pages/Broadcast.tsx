import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { API_URLS } from "@/config/api";
import { PageHeader } from "@/components/ui-custom/SharedComponents";
import { Check, Loader2, Send } from "lucide-react";
import { Notification } from "@/types";

export default function Broadcast() {
  const { setNotifications } = useApp();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!title || !message) return;
    setIsSending(true);
    const newNotification: Notification = {
      id: `n${Date.now()}`,
      type: "announcement",
      title,
      message,
      date: new Date().toISOString().split("T")[0],
      read: false,
      targetRoles: ["parent", "teacher", "admin"],
      scope: "global",
    };
    setNotifications((prev) => [newNotification, ...prev]);
    if (API_URLS.notifications) {
      try {
        await fetch(API_URLS.notifications, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "upsert_notifications", notifications: [newNotification] }),
        });
      } catch (e) {
        console.error("Failed to send broadcast to API:", e);
      }
    }
    setTitle("");
    setMessage("");
    setIsSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div>
      <PageHeader title="Broadcast" description="Send announcements to all users" />
      <div className="max-w-lg">
        <div className="bg-dash-surface rounded-[24px] border border-dash-subtle p-6 space-y-4">
          <input placeholder="Announcement title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-[16px] border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" />
          <textarea placeholder="Write your message..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
            className="w-full px-3 py-2 rounded-[16px] border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center gap-2 px-5 py-2.5 bg-dash-ink text-white shadow-md shadow-dash-ink/20 rounded-[16px] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isSending ? "Sending..." : "Send Broadcast"}
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
