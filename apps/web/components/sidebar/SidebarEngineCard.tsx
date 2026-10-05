"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";

export interface SidebarEngineCardProps {
  isCollapsed?: boolean;
  planName?: string;
  balanceMinutes?: number;
}

export function SidebarEngineCard({
  isCollapsed = false,
  planName,
  balanceMinutes = 0,
}: SidebarEngineCardProps) {
  if (isCollapsed) return null;

  const isPaidPlan = Boolean(
    planName &&
      planName.toLowerCase() !== "free" &&
      planName.toLowerCase() !== "free plan"
  );

  return (
    <div className="mx-2 mb-2.5 mt-1 rounded-xl border border-neutral-200/90 bg-gradient-to-br from-neutral-50 to-neutral-100/60 p-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="h-3.5 w-3.5 text-[#ff4b2f] shrink-0" />
          <span className="text-xs font-bold tracking-tight text-neutral-900 truncate">
            {isPaidPlan ? planName : "VoicePilot Free"}
          </span>
        </div>
        {isPaidPlan ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200/80 text-neutral-600 border border-neutral-300/70 shrink-0">
            FREE
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-neutral-200/60 text-xs">
        <span className="text-[11px] font-medium text-neutral-600 flex items-center gap-1">
          <Zap className="h-3 w-3 text-purple-600 fill-current" />
          Calling Balance:
        </span>
        <Link
          href="/dashboard/billing"
          className="font-mono font-bold text-xs text-neutral-900 hover:text-[#ff4b2f] transition-colors"
          title="View Plans & Billing"
        >
          {balanceMinutes} AI Mins
        </Link>
      </div>
    </div>
  );
}

export default SidebarEngineCard;
