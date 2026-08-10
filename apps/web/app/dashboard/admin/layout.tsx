import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Define admin emails here or via environment variables
  const adminEmails = (process.env.ADMIN_EMAILS || "priyanshgour817@gmail.com").split(",").map(e => e.trim().toLowerCase());
  const userEmail = user.email?.toLowerCase() || "";

  if (!adminEmails.includes(userEmail)) {
    // Redirect non-admins back to the main dashboard
    redirect("/dashboard");
  }

  return <>{children}</>;
}
