import Link from "next/link";
import { Plus, Search, Bell } from "lucide-react";
import { SessionNavBar } from "@/components/ui/sidebar";
import HeaderBalanceBadge from "@/components/HeaderBalanceBadge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-white text-black font-sans selection:bg-block-lime selection:text-black">
      {/* Animated Collapsible Sidebar */}
      <SessionNavBar />

      {/* Main Content Area (offset by collapsed sidebar width pl-16) */}
      <div className="flex-1 flex flex-col min-w-0 pl-16">
        {/* Top Header Bar */}
        <header className="h-[64px] border-b border-hairline px-8 flex items-center justify-between bg-white sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search assistants, campaigns, calls..." 
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-surface-soft border border-hairline rounded-[10px] focus:outline-none focus:border-black/30 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live AI Calling Balance Badge (Navigates to /dashboard/billing on click) */}
            <HeaderBalanceBadge />

            <button className="p-2 rounded-[10px] hover:bg-surface-soft text-neutral-600 border border-hairline transition-colors relative" title="Notifications">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5"></span>
            </button>

            <Link href="/dashboard/assistants/create" className="btn-pill-primary rounded-[10px] text-xs px-4 py-2 shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              New Agent
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
