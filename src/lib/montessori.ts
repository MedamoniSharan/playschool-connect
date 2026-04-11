import type {
  ClassCurriculum,
  LessonProgress,
  AttendanceRecord,
  Student,
  ProgressStage,
  StudentReport,
} from "@/types";

export function countActivitiesForClass(curriculum: ClassCurriculum[], classId: string): number {
  const cc = curriculum.find((c) => c.classId === classId);
  if (!cc) return 0;
  return cc.subjects.reduce((acc, s) => acc + s.activities.length, 0);
}

export function getProgressStage(
  progress: LessonProgress[],
  studentId: string,
  activityId: string,
): ProgressStage {
  const row = progress.find((p) => p.studentId === studentId && p.activityId === activityId);
  if (!row) return "not_started";
  if (row.stage === "presented") return "presented";
  if (row.stage === "practiced") return "practiced";
  return "mastered";
}

export function attendanceRateForStudent(attendance: AttendanceRecord[], studentId: string, classId: string): number {
  const rows = attendance.filter((a) => a.classId === classId);
  if (rows.length === 0) return 100;
  let present = 0;
  for (const a of rows) {
    const r = a.records.find((x) => x.studentId === studentId);
    if (r?.status === "present") present++;
  }
  return Math.round((present / rows.length) * 100);
}

export function buildReportFromData(
  student: Student,
  curriculum: ClassCurriculum[],
  lessonProgress: LessonProgress[],
  attendance: AttendanceRecord[],
  periodLabel: string,
): Omit<StudentReport, "id" | "generatedAt"> {
  const cc = curriculum.find((c) => c.classId === student.classId);
  const activityIds = cc?.subjects.flatMap((s) => s.activities.map((a) => a.id)) ?? [];
  const mine = lessonProgress.filter((p) => p.studentId === student.id && activityIds.includes(p.activityId));
  let lessonsPresented = 0;
  let lessonsPracticed = 0;
  let lessonsMastered = 0;
  for (const p of mine) {
    if (p.stage === "presented") lessonsPresented++;
    else if (p.stage === "practiced") lessonsPracticed++;
    else lessonsMastered++;
  }
  return {
    studentId: student.id,
    periodLabel,
    lessonsPresented,
    lessonsPracticed,
    lessonsMastered,
    attendanceRate: attendanceRateForStudent(attendance, student.id, student.classId),
    narrative: `${student.name.split(" ")[0]}'s Montessori work for ${periodLabel}: ${lessonsMastered} mastered, ${lessonsPracticed} in practice, ${lessonsPresented} newly presented.`,
  };
}
