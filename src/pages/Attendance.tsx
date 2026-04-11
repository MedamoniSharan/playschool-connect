import { useState } from "react";
import { format } from "date-fns";
import { useApp } from "@/context/AppContext";
import { PageHeader, PersonAvatar, StatusBadge } from "@/components/ui-custom/SharedComponents";
import { Calendar } from "@/components/ui/calendar";
import { students as allStudents } from "@/data/mockData";

export default function Attendance() {
  const { currentUser, attendance, setAttendance, getChildrenForParent, getStudentsForTeacher, classes } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date("2026-04-11"));
  
  if (!currentUser) return null;

  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  if (currentUser.role === "teacher") {
    const myClass = classes.find((c) => c.teacherId === currentUser.id);
    const myStudents = getStudentsForTeacher(currentUser.id);
    const record = attendance.find((a) => a.classId === myClass?.id && a.date === dateStr);

    const toggleAttendance = (studentId: string) => {
      if (!selectedDate || !myClass) return;
      
      const exists = attendance.some(a => a.classId === myClass.id && a.date === dateStr);
      if (!exists) {
        setAttendance(prev => [
          ...prev, 
          {
            id: `att-${Date.now()}`,
            date: dateStr,
            classId: myClass.id,
            records: myStudents.map(s => ({ studentId: s.id, status: s.id === studentId ? "absent" : "present" }))
          }
        ]);
        return;
      }

      setAttendance((prev) =>
        prev.map((a) => {
          if (a.classId !== myClass?.id || a.date !== dateStr) return a;
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
        <PageHeader title="Attendance" description={`${myClass?.name ?? "Class"} · ${dateStr}`} />
        <div className="grid gap-6 lg:grid-cols-[auto,1fr] items-start">
          <div className="w-fit">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => { if (d) setSelectedDate(d); }}
              className="rounded-[24px] border border-dash-subtle bg-dash-surface shadow-sm"
            />
          </div>
          <div className="bg-dash-surface rounded-[24px] border border-dash-subtle overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-dash-subtle bg-dash-canvas/50">
                  <th className="text-left text-xs font-medium text-dash-muted py-3 px-4">Student</th>
                  <th className="text-left text-xs font-medium text-dash-muted py-3 px-4">Status</th>
                  <th className="text-right text-xs font-medium text-dash-muted py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {myStudents.map((s) => {
                  const status = record?.records.find((r) => r.studentId === s.id)?.status || "present";
                  return (
                    <tr key={s.id} className="border-b border-dash-subtle last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <PersonAvatar kind="student" id={s.id} gender={s.gender} size="sm" />
                          <span className="text-sm font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={!record ? "present" : status} /></td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => toggleAttendance(s.id)}
                          className="text-xs px-3 py-1.5 rounded-[16px] bg-dash-canvas hover:bg-sidebar-hover transition-colors font-medium">
                          Toggle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!record && myStudents.length > 0 && (
               <div className="p-4 bg-muted/30 border-t border-dash-subtle text-xs text-dash-muted text-center">
                 No record exists for {dateStr}. Clicking toggle will initialize the roster as Present.
               </div>
            )}
          </div>
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
              <div key={child.id} className="bg-dash-surface rounded-[24px] border border-dash-subtle p-5">
                <div className="flex items-center gap-3 mb-4">
                  <PersonAvatar kind="student" id={child.id} gender={child.gender} />
                  <div>
                    <p className="font-medium">{child.name}</p>
                    <p className="text-xs text-dash-muted">{classes.find(c => c.id === child.classId)?.name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {childRecords.map((r, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-dash-subtle last:border-0">
                      <span className="text-sm">{r.date}</span>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                  {childRecords.length === 0 && (
                    <p className="text-sm text-dash-muted py-2">No attendance records found.</p>
                  )}
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
      <PageHeader title="Attendance" description={`All classes attendance summary for ${dateStr}`} />
      <div className="grid gap-6 xl:grid-cols-[auto,1fr] items-start">
        <div className="w-fit">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => { if (d) setSelectedDate(d); }}
            className="rounded-[24px] border border-dash-subtle bg-dash-surface shadow-sm"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {classes.map((cls) => {
            const record = attendance.find((a) => a.classId === cls.id && a.date === dateStr);
            const present = record?.records.filter((r) => r.status === "present").length || 0;
            const total = record?.records.length || 0;
            return (
              <div key={cls.id} className="bg-dash-surface rounded-[24px] border border-dash-subtle p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">{cls.name}</h3>
                </div>
                {record ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-xl font-bold text-success">{present}</p>
                        <p className="text-[10px] uppercase tracking-wide text-dash-muted">Present</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-destructive">{total - present}</p>
                        <p className="text-[10px] uppercase tracking-wide text-dash-muted">Absent</p>
                      </div>
                      <div className="flex-1 ml-2">
                        <div className="w-full bg-dash-canvas rounded-full h-2">
                          <div className="bg-success h-2 rounded-full transition-all" style={{ width: total > 0 ? `${(present / total) * 100}%` : "0%" }} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {record.records.map((r) => {
                        const student = allStudents.find((s) => s.id === r.studentId);
                        return (
                          <div key={r.studentId} className="flex items-center justify-between py-1.5 border-b border-dash-subtle last:border-0">
                            <div className="flex items-center gap-2">
                              {student ? (
                                <PersonAvatar kind="student" id={student.id} gender={student.gender} size="sm" />
                              ) : (
                                <PersonAvatar kind="student" id={r.studentId} gender="male" size="sm" />
                              )}
                              <span className="text-sm">{student?.name}</span>
                            </div>
                            <StatusBadge status={r.status} />
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-dash-muted py-4">No attendance record for this date.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
