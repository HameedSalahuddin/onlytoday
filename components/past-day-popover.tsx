"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { getTasksForDate } from "@/app/actions/tasks";
import type { TaskDTO } from "@/lib/tasks";
import { parseDateKey } from "@/lib/dates";
import { cn } from "@/lib/cn";

interface PastDayPopoverProps {
  isOpen: boolean;
  dateKey: string | null;
  anchorRect: DOMRect | null;
  onClose: () => void;
}

export function PastDayPopover({
  isOpen,
  dateKey,
  anchorRect,
  onClose,
}: PastDayPopoverProps) {
  const [tasks, setTasks] = useState<TaskDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch tasks when dateKey changes
  useEffect(() => {
    if (!isOpen || !dateKey) {
      setTasks(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void getTasksForDate(dateKey).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (result.ok) {
        setTasks(result.data);
      } else {
        setTasks([]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, dateKey]);

  // Calculate position near anchorRect
  useLayoutEffect(() => {
    if (!isOpen || !anchorRect) return;

    const POPOVER_WIDTH = 290;
    const padding = 12;
    const popoverEl = popoverRef.current;
    const popoverHeight = popoverEl ? popoverEl.offsetHeight : 160;

    // Check if there is enough space to the left of the anchor
    if (anchorRect.left >= POPOVER_WIDTH + padding) {
      const left = anchorRect.left - POPOVER_WIDTH - 8;
      const maxTop = window.innerHeight - popoverHeight - padding;
      const top = Math.max(padding, Math.min(anchorRect.top - 6, maxTop));
      setCoords({ top, left });
    } else {
      // Position below or above on narrower screens
      let top = anchorRect.bottom + 8;
      if (
        top + popoverHeight > window.innerHeight - padding &&
        anchorRect.top - popoverHeight > padding
      ) {
        top = anchorRect.top - popoverHeight - 8;
      }
      const maxLeft = window.innerWidth - POPOVER_WIDTH - padding;
      const left = Math.max(padding, Math.min(anchorRect.left, maxLeft));
      setCoords({ top, left });
    }
  }, [isOpen, anchorRect, tasks, loading]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (popoverRef.current?.contains(target)) return;
      if ((target as Element).closest?.("[data-calendar-day]")) return;
      onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on scroll or resize
  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => onClose();
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !dateKey) return null;

  // Format date header: e.g. "Wednesday, August 19"
  let formattedDate = "";
  try {
    const date = parseDateKey(dateKey);
    formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    formattedDate = dateKey;
  }

  const completedCount = tasks?.filter((t) => t.completed).length ?? 0;
  const totalCount = tasks?.length ?? 0;

  return (
    <div
      ref={popoverRef}
      style={{
        top: coords ? `${coords.top}px` : "auto",
        left: coords ? `${coords.left}px` : "auto",
        visibility: coords ? "visible" : "hidden",
      }}
      className="fixed z-50 w-[290px] rounded-xl border border-border bg-bg2/95 p-4 text-text shadow-2xl shadow-black/60 backdrop-blur-md popover-enter"
      role="dialog"
      aria-modal="false"
      aria-label={`Task history for ${formattedDate}`}
    >
      <header>
        <h3 className="text-sm font-semibold tracking-tight text-text">
          {formattedDate}
        </h3>
        {!loading && tasks !== null && totalCount > 0 && (
          <p className="mt-0.5 text-xs text-muted">
            {completedCount} / {totalCount} completed
          </p>
        )}
      </header>

      {loading && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-card" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-card" />
        </div>
      )}

      {!loading && tasks !== null && totalCount === 0 && (
        <p className="mt-4 text-sm text-muted">No tasks recorded.</p>
      )}

      {!loading && tasks !== null && totalCount > 0 && (
        <ul className="mt-3 flex max-h-[220px] flex-col gap-2 overflow-y-auto thin-scroll">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-2.5 text-sm">
              {task.completed ? (
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-accent">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              ) : (
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-full border border-muted/60" />
                </span>
              )}
              <span
                className={cn(
                  "leading-snug break-words flex-1",
                  task.completed
                    ? "text-muted line-through decoration-border"
                    : "text-text",
                )}
              >
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}