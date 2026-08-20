"use server";

import { cookies } from "next/headers";
import { z, type ZodError } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  decodeTimezoneCookie,
  destroySession,
  hashPassword,
  readTimezone,
  verifyPassword,
  TZ_COOKIE,
} from "@/lib/auth";
import { isValidTimezone } from "@/lib/dates";

export interface AuthState {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
}

const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
});

function toAuthState(error: ZodError<z.infer<typeof credentialsSchema>>): AuthState {
  const flat = error.flatten();
  return {
    fieldErrors: {
      email: flat.fieldErrors.email?.[0],
      password: flat.fieldErrors.password?.[0],
    },
  };
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return toAuthState(parsed.error);
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return toAuthState(parsed.error);
  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: "An account with this email already exists." } };
  }

  const user = await prisma.user.create({
    data: { email, passwordHash: hashPassword(password) },
  });
  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function setTimezone(tz: string): Promise<{ ok: boolean }> {
  if (!isValidTimezone(tz)) return { ok: false };
  const store = await cookies();
  const current = store.get(TZ_COOKIE)?.value;
  if (current && decodeTimezoneCookie(current) === tz) return { ok: true };
  store.set(TZ_COOKIE, tz, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return { ok: true };
}

export async function getServerTimezone(): Promise<string> {
  const store = await cookies();
  return readTimezone(store);
}