import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { fetchVomyraCalls } from "@/lib/vomyra";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Headphones,
  Phone,
  PhoneCall,
  Radio,
  Signal,
  TimerReset,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";

export const dynamic = "force-dynamic";

type ProviderCall = {
  id?: string;
  created_at?: string;
  status?: string;
  call_duration?: string;
  latency_ms?: number | string;
  customer_number?: string;
  phone_number?: string;
  assistant?: {
    id?: string;
    name?: string;
  };
  additional_data?: {
    campaign_name?: string;
  };
};

function parseDurationSecs(value?: string) {
  if (!value) return 0;

  const parts = String(value)
    .split(":")
    .map((part) => Number.parseInt(part || "0", 10));

  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function formatClock(value?: string) {
  if (!value) return "No timestamp";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function compactDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

function getAssistantName(call: ProviderCall) {
  return call.assistant?.name || call.additional_data?.campaign_name || "Assistant";
}

function isCompletedCall(call: ProviderCall) {
  const durationSecs = parseDurationSecs(call.call_duration);
  return call.status === "completed" || call.status === "completed-answered" || durationSecs > 5;
}

import { verifyRouteAccess } from "@/app/actions/adminSidebarPermissions";

export default async function AnalyticsPage() {
  await verifyRouteAccess("/dashboard/analytics");
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  let totalCalls = 0;
  let totalCompletedCalls = 0;
  let totalDurationSecs = 0;
  let avgLatencyMs = 340;
  let successRateStr = "100%";
  let recentCalls: ProviderCall[] = [];
  const hourlyHistogram = new Array(24).fill(0);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: members } = await adminClient
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id);

      const wIds = members?.map((m: any) => m.workspace_id) || [];

      if (wIds.length > 0) {
        const { data: dbAssistants } = await adminClient
          .from("assistants")
          .select("id, name, provider_resource_id")
          .in("workspace_id", wIds)
          .is("deleted_at", null);

        const userAssistantIds = new Set(dbAssistants?.map((a) => a.id) || []);
        const userProviderIds = new Set(
          dbAssistants?.map((a) => a.provider_resource_id).filter(Boolean) || []
        );
        const userAssistantNames = new Set(dbAssistants?.map((a) => a.name.trim()) || []);

        const data = await fetchVomyraCalls(250);
        {
          const rawCalls: ProviderCall[] = data.data || data.calls || (Array.isArray(data) ? data : []);

          // Remove strict filtering so all calls on the Vomyra account (including ecosystem/CRM triggers) are visible in Analytics
          const filteredCalls = rawCalls;

          totalCalls = filteredCalls.length;

          if (filteredCalls.length > 0) {
            let latencySum = 0;
            let completedCount = 0;
            const now = new Date();
            const oneDayMs = 24 * 60 * 60 * 1000;

            filteredCalls.forEach((call) => {
              const durationSecs = parseDurationSecs(call.call_duration);
              totalDurationSecs += durationSecs;
              latencySum += Number(call.latency_ms || 340);

              if (isCompletedCall(call)) completedCount++;

              if (call.created_at) {
                const callDate = new Date(call.created_at);
                const diffMs = now.getTime() - callDate.getTime();

                if (diffMs <= oneDayMs) {
                  const hourIndex = 23 - Math.floor(diffMs / (60 * 60 * 1000));
                  if (hourIndex >= 0 && hourIndex < 24) hourlyHistogram[hourIndex]++;
                }
              }
            });

            avgLatencyMs = Math.round(latencySum / filteredCalls.length);
            successRateStr = `${((completedCount / filteredCalls.length) * 100).toFixed(1)}%`;
            totalCompletedCalls = completedCount;
            recentCalls = [...filteredCalls]
              .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
              .slice(0, 5);
          }
        }
      }
    }
  } catch (e) {
    console.warn("Failed to load analytics metrics from Vomyra API:", e);
  }

  const totalMinutes = Math.round(totalDurationSecs / 60);
  const avgDurationSecs = totalCalls > 0 ? Math.round(totalDurationSecs / totalCalls) : 0;
  const completedCalls = recentCalls.filter(isCompletedCall).length;
  const attentionCalls = Math.max(recentCalls.length - completedCalls, 0);
  const maxVolume = Math.max(...hourlyHistogram, 1);
  const peakHourIndex = hourlyHistogram.reduce(
    (peakIndex, value, index) => (value > hourlyHistogram[peakIndex] ? index : peakIndex),
    0
  );
  const lastCallTime = recentCalls[0]?.created_at ? formatClock(recentCalls[0].created_at) : "Waiting";
  const activeHours = hourlyHistogram.filter((count) => count > 0).length;
  // Generate data for Recharts AreaChart
  const chartData = hourlyHistogram.map((count, index) => {
    const hoursAgo = 23 - index;
    let timeLabel = "Now";
    if (hoursAgo > 0) {
       const d = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
       timeLabel = d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    }
    return {
      hour: timeLabel,
      calls: count,
      isCurrent: index === 23,
    };
  });

  const visibleRecentCount = Math.min(recentCalls.length, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">Analytics Overview</h1>
          <p className="text-sm text-neutral-500 mt-1">Real-time performance metrics and conversation analytics.</p>
        </div>
        <Link href="/dashboard/calls" className="inline-flex items-center justify-center px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shrink-0 gap-2">
          Call Logs <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Hero Metrics (4 Columns) - Visually Attractive Light Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Calls */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100 shadow-sm rotate-3 group-hover:rotate-0 transition-transform">
              <PhoneCall className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Total Calls</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-extrabold text-neutral-900 tracking-tight">{totalCalls}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> {totalCompletedCalls} Picked Up
              </span>
            </div>
          </div>
        </div>

        {/* Completion */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100 shadow-sm -rotate-3 group-hover:rotate-0 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Completion</p>
            <p className="text-4xl font-extrabold text-neutral-900 tracking-tight">{successRateStr}</p>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs font-medium text-neutral-500">Meaningful interactions</p>
            </div>
          </div>
        </div>

        {/* Voice Minutes */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100 shadow-sm rotate-3 group-hover:rotate-0 transition-transform">
              <Clock3 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Voice Mins</p>
            <p className="text-4xl font-extrabold text-neutral-900 tracking-tight">{totalMinutes}</p>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs font-medium text-neutral-500">AI generation time</p>
            </div>
          </div>
        </div>

        {/* Avg Latency */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 border border-orange-100 shadow-sm -rotate-3 group-hover:rotate-0 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-1">Latency</p>
            <div className="flex items-baseline gap-1">
              <p className="text-4xl font-extrabold text-neutral-900 tracking-tight">{avgLatencyMs}</p>
              <span className="text-sm font-bold text-neutral-400">ms</span>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs font-medium text-neutral-500">End-to-end response</p>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                24-Hour Call Volume
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">
               <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-gradient-to-t from-indigo-500 to-purple-500"></div> Now</span>
               <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-neutral-800"></div> Peak</span>
            </div>
          </div>
          
          <div className="flex-1 p-6 flex flex-col bg-neutral-50/30">
            <AnalyticsChart data={chartData} />
          </div>
        </div>

        {/* Recent Calls */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Recent Activity</h2>
            <Link href="/dashboard/calls" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</Link>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {recentCalls.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full text-neutral-400">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5 text-neutral-400" />
                </div>
                <p className="text-sm font-medium text-neutral-600">No activity yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100/80">
                {recentCalls.map((call, idx) => {
                  const isSuccess = isCompletedCall(call);
                  const durationSecs = parseDurationSecs(call.call_duration);
                  const customer = call.customer_number || call.phone_number || "Unknown";
                  
                  return (
                    <li key={call.id || idx} className="p-4 hover:bg-neutral-50/80 transition-colors group flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${isSuccess ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                         {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center mb-1">
                            <p className="text-[15px] font-bold text-neutral-900 truncate tracking-tight">{customer}</p>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100/80 border border-neutral-200 px-2 py-0.5 rounded-md shadow-sm">
                              {compactDuration(durationSecs)}
                            </span>
                         </div>
                         <div className="flex justify-between items-center text-xs text-neutral-500">
                            <p className="truncate font-medium flex items-center gap-1.5"><Radio className="w-3 h-3 text-neutral-400"/> {getAssistantName(call)}</p>
                            <p className="shrink-0">{formatClock(call.created_at)}</p>
                         </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
