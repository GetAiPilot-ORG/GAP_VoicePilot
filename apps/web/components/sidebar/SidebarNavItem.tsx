"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarNavItemProps {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed?: boolean;
  badge?: string;
  badgeVariant?: "live" | "new" | "default";
  onClick?: () => void;
}

export function SidebarNavItem({
  name,
  href,
  icon: Icon,
  isActive,
  isCollapsed = false,
  badge,
  badgeVariant = "default",
  onClick,
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={isCollapsed ? name : undefined}
      className={cn(
        "group relative flex h-10 w-full items-center rounded-xl transition-all duration-150",
        isCollapsed ? "justify-center px-0" : "px-3 justify-start gap-3",
        isActive
          ? "bg-neutral-100/80 text-neutral-900 font-bold"
          : "text-neutral-600 hover:bg-neutral-100/60 hover:text-neutral-900 active:scale-[0.99]"
      )}
    >
      <div className="flex h-7 w-7 items-center justify-center shrink-0">
        <Icon
          className={cn(
            "h-4.5 w-4.5 transition-transform duration-150 group-hover:scale-105",
            isActive ? "text-[#ff4b2f]" : "text-neutral-500 group-hover:text-neutral-900"
          )}
        />
      </div>

      {!isCollapsed && (
        <div className="flex flex-1 items-center justify-between overflow-hidden">
          <span className="text-[13px] tracking-tight truncate">{name}</span>
          {badge && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                badgeVariant === "live"
                  ? "bg-emerald-500/15 text-emerald-600"
                  : badgeVariant === "new"
                  ? "bg-[#ff4b2f]/15 text-[#ff4b2f]"
                  : "bg-neutral-200 text-neutral-700"
              )}
            >
              {badgeVariant === "live" && (
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Clean Orange Underline Accent Bar */}
      {isActive && (
        <span
          className={cn(
            "absolute bottom-1 h-[2px] rounded-full bg-[#ff4b2f] transition-all duration-200",
            isCollapsed ? "left-2.5 right-2.5" : "left-3.5 right-3.5"
          )}
        />
      )}
    </Link>
  );
}

export default SidebarNavItem;
