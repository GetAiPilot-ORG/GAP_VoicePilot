"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Check, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { login, signup, requestPasswordReset, updatePassword } from "@/app/actions/auth";

// Safe dynamic wrapper for GrainGradient shader
function ShaderBackground() {
  const [mounted, setMounted] = useState(false);
  const [ShaderComp, setShaderComp] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    setMounted(true);
    import("@paper-design/shaders-react")
      .then((mod) => {
        if (mod && mod.GrainGradient) {
          setShaderComp(() => mod.GrainGradient);
        }
      })
      .catch((err) => {
        console.warn("Shader canvas initialization fallback:", err);
      });
  }, []);

  if (!mounted || !ShaderComp) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff4b2f] via-[#111111] to-black" />
    );
  }

  return (
    <ShaderComp
      speed={1.2}
      scale={1.1}
      rotation={45}
      offsetX={0}
      offsetY={0}
      softness={0.4}
      intensity={0.7}
      noise={0.3}
      shape="corners"
      frame={2854.5}
      colors={["#ff4b2f", "#ff3b1e", "#0a0a0a", "#000000"]}
      colorBack="#000000"
      className="absolute inset-0 bg-black"
    />
  );
}

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
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return "Too many requests. Please wait a moment before trying again.";
  }
  return message || "Authentication failed. Please check your credentials and try again.";
}

export type AuthMode = "login" | "signup" | "forgot-password" | "reset-password";

export interface AuthSectionOneProps {
  mode?: AuthMode;
  error?: string;
}

export default function AuthSectionOne({ mode = "signup", error }: AuthSectionOneProps) {
  const [currentMode, setCurrentMode] = useState<AuthMode>(mode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetEmailSentTo, setResetEmailSentTo] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") || searchParams?.get("returnTo") || searchParams?.get("redirect") || "/dashboard";

  useEffect(() => {
    setCurrentMode(mode);
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      if (accessToken && refreshToken) {
        import("@/utils/supabase/client").then(async ({ createClient }) => {
          const supabase = createClient();
          const { data } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (data?.session) {
            if (type === "recovery") {
              setCurrentMode("reset-password");
            } else {
              window.location.href = redirectTo || "/dashboard";
            }
          }
        });
      }
    }
  }, [mode, redirectTo]);

  // Handle Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSetMode = (nextMode: AuthMode) => {
    setCurrentMode(nextMode);
    setLocalError(null);
    setSuccessMessage(null);
    
    let path = "/login";
    if (nextMode === "signup") path = "/signup";
    else if (nextMode === "forgot-password") path = "/forgot-password";
    else if (nextMode === "reset-password") path = "/reset-password";
    
    window.history.pushState(null, "", path);
  };

  const handleToggleMode = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentMode === "login") {
      handleSetMode("signup");
    } else {
      handleSetMode("login");
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim();

    if (!email) {
      setLocalError("Please enter your registered email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3002";
      formData.set("origin", origin);

      const res = await requestPasswordReset(formData);
      if (res.success) {
        setResetEmailSentTo(email);
        setSuccessMessage(res.message || `Password reset link sent to ${email}`);
        setResendCooldown(60);
      } else {
        setLocalError(res.error || "Failed to send reset link. Please try again.");
      }
    } catch (err: any) {
      setLocalError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    if (!resetEmailSentTo || resendCooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setLocalError(null);

    try {
      const formData = new FormData();
      formData.set("email", resetEmailSentTo);
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3002";
      formData.set("origin", origin);

      const res = await requestPasswordReset(formData);
      if (res.success) {
        setSuccessMessage(`Reset link resent to ${resetEmailSentTo}!`);
        setResendCooldown(60);
      } else {
        setLocalError(res.error || "Failed to resend reset email.");
      }
    } catch (err: any) {
      setLocalError(err?.message || "Failed to resend email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const password = (formData.get("password") as string) || "";
    const confirmPassword = (formData.get("confirmPassword") as string) || "";

    if (!password || password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match. Please ensure both fields are identical.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await updatePassword(formData);
      if (res.success) {
        setSuccessMessage("Password successfully updated! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = redirectTo || "/dashboard";
        }, 1500);
      } else {
        setLocalError(res.error || "Failed to update password. Please try again.");
      }
    } catch (err: any) {
      setLocalError(err?.message || "An unexpected error occurred while updating your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLocalError(null);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const password = (formData.get("password") as string) || "";
    const firstName = (formData.get("firstName") as string) || "";
    const lastName = (formData.get("lastName") as string) || "";
    const name = `${firstName} ${lastName}`.trim();

    if (!email || !password) {
      setLocalError("Please fill in both email and password.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      if (currentMode === "login") {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInErr) {
          setLocalError(formatAuthError(signInErr.message));
          setIsSubmitting(false);
          return;
        }

        if (data?.session) {
          window.location.href = redirectTo || "/dashboard";
          return;
        }
      } else {
        if (password.length < 6) {
          setLocalError("Password must be at least 6 characters long.");
          setIsSubmitting(false);
          return;
        }

        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });

        if (signUpErr) {
          setLocalError(formatAuthError(signUpErr.message));
          setIsSubmitting(false);
          return;
        }

        if (data?.session) {
          window.location.href = redirectTo || "/dashboard";
          return;
        } else if (data?.user) {
          setLocalError("Account created! Please check your email to confirm, or try logging in.");
          setIsSubmitting(false);
          return;
        }
      }
    } catch (err: any) {
      setLocalError(err?.message || "Authentication failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const activeError = localError || error;

  return (
    <section className="min-h-screen bg-[#fafafa] p-3 text-black antialiased dark:bg-[#050505] dark:text-white">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-4 lg:grid-cols-12">
        {/* Left Form Container */}
        <div className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 sm:p-10 lg:col-span-6 lg:p-12 xl:col-span-5 dark:border-white/10 dark:bg-[#0a0a0a]">
          {/* Top Branding Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="GAP VoicePilot Logo" width={40} height={40} className="h-10 w-10 object-contain" priority />
              <div className="flex flex-col justify-center leading-tight">
                <span className="font-bold text-base tracking-tight text-black dark:text-white">
                  GAP
                </span>
                <span className="font-array text-[11px] font-bold uppercase tracking-[0.14em] text-black/60 dark:text-white/60">
                  VOICEPILOT
                </span>
              </div>
            </Link>

            {currentMode === "forgot-password" || currentMode === "reset-password" ? (
              <button
                type="button"
                onClick={() => handleSetMode("login")}
                className="group inline-flex items-center gap-1.5 rounded-full border border-black/12 bg-white px-4 py-2 text-xs font-semibold text-black/70 shadow-sm transition-all hover:border-black/25 hover:bg-black/[0.02] hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-black/60 transition-transform group-hover:-translate-x-0.5 dark:text-white/60" />
                <span>Back to Sign in</span>
              </button>
            ) : (
              <a
                href={currentMode === "login" ? "/signup" : "/login"}
                onClick={handleToggleMode}
                className="group inline-flex items-center gap-1.5 rounded-full border border-black/12 bg-white px-4 py-2 text-xs font-semibold text-black/70 shadow-sm transition-all hover:border-black/25 hover:bg-black/[0.02] hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
              >
                <span className="text-black/50 dark:text-white/50">{currentMode === "login" ? "Need an account?" : "Already registered?"}</span>
                <span className="font-bold text-[#ff4b2f] group-hover:underline">{currentMode === "login" ? "Sign up" : "Sign in"}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#ff4b2f] transition-transform group-hover:translate-x-0.5" />
              </a>
            )}
          </div>

          {/* Form Content Area */}
          <div className="my-auto py-8 mx-auto w-full max-w-[440px]">
            {/* VIEW 1: FORGOT PASSWORD */}
            {currentMode === "forgot-password" && (
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4b2f]/10 text-[#ff4b2f] text-xs font-bold mb-3 border border-[#ff4b2f]/20">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>ACCOUNT RECOVERY</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white sm:text-3xl">
                    Forgot your password?
                  </h1>
                  <p className="mt-2 text-sm text-black/60 dark:text-white/60 sm:text-base leading-relaxed">
                    Enter the email address associated with your account and we'll send you a secure link to reset your password.
                  </p>
                </div>

                {/* Error Banner */}
                {activeError && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300 animate-in fade-in duration-200 shadow-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1 text-xs leading-relaxed sm:text-sm font-medium">
                      <p className="font-semibold text-red-800 dark:text-red-200">Error</p>
                      <p className="mt-0.5 text-red-700/90 dark:text-red-300/90">{activeError}</p>
                    </div>
                  </div>
                )}

                {/* Success Banner / Confirmation */}
                {resetEmailSentTo ? (
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 dark:bg-emerald-500/15 dark:border-emerald-500/30 text-left space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-300">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-100">
                          Reset Link Dispatched
                        </h3>
                        <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                          Sent to <span className="font-bold text-black dark:text-white">{resetEmailSentTo}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-emerald-900/90 dark:text-emerald-200/90">
                      Please check your inbox (and spam folder) for an email containing your password reset link. Click the link to set a new password.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5 border-t border-emerald-500/20">
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || isSubmitting}
                        onClick={handleResendEmail}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-emerald-500/30 bg-white dark:bg-black/40 text-xs font-bold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
                        <span>{resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : "Resend reset email"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetMode("login")}
                        className="py-2.5 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold hover:opacity-90 transition-opacity"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    <FieldBox
                      label="Your Email Address"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                    />

                    <div className="pt-2">
                      <PrimaryButton
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full h-12 ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            Sending reset link...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Mail className="h-4 w-4" />
                            Send Password Reset Link
                          </span>
                        )}
                      </PrimaryButton>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => handleSetMode("login")}
                        className="text-xs font-semibold text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white transition-colors"
                      >
                        ← Return to Sign in
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* GetAiPilot Hub SSO button */}
            <button
              type="button"
              onClick={() => {
                const hubUrl = "https://getaipilot.in";
                window.location.href = `${hubUrl}/login?sso=voice`;
              }}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-black/10 bg-gradient-to-r from-[#031b4e] to-[#0d3880] px-4 text-xs font-semibold text-white shadow-sm transition-all hover:opacity-95 hover:shadow-md sm:text-sm active:scale-[0.99] cursor-pointer"
            >
              <img src="https://getaipilot.in/logo.png" alt="GetAiPilot Logo" className="h-5 w-5 rounded object-contain" />
              <span>Continue with GetAiPilot</span>
            </button>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <SocialButton icon={<GoogleIcon />} label={isLogin ? "Sign in with Google" : "Sign up with Google"} />
              <SocialButton icon={<AppleIcon />} label={isLogin ? "Sign in with Apple" : "Sign up with Apple"} />
            </div>

                {activeError && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300 animate-in fade-in duration-200 shadow-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1 text-xs leading-relaxed sm:text-sm font-medium">
                      <p className="font-semibold text-red-800 dark:text-red-200">Error</p>
                      <p className="mt-0.5 text-red-700/90 dark:text-red-300/90">{activeError}</p>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 animate-in fade-in duration-200 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <div className="flex-1 text-xs leading-relaxed sm:text-sm font-medium">
                      <p className="font-semibold text-emerald-950 dark:text-emerald-100">Success</p>
                      <p className="mt-0.5 text-emerald-800/90 dark:text-emerald-300/90">{successMessage}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <FieldBox
                    label="New Password"
                    name="password"
                    type="password"
                    placeholder="••••••••••••"
                    required
                  />

                  <FieldBox
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••••••"
                    required
                  />

                  <div className="pt-2">
                    <PrimaryButton
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full h-12 ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          Updating password...
                        </span>
                      ) : (
                        "Set New Password & Sign In"
                      )}
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW 3: SIGN IN & SIGN UP */}
            {(currentMode === "login" || currentMode === "signup") && (
              <div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white sm:text-3xl">
                    {currentMode === "login" ? "Welcome back" : "Create an account"}
                  </h1>
                  <p className="mt-2 text-sm text-black/60 dark:text-white/60 sm:text-base">
                    {currentMode === "login" ? "Sign in to manage your AI voice agents and call flows" : "Brainstorm in chat, build autonomous AI voice agents"}
                  </p>
                </div>
              )}

              <FieldBox
                label="Email address"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
              />

              <FieldBox
                label="Password"
                name="password"
                placeholder="••••••••••••"
                type="password"
                required
                rightAction={
                  isLogin ? (
                    <a
                      href="https://getaipilot.in/login?forgot=true&returnTo=voice"
                      className="text-xs font-semibold text-[#ff4b2f] hover:underline"
                    >
                      Forgot password?
                    </a>
                  ) : undefined
                }
              />

              {!isLogin && (
                <div className="space-y-2 pt-1 text-xs leading-relaxed text-black/60 dark:text-white/60">
                  <CheckboxLine>
                    I agree to the <a href="#" className="font-semibold text-black underline hover:text-[#ff4b2f] dark:text-white">Terms of Service</a> & <a href="#" className="font-semibold text-black underline hover:text-[#ff4b2f] dark:text-white">Privacy Policy</a>
                  </CheckboxLine>
                </div>

                <form action={currentMode === "login" ? login : signup} onSubmit={handleSubmit} className="space-y-4">
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  {currentMode === "signup" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FieldBox label="First Name" name="firstName" placeholder="Harshit" required />
                      <FieldBox label="Last Name" name="lastName" placeholder="Sharma" required />
                    </div>
                  )}

                  <FieldBox
                    label="Email address"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                  />

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-black/60 dark:text-white/60">
                        Password
                      </label>
                      {currentMode === "login" && (
                        <a
                          href="/forgot-password"
                          onClick={(e) => {
                            e.preventDefault();
                            handleSetMode("forgot-password");
                          }}
                          className="text-xs font-semibold text-[#ff4b2f] hover:underline focus:outline-none transition-colors"
                        >
                          Forgot password?
                        </a>
                      )}
                    </div>
                    <FieldBox
                      name="password"
                      placeholder="••••••••••••"
                      type="password"
                      required
                    />
                  </div>

                  {currentMode === "signup" && (
                    <div className="space-y-2 pt-1 text-xs leading-relaxed text-black/60 dark:text-white/60">
                      <CheckboxLine>
                        I agree to the <a href="#" className="font-semibold text-black underline hover:text-[#ff4b2f] dark:text-white">Terms of Service</a> & <a href="#" className="font-semibold text-black underline hover:text-[#ff4b2f] dark:text-white">Privacy Policy</a>
                      </CheckboxLine>
                    </div>
                  )}

                  <div className="pt-2">
                    <PrimaryButton
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full h-12 ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          Authenticating...
                        </span>
                      ) : (
                        currentMode === "login" ? "Sign In to Dashboard" : "Create Account"
                      )}
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-black/5 text-center text-xs font-medium text-black/40 dark:border-white/5 dark:text-white/40">
            Protected by enterprise SSL encryption • VoicePilot AI 2026
          </div>
        </div>

        {/* Right Canvas Shader Viewport */}
        <div className="relative flex min-h-[500px] overflow-hidden rounded-2xl bg-black p-8 text-white sm:p-12 lg:col-span-6 xl:col-span-7 lg:min-h-0">
          <ShaderBackground />

          <div className="relative z-10 flex h-full w-full flex-col justify-between">
            <h2 className="max-w-[620px] pt-0 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:pt-12 lg:text-[56px] lg:leading-[0.98] xl:text-[64px]">
              Think fast,<br />
              Build faster
            </h2>

            <div className="space-y-6">
              <p className="max-w-md text-sm font-medium leading-relaxed text-white/80 sm:text-base">
                Deploy ultra-low latency Hindi, English & Hinglish AI voice agents for sales calls, customer support, and automated follow-ups.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-black/12 bg-white px-4 text-xs font-semibold text-black transition-all hover:border-black/30 hover:bg-black/[0.02] dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:text-sm shadow-sm"
    >
      <span className="shrink-0">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function FieldBox({
  label,
  name,
  defaultValue = "",
  placeholder,
  type = "text",
  required = false,
  rightAction,
}: {
  label?: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  rightAction?: ReactNode;
}) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === "password";
  const activeInputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-black/60 dark:text-white/60">
          {label}
        </label>
        {rightAction}
      </div>
      <div className="relative flex items-center">
        <input
          type={activeInputType}
          name={name}
          value={inputValue}
          required={required}
          placeholder={placeholder}
          onChange={(event) => setInputValue(event.target.value)}
          className="h-11 w-full rounded-xl border border-black/15 bg-white px-4 pr-10 text-sm font-medium text-black placeholder:text-black/35 outline-none transition-all focus:border-black focus:ring-2 focus:ring-black/5 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35 dark:focus:border-white dark:focus:ring-white/10"
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function CheckboxLine({ children }: { children: ReactNode }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer select-none">
      <span className="relative mt-0.5 size-4 shrink-0">
        <input
          type="checkbox"
          className="peer size-full appearance-none rounded border border-black/25 bg-white checked:border-black checked:bg-black dark:border-white/30 dark:bg-white/5 dark:checked:border-white dark:checked:bg-white"
        />
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none absolute inset-0 hidden size-full p-0.5 text-white peer-checked:block dark:text-black"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 6.2 5 8.1 9 3.9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{children}</span>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
        fill="#EB4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 12.54c-.03-3.02 2.47-4.47 2.58-4.54-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.1-4.58 1.1-.95 0-2.42-1.07-3.98-1.04-2.05.03-3.94 1.19-4.99 3.02-2.13 3.69-.54 9.16 1.53 12.15 1.01 1.46 2.22 3.1 3.81 3.04 1.53-.06 2.11-.99 3.96-.99s2.37.99 3.99.96c1.65-.03 2.69-1.49 3.69-2.96 1.16-1.69 1.64-3.33 1.66-3.41-.04-.02-3.2-1.23-3.24-4.87ZM14.03 3.66c.84-1.02 1.41-2.43 1.25-3.84-1.21.05-2.68.81-3.55 1.83-.78.9-1.46 2.34-1.28 3.72 1.35.1 2.73-.69 3.58-1.71Z" />
    </svg>
  );
}
