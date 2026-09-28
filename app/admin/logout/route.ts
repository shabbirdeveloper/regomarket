import { signOutAdmin } from "@/lib/admin/auth";

export async function POST() {
  await signOutAdmin();
  // Relative Location: correct behind CloudFront without knowing the host
  return new Response(null, { status: 303, headers: { Location: "/admin/login" } });
}
