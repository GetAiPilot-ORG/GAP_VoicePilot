"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, Eye, EyeOff, Check, Loader2, ArrowRight } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { login, signup } from "@/app/actions/auth";

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

export interface AuthSectionOneProps {
  mode?: "login" | "signup";
  error?: string;
}

export default function AuthSectionOne({ mode = "signup", error }: AuthSectionOneProps) {
  const [currentMode, setCurrentMode] = useState<"login" | "signup">(mode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const isLogin = currentMode === "login";

  const handleToggleMode = (e: React.MouseEvent) => {
    e.preventDefault();
    const nextMode = isLogin ? "signup" : "login";
    setCurrentMode(nextMode);
    window.history.pushState(null, "", nextMode === "login" ? "/login" : "/signup");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (isSubmitting) {
      e.preventDefault();
      return;
    }
    setIsSubmitting(true);
  };

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

            <a
              href={isLogin ? "/signup" : "/login"}
              onClick={handleToggleMode}
              className="group inline-flex items-center gap-1.5 rounded-full border border-black/12 bg-white px-4 py-2 text-xs font-semibold text-black/70 shadow-sm transition-all hover:border-black/25 hover:bg-black/[0.02] hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
            >
              <span className="text-black/50 dark:text-white/50">{isLogin ? "Need an account?" : "Already registered?"}</span>
              <span className="font-bold text-[#ff4b2f] group-hover:underline">{isLogin ? "Sign up" : "Sign in"}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#ff4b2f] transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Form Content */}
          <div className="my-auto py-8 mx-auto w-full max-w-[440px]">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white sm:text-3xl">
                {isLogin ? "Welcome back" : "Create an account"}
              </h1>
              <p className="mt-2 text-sm text-black/60 dark:text-white/60 sm:text-base">
                {isLogin ? "Sign in to manage your AI voice agents and call flows" : "Brainstorm in chat, build autonomous AI voice agents"}
              </p>
            </div>

            {/* Professional Alert Banner */}
            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300 animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1 text-xs leading-relaxed sm:text-sm font-medium">
                  <p className="font-semibold text-red-800 dark:text-red-200">Authentication Alert</p>
                  <p className="mt-0.5 text-red-700/90 dark:text-red-300/90">{error}</p>
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <SocialButton icon={<GoogleIcon />} label={isLogin ? "Sign in with Google" : "Sign up with Google"} />
              <SocialButton icon={<AppleIcon />} label={isLogin ? "Sign in with Apple" : "Sign up with Apple"} />
            </div>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10 dark:border-white/10" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-black/40 dark:bg-[#0a0a0a] dark:text-white/40">
                Or continue with email
              </span>
            </div>

            <form action={isLogin ? login : signup} onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
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

              <FieldBox
                label="Password"
                name="password"
                placeholder="••••••••••••"
                type="password"
                required
              />

              {!isLogin && (
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
                    isLogin ? "Sign In to Dashboard" : "Create Account"
                  )}
                </PrimaryButton>
              </div>
            </form>
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
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === "password";
  const activeInputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5 text-left">
      <label className="block text-xs font-semibold uppercase tracking-wider text-black/60 dark:text-white/60">
        {label}
      </label>
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

function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 4.7 10.7 3.6v7.7H3V4.7Zm8.8-1.25L21 2.1v9.2h-9.2V3.45ZM3 12.7h7.7v7.7L3 19.3v-6.6Zm8.8 0H21v9.2l-9.2-1.3v-7.9Z" />
    </svg>
  );
}
