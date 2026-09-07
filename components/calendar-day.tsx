"use client";

import { cn } from "@/lib/cn";

interface CalendarDayProps {
  day: number;
  dateKey: string;
  isToday: boolean;
  hasClasses?: boolean;
  onClick: (dateKey: string, element?: HTMLElement) => void;
}

export function CalendarDay({
  day,
  dateKey,
  isToday,
  hasClasses,
  onClick,
}: CalendarDayProps) {
  return (
    <button
      type="button"
      data-calendar-day
      onClick={(e) => onClick(dateKey, e.currentTarget)}
      aria-label={
        isToday
          ? `${dateKey} (today)`
          : `View tasks for ${dateKey}`
      }
      className="flex items-center justify-center rounded-lg p-0.5 transition-colors duration-150 hover:bg-bg2"
    >
      <span
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors duration-150",
          isToday
            ? "bg-accent font-semibold text-bg"
            : "text-text2 hover:text-text",
        )}
      >
        {day}
        {hasClasses && !isToday && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent/60" />
        )}
      </span>
    </button>
  );
}