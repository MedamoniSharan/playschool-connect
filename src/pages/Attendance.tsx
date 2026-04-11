import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Avatar, StatusBadge } from "@/components/ui-custom/SharedComponents";
import { classes, students as allStudents } from "@/data/mockData";

export default function Attendance() {
  const { currentUser, attendance, setAttendance, getChildrenForParent, getStudentsForTeacher } = useApp();
  const [selectedDate] = useState("2025-04-10");

  if (currentUser.role === "teacher") {
    const myClass = classes.find((c) => c.teacherId === currentUser.id);
    const myStudents = getStudentsForTeacher(currentUser.id);
    const record = attendance.find((a) => a.classId === myClass?.id && a.date === selectedDate);

    const toggleAttendance = (studentId: string) => {
      setAttendance((prev) =>
        prev.map((a) => {
          if (a.classId !== myClass?.id || a.date !== selectedDate) return a;
          return {
            ...a,
            records: a.records.map((r) =>
              r.studentId === studentId ? { ...r, status: r.status === "present" ? "absent" : "present" } : r
            ),
          };
        })
      );
    };

    return (
      <div>
        <PageHeader title="Attendance" description={`${myClass?.name} · ${selectedDate}`} />
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Student</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Status</th>
                <th className="text-right text-xs font-medium text-muted-foreground py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {myStudents.map((s) => {
                const status = record?.records.find((r) => r.studentId === s.id)?.status || "absent";
                return (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={s.avatar} size="sm" />
                        <span className="text-sm font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={status} /></td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => toggleAttendance(s.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-secondary hover:bg-sidebar-hover transition-colors font-medium">
                        Toggle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (currentUser.role === "parent") {
    const children = getChildrenForParent(currentUser.id);
    return (
      <div>
        <PageHeader title="Attendance" description="Your children's attendance" />
        <div className="space-y-4">
          {children.map((child) => {
            const childRecords = attendance
              .filter((a) => a.classId === child.classId)
              .map((a) => ({ date: a.date, status: a.records.find((r) => r.studentId === child.id)?.status || "absent" }));
            return (
              <div key={child.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar initials={child.avatar} />
                  <div>
                    <p className="font-medium">{child.name}</p>
                    <p className="text-xs text-muted-foreground">{classes.find(c => c.id === child.classId)?.name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {childRecords.map((r, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                      <span className="text-sm">{r.date}</span>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Admin view
  return (
    <div>
      <PageHeader title="Attendance" description="All classes attendance summary" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {classes.map((cls) => {
          const record = attendance.find((a) => a.classId === cls.id && a.date === selectedDate);
          const present = record?.records.filter((r) => r.status === "present").length || 0;
          const total = record?.records.length || 0;
          return (
            <div key={cls.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">{cls.name}</h3>
                <span className="text-sm text-muted-foreground">{selectedDate}</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{present}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{total - present}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div className="bg-success h-3 rounded-full transition-all" style={{ width: total > 0 ? `${(present / total) * 100}%` : "0%" }} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {record?.records.map((r) => {
                  const student = allStudents.find((s) => s.id === r.studentId);
                  return (
                    <div key={r.studentId} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <Avatar initials={student?.avatar || ""} size="sm" />
                        <span className="text-sm">{student?.name}</span>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
