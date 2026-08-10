import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Filter, Download, Play } from "lucide-react";
import CallsClient from "./CallsClient";

export const dynamic = "force-dynamic";

export default async function CallLogsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let assistants: Array<{ id: string; name: string }> = [];

  try {
    const { data: dbAssistants } = await adminClient
      .from("assistants")
      .select("id, name")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (dbAssistants && dbAssistants.length > 0) {
      assistants = dbAssistants.map((a: any) => ({ id: a.id, name: a.name }));
    }
  } catch (e) {
    console.warn("Failed to fetch assistants for calls page:", e);
  }

  let realCalls: Array<{
    id: string;
    assistant: string;
    assistantId?: string;
    number: string;
    duration: string;
    latency: string;
    status: string;
    cost: string;
    time: string;
    transcript: string;
  }> = [];

  let totalDispatchedCount = 0;
  let totalDurationSum = 0;
  let totalLatencySum = 0;

  try {
    const { data: dbCalls, count } = await adminClient
      .from("call_logs")
      .select("id, assistant_id, phone_number, duration_seconds, latency_ms, status, transcript, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(50);

    totalDispatchedCount = count || (dbCalls?.length || 0);

    if (dbCalls && dbCalls.length > 0) {
      dbCalls.forEach((c: any) => {
        totalDurationSum += Number(c.duration_seconds || 0);
        totalLatencySum += Number(c.latency_ms || 340);
      });

      const assistantMap = new Map(assistants.map((a) => [a.id, a.name]));

      realCalls = dbCalls.map((c: any) => {
        const astName = assistantMap.get(c.assistant_id) || "AI Voice Agent";
        const durSecs = c.duration_seconds || 0;
        const mins = Math.floor(durSecs / 60);
        const secs = durSecs % 60;
        const durStr = `${mins}m ${secs}s`;
        const latStr = `${c.latency_ms || 350}ms`;
        const createdAt = new Date(c.created_at || Date.now());
        const timeAgo = createdAt.toLocaleDateString();

        return {
          id: c.id ? `call_${String(c.id).substring(0, 8)}` : `call_${Math.random().toString(36).substring(2, 10)}`,
          assistant: astName,
          assistantId: c.assistant_id,
          number: c.phone_number || "Direct WebRTC Call",
          duration: durStr,
          latency: latStr,
          status: c.status || "completed",
          cost: `₹${(durSecs * 0.05).toFixed(2)}`,
          time: timeAgo,
          transcript: c.transcript || "No transcript recorded for this call."
        };
      });
    }
  } catch (e) {
    console.warn("Failed to fetch call_logs from DB:", e);
  }

  const avgDurationFormatted = totalDispatchedCount > 0 
    ? `${Math.floor((totalDurationSum / totalDispatchedCount) / 60)}m ${Math.floor((totalDurationSum / totalDispatchedCount) % 60)}s`
    : "0m 0s";

  const avgLatencyFormatted = totalDispatchedCount > 0 
    ? `${Math.round(totalLatencySum / totalDispatchedCount)}ms`
    : "< 400ms";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="eyebrow text-neutral-500">// TELEPHONY LOGS & TRANSCRIPTS</p>
          <h1 className="text-3xl font-bold tracking-tight text-black mt-1">Call Records</h1>
          <p className="text-sm text-neutral-600">Inspect real-time conversation transcripts, audio playback, and latency benchmarks.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-pill-secondary rounded-[10px] text-xs px-4 py-2">
            <Filter className="w-3.5 h-3.5" />
            Filter Calls
          </button>
          <button className="btn-pill-secondary rounded-[10px] text-xs px-4 py-2">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-block-lime rounded-[14px] p-5 text-black border border-black/5">
          <p className="eyebrow text-black/70">TOTAL DISPATCHED</p>
          <p className="text-3xl font-bold mt-2">{totalDispatchedCount} Calls</p>
          <p className="text-xs text-black/70 mt-1">Connected via SIP & WebRTC</p>
        </div>

        <div className="bg-block-lilac rounded-[14px] p-5 text-black border border-black/5">
          <p className="eyebrow text-black/70">AVERAGE DURATION</p>
          <p className="text-3xl font-bold mt-2">{avgDurationFormatted}</p>
          <p className="text-xs text-black/70 mt-1">Live call retention</p>
        </div>

        <div className="bg-block-mint rounded-[14px] p-5 text-black border border-black/5">
          <p className="eyebrow text-black/70">AVG VOICE LATENCY</p>
          <p className="text-3xl font-bold mt-2">{avgLatencyFormatted}</p>
          <p className="text-xs text-black/70 mt-1">Cartesia Neural STT + TTS</p>
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-white border border-hairline rounded-[14px] overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-hairline flex items-center justify-between bg-surface-soft/40">
          <h2 className="text-base font-bold text-black">Recent Voice Conversations</h2>
          <span className="eyebrow text-neutral-500 bg-white px-3 py-1 rounded-full border border-hairline text-[10px]">
            {realCalls.length} RECORDED CALLS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft text-black/70">
                <th className="py-3 px-5 eyebrow text-[11px]">CALL ID</th>
                <th className="py-3 px-5 eyebrow text-[11px]">ASSISTANT</th>
                <th className="py-3 px-5 eyebrow text-[11px]">PHONE NUMBER</th>
                <th className="py-3 px-5 eyebrow text-[11px]">DURATION</th>
                <th className="py-3 px-5 eyebrow text-[11px]">LATENCY</th>
                <th className="py-3 px-5 eyebrow text-[11px]">TRANSCRIPT SNIPPET</th>
                <th className="py-3 px-5 eyebrow text-[11px] text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline text-xs">
              {realCalls.map((c) => (
                <tr key={c.id} className="hover:bg-surface-soft/60 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-neutral-600 font-semibold">{c.id}</td>
                  <td className="py-3.5 px-5 font-bold text-black">{c.assistant}</td>
                  <td className="py-3.5 px-5 font-mono text-neutral-700">{c.number}</td>
                  <td className="py-3.5 px-5 font-medium">{c.duration}</td>
                  <td className="py-3.5 px-5 font-mono text-emerald-600 font-semibold">{c.latency}</td>
                  <td className="py-3.5 px-5 text-neutral-600 max-w-xs truncate">{c.transcript}</td>
                  <td className="py-3.5 px-5 text-right">
                    <button className="btn-pill-secondary rounded-[8px] text-[11px] px-3 py-1.5 inline-flex items-center gap-1">
                      <Play className="w-3 h-3 text-emerald-600" />
                      Listen
                    </button>
                  </td>
                </tr>
              ))}

              {realCalls.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 bg-white">
                    <p className="font-semibold text-black">No call records found</p>
                    <p className="text-xs text-neutral-500 mt-1">Start an in-browser web call or trigger a PSTN call from the Assistants page.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
