"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, LogIn } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary caught:", error);
  }, [error]);

  const handleClearAndLogin = () => {
    if (typeof window !== "undefined") {
      // Clear storage to clear corrupted state
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-5">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white mb-2">
          Unable to Load Page
        </h1>
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          {error?.message && !error.message.includes("digest")
            ? error.message
            : "An unexpected error occurred while loading this view. You can reload or return to sign in."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs bg-white text-black hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>

          <button
            onClick={handleClearAndLogin}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs bg-neutral-800 text-white hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 border border-neutral-700"
          >
            <LogIn className="w-3.5 h-3.5" />
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
