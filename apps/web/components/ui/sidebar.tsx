"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LucideIcon,
  LayoutDashboard,
  Bot,
  GitBranch,
  Share2,
  Users,
  Megaphone,
  PhoneCall,
  Phone,
  Headphones,
  FileText,
  TrendingUp,
  BarChart3,
  CreditCard,
  Webhook,
  ShieldCheck,
  Shield,
  Lock,
  X,
  MessageSquare,
  Settings,
  HelpCircle,
} from "lucide-react";

import SidebarNavItem from "@/components/sidebar/SidebarNavItem";
import SidebarHeader from "@/components/sidebar/SidebarHeader";
import SidebarUserProfileTile, { UserProfileData } from "@/components/sidebar/SidebarUserProfileTile";
import SidebarEngineCard from "@/components/sidebar/SidebarEngineCard";
import { ALL_SIDEBAR_MODULES, SidebarPermissionsConfig } from "@/lib/sidebarPermissions";

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

const sidebarVariants = {
  open: { width: "15.5rem" },
  closed: { width: "4rem" },
};

const transitionProps = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2,
} as const;

export interface SessionNavBarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  isPinned?: boolean;
  setIsPinned?: (pinned: boolean) => void;
}

export function SessionNavBar({
  mobileOpen = false,
  setMobileOpen,
  isPinned = true,
  setIsPinned,
}: SessionNavBarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isCollapsed = !isPinned && !isHovered;
  const pathname = usePathname();

  const [userProfile, setUserProfile] = useState<UserProfileData>({
    email: "Loading...",
    name: "User",
    initials: "GV",
    isAdmin: false,
  });

  const [sidebarPermissions, setSidebarPermissions] = useState<SidebarPermissionsConfig>({});

  useEffect(() => {
    const fetchUserAndPermissions = async () => {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const email = user.email || "";
          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            (email ? email.split("@")[0] : "User");

          let initials = "GV";
          if (name && name !== "User") {
            const parts = name.trim().split(" ");
            if (parts.length >= 2) {
              initials = `${parts[0][0]}${parts[1][0]}`.toUpperCase();
            } else if (parts[0].length >= 2) {
              initials = parts[0].substring(0, 2).toUpperCase();
            }
          } else if (email) {
            initials = email.substring(0, 2).toUpperCase();
          }

          const { checkIsAdminAction } = await import("@/app/actions/kyc");
          const isAdmin = await checkIsAdminAction();

          setUserProfile({ email, name, initials, isAdmin });
        }

        const { getSidebarPermissionsAction } = await import("@/app/actions/adminSidebarPermissions");
        const perms = await getSidebarPermissionsAction();
        setSidebarPermissions(perms);
      } catch (e) {
        console.warn("Could not load user profile or sidebar permissions in sidebar:", e);
      }
    };
    fetchUserAndPermissions();
  }, []);

  // 1. Build Navigation items from master registry
  const navItems: Array<{
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

  // 2. Add Admin-specific links if admin
  if (userProfile.isAdmin) {
    navItems.push(
      {
        name: "Admin KYC Portal",
        href: "/dashboard/admin/kyc",
        icon: ShieldCheck,
        badge: "ADMIN",
        badgeVariant: "new",
      },
      {
        name: "Integration Admin",
        href: "/dashboard/admin/integrations",
        icon: Shield,
        badge: "ADMIN",
        badgeVariant: "new",
      },
      {
        name: "Sidebar Permissions",
        href: "/dashboard/admin/sidebar-permissions",
        icon: Lock,
        badge: "ADMIN",
        badgeVariant: "new",
      }
    );
  }

  // 3. Filter Navigation items by role permissions
  const filteredNav = navItems.filter((item) => {
    const perm = sidebarPermissions[item.href] || "user";
    if (perm === "admin" && !userProfile.isAdmin) {
      return false;
    }
    return true;
  });

  // 4. Build & Filter System items from master registry
  const systemItems: Array<{
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
    }))
    .filter((item) => {
      const perm = sidebarPermissions[item.href] || "user";
      if (perm === "admin" && !userProfile.isAdmin) {
        return false;
      }
      return true;
    });

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen?.(false)}
          />

          <div className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-neutral-200 bg-white shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex h-[64px] items-center justify-between px-3 border-b border-neutral-100">
              <SidebarHeader isCollapsed={false} onMobileClose={() => setMobileOpen?.(false)} />
              <button
                type="button"
                onClick={() => setMobileOpen?.(false)}
                className="rounded-xl p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ScrollArea className="flex-1 px-3 py-4">
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  NAVIGATION
                </p>
                {filteredNav.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                  return (
                    <SidebarNavItem
                      key={item.name}
                      name={item.name}
                      href={item.href}
                      icon={item.icon}
                      isActive={isActive}
                      badge={item.badge}
                      badgeVariant={item.badgeVariant}
                      onClick={() => setMobileOpen?.(false)}
                    />
                  );
                })}

                {systemItems.length > 0 && (
                  <>
                    <Separator className="my-3 bg-neutral-100" />
                    <p className="px-3 text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      SYSTEM
                    </p>
                    {systemItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <SidebarNavItem
                          key={item.name}
                          name={item.name}
                          href={item.href}
                          icon={item.icon}
                          isActive={isActive}
                          badge={item.badge}
                          badgeVariant={item.badgeVariant}
                          onClick={() => setMobileOpen?.(false)}
                        />
                      );
                    })}
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Bottom Anchored Card + User Profile Tile */}
            <div className="mt-auto flex flex-col w-full">
              <SidebarEngineCard isCollapsed={false} />
              <SidebarUserProfileTile userProfile={userProfile} onMobileClose={() => setMobileOpen?.(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Animated Collapsible Light Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 z-40 hidden h-full shrink-0 border-r border-neutral-200/90 bg-white text-neutral-900 shadow-xs md:block"
        initial={isCollapsed ? "closed" : "open"}
        animate={isCollapsed ? "closed" : "open"}
        variants={sidebarVariants}
        transition={transitionProps}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex h-full w-full flex-col justify-between overflow-hidden">
          {/* Top Brand Header */}
          <SidebarHeader
            isCollapsed={isCollapsed}
            isPinned={isPinned}
            setIsPinned={setIsPinned}
          />

          {/* Navigation Links List */}
          <ScrollArea className="flex-1 px-2.5 py-3">
            <div className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400 mb-2 transition-opacity">
                  NAVIGATION
                </p>
              )}

              {filteredNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                return (
                  <SidebarNavItem
                    key={item.name}
                    name={item.name}
                    href={item.href}
                    icon={item.icon}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                    badge={item.badge}
                    badgeVariant={item.badgeVariant}
                  />
                );
              })}

              {systemItems.length > 0 && (
                <>
                  <Separator className="my-2.5 bg-neutral-100" />
                  {!isCollapsed && (
                    <p className="px-3 text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400 mb-2 transition-opacity">
                      SYSTEM
                    </p>
                  )}
                  {systemItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <SidebarNavItem
                        key={item.name}
                        name={item.name}
                        href={item.href}
                        icon={item.icon}
                        isActive={isActive}
                        isCollapsed={isCollapsed}
                        badge={item.badge}
                        badgeVariant={item.badgeVariant}
                      />
                    );
                  })}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Bottom Anchored Engine Card + User Profile Tile */}
          <div className="mt-auto flex flex-col w-full shrink-0">
            <SidebarEngineCard isCollapsed={isCollapsed} />
            <SidebarUserProfileTile userProfile={userProfile} isCollapsed={isCollapsed} />
          </div>
        </div>
      </motion.aside>
    </>
  );
}

export function SidebarDemo() {
  return (
    <div className="flex h-screen w-screen flex-row">
      <SessionNavBar />
      <main className="flex h-screen grow flex-col overflow-auto pl-16" />
    </div>
  );
}

export default SessionNavBar;
