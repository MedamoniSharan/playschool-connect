import React, { createContext, useContext, useState, useCallback } from "react";
import { User, Role, Student, ClassRoom, MediaItem, AttendanceRecord, FeeEntry, Notification } from "@/types";
import { users as mockUsers, students as mockStudents, gallery, attendance, fees, notifications, classes as mockClasses } from "@/data/mockData";

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
  getChildrenForParent: (parentId: string) => Student[];
  getStudentsForTeacher: (teacherId: string) => Student[];
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

  const getChildrenForParent = useCallback((parentId: string) => {
    const user = mockUsers.find((u) => u.id === parentId);
    if (!user?.childIds) return [];
    return studentsState.filter((s) => user.childIds!.includes(s.id));
  }, [studentsState]);

  const getStudentsForTeacher = useCallback((teacherId: string) => {
    const cls = classesState.find((c) => c.teacherId === teacherId);
    if (!cls) return [];
    return studentsState.filter((s) => cls.studentIds.includes(s.id));
  }, [studentsState, classesState]);

  return (
    <AppContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      login, logout,
      allUsers: mockUsers,
      students: studentsState, setStudents,
      classes: classesState, setClasses,
      gallery: galleryState, setGallery,
      attendance: attendanceState, setAttendance,
      fees: feesState, setFees,
      notifications: notificationsState, setNotifications,
      getChildrenForParent, getStudentsForTeacher,
    }}>
      {children}
    </AppContext.Provider>
  );
};
