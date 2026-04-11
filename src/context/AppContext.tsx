import React, { createContext, useContext, useState, useCallback } from "react";
import { User, Role, Student, MediaItem, AttendanceRecord, FeeEntry, Notification } from "@/types";
import { users, students, gallery, attendance, fees, notifications, classes } from "@/data/mockData";

interface AppState {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: Role) => void;
  allUsers: User[];
  students: Student[];
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
  const [currentUser, setCurrentUser] = useState<User>(users[0]);
  const [galleryState, setGallery] = useState<MediaItem[]>(gallery);
  const [attendanceState, setAttendance] = useState<AttendanceRecord[]>(attendance);
  const [feesState, setFees] = useState<FeeEntry[]>(fees);
  const [notificationsState, setNotifications] = useState<Notification[]>(notifications);

  const switchRole = useCallback((role: Role) => {
    const user = users.find((u) => u.role === role);
    if (user) setCurrentUser(user);
  }, []);

  const getChildrenForParent = useCallback((parentId: string) => {
    const user = users.find((u) => u.id === parentId);
    if (!user?.childIds) return [];
    return students.filter((s) => user.childIds!.includes(s.id));
  }, []);

  const getStudentsForTeacher = useCallback((teacherId: string) => {
    const cls = classes.find((c) => c.teacherId === teacherId);
    if (!cls) return [];
    return students.filter((s) => cls.studentIds.includes(s.id));
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser, switchRole, allUsers: users,
      students, gallery: galleryState, setGallery,
      attendance: attendanceState, setAttendance,
      fees: feesState, setFees,
      notifications: notificationsState, setNotifications,
      getChildrenForParent, getStudentsForTeacher,
    }}>
      {children}
    </AppContext.Provider>
  );
};
