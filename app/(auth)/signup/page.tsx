import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export default async function SignUpPage() {
  const session = await getSession();
  if (session) redirect("/");
  return <AuthForm mode="signup" />;
}