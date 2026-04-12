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
import { buildReportFromData } from "@/lib/montessori";
import { API_URLS } from "@/config/api";

/** Parse API Gateway response — handles both direct JSON and wrapped {statusCode, body} formats */
function parseApiResponse(raw: Record<string, unknown>): Record<string, unknown> {
  if (typeof raw.body === 'string') {
    try { return JSON.parse(raw.body); } catch { return raw; }
  }
  return raw;
}

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
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
  uploadGalleryImage: (file: File, title: string, event: string, studentIds: string[]) => Promise<MediaItem | null>;
  addSectionToClass: (classId: string, section: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('playschool_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [allUsersState, setAllUsers] = useState<User[]>([]);
  const [studentsState, setStudents] = useState<Student[]>([]);
  const [classesState, setClasses] = useState<ClassRoom[]>([]);
  const [galleryState, setGallery] = useState<MediaItem[]>([]);
  const [attendanceState, setAttendance] = useState<AttendanceRecord[]>([]);
  const [feesState, setFees] = useState<FeeEntry[]>([]);
  const [notificationsState, setNotifications] = useState<Notification[]>([]);
  const [curriculumState, setCurriculum] = useState<ClassCurriculum[]>([]);
  const [lessonProgressState, setLessonProgress] = useState<LessonProgress[]>([]);
  const [lessonPlansState, setLessonPlans] = useState<LessonPlan[]>([]);
  const [studentReportsState, setStudentReports] = useState<StudentReport[]>([]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(API_URLS.auth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.user) {
        localStorage.setItem('playschool_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login Error:", e);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('playschool_user');
    setCurrentUser(null);
  }, []);

  // Fetch all data from APIs when user is logged in
  React.useEffect(() => {
    if (!currentUser) return;
    const loadContextData = async () => {
      try {
        // Load students based on role
        if (currentUser.role === "teacher") {
          const res = await fetch(`${API_URLS.users}?action=get_students&teacherId=${currentUser.id}`);
          if (res.ok) {
            const data = parseApiResponse(await res.json());
            if (data.students) setStudents(data.students as Student[]);
            if (data.classId) setClasses([{ id: data.classId as string, name: '', teacherId: currentUser.id, sections: [], studentIds: (data.students as Student[])?.map((s: Student) => s.id) || [] }]);
          }
        } else if (currentUser.role === "parent") {
          const res = await fetch(`${API_URLS.users}?action=get_children&parentId=${currentUser.id}`);
          if (res.ok) {
            const data = parseApiResponse(await res.json());
            if (data.children) setStudents(data.children as Student[]);
          }
        } else if (currentUser.role === "admin") {
          // Admin: try to get all students via seed/users endpoint
          const res = await fetch(`${API_URLS.users}?action=get_all_students`);
          if (res.ok) {
            const data = parseApiResponse(await res.json());
            if (data.students) setStudents(data.students as Student[]);
          }
        }

        // Load gallery from API
        try {
          const galleryRes = await fetch(`${API_URLS.gallery}?action=list_media`);
          if (galleryRes.ok) {
            const gData = parseApiResponse(await galleryRes.json());
            if (gData.media) setGallery(gData.media as MediaItem[]);
          }
        } catch (e) { console.error('Failed to load gallery:', e); }

        // Load classes from API
        try {
          const classesRes = await fetch(API_URLS.users, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_classes' })
          });
          if (classesRes.ok) {
            const cData = parseApiResponse(await classesRes.json());
            if (cData.classes) setClasses(cData.classes as ClassRoom[]);
          }
        } catch (e) { console.error('Failed to load classes:', e); }

        // Load Lesson Plans and Progress
        if (API_URLS.lessons) {
          try {
            const lessonsRes = await fetch(`${API_URLS.lessons}?action=get_plans`);
            if (lessonsRes.ok) {
              const lData = parseApiResponse(await lessonsRes.json());
              if (lData.plans) setLessonPlans(lData.plans as LessonPlan[]);
            }
          } catch (e) { console.error('Failed to load lesson plans:', e); }
        }

      } catch (e) {
        console.error("Failed to load user data from API:", e);
      }
    };
    loadContextData();
  }, [currentUser]);

  const getChildrenForParent = useCallback(
    (parentId: string) => {
      if (!currentUser || currentUser.id !== parentId) return [];
      const childIds = currentUser.childIds;
      if (!childIds) return [];
      return studentsState.filter((s) => childIds.includes(s.id));
    },
    [studentsState, currentUser],
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
      
      // Local update first
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

      // Persistent update
      if (API_URLS.lessons) {
        fetch(API_URLS.lessons, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_stage', studentId, activityId, stage })
        }).catch(e => console.error('Failed to sync stage update:', e));
      }

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

  const addSubject = useCallback(async (classId: string, name: string) => {
    let subject: Subject | null = null;
    try {
      const res = await fetch(API_URLS.curriculum, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_subject', classId, name })
      });
      if (res.ok) {
        const data = parseApiResponse(await res.json());
        if (data.subject) subject = data.subject as Subject;
      }
    } catch (e) { console.error("API error", e); }

    // Fallback: create locally if API didn't return one
    if (!subject) {
      const id = `sub-${classId}-${Date.now()}`;
      subject = { id, classId, name, activities: [] };
    }

    setCurriculum((prev) => {
      const exists = prev.some((c) => c.classId === classId);
      if (exists) {
        return prev.map((c) => c.classId === classId ? { ...c, subjects: [...c.subjects, subject!] } : c);
      }
      // Create new curriculum entry for this class
      return [...prev, { classId, subjects: [subject!] }];
    });
  }, []);

  const addActivity = useCallback(async (classId: string, subjectId: string, name: string, description?: string) => {
    let newAct: Activity | null = null;
    try {
      const res = await fetch(API_URLS.curriculum, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_activity', classId, subjectId, name, description })
      });
      if (res.ok) {
        const data = parseApiResponse(await res.json());
        if (data.activity) newAct = data.activity as Activity;
      }
    } catch (e) { console.error("API error", e); }

    if (!newAct) {
      const actId = `act-${subjectId}-${Date.now()}`;
      newAct = { id: actId, subjectId, name, description };
    }

    setCurriculum((prev) =>
      prev.map((c) => {
        if (c.classId !== classId) return c;
        return {
          ...c,
          subjects: c.subjects.map((s) =>
            s.id === subjectId ? { ...s, activities: [...s.activities, newAct!] } : s,
          ),
        };
      }),
    );
  }, []);

  const addLessonPlan = useCallback(async (plan: Omit<LessonPlan, "id">) => {
    const id = `plan-${Date.now()}`;
    // Local Update
    setLessonPlans((prev) => [...prev, { ...plan, id }]);
    
    // Persistent Update
    if (API_URLS.lessons) {
      try {
        const res = await fetch(API_URLS.lessons, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_plan', ...plan })
        });
        if (res.ok) {
           const data = parseApiResponse(await res.json());
           if (data.plan) {
             setLessonPlans((prev) => prev.map(p => p.id === id ? data.plan as LessonPlan : p));
           }
        }
      } catch (e) { console.error('Failed to sync lesson plan addition:', e); }
    }
  }, []);

  const removeLessonPlan = useCallback(async (id: string) => {
    // Local Update
    setLessonPlans((prev) => prev.filter((p) => p.id !== id));
    
    // Persistent Update
    if (API_URLS.lessons) {
      try {
        await fetch(API_URLS.lessons, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'remove_plan', id })
        });
      } catch (e) { console.error('Failed to sync lesson plan removal:', e); }
    }
  }, []);

  const generateStudentReport = useCallback(
    async (studentId: string) => {
      const student = studentsState.find((s) => s.id === studentId);
      if (!student) return;
      const periodLabel = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date());
      const base = buildReportFromData(student, curriculumState, lessonProgressState, attendanceState, periodLabel);
      
      let finalReportId = `rep-${Date.now()}`;
      let generatedAt = new Date().toISOString().split("T")[0];

      try {
        const res = await fetch(API_URLS.reports, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId })
        });
        if (res.ok) {
           const data = await res.json();
           if (data.report) {
              finalReportId = data.report.id;
              generatedAt = data.report.generatedAt;
           }
        }
      } catch (e) {
        console.error("API error reports", e);
      }

      setStudentReports((prev) => [{ ...base, id: finalReportId, generatedAt }, ...prev]);
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

  const uploadGalleryImage = useCallback(
    async (file: File, title: string, event: string, studentIds: string[]): Promise<MediaItem | null> => {
      if (!currentUser) return null;
      try {
        // Step 1: Get presigned URL from Lambda
        const presignRes = await fetch(`${API_URLS.gallery}?action=get_presigned_url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, contentType: file.type }),
        });
        if (!presignRes.ok) throw new Error('Failed to get upload URL');
        const presignRaw = await presignRes.json();
        // API Gateway may return body as a JSON string — parse it if needed
        const presignData = typeof presignRaw.body === 'string' ? JSON.parse(presignRaw.body) : presignRaw;
        const { uploadUrl, s3Url } = presignData;

        if (!uploadUrl) throw new Error('No upload URL received from server');

        // Step 2: PUT file directly to S3 via presigned URL
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
        });
        if (!uploadRes.ok) throw new Error('Failed to upload file to S3');

        // Step 3: Save metadata to DynamoDB via Lambda
        const mediaId = `m${Date.now()}`;
        const today = new Date().toISOString().split('T')[0];
        const mediaItem: MediaItem = {
          id: mediaId,
          url: s3Url,
          type: 'photo',
          title,
          event,
          date: today,
          studentIds,
          uploadedBy: currentUser.id,
        };

        const saveRes = await fetch(`${API_URLS.gallery}?action=save_media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mediaItem),
        });
        const saveRaw = await saveRes.json();
        const saveData = typeof saveRaw.body === 'string' ? JSON.parse(saveRaw.body) : saveRaw;
        if (saveRaw.statusCode && saveRaw.statusCode !== 200) throw new Error('Failed to save media metadata');

        // Update local state
        setGallery((prev) => [mediaItem, ...prev]);

        // Notify parents
        setNotifications((prev) => [
          {
            id: `n-gal-${Date.now()}`,
            type: 'gallery',
            title: 'New photos uploaded',
            message: `New photos from "${event}" have been added to the gallery.`,
            date: today,
            read: false,
            targetRoles: ['parent'],
            scope: 'global',
          },
          ...prev,
        ]);

        return mediaItem;
      } catch (e) {
        console.error('Gallery upload error:', e);
        return null;
      }
    },
    [currentUser],
  );

  const addSectionToClass = useCallback((classId: string, section: string) => {
    if (!section.trim()) return;
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id !== classId) return c;
        if (c.sections.includes(section.trim())) return c; // avoid duplicates
        return { ...c, sections: [...c.sections, section.trim()] };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: !!currentUser,
      login,
      logout,
      allUsers: allUsersState,
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
      uploadGalleryImage,
      addSectionToClass,
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
      uploadGalleryImage,
      addSectionToClass,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
