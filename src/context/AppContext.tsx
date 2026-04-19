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

/** Parse API Gateway / Lambda proxy payloads — direct JSON, string body, or object body */
function parseApiResponse(raw: unknown): Record<string, unknown> {
  if (raw === null || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  if (typeof obj.body === "string") {
    try {
      const inner = JSON.parse(obj.body) as unknown;
      return typeof inner === "object" && inner !== null ? (inner as Record<string, unknown>) : {};
    } catch {
      return obj;
    }
  }
  if (obj.body !== undefined && typeof obj.body === "object" && obj.body !== null && !Array.isArray(obj.body)) {
    return obj.body as Record<string, unknown>;
  }
  return obj;
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
  addSubject: (classId: string, name: string) => Promise<boolean>;
  addActivity: (classId: string, subjectId: string, name: string, description?: string) => Promise<boolean>;
  removeSubject: (classId: string, subjectId: string) => Promise<boolean>;
  removeActivity: (classId: string, subjectId: string, activityId: string) => Promise<boolean>;
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
        const curriculumClassIds = new Set<string>();
        const noteCurriculumClass = (classId: string | undefined) => {
          if (classId) curriculumClassIds.add(classId);
        };

        // Load students based on role
        if (currentUser.role === "teacher") {
          const res = await fetch(`${API_URLS.users}?action=get_students&teacherId=${currentUser.id}`);
          if (res.ok) {
            const data = parseApiResponse(await res.json());
            if (data.students) {
              const list = data.students as Student[];
              setStudents(list);
              list.forEach((s) => noteCurriculumClass(s.classId));
            }
            if (data.classId) {
              noteCurriculumClass(data.classId as string);
              setClasses([
                {
                  id: data.classId as string,
                  name: "",
                  teacherId: currentUser.id,
                  sections: [],
                  studentIds: (data.students as Student[])?.map((s: Student) => s.id) || [],
                },
              ]);
            }
          }
        } else if (currentUser.role === "parent") {
          const res = await fetch(`${API_URLS.users}?action=get_children&parentId=${currentUser.id}`);
          if (res.ok) {
            const data = parseApiResponse(await res.json());
            if (data.children) {
              const list = data.children as Student[];
              setStudents(list);
              list.forEach((s) => noteCurriculumClass(s.classId));
            }
          }
        } else if (currentUser.role === "admin") {
          // Admin: try to get all students via seed/users endpoint
          const res = await fetch(`${API_URLS.users}?action=get_all_students`);
          if (res.ok) {
            const data = parseApiResponse(await res.json());
            if (data.students) {
              const list = data.students as Student[];
              setStudents(list);
              list.forEach((s) => noteCurriculumClass(s.classId));
            }
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
            if (cData.classes) {
              const list = cData.classes as ClassRoom[];
              setClasses(list);
              list.forEach((c) => noteCurriculumClass(c.id));
            }
          }
        } catch (e) { console.error('Failed to load classes:', e); }

        if (currentUser.classId) noteCurriculumClass(currentUser.classId);

        // Load curriculum per class from API (DynamoDB)
        if (API_URLS.curriculum && curriculumClassIds.size > 0) {
          try {
            const merged: ClassCurriculum[] = [];
            for (const classId of curriculumClassIds) {
              // Use POST: API Gateway often has POST wired; GET on this URL can return 404.
              const cr = await fetch(API_URLS.curriculum, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "get_curriculum", classId }),
              });
              if (!cr.ok) continue;
              const curData = parseApiResponse(await cr.json()) as { curriculum?: ClassCurriculum };
              if (curData.curriculum) merged.push(curData.curriculum);
            }
            if (merged.length > 0) {
              setCurriculum((prev) => {
                const byId = new Map(prev.map((c) => [c.classId, c]));
                for (const c of merged) byId.set(c.classId, c);
                return Array.from(byId.values());
              });
            }
          } catch (e) {
            console.error("Failed to load curriculum:", e);
          }
        }

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
      // Fallback for legacy/misaligned class records with empty teacherId:
      // teacher endpoint already returns teacher-scoped students in studentsState.
      if (!cls) return studentsState;
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

  const addSubject = useCallback(async (classId: string, name: string): Promise<boolean> => {
    if (!classId.trim()) return false;
    let subject: Subject | null = null;
    let apiOk = false;
    try {
      const res = await fetch(API_URLS.curriculum, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_subject', classId, name })
      });
      const raw = await res.json();
      const data = parseApiResponse(raw);
      if (res.ok && data.subject) {
        subject = data.subject as Subject;
        apiOk = true;
      }
    } catch (e) { console.error("API error", e); }

    // Fallback: create locally only if API failed (avoid duplicate ids vs server)
    if (!subject) {
      const id = `sub-${classId}-${Date.now()}`;
      subject = { id, classId, name, activities: [] };
    }

    setCurriculum((prev) => {
      const exists = prev.some((c) => c.classId === classId);
      if (exists) {
        return prev.map((c) => c.classId === classId ? { ...c, subjects: [...c.subjects, subject!] } : c);
      }
      return [...prev, { classId, subjects: [subject!] }];
    });
    return apiOk;
  }, []);

  const addActivity = useCallback(async (classId: string, subjectId: string, name: string, description?: string): Promise<boolean> => {
    if (!classId.trim() || !subjectId.trim()) return false;
    let newAct: Activity | null = null;
    let apiOk = false;
    try {
      const res = await fetch(API_URLS.curriculum, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_activity', classId, subjectId, name, description })
      });
      const raw = await res.json();
      const data = parseApiResponse(raw);
      if (res.ok && data.activity) {
        newAct = data.activity as Activity;
        apiOk = true;
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
    return apiOk;
  }, []);

  const removeSubject = useCallback(async (classId: string, subjectId: string): Promise<boolean> => {
    if (!classId.trim() || !subjectId.trim()) return false;
    let apiOk = false;
    try {
      const res = await fetch(API_URLS.curriculum, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove_subject", classId, subjectId }),
      });
      const data = parseApiResponse(await res.json());
      if (res.ok && data.ok === true) apiOk = true;
    } catch (e) {
      console.error("API error remove_subject", e);
    }
    if (apiOk) {
      setCurriculum((prev) =>
        prev.map((c) =>
          c.classId !== classId ? c : { ...c, subjects: c.subjects.filter((s) => s.id !== subjectId) },
        ),
      );
    }
    return apiOk;
  }, []);

  const removeActivity = useCallback(async (classId: string, subjectId: string, activityId: string): Promise<boolean> => {
    if (!classId.trim() || !subjectId.trim() || !activityId.trim()) return false;
    let apiOk = false;
    try {
      const res = await fetch(API_URLS.curriculum, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove_activity", classId, subjectId, activityId }),
      });
      const data = parseApiResponse(await res.json());
      if (res.ok && data.ok === true) apiOk = true;
    } catch (e) {
      console.error("API error remove_activity", e);
    }
    if (apiOk) {
      setCurriculum((prev) =>
        prev.map((c) => {
          if (c.classId !== classId) return c;
          return {
            ...c,
            subjects: c.subjects.map((s) =>
              s.id !== subjectId
                ? s
                : { ...s, activities: s.activities.filter((a) => a.id !== activityId) },
            ),
          };
        }),
      );
    }
    return apiOk;
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
          const data = parseApiResponse(await res.json());
          if (data.report) {
            const rep = data.report as { id?: string; generatedAt?: string };
            if (rep.id) finalReportId = rep.id;
            if (rep.generatedAt) generatedAt = rep.generatedAt as string;
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
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
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
      removeSubject,
      removeActivity,
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
      removeSubject,
      removeActivity,
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
