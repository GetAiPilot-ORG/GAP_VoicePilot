import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash") || requestUrl.searchParams.get("token");
  const type = (requestUrl.searchParams.get("type") || "magiclink") as any;
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
          // Server Component edge case
        }
      },
    },
  });

  // 1. Handle PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }
    console.error("[Auth Callback] Error exchanging code for session:", error.message);
  }

  // 2. Handle token_hash verifyOtp exchange
  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type,
    });
    if (!error) {
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }
    console.error("[Auth Callback] Error verifying OTP token_hash:", error.message);
  }

  // 3. Fallback for Implicit Hash Flow (#access_token=...)
  // Render client HTML page that initializes Supabase browser client, establishes session from URL hash, and redirects to dashboard.
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Authenticating Voice Pilot...</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { background-color: #0a0a0a; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
      .card { text-align: center; padding: 2.5rem 2rem; background: #141414; border: 1px solid #262626; border-radius: 1.25rem; max-width: 380px; width: 90%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
      .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #ff4b2f; border-radius: 50%; width: 40px; height: 40px; animation: spin 0.8s linear infinite; margin: 0 auto 1.5rem; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      h2 { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.5rem; tracking: -0.02em; }
      p { font-size: 0.875rem; color: #a3a3a3; margin: 0; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="spinner"></div>
      <h2>Authenticating Session</h2>
      <p id="msg">Establishing secure connection to Voice Pilot...</p>
    </div>
    <script type="module">
      import { createBrowserClient } from "https://esm.sh/@supabase/ssr@0.5.2";
      
      const supabaseUrl = "${supabaseUrl}";
      const supabaseKey = "${supabaseKey}";
      const nextTarget = "${next}";

      try {
        const supabase = createBrowserClient(supabaseUrl, supabaseKey);

        async function initAuth() {
          if (window.location.hash.includes("access_token")) {
            const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
            const accessToken = hashParams.get("access_token");
            const refreshToken = hashParams.get("refresh_token");

            if (accessToken && refreshToken) {
              const { data } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (data?.session) {
                window.location.replace(nextTarget);
                return;
              }
            }
          }

          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            window.location.replace(nextTarget);
            return;
          }

          supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
              window.location.replace(nextTarget);
            }
          });

          setTimeout(async () => {
            const { data: { session: finalSession } } = await supabase.auth.getSession();
            window.location.replace(nextTarget);
          }, 1500);
        }

        initAuth();
      } catch (err) {
        window.location.replace(nextTarget);
      }
    </script>
  </body>
</html>`,
    {
      headers: { "content-type": "text/html; charset=utf-8" },
    }
  );
}
