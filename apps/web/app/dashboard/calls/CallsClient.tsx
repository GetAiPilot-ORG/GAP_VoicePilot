"use client";

import React, { useState } from "react";
import { PhoneCall, Play, FileText, Download, Filter, Clock, Mic, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import AssistantTestModal from "@/components/AssistantTestModal";

interface CallItem {
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
}

interface CallsClientProps {
  initialCalls: CallItem[];
  assistants: Array<{ id: string; name: string }>;
}

export default function CallsClient({ initialCalls, assistants }: CallsClientProps) {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<{ id: string; name: string }>(
    assistants[0] || { id: "ast_default", name: "Support Pilot Pro" }
  );

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
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="btn-pill-primary rounded-[10px] text-xs px-4 py-2 shadow-sm flex items-center gap-2 hover:scale-[1.02] transition-transform"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Quick Test Call
          </button>
          <button className="btn-pill-secondary rounded-[10px] text-xs px-4 py-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Filter Calls
          </button>
          <button className="btn-pill-secondary rounded-[10px] text-xs px-4 py-2 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-block-lime rounded-[14px] p-5 text-black border border-black/5">
          <p className="eyebrow text-black/70">TOTAL DISPATCHED</p>
          <p className="text-3xl font-bold mt-2">1,248 Calls</p>
          <p className="text-xs text-black/70 mt-1">100% connected via SIP</p>
        </div>

        <div className="bg-block-lilac rounded-[14px] p-5 text-black border border-black/5">
          <p className="eyebrow text-black/70">AVERAGE DURATION</p>
          <p className="text-3xl font-bold mt-2">2m 14s</p>
          <p className="text-xs text-black/70 mt-1">High conversion retention</p>
        </div>

        <div className="bg-block-mint rounded-[14px] p-5 text-black border border-black/5">
          <p className="eyebrow text-black/70">AVG VOICE LATENCY</p>
          <p className="text-3xl font-bold mt-2">340ms</p>
          <p className="text-xs text-black/70 mt-1">Cartesia Neural STT + TTS</p>
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-white border border-hairline rounded-[14px] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-hairline flex items-center justify-between bg-surface-soft/40">
          <h2 className="text-base font-bold text-black">Recent Voice Conversations</h2>
          <span className="eyebrow text-neutral-500 bg-white px-3 py-1 rounded-full border border-hairline text-[10px]">
            {initialCalls.length} RECENT CALLS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
              {initialCalls.map((c) => (
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Call Modal */}
      {selectedAssistant && (
        <AssistantTestModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          assistant={{
            id: selectedAssistant.id,
            name: selectedAssistant.name
          }}
        />
      )}
    </div>
  );
}
