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

export interface Notification {
  id: string;
  type: "fee" | "announcement" | "gallery" | "attendance";
  title: string;
  message: string;
  date: string;
  read: boolean;
  targetRoles: Role[];
}
