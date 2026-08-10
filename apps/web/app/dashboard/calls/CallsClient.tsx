"use client";

import React, { useState } from "react";
import {
  PhoneCall,
  Play,
  Pause,
  FileText,
  Download,
  Filter,
  Clock,
  Mic,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  Volume2,
  Sparkles,
  PhoneForwarded,
  X,
  Bot,
  User,
  Activity
} from "lucide-react";
import AssistantTestModal from "@/components/AssistantTestModal";

export interface TranscriptMessage {
  role: string;
  content: string;
  timestamp?: string;
}

export interface CallItem {
  id: string;
  assistant: string;
  assistantId?: string;
  customerNumber: string;
  callerName?: string;
  assignedNumber: string;
  duration: string;
  durationSeconds: number;
  latency: string;
  status: string;
  direction: string;
  callType: string;
  cost: string;
  time: string;
  recordingUrl?: string | null;
  summary: string;
  outcome: string;
  notes?: string;
  transcript: string;
  transcriptMessages: TranscriptMessage[];
}

interface CallsClientProps {
  initialCalls: CallItem[];
  assistants: Array<{ id: string; name: string }>;
}

export default function CallsClient({ initialCalls, assistants }: CallsClientProps) {
  const [calls] = useState<CallItem[]>(initialCalls);
  const [selectedCall, setSelectedCall] = useState<CallItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const [selectedAssistant] = useState<{ id: string; name: string }>(
    assistants[0] || { id: "ast_default", name: "Voice Assistant" }
  );

  const totalCalls = calls.length;
  const completedCalls = calls.filter((c) => c.status === "completed" || c.durationSeconds > 0).length;
  const noAnswerCalls = calls.filter((c) => c.status === "no-answer" || c.durationSeconds === 0).length;

  const handleOpenCallDetail = (call: CallItem) => {
    setSelectedCall(call);
    setIsDetailModalOpen(true);
    setIsPlayingAudio(false);
    setAudioProgress(0);
  };

  const togglePlayAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="eyebrow text-neutral-500">// TELEPHONY LOGS & CALL RECORDS</p>
          <h1 className="text-3xl font-bold tracking-tight text-black mt-1">Call Records</h1>
          <p className="text-sm text-neutral-600">Inspect real-time conversation transcripts, audio playback, call outcomes, and telephony metrics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="btn-pill-primary rounded-[10px] text-xs px-4 py-2 shadow-sm flex items-center gap-2 hover:scale-[1.02] transition-transform"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Quick Test Call
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-block-lime rounded-[14px] p-5 text-black border border-black/5">
          <p className="eyebrow text-black/70">TOTAL DISPATCHED</p>
          <p className="text-3xl font-bold mt-2">{totalCalls} Calls</p>
          <p className="text-xs text-black/70 mt-1">Direct via Vomyra SIP Pipeline</p>
        </div>

        <div className="bg-block-lilac rounded-[14px] p-5 text-black border border-black/5">
          <p className="eyebrow text-black/70">COMPLETED CALLS</p>
          <p className="text-3xl font-bold mt-2">{completedCalls} Calls</p>
          <p className="text-xs text-black/70 mt-1">Interactive conversations logged</p>
        </div>

        <div className="bg-block-mint rounded-[14px] p-5 text-black border border-black/5">
          <p className="eyebrow text-black/70">NO ANSWER / BUSY</p>
          <p className="text-3xl font-bold mt-2">{noAnswerCalls} Calls</p>
          <p className="text-xs text-black/70 mt-1">Filtered & scheduled for retry</p>
        </div>
      </div>

      {/* Calls Table (1:1 Vomyra Fields) */}
      <div className="bg-white border border-hairline rounded-[14px] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-hairline flex items-center justify-between bg-surface-soft/40">
          <h2 className="text-base font-bold text-black">Live Telephony Activity</h2>
          <span className="eyebrow text-neutral-500 bg-white px-3 py-1 rounded-full border border-hairline text-[10px]">
            {calls.length} TOTAL LOGS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft text-black/70">
                <th className="py-3 px-4 eyebrow text-[11px]">CALL ID</th>
                <th className="py-3 px-4 eyebrow text-[11px]">CALL TIME</th>
                <th className="py-3 px-4 eyebrow text-[11px]">CUSTOMER NUMBER</th>
                <th className="py-3 px-4 eyebrow text-[11px]">ASSIGNED NUMBER</th>
                <th className="py-3 px-4 eyebrow text-[11px]">DURATION</th>
                <th className="py-3 px-4 eyebrow text-[11px]">STATUS</th>
                <th className="py-3 px-4 eyebrow text-[11px]">DIRECTION</th>
                <th className="py-3 px-4 eyebrow text-[11px]">RECORDING & DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline text-xs">
              {calls.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => handleOpenCallDetail(c)}
                  className="hover:bg-surface-soft/60 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono text-neutral-600 font-semibold">{c.id.slice(0, 10)}...</td>
                  <td className="py-3.5 px-4 text-neutral-700">{c.time}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-black">{c.customerNumber}</td>
                  <td className="py-3.5 px-4 font-mono text-neutral-500">{c.assignedNumber}</td>
                  <td className="py-3.5 px-4 font-medium">{c.duration}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        c.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {c.status === "completed" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-neutral-600">
                    <span className="bg-surface-soft px-2 py-1 rounded-[6px] border border-hairline font-mono text-[10px]">
                      {c.direction}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCallDetail(c);
                        }}
                        className="btn-pill-primary rounded-[8px] text-[11px] px-3 py-1.5 inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Play className="w-3 h-3" />
                        Listen & Inspect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Detail & Audio Inspector Modal (1:1 Vomyra Parity) */}
      {isDetailModalOpen && selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-3xl bg-white rounded-[16px] border border-hairline p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Top Header */}
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-black">Call Details</h3>
                  <span className="font-mono text-xs bg-surface-soft border border-hairline px-2 py-0.5 rounded text-neutral-600">
                    {selectedCall.id}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    selectedCall.outcome === "POSITIVE"
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedCall.outcome === "NEGATIVE"
                      ? "bg-red-100 text-red-800"
                      : "bg-neutral-100 text-neutral-700"
                  }`}>
                    {selectedCall.outcome}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{selectedCall.time} • Assistant: {selectedCall.assistant}</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-black hover:bg-surface-soft transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Audio Recording Player Bar */}
            <div className="bg-surface-soft/80 border border-hairline rounded-[14px] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-black">Call Audio Recording</p>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      {selectedCall.recordingUrl ? selectedCall.recordingUrl.slice(0, 45) + "..." : "telephony_audio_stream.wav"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-neutral-700 bg-white border border-hairline px-2.5 py-1 rounded-[6px]">
                  {selectedCall.duration}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={togglePlayAudio}
                  className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform active:scale-95"
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                {/* Simulated Audio Waveform Bar */}
                <div className="flex-1 bg-white border border-hairline rounded-[8px] h-9 px-3 flex items-center gap-1 overflow-hidden">
                  {[40, 65, 30, 85, 95, 50, 70, 45, 90, 60, 35, 75, 80, 55, 90, 40, 70, 85, 30, 60, 95, 45, 75, 50, 80, 65, 35, 90, 55, 70].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        isPlayingAudio ? "bg-emerald-500 animate-pulse" : "bg-neutral-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="rounded-[14px] bg-block-cream border border-black/10 p-4 space-y-2">
              <div className="flex items-center gap-2 text-black font-bold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI WhatsApp & Call Summary</span>
              </div>
              <div className="text-xs text-neutral-700 whitespace-pre-line leading-relaxed bg-white/70 rounded-[10px] p-3 border border-black/5 font-sans">
                {selectedCall.summary}
              </div>
            </div>

            {/* Turn-by-Turn Transcription Messages */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Turn-by-Turn Transcription
              </h4>

              <div className="border border-hairline rounded-[14px] p-4 bg-surface-soft/40 max-h-64 overflow-y-auto space-y-3">
                {selectedCall.transcriptMessages.length > 0 ? (
                  selectedCall.transcriptMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 text-xs ${
                        msg.role === "assistant" ? "items-start" : "items-start justify-end"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`rounded-[12px] p-3 max-w-[80%] space-y-1 ${
                          msg.role === "assistant"
                            ? "bg-white border border-hairline text-neutral-800"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] opacity-70">
                          <span className="font-bold uppercase tracking-wider">
                            {msg.role === "assistant" ? selectedCall.assistant : "Customer"}
                          </span>
                          {msg.timestamp && <span>{msg.timestamp}</span>}
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      {msg.role !== "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-500 italic p-3 text-center">
                    {selectedCall.transcript || "No transcript recorded for this call."}
                  </p>
                )}
              </div>
            </div>

            {/* Call Metadata Grid (16 Vomyra Fields) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-hairline text-xs">
              <div className="bg-surface-soft p-2.5 rounded-[8px] border border-hairline">
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Customer Number</p>
                <p className="font-mono font-bold text-black mt-0.5">{selectedCall.customerNumber}</p>
              </div>
              <div className="bg-surface-soft p-2.5 rounded-[8px] border border-hairline">
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Assigned Number</p>
                <p className="font-mono font-bold text-black mt-0.5">{selectedCall.assignedNumber}</p>
              </div>
              <div className="bg-surface-soft p-2.5 rounded-[8px] border border-hairline">
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Duration & Latency</p>
                <p className="font-mono font-bold text-black mt-0.5">{selectedCall.duration} ({selectedCall.latency})</p>
              </div>
              <div className="bg-surface-soft p-2.5 rounded-[8px] border border-hairline">
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Estimated Cost</p>
                <p className="font-mono font-bold text-emerald-700 mt-0.5">{selectedCall.cost}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Test Call Modal */}
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
