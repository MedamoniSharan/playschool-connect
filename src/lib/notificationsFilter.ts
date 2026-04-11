import type { Notification, Role, Student, User } from "@/types";

/** Whether a notification should appear in the current user's inbox */
export function isNotificationVisible(
  n: Notification,
  user: User,
  children: Student[],
  teacherClassId: string | undefined,
): boolean {
  if (!n.targetRoles.includes(user.role as Role)) return false;
  if (n.scope !== "class" || !n.classId) return true;
  if (user.role === "parent") return children.some((c) => c.classId === n.classId);
  if (user.role === "teacher") return teacherClassId === n.classId;
  if (user.role === "admin") return true;
  return false;
}
