"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Wallet } from "lucide-react";
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
      className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 text-xs font-semibold transition-all shadow-sm group"
    >
      <Zap className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform fill-purple-600" />
      <span>
        Balance:{" "}
        <strong className="font-mono text-purple-900">
          {balance === null ? "..." : `${balance} Mins`}
        </strong>
      </span>
    </Link>
  );
}
