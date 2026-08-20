import { z } from "zod";

export const taskTitleSchema = z
  .string()
  .trim()
  .min(1, "Task title can't be empty.")
  .max(500, "Task title is too long.");

export type TaskActionErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "NOT_TODAY"
  | "FUTURE_DATE";

export type TaskActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: TaskActionErrorCode };

export const ERROR_MESSAGES: Record<TaskActionErrorCode, string> = {
  UNAUTHORIZED: "You need to sign in to do that.",
  NOT_FOUND: "That task no longer exists.",
  INVALID_INPUT: "Something doesn't look right. Try again.",
  NOT_TODAY: "This task belongs to a previous day and can no longer be changed.",
  FUTURE_DATE: "That day isn't available yet. Come back tomorrow.",
};

/**
 * Today-Only rule for mutations on an existing task. Only tasks whose date is
 * exactly the server's "today" can be modified, and a future date is always
 * rejected regardless of the client.
 */
export function enforceTodayOnly(
  taskDateKey: string,
  todayKey: string,
): TaskActionResult<null> {
  if (taskDateKey !== todayKey) {
    return {
      ok: false,
      code: taskDateKey > todayKey ? "FUTURE_DATE" : "NOT_TODAY",
      error: ERROR_MESSAGES[taskDateKey > todayKey ? "FUTURE_DATE" : "NOT_TODAY"],
    };
  }
  return { ok: true, data: null };
}

/**
 * Today-Only rule for read-only access to a historical (or current) day.
 * Future dates can never be opened, including via crafted requests.
 */
export function enforceViewableDate(
  requestedKey: string,
  todayKey: string,
): TaskActionResult<null> {
  if (requestedKey > todayKey) {
    return {
      ok: false,
      code: "FUTURE_DATE",
      error: ERROR_MESSAGES.FUTURE_DATE,
    };
  }
  return { ok: true, data: null };
}

export function validateTitle(title: unknown): TaskActionResult<{ title: string }> {
  const parsed = taskTitleSchema.safeParse(title);
  if (!parsed.success) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      error: parsed.error.issues[0]?.message ?? ERROR_MESSAGES.INVALID_INPUT,
    };
  }
  return { ok: true, data: { title: parsed.data } };
}