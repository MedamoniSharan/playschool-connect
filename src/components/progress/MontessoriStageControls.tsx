import { cn } from "@/lib/utils";
import type { LessonProgress, ProgressStage } from "@/types";
import { getProgressStage } from "@/lib/montessori";

const STAGES: LessonProgress["stage"][] = ["presented", "practiced", "mastered"];

function stageToPct(stage: ProgressStage): number {
  if (stage === "not_started") return 0;
  if (stage === "presented") return 33;
  if (stage === "practiced") return 66;
  return 100;
}

function barFillClass(stage: ProgressStage): string {
  if (stage === "not_started") return "bg-neutral-300";
  if (stage === "presented") return "bg-amber-500";
  if (stage === "practiced") return "bg-sky-500";
  return "bg-emerald-500";
}

function stageButtonClasses(stage: LessonProgress["stage"], active: boolean): string {
  if (!active) {
    return cn(
      "border border-neutral-300 bg-neutral-50 text-neutral-800 shadow-sm",
      "hover:border-neutral-400 hover:bg-white hover:text-neutral-900",
    );
  }
  if (stage === "presented") return "border border-amber-600 bg-amber-500 text-white shadow-sm";
  if (stage === "practiced") return "border border-sky-700 bg-sky-600 text-white shadow-sm";
  return "border border-emerald-700 bg-emerald-600 text-white shadow-sm";
}

export function MontessoriStageControls({
  studentId,
  activityId,
  progress,
  readOnly,
  onSetStage,
}: {
  studentId: string;
  activityId: string;
  progress: LessonProgress[];
  readOnly?: boolean;
  onSetStage?: (stage: LessonProgress["stage"]) => void;
}) {
  const current = getProgressStage(progress, studentId, activityId);

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-600">Stage</p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 ring-1 ring-neutral-300/80">
          <div
            className={cn("h-full rounded-full transition-all duration-300 ease-out", barFillClass(current))}
            style={{ width: `${stageToPct(current)}%` }}
          />
        </div>
      </div>
      {readOnly ? (
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize",
            current === "not_started" && "bg-dash-canvas text-dash-muted",
            current === "presented" && "bg-amber-100 text-amber-900",
            current === "practiced" && "bg-sky-100 text-sky-900",
            current === "mastered" && "bg-emerald-100 text-emerald-900",
          )}
        >
          {current.replace(/_/g, " ")}
        </span>
      ) : (
        <div className="flex flex-wrap gap-2">
          {STAGES.map((st) => {
            const active = current === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => onSetStage?.(st)}
                className={cn(
                  "min-h-[36px] rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all",
                  stageButtonClasses(st, active),
                )}
              >
                {st}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
