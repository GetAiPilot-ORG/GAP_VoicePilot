"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { getBillingDataAction } from "@/app/actions/billing";

export default function HeaderBalanceBadge() {
  const [balance, setBalance] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadBalance() {
      try {
        const data = await getBillingDataAction();
        if (isMounted) {
          setBalance(Math.floor(data.balance || 0));
          const expired = Boolean(
            data.subscription &&
            new Date(data.subscription.current_period_end).getTime() <= Date.now()
          );
          setIsExpired(expired);
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
      title={isExpired ? "Plan expired. Click to renew!" : "View Plans & Billing"}
      className={`inline-flex h-[38px] items-center gap-2 px-3.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs hover:shadow-xs group cursor-pointer ${
        isExpired
          ? "bg-rose-50 hover:bg-rose-100/90 border-rose-200 text-rose-950"
          : "bg-purple-50 hover:bg-purple-100/90 border-purple-200/80 text-purple-950"
      }`}
    >
      <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${
        isExpired ? "bg-rose-600 text-white" : "bg-purple-600 text-white"
      }`}>
        <Zap className="w-2.5 h-2.5 fill-current" />
      </span>
      <span className="tracking-tight text-neutral-800 text-xs flex items-center gap-1.5">
        <span>Balance:</span>
        <strong className={`font-mono font-bold ml-0.5 ${isExpired ? "text-rose-950" : "text-purple-950"}`}>
          {balance === null ? "..." : `${balance.toLocaleString()} Mins`}
        </strong>
        {isExpired && (
          <span className="px-1.5 py-0.5 rounded-md bg-rose-200/80 text-rose-900 text-[10px] font-bold uppercase tracking-wider">
            Plan Expired
          </span>
        )}
      </span>
    </Link>
  );
}
