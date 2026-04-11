import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/ui-custom/SharedComponents";
import { Bell, DollarSign, Image, CalendarCheck, Megaphone } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  fee: <DollarSign size={16} />,
  gallery: <Image size={16} />,
  attendance: <CalendarCheck size={16} />,
  announcement: <Megaphone size={16} />,
};

const colorMap: Record<string, string> = {
  fee: "bg-accent/10 text-accent",
  gallery: "bg-primary-light text-primary",
  attendance: "bg-success/10 text-success",
  announcement: "bg-primary-light text-primary",
};

export default function Notifications() {
  const { currentUser, notifications, setNotifications } = useApp();
  if (!currentUser) return null;
  const filtered = notifications.filter((n) => n.targetRoles.includes(currentUser.role));

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div>
      <PageHeader title="Notifications" description={`${filtered.filter(n => !n.read).length} unread`} />
      <div className="space-y-3">
        {filtered.map((n) => (
          <div key={n.id} onClick={() => markRead(n.id)}
            className={`bg-card rounded-xl border border-border p-4 flex items-start gap-4 cursor-pointer transition-all hover:shadow-sm ${
              !n.read ? "border-l-4 border-l-primary" : ""
            }`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[n.type]}`}>
              {iconMap[n.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{n.date}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground"><p>No notifications</p></div>
        )}
      </div>
    </div>
  );
}
