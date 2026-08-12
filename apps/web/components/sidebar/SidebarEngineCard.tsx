"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function SidebarEngineCard({ isCollapsed = false }: { isCollapsed?: boolean }) {
  if (isCollapsed) return null;

  return (
    <div className="mx-2 mb-2.5 mt-1 rounded-xl border border-neutral-200/80 bg-neutral-50/90 p-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#ff4b2f]" />
          <span className="text-xs font-semibold tracking-tight text-neutral-900">
            VoicePilot AI v2.4
          </span>
        </div>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      </div>
      <p className="mt-1 text-[11px] font-normal leading-relaxed text-neutral-600">
        Ultra-low latency Cartesia & ElevenLabs voice pipeline active.
      </p>
    </div>
  );
}

export default SidebarEngineCard;
