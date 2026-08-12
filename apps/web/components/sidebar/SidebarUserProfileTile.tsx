"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronsUpDown, CreditCard, LogOut, Settings, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface UserProfileData {
  name: string;
  email: string;
  initials: string;
  isAdmin?: boolean;
}

export interface SidebarUserProfileTileProps {
  userProfile: UserProfileData;
  isCollapsed?: boolean;
  onMobileClose?: () => void;
}

export function SidebarUserProfileTile({
  userProfile,
  isCollapsed = false,
  onMobileClose,
}: SidebarUserProfileTileProps) {
  return (
    <div className="w-full border-t border-neutral-200/80 p-2">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild className="w-full">
          <button
            type="button"
            className="flex h-11 w-full items-center rounded-xl p-1.5 transition-colors hover:bg-neutral-100"
          >
            <div className="relative shrink-0">
              <Avatar className="h-8 w-8 border border-neutral-200 bg-neutral-100">
                <AvatarFallback className="bg-neutral-900 text-white font-bold text-xs">
                  {userProfile.initials || "GV"}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            {!isCollapsed && (
              <div className="ml-2.5 flex flex-1 items-center justify-between overflow-hidden text-left leading-tight">
                <div className="flex flex-col truncate pr-1">
                  <span className="font-semibold text-xs text-neutral-900 truncate">
                    {userProfile.name}
                  </span>
                  <span className="text-[11px] text-neutral-500 truncate">
                    {userProfile.email}
                  </span>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="w-56 bg-white border border-neutral-200 text-neutral-900 shadow-lg">
          <div className="flex items-center gap-3 p-2.5 border-b border-neutral-100">
            <Avatar className="h-9 w-9 border border-neutral-200">
              <AvatarFallback className="bg-neutral-900 text-white font-bold text-xs">
                {userProfile.initials || "GV"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left truncate">
              <span className="text-xs font-semibold text-neutral-900 truncate">
                {userProfile.name}
              </span>
              <span className="text-[11px] text-neutral-500 truncate">
                {userProfile.email}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-neutral-100" />

          <DropdownMenuItem asChild className="flex items-center gap-2.5 cursor-pointer text-xs font-medium p-2.5">
            <Link href="/dashboard/billing" onClick={onMobileClose}>
              <CreditCard className="h-4 w-4 text-neutral-700" /> Plans & Billing
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="flex items-center gap-2.5 cursor-pointer text-xs font-medium p-2.5">
            <Link href="/dashboard/settings" onClick={onMobileClose}>
              <Settings className="h-4 w-4 text-neutral-700" /> API & Webhooks
            </Link>
          </DropdownMenuItem>

          {userProfile.isAdmin && (
            <DropdownMenuItem asChild className="flex items-center gap-2.5 cursor-pointer text-xs font-medium p-2.5">
              <Link href="/dashboard/admin/kyc" onClick={onMobileClose}>
                <ShieldCheck className="h-4 w-4 text-[#ff4b2f]" /> Admin Portal
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-neutral-100" />

          <DropdownMenuItem
            className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold p-2.5 text-red-600 focus:text-red-600"
            onClick={async () => {
              const { signOut } = await import("@/app/actions/auth");
              await signOut();
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default SidebarUserProfileTile;
