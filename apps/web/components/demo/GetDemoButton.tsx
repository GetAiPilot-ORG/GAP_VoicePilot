"use client";

import React from "react";
import Link from "next/link";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Sparkles } from "lucide-react";

interface GetDemoButtonProps {
  children?: React.ReactNode;
  variant?: "primary" | "light" | "outline" | "navbar";
  className?: string;
  source?: string;
}

export function GetDemoButton({
  children,
  variant = "primary",
  className = "",
  source = "website_hero"
}: GetDemoButtonProps) {
  const targetHref = source ? `/demo?src=${encodeURIComponent(source)}` : "/demo";

  if (variant === "navbar") {
    return (
      <Link
        href={targetHref}
        className={`inline-flex items-center gap-1.5 rounded-full border border-[#ff4b2f]/40 bg-[#fff5f3] px-4 py-2 text-xs font-bold text-[#d93620] shadow-xs transition-all hover:bg-[#ffece8] hover:border-[#ff4b2f] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b2f] ${className}`}
      >
        <Sparkles className="h-3.5 w-3.5 text-[#ff4b2f]" />
        <span>{children || "Get a Demo"}</span>
      </Link>
    );
  }

  if (variant === "outline") {
    return (
      <Link
        href={targetHref}
        className={`inline-flex h-12 items-center justify-center rounded-full border border-[#ff4b2f]/55 bg-white px-7 text-base font-semibold text-[#d93620] transition-colors hover:bg-[#fff3ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b2f] focus-visible:ring-offset-2 ${className}`}
      >
        {children || "Get a Demo"}
      </Link>
    );
  }

  return (
    <PrimaryButton
      href={targetHref}
      variant={variant === "light" ? "light" : "primary"}
      className={className}
    >
      {children || "Get a Demo"}
    </PrimaryButton>
  );
}

export default GetDemoButton;
