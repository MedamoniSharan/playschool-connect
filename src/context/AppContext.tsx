import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
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
  Activity,
  Subject,
} from "@/types";
import {
  users as mockUsers,
  students as mockStudents,
  gallery,
  attendance,
  fees,
  notifications,
  classes as mockClasses,
  curriculum as seedCurriculum,
  lessonProgress as seedLessonProgress,
  lessonPlans as seedLessonPlans,
  studentReports as seedStudentReports,
} from "@/data/mockData";
import { buildReportFromData } from "@/lib/montessori";

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  allUsers: User[];
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  classes: ClassRoom[];
  setClasses: React.Dispatch<React.SetStateAction<ClassRoom[]>>;
  gallery: MediaItem[];
  setGallery: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  fees: FeeEntry[];
  setFees: React.Dispatch<React.SetStateAction<FeeEntry[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  curriculum: ClassCurriculum[];
  setCurriculum: React.Dispatch<React.SetStateAction<ClassCurriculum[]>>;
  lessonProgress: LessonProgress[];
  setLessonProgress: React.Dispatch<React.SetStateAction<LessonProgress[]>>;
  lessonPlans: LessonPlan[];
  setLessonPlans: React.Dispatch<React.SetStateAction<LessonPlan[]>>;
  studentReports: StudentReport[];
  setStudentReports: React.Dispatch<React.SetStateAction<StudentReport[]>>;
  getChildrenForParent: (parentId: string) => Student[];
  getStudentsForTeacher: (teacherId: string) => Student[];
  getActivitiesWithSubjects: (classId: string) => { activity: Activity; subjectName: string }[];
  updateLessonStage: (studentId: string, activityId: string, stage: LessonProgress["stage"]) => void;
  addSubject: (classId: string, name: string) => void;
  addActivity: (classId: string, subjectId: string, name: string, description?: string) => void;
  addLessonPlan: (plan: Omit<LessonPlan, "id">) => void;
  removeLessonPlan: (id: string) => void;
  generateStudentReport: (studentId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [studentsState, setStudents] = useState<Student[]>(mockStudents);
  const [classesState, setClasses] = useState<ClassRoom[]>(mockClasses);
  const [galleryState, setGallery] = useState<MediaItem[]>(gallery);
  const [attendanceState, setAttendance] = useState<AttendanceRecord[]>(attendance);
  const [feesState, setFees] = useState<FeeEntry[]>(fees);
  const [notificationsState, setNotifications] = useState<Notification[]>(notifications);
  const [curriculumState, setCurriculum] = useState<ClassCurriculum[]>(seedCurriculum);
  const [lessonProgressState, setLessonProgress] = useState<LessonProgress[]>(seedLessonProgress);
  const [lessonPlansState, setLessonPlans] = useState<LessonPlan[]>(seedLessonPlans);
  const [studentReportsState, setStudentReports] = useState<StudentReport[]>(seedStudentReports);

  const login = useCallback((email: string, password: string): boolean => {
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const getChildrenForParent = useCallback(
    (parentId: string) => {
      const user = mockUsers.find((u) => u.id === parentId);
      if (!user?.childIds) return [];
      return studentsState.filter((s) => user.childIds!.includes(s.id));
    },
    [studentsState],
  );

  const getStudentsForTeacher = useCallback(
    (teacherId: string) => {
      const cls = classesState.find((c) => c.teacherId === teacherId);
      if (!cls) return [];
      return studentsState.filter((s) => cls.studentIds.includes(s.id));
    },
    [studentsState, classesState],
  );

  const getActivitiesWithSubjects = useCallback(
    (classId: string) => {
      const cc = curriculumState.find((c) => c.classId === classId);
      if (!cc) return [];
      const out: { activity: Activity; subjectName: string }[] = [];
      for (const sub of cc.subjects) {
        for (const act of sub.activities) {
          out.push({ activity: act, subjectName: sub.name });
        }
      }
      return out;
    },
    [curriculumState],
  );

  const updateLessonStage = useCallback(
    (studentId: string, activityId: string, stage: LessonProgress["stage"]) => {
      const student = studentsState.find((s) => s.id === studentId);
      const today = new Date().toISOString().split("T")[0];
      setLessonProgress((prev) => {
        const idx = prev.findIndex((p) => p.studentId === studentId && p.activityId === activityId);
        const row: LessonProgress = {
          id: idx >= 0 ? prev[idx].id : `prog-${studentId}-${activityId}-${Date.now()}`,
          studentId,
          activityId,
          stage,
          updatedAt: today,
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = row;
          return next;
        }
        return [...prev, row];
      });
      if (currentUser?.role === "teacher" && student) {
        setNotifications((prev) => [
          {
            id: `n-${Date.now()}`,
            type: "progress",
            title: "Lesson progress updated",
            message: `${student.name}: an activity was marked ${stage}.`,
            date: today,
            read: false,
            targetRoles: ["parent"],
            scope: "class",
            classId: student.classId,
          },
          ...prev,
        ]);
      }
    },
    [studentsState, currentUser?.role],
  );

  const addSubject = useCallback((classId: string, name: string) => {
    const id = `sub-${classId}-${Date.now()}`;
    const subject: Subject = { id, classId, name, activities: [] };
    setCurriculum((prev) =>
      prev.map((c) => (c.classId === classId ? { ...c, subjects: [...c.subjects, subject] } : c)),
    );
  }, []);

  const addActivity = useCallback((classId: string, subjectId: string, name: string, description?: string) => {
    const actId = `act-${subjectId}-${Date.now()}`;
    const newAct: Activity = { id: actId, subjectId, name, description };
    setCurriculum((prev) =>
      prev.map((c) => {
        if (c.classId !== classId) return c;
        return {
          ...c,
          subjects: c.subjects.map((s) =>
            s.id === subjectId ? { ...s, activities: [...s.activities, newAct] } : s,
          ),
        };
      }),
    );
  }, []);

  const addLessonPlan = useCallback((plan: Omit<LessonPlan, "id">) => {
    const id = `plan-${Date.now()}`;
    setLessonPlans((prev) => [...prev, { ...plan, id }]);
  }, []);

  const removeLessonPlan = useCallback((id: string) => {
    setLessonPlans((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const generateStudentReport = useCallback(
    (studentId: string) => {
      const student = studentsState.find((s) => s.id === studentId);
      if (!student) return;
      const periodLabel = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date());
      const base = buildReportFromData(student, curriculumState, lessonProgressState, attendanceState, periodLabel);
      const id = `rep-${Date.now()}`;
      const generatedAt = new Date().toISOString().split("T")[0];
      setStudentReports((prev) => [{ ...base, id, generatedAt }, ...prev]);
      setNotifications((prev) => [
        {
          id: `n-rep-${Date.now()}`,
          type: "report",
          title: "New report available",
          message: `A progress report for ${student.name} is ready to view.`,
          date: generatedAt,
          read: false,
          targetRoles: ["parent"],
          scope: "global",
        },
        ...prev,
      ]);
    },
    [studentsState, curriculumState, lessonProgressState, attendanceState],
  );

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: !!currentUser,
      login,
      logout,
      allUsers: mockUsers,
      students: studentsState,
      setStudents,
      classes: classesState,
      setClasses,
      gallery: galleryState,
      setGallery,
      attendance: attendanceState,
      setAttendance,
      fees: feesState,
      setFees,
      notifications: notificationsState,
      setNotifications,
      curriculum: curriculumState,
      setCurriculum,
      lessonProgress: lessonProgressState,
      setLessonProgress,
      lessonPlans: lessonPlansState,
      setLessonPlans,
      studentReports: studentReportsState,
      setStudentReports,
      getChildrenForParent,
      getStudentsForTeacher,
      getActivitiesWithSubjects,
      updateLessonStage,
      addSubject,
      addActivity,
      addLessonPlan,
      removeLessonPlan,
      generateStudentReport,
    }),
    [
      currentUser,
      studentsState,
      classesState,
      galleryState,
      attendanceState,
      feesState,
      notificationsState,
      curriculumState,
      lessonProgressState,
      lessonPlansState,
      studentReportsState,
      login,
      logout,
      getChildrenForParent,
      getStudentsForTeacher,
      getActivitiesWithSubjects,
      updateLessonStage,
      addSubject,
      addActivity,
      addLessonPlan,
      removeLessonPlan,
      generateStudentReport,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
