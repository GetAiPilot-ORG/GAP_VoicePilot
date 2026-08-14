"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PhoneCall,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Clock,
  ExternalLink,
} from "lucide-react";
import { checkDemoEligibilityAction, triggerOneTimeDemoCallAction } from "@/app/actions/demoCall";

export interface DemoCallSectionProps {
  user?: any;
}

function formatErrorString(err: any): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    return err.message || err.error || JSON.stringify(err);
  }
  return String(err);
}

export function DemoCallSection({ user }: DemoCallSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callState, setCallState] = useState<
    "idle" | "submitting" | "calling" | "success" | "already_used" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusText, setStatusText] = useState("Ready");
  const [initiatedCallId, setInitiatedCallId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const res = await checkDemoEligibilityAction();
        if (!isMounted) return;

        setIsAuthenticated(res.isAuthenticated);
        setIsEligible(res.isEligible);

        if (res.phone) {
          setPhoneNumber(res.phone);
        }

        if (res.isAuthenticated && !res.isEligible) {
          setCallState("already_used");
          setStatusText("Demo used");
        }
      } catch (err: any) {
        if (isMounted) console.warn("Failed to check demo call status:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchStatus();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Real-time status polling effect: detects when the user hangs up / cuts the call
  useEffect(() => {
    if (callState !== "calling") return;

    let elapsedSeconds = 0;
    const activeCallId = initiatedCallId;

    const pollInterval = setInterval(async () => {
      elapsedSeconds += 3;

      // 1. Check direct call status via Vomyra backend if callId is available
      if (activeCallId) {
        try {
          const { getCallStatusAction } = await import("@/app/actions/calls");
          const statusRes = await getCallStatusAction(activeCallId);

          if (statusRes.isEnded) {
            clearInterval(pollInterval);
            setIsEligible(false);
            setCallState("already_used");
            setStatusText("Demo used");
            return;
          }
        } catch (e) {}
      }

      // 2. Query eligibility status from Supabase database
      try {
        const eligibility = await checkDemoEligibilityAction();
        if (eligibility.isAuthenticated && !eligibility.isEligible) {
          clearInterval(pollInterval);
          setIsEligible(false);
          setCallState("already_used");
          setStatusText("Demo used");
          return;
        }
      } catch (e) {}

      // 3. Fallback maximum duration limit (65 seconds)
      if (elapsedSeconds >= 65) {
        clearInterval(pollInterval);
        setIsEligible(false);
        setCallState("already_used");
        setStatusText("Demo used");
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [callState, initiatedCallId]);

  const handleStartTestCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent("/demo#test-call");
      router.push(`/login?redirectTo=${returnUrl}`);
      return;
    }

    if (callState === "submitting" || callState === "calling") return;

    // Frontend phone validation
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, "");
    if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 10) {
      setErrorMessage("Please enter a valid 10-digit phone number (e.g. +91 98765 43210).");
      return;
    }

    setCallState("submitting");
    setStatusText("Starting call...");

    try {
      const res = await triggerOneTimeDemoCallAction({ phone_number: cleanPhone });

      if (res.needAuth) {
        const returnUrl = encodeURIComponent("/demo#test-call");
        router.push(`/login?redirectTo=${returnUrl}`);
        return;
      }

      if (!res.success) {
        if (res.demoEligible === false) {
          setIsEligible(false);
          setCallState("already_used");
          setStatusText("Demo used");
        } else {
          setCallState("error");
          setStatusText("Call failed");
          setErrorMessage(formatErrorString(res.error || "Failed to initiate test call. Please try again."));
        }
        return;
      }

      // SUCCESSFUL CALL INITIATION
      setInitiatedCallId(res.callId || null);
      setIsEligible(false);
      setCallState("calling");
      setStatusText("Call active");
    } catch (err: any) {
      setCallState("error");
      setStatusText("Call failed");
      setErrorMessage(formatErrorString(err?.message || err || "An unexpected error occurred. Please try again."));
    }
  };

  const formattedDisplayPhone = () => {
    const raw = phoneNumber.replace(/[^\d+]/g, "");
    if (raw.startsWith("+91")) return raw;
    if (raw.length === 10) return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
    return raw;
  };

  return (
    <section id="test-call" className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8 lg:px-12">
      <div className="relative overflow-hidden rounded-[32px] border border-black/10 bg-white p-6 sm:p-10 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)] text-black text-left">
        {/* Decorative Ambient Accents */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#ff4b2f]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-orange-400/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading & Value Prop */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fff5f3] border border-[#ff4b2f]/20 text-xs font-bold text-[#d93620] shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-[#ff4b2f]" />
              <span>1 Free Test Call Per Account</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-array tracking-tight text-black leading-[1.02]">
                Try VoicePilot Live
              </h2>
              <p className="text-base sm:text-lg text-black/70 font-light leading-relaxed max-w-xl">
                Experience an AI-powered phone conversation before getting started. Receive a real 60-second AI phone call directly on your mobile device.
              </p>
            </div>

            {/* Sub Feature Bullet Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#f7f6f0] border border-black/5 text-xs font-semibold text-black/80">
                <Zap className="h-4 w-4 text-[#ff4b2f] shrink-0" />
                <span>Sub-240ms Speech Latency</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#f7f6f0] border border-black/5 text-xs font-semibold text-black/80">
                <Clock className="h-4 w-4 text-[#ff4b2f] shrink-0" />
                <span>Controlled 60-Sec Demo Call</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#f7f6f0] border border-black/5 text-xs font-semibold text-black/80">
                <PhoneCall className="h-4 w-4 text-[#ff4b2f] shrink-0" />
                <span>Hindi & English Conversational AI</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#f7f6f0] border border-black/5 text-xs font-semibold text-black/80">
                <ShieldCheck className="h-4 w-4 text-[#ff4b2f] shrink-0" />
                <span>Zero Setup & Zero Card Required</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Test Call Box */}
          <div className="lg:col-span-6 w-full">
            <div className="rounded-[28px] border border-black/10 bg-[#f7f6f0] p-6 sm:p-8 space-y-6 shadow-sm relative">
              
              {loading ? (
                /* LOADING STATE */
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="h-8 w-8 text-[#ff4b2f] animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-black/60">Checking demo call eligibility...</p>
                </div>
              ) : !isAuthenticated ? (
                /* GUEST / UNAUTHENTICATED STATE */
                <div className="space-y-6 py-2">
                  <div className="space-y-2 text-left">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-black/50">
                      STEP 1 OF 2 • AUTHENTICATION
                    </span>
                    <h3 className="text-xl font-bold text-black tracking-tight">
                      Sign in to experience a live test call
                    </h3>
                    <p className="text-xs text-black/60 leading-relaxed font-normal">
                      To prevent abuse, test calls require a free VoicePilot user account. Each account receives exactly 1 free test call.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-black/10 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-black font-semibold">
                      <Lock className="h-4 w-4 text-[#ff4b2f]" />
                      <span>One-Time Free Call Authorization</span>
                    </div>
                    <p className="text-black/60 font-light text-[11px]">
                      After logging in, you will be redirected right back to this page to enter your mobile number and receive your call immediately.
                    </p>
                  </div>

                  <Link
                    href={`/login?redirectTo=${encodeURIComponent("/demo#test-call")}`}
                    className="group inline-flex h-12 w-full items-center justify-between rounded-full bg-[#ff4b2f] hover:bg-[#e63e24] text-white pl-6 pr-2 shadow-[0_6px_20px_rgba(255,75,47,0.25)] transition-all hover:scale-[1.01]"
                  >
                    <span className="flex-1 text-center font-bold text-xs tracking-wide uppercase">
                      Try Test Call (Sign In)
                    </span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[2.5px] border-[#ff4b2f] bg-white transition-transform group-hover:translate-x-0.5">
                      <ArrowRight className="h-4 w-4 text-[#ff4b2f]" />
                    </span>
                  </Link>
                </div>
              ) : callState === "already_used" ? (
                /* INELIGIBLE / DEMO ALREADY USED STATE */
                <div className="py-4 space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-black/10 shadow-xs">
                    <div className="h-10 w-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                        STATUS: DEMO CALL CONSUMED
                      </span>
                      <h4 className="text-sm font-bold text-black">
                        Your free test call has already been used.
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-black/65 text-left leading-relaxed">
                    You have already experienced your 1-time free test call for this account. To run unlimited AI calls, connect dedicated phone numbers, or build multi-agent sales workflows, choose a plan or open your console dashboard.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <a
                      href="#pricing"
                      className="inline-flex h-11 items-center justify-center rounded-full bg-[#ff4b2f] hover:bg-[#e63e24] text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.01]"
                    >
                      View Pricing Plans
                    </a>
                    <Link
                      href="/dashboard"
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-black/20 bg-white hover:bg-black/5 text-black text-xs font-bold transition-all"
                    >
                      <span>Open Console</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* ELIGIBLE / CALL INITIATION STATE */
                <form onSubmit={handleStartTestCall} className="space-y-5" noValidate>
                  <div className="space-y-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-black/50">
                        ENTER MOBILE NUMBER
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-[#d93620] bg-[#fff5f3] px-2 py-0.5 rounded-md border border-[#ff4b2f]/20">
                        Status: {statusText}
                      </span>
                    </div>
                    <p className="text-xs text-black/60 font-normal">
                      We will dispatch an immediate 60-second AI phone call to this number.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 text-left">
                      <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{formatErrorString(errorMessage)}</span>
                    </div>
                  )}

                  {callState === "calling" || callState === "success" ? (
                    /* INITIATED CALLING ANIMATION */
                    <div className="py-6 text-center space-y-4 bg-white rounded-2xl border border-black/10 p-6 animate-in zoom-in-95 duration-200">
                      <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4b2f] opacity-30" />
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#ff4b2f] text-white shadow-md">
                          <PhoneCall className="h-6 w-6 animate-bounce" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-base font-bold text-black font-array">
                          Call Dispatched & Active
                        </h4>
                        <p className="text-xs text-black/65 font-medium">
                          Ringing <span className="font-mono font-bold text-black">{formattedDisplayPhone()}</span>...
                        </p>
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium space-y-1 text-left mt-2">
                          <p className="font-bold flex items-center gap-1.5 text-amber-800">
                            <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span>60-Second Demo Call Active</span>
                          </p>
                          <p className="text-black/70 font-normal">
                            Please answer the phone call. Once you disconnect or cut the call, this demo section will automatically lock.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* INPUT FORM */
                    <div className="space-y-4 text-left">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-black uppercase tracking-wider">
                          Mobile Phone Number <span className="text-[#ff4b2f]">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+91 98765 43210"
                            disabled={callState === "submitting"}
                            className="w-full h-12 pl-10 pr-3.5 rounded-full bg-white border border-black/15 text-xs font-semibold text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all disabled:opacity-60"
                          />
                        </div>
                        <p className="text-[11px] text-black/45 pl-2 font-mono">
                          Format: +91XXXXXXXXXX (10-digit Indian mobile number)
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={callState === "submitting" || !isEligible}
                        className="group inline-flex h-12 w-full items-center justify-between rounded-full bg-[#ff4b2f] hover:bg-[#e63e24] text-white pl-6 pr-2 shadow-[0_6px_20px_rgba(255,75,47,0.25)] transition-all duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b2f] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <span className="flex-1 text-center font-bold text-xs tracking-wide uppercase">
                          {callState === "submitting" ? "Initiating Telephony Call..." : "Start Free Test Call"}
                        </span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[2.5px] border-[#ff4b2f] bg-white transition-transform duration-300 group-hover:translate-x-0.5">
                          {callState === "submitting" ? (
                            <Loader2 className="h-4 w-4 animate-spin text-[#ff4b2f]" />
                          ) : (
                            <PhoneCall className="h-4 w-4 text-[#ff4b2f]" />
                          )}
                        </span>
                      </button>

                      <p className="text-[11px] text-center text-black/45 font-medium">
                        1 free demo call limit enforced on database per account.
                      </p>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
