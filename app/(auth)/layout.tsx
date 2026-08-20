import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — onlytoday",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="mb-8 text-center">
        <span className="text-lg font-semibold tracking-tight text-text">
          onlytoday
        </span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}