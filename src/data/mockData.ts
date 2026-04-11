import { User, Student, ClassRoom, MediaItem, AttendanceRecord, FeeEntry, Notification } from "@/types";

export const users: User[] = [
  { id: "u1", name: "Priya Sharma", role: "admin", email: "admin@smartplay.com", password: "admin123", avatar: "PS" },
  { id: "u2", name: "Rahul Mehta", role: "teacher", email: "teacher@smartplay.com", password: "teacher123", avatar: "RM", classId: "c1" },
  { id: "u3", name: "Anita Verma", role: "teacher", email: "anita@smartplay.com", password: "teacher123", avatar: "AV", classId: "c2" },
  { id: "u4", name: "Sanjay Gupta", role: "parent", email: "parent@smartplay.com", password: "parent123", avatar: "SG", childIds: ["s1", "s3"] },
  { id: "u5", name: "Meera Patel", role: "parent", email: "meera@gmail.com", password: "parent123", avatar: "MP", childIds: ["s2"] },
  { id: "u6", name: "Vikram Singh", role: "parent", email: "vikram@gmail.com", password: "parent123", avatar: "VS", childIds: ["s4"] },
];

export const students: Student[] = [
  { id: "s1", name: "Aarav Gupta", age: 4, classId: "c1", section: "A", parentId: "u4", avatar: "AG", gender: "male", enrollmentDate: "2024-06-15" },
  { id: "s2", name: "Ishita Patel", age: 3, classId: "c1", section: "A", parentId: "u5", avatar: "IP", gender: "female", enrollmentDate: "2024-07-01" },
  { id: "s3", name: "Reyansh Gupta", age: 5, classId: "c2", section: "A", parentId: "u4", avatar: "RG", gender: "male", enrollmentDate: "2024-06-20" },
  { id: "s4", name: "Anaya Singh", age: 4, classId: "c2", section: "B", parentId: "u6", avatar: "AS", gender: "female", enrollmentDate: "2024-08-10" },
  { id: "s5", name: "Vihaan Kumar", age: 3, classId: "c1", section: "B", parentId: "u4", avatar: "VK", gender: "male", enrollmentDate: "2024-09-01" },
  { id: "s6", name: "Diya Reddy", age: 5, classId: "c2", section: "B", parentId: "u5", avatar: "DR", gender: "female", enrollmentDate: "2024-07-15" },
];

export const classes: ClassRoom[] = [
  { id: "c1", name: "Little Stars", teacherId: "u2", sections: ["A", "B"], studentIds: ["s1", "s2", "s5"] },
  { id: "c2", name: "Bright Sparks", teacherId: "u3", sections: ["A", "B"], studentIds: ["s3", "s4", "s6"] },
];

export const gallery: MediaItem[] = [
  { id: "m1", url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400", type: "photo", title: "Art Day Fun", event: "Art Day", date: "2025-03-15", studentIds: ["s1", "s2"], uploadedBy: "u2" },
  { id: "m2", url: "https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=400", type: "photo", title: "Sports Day Race", event: "Sports Day", date: "2025-03-20", studentIds: ["s3", "s4"], uploadedBy: "u3" },
  { id: "m3", url: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400", type: "photo", title: "Story Time", event: "Reading Week", date: "2025-04-01", studentIds: ["s1", "s5"], uploadedBy: "u2" },
  { id: "m4", url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400", type: "photo", title: "Dance Practice", event: "Annual Day Prep", date: "2025-04-05", studentIds: ["s2", "s3", "s4"], uploadedBy: "u3" },
  { id: "m5", url: "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=400", type: "photo", title: "Painting Session", event: "Art Day", date: "2025-03-15", studentIds: ["s1", "s6"], uploadedBy: "u2" },
  { id: "m6", url: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=400", type: "photo", title: "Outdoor Play", event: "Fun Friday", date: "2025-04-08", studentIds: ["s2", "s5"], uploadedBy: "u2" },
];

export const attendance: AttendanceRecord[] = [
  { id: "a1", date: "2025-04-10", classId: "c1", records: [
    { studentId: "s1", status: "present" }, { studentId: "s2", status: "present" }, { studentId: "s5", status: "absent" }
  ]},
  { id: "a2", date: "2025-04-10", classId: "c2", records: [
    { studentId: "s3", status: "present" }, { studentId: "s4", status: "absent" }, { studentId: "s6", status: "present" }
  ]},
  { id: "a3", date: "2025-04-09", classId: "c1", records: [
    { studentId: "s1", status: "present" }, { studentId: "s2", status: "absent" }, { studentId: "s5", status: "present" }
  ]},
  { id: "a4", date: "2025-04-09", classId: "c2", records: [
    { studentId: "s3", status: "present" }, { studentId: "s4", status: "present" }, { studentId: "s6", status: "present" }
  ]},
];

export const fees: FeeEntry[] = [
  { id: "f1", studentId: "s1", amount: 5000, dueDate: "2025-04-15", status: "pending", description: "April Tuition Fee" },
  { id: "f2", studentId: "s2", amount: 5000, dueDate: "2025-04-15", status: "paid", description: "April Tuition Fee" },
  { id: "f3", studentId: "s3", amount: 5000, dueDate: "2025-04-15", status: "overdue", description: "April Tuition Fee" },
  { id: "f4", studentId: "s4", amount: 5000, dueDate: "2025-04-15", status: "paid", description: "April Tuition Fee" },
  { id: "f5", studentId: "s1", amount: 2000, dueDate: "2025-04-20", status: "pending", description: "Annual Day Fee" },
  { id: "f6", studentId: "s5", amount: 5000, dueDate: "2025-04-15", status: "pending", description: "April Tuition Fee" },
];

export const notifications: Notification[] = [
  { id: "n1", type: "announcement", title: "Annual Day on April 25th", message: "Dear parents, please prepare costumes for the annual day celebration.", date: "2025-04-08", read: false, targetRoles: ["parent", "teacher"] },
  { id: "n2", type: "fee", title: "Fee Reminder", message: "Tuition fee for April is due on April 15th.", date: "2025-04-07", read: false, targetRoles: ["parent"] },
  { id: "n3", type: "gallery", title: "New Photos Uploaded", message: "Art Day photos have been uploaded to the gallery.", date: "2025-04-06", read: true, targetRoles: ["parent"] },
  { id: "n4", type: "attendance", title: "Attendance Alert", message: "Your child was marked absent today.", date: "2025-04-10", read: false, targetRoles: ["parent"] },
  { id: "n5", type: "announcement", title: "Summer Camp Registration", message: "Summer camp registrations are now open. Register before April 20th.", date: "2025-04-05", read: true, targetRoles: ["parent", "teacher", "admin"] },
];
