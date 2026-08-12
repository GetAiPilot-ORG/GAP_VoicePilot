"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { getBillingDataAction } from "@/app/actions/billing";

export default function HeaderBalanceBadge() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadBalance() {
      try {
        const data = await getBillingDataAction();
        if (isMounted) {
          setBalance(Math.floor(data.balance || 0));
        }
      } catch (e) {
        if (isMounted) setBalance(0);
      }
    }
    loadBalance();

    // Poll every 15 seconds to keep header balance live
    const interval = setInterval(loadBalance, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link 
      href="/dashboard/billing"
      title="View Plans & Billing"
      className="inline-flex h-[38px] items-center gap-2 px-3.5 rounded-xl bg-purple-50 hover:bg-purple-100/90 border border-purple-200/80 text-purple-950 text-xs font-semibold transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
    >
      <span className="w-4.5 h-4.5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <Zap className="w-2.5 h-2.5 fill-current" />
      </span>
      <span className="tracking-tight text-neutral-800 text-xs">
        Balance:{" "}
        <strong className="font-mono font-bold text-purple-950 ml-0.5">
          {balance === null ? "..." : `${balance.toLocaleString()} Mins`}
        </strong>
      </span>
    </Link>
  );
}
