"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function VoiceSSOContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const [message, setMessage] = useState("Signing you in from GetAiPilot…");

  useEffect(() => {
    const controller = new AbortController();

    const processSSO = async () => {
      const token = searchParams.get("token");
      const supabase = createClient();

      if (token) {
        try {
          // Extract email from token payload to check if session already exists
          const payloadPart = token.split(".")[0];
          const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
          const decodedPayload = JSON.parse(atob(base64));
          const ssoEmail = decodedPayload?.email;

          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session && session.user?.email === ssoEmail) {
            router.replace("/dashboard");
            return;
          }

          if (session) {
            await supabase.auth.signOut();
          }
        } catch (e) {
          console.error("[SSO Client] Token payload parse warning:", e);
        }
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          router.replace("/dashboard");
          return;
        }

        setStatus("error");
        setMessage(
          "No SSO token found. Please launch GAP Voice Pilot again from GetAiPilot."
        );
        return;
      }

      try {
        const res = await fetch("/api/auth/sso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          signal: controller.signal,
        });

        const data = await res.json().catch(() => ({}));

        if (controller.signal.aborted) return;

        if (!res.ok || !data.magic_link_url) {
          const errorMsg =
            data.error === "SSO token already used"
              ? "This sign-in link has already been used. Please return to GetAiPilot and click Launch Voice Pilot again."
              : data.error || "Authentication failed. Please try signing in manually.";

          setStatus("error");
          setMessage(errorMsg);
          return;
        }

        setMessage("Redirecting to your Voice Pilot workspace…");
        window.location.href = data.magic_link_url;
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setStatus("error");
        setMessage("Network connection error. Please try again.");
      }
    };

    processSSO();
    return () => {
      controller.abort();
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-xs font-medium text-purple-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GAP Voice Pilot SSO</span>
          </div>
        </div>

        {status === "processing" && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Authenticating
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
                {message}
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Sign-in Failed
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-xs mx-auto">
                {message}
              </p>
            </div>
            <button
              onClick={() => router.replace("/login")}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium transition-colors border border-neutral-700/50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sign in manually</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VoiceSSOPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      }
    >
      <VoiceSSOContent />
    </Suspense>
  );
}
