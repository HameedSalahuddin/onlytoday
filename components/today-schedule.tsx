"use client";

import { CalendarClock, Sparkles } from "lucide-react";
import type { TimetableEntryDTO } from "@/lib/college";
import { cn } from "@/lib/cn";

interface TodayScheduleProps {
  schedule: TimetableEntryDTO[];
  hasSemester: boolean;
  onOpenSetup: () => void;
}

export function TodaySchedule({
  schedule,
  hasSemester,
  onOpenSetup,
}: TodayScheduleProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Your Schedule
        </h2>
        <button
          type="button"
          onClick={onOpenSetup}
          className="text-xs text-muted transition-colors hover:text-text2"
        >
          {hasSemester ? "Manage timetable" : "Set up timetable"}
        </button>
      </div>

      {!hasSemester && (
        <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-border px-5 py-4">
          <p className="text-sm text-text2">
            No semester timetable configured yet.
          </p>
          <button
            type="button"
            onClick={onOpenSetup}
            className="inline-flex items-center gap-1.5 rounded-lg bg-text px-3 py-1.5 text-xs font-medium text-bg transition-colors hover:bg-text2"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Set up semester timetable
          </button>
        </div>
      )}

      {hasSemester && schedule.length === 0 && (
        <div className="rounded-xl border border-border/70 bg-bg2/40 px-4 py-3.5">
          <p className="text-sm font-medium text-text2">
            No classes scheduled today.
          </p>
          <p className="mt-0.5 text-xs text-muted">Enjoy the lighter day.</p>
        </div>
      )}

      {hasSemester && schedule.length > 0 && (
        <div className="flex flex-col gap-2">
          {schedule.map((entry) => {
            const isLab = entry.type === "LAB";
            const subjectTitle =
              entry.subject?.name || entry.title || "Untitled Class";

            return (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-xl border border-border/80 bg-bg2/60 px-4 py-2.5 transition-colors hover:border-border"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted">
                      {entry.startTime} — {entry.endTime}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        isLab
                          ? "border border-accent/30 bg-accent/15 text-accent"
                          : "border border-border/80 bg-card text-muted",
                      )}
                    >
                      {entry.type}
                    </span>
                  </div>
                  <span className="text-[14px] font-medium text-text">
                    {subjectTitle}
                  </span>
                  {(entry.room || entry.instructor) && (
                    <span className="text-xs text-muted/80">
                      {[entry.room, entry.instructor]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
