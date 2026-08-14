"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function formatAuthError(message: string): string {
  const msg = (message || "").toLowerCase();
  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return "The email address or password you entered is incorrect. Please check your details and try again.";
  }
  if (msg.includes("user already registered") || msg.includes("already exists") || msg.includes("user_already_exists")) {
    return "An account with this email address already exists. Please sign in instead.";
  }
  if (msg.includes("email not confirmed")) {
    return "Please verify your email address before signing in to your account.";
  }
  if (msg.includes("password should be at least")) {
    return "Password must be at least 6 characters long.";
  }
  return message || "Authentication failed. Please check your credentials and try again.";
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || (formData.get("returnTo") as string) || "/dashboard";

  if (!email || !password) {
    return redirect(`/login?error=${encodeURIComponent("Please fill in both email and password fields.")}&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server actions edge case
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(formatAuthError(error.message))}&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return redirect(redirectTo);
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = (formData.get("firstName") as string) || "";
  const lastName = (formData.get("lastName") as string) || "";
  const name = `${firstName} ${lastName}`.trim() || (formData.get("name") as string) || "";
  const redirectTo = (formData.get("redirectTo") as string) || (formData.get("returnTo") as string) || "/dashboard";

  if (!email || !password) {
    return redirect(`/signup?error=${encodeURIComponent("Please provide a valid email and password to register.")}&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  if (password.length < 6) {
    return redirect(`/signup?error=${encodeURIComponent("Password must be at least 6 characters long.")}&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server actions edge case
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        firstName,
        lastName,
      },
    },
  });

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(formatAuthError(error.message))}&redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return redirect(redirectTo);
}

export async function signOut() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server actions edge case
          }
        },
      },
    }
  );
  await supabase.auth.signOut();
  return redirect("/login");
}
