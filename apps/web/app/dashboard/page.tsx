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
      .select("balance")
      .limit(1)
      .maybeSingle();

    if (ws && typeof ws.balance === 'number') {
      creditBalance = `$${ws.balance.toFixed(2)}`;
    }
  } catch (err) {}

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="space-y-1 border-b border-hairline pb-6">
        <div className="flex items-center gap-2">
          <p className="eyebrow text-neutral-500">// SYSTEM METRICS</p>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-black">Overview</h1>
        <p className="text-neutral-600 text-sm">Real-time statistics across your voice assistant ecosystem.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-hairline rounded-[14px] p-6 shadow-sm hover:border-black/20 transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-semibold text-neutral-700">Total Assistants</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-black">{totalAssistantsCount}</div>
            <p className="text-xs text-neutral-500 mt-1">Live active assistants</p>
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-[14px] p-6 shadow-sm hover:border-black/20 transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-semibold text-neutral-700">Active Campaigns</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-black">{activeCampaignsCount}</div>
            <p className="text-xs text-neutral-500 mt-1">Running voice campaigns</p>
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-[14px] p-6 shadow-sm hover:border-black/20 transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-semibold text-neutral-700">Total Calls</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-black">{totalCallsCount}</div>
            <p className="text-xs text-neutral-500 mt-1">Total dispatched calls</p>
          </div>
        </div>

        <div className="bg-white border border-hairline rounded-[14px] p-6 shadow-sm hover:border-black/20 transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-semibold text-neutral-700">Credit Balance</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600">{creditBalance}</div>
            <p className="text-xs text-neutral-500 mt-1">Available wallet balance</p>
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-hairline bg-surface-soft p-6 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight mb-4 text-black">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/assistants/create" className="btn-pill-primary rounded-[10px] px-5 py-2.5">
            Create Assistant
          </Link>
          <Link href="/dashboard/campaigns" className="btn-pill-secondary rounded-[10px] px-5 py-2.5">
            Start Campaign
          </Link>
          <Link href="/dashboard/calls" className="btn-pill-secondary rounded-[10px] px-5 py-2.5">
            View Call Logs
          </Link>
        </div>
      </div>
    </div>
  );
}
