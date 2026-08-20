"use client";

import { useEffect, useRef } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import type { TaskDTO } from "@/lib/tasks";
import { cn } from "@/lib/cn";

interface TaskItemProps {
  task: TaskDTO;
  pending: boolean;
  isEditing: boolean;
  editingValue: string;
  onToggle: () => void;
  onStartEdit: () => void;
  onEditChange: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

export function TaskItem({
  task,
  pending,
  isEditing,
  editingValue,
  onToggle,
  onStartEdit,
  onEditChange,
  onCommitEdit,
  onCancelEdit,
  onDelete,
}: TaskItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  return (
    <li
      className={cn(
        "group task-enter flex items-start gap-3 rounded-xl px-2.5 py-2 transition-colors duration-150 hover:bg-bg2/60",
        pending && "opacity-60",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
        onClick={onToggle}
        disabled={pending}
        className={cn(
          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-150",
          task.completed
            ? "border-accent bg-accent/15 text-accent"
            : "border-border text-transparent hover:border-text2",
        )}
      >
        <Check className={cn("h-3 w-3", task.completed && "check-pop")} strokeWidth={3} />
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          value={editingValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommitEdit();
            if (e.key === "Escape") onCancelEdit();
          }}
          onBlur={onCommitEdit}
          maxLength={500}
          className="flex-1 rounded-md border border-border bg-bg2 px-2 py-1 text-[15px] text-text outline-none focus:border-accent"
          aria-label="Edit task"
        />
      ) : (
        <button
          type="button"
          onClick={onStartEdit}
          disabled={pending}
          className={cn(
            "flex-1 text-left text-[15px] leading-relaxed transition-colors duration-150",
            task.completed
              ? "task-check-anim text-muted line-through decoration-border"
              : "text-text hover:text-text2",
          )}
        >
          {task.title}
        </button>
      )}

      {!isEditing && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            aria-label={`Edit "${task.title}"`}
            onClick={onStartEdit}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-bg2 hover:text-text2"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Delete "${task.title}"`}
            onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-bg2 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </li>
  );
}