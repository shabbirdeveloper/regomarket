"use server";

import { redirect } from "next/navigation";
import { signInAdmin } from "@/lib/admin/auth";

export async function adminSignIn(_prev: { error?: string }, form: FormData): Promise<{ error?: string }> {
  const password = String(form.get("password") ?? "");
  if (!password) return { error: "Enter the admin password." };
  const ok = await signInAdmin(password);
  if (!ok) return { error: "That password is not right." };
  redirect("/admin");
}
