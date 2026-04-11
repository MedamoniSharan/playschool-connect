import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader, PersonAvatar } from "@/components/ui-custom/SharedComponents";
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Reports() {
  const {
    currentUser,
    students,
    classes,
    studentReports,
    generateStudentReport,
    getStudentsForTeacher,
    getChildrenForParent,
  } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState("");

  const roster = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "parent") return getChildrenForParent(currentUser.id);
    if (currentUser.role === "teacher") return getStudentsForTeacher(currentUser.id);
    return students;
  }, [currentUser, getChildrenForParent, getStudentsForTeacher, students]);

  if (!currentUser) return null;

  const effectiveId = selectedStudentId || roster[0]?.id || "";
  const visibleReports = studentReports.filter((r) => {
    if (currentUser.role === "parent") {
      const ids = roster.map((c) => c.id);
      return ids.includes(r.studentId);
    }
    if (currentUser.role === "teacher") {
      const ids = roster.map((s) => s.id);
      return ids.includes(r.studentId);
    }
    return true;
  });

  const canGenerate = currentUser.role === "admin" || currentUser.role === "teacher";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Print-friendly progress summaries — generated from live lesson and attendance data."
        action={
          <Button variant="outline" onClick={handlePrint} className="gap-2 print:hidden">
            <Printer className="h-4 w-4" />
            Print view
          </Button>
        }
      />

      {canGenerate && roster.length > 0 && (
        <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4 print:hidden">
          <div className="min-w-[200px] flex-1">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Student</p>
            <Select value={effectiveId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose student" />
              </SelectTrigger>
              <SelectContent>
                {roster.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={() => effectiveId && generateStudentReport(effectiveId)}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Generate report
          </Button>
        </div>
      )}

      <div id="report-print-root" className="space-y-8">
        {visibleReports.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No reports yet.</p>
        ) : (
          visibleReports.map((rep) => {
            const s = students.find((x) => x.id === rep.studentId);
            const cls = s ? classes.find((c) => c.id === s.classId) : undefined;
            return (
              <article
                key={rep.id}
                className="overflow-hidden rounded-xl border border-border bg-card print:shadow-none print:border-foreground/20"
              >
                <div className="border-b border-border bg-muted/40 px-6 py-4 print:bg-transparent">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      {s && <PersonAvatar kind="student" id={s.id} gender={s.gender} />}
                      <div>
                        <h2 className="text-lg font-bold">{s?.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {cls?.name} · {rep.periodLabel}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Generated {rep.generatedAt}</p>
                  </div>
                </div>
                <div className="grid gap-6 p-6 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Lessons presented</p>
                    <p className="text-3xl font-bold">{rep.lessonsPresented}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">In practice</p>
                    <p className="text-3xl font-bold">{rep.lessonsPracticed}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Mastered</p>
                    <p className="text-3xl font-bold">{rep.lessonsMastered}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Attendance</p>
                    <p className="text-3xl font-bold">{rep.attendanceRate}%</p>
                  </div>
                </div>
                {rep.narrative && (
                  <div className="border-t border-border px-6 py-4">
                    <p className="text-sm leading-relaxed text-foreground">{rep.narrative}</p>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
