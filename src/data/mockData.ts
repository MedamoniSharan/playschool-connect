import type {
  User,
  Student,
  ClassRoom,
  MediaItem,
  AttendanceRecord,
  FeeEntry,
  Notification,
  ClassCurriculum,
  LessonProgress,
  LessonPlan,
  StudentReport,
} from "@/types";

export const users: User[] = [
  { id: "u1", name: "Priya Sharma", role: "admin", email: "admin@smartplay.com", password: "admin123" },
  { id: "u2", name: "Rahul Mehta", role: "teacher", email: "teacher@smartplay.com", password: "teacher123", classId: "c1" },
  { id: "u3", name: "Anita Verma", role: "teacher", email: "anita@smartplay.com", password: "teacher123", classId: "c2" },
  { id: "u4", name: "Sanjay Gupta", role: "parent", email: "parent@smartplay.com", password: "parent123", childIds: ["s1", "s3"] },
  { id: "u5", name: "Meera Patel", role: "parent", email: "meera@gmail.com", password: "parent123", childIds: ["s2"] },
  { id: "u6", name: "Vikram Singh", role: "parent", email: "vikram@gmail.com", password: "parent123", childIds: ["s4"] },
];

export const students: Student[] = [
  { id: "s1", name: "Aarav Gupta", age: 4, classId: "c1", section: "A", parentId: "u4", gender: "male", enrollmentDate: "2024-06-15" },
  { id: "s2", name: "Ishita Patel", age: 3, classId: "c1", section: "A", parentId: "u5", gender: "female", enrollmentDate: "2024-07-01" },
  { id: "s3", name: "Reyansh Gupta", age: 5, classId: "c2", section: "A", parentId: "u4", gender: "male", enrollmentDate: "2024-06-20" },
  { id: "s4", name: "Anaya Singh", age: 4, classId: "c2", section: "B", parentId: "u6", gender: "female", enrollmentDate: "2024-08-10" },
  { id: "s5", name: "Vihaan Kumar", age: 3, classId: "c1", section: "B", parentId: "u4", gender: "male", enrollmentDate: "2024-09-01" },
  { id: "s6", name: "Diya Reddy", age: 5, classId: "c2", section: "B", parentId: "u5", gender: "female", enrollmentDate: "2024-07-15" },
];

export const classes: ClassRoom[] = [
  { id: "c1", name: "Little Stars", teacherId: "u2", sections: ["A", "B"], studentIds: ["s1", "s2", "s5"] },
  { id: "c2", name: "Bright Sparks", teacherId: "u3", sections: ["A", "B"], studentIds: ["s3", "s4", "s6"] },
];

/** Montessori-style curriculum per class */
export const curriculum: ClassCurriculum[] = [
  {
    classId: "c1",
    subjects: [
      {
        id: "sub-c1-pl",
        classId: "c1",
        name: "Practical Life",
        activities: [
          { id: "act-c1-pl-1", subjectId: "sub-c1-pl", name: "Pouring water", description: "Transfer between glass pitchers" },
          { id: "act-c1-pl-2", subjectId: "sub-c1-pl", name: "Spooning", description: "Dry transfer with a spoon" },
          { id: "act-c1-pl-3", subjectId: "sub-c1-pl", name: "Button frame", description: "Dressing independence" },
        ],
      },
      {
        id: "sub-c1-se",
        classId: "c1",
        name: "Sensorial",
        activities: [
          { id: "act-c1-se-1", subjectId: "sub-c1-se", name: "Pink tower", description: "Cubes 1–10" },
          { id: "act-c1-se-2", subjectId: "sub-c1-se", name: "Brown stairs", description: "Broad stair" },
          { id: "act-c1-se-3", subjectId: "sub-c1-se", name: "Color box II", description: "Secondary colors" },
        ],
      },
      {
        id: "sub-c1-la",
        classId: "c1",
        name: "Language",
        activities: [
          { id: "act-c1-la-1", subjectId: "sub-c1-la", name: "Sandpaper letters", description: "Letter sounds" },
          { id: "act-c1-la-2", subjectId: "sub-c1-la", name: "Movable alphabet", description: "Word building" },
        ],
      },
      {
        id: "sub-c1-ma",
        classId: "c1",
        name: "Mathematics",
        activities: [
          { id: "act-c1-ma-1", subjectId: "sub-c1-ma", name: "Number rods", description: "Quantity 1–10" },
          { id: "act-c1-ma-2", subjectId: "sub-c1-ma", name: "Spindle boxes", description: "Zero & numerals" },
        ],
      },
    ],
  },
  {
    classId: "c2",
    subjects: [
      {
        id: "sub-c2-pl",
        classId: "c2",
        name: "Practical Life",
        activities: [
          { id: "act-c2-pl-1", subjectId: "sub-c2-pl", name: "Polishing", description: "Silver / brass" },
          { id: "act-c2-pl-2", subjectId: "sub-c2-pl", name: "Food prep", description: "Chopping & spreading" },
        ],
      },
      {
        id: "sub-c2-se",
        classId: "c2",
        name: "Sensorial",
        activities: [
          { id: "act-c2-se-1", subjectId: "sub-c2-se", name: "Geometric solids", description: "Names & sorting" },
          { id: "act-c2-se-2", subjectId: "sub-c2-se", name: "Sound cylinders", description: "Auditory discrimination" },
        ],
      },
      {
        id: "sub-c2-la",
        classId: "c2",
        name: "Language",
        activities: [
          { id: "act-c2-la-1", subjectId: "sub-c2-la", name: "Phonetic objects", description: "Beginning sounds" },
          { id: "act-c2-la-2", subjectId: "sub-c2-la", name: "Sentence analysis", description: "Simple grammar" },
        ],
      },
      {
        id: "sub-c2-ma",
        classId: "c2",
        name: "Mathematics",
        activities: [
          { id: "act-c2-ma-1", subjectId: "sub-c2-ma", name: "Golden beads", description: "Decimal system intro" },
          { id: "act-c2-ma-2", subjectId: "sub-c2-ma", name: "Teen board", description: "11–19" },
        ],
      },
    ],
  },
];

function seedLessonProgress(allStudents: Student[], curr: ClassCurriculum[]): LessonProgress[] {
  const out: LessonProgress[] = [];
  let k = 0;
  for (const st of allStudents) {
    const cc = curr.find((c) => c.classId === st.classId);
    if (!cc) continue;
    for (const sub of cc.subjects) {
      for (const act of sub.activities) {
        const mod = (st.id.charCodeAt(2) + k + act.name.length) % 6;
        k++;
        if (mod === 0) continue;
        const stage = mod === 1 ? "presented" : mod <= 3 ? "practiced" : "mastered";
        out.push({
          id: `prog-${st.id}-${act.id}`,
          studentId: st.id,
          activityId: act.id,
          stage,
          updatedAt: "2026-04-09",
        });
      }
    }
  }
  return out;
}

export const lessonProgress: LessonProgress[] = seedLessonProgress(students, curriculum);

export const lessonPlans: LessonPlan[] = [
  {
    id: "plan-1",
    classId: "c1",
    studentId: "s1",
    activityId: "act-c1-pl-1",
    date: "2026-04-11",
    notes: "Focus on steady pour height",
  },
  {
    id: "plan-2",
    classId: "c1",
    studentId: "s2",
    activityId: "act-c1-la-1",
    date: "2026-04-11",
    notes: "Letters s, a, t",
  },
  {
    id: "plan-3",
    classId: "c1",
    studentId: "s5",
    activityId: "act-c1-se-1",
    date: "2026-04-11",
    notes: "Rebuild with control",
  },
  {
    id: "plan-4",
    classId: "c2",
    studentId: "s3",
    activityId: "act-c2-ma-1",
    date: "2026-04-11",
    notes: "Quantity to symbol",
  },
  {
    id: "plan-5",
    classId: "c2",
    studentId: "s4",
    activityId: "act-c2-la-1",
    date: "2026-04-12",
    notes: "Object–sound match",
  },
  {
    id: "plan-6",
    classId: "c2",
    studentId: "s6",
    activityId: "act-c2-pl-2",
    date: "2026-04-10",
    notes: "Cucumber slicing",
  },
];

export const studentReports: StudentReport[] = [
  {
    id: "rep-1",
    studentId: "s1",
    generatedAt: "2026-04-01",
    periodLabel: "March 2026",
    lessonsPresented: 8,
    lessonsPracticed: 5,
    lessonsMastered: 2,
    attendanceRate: 92,
    narrative:
      "Aarav shows strong focus in practical life. Language work is progressing steadily; continue movable alphabet extensions at home.",
  },
  {
    id: "rep-2",
    studentId: "s3",
    generatedAt: "2026-04-01",
    periodLabel: "March 2026",
    lessonsPresented: 10,
    lessonsPracticed: 6,
    lessonsMastered: 3,
    attendanceRate: 88,
    narrative:
      "Reyansh is engaged with math materials and enjoys peer collaboration during group presentations.",
  },
];

export const gallery: MediaItem[] = [
  { id: "m1", url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400", type: "photo", title: "Art Day Fun", event: "Art Day", date: "2026-03-15", studentIds: ["s1", "s2"], uploadedBy: "u2" },
  { id: "m2", url: "https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=400", type: "photo", title: "Sports Day Race", event: "Sports Day", date: "2026-03-20", studentIds: ["s3", "s4"], uploadedBy: "u3" },
  { id: "m3", url: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400", type: "photo", title: "Story Time", event: "Reading Week", date: "2026-04-01", studentIds: ["s1", "s5"], uploadedBy: "u2" },
  { id: "m4", url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400", type: "photo", title: "Dance Practice", event: "Annual Day Prep", date: "2026-04-05", studentIds: ["s2", "s3", "s4"], uploadedBy: "u3" },
  { id: "m5", url: "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=400", type: "photo", title: "Painting Session", event: "Art Day", date: "2026-03-15", studentIds: ["s1", "s6"], uploadedBy: "u2" },
  { id: "m6", url: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=400", type: "photo", title: "Outdoor Play", event: "Fun Friday", date: "2026-04-08", studentIds: ["s2", "s5"], uploadedBy: "u2" },
];

export const attendance: AttendanceRecord[] = [
  { id: "a1", date: "2026-04-11", classId: "c1", records: [
    { studentId: "s1", status: "present" }, { studentId: "s2", status: "present" }, { studentId: "s5", status: "absent" },
  ]},
  { id: "a2", date: "2026-04-11", classId: "c2", records: [
    { studentId: "s3", status: "present" }, { studentId: "s4", status: "absent" }, { studentId: "s6", status: "present" },
  ]},
  { id: "a3", date: "2026-04-10", classId: "c1", records: [
    { studentId: "s1", status: "present" }, { studentId: "s2", status: "absent" }, { studentId: "s5", status: "present" },
  ]},
  { id: "a4", date: "2026-04-10", classId: "c2", records: [
    { studentId: "s3", status: "present" }, { studentId: "s4", status: "present" }, { studentId: "s6", status: "present" },
  ]},
];

export const fees: FeeEntry[] = [
  { id: "f1", studentId: "s1", amount: 5000, dueDate: "2026-04-15", status: "pending", description: "April Tuition Fee" },
  { id: "f2", studentId: "s2", amount: 5000, dueDate: "2026-04-15", status: "paid", description: "April Tuition Fee" },
  { id: "f3", studentId: "s3", amount: 5000, dueDate: "2026-04-15", status: "overdue", description: "April Tuition Fee" },
  { id: "f4", studentId: "s4", amount: 5000, dueDate: "2026-04-15", status: "paid", description: "April Tuition Fee" },
  { id: "f5", studentId: "s1", amount: 2000, dueDate: "2026-04-20", status: "pending", description: "Annual Day Fee" },
  { id: "f6", studentId: "s5", amount: 5000, dueDate: "2026-04-15", status: "pending", description: "April Tuition Fee" },
];

export const notifications: Notification[] = [
  {
    id: "n1",
    type: "announcement",
    title: "Annual Day on April 25th",
    message: "Dear parents, please prepare costumes for the annual day celebration.",
    date: "2026-04-08",
    read: false,
    targetRoles: ["parent", "teacher"],
    scope: "global",
  },
  {
    id: "n2",
    type: "fee",
    title: "Fee Reminder",
    message: "Tuition fee for April is due on April 15th.",
    date: "2026-04-07",
    read: false,
    targetRoles: ["parent"],
    scope: "global",
  },
  {
    id: "n3",
    type: "gallery",
    title: "New Photos Uploaded",
    message: "Art Day photos have been uploaded to the gallery.",
    date: "2026-04-06",
    read: true,
    targetRoles: ["parent"],
    scope: "global",
  },
  {
    id: "n4",
    type: "attendance",
    title: "Attendance Alert",
    message: "Your child was marked absent today.",
    date: "2026-04-11",
    read: false,
    targetRoles: ["parent"],
    scope: "global",
  },
  {
    id: "n5",
    type: "announcement",
    title: "Summer Camp Registration",
    message: "Summer camp registrations are now open. Register before April 20th.",
    date: "2026-04-05",
    read: true,
    targetRoles: ["parent", "teacher", "admin"],
    scope: "global",
  },
  {
    id: "n6",
    type: "progress",
    title: "New progress update",
    message: "Lesson progress was updated for Little Stars — check the Progress page.",
    date: "2026-04-09",
    read: false,
    targetRoles: ["parent"],
    scope: "class",
    classId: "c1",
  },
  {
    id: "n7",
    type: "report",
    title: "Report ready",
    message: "March progress report is available for your child.",
    date: "2026-04-02",
    read: true,
    targetRoles: ["parent"],
    scope: "global",
  },
];
