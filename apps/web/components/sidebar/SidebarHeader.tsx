"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export interface SidebarHeaderProps {
  isCollapsed?: boolean;
  isPinned?: boolean;
  setIsPinned?: (pinned: boolean) => void;
  onMobileClose?: () => void;
}

export function SidebarHeader({
  isCollapsed = false,
  isPinned = true,
  setIsPinned,
  onMobileClose,
}: SidebarHeaderProps) {
  return (
    <div className="flex h-[64px] w-full shrink-0 items-center justify-between border-b border-neutral-200/80 px-3">
      <Link
        href="/"
        onClick={onMobileClose}
        className="flex flex-1 min-w-0 items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-neutral-100"
        title="Go to Home Page"
      >
        <Image
          src="/logo.png"
          alt="GAP VoicePilot Logo"
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 object-contain"
          priority
        />
        {!isCollapsed && (
          <div className="flex flex-1 items-center justify-between overflow-hidden">
            <div className="flex flex-col justify-center leading-tight text-left truncate">
              <span className="font-bold text-sm tracking-tight text-neutral-900 truncate">
                GAP
              </span>
              <span className="font-array text-[10.5px] font-semibold uppercase tracking-[0.14em] text-neutral-500 truncate">
                VOICEPILOT
              </span>
            </div>
          </div>
        )}
      </Link>

      {!isCollapsed && setIsPinned && (
        <button
          type="button"
          onClick={() => setIsPinned(!isPinned)}
          className="ml-1 rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors shrink-0"
          title={isPinned ? "Collapse Sidebar" : "Keep Sidebar Open"}
        >
          {isPinned ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

export default SidebarHeader;
