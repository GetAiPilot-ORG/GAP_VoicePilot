import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  let totalAssistantsCount = 0;
  let activeCampaignsCount = 0;
  let totalCallsCount = 0;
  let creditBalance = "$0.00";

  try {
    const { count: astCount } = await adminClient
      .from("assistants")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);
    
    totalAssistantsCount = astCount || 0;

    const { count: campCount } = await adminClient
      .from("campaigns")
      .select("*", { count: "exact", head: true });
    
    activeCampaignsCount = campCount || 0;

    const { count: callsCount } = await adminClient
      .from("call_logs")
      .select("*", { count: "exact", head: true });

    totalCallsCount = callsCount || 0;

    const { data: ws } = await adminClient
      .from("workspaces")
      .select("id, balance")
      .limit(1)
      .maybeSingle();

    if (ws?.id) {
      const { data: rpcBal } = await adminClient.rpc('get_workspace_credit_balance', {
        p_workspace_id: ws.id
      });
      const numBal = Math.floor(Number(rpcBal ?? 100));
      creditBalance = `${numBal} AI Mins`;
    } else {
      creditBalance = "100 AI Mins";
    }
  } catch (err) {
    creditBalance = "100 AI Mins";
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <div className="space-y-1 border-b border-hairline pb-5 sm:pb-6">
        <div className="flex items-center gap-2">
          <p className="eyebrow text-neutral-500">// SYSTEM METRICS</p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">Overview</h1>
        <p className="text-neutral-600 text-xs sm:text-sm">Real-time statistics across your voice assistant ecosystem.</p>
      </div>

      <div className="grid gap-3.5 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-hairline rounded-[14px] p-4 sm:p-6 shadow-sm hover:border-black/20 transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs sm:text-sm font-semibold text-neutral-700">Total Assistants</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-black">{totalAssistantsCount}</div>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1">Live active assistants</p>
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-[14px] p-4 sm:p-6 shadow-sm hover:border-black/20 transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs sm:text-sm font-semibold text-neutral-700">Active Campaigns</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-black">{activeCampaignsCount}</div>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1">Running voice campaigns</p>
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-[14px] p-4 sm:p-6 shadow-sm hover:border-black/20 transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs sm:text-sm font-semibold text-neutral-700">Total Calls</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-black">{totalCallsCount}</div>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1">Total dispatched calls</p>
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-[14px] p-4 sm:p-6 shadow-sm hover:border-black/20 transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs sm:text-sm font-semibold text-neutral-700">Credit Balance</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{creditBalance}</div>
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-1">Available wallet balance</p>
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-hairline bg-surface-soft p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-3.5 sm:mb-4 text-black">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
          <Link href="/dashboard/assistants/create" className="btn-pill-primary rounded-[10px] px-5 py-2.5 text-center justify-center">
            Create Assistant
          </Link>
          <Link href="/dashboard/campaigns" className="btn-pill-secondary rounded-[10px] px-5 py-2.5 text-center justify-center">
            Start Campaign
          </Link>
          <Link href="/dashboard/calls" className="btn-pill-secondary rounded-[10px] px-5 py-2.5 text-center justify-center">
            View Call Logs
          </Link>
        </div>
      </div>
    </div>
  );
}
