"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

interface AddTaskProps {
  onAdd: (title: string) => Promise<boolean>;
}

export function AddTask({ onAdd }: AddTaskProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [flash, setFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = value.trim();
    if (!title || adding) return;
    setAdding(true);
    const ok = await onAdd(title);
    setAdding(false);
    if (ok) {
      setValue("");
      setFlash(true);
      window.setTimeout(() => setFlash(false), 220);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      if (value) {
        setValue("");
      } else {
        setOpen(false);
      }
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-[15px] text-muted transition-colors duration-150 hover:bg-bg2/70 hover:text-text2 focus-visible:outline-none"
      >
        <Plus className="h-4 w-4 text-accent/60" />
        Add Task
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onClick={() => inputRef.current?.focus()}
      className={cn(
        "group/task-input task-enter flex items-center gap-2 rounded-xl border border-border/70 bg-bg2/60 px-3 py-2 transition-all duration-200",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        "focus-within:border-border focus-within:bg-bg2/80 focus-within:ring-1 focus-within:ring-accent/15",
        flash &&
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_3px_rgba(124,140,255,0.10)]",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-[18px] w-[18px] shrink-0 rounded-[5px] border border-border/80 bg-bg/40 transition-colors duration-200",
          "group-hover/task-input:border-text2/50 group-focus-within/task-input:border-accent/50",
        )}
      />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What do you need to do?"
        maxLength={500}
        className="new-task-input min-w-0 flex-1 bg-transparent py-1 text-[15px] text-text caret-accent placeholder:text-muted/60 focus:outline-none"
        aria-label="New task title"
      />
      <button
        type="submit"
        disabled={!value.trim() || adding}
        className={cn(
          "min-w-14 shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
          value.trim() && !adding
            ? "border-accent/30 bg-accent/10 text-accent hover:border-accent/50 hover:bg-accent/15"
            : "border-border/70 bg-white/[0.03] text-muted hover:bg-white/[0.06] hover:text-text2",
        )}
      >
        {adding ? "Adding…" : "Add"}
      </button>
    </form>
  );
}