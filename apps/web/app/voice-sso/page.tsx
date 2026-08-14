"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2, AlertCircle, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function VoiceSSOContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const [message, setMessage] = useState("Signing you in securely from GetAiPilot…");

  useEffect(() => {
    const controller = new AbortController();

    const processSSO = async () => {
      const token = searchParams.get("token");
      const supabase = createClient();

      if (token) {
        try {
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
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center p-6 font-sans relative selection:bg-[#ff4b2f]/20 selection:text-black">
      {/* Premium Light Theme Ambient Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff4b2f]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-orange-400/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-neutral-200/80 bg-white p-1">
          <Image src="/logo.png" alt="GAP Logo" width={32} height={32} className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-extrabold text-base tracking-tight text-neutral-900">GAP</span>
          <span className="text-[10px] font-mono tracking-widest text-[#ff4b2f] font-bold uppercase">VOICEPILOT</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="relative z-10 bg-white border border-neutral-200/90 rounded-2xl p-8 max-w-md w-full text-center shadow-xl space-y-6">
        <div className="flex justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff4b2f]/10 border border-[#ff4b2f]/20 text-xs font-semibold text-[#ff4b2f]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Single Sign-On Authentication</span>
          </div>
        </div>

        {status === "processing" && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#ff4b2f]/10 border border-[#ff4b2f]/20 flex items-center justify-center shadow-xs">
              <Loader2 className="w-8 h-8 text-[#ff4b2f] animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold tracking-tight text-neutral-900">
                Authenticating
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
                {message}
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-xs">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold tracking-tight text-neutral-900">
                Sign-in Issue
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
                {message}
              </p>
            </div>
            <button
              onClick={() => router.replace("/login")}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-xs active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-[#ff4b2f]" />
              <span>Sign in manually</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] font-mono text-neutral-400 mt-6 relative z-10">
        Protected by GAP VoicePilot SSO Protocol • getaipilot.in
      </p>
    </div>
  );
}

export default function VoiceSSOPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#ff4b2f] animate-spin" />
        </div>
      }
    >
      <VoiceSSOContent />
    </Suspense>
  );
}
