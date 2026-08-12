"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Plus, 
  Search, 
  Bell, 
  Menu, 
  ChevronDown, 
  Bot, 
  Megaphone, 
  PhoneCall, 
  Headphones, 
  CreditCard 
} from "lucide-react";
import { SessionNavBar } from "@/components/ui/sidebar";
import HeaderBalanceBadge from "@/components/HeaderBalanceBadge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(true);

  return (
    <div className="min-h-screen flex bg-white text-black font-sans selection:bg-block-lime selection:text-black">
      {/* Animated Collapsible Sidebar & Mobile Drawer */}
      <SessionNavBar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} isPinned={isPinned} setIsPinned={setIsPinned} />

      {/* Main Content Area */}
      <div className={cn("flex-1 flex flex-col min-w-0 pl-0 transition-all duration-200", isPinned ? "md:pl-[15.5rem]" : "md:pl-16")}>
        {/* Top Header Bar */}
        <header className="h-[64px] border-b border-neutral-200/80 px-4 sm:px-6 flex items-center justify-between bg-white/85 backdrop-blur-md sticky top-0 z-30 gap-3 transition-all">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-[10px] border border-neutral-200 bg-neutral-50 hover:bg-neutral-200/70 text-neutral-700 shrink-0 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Mobile Brand Logo Header */}
            <div className="flex md:hidden items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-[8px] overflow-hidden">
                <Image src="/logo.png" alt="GAP Logo" width={28} height={28} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-xs">GAP</span>
                <span className="text-[9px] font-mono tracking-widest text-neutral-400 font-semibold uppercase">VOICEPILOT</span>
              </div>
            </div>

            {/* Command-Bar Styled Search Input */}
            <div className="relative w-full hidden sm:block group">
              <Search className="w-4 h-4 text-neutral-400 group-focus-within:text-black absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
              <input 
                type="text"
                placeholder="Search assistants, campaigns, calls..." 
                className="w-full h-[38px] pl-9 pr-12 text-xs bg-neutral-100/70 hover:bg-neutral-100 focus:bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all font-medium placeholder:text-neutral-400"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded-[5px] bg-white border border-black/10 text-[10px] font-mono font-medium text-neutral-400 shadow-2xs">
                <span>⌘</span>
                <span>K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Live AI Calling Balance Badge */}
            <HeaderBalanceBadge />

            {/* Notifications Button */}
            <button 
              className="hidden sm:flex h-[38px] w-[38px] items-center justify-center rounded-xl hover:bg-neutral-100 text-neutral-600 border border-neutral-200 transition-all active:scale-95 relative" 
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute top-2 right-2 animate-pulse" />
            </button>

            {/* Quick Action Create Dropdown Menu */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-[38px] items-center gap-2 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-black hover:shadow-sm active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4 text-[#ff4b2f] stroke-[2.5]" />
                  <span>Create</span>
                  <ChevronDown className="h-3.5 w-3.5 text-white/70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-56 bg-white border border-neutral-200 text-neutral-900 shadow-xl">
                <DropdownMenuItem asChild className="flex items-center gap-2.5 cursor-pointer text-xs font-medium p-2.5">
                  <Link href="/dashboard/assistants/create">
                    <Bot className="h-4 w-4 text-[#ff4b2f]" /> New Voice Agent
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="flex items-center gap-2.5 cursor-pointer text-xs font-medium p-2.5">
                  <Link href="/dashboard/campaigns">
                    <Megaphone className="h-4 w-4 text-neutral-700" /> New Campaign
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="flex items-center gap-2.5 cursor-pointer text-xs font-medium p-2.5">
                  <Link href="/dashboard/phone-numbers">
                    <PhoneCall className="h-4 w-4 text-neutral-700" /> Get Phone Number
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-neutral-100" />

                <DropdownMenuItem asChild className="flex items-center gap-2.5 cursor-pointer text-xs font-medium p-2.5">
                  <Link href="/dashboard/calls">
                    <Headphones className="h-4 w-4 text-neutral-700" /> Review Call Logs
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="flex items-center gap-2.5 cursor-pointer text-xs font-medium p-2.5">
                  <Link href="/dashboard/billing">
                    <CreditCard className="h-4 w-4 text-neutral-700" /> Add AI Credits
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
          <div className="max-w-[1480px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
