import { prisma } from "@/lib/prisma";
import { parseDateKey, toDateKey } from "@/lib/dates";

export interface TaskDTO {
  id: string;
  title: string;
  completed: boolean;
  taskDateKey: string;
}

export function toDTO(task: {
  id: string;
  title: string;
  completed: boolean;
  taskDate: Date;
}): TaskDTO {
  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
    taskDateKey: toDateKey(task.taskDate),
  };
}

export async function getTasksForUser(
  userId: string,
  date: Date,
): Promise<TaskDTO[]> {
  const tasks = await prisma.task.findMany({
    where: { userId, taskDate: date },
    orderBy: { createdAt: "asc" },
  });
  return tasks.map(toDTO);
}

export async function getTasksForDateKey(
  userId: string,
  dateKey: string,
): Promise<TaskDTO[]> {
  const tasks = await prisma.task.findMany({
    where: { userId, taskDate: parseDateKey(dateKey) },
    orderBy: { createdAt: "asc" },
  });
  return tasks.map(toDTO);
}