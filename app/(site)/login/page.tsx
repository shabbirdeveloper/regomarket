import type { Metadata } from "next";
import { AuthShell, safeNext } from "@/components/auth/auth-shell";
import { LoginFlow } from "@/components/auth/login-flow";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthShell>
      <LoginFlow next={safeNext(next)} mode="login" />
    </AuthShell>
  );
}
