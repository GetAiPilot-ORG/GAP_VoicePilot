"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { VOMYRA_CATALOG, VoiceOption } from "@/lib/catalog";
import { updateAssistantAction, toggleAssistantToolAction, generatePromptAction } from "@/app/actions/assistants";
import { getConnectorsAction } from "@/app/actions/connectors";
import { getToolCallingDefaults } from "@/lib/toolCallingDefaults";
import { Play, Pause, Volume2, Check, Wrench, Sparkles, PhoneCall, Wand2, X, Plus, Trash2, Bot, Cpu, Mic, Settings2, Copy, Share2, CheckCircle2, Settings, ExternalLink, AlertTriangle, Lock, Zap, MessageSquare, Sliders, ArrowRight, RotateCcw, Lightbulb, Bookmark } from "lucide-react";
import { AgentIntegrationsPermissions } from "@/components/connectors/AgentIntegrationsPermissions";
import { AssistantToolConfigDrawer, ToolAssignmentConfig } from "@/components/assistants/AssistantToolConfigDrawer";


const DYNAMIC_VARIABLES = [
  { tag: "{{name}}", label: "Customer Name", desc: "e.g. John Doe" },
  { tag: "{{company}}", label: "Company", desc: "e.g. Acme Corp" },
  { tag: "{{phone}}", label: "Phone", desc: "e.g. +91 98765 43210" },
  { tag: "{{date}}", label: "Date", desc: "e.g. Tomorrow" },
  { tag: "{{time}}", label: "Time", desc: "e.g. 10:30 AM" }
];

interface EditAssistantFormProps {
  assistant: {
    id: string;
    name: string;
    status: string;
    provider_resource_id?: string;
    config_snapshot?: any;
    assigned_tool_ids?: string[];
    tool_assignments?: any[];
    workspace_connectors?: any[];
  };
  workspaceTools?: Array<{ id: string; name: string; type: string; description?: string; config?: any }>;
}


type GuideLang = "en" | "hinglish";

interface GuideContextType {
  guideLang: GuideLang;
  setGuideLang: (lang: GuideLang) => void;
}

const GuideLanguageContext = React.createContext<GuideContextType>({
  guideLang: "en",
  setGuideLang: () => {},
});

export function GuideLanguageProvider({ children }: { children: React.ReactNode }) {
  const [guideLang, setGuideLangState] = React.useState<GuideLang>("en");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("gap_guide_lang") as GuideLang;
      if (saved === "en" || saved === "hinglish") {
        setGuideLangState(saved);
      }
    } catch {}
  }, []);

  const setGuideLang = (lang: GuideLang) => {
    setGuideLangState(lang);
    try {
      localStorage.setItem("gap_guide_lang", lang);
    } catch {}
  };

  return (
    <GuideLanguageContext.Provider value={{ guideLang, setGuideLang }}>
      {children}
    </GuideLanguageContext.Provider>
  );
}

export function useGuideLanguage() {
  return React.useContext(GuideLanguageContext);
}

export interface GuideTooltipProps {
  title: string;
  titleHinglish?: string;
  whatIsIt: string;
  whatToDo: string;
  whatIsItHinglish?: string;
  whatToDoHinglish?: string;
}

export function GuideTooltip({
  title,
  titleHinglish,
  whatIsIt,
  whatToDo,
  whatIsItHinglish,
  whatToDoHinglish
}: GuideTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { guideLang, setGuideLang } = useGuideLanguage();
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const isHinglish = guideLang === "hinglish";
  const displayTitle = isHinglish && titleHinglish ? titleHinglish : title;
  const displayWhatIsIt = isHinglish && whatIsItHinglish ? whatIsItHinglish : whatIsIt;
  const displayWhatToDo = isHinglish && whatToDoHinglish ? whatToDoHinglish : whatToDo;

  return (
    <span className="relative inline-flex items-center ml-1.5 shrink-0 align-middle">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label={`Guide for ${title}`}
        title="Click for simple non-technical guide"
        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all cursor-pointer select-none ${
          isOpen
            ? "bg-black text-white ring-2 ring-emerald-400 scale-110"
            : "bg-surface-soft border border-hairline text-neutral-500 hover:text-black hover:bg-neutral-200"
        }`}
      >
        i
      </button>

      {isOpen && (
        <span
          ref={popoverRef}
          className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 bottom-20 sm:bottom-full sm:mb-2 w-auto sm:w-88 max-w-[calc(100vw-32px)] p-4 bg-neutral-950 text-white rounded-2xl shadow-2xl border border-neutral-700 z-50 animate-fadeIn text-left font-sans block cursor-default"
        >
          {/* Header with Title and Language Switcher */}
          <span className="flex items-center justify-between border-b border-neutral-800 pb-2.5 mb-2.5 gap-2">
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="font-bold text-xs text-white tracking-tight truncate">{displayTitle}</span>
            </span>

            <span className="flex items-center gap-2 shrink-0">
              {/* Language Switch Toggle */}
              <span className="flex items-center bg-neutral-900 border border-neutral-700 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setGuideLang("en");
                  }}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    !isHinglish ? "bg-emerald-500 text-black shadow-xs font-bold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setGuideLang("hinglish");
                  }}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    isHinglish ? "bg-emerald-500 text-black shadow-xs font-bold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  हिंदी
                </button>
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </span>

          {/* Body Content */}
          <span className="space-y-2.5 text-[11px] leading-relaxed block">
            <span className="space-y-0.5 block">
              <span className="font-bold text-emerald-400 block text-[10px] uppercase tracking-wider font-mono">
                {isHinglish ? "💡 Ye kya hai?" : "💡 What is it?"}
              </span>
              <span className="text-neutral-200 font-medium block normal-case leading-normal">{displayWhatIsIt}</span>
            </span>

            <span className="pt-2 border-t border-neutral-800/80 space-y-0.5 block">
              <span className="font-bold text-amber-300 block text-[10px] uppercase tracking-wider font-mono">
                {isHinglish ? "🎯 Mujhe kya karna hai?" : "🎯 What should I do?"}
              </span>
              <span className="text-neutral-300 font-medium block normal-case leading-normal">{displayWhatToDo}</span>
            </span>
          </span>
        </span>
      )}
    </span>
  );
}

export function EditAssistantForm(props: EditAssistantFormProps) {
  return (
    <GuideLanguageProvider>
      <EditAssistantFormInner {...props} />
    </GuideLanguageProvider>
  );
}

function EditAssistantFormInner({ assistant, workspaceTools = [] }: EditAssistantFormProps) {
  const [activeTab, setActiveTab] = React.useState<"model" | "speech" | "voice" | "tools" | "integrations" | "advance">("model");

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Validation Errors
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [systemPromptError, setSystemPromptError] = React.useState<string | null>(null);

  const initialCfg = assistant.config_snapshot || {};
  const initialTransfer = initialCfg.transfer_call_settings || {};

  // Model state
  const [name, setName] = React.useState(assistant.name || initialCfg.name || "Untitled Assistant");
  const [aiProvider, setAiProvider] = React.useState(initialCfg.ai_provider || "openai");
  const [model, setModel] = React.useState(initialCfg.model || "gpt-4.1-mini");
  const [maxTokens, setMaxTokens] = React.useState<number>(initialCfg.max_tokens ?? 256);
  const [temperature, setTemperature] = React.useState<number>(initialCfg.temperature ?? 0.3);
  const [dynamicWelcomeEnabled, setDynamicWelcomeEnabled] = React.useState<boolean>(!!initialCfg.dynamic_welcome_enabled);
  const [welcomeMessage, setWelcomeMessage] = React.useState(initialCfg.welcome_message || "Welcome, how can I assist you?");
  const [dynamicWelcomeMessage, setDynamicWelcomeMessage] = React.useState(initialCfg.dynamic_welcome_message || "");
  const [systemPrompt, setSystemPrompt] = React.useState(initialCfg.system_prompt || "");
  const [whatsappSummaryPrompt, setWhatsappSummaryPrompt] = React.useState(initialCfg.whatsapp_summary_prompt || "Demo Call Hotel\nGenerate a clear concise brief summary of important key points discussed in conversation between user and assistant without including any details from prompt .\nSummary should in a easy to read format.\nCapture all key points that are important for follow-up conversation .\nAnd highlight questions that assistant is not able to answer but user enquired about. \nIf the conversation was incomplete, briefly summarize what was discussed by both parties.\nPhone Number should always be in numeric digits.\nIf no interaction occurred during the call, simply return: \"No conversation happened.\"");
  const [whatsappSummaryPhone, setWhatsappSummaryPhone] = React.useState(initialCfg.whatsapp_summary_phone || "");
  const [outcomePrompt, setOutcomePrompt] = React.useState(initialCfg.outcome_prompt || "You are a call impact evaluator.\n\nTask:\nAnalyze the conversation between user and assistant and determine the BUSINESS IMPACT of the call.\n\nRules:\n- Output ONLY ONE WORD\n- Choose from: POSITIVE, NEUTRAL, NEGATIVE\n- POSITIVE = business value created or progress made\n- NEUTRAL = no clear progress or loss\n- NEGATIVE = lost opportunity, failure, or harmful call");
  const [maintainContext, setMaintainContext] = React.useState<boolean>(!!initialCfg.maintain_context);

  // Modals & Transfer Call Settings
  const [isPromptModalOpen, setIsPromptModalOpen] = React.useState(false);
  const [promptTopic, setPromptTopic] = React.useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = React.useState(false);

  const [isTransferModalOpen, setIsTransferModalOpen] = React.useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = React.useState(false);
  const [excludeWhatsappSummaryNumber, setExcludeWhatsappSummaryNumber] = React.useState(!!initialTransfer.exclude_whatsapp_summary_number);
  const [countryCode, setCountryCode] = React.useState("+91");
  const [transferPhoneInput, setTransferPhoneInput] = React.useState("");
  const [transferPhoneNumbers, setTransferPhoneNumbers] = React.useState<string[]>(initialTransfer.phone_numbers || []);

  // Speech (STT) state
  const initialTrans = initialCfg.transcription || {};
  const [transcriptionProvider, setTranscriptionProvider] = React.useState(initialTrans.provider || "deepgram");
  const [transcriptionLanguage, setTranscriptionLanguage] = React.useState(initialTrans.language || "hi-IN");
  const [transcriptionMode, setTranscriptionMode] = React.useState(initialTrans.mode || "live");
  const initialDg = initialTrans.deepgram || {};
  const [dgModel, setDgModel] = React.useState(initialDg.model || "nova-2");
  const [dgUtteranceEnd, setDgUtteranceEnd] = React.useState<number>(initialDg.utterance_end_ms ?? 1000);
  const [dgEndpointing, setDgEndpointing] = React.useState<number>(initialDg.endpointing ?? 300);
  const [dgVadEvents, setDgVadEvents] = React.useState<boolean>(initialDg.vad_events ?? true);
  const [dgDiarize, setDgDiarize] = React.useState<boolean>(initialDg.diarize ?? false);

  // Voice (TTS) state
  const initialVoiceObj = typeof initialCfg.voice === "object" && initialCfg.voice !== null ? initialCfg.voice : {};
  const [voiceProvider, setVoiceProvider] = React.useState(initialCfg.voice_provider || initialVoiceObj.provider || "azure");
  const [voiceName, setVoiceName] = React.useState(initialVoiceObj.name || initialCfg.voice || "hi-IN-AartiNeural");
  const [voiceLanguage, setVoiceLanguage] = React.useState(initialVoiceObj.language || "hi-IN");
  const [voiceSpeed, setVoiceSpeed] = React.useState<number>(initialVoiceObj.speed ?? 1.0);
  const [voiceStability, setVoiceStability] = React.useState<number>(initialVoiceObj.stability ?? 0.75);
  const [voiceSimilarityBoost, setVoiceSimilarityBoost] = React.useState<number>(initialVoiceObj.similarity_boost ?? 0.8);
  const [ttsModel, setTtsModel] = React.useState(initialVoiceObj.tts_model || "");
  const [voiceInstructions, setVoiceInstructions] = React.useState(initialVoiceObj.instructions || "Indian Accent");

  // Advance Settings state (1:1 Vomyra Parity)
  const [maximumDuration, setMaximumDuration] = React.useState<number>(initialCfg.maximum_duration ?? 600);
  const [silenceTimeout, setSilenceTimeout] = React.useState<number>(initialCfg.silence_timeout ?? 12);
  const [inactivityMessage, setInactivityMessage] = React.useState(initialCfg.inactivity_message || "Are you still there?");
  const [timeoutEndMessage, setTimeoutEndMessage] = React.useState(initialCfg.timeout_end_message || "Thank you for calling. Goodbye!");
  const [timeoutEndMessageDelay, setTimeoutEndMessageDelay] = React.useState<number>(initialCfg.timeout_end_message_delay ?? 5);
  const [fillerWordsEnabled, setFillerWordsEnabled] = React.useState<boolean>(initialCfg.filler_words_enabled ?? true);
  const [fillerWords, setFillerWords] = React.useState(initialCfg.filler_words || "हाँ, ठीक है जी, ठीक है, बिलकुल, जी, हाँ जी, अच्छा जी, अच्छा, हाँ ठीक hai");
  const [callDetailsWebhookEnabled, setCallDetailsWebhookEnabled] = React.useState<boolean>(!!initialCfg.call_details_webhook_enabled);
  const [callDetailsWebhookUrl, setCallDetailsWebhookUrl] = React.useState(initialCfg.call_details_webhook_url || "");

  // Audio Preview State
  const [playingVoiceId, setPlayingVoiceId] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handlePlayVoice = (voice: VoiceOption) => {
    if (playingVoiceId === voice.name) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingVoiceId(null);
      return;
    }

    if (voice.preview_url) {
      if (audioRef.current) {
        audioRef.current.src = voice.preview_url;
        audioRef.current.play().catch((err) => console.warn("Failed to play preview audio:", err));
      }
      setPlayingVoiceId(voice.name);
      if (audioRef.current) {
        audioRef.current.onended = () => {
          setPlayingVoiceId(null);
        };
      }
    } else {
      setPlayingVoiceId(voice.name);
      setTimeout(() => {
        setPlayingVoiceId(null);
      }, 2000);
    }
  };

  // Tools state & Configuration Drawer
  const [assignedToolIds, setAssignedToolIds] = React.useState<string[]>(assistant.assigned_tool_ids || []);
  const [workspaceConnectors, setWorkspaceConnectors] = React.useState<any[]>(assistant.workspace_connectors || []);
  const [toolAssignmentsMap, setToolAssignmentsMap] = React.useState<Record<string, ToolAssignmentConfig>>(() => {
    const map: Record<string, ToolAssignmentConfig> = {};
    (assistant.tool_assignments || []).forEach((ta: any) => {
      map[ta.tool_name] = ta;
    });
    return map;
  });
  const [activeDrawerConfig, setActiveDrawerConfig] = React.useState<ToolAssignmentConfig | null>(null);

  React.useEffect(() => {
    getConnectorsAction().then((res) => {
      if (res && res.success && res.connectedAccounts) {
        setWorkspaceConnectors((prev) => {
          const map = new Map();
          prev.forEach((item: any) => map.set(item.id || item.provider || item.provider_slug || item.slug, item));
          res.connectedAccounts.forEach((item: any) => {
            const key = item.provider || item.provider_slug || item.slug || item.id;
            map.set(key, {
              ...item,
              provider: item.provider || item.provider_slug || key,
              provider_slug: item.provider_slug || item.provider || key,
              slug: item.slug || item.provider || key,
              status: item.status || "connected",
              connected_account_email: item.connected_account_email || item.connectedAccountEmail,
              connected_account_name: item.connected_account_name || item.connectedAccountName,
            });
          });
          return Array.from(map.values());
        });
      }
    }).catch((e) => console.warn("Failed to fetch live connectors:", e));
  }, []);

  const getToolConfig = React.useCallback((t: any): ToolAssignmentConfig => {
    const toolName = t.id || t.name;
    const existing = toolAssignmentsMap[toolName];
    const providerSlug = t.config?.provider || (toolName ? toolName.split('.')[0] : 'connector');

    const googleSlugs = new Set(['gmail', 'google_workspace', 'google_calendar', 'google_sheets', 'google_contacts', 'google_drive', 'google_meet']);
    const isGoogleTool = googleSlugs.has(providerSlug) || toolName.startsWith('google_') || toolName.startsWith('gmail.');
    const isSlackTool = providerSlug === 'slack' || toolName.startsWith('slack.');

    // Check workspace connector authorization
    let isAuthorized = true;
    let connectedEmail: string | null = null;

    if (isGoogleTool || isSlackTool || ['notion', 'linear', 'salesforce', 'hubspot'].includes(providerSlug)) {
      const connList = workspaceConnectors;
      const conn = connList.find((c: any) => {
        const cSlug = (
          c.provider ||
          c.provider_slug ||
          c.slug ||
          (typeof c.connector_definitions === 'object' ? c.connector_definitions?.slug : '') ||
          (Array.isArray(c.connector_definitions) ? c.connector_definitions[0]?.slug : '') ||
          ''
        )?.toLowerCase();

        const status = (c.status || '').toLowerCase();
        const isConnActive = status === 'connected' || status === 'active' || status === '';

        if (isGoogleTool) {
          return isConnActive && (cSlug === 'gmail' || cSlug === 'google_workspace' || googleSlugs.has(cSlug) || !cSlug);
        }

        if (isSlackTool) {
          return isConnActive && (cSlug === 'slack' || cSlug.includes('slack'));
        }

        return isConnActive && cSlug === providerSlug.toLowerCase();
      });

      if (isGoogleTool) {
        const anyGoogleConn = conn || connList.find((c: any) => c.status === 'connected' || c.status === 'active' || c.connected_account_email);
        if (anyGoogleConn) {
          isAuthorized = true;
          connectedEmail = anyGoogleConn.connected_account_email || anyGoogleConn.connected_account_name || 'shwetchourey3@gmail.com';
        } else {
          isAuthorized = false;
        }
      } else if (isSlackTool) {
        const anySlackConn = conn || connList.find((c: any) => {
          const s = (c.provider || c.provider_slug || c.slug || c.name || '').toLowerCase();
          return (s === 'slack' || s.includes('slack')) && (c.status === 'connected' || c.status === 'active' || !c.status);
        });

        if (anySlackConn || connList.some((c: any) => (c.provider || c.provider_slug || '').toLowerCase().includes('slack'))) {
          const target = anySlackConn || connList.find((c: any) => (c.provider || c.provider_slug || '').toLowerCase().includes('slack'));
          isAuthorized = true;
          connectedEmail = target?.connected_account_email || target?.connectedAccountEmail || target?.connected_account_name || target?.connectedAccountName || 'GAP@workspace.com';
        } else {
          isAuthorized = false;
          connectedEmail = null;
        }
      } else if (conn && (conn.status === 'connected' || conn.status === 'active')) {
        isAuthorized = true;
        connectedEmail = conn.connected_account_email || conn.connected_account_name || 'Active Account';
      } else {
        isAuthorized = false;
        connectedEmail = null;
      }
    }

    const defaults = getToolCallingDefaults(toolName);

    return {
      assistant_id: assistant.id,
      tool_name: toolName,
      tool_title: t.name || defaults.tool_title,
      description: t.description || defaults.when_to_use,
      provider_slug: providerSlug,
      category: existing?.category || defaults.category,
      enabled: existing?.enabled !== false,
      when_to_use: existing?.when_to_use || defaults.when_to_use,
      requires_confirmation: existing?.requires_confirmation !== undefined
        ? (defaults.category !== 'READ' ? true : existing.requires_confirmation)
        : defaults.requires_confirmation,
      timeout_ms: existing?.timeout_ms || defaults.timeout_ms,
      failure_message: existing?.failure_message || defaults.failure_message,
      allowed_during_call: existing?.allowed_during_call !== undefined ? existing.allowed_during_call : defaults.allowed_during_call,
      connected_account_email: connectedEmail,
      is_connector_authorized: isAuthorized,
      sync_status: existing?.sync_status || 'synced',
      sync_error: existing?.sync_error
    };
  }, [assistant.id, workspaceConnectors, toolAssignmentsMap]);

  const handleToggleTool = async (toolId: string) => {
    const isAssigned = assignedToolIds.includes(toolId);
    const newAssigned = isAssigned
      ? assignedToolIds.filter((id) => id !== toolId)
      : [...assignedToolIds, toolId];

    setAssignedToolIds(newAssigned);

    try {
      await toggleAssistantToolAction(assistant.id, toolId, !isAssigned);
    } catch (err: any) {
      console.warn("Failed to toggle tool on server:", err.message);
    }
  };

  const handleAddTransferNumber = () => {
    if (!transferPhoneInput.trim()) return;
    const fullNumber = transferPhoneInput.startsWith("+")
      ? transferPhoneInput.trim()
      : `${countryCode}${transferPhoneInput.trim()}`;

    if (!transferPhoneNumbers.includes(fullNumber)) {
      setTransferPhoneNumbers([...transferPhoneNumbers, fullNumber]);
    }
    setTransferPhoneInput("");
  };

  const handleRemoveTransferNumber = (numToRemove: string) => {
    setTransferPhoneNumbers(transferPhoneNumbers.filter((n) => n !== numToRemove));
  };

  const handleGeneratePrompt = async (presetTopic?: string) => {
    const topic = presetTopic || promptTopic;
    if (!topic.trim()) {
      alert("Please enter a business description or instructions.");
      return;
    }

    setIsGeneratingPrompt(true);
    try {
      const generated = await generatePromptAction(topic);
      if (generated) {
        setSystemPrompt(generated);
        setIsPromptModalOpen(false);
      }
    } catch (err: any) {
      alert("Failed to synthesize prompt: " + err.message);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handlePreviewVoice = (e: React.MouseEvent, language: string) => {
    e.preventDefault();
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance();
    msg.text = language.includes('hi') ? "नमस्ते, मैं आपकी वॉइस असिस्टेंट हूँ।" : "Hello, I am your voice assistant.";
    msg.lang = language;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.includes(language.substring(0, 2)));
    if (match) {
      msg.voice = match;
    }

    window.speechSynthesis.speak(msg);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setSystemPromptError(null);
    setErrorMessage(null);

    let hasError = false;
    if (!name.trim()) {
      setNameError("Assistant Name cannot be empty.");
      hasError = true;
    }
    if (!systemPrompt.trim()) {
      setSystemPromptError("System Prompt cannot be empty.");
      hasError = true;
    }

    if (hasError) {
      setActiveTab("model");
      return;
    }

    setIsUpdating(true);
    setErrorMessage(null);

    const payload = {
      name,
      ai_provider: aiProvider,
      model,
      max_tokens: Number(maxTokens),
      temperature: Number(temperature),
      welcome_message: welcomeMessage,
      dynamic_welcome_enabled: dynamicWelcomeEnabled,
      dynamic_welcome_message: dynamicWelcomeMessage,
      system_prompt: systemPrompt,
      whatsapp_summary_prompt: whatsappSummaryPrompt,
      whatsapp_summary_phone: whatsappSummaryPhone,
      outcome_prompt: outcomePrompt,
      maintain_context: maintainContext,
      transfer_call_settings: {
        exclude_whatsapp_summary_number: excludeWhatsappSummaryNumber,
        phone_numbers: transferPhoneNumbers
      },
      voice: {
        provider: voiceProvider,
        name: voiceName,
        language: voiceLanguage,
        speed: Number(voiceSpeed),
        stability: Number(voiceStability),
        similarity_boost: Number(voiceSimilarityBoost),
        tts_model: ttsModel,
        instructions: voiceInstructions
      },
      transcription: {
        provider: transcriptionProvider,
        language: transcriptionLanguage,
        mode: transcriptionMode
      },
      deepgram: {
        model: dgModel,
        utterance_end_ms: Number(dgUtteranceEnd),
        endpointing: Number(dgEndpointing),
        vad_events: dgVadEvents,
        diarize: dgDiarize
      },
      maximum_duration: Number(maximumDuration),
      silence_timeout: Number(silenceTimeout),
      inactivity_message: inactivityMessage,
      timeout_end_message: timeoutEndMessage,
      timeout_end_message_delay: Number(timeoutEndMessageDelay),
      filler_words_enabled: fillerWordsEnabled,
      filler_words: fillerWords,
      call_details_webhook_enabled: callDetailsWebhookEnabled,
      call_details_webhook_url: callDetailsWebhookUrl,
      selected_tools: assignedToolIds
    };

    try {
      const result = await updateAssistantAction(assistant.id, payload);
      if (result && result.success !== false) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage(result?.error || "Failed to update assistant. Please check your settings and try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while updating the assistant.");
    } finally {
      setIsUpdating(false);
    }
  };

  const aiProviders = Object.keys(VOMYRA_CATALOG.ai.models);
  const currentModels = VOMYRA_CATALOG.ai.models[aiProvider as keyof typeof VOMYRA_CATALOG.ai.models] || [];
  const voiceProviderOptions = VOMYRA_CATALOG.voice.providers;
  const currentVoices: VoiceOption[] = VOMYRA_CATALOG.voice.featured_voices.filter(v => v.provider === voiceProvider);

  return (
    <form onSubmit={handleUpdate} className="space-y-6 animate-fadeIn pb-12">
      {errorMessage && (
        <div className="p-4 rounded-[12px] bg-red-50 border border-red-200 text-red-700 font-bold text-xs shadow-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-800 p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">{name}</h1>
            <span className="font-mono text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              {assistant.status || "active"}
            </span>
            {assistant.provider_resource_id && (
              <span className="font-mono text-[10px] bg-surface-soft border border-hairline text-neutral-500 px-2 py-0.5 rounded">
                ID: {assistant.provider_resource_id.slice(-6)}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">Configure speech pipeline, prompt engineering, custom function tools, and advance telephony settings.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            type="submit"
            disabled={isUpdating}
            className="bg-black hover:bg-neutral-800 text-white rounded-xl text-xs px-6 py-2.5 font-bold transition-transform active:scale-95 shadow-sm cursor-pointer shrink-0"
          >
            {isUpdating ? "Saving..." : saveSuccess ? "Saved ✓" : "Update Assistant"}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation (Responsive Horizontally Scrollable on Mobile) */}
      <div className="flex overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap border border-hairline rounded-2xl bg-surface-soft p-1.5 gap-1.5 text-xs shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab("model")}
          className={`shrink-0 py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "model" ? "bg-white text-black shadow-xs font-bold" : "text-neutral-500 hover:text-black hover:bg-white/50"
          }`}
        >
          <Bot className="w-4 h-4 text-emerald-600" />
          <span>Model & Prompts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("speech")}
          className={`shrink-0 py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "speech" ? "bg-white text-black shadow-xs font-bold" : "text-neutral-500 hover:text-black hover:bg-white/50"
          }`}
        >
          <Cpu className="w-4 h-4 text-blue-600" />
          <span>Speech Input (STT)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("voice")}
          className={`shrink-0 py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "voice" ? "bg-white text-black shadow-xs font-bold" : "text-neutral-500 hover:text-black hover:bg-white/50"
          }`}
        >
          <Mic className="w-4 h-4 text-purple-600" />
          <span>Voice Output (TTS)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tools")}
          className={`shrink-0 py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "tools" ? "bg-white text-black shadow-xs font-bold" : "text-neutral-500 hover:text-black hover:bg-white/50"
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-600" />
          <span>Tools ({assignedToolIds.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("integrations")}
          className={`shrink-0 py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "integrations" ? "bg-white text-black shadow-xs font-bold" : "text-neutral-500 hover:text-black hover:bg-white/50"
          }`}
        >
          <Share2 className="w-4 h-4 text-indigo-600" />
          <span>Integrations & Permissions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("advance")}
          className={`shrink-0 py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "advance" ? "bg-white text-black shadow-xs font-bold" : "text-neutral-500 hover:text-black hover:bg-white/50"
          }`}
        >
          <Settings2 className="w-4 h-4 text-neutral-600" />
          <span>Advance Settings</span>
        </button>
      </div>

      {/* Integrations & Permissions Tab */}
      {activeTab === "integrations" && (
        <div className="bg-white border border-hairline rounded-[14px] p-6 space-y-6 shadow-sm">
          <AgentIntegrationsPermissions assistantId={assistant.id} />
        </div>
      )}

      {/* Model & Prompts Tab */}
      {activeTab === "model" && (
        <div className="bg-white border border-hairline rounded-[16px] p-6 sm:p-8 space-y-8 shadow-xs">
          
          {/* Header & Quick Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black tracking-tight">Model & Conversation Persona</h3>
                  <p className="text-xs text-neutral-500">Configure AI provider, system persona prompt, dynamic greetings, and telephony behaviors.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPromptModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Prompt Generator</span>
              </button>
            </div>
          </div>

          {/* Assistant Name Card (Compact & Focused) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-soft/60 border border-hairline space-y-2 max-w-lg">
            <Label className="eyebrow text-neutral-600 flex items-center justify-between gap-3">
              <span className="font-bold flex items-center gap-1.5 shrink-0">
                <span>ASSISTANT NAME</span>
                <span className="text-rose-500 font-bold">*</span>
                <GuideTooltip
                  title="Assistant Name"
                  titleHinglish="Assistant Ka Naam"
                  whatIsIt="The public name for your AI bot shown on your dashboard and call history."
                  whatIsItHinglish="Aapke AI agent ka display name jo dashboard aur call records me dikhega."
                  whatToDo="Give it a clear role name like 'Front Desk Receptionist' or 'Support Agent'."
                  whatToDoHinglish="Isko ek aasan job role dein, jaise 'Front Desk Receptionist' ya 'Hotel Concierge'."
                />
              </span>
              <span className="text-[10px] text-neutral-400 font-medium truncate">Shown on call logs</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. Front Desk Receptionist, Lead Qualifier"
              className="bg-white border border-hairline rounded-xl px-4 py-2 text-sm font-semibold text-black focus:border-black focus:ring-1 focus:ring-black shadow-2xs"
              required
            />
            {nameError && (
              <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{nameError}</span>
              </p>
            )}
          </div>

          {/* AI Provider, Model Selection & Intelligence Parameters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-neutral-600" />
                <span>Intelligence Engine & Creativity</span>
              </h4>
              <span className="text-[11px] font-mono text-neutral-500 bg-surface-soft px-2.5 py-0.5 rounded-full border border-hairline">
                Ultra-low Latency Optimized
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Provider Selection */}
              <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2">
                <Label className="eyebrow text-neutral-500 flex items-center">
                  <span>AI PROVIDER</span>
                  <GuideTooltip
                    title="AI Intelligence Provider"
                    titleHinglish="AI Brain Provider"
                    whatIsIt="The AI technology company powering your assistant's thinking and answers."
                    whatIsItHinglish="Ye wo AI system hai jo bot ko samajhne aur bolne ka dimaag deta hai."
                    whatToDo="Keep OpenAI (default) for natural conversation, or Groq for extreme low latency."
                    whatToDoHinglish="OpenAI hi select rehne dein, ye sabse smart aur natural baat karta hai."
                  />
                </Label>
                <select
                  value={aiProvider}
                  onChange={(e) => {
                    const newProvider = e.target.value;
                    setAiProvider(newProvider);
                    const avail = VOMYRA_CATALOG.ai.models[newProvider as keyof typeof VOMYRA_CATALOG.ai.models] || [];
                    if (avail && avail.length > 0 && avail[0]) setModel(avail[0].id);
                  }}
                  className="w-full bg-white border border-hairline rounded-lg px-3.5 py-2.5 text-xs font-bold text-black capitalize focus:outline-none focus:border-black shadow-2xs"
                >
                  {aiProviders.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-400">Underlying LLM infrastructure</p>
              </div>

              {/* Model Tier Selection */}
              <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2">
                <Label className="eyebrow text-neutral-500 flex items-center">
                  <span>MODEL ARCHITECTURE</span>
                  <GuideTooltip
                    title="AI Model Tier"
                    titleHinglish="AI Model Version"
                    whatIsIt="The brain size and intelligence level used for conversation turns."
                    whatIsItHinglish="AI dimaag ka model jo decide karta hai bot kitni tezi se aur kitna smart jawab dega."
                    whatToDo="GPT-4o-mini is recommended for fast, affordable, and natural phone calls."
                    whatToDoHinglish="'gpt-4o-mini' chunein — ye super fast, sasta aur bilkul natural bolta hai."
                  />
                </Label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-white border border-hairline rounded-lg px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black shadow-2xs"
                >
                  {currentModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-400">Select model size and reasoning speed</p>
              </div>

              {/* Max Tokens Slider & Speech Duration */}
              <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="eyebrow text-neutral-500 flex items-center">
                    <span>MAX OUTPUT TOKENS</span>
                    <GuideTooltip
                      title="Max Output Tokens (Speech Length)"
                      titleHinglish="Bolne Ki Dialogue Limit"
                      whatIsIt="The maximum length of words the bot can generate in one single reply."
                      whatIsItHinglish="Ek baar me bot kitna lamba dialogue bol sakta hai uski boundary."
                      whatToDo="Keep between 150 to 250 tokens (~20-30 seconds) so the bot never gives long monologues."
                      whatToDoHinglish="Isko 150 se 250 par rakhein taaki bot lamba bhashan na de aur customer ko bolne de."
                    />
                  </Label>
                  <span className="font-mono text-xs font-bold text-black bg-white px-2 py-0.5 rounded border border-hairline">
                    {maxTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min="64"
                  max="1024"
                  step="32"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 256)}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex items-center justify-between text-[10px] text-neutral-500 font-medium">
                  <span>~{Math.round(maxTokens * 0.12)}s max speech</span>
                  <span className="text-neutral-400 font-mono">1024 max</span>
                </div>
              </div>
            </div>

            {/* Creativity / Temperature Control */}
            <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <Label className="text-xs font-bold text-black uppercase tracking-wider flex items-center">
                    <span>Creativity & Temperature</span>
                    <GuideTooltip
                      title="Creativity (Temperature)"
                      titleHinglish="Creativity (Temperature)"
                      whatIsIt="Controls how strictly the AI follows facts (0.0) versus natural improvisation (1.0)."
                      whatIsItHinglish="Ye tay karta hai ki bot kitna strictly factual bolega ya natural friendly baatein karega."
                      whatToDo="Use 0.0 - 0.2 for strict booking/pricing, and 0.3 - 0.5 for friendly customer support."
                      whatToDoHinglish="Isko 0.2 se 0.4 ke beech rakhein taaki bot sahi jankari de bina kisi galti ke."
                    />
                  </Label>
                  <p className="text-xs text-neutral-500">Controls how strictly the assistant follows predefined facts vs improvisation.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    temperature <= 0.2
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : temperature <= 0.6
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-purple-50 text-purple-800 border-purple-200"
                  }`}>
                    {temperature <= 0.2 ? "Strict & Factual" : temperature <= 0.6 ? "Balanced & Natural" : "Creative & Expressive"}
                  </span>
                  <span className="font-mono text-xs font-bold text-black bg-white px-2.5 py-0.5 rounded border border-hairline shadow-2xs">
                    {temperature.toFixed(2)}
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value) || 0.3)}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
              />

              <div className="grid grid-cols-3 text-[10px] font-semibold text-neutral-500 pt-1">
                <span className="text-left">0.0 (Strict / Data Retrieval)</span>
                <span className="text-center">0.3 - 0.5 (Natural Telephony)</span>
                <span className="text-right">1.0 (Creative Sales)</span>
              </div>
            </div>
          </div>


          {/* Dynamic / Static Welcome Greeting with Live Preview */}
          <div className="space-y-4 pt-4 border-t border-hairline">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <Label className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Greeting & First Utterance</span>
                  <GuideTooltip
                    title="Greeting & First Utterance"
                    titleHinglish="Pehla Swagat Message"
                    whatIsIt="The very first sentence spoken by the assistant the moment the call connects."
                    whatIsItHinglish="Call connect hote hi bot sabse pehle jo pehli line customer ko bolega."
                    whatToDo="Write a warm opening ending with an open question, e.g. 'Hello! How can I assist you today?'"
                    whatToDoHinglish="Ek chhota aur warm greeting likhein, jaise 'Namaste! Main aapki kya madad kar sakta hoon?'"
                  />
                </Label>
                <p className="text-xs text-neutral-500">The first sentence spoken by the assistant the moment the call connects.</p>
              </div>

              {/* Dynamic Toggle Switch */}
              <div className="flex items-center gap-2.5 bg-surface-soft p-1.5 px-3 rounded-full border border-hairline">
                <span className="text-xs font-bold text-neutral-700">
                  {dynamicWelcomeEnabled ? "Dynamic LLM Greeting" : "Static Fixed Greeting"}
                </span>
                <button
                  type="button"
                  onClick={() => setDynamicWelcomeEnabled(!dynamicWelcomeEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    dynamicWelcomeEnabled ? 'bg-emerald-500' : 'bg-neutral-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    dynamicWelcomeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            {/* Dynamic Variables Quick Insert Bar */}
            <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-surface-soft/60 border border-hairline">
              <span className="text-[11px] font-bold text-neutral-600 flex items-center gap-1 mr-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Insert Variables:</span>
                <GuideTooltip
                  title="Dynamic Variables"
                  titleHinglish="Auto-fill Tags"
                  whatIsIt="Tags that automatically get replaced with the caller's real name, company, or appointment time."
                  whatIsItHinglish="Auto-fill tags jo customer ka asli naam, phone ya details khud bhar dete hain."
                  whatToDo="Click any tag (e.g. {{name}}) to insert it into your greeting or prompt."
                  whatToDoHinglish="{{name}} par click karein taaki bot customer ko unke naam se pukaare."
                />
              </span>
              {DYNAMIC_VARIABLES.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => {
                    if (dynamicWelcomeEnabled) {
                      setDynamicWelcomeMessage((prev: string) => (prev ? `${prev} ${v.tag}` : v.tag));
                    } else {
                      setWelcomeMessage((prev: string) => (prev ? `${prev} ${v.tag}` : v.tag));
                    }
                  }}
                  title={`Insert ${v.desc}`}
                  className="px-2.5 py-1 rounded-lg bg-white border border-hairline text-[11px] font-mono font-semibold text-neutral-700 hover:bg-black hover:text-white hover:border-black transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>{v.tag}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">({v.label})</span>
                </button>
              ))}
            </div>

            {/* Input Field */}
            {dynamicWelcomeEnabled ? (
              <div className="space-y-2">
                <Label className="eyebrow text-neutral-500 flex items-center">
                  <span>DYNAMIC GREETING INSTRUCTIONS</span>
                  <GuideTooltip
                    title="Dynamic Greeting Instructions"
                    titleHinglish="Dynamic Greeting Nirdesh"
                    whatIsIt="Instructs the AI how to formulate the opening line dynamically based on caller details."
                    whatIsItHinglish="AI ko batana ki customer ke profile ke hisab se alag greeting kaise banaye."
                    whatToDo="Provide brief instructions like 'Greet warmly in Hindi and ask how you can help with bookings'."
                    whatToDoHinglish="Simple instruction likhein jaise 'Customer ka swagat karein aur poochhein kis room ki enquiry hai'."
                  />
                </Label>
                <Textarea
                  rows={2}
                  value={dynamicWelcomeMessage}
                  onChange={(e) => setDynamicWelcomeMessage(e.target.value)}
                  placeholder="e.g. Greet the caller warmly in Hindi and ask how you can help them today with room bookings..."
                  className="bg-white border border-hairline rounded-xl p-3.5 text-xs text-black font-semibold resize-y focus:border-black focus:ring-1 focus:ring-black shadow-2xs"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="eyebrow text-neutral-500 flex items-center">
                  <span>STATIC FIRST MESSAGE</span>
                  <GuideTooltip
                    title="Static First Message"
                    titleHinglish="Fixed Pehli Line"
                    whatIsIt="The exact fixed phrase the assistant speaks immediately when the call connects."
                    whatIsItHinglish="Ek fix line jo har call uthate hi bot exactly wahi bolega."
                    whatToDo="Keep it under 15 words and end with an open question."
                    whatToDoHinglish="15 shabdon se chhota rakhein aur aakhiri me sawal poochhein."
                  />
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Welcome to our concierge! How may I assist you today?"
                    className="bg-white border border-hairline rounded-xl px-4 py-2.5 text-xs text-black font-semibold focus:border-black focus:ring-1 focus:ring-black shadow-2xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (typeof window !== "undefined" && window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(welcomeMessage || "Hello, how can I help you?");
                        utterance.rate = voiceSpeed || 1.0;
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    title="Listen to welcome message preview"
                    className="px-3.5 py-2.5 rounded-xl bg-surface-soft border border-hairline hover:bg-neutral-200 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Preview Voice</span>
                  </button>
                </div>
              </div>
            )}

            {/* Live Customer Speech Bubble Preview */}
            <div className="p-4 rounded-2xl bg-linear-to-r from-neutral-900 to-neutral-800 text-white shadow-md flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-400 text-black flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                AI
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Live Customer First Impression</span>
                  <span className="text-[10px] text-neutral-400 font-mono">00:00 (Call Connected)</span>
                </div>
                <p className="text-xs text-neutral-100 italic leading-relaxed font-medium">
                  "{dynamicWelcomeEnabled 
                    ? (dynamicWelcomeMessage ? `[Dynamic Context]: ${dynamicWelcomeMessage}` : "Assistant dynamically generates tailored greeting based on caller profile...")
                    : (welcomeMessage || "Welcome, how can I assist you?")
                  }"
                </p>
              </div>
            </div>
          </div>

          {/* System Prompt (Persona & Instructions) */}
          <div className="space-y-3 pt-4 border-t border-hairline">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Label className="eyebrow text-neutral-500 font-bold flex items-center">
                    <span>SYSTEM PROMPT (AGENT INSTRUCTIONS)</span>
                    <GuideTooltip
                      title="System Prompt (Role Script)"
                      titleHinglish="Agent Training Instructions"
                      whatIsIt="The AI's full job training manual: persona, business info, pricing, FAQs, and rules."
                      whatIsItHinglish="Bot ka training manual: bot kaun hai, aapki company kya bechti hai aur rates kya hain."
                      whatToDo="Detail what your business offers in plain English. Avoid markdown bullet points or asterisks (**)."
                      whatToDoHinglish="Plain bhasha me business rules likhein. Kabhi bhi star (**) ya markdown bullets na lagayein."
                    />
                  </Label>
                  <span className="text-rose-500 font-bold">*</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                    Required
                  </span>
                </div>
                <p className="text-xs text-neutral-500">Define knowledge bounds, conversation rules, booking logic, and persona behaviors.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromptModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-surface-soft hover:bg-neutral-200 text-neutral-700 border border-hairline text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Prompt Synthesizer</span>
                </button>
              </div>
            </div>

            <Textarea
              rows={9}
              value={systemPrompt}
              onChange={(e) => {
                setSystemPrompt(e.target.value);
                if (systemPromptError) setSystemPromptError(null);
              }}
              placeholder="You are an expert AI Voice Assistant..."
              className="bg-surface-soft/50 border border-hairline rounded-xl p-4 text-xs text-black font-mono leading-relaxed resize-y focus:border-black focus:ring-1 focus:ring-black shadow-2xs"
            />
            {systemPromptError && (
              <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1.5 animate-fadeIn">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{systemPromptError}</span>
              </p>
            )}
            
            <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium pt-0.5">
              <span>Tip: Never use markdown bolding (**) or bullet points in prompts for voice bots.</span>
              <span className="font-mono">{systemPrompt.length} characters</span>
            </div>
          </div>

          {/* Quick Telephony Action Cards (Transfer & WhatsApp Summary) */}
          <div className="pt-4 border-t border-hairline space-y-3">
            <h4 className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-neutral-600" />
              <span>Call Handling & Post-Call Actions</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Transfer Settings Card */}
              <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-black flex items-center">
                      <span>Live Call Transfer</span>
                      <GuideTooltip
                        title="Live Call Transfer"
                        titleHinglish="Call Transfer Settings"
                        whatIsIt="Automatically patches the live caller to a human agent when requested."
                        whatIsItHinglish="Jab customer kisi insaan se baat karna chahe, to call turant aapke staff ke phone par transfer ho jayegi."
                        whatToDo="Add destination phone numbers including the country code (e.g. +91 9876543210)."
                        whatToDoHinglish="Apne staff ka mobile number country code ke sath daalein (e.g. +91 9876543210)."
                      />
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-hairline text-neutral-700">
                      {transferPhoneNumbers.length} Number{transferPhoneNumbers.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">Transfer live calls to human agents or departments.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-hairline hover:bg-neutral-100 text-xs font-bold text-black shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  Configure
                </button>
              </div>

              {/* WhatsApp Summary Card */}
              <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-black flex items-center">
                      <span>WhatsApp Summary</span>
                      <GuideTooltip
                        title="WhatsApp Call Summary"
                        titleHinglish="WhatsApp Call Summary"
                        whatIsIt="Automatically sends a bulleted summary of every completed phone call to your WhatsApp."
                        whatIsItHinglish="Call khatam hote hi poori baat-cheet ka concise summary aapke WhatsApp par turant bhej dega."
                        whatToDo="Enter your registered WhatsApp phone number with country code (+91)."
                        whatToDoHinglish="Apna WhatsApp mobile number country code ke sath enter karein."
                      />
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      whatsappSummaryPhone ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-neutral-100 text-neutral-500 border-hairline'
                    }`}>
                      {whatsappSummaryPhone ? whatsappSummaryPhone : 'Not Configured'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">Dispatch instant AI call summaries via WhatsApp.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsWhatsappModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-hairline hover:bg-neutral-100 text-xs font-bold text-black shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  Set Phone
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Speech Input (STT) Tab */}
      {activeTab === "speech" && (
        <div className="bg-white border border-hairline rounded-2xl p-5 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-xl font-bold text-black">Speech Input (STT Engine)</h3>
            <p className="text-xs text-neutral-500">Deepgram Neural Transcription, Real-time VAD, Language, and Utterance Delays.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2">
              <Label className="eyebrow text-neutral-500 flex items-center">
                <span>TRANSCRIPTION PROVIDER</span>
                <GuideTooltip
                  title="Speech-to-Text Provider"
                  titleHinglish="Aawaz Sunne Wala System"
                  whatIsIt="The speech listener that converts the caller's spoken words into text in real-time."
                  whatIsItHinglish="Ye wo engine hai jo customer ki aawaz sun kar usko turant text me convert karta hai."
                  whatToDo="Deepgram Nova-2 is optimized for live phone calls."
                  whatToDoHinglish="Deepgram Nova-2 hi chunein, ye telephony calls ke liye sabse fast aur accurate hai."
                />
              </Label>
              <select
                value={transcriptionProvider}
                onChange={(e) => setTranscriptionProvider(e.target.value)}
                className="w-full bg-white border border-hairline rounded-lg px-3.5 py-2.5 text-xs font-semibold text-black focus:outline-none focus:border-black shadow-2xs"
              >
                <option value="deepgram">Deepgram Nova-2</option>
              </select>
            </div>

            <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2">
              <Label className="eyebrow text-neutral-500 flex items-center">
                <span>LANGUAGE</span>
                <GuideTooltip
                  title="Transcription Language"
                  titleHinglish="Sunne Ki Bhasha"
                  whatIsIt="The primary spoken language the bot listens for during the phone call."
                  whatIsItHinglish="Wo bhasha jo customer phone par bolega aur bot usko samjhega."
                  whatToDo="Select the language your callers usually speak (Hindi, Indian English, etc.)."
                  whatToDoHinglish="Agar aapke customer Hindi bolte hain toh Hindi (hi-IN) select karein."
                />
              </Label>
              <select
                value={transcriptionLanguage}
                onChange={(e) => setTranscriptionLanguage(e.target.value)}
                className="w-full bg-white border border-hairline rounded-lg px-3.5 py-2.5 text-xs font-semibold text-black focus:outline-none focus:border-black shadow-2xs"
              >
                <option value="hi-IN">Hindi (hi-IN)</option>
                <option value="en-US">English (en-US)</option>
                <option value="en-IN">Indian English (en-IN)</option>
                <option value="multi">Multilingual</option>
              </select>
            </div>

            <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2 sm:col-span-2 lg:col-span-1">
              <Label className="eyebrow text-neutral-500 flex items-center">
                <span>MODEL TIER</span>
                <GuideTooltip
                  title="Speech Model Tier"
                  titleHinglish="Speech Model Level"
                  whatIsIt="Speech recognition model tuned for conversations versus generic audio."
                  whatIsItHinglish="Aawaz pehchanne ka algorithm jo phone lines ke background shor ko filter karta hai."
                  whatToDo="Nova-2 Conversational AI is recommended for natural phone dialogue."
                  whatToDoHinglish="'Nova-2 Conversational AI' chunein taaki phone background noise me bhi sahi samjhe."
                />
              </Label>
              <select
                value={dgModel}
                onChange={(e) => setDgModel(e.target.value)}
                className="w-full bg-white border border-hairline rounded-lg px-3.5 py-2.5 text-xs font-semibold text-black focus:outline-none focus:border-black shadow-2xs"
              >
                <option value="nova-2">Nova-2 (Ultra-fast & accurate)</option>
                <option value="nova-2-general">Nova-2 General</option>
                <option value="nova-2-conversationalai">Nova-2 Conversational AI</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-hairline">
            <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="eyebrow text-neutral-500 flex items-center">
                  <span>UTTERANCE END DELAY</span>
                  <GuideTooltip
                    title="Utterance End Delay"
                    titleHinglish="Jawab Dene Ka Pause Time"
                    whatIsIt="How many milliseconds of silence the bot waits after the caller stops speaking before replying."
                    whatIsItHinglish="Customer ke chup hone ke kitni der baad bot apna jawab bolna shuru kare."
                    whatToDo="1000ms (1 second) provides the most natural human-like cadence."
                    whatToDoHinglish="Isko 1000 ms (1 second) par rakhein taaki bot customer ki baat beech me na kaate."
                  />
                </Label>
                <span className="font-mono text-xs font-bold text-black bg-white px-2 py-0.5 rounded border border-hairline shadow-2xs">{dgUtteranceEnd} ms</span>
              </div>
              <input
                type="range"
                min="500"
                max="3000"
                step="100"
                value={dgUtteranceEnd}
                onChange={(e) => setDgUtteranceEnd(parseInt(e.target.value) || 1000)}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>500 ms</span>
                <span>3000 ms</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="eyebrow text-neutral-500 flex items-center">
                  <span>ENDPOINTING SENSITIVITY</span>
                  <GuideTooltip
                    title="Endpointing Sensitivity"
                    titleHinglish="Saans Lene Par Tokne Se Rokna"
                    whatIsIt="Prevents the bot from interrupting callers if they pause for a quick breath mid-sentence."
                    whatIsItHinglish="Agar customer bolte hue 1 second ke liye saans le, toh bot beech me tok na de."
                    whatToDo="Keep between 250ms and 350ms."
                    whatToDoHinglish="Isko 300 ms ke aas-paas rakhein."
                  />
                </Label>
                <span className="font-mono text-xs font-bold text-black bg-white px-2 py-0.5 rounded border border-hairline shadow-2xs">{dgEndpointing} ms</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={dgEndpointing}
                onChange={(e) => setDgEndpointing(parseInt(e.target.value) || 300)}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                <span>100 ms</span>
                <span>1000 ms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Output Tab */}
      {activeTab === "voice" && (
        <div className="bg-white border border-hairline rounded-2xl p-5 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-hairline pb-4">
            <div>
              <h3 className="text-xl font-bold text-black">Voice Output & Synthesis</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Select high-fidelity neural voices, accent profiles, and speech cadence.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2">
              <Label className="eyebrow text-neutral-500 flex items-center">
                <span>VOICE PROVIDER</span>
                <GuideTooltip
                  title="Voice Synthesis Provider"
                  titleHinglish="Aawaz Banane Wala System"
                  whatIsIt="The sound engine that turns the AI text reply into a real human-sounding voice."
                  whatIsItHinglish="Ye wo system hai jo AI ke text jawab ko insani aawaz me bolta hai."
                  whatToDo="Select Azure or ElevenLabs for lifelike audio quality."
                  whatToDoHinglish="Azure select karein, iski Indian accents bohot natural lagti hain."
                />
              </Label>
              <select
                value={voiceProvider}
                onChange={(e) => setVoiceProvider(e.target.value)}
                className="w-full bg-white border border-hairline rounded-lg px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black shadow-2xs"
              >
                {voiceProviderOptions.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2">
              <Label className="eyebrow text-neutral-500 flex items-center">
                <span>DEFAULT VOICE</span>
                <GuideTooltip
                  title="Voice Persona"
                  titleHinglish="Aawaz Ka Character"
                  whatIsIt="The specific human speaker persona (male/female, accent) representing your brand."
                  whatIsItHinglish="Bot ki aawaz ka character (female ya male aawaz aur accent tone)."
                  whatToDo="Click the Play button on voice cards below to listen and pick your favorite."
                  whatToDoHinglish="Voice cards par Play button daba kar suniye aur jo pasand aaye use select karein."
                />
              </Label>
              <select
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                className="w-full bg-white border border-hairline rounded-lg px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black shadow-2xs"
              >
                {currentVoices.map((v: VoiceOption) => (
                  <option key={v.name} value={v.name}>{v.title || v.name}</option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2 sm:col-span-2 lg:col-span-1">
              <Label className="eyebrow text-neutral-500 flex items-center">
                <span>LANGUAGE DIALECT</span>
                <span className="text-rose-500 ml-0.5">*</span>
                <GuideTooltip
                  title="Language Dialect"
                  titleHinglish="Bolne Ka Accent & Bhasha"
                  whatIsIt="Accent and pronunciation rules for spoken AI answers."
                  whatIsItHinglish="Bot ke bolne ka accent aur regional bhasha style."
                  whatToDo="Set to match your customer base e.g. Hindi (India) or Indian English."
                  whatToDoHinglish="Apne customers ke hisab se Hindi (India) ya English (India) set karein."
                />
              </Label>
              <select
                value={voiceLanguage}
                onChange={(e) => setVoiceLanguage(e.target.value)}
                className="w-full bg-white border border-hairline rounded-lg px-3.5 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black shadow-2xs"
              >
                <option value="hi-IN">Hindi (India)</option>
                <option value="en-IN">English (India)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="eyebrow text-neutral-500 flex items-center">
                <span>VOICE SPEED ({voiceSpeed}x)</span>
                <GuideTooltip
                  title="Voice Talking Speed"
                  titleHinglish="Bolne Ki Raftaar"
                  whatIsIt="How fast or slow the bot articulates words out loud."
                  whatIsItHinglish="Bot kitni tezi ya aaram se bolega."
                  whatToDo="1.0x is standard human speaking speed. Use 0.95x for clear announcements or 1.05x for fast sales."
                  whatToDoHinglish="Isko 1.0x (normal) par hi rakhein taaki sabko aasaani se samajh aaye."
                />
              </Label>
              <span className="font-mono text-xs font-bold text-black bg-white px-2 py-0.5 rounded border border-hairline shadow-2xs">{voiceSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value) || 1.0)}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Fast)</span>
            </div>
          </div>

          {/* Featured Voices Cards */}
          <div className="pt-4 border-t border-hairline space-y-3">
            <h4 className="text-xs font-bold text-black uppercase tracking-wider">Featured Neural Voices</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                { name: "hi-IN-AartiNeural", title: "Aarti - Azure", lang: "Hindi", tag: "female" },
                { name: "hi-IN-ArjunNeural", title: "Arjun - Azure", lang: "Hindi", tag: "male" },
                { name: "en-IN-AartiNeural", title: "Aarti - Azure", lang: "English", tag: "female" },
                { name: "en-IN-ArjunNeural", title: "Arjun - Azure", lang: "English", tag: "male" }
              ].map((vCard) => {
                const isSelected = voiceName === vCard.name;
                const isPlaying = playingVoiceId === vCard.name;

                return (
                  <div
                    key={vCard.name}
                    className={`rounded-2xl p-4.5 flex flex-col justify-between border transition-all cursor-pointer group shadow-2xs ${
                      isSelected ? "border-black bg-neutral-50" : "border-hairline bg-surface-soft/40 hover:bg-white"
                    }`}
                    onClick={() => {
                      setVoiceName(vCard.name);
                    }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-bold text-sm text-black">{vCard.title}</h5>
                        {isSelected && (
                          <span className="bg-black text-white px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-neutral-500 mt-0.5">{vCard.name}</p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">Azure</span>
                        <span className="bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{vCard.lang}</span>
                        <span className="bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{vCard.tag}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-hairline">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const v = VOMYRA_CATALOG.voice.featured_voices.find((x) => x.name === vCard.name);
                          if (v) handlePlayVoice(v);
                        }}
                        className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-colors shadow-sm shrink-0 cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <div className="text-right">
                        <p className="text-[10px] text-neutral-400">IN • {vCard.tag}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voice Sample List */}
          <div className="space-y-3 pt-4 border-t border-hairline">
            <Label className="eyebrow text-neutral-500">ALL VOICES FOR {voiceProvider.toUpperCase()}</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentVoices.map((voice) => {
                const isSelected = voiceName === voice.name;
                const isPlaying = playingVoiceId === voice.name;

                return (
                  <div
                    key={voice.name}
                    onClick={() => {
                      setVoiceName(voice.name);
                      setVoiceLanguage(voice.language);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between shadow-2xs ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/40"
                        : "border-hairline bg-surface-soft/50 hover:bg-white"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-black">{voice.title || voice.name}</p>
                      <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        {voice.language} • {voice.gender}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVoice(voice);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                        isPlaying
                          ? "bg-emerald-600 text-white"
                          : "bg-white border border-hairline text-black hover:bg-neutral-100"
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tools & Connectors Tab */}
      {activeTab === "tools" && (
        <div className="bg-white border border-hairline rounded-2xl p-5 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-hairline pb-4">
            <div>
              <h3 className="text-xl font-bold text-black flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600" />
                <span>Function Tools & Connectors</span>
                <GuideTooltip
                  title="Function Tools & Connectors"
                  titleHinglish="Custom Tools & Apps"
                  whatIsIt="Allows the AI to interact with live software (check calendar availability, lookup CRM records, create tickets) during calls."
                  whatIsItHinglish="Bot ko aapke Calendar, CRM ya Database se jodna taaki wo live call me booking ya check-in kar sake."
                  whatToDo="Click '+ Connect Tool' and configure whether authorization confirmation is needed."
                  whatToDoHinglish="'+ Connect Tool' par click karein aur apna software tool link karein."
                />
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Attach and configure real-time tools, OAuth connectors, and safety rules.
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-800 text-xs px-3.5 py-1.5 rounded-full font-bold border border-emerald-200 shadow-2xs flex items-center gap-1.5 w-fit">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{assignedToolIds.length} Connected</span>
            </span>
          </div>

          <div className="space-y-3.5">
            {workspaceTools.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500 border-2 border-dashed border-hairline rounded-2xl bg-surface-soft/50 p-6">
                <Wrench className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="font-bold text-neutral-700">No Connectors Found</p>
                <p className="text-neutral-500 mt-1">Create API Request tools or Knowledge Base connectors to link with this assistant.</p>
              </div>
            ) : (
              workspaceTools.map((t) => {
                const toolConfig = getToolConfig(t);
                const isAssigned = assignedToolIds.includes(t.id || t.name);
                const isAuthorized = toolConfig.is_connector_authorized;

                return (
                  <div
                    key={t.id || t.name}
                    className={`p-4 sm:p-5 border rounded-2xl transition-all shadow-2xs ${
                      isAssigned
                        ? "border-emerald-500/40 bg-emerald-50/20"
                        : "border-hairline bg-surface-soft/40 hover:bg-white"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <h4 className="font-bold text-sm text-black">{t.name}</h4>

                          <Badge className={`text-[10px] font-mono font-bold uppercase ${
                            toolConfig.category === "READ"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : toolConfig.category === "WRITE"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-red-100 text-red-800 border-red-200"
                          }`}>
                            {toolConfig.category}
                          </Badge>

                          {toolConfig.requires_confirmation ? (
                            <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-semibold gap-1">
                              <Lock className="w-2.5 h-2.5" /> Confirmation Required
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-semibold">
                              Automatic
                            </Badge>
                          )}
                        </div>

                        {t.description && (
                          <p className="text-xs text-neutral-600 leading-relaxed">{t.description}</p>
                        )}

                        <div className="flex items-center gap-3 pt-1 text-xs">
                          {isAuthorized ? (
                            <div className="flex items-center gap-1.5 text-neutral-600 font-mono text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-bold text-black">{toolConfig.provider_slug?.toUpperCase()}</span>
                              <span>•</span>
                              <span>{toolConfig.connected_account_email || "Active Account"}</span>
                            </div>
                          ) : (
                            <a
                              href="/dashboard/connectors"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px] hover:bg-rose-100 transition-colors"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Connect {toolConfig.provider_slug?.toUpperCase()} first</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline">
                        {isAssigned && (
                          <Button
                            type="button"
                            onClick={() => setActiveDrawerConfig(toolConfig)}
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs font-bold gap-1.5 bg-white border-hairline hover:bg-surface-soft shadow-2xs cursor-pointer flex-1 sm:flex-none"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Configure</span>
                          </Button>
                        )}

                        <Button
                          type="button"
                          disabled={!isAuthorized}
                          onClick={() => handleToggleTool(t.id || t.name)}
                          className={`text-xs font-bold px-4 py-2 rounded-xl shrink-0 shadow-2xs transition-all cursor-pointer flex-1 sm:flex-none ${
                            isAssigned
                              ? "bg-black hover:bg-neutral-800 text-white"
                              : isAuthorized
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                          }`}
                        >
                          {isAssigned ? "Connected ✓" : "+ Connect Tool"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Assistant Tool Configuration Drawer */}
      {activeDrawerConfig && (
        <AssistantToolConfigDrawer
          isOpen={!!activeDrawerConfig}
          onClose={() => setActiveDrawerConfig(null)}
          config={activeDrawerConfig}
          onSaved={(updatedConfig) => {
            setToolAssignmentsMap((prev) => ({
              ...prev,
              [updatedConfig.tool_name]: updatedConfig
            }));
          }}
        />
      )}

      {/* Advance Settings Tab */}
      {activeTab === "advance" && (
        <div className="bg-white border border-hairline rounded-2xl p-5 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-xl font-bold text-black">Advance Settings</h3>
            <p className="text-xs text-neutral-500">Configure timeout, silence limits, filler words, and call termination messages.</p>
          </div>

          {/* 1. Wait Time Before Asking Again */}
          <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-black uppercase tracking-wider flex items-center">
                  <span>Wait Time Before Asking Again</span>
                  <GuideTooltip
                    title="Silence Timeout"
                    titleHinglish="Silence Timeout"
                    whatIsIt="How many seconds the bot waits in total silence before asking 'Are you still there?'"
                    whatIsItHinglish="Agar customer phone par chup ho jaye, toh bot kitne seconds baad poochhega ki 'Kya aap sun rahe hain?'."
                    whatToDo="Set to 10-15 seconds so callers have time to think without feeling rushed."
                    whatToDoHinglish="10 se 15 seconds set karein taaki customer aaram se soch sake."
                  />
                </Label>
                <p className="text-xs text-neutral-500">System silence timeout before prompting caller.</p>
              </div>
              <span className="font-mono text-xs font-bold text-black px-2.5 py-0.5 rounded bg-white border border-hairline shadow-2xs">
                {silenceTimeout}s
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="60"
              step="1"
              value={silenceTimeout}
              onChange={(e) => setSilenceTimeout(parseInt(e.target.value) || 12)}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-400">
              <span>2 sec</span>
              <span>60 sec</span>
            </div>
          </div>

          {/* 2. Max Call Length */}
          <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-black uppercase tracking-wider flex items-center">
                  <span>Max Call Length</span>
                  <GuideTooltip
                    title="Max Call Duration"
                    titleHinglish="Call Ki Maximum Duration"
                    whatIsIt="The maximum allowable call duration before the bot politely concludes the call."
                    whatIsItHinglish="Ek call zyada se zyada kitne minute chal sakti hai."
                    whatToDo="Set to 300-600 seconds (5 to 10 minutes) to prevent accidental endless calls."
                    whatToDoHinglish="300 se 600 seconds (5 se 10 minute) set karein taaki faltu lambi call na chale."
                  />
                </Label>
                <p className="text-xs text-neutral-500">Longest possible call duration.</p>
              </div>
              <span className="font-mono text-xs font-bold text-black px-2.5 py-0.5 rounded bg-white border border-hairline shadow-2xs">
                {maximumDuration}s
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="3600"
              step="30"
              value={maximumDuration}
              onChange={(e) => setMaximumDuration(parseInt(e.target.value) || 600)}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-[10px] font-mono text-neutral-400">
              <span>30 sec</span>
              <span>3600 sec</span>
            </div>
          </div>

          {/* 3. Inactivity Prompt Message */}
          <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-2">
            <Label className="text-xs font-bold text-black uppercase tracking-wider flex items-center">
              <span>Inactivity Prompt Message</span>
              <GuideTooltip
                title="Inactivity Prompt Message"
                titleHinglish="Chup Rehne Par Check-in Message"
                whatIsIt="What the bot says out loud when the caller goes silent for longer than the silence timeout."
                whatIsItHinglish="Jab customer chup ho jaye, to bot unka dhyan kheenchne ke liye kya bolega."
                whatToDo="Use a polite check-in e.g. 'Are you still there? Let me know if you need any help.'"
                whatToDoHinglish="Ek aasan check-in likhein jaise 'Kya aap line par hain? Kahiye main aapki kya madad karoon?'."
              />
            </Label>
            <p className="text-xs text-neutral-500">Played to verify caller presence, e.g. "Are you still there?"</p>
            <Input
              value={inactivityMessage}
              onChange={(e) => setInactivityMessage(e.target.value)}
              placeholder="Are you still there?"
              className="bg-white border border-hairline rounded-xl px-4 py-2.5 text-xs text-black font-semibold focus:border-black focus:ring-1 focus:ring-black shadow-2xs"
            />
          </div>

          {/* 4. Goodbye Message */}
          <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-xs font-bold text-black uppercase tracking-wider flex items-center">
                  <span>Goodbye Termination Message</span>
                  <GuideTooltip
                    title="Goodbye Message"
                    titleHinglish="Call Kaatne Ki Aakhiri Line"
                    whatIsIt="The final sign-off line spoken right before the call disconnects."
                    whatIsItHinglish="Call kaatne se pehle bot aakhiri line kya bolega."
                    whatToDo="e.g. 'Thank you for reaching out. Have a wonderful day!'"
                    whatToDoHinglish="Ek meethi alvida line likhein jaise 'Call karne ke liye dhanyawad. Aapka din shubh ho!'."
                  />
                </Label>
                <p className="text-xs text-neutral-500">Final sentence before call disconnects.</p>
                <Input
                  value={timeoutEndMessage}
                  onChange={(e) => setTimeoutEndMessage(e.target.value)}
                  placeholder="Thank you for calling. Goodbye!"
                  className="bg-white border border-hairline rounded-xl px-4 py-2.5 text-xs text-black font-semibold focus:border-black focus:ring-1 focus:ring-black shadow-2xs"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-bold text-black uppercase flex items-center">
                    <span>Timeout Delay</span>
                    <GuideTooltip
                      title="Timeout Delay"
                      titleHinglish="Hangup Delay"
                      whatIsIt="Wait time in seconds after the goodbye message before concluding the call."
                      whatIsItHinglish="Goodbye bolne ke kitne seconds baad phone disconnect ho jaye."
                      whatToDo="Set to 5 seconds."
                      whatToDoHinglish="Isko 5 seconds par rakhein."
                    />
                  </Label>
                  <span className="font-mono text-[11px] font-bold text-black px-2 py-0.5 rounded bg-white border border-hairline shadow-2xs">
                    {timeoutEndMessageDelay}s
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={timeoutEndMessageDelay}
                  onChange={(e) => setTimeoutEndMessageDelay(parseInt(e.target.value) || 5)}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                  <span>5s</span>
                  <span>300s</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Instant Filler Words */}
          <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-black uppercase tracking-wider flex items-center">
                  <span>Instant Filler Words</span>
                  <GuideTooltip
                    title="Instant Filler Words"
                    titleHinglish="Instant Fillers ('Haan ji', 'Accha')"
                    whatIsIt="Quick conversational acknowledgements (e.g. 'Sure, let me check...') played instantly to mask thinking time."
                    whatIsItHinglish="Customer ki baat sunte hi turant 'Haan ji', 'Ji bilkul', 'Accha' bolna taaki customer ko lage ki koi sach me sun raha hai."
                    whatToDo="Keep enabled for fluid, sub-300ms perceived response times."
                    whatToDoHinglish="Isko ON rakhein, isse bot bohot hi realistic aur active lagta hai."
                  />
                </Label>
                <p className="text-xs text-neutral-500">Play conversational acknowledgements ("hmm...", "okay...") during LLM thinking.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFillerWordsEnabled(!fillerWordsEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${fillerWordsEnabled ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${fillerWordsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {fillerWordsEnabled && (
              <div className="space-y-1.5 pt-1">
                <Textarea
                  rows={2}
                  value={fillerWords}
                  onChange={(e) => setFillerWords(e.target.value)}
                  placeholder="हाँ, ठीक है जी, ठीक है, बिलकुल, जी, हाँ जी, अच्छा जी, अच्छा, हाँ ठीक hai"
                  className="bg-white border border-hairline rounded-xl p-3 text-xs text-black font-semibold leading-relaxed resize-y focus:border-black focus:ring-1 focus:ring-black shadow-2xs"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Prompt Generator Modal */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-hairline rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 text-black text-left max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-start justify-between gap-3 border-b border-hairline pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-black">AI Voice Prompt Generator</h3>
                  <p className="text-xs text-neutral-500 font-medium">Select a preset or describe your company to synthesize an optimized voice prompt.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPromptModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1.5 rounded-full hover:bg-surface-soft transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <Label className="eyebrow text-neutral-500">QUICK BUSINESS PRESETS</Label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "🏨 Hotel Reservation", topic: "Hotel Reservation Desk Agent handling room bookings" },
                  { label: "🏠 Real Estate", topic: "Real Estate Sales Representative qualifying leads" },
                  { label: "📞 Support", topic: "Customer Support Representative resolving inquiries" },
                  { label: "🩺 Clinic", topic: "Clinic Assistant scheduling patient appointments" },
                  { label: "🛍️ E-Commerce", topic: "Online Store Assistant checking order tracking status" }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setPromptTopic(preset.topic);
                      handleGeneratePrompt(preset.topic);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface-soft hover:bg-black hover:text-white border border-hairline text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="eyebrow text-neutral-500">CUSTOM PROMPT TOPIC & INSTRUCTIONS</Label>
              <Textarea
                value={promptTopic}
                onChange={(e) => setPromptTopic(e.target.value)}
                placeholder="e.g. Call center agent handling room reservations at INR 5400/night..."
                className="min-h-[90px] bg-white border border-hairline rounded-xl p-3.5 text-xs text-black font-medium focus:border-black focus:ring-1 focus:ring-black shadow-2xs"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isGeneratingPrompt}
                onClick={() => setIsPromptModalOpen(false)}
                className="w-full sm:flex-1 py-2.5 rounded-xl border border-hairline text-xs font-semibold hover:bg-surface-soft text-neutral-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGeneratingPrompt}
                onClick={() => handleGeneratePrompt()}
                className="w-full sm:flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs py-2.5 shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isGeneratingPrompt ? 'animate-spin' : ''}`} />
                {isGeneratingPrompt ? "Synthesizing..." : "✨ Synthesize Prompt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Call Setting Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-hairline rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 text-black text-left max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <h3 className="font-bold text-lg text-black">Transfer Call Settings</h3>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1.5 rounded-full hover:bg-surface-soft transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-black">Exclude Whatsapp Summary Number</Label>
              <button
                type="button"
                onClick={() => setExcludeWhatsappSummaryNumber(!excludeWhatsappSummaryNumber)}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${excludeWhatsappSummaryNumber ? 'bg-emerald-500' : 'bg-neutral-300'}`}
              >
                <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${excludeWhatsappSummaryNumber ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-1">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-white border border-hairline rounded-xl px-3 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black shadow-2xs"
                >
                  <option value="+91">IN +91</option>
                  <option value="+1">US +1</option>
                  <option value="+44">UK +44</option>
                  <option value="+971">UAE +971</option>
                </select>

                <Input
                  type="text"
                  value={transferPhoneInput}
                  onChange={(e) => setTransferPhoneInput(e.target.value)}
                  placeholder="Phone number"
                  className="bg-white border border-hairline rounded-xl px-4 py-2.5 text-xs text-black placeholder-neutral-400 focus:border-black flex-1 font-semibold shadow-2xs"
                />
              </div>

              <button
                type="button"
                onClick={handleAddTransferNumber}
                className="w-full sm:w-10 h-10 rounded-xl sm:rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shrink-0 font-bold transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span className="sm:hidden text-xs ml-1 font-bold">Add Number</span>
              </button>
            </div>

            <div className="border border-hairline rounded-xl overflow-hidden bg-surface-soft">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-hairline text-xs font-bold text-neutral-600">
                <span>Phone Number</span>
                <span>Action</span>
              </div>

              <div className="divide-y divide-hairline bg-white">
                {transferPhoneNumbers.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-500 font-medium">
                    No phone numbers added yet.
                  </div>
                ) : (
                  transferPhoneNumbers.map((num) => (
                    <div key={num} className="flex items-center justify-between px-4 py-3 text-xs font-mono font-semibold text-black">
                      <span>{num}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTransferNumber(num)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-surface-soft transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="w-full bg-black hover:bg-neutral-800 text-white font-bold rounded-xl py-3 text-xs shadow-md transition-all cursor-pointer"
            >
              Save Transfer Settings
            </button>
          </div>
        </div>
      )}

      {/* Whatsapp Summary Phone Modal */}
      {isWhatsappModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-hairline rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-black text-left max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-bold text-base text-black">WhatsApp Summary Phone</h3>
              <button
                type="button"
                onClick={() => setIsWhatsappModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1.5 rounded-full hover:bg-surface-soft cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <Label className="eyebrow text-neutral-500">PHONE NUMBER (WITH COUNTRY CODE)</Label>
              <Input
                type="text"
                value={whatsappSummaryPhone}
                onChange={(e) => setWhatsappSummaryPhone(e.target.value)}
                placeholder="e.g. +919876543210"
                className="bg-white border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-black font-semibold focus:border-black focus:ring-1 focus:ring-black shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsWhatsappModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-hairline text-xs font-semibold text-neutral-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsWhatsappModalOpen(false)}
                className="flex-1 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl text-xs py-2.5 shadow-sm cursor-pointer"
              >
                Save Number
              </button>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} className="hidden" />
    </form>
  );
}
