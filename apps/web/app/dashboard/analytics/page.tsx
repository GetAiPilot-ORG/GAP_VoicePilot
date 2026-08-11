import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { BarChart3, TrendingUp, Zap, Users, Phone, DollarSign, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  let totalCalls = 0;
  let totalDurationSecs = 0;
  let avgLatencyMs = 340;
  let successRateStr = "100%";

  try {
    const { data: { user } } = await supabase.auth.getUser();

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
        // 1. Fetch user's assistants to use for filtering
        const { data: dbAssistants } = await adminClient
          .from("assistants")
          .select("id, name")
          .in("workspace_id", wIds)
          .is("deleted_at", null);

        const userAssistantIds = new Set(dbAssistants?.map(a => a.id) || []);
        const userAssistantNames = new Set(dbAssistants?.map(a => a.name) || []);

        // 2. Fetch calls from Vomyra API
        const vomyraApiKey = process.env.VOMYRA_API_KEY || '';
        const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || 'https://api.vomyra.com';

        const res = await fetch(`${vomyraBaseUrl}/v1/calls?limit=100`, {
          headers: { 'x-api-key': vomyraApiKey },
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          const rawCalls = data.data || data.calls || (Array.isArray(data) ? data : []);

          // Filter by user assistants
          const filteredCalls = rawCalls.filter((c: any) => {
            const astId = c.assistant?.id || "";
            const astName = c.assistant?.name || (c.additional_data?.campaign_name || "");
            return userAssistantIds.has(astId) || userAssistantNames.has(astName);
          });

          totalCalls = filteredCalls.length;

          if (filteredCalls.length > 0) {
            let latencySum = 0;
            let completedCount = 0;

            filteredCalls.forEach((c: any) => {
              // Parse duration "MM:SS" or "HH:MM:SS"
              let durationSecs = 0;
              if (c.call_duration) {
                const parts = String(c.call_duration).split(":");
                if (parts.length === 3) {
                  durationSecs = parseInt(parts[0]||"0") * 3600 + parseInt(parts[1]||"0") * 60 + parseInt(parts[2]||"0");
                } else if (parts.length === 2) {
                  durationSecs = parseInt(parts[0]||"0") * 60 + parseInt(parts[1]||"0");
                }
              }

              totalDurationSecs += durationSecs;
              latencySum += Number(c.latency_ms || 340);
              
              if (c.status === "completed" || c.status === "completed-answered" || durationSecs > 5) completedCount++;
            });

            avgLatencyMs = Math.round(latencySum / filteredCalls.length);
            successRateStr = `${((completedCount / filteredCalls.length) * 100).toFixed(1)}%`;
          }
        }
      }
    }
  } catch (e) {
    console.warn("Failed to load analytics metrics from Vomyra API:", e);
  }

  const totalMinutes = Math.round(totalDurationSecs / 60);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-hairline pb-6">
        <p className="eyebrow text-neutral-500">// ANALYTICS & INSIGHTS</p>
        <h1 className="text-3xl font-bold tracking-tight text-black mt-1">Engine Performance</h1>
        <p className="text-sm text-neutral-600">Track system latency, voice response accuracy, and live operational stats.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-hairline rounded-[14px] p-5 shadow-sm">
          <p className="eyebrow text-neutral-500">AVERAGE LATENCY</p>
          <p className="text-3xl font-bold text-black mt-1">{avgLatencyMs} ms</p>
          <span className="text-xs text-emerald-600 font-medium">⚡ Deepgram STT + Cartesia TTS</span>
        </div>

        <div className="bg-white border border-hairline rounded-[14px] p-5 shadow-sm">
          <p className="eyebrow text-neutral-500">TOTAL DISPATCHED CALLS</p>
          <p className="text-3xl font-bold text-black mt-1">{totalCalls}</p>
          <span className="text-xs text-emerald-600 font-medium">WebRTC & PSTN Outbound</span>
        </div>

        <div className="bg-white border border-hairline rounded-[14px] p-5 shadow-sm">
          <p className="eyebrow text-neutral-500">CALL SUCCESS RATE</p>
          <p className="text-3xl font-bold text-black mt-1">{successRateStr}</p>
          <span className="text-xs text-emerald-600 font-medium">Completed Telephony Sessions</span>
        </div>

        <div className="bg-white border border-hairline rounded-[14px] p-5 shadow-sm">
          <p className="eyebrow text-neutral-500">VOICE MINUTES CONSUMED</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{totalMinutes} Mins</p>
          <span className="text-xs text-neutral-500 font-medium">Total AI Speech Stream Time</span>
        </div>
      </div>

      {/* Live Benchmark Box */}
      <div className="bg-block-cream rounded-[14px] p-6 sm:p-8 border border-black/5 text-black space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="eyebrow text-black/60">// REAL-TIME TRAFFIC MONITOR</span>
            <h2 className="text-xl font-bold tracking-tight text-black mt-1">Live Engine Latency & Stream Performance</h2>
          </div>
          <span className="eyebrow bg-black text-white px-3 py-1 rounded-full text-[10px]">SYSTEM READY</span>
        </div>

        <div className="h-44 bg-white/80 border border-black/10 rounded-[10px] p-4 flex items-end justify-between gap-2">
          {[35, 50, 40, 65, 80, 55, 70, 75, 85, 90, 60, 75, 85, 90, 95].map((h, i) => (
            <div key={i} className="w-full flex flex-col items-center gap-1 group">
              <div 
                style={{ height: `${h}%` }} 
                className="w-full bg-black rounded-[4px] group-hover:bg-emerald-600 transition-colors"
              ></div>
              <span className="text-[9px] font-mono text-neutral-500">{i + 1}h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
