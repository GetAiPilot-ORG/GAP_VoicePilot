"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Bell, Menu } from "lucide-react";
import { SessionNavBar } from "@/components/ui/sidebar";
import HeaderBalanceBadge from "@/components/HeaderBalanceBadge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-white text-black font-sans selection:bg-block-lime selection:text-black">
      {/* Animated Collapsible Sidebar & Mobile Drawer */}
      <SessionNavBar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area (responsive offset: pl-0 on mobile, pl-16 on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 pl-0 md:pl-16">
        {/* Top Header Bar */}
        <header className="h-[54px] border-b border-hairline px-3 sm:px-6 flex items-center justify-between bg-white sticky top-0 z-30 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-md">
            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-[8px] border border-hairline hover:bg-surface-soft text-neutral-700 shrink-0"
              aria-label="Open mobile menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Mobile Brand Logo Header */}
            <div className="flex md:hidden items-center gap-2 shrink-0">
              <Image src="/logo.png" alt="GAP Logo" width={24} height={24} className="rounded-[6px]" />
              <span className="font-bold text-xs">GAP</span>
            </div>

            {/* Search Input */}
            <div className="relative w-full hidden sm:block">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search assistants, campaigns, calls..." 
                className="w-full pl-8 pr-4 py-1 text-xs bg-surface-soft border border-hairline rounded-[8px] focus:outline-none focus:border-black/30 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Live AI Calling Balance Badge */}
            <HeaderBalanceBadge />

            <button className="hidden sm:flex p-1.5 rounded-[8px] hover:bg-surface-soft text-neutral-600 border border-hairline transition-colors relative" title="Notifications">
              <Bell className="w-3.5 h-3.5" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1 right-1"></span>
            </button>

            <Link href="/dashboard/assistants/create" className="btn-pill-primary rounded-[8px] text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 shadow-sm whitespace-nowrap">
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">New Agent</span>
              <span className="sm:hidden">Agent</span>
            </Link>
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

