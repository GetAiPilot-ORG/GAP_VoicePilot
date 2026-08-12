"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronsUpDown, PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild className="flex-1 min-w-0">
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-neutral-100"
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
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-neutral-400 ml-1" />
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={8} className="w-56 bg-white border border-neutral-200 shadow-md text-neutral-900">
          <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer text-xs font-semibold p-2.5">
            <Link href="/dashboard/assistants/create" onClick={onMobileClose}>
              <Plus className="h-4 w-4 text-[#ff4b2f]" /> Create New Agent
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
