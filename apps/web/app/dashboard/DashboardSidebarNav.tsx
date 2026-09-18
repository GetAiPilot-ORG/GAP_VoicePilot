"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LucideIcon,
  LayoutDashboard,
  Bot,
  Users,
  PhoneCall,
  Phone,
  FileText,
  BarChart3,
  CreditCard,
  Settings,
  Share2,
  GitBranch,
  Shield,
  MessageSquare,
  Megaphone,
  Headphones,
  TrendingUp,
  Webhook,
  ShieldCheck,
  Lock,
  HelpCircle,
} from "lucide-react";
import SidebarNavItem from "@/components/sidebar/SidebarNavItem";
import SidebarEngineCard from "@/components/sidebar/SidebarEngineCard";
import { Separator } from "@/components/ui/separator";
import { ALL_SIDEBAR_MODULES } from "@/lib/sidebarPermissions";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Bot,
  Share2,
  GitBranch,
  Users,
  Megaphone,
  MessageSquare,
  PhoneCall,
  Phone,
  Headphones,
  FileText,
  TrendingUp,
  BarChart3,
  CreditCard,
  Webhook,
  Settings,
  ShieldCheck,
  Shield,
  Lock,
};

export default function DashboardSidebarNav() {
  const pathname = usePathname();

  const mainNav: Array<{
    name: string;
    href: string;
    icon: LucideIcon;
    badge?: string;
    badgeVariant?: "live" | "new" | "default";
  }> = ALL_SIDEBAR_MODULES
    .filter((mod) => mod.category === "navigation")
    .map((mod) => ({
      name: mod.name,
      href: mod.href,
      icon: ICON_MAP[mod.iconName] || HelpCircle,
      badge: mod.badge,
      badgeVariant: mod.badgeVariant,
    }));

  const systemNav: Array<{
    name: string;
    href: string;
    icon: LucideIcon;
    badge?: string;
    badgeVariant?: "live" | "new" | "default";
  }> = ALL_SIDEBAR_MODULES
    .filter((mod) => mod.category === "system")
    .map((mod) => ({
      name: mod.name,
      href: mod.href,
      icon: ICON_MAP[mod.iconName] || HelpCircle,
      badge: mod.badge,
      badgeVariant: mod.badgeVariant,
    }));

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400 mb-2">
          NAVIGATION
        </p>
        {mainNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <SidebarNavItem
              key={item.name}
              name={item.name}
              href={item.href}
              icon={item.icon}
              isActive={isActive}
              badge={item.badge}
              badgeVariant={item.badgeVariant}
            />
          );
        })}

        <Separator className="my-3 bg-black/5 dark:bg-white/5" />

        <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400 mb-2">
          ADMINISTRATION
        </p>
        <SidebarNavItem
          name="Integration Admin"
          href="/dashboard/admin/integrations"
          icon={Shield}
          isActive={pathname?.startsWith("/dashboard/admin/integrations")}
        />

        {systemNav.length > 0 && (
          <>
            <Separator className="my-3 bg-black/5 dark:bg-white/5" />
            <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              SYSTEM
            </p>
            {systemNav.map((item) => (
              <SidebarNavItem
                key={item.name}
                name={item.name}
                href={item.href}
                icon={item.icon}
                isActive={pathname === item.href}
                badge={item.badge}
                badgeVariant={item.badgeVariant}
              />
            ))}
          </>
        )}
      </div>

      <SidebarEngineCard isCollapsed={false} />
    </div>
  );
}
