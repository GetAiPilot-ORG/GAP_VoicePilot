"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2, AlertCircle, RefreshCw, Sparkles, ShieldCheck } from "lucide-react";
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

        if (!res.ok || (!data.session && !data.magic_link_url)) {
          const errorMsg =
            res.status === 503
              ? "SSO is not configured on Voice Pilot server. Missing VOICE_PILOT_SSO_SECRET in environment variables."
              : data.error === "SSO token already used"
              ? "This sign-in link has already been used. Please return to GetAiPilot and click Launch Voice Pilot again."
              : data.error || "Authentication failed. Please try signing in manually.";

          setStatus("error");
          setMessage(errorMsg);
          return;
        }

        if (data.session) {
          setMessage("Setting up your Voice Pilot session…");
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });

          if (setSessionError) {
            console.error("[SSO Client] setSession error:", setSessionError);
            if (data.magic_link_url) {
              window.location.href = data.magic_link_url;
              return;
            }
          }

          setMessage("Redirecting to your Voice Pilot workspace…");
          window.location.href = "/dashboard";
          return;
        }

        if (data.magic_link_url) {
          setMessage("Redirecting to your Voice Pilot workspace…");
          window.location.href = data.magic_link_url;
        }
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
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden selection:bg-[#ff4b2f] selection:text-white">
      {/* Soft Ambient Light Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff4b2f]/8 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[320px] h-[320px] bg-orange-400/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Subtle Light Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(#000000 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Glassmorphic Light Card Container */}
      <div className="relative z-10 bg-white/95 backdrop-blur-2xl border border-black/10 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Top Gradient Highlight Accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#ff4b2f] to-transparent" />

        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="GAP Voice Pilot Logo" 
              width={44} 
              height={44} 
              className="h-11 w-11 object-contain drop-shadow-sm" 
              priority 
            />
            <div className="flex flex-col text-left leading-none">
              <span className="font-extrabold text-lg tracking-tight text-neutral-900">
                GAP
              </span>
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#ff4b2f]">
                VOICEPILOT
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ff4b2f]/8 border border-[#ff4b2f]/20 text-[11px] font-semibold text-[#ff4b2f] mt-1 shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#ff4b2f]" />
            <span>Single Sign-On Authentication</span>
          </div>
        </div>

        {/* Processing / Loading State */}
        {status === "processing" && (
          <div className="flex flex-col items-center gap-5 py-2">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#ff4b2f]/8 border border-[#ff4b2f]/20 flex items-center justify-center shadow-[0_4px_20px_rgba(255,75,47,0.12)]">
                <Loader2 className="w-8 h-8 text-[#ff4b2f] animate-spin" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                Authenticating
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed max-w-xs mx-auto font-medium">
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="flex flex-col items-center gap-5 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center shadow-sm">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                Sign-in Failed
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed max-w-xs mx-auto font-medium">
                {message}
              </p>
            </div>

            <button
              onClick={() => router.replace("/login")}
              className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ff4b2f] hover:bg-[#ff3b1e] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(255,75,47,0.25)] hover:shadow-[0_6px_20px_rgba(255,75,47,0.35)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sign in manually</span>
            </button>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="mt-8 pt-5 border-t border-black/5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-[#ff4b2f]/70" />
          <span>Protected by Enterprise SSL • VoicePilot AI</span>
        </div>
      </div>
    </div>
  );
}

export default function VoiceSSOPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#ff4b2f] animate-spin" />
        </div>
      }
    >
      <VoiceSSOContent />
    </Suspense>
  );
}
