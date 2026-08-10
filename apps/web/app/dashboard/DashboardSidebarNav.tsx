"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Bot, 
  PhoneCall, 
  Phone, 
  FileText, 
  BarChart3, 
  Settings,
  Sparkles,
  Layers,
  CreditCard
} from "lucide-react";

export default function DashboardSidebarNav() {
  const pathname = usePathname();

  const mainNav = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Assistants", href: "/dashboard/assistants", icon: Bot },
    { name: "Campaigns", href: "/dashboard/campaigns", icon: PhoneCall },
    { name: "Phone Numbers", href: "/dashboard/phone-numbers", icon: Phone },
    { name: "Call Logs & Audio", href: "/dashboard/calls", icon: FileText },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Plans & Billing", href: "/dashboard/billing", icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Main Section */}
      <div className="space-y-1">
        <p className="px-3 eyebrow text-[10px] text-neutral-400 font-mono tracking-wider mb-2">
          NAVIGATION
        </p>
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-xs font-medium transition-all ${
                isActive
                  ? "bg-black text-white shadow-sm font-semibold"
                  : "text-neutral-600 hover:text-black hover:bg-surface-soft"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-block-lime" : "text-neutral-500"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Quick Info Box */}
      <div className="mx-1 p-3 bg-block-cream rounded-[10px] border border-black/5 text-black space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span className="text-[11px] font-bold">GAP Engine v2.4</span>
        </div>
        <p className="text-[10px] text-black/70 leading-normal">
          Cartesia & ElevenLabs low latency neural voice pipeline connected.
        </p>
      </div>
    </div>
  );
}
