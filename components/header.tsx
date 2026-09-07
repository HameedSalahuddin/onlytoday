"use client";

import { CalendarClock, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";

interface HeaderProps {
  email: string;
  onOpenTimetable?: () => void;
}

export function Header({ email, onOpenTimetable }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-bg/90 px-6 py-3.5 backdrop-blur sm:px-10">
      <div className="flex items-baseline gap-3">
        <span className="text-[15px] font-semibold tracking-tight text-text">
          onlytoday
        </span>
        <span className="hidden text-xs text-muted sm:block">
          plan today, not tomorrow
        </span>
      </div>
      <div className="flex items-center gap-4">
        {onOpenTimetable && (
          <button
            type="button"
            onClick={onOpenTimetable}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/60 px-2.5 py-1 text-xs text-muted transition-colors hover:bg-bg2 hover:text-text"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Timetable
          </button>
        )}
        <span className="hidden text-sm text-text2 sm:block">{email}</span>
        <form action={logout}>
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-bg2 hover:text-text2"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}