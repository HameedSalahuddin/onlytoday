"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, readTimezone, type SessionUser } from "@/lib/auth";
import {
  getServerToday,
  isValidDateKey,
  parseDateKey,
  toDateKey,
} from "@/lib/dates";
import {
  enforceTodayOnly,
  enforceViewableDate,
  validateTitle,
  ERROR_MESSAGES,
  type TaskActionResult,
} from "@/lib/tasks-core";
import { toDTO, type TaskDTO } from "@/lib/tasks";
import type { Task } from "@/generated/prisma/client";

interface Ctx {
  session: SessionUser;
  today: Date;
  todayKey: string;
}

async function getCtx(): Promise<TaskActionResult<Ctx>> {
  const session = await getSession();
  if (!session) {
    return { ok: false, code: "UNAUTHORIZED", error: ERROR_MESSAGES.UNAUTHORIZED };
  }
  const store = await cookies();
  const tz = readTimezone(store);
  const today = getServerToday(new Date(), tz);
  return { ok: true, data: { session, today, todayKey: toDateKey(today) } };
}

async function findOwnedTask(
  id: string,
  userId: string,
): Promise<TaskActionResult<{ task: Task }>> {
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) {
    return { ok: false, code: "NOT_FOUND", error: ERROR_MESSAGES.NOT_FOUND };
  }
  return { ok: true, data: { task } };
}

export async function createTask(input: {
  title: string;
}): Promise<TaskActionResult<TaskDTO>> {
  const ctxResult = await getCtx();
  if (!ctxResult.ok) return ctxResult;

  const titleResult = validateTitle(input?.title);
  if (!titleResult.ok) return titleResult;

  // The task date is always assigned by the server as "today".
  // A client-supplied date is never accepted.
  const task = await prisma.task.create({
    data: {
      userId: ctxResult.data.session.userId,
      title: titleResult.data.title,
      taskDate: ctxResult.data.today,
    },
  });
  revalidatePath("/");
  return { ok: true, data: toDTO(task) };
}

export async function toggleTask(
  id: string,
): Promise<TaskActionResult<TaskDTO>> {
  const ctxResult = await getCtx();
  if (!ctxResult.ok) return ctxResult;
  const { session, todayKey } = ctxResult.data;

  const found = await findOwnedTask(id, session.userId);
  if (!found.ok) return found;
  const { task } = found.data;

  const rule = enforceTodayOnly(toDateKey(task.taskDate), todayKey);
  if (!rule.ok) return rule;

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: { completed: !task.completed },
  });
  revalidatePath("/");
  return { ok: true, data: toDTO(updated) };
}

export async function editTask(
  id: string,
  input: { title: string },
): Promise<TaskActionResult<TaskDTO>> {
  const ctxResult = await getCtx();
  if (!ctxResult.ok) return ctxResult;
  const { session, todayKey } = ctxResult.data;

  const titleResult = validateTitle(input?.title);
  if (!titleResult.ok) return titleResult;

  const found = await findOwnedTask(id, session.userId);
  if (!found.ok) return found;
  const { task } = found.data;

  const rule = enforceTodayOnly(toDateKey(task.taskDate), todayKey);
  if (!rule.ok) return rule;

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: { title: titleResult.data.title },
  });
  revalidatePath("/");
  return { ok: true, data: toDTO(updated) };
}

export async function deleteTask(
  id: string,
): Promise<TaskActionResult<{ id: string }>> {
  const ctxResult = await getCtx();
  if (!ctxResult.ok) return ctxResult;
  const { session, todayKey } = ctxResult.data;

  const found = await findOwnedTask(id, session.userId);
  if (!found.ok) return found;
  const { task } = found.data;

  const rule = enforceTodayOnly(toDateKey(task.taskDate), todayKey);
  if (!rule.ok) return rule;

  await prisma.task.delete({ where: { id: task.id } });
  revalidatePath("/");
  return { ok: true, data: { id: task.id } };
}

export async function getTasksForDate(
  dateKey: string,
): Promise<TaskActionResult<TaskDTO[]>> {
  const ctxResult = await getCtx();
  if (!ctxResult.ok) return ctxResult;
  if (!isValidDateKey(dateKey)) {
    return { ok: false, code: "INVALID_INPUT", error: ERROR_MESSAGES.INVALID_INPUT };
  }

  const { session, todayKey } = ctxResult.data;
  const rule = enforceViewableDate(dateKey, todayKey);
  if (!rule.ok) return rule;

  const tasks = await prisma.task.findMany({
    where: { userId: session.userId, taskDate: parseDateKey(dateKey) },
    orderBy: { createdAt: "asc" },
  });
  return { ok: true, data: tasks.map(toDTO) };
}