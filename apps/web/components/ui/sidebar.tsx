"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Blocks,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  UserCog,
  Bot,
  PhoneCall,
  Phone,
  FileText,
  BarChart3,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.75rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
} as const;

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

export function SessionNavBar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  const mainNav = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Assistants", href: "/dashboard/assistants", icon: Bot },
    { name: "Campaigns", href: "/dashboard/campaigns", icon: PhoneCall },
    { name: "Phone Numbers", href: "/dashboard/phone-numbers", icon: Phone },
    { name: "Call Logs", href: "/dashboard/calls", icon: FileText },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Plans & Billing", href: "/dashboard/billing", icon: CreditCard },
  ];

  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 top-0 z-40 h-full shrink-0 border-r border-hairline bg-white text-black shadow-sm",
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className="relative z-40 flex h-full shrink-0 flex-col bg-white text-black transition-all"
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center w-full">
            {/* Header with Organization Dropdown */}
            <div className="flex h-[64px] w-full shrink-0 items-center justify-center border-b border-hairline px-2">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="w-full" asChild>
                  <button
                    className="flex w-full items-center gap-3 px-2 py-1.5 rounded-[10px] hover:bg-surface-soft transition-colors text-black"
                  >
                    <div className="w-9 h-9 rounded-[10px] overflow-hidden shrink-0 flex items-center justify-center mx-auto">
                      <Image src="/logo.png" alt="GAP Logo" width={36} height={36} className="w-full h-full object-cover" />
                    </div>
                    <motion.li
                      variants={variants}
                      className="flex w-full items-center justify-between overflow-hidden"
                    >
                      {!isCollapsed && (
                        <>
                          <div className="flex flex-col text-left leading-none">
                            <span className="text-base font-bold tracking-tight text-black">GAP</span>
                            <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-semibold uppercase mt-0.5">VOICEPILOT</span>
                          </div>
                          <ChevronsUpDown className="h-3.5 w-3.5 text-neutral-400 shrink-0 ml-auto" />
                        </>
                      )}
                    </motion.li>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={8} className="w-56 bg-white border border-hairline shadow-md text-black">
                  <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer text-xs">
                    <Link href="/dashboard/settings">
                      <UserCog className="h-4 w-4 text-black" /> Manage Organization
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer text-xs">
                    <Link href="/dashboard/settings">
                      <Blocks className="h-4 w-4 text-black" /> API & Integrations
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-hairline" />
                  <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer text-xs">
                    <Link href="/dashboard/assistants/create">
                      <Plus className="h-4 w-4 text-black" /> New Voice Agent
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Scrollable Navigation Links */}
            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow py-3 px-2">
                  <div className="flex w-full flex-col gap-1.5 items-center">
                    {mainNav.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex h-9 w-full items-center rounded-[10px] text-xs font-medium transition-all",
                            isCollapsed ? "justify-center px-0" : "px-3 justify-start gap-3",
                            isActive
                              ? "bg-black text-white font-semibold shadow-sm"
                              : "text-neutral-600 hover:text-black hover:bg-surface-soft"
                          )}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <div className="w-8 h-8 flex items-center justify-center shrink-0">
                            <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-block-lime" : "text-neutral-500")} />
                          </div>
                          <motion.li variants={variants}>
                            {!isCollapsed && (
                              <span className="text-xs font-medium whitespace-nowrap">{item.name}</span>
                            )}
                          </motion.li>
                        </Link>
                      );
                    })}

                    <Separator className="my-2 w-full bg-hairline" />

                    <Link
                      href="/dashboard/settings"
                      className={cn(
                        "flex h-9 w-full items-center rounded-[10px] text-xs font-medium transition-all",
                        isCollapsed ? "justify-center px-0" : "px-3 justify-start gap-3",
                        pathname === "/dashboard/settings"
                          ? "bg-black text-white font-semibold shadow-sm"
                          : "text-neutral-600 hover:text-black hover:bg-surface-soft"
                      )}
                      title={isCollapsed ? "API & Webhooks" : undefined}
                    >
                      <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        <Settings className={cn("h-4 w-4 shrink-0", pathname === "/dashboard/settings" ? "text-block-lime" : "text-neutral-500")} />
                      </div>
                      <motion.li variants={variants}>
                        {!isCollapsed && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium whitespace-nowrap">API & Webhooks</span>
                            <Badge className="bg-block-lime text-black border-none text-[9px] px-1.5 py-0 font-bold" variant="outline">
                              LIVE
                            </Badge>
                          </div>
                        )}
                      </motion.li>
                    </Link>
                  </div>
                </ScrollArea>
              </div>

              {/* User Profile & Sign Out Footer */}
              <div className="flex flex-col p-2 border-t border-hairline w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full">
                    <div className={cn(
                      "flex h-9 w-full items-center rounded-[10px] text-xs transition-colors hover:bg-surface-soft",
                      isCollapsed ? "justify-center px-0" : "px-2.5 justify-start gap-2.5"
                    )}>
                      <Avatar className="h-7 w-7 shrink-0 border border-black/10">
                        <AvatarFallback className="bg-block-cream text-black font-bold text-xs">
                          GV
                        </AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex w-full items-center justify-between overflow-hidden"
                      >
                        {!isCollapsed && (
                          <>
                            <div className="flex flex-col text-left truncate">
                              <p className="text-xs font-semibold text-black truncate">Voice Admin</p>
                              <p className="text-[10px] text-neutral-400 truncate">admin@gapvoice.ai</p>
                            </div>
                            <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-neutral-400 shrink-0" />
                          </>
                        )}
                      </motion.li>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={8} align="start" className="w-52 bg-white border border-hairline text-black shadow-md">
                    <div className="flex flex-row items-center gap-2.5 p-2">
                      <Avatar className="h-7 w-7 border border-black/10">
                        <AvatarFallback className="bg-block-cream text-black font-bold text-xs">
                          GV
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-semibold text-black">
                          Voice Admin
                        </span>
                        <span className="line-clamp-1 text-[10px] text-neutral-400">
                          admin@gapvoice.ai
                        </span>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-hairline" />
                    <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer text-xs">
                      <Link href="/dashboard/billing">
                        <CreditCard className="h-4 w-4 text-black" /> Plans & Billing
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="flex items-center gap-2 cursor-pointer text-xs">
                      <Link href="/dashboard/settings">
                        <Settings className="h-4 w-4 text-black" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-2 cursor-pointer text-xs text-red-600 focus:text-red-600"
                      onClick={async () => {
                        const { signOut } = await import('@/app/actions/auth');
                        await signOut();
                      }}
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}

export function SidebarDemo() {
  return (
    <div className="flex h-screen w-screen flex-row">
      <SessionNavBar />
      <main className="flex h-screen grow flex-col overflow-auto pl-16">
      </main>
    </div>
  );
}
