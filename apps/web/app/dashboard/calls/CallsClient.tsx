"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  PhoneCall,
  Play,
  Pause,
  FileText,
  Download,
  Filter,
  Clock,
  Calendar,
  Mic,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  Volume2,
  VolumeX,
  Sparkles,
  PhoneForwarded,
  X,
  Bot,
  User,
  Activity,
  Loader2,
  ArrowUpRight,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Tag,
  HelpCircle,
  PhoneOff
} from "lucide-react";
import AssistantTestModal from "@/components/AssistantTestModal";
import { fetchCallDetailsAction, fetchCallRecordingAction } from "@/app/actions/calls";

export interface TranscriptMessage {
  role: string;
  content: string;
  timestamp?: string;
}

export interface CallItem {
  id: string;
  assistant: string;
  assistantId: string;
  customerNumber: string;
  callerName: string;
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
  const [calls, setCalls] = useState<CallItem[]>(initialCalls);
  const [selectedCall, setSelectedCall] = useState<CallItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSummaryCopied, setIsSummaryCopied] = useState(false);
  const [isTranscriptCopied, setIsTranscriptCopied] = useState(false);

  // Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeRecordingUrl, setActiveRecordingUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [activePlayingIndex, setActivePlayingIndex] = useState<number | null>(null);
  const [playbackMode, setPlaybackMode] = useState<"carrier_stream" | "neural_dialogue">("neural_dialogue");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  const [selectedAssistant] = useState<{ id: string; name: string }>(
    assistants[0] || { id: "ast_default", name: "Voice Assistant" }
  );

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      // Preload available voices
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Restore client-side custom dispositions
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        setCalls((prev) =>
          prev.map((c) => {
            const saved = localStorage.getItem(`gap_call_outcome_${c.id}`);
            return saved ? { ...c, outcome: saved } : c;
          })
        );
      }
    } catch (e) {}
  }, []);

  const totalCalls = calls.length;
  const completedCalls = calls.filter((c) => c.status === "completed" || c.durationSeconds > 0).length;
  const noAnswerCalls = calls.filter((c) => c.status === "no-answer" || c.durationSeconds === 0).length;

  const handleUpdateOutcome = (newOutcome: string) => {
    if (!selectedCall) return;

    setSelectedCall((prev) => (prev ? { ...prev, outcome: newOutcome } : null));

    setCalls((prevCalls) =>
      prevCalls.map((c) => (c.id === selectedCall.id ? { ...c, outcome: newOutcome } : c))
    );

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(`gap_call_outcome_${selectedCall.id}`, newOutcome);
      }
    } catch (e) {}
  };

  const handleOpenCallDetail = async (call: CallItem) => {
    const savedOutcome = typeof window !== "undefined" ? localStorage.getItem(`gap_call_outcome_${call.id}`) : null;
    const effectiveCall = savedOutcome ? { ...call, outcome: savedOutcome } : call;

    setSelectedCall(effectiveCall);
    setIsDetailModalOpen(true);
    setIsPlayingAudio(false);
    isPlayingRef.current = false;
    setActivePlayingIndex(null);
    setCurrentTime(0);
    setAudioError(null);
    setActiveRecordingUrl(call.recordingUrl || null);

    // Fetch full details, recording URL, and complete transcripts live from Vomyra API
    if (call.id) {
      setIsLoadingAudio(true);
      try {
        const res = await fetchCallDetailsAction(call.id);
        if (res.success) {
          if (res.recordingUrl) {
            setActiveRecordingUrl(res.recordingUrl);
          }
          setSelectedCall((prev) => {
            if (!prev || prev.id !== call.id) return prev;
            return {
              ...prev,
              recordingUrl: res.recordingUrl || prev.recordingUrl,
              transcriptMessages: res.transcriptMessages && res.transcriptMessages.length > 0 ? res.transcriptMessages : prev.transcriptMessages,
              summary: res.summary || prev.summary
            };
          });
        }
      } catch (e) { } finally {
        setIsLoadingAudio(false);
      }
    }
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setIsSummaryCopied(false);
    setIsTranscriptCopied(false);
    isPlayingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlayingAudio(false);
    setActivePlayingIndex(null);
  };

  // Natural Neural Voice Matcher
  const getNaturalVoice = (isAssistant: boolean, text: string): SpeechSynthesisVoice | null => {
    if (!synthRef.current) return null;
    const voices = synthRef.current.getVoices();
    if (!voices || voices.length === 0) return null;

    const isHindi = /[\u0900-\u097F]/.test(text);

    if (isHindi) {
      // 1. Hindi Natural Voices
      const hindiVoices = voices.filter(v =>
        v.lang.toLowerCase().startsWith("hi") ||
        v.name.toLowerCase().includes("hindi") ||
        v.name.toLowerCase().includes("swara") ||
        v.name.toLowerCase().includes("madhur")
      );

      if (hindiVoices.length > 0) {
        if (isAssistant) {
          // Prefer Female / Natural Assistant Voice
          const female = hindiVoices.find(v => v.name.toLowerCase().includes("swara") || v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("google"));
          return female || hindiVoices[0] || null;
        } else {
          // Prefer Male / Alternate Caller Voice
          const male = hindiVoices.find(v => v.name.toLowerCase().includes("madhur") || v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("hemant"));
          return male || hindiVoices[hindiVoices.length - 1] || null;
        }
      }
    }

    // 2. Indian English / Global Natural Voices
    const indianEnglish = voices.filter(v => v.lang.toLowerCase().includes("en-in") || v.name.toLowerCase().includes("india"));
    if (indianEnglish.length > 0) {
      if (isAssistant) {
        const female = indianEnglish.find(v => v.name.toLowerCase().includes("neerja") || v.name.toLowerCase().includes("female"));
        return female || indianEnglish[0] || null;
      } else {
        const male = indianEnglish.find(v => v.name.toLowerCase().includes("prabhat") || v.name.toLowerCase().includes("male"));
        return male || indianEnglish[indianEnglish.length - 1] || null;
      }
    }

    // 3. Fallback: Any Natural/Online voice
    const naturalVoices = voices.filter(v => v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("online"));
    if (naturalVoices.length > 0) {
      return isAssistant ? (naturalVoices[0] || null) : (naturalVoices[naturalVoices.length - 1] || null);
    }

    return voices[0] || null;
  };

  // Play Turn-by-Turn Dialogue Sequentially
  const playDialogueTurns = async (messages: TranscriptMessage[], startIndex: number = 0) => {
    if (!synthRef.current || messages.length === 0) return;

    isPlayingRef.current = true;
    setIsPlayingAudio(true);
    setPlaybackMode("neural_dialogue");

    for (let i = startIndex; i < messages.length; i++) {
      if (!isPlayingRef.current) break;

      const msg = messages[i];
      if (!msg || !msg.content || !msg.content.trim()) continue;

      // Filter out raw tool call logs from spoken audio
      if (msg.role === "tool" || msg.role === "system" || msg.content.startsWith("Tool:")) {
        continue;
      }

      setActivePlayingIndex(i);
      setCurrentTime(i + 1);

      await new Promise<void>((resolve) => {
        if (!isPlayingRef.current) {
          resolve();
          return;
        }

        synthRef.current!.cancel();
        const utterance = new SpeechSynthesisUtterance(msg.content);
        const voice = getNaturalVoice(msg.role === "assistant", msg.content);
        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        }

        utterance.rate = msg.role === "assistant" ? 0.98 : 1.02; // Natural conversational cadence
        utterance.pitch = msg.role === "assistant" ? 1.05 : 0.95; // Distinct pitch separation

        utterance.onend = () => {
          // Add natural conversational pause between turns (350ms)
          setTimeout(() => resolve(), 350);
        };

        utterance.onerror = () => {
          resolve();
        };

        synthRef.current!.speak(utterance);
      });
    }

    if (isPlayingRef.current) {
      setIsPlayingAudio(false);
      isPlayingRef.current = false;
      setActivePlayingIndex(null);
    }
  };

  const togglePlayAudio = async () => {
    if (isPlayingAudio) {
      isPlayingRef.current = false;
      if (audioRef.current) audioRef.current.pause();
      if (synthRef.current) synthRef.current.cancel();
      setIsPlayingAudio(false);
      setActivePlayingIndex(null);
      return;
    }

    setAudioError(null);

    // Option 1 Path A: Direct Carrier HTTP Audio Stream
    if (activeRecordingUrl && activeRecordingUrl.startsWith("http") && audioRef.current) {
      try {
        setPlaybackMode("carrier_stream");
        audioRef.current.src = activeRecordingUrl;
        await audioRef.current.play();
        setIsPlayingAudio(true);
        isPlayingRef.current = true;
        return;
      } catch (e: any) {
        console.warn("Carrier stream error, smoothly transitioning to Neural Dialogue:", e.message);
      }
    }

    // Option 1 Path B: High-Fidelity Neural Dialogue Playback
    if (selectedCall?.transcriptMessages && selectedCall.transcriptMessages.length > 0) {
      setDuration(selectedCall.transcriptMessages.length);
      await playDialogueTurns(selectedCall.transcriptMessages, 0);
      return;
    }

    // Fallback if summary exists
    if (selectedCall?.summary && synthRef.current && !selectedCall.summary.toLowerCase().includes("not answered") && !selectedCall.summary.toLowerCase().includes("missed")) {
      isPlayingRef.current = true;
      setIsPlayingAudio(true);
      const utterance = new SpeechSynthesisUtterance(`Call Summary: ${selectedCall.summary}`);
      const voice = getNaturalVoice(true, selectedCall.summary);
      if (voice) utterance.voice = voice;
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      synthRef.current.speak(utterance);
      return;
    }

    if (selectedCall && (selectedCall.durationSeconds === 0 || selectedCall.status === "no-answer" || selectedCall.status === "failed")) {
      setAudioError("This call was not connected/answered (0s duration), so no voice recording was generated.");
    } else {
      setAudioError("Call audio stream is processing or unavailable.");
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const renderFormattedSummary = (summaryText: string) => {
    if (!summaryText) {
      return <p className="text-xs text-neutral-400 italic">No summary recorded for this call.</p>;
    }

    const lines = summaryText.split("\n").filter((l) => l.trim().length > 0);

    return (
      <div className="space-y-2.5">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();

          // Check if line is a title header like *Call Summary for ...* or # Title
          const isHeader =
            (/^(\*|\*\*|#+)\s*Call Summary/i.test(trimmed) && trimmed.endsWith("*")) ||
            /^#+\s+/i.test(trimmed);

          if (isHeader) {
            const cleanTitle = trimmed.replace(/^[\*#\s]+|[\*#\s]+$/g, "");
            return (
              <div key={lIdx} className="flex items-center gap-2 pb-1.5 border-b border-emerald-500/15 mb-1">
                <span className="font-semibold text-neutral-900 text-[13px] tracking-tight">{cleanTitle}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AI Synthesis
                </span>
              </div>
            );
          }

          // Check if line is a bullet point
          const isBullet = /^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed);
          const contentText = trimmed.replace(/^([-*•]|\d+\.)\s+/, "");

          const renderTokens = (str: string) => {
            const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|₹\s?\d+(?:,\d+)*(?:\.\d+)?|\$\s?\d+(?:,\d+)*(?:\.\d+)?|\(?\+?\d{10,13}\)?)/g);

            return parts.map((part, pIdx) => {
              if (!part) return null;

              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={pIdx} className="font-semibold text-neutral-900">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith("*") && part.endsWith("*")) {
                return (
                  <strong key={pIdx} className="font-semibold text-neutral-900">
                    {part.slice(1, -1)}
                  </strong>
                );
              }
              if (/^(₹|\$)/.test(part)) {
                return (
                  <span
                    key={pIdx}
                    className="inline-flex items-center font-semibold text-emerald-700 bg-emerald-100/80 border border-emerald-200/80 px-1.5 py-0.2 rounded text-[11px] font-mono mx-0.5"
                  >
                    {part}
                  </span>
                );
              }
              if (/^\(?\+?\d{10,13}\)?$/.test(part.trim())) {
                return (
                  <span
                    key={pIdx}
                    className="font-mono font-medium text-neutral-800 bg-neutral-100 border border-neutral-200 px-1.5 py-0.2 rounded text-[11px] mx-0.5"
                  >
                    {part}
                  </span>
                );
              }

              return <span key={pIdx}>{part}</span>;
            });
          };

          if (isBullet) {
            return (
              <div key={lIdx} className="flex items-start gap-2 text-xs text-neutral-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>{renderTokens(contentText)}</div>
              </div>
            );
          }

          return (
            <p key={lIdx} className="text-xs text-neutral-700 leading-relaxed font-normal">
              {renderTokens(trimmed)}
            </p>
          );
        })}
      </div>
    );
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
          <p className="text-xs text-black/70 mt-1">Direct via VoicePilot Telephony Pipeline</p>
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
                <th className="py-3 px-4 eyebrow text-[11px] w-36 whitespace-nowrap">CALL TIME</th>
                <th className="py-3 px-4 eyebrow text-[11px] w-36 whitespace-nowrap">CUSTOMER NUMBER</th>
                <th className="py-3 px-4 eyebrow text-[11px]">ASSIGNED NUMBER</th>
                <th className="py-3 px-4 eyebrow text-[11px]">DURATION</th>
                <th className="py-3 px-4 eyebrow text-[11px]">STATUS</th>
                <th className="py-3 px-4 eyebrow text-[11px]">OUTCOME</th>
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
                  <td className="py-3.5 px-4 text-neutral-700 w-36 whitespace-nowrap">{c.time}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-black w-36 whitespace-nowrap">{c.customerNumber}</td>
                  <td className="py-3.5 px-4 font-mono text-neutral-500">{c.assignedNumber}</td>
                  <td className="py-3.5 px-4 font-medium">{c.duration}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.status === "completed"
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
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                        c.outcome === "POSITIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : c.outcome === "NEUTRAL"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : c.outcome === "NEGATIVE"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          c.outcome === "POSITIVE"
                            ? "bg-emerald-500"
                            : c.outcome === "NEUTRAL"
                              ? "bg-amber-500"
                              : c.outcome === "NEGATIVE"
                                ? "bg-rose-500"
                                : "bg-neutral-400"
                        }`}
                      />
                      {c.outcome}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-neutral-600">
                    {c.callType === "whatsapp" ? (
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-[6px] border border-emerald-200 font-mono text-[10px] font-bold inline-flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        WhatsApp
                      </span>
                    ) : (
                      <span className="bg-surface-soft px-2 py-1 rounded-[6px] border border-hairline font-mono text-[10px]">
                        {c.direction}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCallDetail(c);
                        }}
                        className="btn-pill-primary rounded-[8px] text-[11px] px-3 py-1.5 inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Inspect Transcript
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
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase transition-colors ${
                      selectedCall.outcome === "POSITIVE"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300/80"
                        : selectedCall.outcome === "NEUTRAL"
                          ? "bg-amber-100 text-amber-800 border border-amber-300/80"
                          : selectedCall.outcome === "NEGATIVE"
                            ? "bg-rose-100 text-rose-800 border border-rose-300/80"
                            : "bg-neutral-100 text-neutral-700 border border-neutral-300/80"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedCall.outcome === "POSITIVE"
                          ? "bg-emerald-600"
                          : selectedCall.outcome === "NEUTRAL"
                            ? "bg-amber-500"
                            : selectedCall.outcome === "NEGATIVE"
                              ? "bg-rose-600"
                              : "bg-neutral-500"
                      }`}
                    />
                    {selectedCall.outcome}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{selectedCall.time} • Assistant: {selectedCall.assistant}</p>
              </div>

              <button
                onClick={handleCloseDetail}
                className="p-1.5 rounded-full text-neutral-400 hover:text-black hover:bg-surface-soft transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Audio elements and player bar removed as requested */}

            {/* AI Summary Card (Executive Redesign & Entity Highlighting) */}
            <div className="rounded-[16px] bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/30 border border-emerald-500/25 p-4 shadow-xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-neutral-900 tracking-tight">AI WhatsApp & Call Summary</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-300/40 px-2 py-0.5 rounded-full">
                      Live Synthesis
                    </span>
                  </div>
                </div>

                {selectedCall.summary && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCall.summary);
                      setIsSummaryCopied(true);
                      setTimeout(() => setIsSummaryCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-white border border-neutral-200 text-[11px] font-medium text-neutral-600 hover:text-black hover:border-neutral-300 hover:bg-neutral-50 transition-all shadow-2xs"
                    title="Copy summary to clipboard"
                  >
                    {isSummaryCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-neutral-400" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="bg-white/90 backdrop-blur-xs rounded-[12px] p-3.5 border border-emerald-500/15 shadow-2xs relative z-10 font-sans">
                {renderFormattedSummary(selectedCall.summary)}
              </div>
            </div>

            {/* Turn-by-Turn Transcription Messages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  Turn-by-Turn Transcription
                </h4>

                {selectedCall.transcriptMessages && selectedCall.transcriptMessages.length > 0 && (
                  <button
                    onClick={() => {
                      const text = selectedCall.transcriptMessages
                        .map((m) => `${m.role === "assistant" ? selectedCall.assistant : "Customer"}: ${m.content}`)
                        .join("\n\n");
                      navigator.clipboard.writeText(text);
                      setIsTranscriptCopied(true);
                      setTimeout(() => setIsTranscriptCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    {isTranscriptCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">Copied Transcript</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Transcript</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="border border-hairline rounded-[16px] p-4 bg-neutral-50/60 max-h-72 overflow-y-auto space-y-3 scrollbar-thin">
                {selectedCall.transcriptMessages.length > 0 ? (
                  selectedCall.transcriptMessages.map((msg, idx) => {
                    const trimmed = (msg.content || "").trim();
                    let metadataObj: any = null;
                    if (
                      trimmed.startsWith("{") &&
                      trimmed.endsWith("}") &&
                      (trimmed.includes("phoneNumber") || trimmed.includes("additionalData") || trimmed.includes("customerNumber"))
                    ) {
                      try {
                        metadataObj = JSON.parse(trimmed);
                      } catch (e) {}
                    }

                    if (metadataObj) {
                      return (
                        <div key={idx} className="flex justify-center my-2">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-[11px] text-neutral-500 shadow-2xs font-sans">
                            <PhoneCall className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="font-semibold text-neutral-700">Call Initiated</span>
                            <span className="text-neutral-300">•</span>
                            <span>Lead: <strong className="text-neutral-800">{metadataObj.name || metadataObj.customer_name || "Customer"}</strong></span>
                            <span className="font-mono text-neutral-500">({metadataObj.phoneNumber || metadataObj.customerNumber || ""})</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 text-xs ${
                          msg.role === "assistant" ? "items-start" : "items-start justify-end"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div
                          className={`rounded-[14px] p-3 max-w-[80%] space-y-1 transition-all duration-300 shadow-2xs ${
                            activePlayingIndex === idx
                              ? "ring-2 ring-emerald-500 shadow-md scale-[1.01]"
                              : ""
                          } ${
                            msg.role === "assistant"
                              ? "bg-white border border-neutral-200/90 text-neutral-800"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                            <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                              {msg.role === "assistant" ? selectedCall.assistant : "Customer"}
                              {activePlayingIndex === idx && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                              )}
                            </span>
                            {msg.timestamp && <span>{msg.timestamp}</span>}
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap text-[12px]">{msg.content}</p>
                        </div>

                        {msg.role !== "assistant" && (
                          <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-neutral-500 italic p-3 text-center">
                    {selectedCall.transcript || "No transcript recorded for this call."}
                  </p>
                )}
              </div>
            </div>

            {/* Interactive Call Outcome & Sentiment Disposition */}
            <div className="rounded-[14px] bg-gradient-to-r from-surface-soft via-white to-surface-soft border border-hairline p-4 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                    Lead Disposition & Call Outcome
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500 font-medium">
                  Classify sentiment or click to override
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* POSITIVE */}
                <button
                  type="button"
                  onClick={() => handleUpdateOutcome("POSITIVE")}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
                    selectedCall.outcome === "POSITIVE"
                      ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/30 scale-[1.01]"
                      : "bg-white text-emerald-800 border border-emerald-200/90 hover:bg-emerald-50/70"
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${selectedCall.outcome === "POSITIVE" ? "text-white" : "text-emerald-600"}`} />
                  <span>Positive</span>
                </button>

                {/* NEUTRAL */}
                <button
                  type="button"
                  onClick={() => handleUpdateOutcome("NEUTRAL")}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
                    selectedCall.outcome === "NEUTRAL"
                      ? "bg-amber-500 text-white shadow-xs ring-2 ring-amber-500/30 scale-[1.01]"
                      : "bg-white text-amber-800 border border-amber-200/90 hover:bg-amber-50/70"
                  }`}
                >
                  <HelpCircle className={`w-3.5 h-3.5 ${selectedCall.outcome === "NEUTRAL" ? "text-white" : "text-amber-600"}`} />
                  <span>Neutral</span>
                </button>

                {/* NEGATIVE */}
                <button
                  type="button"
                  onClick={() => handleUpdateOutcome("NEGATIVE")}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
                    selectedCall.outcome === "NEGATIVE"
                      ? "bg-rose-600 text-white shadow-xs ring-2 ring-rose-600/30 scale-[1.01]"
                      : "bg-white text-rose-800 border border-rose-200/90 hover:bg-rose-50/70"
                  }`}
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${selectedCall.outcome === "NEGATIVE" ? "text-white" : "text-rose-600"}`} />
                  <span>Negative</span>
                </button>

                {/* MISSED / NO ANSWER */}
                <button
                  type="button"
                  onClick={() => handleUpdateOutcome("MISSED")}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
                    selectedCall.outcome === "MISSED"
                      ? "bg-neutral-800 text-white shadow-xs ring-2 ring-neutral-800/30 scale-[1.01]"
                      : "bg-white text-neutral-700 border border-neutral-200/90 hover:bg-neutral-100"
                  }`}
                >
                  <PhoneOff className={`w-3.5 h-3.5 ${selectedCall.outcome === "MISSED" ? "text-white" : "text-neutral-500"}`} />
                  <span>Missed</span>
                </button>
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
