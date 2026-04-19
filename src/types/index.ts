export type Role = "admin" | "teacher" | "parent";

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  password: string;
  /** Optional profile photo URL */
  avatar?: string;
  classId?: string;
  childIds?: string[];
}

export interface Student {
  id: string;
  name: string;
  age: number;
  classId: string;
  section: string;
  parentId: string;
  /** Optional profile photo URL */
  avatar?: string;
  gender: "male" | "female";
  enrollmentDate: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  teacherId: string;
  sections: string[];
  studentIds: string[];
}

export interface MediaItem {
  id: string;
  url: string;
  /** When set, backend can presign GET without parsing `url`. */
  s3Key?: string;
  type: "photo" | "video";
  title: string;
  event: string;
  date: string;
  studentIds: string[];
  uploadedBy: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  records: { studentId: string; status: "present" | "absent" }[];
}

export interface FeeEntry {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  description: string;
}

export type ProgressStage = "not_started" | "presented" | "practiced" | "mastered";

export interface Activity {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
}

export interface Subject {
  id: string;
  classId: string;
  name: string;
  activities: Activity[];
}

/** Montessori-style curriculum scoped to a class */
export interface ClassCurriculum {
  classId: string;
  subjects: Subject[];
}

export interface LessonProgress {
  id: string;
  studentId: string;
  activityId: string;
  stage: Exclude<ProgressStage, "not_started">;
  updatedAt: string;
}

export interface LessonPlan {
  id: string;
  classId: string;
  studentId: string;
  activityId: string;
  date: string;
  notes?: string;
}

export interface StudentReport {
  id: string;
  studentId: string;
  generatedAt: string;
  periodLabel: string;
  lessonsPresented: number;
  lessonsPracticed: number;
  lessonsMastered: number;
  attendanceRate: number;
  narrative?: string;
}

export type NotificationType =
  | "fee"
  | "announcement"
  | "gallery"
  | "attendance"
  | "progress"
  | "report";

/** Who should see a scoped notification (e.g. class-only announcements) */
export type NotificationScope = "global" | "class";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  targetRoles: Role[];
  /** When set, only parents with a child in this class see the item */
  scope?: NotificationScope;
  classId?: string;
}
