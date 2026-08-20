"use client";

import { useState } from "react";
import type { TaskDTO } from "@/lib/tasks";
import { useToast } from "@/components/toast";
import { TaskItem } from "@/components/task-item";
import { AddTask } from "@/components/add-task";
import { ProgressBar } from "@/components/progress-bar";
import {
  createTask,
  deleteTask,
  editTask,
  toggleTask,
} from "@/app/actions/tasks";
import type { TaskActionResult } from "@/lib/tasks-core";

interface TaskListProps {
  initialTasks: TaskDTO[];
  todayKey: string;
}

export function TaskList({ initialTasks, todayKey }: TaskListProps) {
  const [tasks, setTasks] = useState<TaskDTO[]>(initialTasks);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const { push } = useToast();

  function setPending(id: string, isPending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  /**
   * Applies an optimistic change, calls the server action, then reconciles.
   * On failure the optimistic change is reverted and a friendly error shown.
   * Returns whether the action succeeded.
   */
  async function mutate<T>(
    optimistic: TaskDTO[],
    pendingId: string,
    action: () => Promise<TaskActionResult<T>>,
    onSuccess?: (data: T) => void,
  ): Promise<boolean> {
    const snapshot = tasks;
    setTasks(optimistic);
    setPending(pendingId, true);
    const result = await action();
    setPending(pendingId, false);
    if (!result.ok) {
      setTasks(snapshot);
      push(result.error);
      return false;
    }
    onSuccess?.(result.data);
    return true;
  }

  function handleToggle(task: TaskDTO) {
    const optimistic = tasks.map((t) =>
      t.id === task.id ? { ...t, completed: !t.completed } : t,
    );
    void mutate(
      optimistic,
      task.id,
      () => toggleTask(task.id),
      (updated) => {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      },
    );
  }

  async function restoreTask(task: TaskDTO) {
    const result = await createTask({ title: task.title });
    if (result.ok) {
      setTasks((prev) => [...prev, result.data]);
    } else {
      push(result.error);
    }
  }

  function handleDelete(task: TaskDTO) {
    const optimistic = tasks.filter((t) => t.id !== task.id);
    void mutate(
      optimistic,
      task.id,
      () => deleteTask(task.id),
      () => {
        push("Task deleted", {
          label: "Undo",
          onClick: () => {
            void restoreTask(task);
          },
        });
      },
    );
  }

  function handleAdd(title: string): Promise<boolean> {
    const tempId = `temp-${Date.now()}`;
    const temp: TaskDTO = {
      id: tempId,
      title,
      completed: false,
      taskDateKey: todayKey,
    };
    return mutate(
      [...tasks, temp],
      tempId,
      () => createTask({ title }),
      (created) => {
        setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
      },
    );
  }

  function startEdit(task: TaskDTO) {
    setEditingId(task.id);
    setEditingValue(task.title);
  }

  function handleEdit(task: TaskDTO) {
    const title = editingValue.trim();
    if (!title || title === task.title) {
      setEditingId(null);
      return;
    }
    const optimistic = tasks.map((t) =>
      t.id === task.id ? { ...t, title } : t,
    );
    void mutate(
      optimistic,
      task.id,
      () => editTask(task.id, { title }),
      (updated) => {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      },
    );
    setEditingId(null);
  }

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex flex-col gap-2">
      {tasks.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              pending={pendingIds.has(task.id)}
              isEditing={editingId === task.id}
              editingValue={editingValue}
              onToggle={() => handleToggle(task)}
              onStartEdit={() => startEdit(task)}
              onEditChange={setEditingValue}
              onCommitEdit={() => handleEdit(task)}
              onCancelEdit={() => setEditingId(null)}
              onDelete={() => handleDelete(task)}
            />
          ))}
        </ul>
      )}

      {tasks.length === 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-border px-6 py-10">
          <p className="text-[15px] font-medium text-text2">
            Nothing planned yet.
          </p>
          <p className="text-sm text-muted">What will you accomplish today?</p>
        </div>
      )}

      <AddTask onAdd={handleAdd} />

      <div className="mt-4 border-t border-border pt-4">
        <ProgressBar completed={completedCount} total={tasks.length} />
      </div>
    </div>
  );
}