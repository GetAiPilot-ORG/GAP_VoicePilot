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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground text-sm">Real-time statistics across your voice assistant ecosystem.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assistants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{totalAssistantsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Live active assistants</p>
          </CardContent>
        </Card>

        <Card className="border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sky-400">{activeCampaignsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Running voice campaigns</p>
          </CardContent>
        </Card>

        <Card className="border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">{totalCallsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Total dispatched calls</p>
          </CardContent>
        </Card>

        <Card className="border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{creditBalance}</div>
            <p className="text-xs text-muted-foreground mt-1">Available wallet balance</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-6">
        <h2 className="text-xl font-bold tracking-tight mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/assistants/create">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
              Create Assistant
            </Button>
          </Link>
          <Link href="/dashboard/campaigns">
            <Button variant="secondary">Start Campaign</Button>
          </Link>
          <Link href="/dashboard/calls">
            <Button variant="outline">View Call Logs</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
