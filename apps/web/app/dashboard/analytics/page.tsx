import { BarChart3, TrendingUp, Zap, Users, Phone, DollarSign, Activity } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-hairline pb-6">
        <p className="eyebrow text-neutral-500">// ANALYTICS & INSIGHTS</p>
        <h1 className="text-3xl font-bold tracking-tight text-black mt-1">Engine Performance</h1>
        <p className="text-sm text-neutral-600">Track system latency, voice response accuracy, and cost metrics.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-hairline rounded-[14px] p-5 shadow-sm">
          <p className="eyebrow text-neutral-500">CONVERSATION LATENCY</p>
          <p className="text-3xl font-bold text-black mt-1">340 ms</p>
          <span className="text-xs text-emerald-600 font-medium">⚡ 12% faster than target</span>
        </div>

        <div className="bg-white border border-hairline rounded-[14px] p-5 shadow-sm">
          <p className="eyebrow text-neutral-500">SPEECH RECOGNITION (STT)</p>
          <p className="text-3xl font-bold text-black mt-1">98.4%</p>
          <span className="text-xs text-emerald-600 font-medium">Deepgram Nova-2 Engine</span>
        </div>

        <div className="bg-white border border-hairline rounded-[14px] p-5 shadow-sm">
          <p className="eyebrow text-neutral-500">CALL SUCCESS RATE</p>
          <p className="text-3xl font-bold text-black mt-1">96.8%</p>
          <span className="text-xs text-emerald-600 font-medium">Outbound & Inbound Connected</span>
        </div>

        <div className="bg-white border border-hairline rounded-[14px] p-5 shadow-sm">
          <p className="eyebrow text-neutral-500">ESTIMATED COST / MIN</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">$0.032</p>
          <span className="text-xs text-neutral-500 font-medium">Cartesia + Groq Pipeline</span>
        </div>
      </div>

      {/* Visual Chart Placeholder Block */}
      <div className="bg-block-cream rounded-[14px] p-8 border border-black/5 text-black space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="eyebrow text-black/60">// REAL-TIME TRAFFIC MONITOR</span>
            <h2 className="text-xl font-bold tracking-tight text-black mt-1">Call Throughput & Concurrent Streams</h2>
          </div>
          <span className="eyebrow bg-black text-white px-3 py-1 rounded-full text-[10px]">LIVE BENCHMARK</span>
        </div>

        <div className="h-48 bg-white/70 border border-black/10 rounded-[10px] p-4 flex items-end justify-between gap-2">
          {[40, 65, 45, 80, 95, 60, 75, 85, 90, 100, 70, 85, 95, 110, 120].map((h, i) => (
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
