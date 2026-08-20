"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, signUp, type AuthState } from "@/app/actions/auth";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-xl bg-text px-4 py-2.5 text-sm font-medium text-bg transition-colors duration-150 hover:bg-text2 disabled:opacity-50"
    >
      {pending ? "Just a moment…" : label}
    </button>
  );
}

const FIELD_CLASSES =
  "w-full rounded-xl border border-border bg-bg2 px-3.5 py-2.5 text-[15px] text-text placeholder:text-muted transition-colors duration-150 focus:border-accent focus:outline-none";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  const [state, formAction] = useActionState(
    isLogin ? login : signUp,
    {} as AuthState,
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/30">
      <h1 className="text-xl font-semibold tracking-tight text-text">
        {isLogin ? "Sign in" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-text2">
        Plan and work on today — you can&apos;t plan future days.
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-text2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@school.edu"
            className={FIELD_CLASSES}
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-red-400">{state.fieldErrors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-text2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={8}
            placeholder="At least 8 characters"
            className={FIELD_CLASSES}
          />
          {state.fieldErrors?.password && (
            <p className="text-xs text-red-400">{state.fieldErrors.password}</p>
          )}
        </div>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}

        <SubmitButton label={isLogin ? "Sign in" : "Sign up"} />
      </form>

      <p className="mt-5 text-sm text-muted">
        {isLogin ? (
          <>
            No account?{" "}
            <Link
              href="/signup"
              className="font-medium text-accent transition-colors hover:text-text"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-accent transition-colors hover:text-text"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}