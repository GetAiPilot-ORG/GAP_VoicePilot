"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  PhoneCall, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  X, 
  Send, 
  Sparkles, 
  PhoneOutgoing, 
  RefreshCw, 
  Activity, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  User, 
  Clock,
  ShieldCheck,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { triggerTestCallAction, fetchCallerNumbersAction, simulateWebAgentResponseAction } from "@/app/actions/calls";

interface AssistantTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistant: {
    id: string;
    name: string;
    provider_resource_id?: string;
    config_snapshot?: any;
    voice_name?: string;
    welcome_message?: string;
    system_prompt?: string;
  };
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  latencyMs?: number;
}

const COUNTRY_CODES = [
  { code: "+91", country: "India (IN)", flag: "🇮🇳" },
  { code: "+1", country: "United States (US)", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom (UK)", flag: "🇬🇧" },
  { code: "+971", country: "UAE (AE)", flag: "🇦🇪" },
  { code: "+61", country: "Australia (AU)", flag: "🇦🇺" },
  { code: "+65", country: "Singapore (SG)", flag: "🇸🇬" },
  { code: "+49", country: "Germany (DE)", flag: "🇩🇪" },
  { code: "+33", country: "France (FR)", flag: "🇫🇷" },
  { code: "+81", country: "Japan (JP)", flag: "🇯🇵" },
];

const PRESET_PROMPTS = [
  "Hello, what services do you provide?",
  "Can you tell me your pricing and plans?",
  "I want to book an appointment for tomorrow.",
  "Can I speak with a real human agent?",
  "What are your business opening hours?"
];

export default function AssistantTestModal({ isOpen, onClose, assistant }: AssistantTestModalProps) {
  const [activeTab, setActiveTab] = useState<"web" | "phone">("web");

  // Web Call Simulator State
  const [isWebCallActive, setIsWebCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechVolume, setSpeechVolume] = useState(0.8);
  const [textInput, setTextInput] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastLatency, setLastLatency] = useState<number | null>(null);

  // Phone Call State
  const [customerName, setCustomerName] = useState("Test User");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callerNumbers, setCallerNumbers] = useState<Array<{ id: string; phone_number: string; isAssignedToThis: boolean }>>([]);
  const [selectedCallerNumber, setSelectedCallerNumber] = useState<string>("");
  const [isDialing, setIsDialing] = useState(false);
  const [phoneCallResult, setPhoneCallResult] = useState<{
    success: boolean;
    message: string;
    callId?: string;
    details?: any;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const assistantName = assistant.name || "AI Voice Assistant";
  const welcomeMsg = assistant.welcome_message || assistant.config_snapshot?.welcome_message || "Hello! How can I help you today?";
  const systemPrompt = assistant.system_prompt || assistant.config_snapshot?.system_prompt || "";

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing, isSpeaking]);

  // Load caller numbers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCallerNumbersAction(assistant.id).then((res) => {
        if (res.success && res.numbers.length > 0) {
          setCallerNumbers(res.numbers);
          const assigned = res.numbers.find(n => n.isAssignedToThis);
          setSelectedCallerNumber(assigned?.phone_number || res.numbers[0]?.phone_number || "");
        }
      });
    }
  }, [isOpen, assistant.id]);

  // Timer for active web call
  useEffect(() => {
    if (isWebCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isWebCallActive]);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Speak text using browser speech synthesis
  const speakText = (text: string, onEnd?: () => void) => {
    if (!synthRef.current || isMuted) {
      if (onEnd) onEnd();
      return;
    }

    try {
      synthRef.current.cancel(); // Stop any previous speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = speechVolume;

      // Try selecting high-quality voice
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes("hi-IN") || v.lang.includes("en-IN") || v.name.includes("Google") || v.name.includes("Natural"));
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      synthRef.current.speak(utterance);
    } catch (e) {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    }
  };

  // Real GAP Agent ID for Web Call URL
  const rawAgentId = assistant.provider_resource_id || assistant.id || "6a7703a012df58f68ce4e600";
  const webCallUrl = `https://voice.getaipilot.in/call/${rawAgentId}`;

  // Start In-Browser Web Call - Opens GAP Dedicated Live Web Call Room
  const handleStartWebCall = () => {
    window.open(webCallUrl, "_blank", "noopener,noreferrer");
  };

  // End In-Browser Web Call
  const handleEndWebCall = () => {
    setIsWebCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  // Start Speech Recognition (Mic)
  const startSpeechRecognition = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not natively supported in this browser. Use text input.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Error starting speech recognition:", err);
      setIsListening(false);
    }
  };

  // Toggle Mic
  const handleToggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      startSpeechRecognition();
    }
  };

  // Send Message (Text or Spoken)
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || textInput).trim();
    if (!textToSend) return;

    setTextInput("");
    const startTime = performance.now();

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await simulateWebAgentResponseAction({
        assistantName,
        systemPrompt,
        welcomeMessage: welcomeMsg,
        conversationHistory: history,
        userMessage: textToSend
      });

      const latency = Math.round(performance.now() - startTime);
      setLastLatency(latency);

      const replyText = response.reply || "I understand. Is there anything else I can help you with?";

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        latencyMs: latency
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsProcessing(false);

      // Speak response out loud
      speakText(replyText, () => {
        if (isWebCallActive) {
          // Re-enable microphone after AI finishes speaking
          startSpeechRecognition();
        }
      });
    } catch (e: any) {
      setIsProcessing(false);
      const errMsg: Message = {
        id: `err_${Date.now()}`,
        role: "assistant",
        text: "I am having trouble connecting right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  // Trigger Outbound PSTN Phone Call
  const handleDispatchPhoneCall = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");
    if (!cleanNumber || cleanNumber.length < 7) {
      alert("Please enter a valid destination phone number.");
      return;
    }

    const fullRecipientNumber = cleanNumber.startsWith("+") 
      ? cleanNumber 
      : `${countryCode}${cleanNumber.replace(/^0+/, "")}`;

    setIsDialing(true);
    setPhoneCallResult(null);

    try {
      const res = await triggerTestCallAction({
        customerNumber: fullRecipientNumber,
        customerName: customerName.trim() || "Test User",
        countryCode: countryCode,
        assistantId: assistant.id,
        assignedNumber: selectedCallerNumber || undefined
      });

      if (res.success) {
        setPhoneCallResult({
          success: true,
          message: `Outbound test call dispatched to ${fullRecipientNumber}!`,
          callId: res.call?.id || res.idempotencyKey,
          details: res.call
        });
      } else {
        setPhoneCallResult({
          success: false,
          message: res.error || "Failed to dispatch test call."
        });
      }
    } catch (err: any) {
      setPhoneCallResult({
        success: false,
        message: err.message || "An unexpected error occurred while placing call."
      });
    } finally {
      setIsDialing(false);
    }
  };

  // Format call duration MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white border border-black/10 rounded-[18px] max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-black animate-scaleUp">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-hairline flex items-center justify-between bg-surface-soft/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-block-lime text-black flex items-center justify-center font-bold shadow-sm">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-black">{assistantName}</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  LIVE TESTER
                </span>
              </div>
              <p className="text-xs text-neutral-500">Test autonomous voice responses in-browser or via mobile call.</p>
            </div>
          </div>

          <button
            onClick={() => {
              handleEndWebCall();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-surface-soft text-neutral-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-hairline px-6 bg-surface-soft/20 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("web")}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "web"
                ? "border-black text-black font-bold"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            <Mic className="w-4 h-4 text-emerald-600" />
            Web Call (In-Browser Mic)
            {isWebCallActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("phone")}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "phone"
                ? "border-black text-black font-bold"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            <PhoneOutgoing className="w-4 h-4 text-block-lilac-text" />
            Phone Call (PSTN Outbound)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: WEB CALL SIMULATOR */}
          {activeTab === "web" && (
            <div className="space-y-4">
              {/* GAP Cloud Live Web Call Room Card */}
              <div className="bg-surface-soft p-4 md:p-5 rounded-[14px] border border-hairline flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-start md:items-center gap-3.5 min-w-0 flex-1 w-full">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-block-lime text-black flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Mic className="w-5 h-5 md:w-6 md:h-6" />
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col items-start text-left space-y-1.5">
                    <div className="flex items-center justify-start gap-2 flex-wrap w-full text-left">
                      <span className="font-bold text-sm text-black">
                        GAP Live Web Call Room
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        CLOUD AUDIO
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed text-left w-full">
                      Launches full-duplex WebRTC room with Deepgram STT and Cartesia Neural TTS.
                    </p>
                    <div className="flex items-center justify-start gap-1.5 text-[11px] font-mono text-neutral-500 bg-white px-2.5 py-1 rounded-[6px] border border-hairline max-w-full overflow-hidden w-fit text-left">
                      <span className="shrink-0 text-neutral-400">URL:</span>
                      <span className="text-black font-semibold truncate">{webCallUrl}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto shrink-0 pt-1 md:pt-0">
                  <button
                    onClick={handleStartWebCall}
                    className="btn-pill-primary w-full md:w-auto text-xs px-4 py-2.5 shadow-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold whitespace-nowrap"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span>Start Web Call</span>
                  </button>
                </div>
              </div>

              {/* Animated Waveform Visualizer */}
              {isWebCallActive && (
                <div className="p-3 bg-neutral-900 rounded-[12px] text-white flex items-center justify-between px-4 border border-black/10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 h-6">
                      {[40, 75, 30, 90, 60, 80, 45, 100, 50, 70, 30, 85].map((h, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-150 ${
                            isSpeaking
                              ? "bg-block-lime animate-pulse"
                              : isListening
                                ? "bg-purple-400 animate-bounce"
                                : "bg-neutral-600"
                          }`}
                          style={{
                            height: isSpeaking || isListening ? `${(h * 0.24)}px` : "4px",
                            animationDelay: `${i * 70}ms`
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-neutral-300">
                      {isSpeaking ? "TTS AUDIO ACTIVE" : isListening ? "LISTENING (MIC)" : "STANDBY"}
                    </span>
                  </div>

                  {lastLatency !== null && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-block-lime">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{lastLatency}ms latency</span>
                    </div>
                  )}
                </div>
              )}

              {/* Live Conversation Transcript Feed */}
              <div className="bg-white rounded-[14px] border border-hairline overflow-hidden flex flex-col h-[280px]">
                <div className="p-3 border-b border-hairline flex items-center justify-between bg-surface-soft/40">
                  <span className="text-xs font-bold text-black flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    Live Conversation Transcript
                  </span>

                  {messages.length > 0 && (
                    <button
                      onClick={() => setMessages([])}
                      className="text-[11px] text-neutral-400 hover:text-black flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-soft/10">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400 text-xs space-y-2">
                      <Bot className="w-8 h-8 text-neutral-300" />
                      <p>Start a web call or ask a sample question below.</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {m.role === "assistant" && (
                          <div className="w-7 h-7 rounded-full bg-block-lime text-black flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                            AI
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-[12px] max-w-[80%] text-xs leading-relaxed ${
                            m.role === "user"
                              ? "bg-black text-white rounded-tr-none shadow-xs"
                              : "bg-white border border-hairline text-neutral-900 rounded-tl-none shadow-xs"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className="font-bold text-[10px] opacity-70">
                              {m.role === "user" ? "YOU" : assistantName.toUpperCase()}
                            </span>
                            <span className="text-[9px] font-mono opacity-50">{m.timestamp}</span>
                          </div>
                          <p className="font-sans whitespace-pre-wrap">{m.text}</p>
                          {m.latencyMs && (
                            <div className="mt-1 pt-1 border-t border-black/5 flex items-center gap-1 text-[9px] font-mono text-emerald-600 font-semibold">
                              <Zap className="w-2.5 h-2.5" />
                              <span>{m.latencyMs}ms</span>
                            </div>
                          )}
                        </div>
                        {m.role === "user" && (
                          <div className="w-7 h-7 rounded-full bg-surface-soft border border-hairline text-neutral-700 flex items-center justify-center text-xs font-bold shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {isProcessing && (
                    <div className="flex gap-2.5 items-center">
                      <div className="w-7 h-7 rounded-full bg-block-lime text-black flex items-center justify-center text-xs font-bold shrink-0">
                        AI
                      </div>
                      <div className="p-2.5 bg-white border border-hairline rounded-[10px] text-xs text-neutral-500 flex items-center gap-2 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        Thinking and preparing voice stream...
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Prompt Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-2.5 border-t border-hairline bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type a message or test query..."
                    className="flex-1 px-3 py-2 text-xs rounded-[8px] bg-surface-soft border border-hairline focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="submit"
                    disabled={!textInput.trim() || isProcessing}
                    className="btn-pill-primary rounded-[8px] px-3.5 py-2 text-xs disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Preset Sample Testing Chips */}
              <div>
                <p className="text-[11px] font-semibold text-neutral-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Quick Test Queries:
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[11px] px-3 py-1.5 rounded-full bg-surface-soft hover:bg-black hover:text-white border border-hairline text-neutral-700 transition-colors text-left"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHONE CALL (PSTN OUTBOUND) */}
          {activeTab === "phone" && (
            <form onSubmit={handleDispatchPhoneCall} className="space-y-5">
              <div className="bg-block-lilac/30 border border-block-lilac rounded-[14px] p-4 text-black flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">Real-time Outbound PSTN Dialing</p>
                  <p className="text-neutral-600 leading-relaxed">
                    This triggers an actual mobile call through the SIP telecom provider using your assigned caller ID. When you pick up, <strong className="text-black">{assistantName}</strong> will speak in real-time.
                  </p>
                </div>
              </div>

              {/* Customer / Recipient Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  Customer / Recipient Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tanishk Goswami"
                  className="w-full px-4 py-2.5 text-xs font-semibold bg-surface-soft border border-hairline rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
                <p className="text-[11px] text-neutral-500">
                  Customer name passed to GAP VoicePilot for speech personalization.
                </p>
              </div>

              {/* Destination Mobile Number Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  Target Phone Number (Destination)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative w-44">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 text-xs font-semibold bg-surface-soft border border-hairline rounded-[10px] appearance-none focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>

                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210 (Mobile Number)"
                    className="flex-1 px-4 py-2.5 text-xs font-mono font-semibold bg-surface-soft border border-hairline rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black"
                    required
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Full dial format: <span className="font-mono text-black font-semibold">{countryCode} {phoneNumber || "..."}</span>
                </p>
              </div>

              {/* Caller ID (From Number) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider">
                  Caller ID (From Number)
                </label>
                <div className="relative">
                  <select
                    value={selectedCallerNumber}
                    onChange={(e) => setSelectedCallerNumber(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs font-mono font-semibold bg-surface-soft border border-hairline rounded-[10px] appearance-none focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {callerNumbers.length > 0 ? (
                      callerNumbers.map((num) => (
                        <option key={num.id} value={num.phone_number}>
                          {num.phone_number} {num.isAssignedToThis ? "★ (Assigned to this agent)" : ""}
                        </option>
                      ))
                    ) : (
                      <option value="+18005550199">+1 (800) 555-0199 (Default Test Gateway)</option>
                    )}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Select which phone number should appear on the recipient's caller ID display.
                </p>
              </div>

              {/* Status or Result Banner */}
              {phoneCallResult && (
                <div
                  className={`p-4 rounded-[12px] border text-xs flex items-start gap-3 animate-fadeIn ${
                    phoneCallResult.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  {phoneCallResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">{phoneCallResult.message}</p>
                    {phoneCallResult.callId && (
                      <p className="font-mono text-[11px] opacity-80">
                        Reference ID: {phoneCallResult.callId}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Dispatch Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isDialing}
                  className="btn-pill-primary w-full py-3 text-xs justify-center gap-2 shadow-md hover:scale-[1.01] transition-transform disabled:opacity-50"
                >
                  <PhoneCall className={`w-4 h-4 ${isDialing ? "animate-spin" : ""}`} />
                  {isDialing ? "Initiating Call & Reserving Credits..." : "Dispatch Outbound Test Call"}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-hairline bg-surface-soft/40 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Provider: <strong className="text-black font-mono">GAP VoicePilot Engine</strong></span>
          </div>

          <button
            onClick={() => {
              handleEndWebCall();
              onClose();
            }}
            className="text-neutral-600 hover:text-black font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
