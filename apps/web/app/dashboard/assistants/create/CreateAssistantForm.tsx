"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VOMYRA_CATALOG, VoiceOption } from "@/lib/catalog";
import { createAssistantAction } from "@/app/actions/assistants";
import { Play, Volume2, Check, Sparkles } from "lucide-react";

export function CreateAssistantForm() {
  const [activeTab, setActiveTab] = React.useState<"model" | "speech" | "voice" | "advance">("model");
  const [isPending, setIsPending] = React.useState(false);
  const [playingVoice, setPlayingVoice] = React.useState<string | null>(null);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handlePlayVoiceSample = (fv: VoiceOption, e: React.MouseEvent) => {
    e.stopPropagation();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (playingVoice === fv.name) {
      setPlayingVoice(null);
      return;
    }

    // High quality authentic audio samples map for neural model preview
    const sampleUrls: Record<string, string> = {
      alloy: "https://cdn.openai.com/speech/alloy.mp3",
      echo: "https://cdn.openai.com/speech/echo.mp3",
      fable: "https://cdn.openai.com/speech/fable.mp3",
      onyx: "https://cdn.openai.com/speech/onyx.mp3",
      nova: "https://cdn.openai.com/speech/nova.mp3",
      shimmer: "https://cdn.openai.com/speech/shimmer.mp3",
      rachel: "https://storage.googleapis.com/eleven-public-voices/rachel.mp3",
      drew: "https://storage.googleapis.com/eleven-public-voices/drew.mp3",
      clyde: "https://storage.googleapis.com/eleven-public-voices/clyde.mp3",
      domi: "https://storage.googleapis.com/eleven-public-voices/domi.mp3"
    };

    const targetAudioUrl = sampleUrls[fv.name];

    if (targetAudioUrl) {
      const audio = new Audio(targetAudioUrl);
      audio.playbackRate = voiceSpeed || 1.0;
      audioRef.current = audio;
      setPlayingVoice(fv.name);

      audio.play().then(() => {
        audio.onended = () => {
          setPlayingVoice(null);
          audioRef.current = null;
        };
      }).catch(() => {
        playSpeechFallback(fv);
      });

      audio.onerror = () => {
        playSpeechFallback(fv);
      };
    } else {
      playSpeechFallback(fv);
    }
  };

  const playSpeechFallback = (fv: VoiceOption) => {
    const voiceProfiles: Record<string, { freq: number; pitch: number; rate: number; gender: string }> = {
      'hi-IN-AartiNeural': { freq: 250, pitch: 1.45, rate: 1.0, gender: 'female' },
      'hi-IN-ArjunNeural': { freq: 110, pitch: 0.75, rate: 0.95, gender: 'male' },
      'en-IN-AartiNeural': { freq: 245, pitch: 1.4, rate: 1.0, gender: 'female' },
      'en-IN-ArjunNeural': { freq: 115, pitch: 0.75, rate: 0.95, gender: 'male' },
      'en-US-AriaNeural': { freq: 225, pitch: 1.3, rate: 1.05, gender: 'female' },
      'vomyra-hindi-1': { freq: 235, pitch: 1.35, rate: 1.0, gender: 'female' },
      'vomyra-english-1': { freq: 125, pitch: 0.82, rate: 1.0, gender: 'male' },
      '244d4432-5638-445b-9d0e-f2378a9630d6': { freq: 105, pitch: 0.72, rate: 0.9, gender: 'male' },
      'xai-voice-1': { freq: 180, pitch: 1.05, rate: 1.15, gender: 'neutral' }
    };

    const profile = voiceProfiles[fv.name] || { freq: 170, pitch: fv.gender === 'female' ? 1.3 : 0.8, rate: 1.0, gender: fv.gender };

    const voiceTitleClean = (fv.title || "").split(" - ")[0] || fv.name;
    const text = fv.language === "Hindi" || fv.name.includes("hi-IN")
      ? `Namaste! Main ${voiceTitleClean} hoon, ${fv.provider.toUpperCase()} voice provider se.`
      : `Hello! I am ${voiceTitleClean}, a ${profile.gender} voice powered by ${fv.provider.toUpperCase()}.`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = fv.name.includes("hi-IN") || fv.language === "Hindi" ? "hi-IN" : "en-US";
    utterance.rate = (voiceSpeed || 1.0) * profile.rate;
    utterance.pitch = profile.pitch;

    utterance.onstart = () => setPlayingVoice(fv.name);
    utterance.onend = () => setPlayingVoice(null);
    utterance.onerror = () => setPlayingVoice(null);

    const voices = window.speechSynthesis.getVoices();
    const targetGender = profile.gender.toLowerCase();
    const matchedVoice = voices.find(v => {
      const vName = v.name.toLowerCase();
      if (targetGender === 'female' && (vName.includes('female') || vName.includes('zira') || vName.includes('hazel') || vName.includes('samantha'))) return true;
      if (targetGender === 'male' && (vName.includes('male') || vName.includes('david') || vName.includes('george') || vName.includes('alex'))) return true;
      return vName.includes(voiceTitleClean.toLowerCase());
    }) || voices.find(v => v.lang.toLowerCase().includes(utterance.lang.toLowerCase()));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Model state
  const [name, setName] = React.useState("Sales Representative Bot");
  const [aiProvider, setAiProvider] = React.useState("openai");
  const [model, setModel] = React.useState("gpt-4.1-mini");
  const [maxTokens, setMaxTokens] = React.useState<number>(256);
  const [temperature, setTemperature] = React.useState<number>(0.3);
  const [dynamicWelcomeEnabled, setDynamicWelcomeEnabled] = React.useState<boolean>(false);
  const [welcomeMessage, setWelcomeMessage] = React.useState("Hi! How can I help you today?");
  const [dynamicWelcomeMessage, setDynamicWelcomeMessage] = React.useState("Hello {{name}}, how can I help you today?");
  const [systemPrompt, setSystemPrompt] = React.useState("You are a helpful sales representative assistant. Keep your responses concise, clear, and professional.");

  // Speech Input state
  const [sttProvider, setSttProvider] = React.useState("azure");
  const [languageSelectionMode, setLanguageSelectionMode] = React.useState("single");
  const [transcriptionLanguage, setTranscriptionLanguage] = React.useState("hi-IN");
  const [transcriptionPrompt, setTranscriptionPrompt] = React.useState("");

  // STT Provider specific state
  const [dgModel, setDgModel] = React.useState("nova-2");
  const [dgUtteranceEnd, setDgUtteranceEnd] = React.useState<number>(1200);
  const [dgEndpointing, setDgEndpointing] = React.useState<number>(300);
  const [dgVadEvents, setDgVadEvents] = React.useState<boolean>(true);
  const [dgDiarize, setDgDiarize] = React.useState<boolean>(true);

  // Voice state
  const [voiceProvider, setVoiceProvider] = React.useState("azure");
  const [voiceName, setVoiceName] = React.useState("hi-IN-AartiNeural");
  const [voiceLanguage, setVoiceLanguage] = React.useState("hi-IN");
  const [voiceSpeed, setVoiceSpeed] = React.useState<number>(1.0);
  const [voiceStability, setVoiceStability] = React.useState<number>(0.75);
  const [voiceSimilarityBoost, setVoiceSimilarityBoost] = React.useState<number>(0.8);
  const [ttsModel, setTtsModel] = React.useState("");
  const [voiceInstructions, setVoiceInstructions] = React.useState("Indian Accent");

  // Advance Settings state
  const [maximumDuration, setMaximumDuration] = React.useState<number>(600);
  const [silenceTimeout, setSilenceTimeout] = React.useState<number>(12);
  const [inactivityMessage, setInactivityMessage] = React.useState("Are you still there?");
  const [timeoutEndMessage, setTimeoutEndMessage] = React.useState("Thank you for calling. Goodbye!");
  const [fillerWordsEnabled, setFillerWordsEnabled] = React.useState<boolean>(true);
  const [fillerWords, setFillerWords] = React.useState("");
  const [maintainContext, setMaintainContext] = React.useState<boolean>(false);

  // Derived catalog options
  const aiProviderOptions = VOMYRA_CATALOG.ai.providers;
  const modelOptions = VOMYRA_CATALOG.ai.models[aiProvider as keyof typeof VOMYRA_CATALOG.ai.models] || [];
  
  const voiceProviderOptions = VOMYRA_CATALOG.voice.providers;
  const voiceNameOptions = VOMYRA_CATALOG.voice.voices[voiceProvider as keyof typeof VOMYRA_CATALOG.voice.voices] || [];

  const sttProviderOptions = VOMYRA_CATALOG.stt.providers;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const payload = {
      name,
      system_prompt: systemPrompt,
      welcome_message: welcomeMessage,
      ai_provider: aiProvider,
      model,
      max_tokens: Number(maxTokens),
      temperature: Number(temperature),
      voice_provider: voiceProvider,
      voice: {
        name: voiceName,
        speed: Number(voiceSpeed),
        stability: Number(voiceStability),
        similarity_boost: Number(voiceSimilarityBoost),
        language: voiceLanguage,
        tts_model: ttsModel || null,
        instructions: voiceInstructions
      },
      transcription_provider: sttProvider,
      transcription_language: transcriptionLanguage,
      language_selection_mode: languageSelectionMode,
      transcription_prompt: transcriptionPrompt,
      deepgram: {
        model: dgModel,
        utterance_end_ms: Number(dgUtteranceEnd),
        endpointing: Number(dgEndpointing),
        vad_events: dgVadEvents,
        diarize: dgDiarize
      },
      maintain_context: maintainContext,
      maximum_duration: Number(maximumDuration),
      silence_timeout: Number(silenceTimeout),
      inactivity_message: inactivityMessage,
      timeout_end_message: timeoutEndMessage,
      filler_words_enabled: fillerWordsEnabled,
      filler_words: fillerWords,
      dynamic_welcome_enabled: dynamicWelcomeEnabled,
      dynamic_welcome_message: dynamicWelcomeMessage
    };

    const submissionData = new FormData();
    submissionData.append("payload", JSON.stringify(payload));

    try {
      await createAssistantAction(submissionData);
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT' || String(err).includes('NEXT_REDIRECT')) {
        return;
      }
      alert("Failed to create assistant: " + err.message);
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Create Voice Assistant</h2>
            <p className="text-xs text-muted-foreground">Configure AI provider, voice synthesis, transcription, and conversation behavior.</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("model")}
          className={`px-6 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2 whitespace-nowrap ${
            activeTab === "model"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-400"
              : "text-muted-foreground border-transparent hover:text-foreground"
          }`}
        >
          Model
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("speech")}
          className={`px-6 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2 whitespace-nowrap ${
            activeTab === "speech"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-400"
              : "text-muted-foreground border-transparent hover:text-foreground"
          }`}
        >
          Speech Input
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("voice")}
          className={`px-6 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2 whitespace-nowrap ${
            activeTab === "voice"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-400"
              : "text-muted-foreground border-transparent hover:text-foreground"
          }`}
        >
          Voice
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("advance")}
          className={`px-6 py-2.5 text-sm font-medium transition-all rounded-t-lg border-b-2 whitespace-nowrap ${
            activeTab === "advance"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-400"
              : "text-muted-foreground border-transparent hover:text-foreground"
          }`}
        >
          Advance Settings
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Model Tab */}
        {activeTab === "model" && (
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Model Configuration</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Set up the core identity, LLM model provider, max tokens, and prompt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Assistant Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Support Representative"
                  className="bg-background/50 border-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">AI Provider</Label>
                  <select
                    value={aiProvider}
                    onChange={(e) => {
                      setAiProvider(e.target.value);
                      const avail = VOMYRA_CATALOG.ai.models[e.target.value as keyof typeof VOMYRA_CATALOG.ai.models] || [];
                      if (avail && avail.length > 0 && avail[0]) setModel(avail[0].id);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {aiProviderOptions.map((p) => (
                      <option key={p} value={p}>{p.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Model</Label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {modelOptions.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Max Token</Label>
                  <Input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value) || 256)}
                    className="bg-background/50 border-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Temperature</Label>
                  <span className="text-sm font-mono text-muted-foreground">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Dynamic Welcome Message</Label>
                  <button
                    type="button"
                    onClick={() => setDynamicWelcomeEnabled(!dynamicWelcomeEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      dynamicWelcomeEnabled ? "bg-emerald-500" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        dynamicWelcomeEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {dynamicWelcomeEnabled ? (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Handlebars Welcome Message Template</Label>
                    <Input
                      value={dynamicWelcomeMessage}
                      onChange={(e) => setDynamicWelcomeMessage(e.target.value)}
                      placeholder="Hello {{name}}, welcome to our service!"
                      className="bg-background/50 border-input"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Static Welcome Message</Label>
                    <Input
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      placeholder="Welcome, how can I assist you?"
                      className="bg-background/50 border-input"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t">
                <Label className="text-sm font-medium">System Prompt</Label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Describe the agent's role, tasks, and communication style in detail..."
                  className="min-h-[140px] bg-background/50 border-input text-sm font-mono"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Speech Input Tab */}
        {activeTab === "speech" && (
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Speech Input (STT)</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Configure transcription providers and language options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Provider</Label>
                  <select
                    value={sttProvider}
                    onChange={(e) => setSttProvider(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {sttProviderOptions.map((p) => (
                      <option key={p} value={p}>{p.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Language Selection Mode</Label>
                  <select
                    value={languageSelectionMode}
                    onChange={(e) => setLanguageSelectionMode(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {VOMYRA_CATALOG.stt.language_modes.map((mode) => (
                      <option key={mode.id} value={mode.id}>{mode.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Language</Label>
                  <select
                    value={transcriptionLanguage}
                    onChange={(e) => setTranscriptionLanguage(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {VOMYRA_CATALOG.voice.languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>{lang.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Transcription Prompt / Context Hint</Label>
                  <Input
                    value={transcriptionPrompt}
                    onChange={(e) => setTranscriptionPrompt(e.target.value)}
                    placeholder="e.g. Brand names, technical terms, or industry jargon"
                    className="bg-background/50 border-input"
                  />
                </div>

                {sttProvider === "deepgram" && (
                  <div className="space-y-4 rounded-lg border bg-muted/20 p-4 mt-4">
                    <h4 className="font-semibold text-sm">Deepgram Advanced Config</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Model</Label>
                        <select
                          value={dgModel}
                          onChange={(e) => setDgModel(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
                        >
                          {VOMYRA_CATALOG.stt.deepgram_models.map(m => (
                            <option key={m.id} value={m.id}>{m.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Utterance End (ms)</Label>
                        <Input
                          type="number"
                          value={dgUtteranceEnd}
                          onChange={(e) => setDgUtteranceEnd(parseInt(e.target.value) || 1200)}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dgVadEvents}
                          onChange={(e) => setDgVadEvents(e.target.checked)}
                          className="rounded border-input"
                        />
                        VAD Events
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={dgDiarize}
                          onChange={(e) => setDgDiarize(e.target.checked)}
                          className="rounded border-input"
                        />
                        Speaker Diarization
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Voice Tab */}
        {activeTab === "voice" && (
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Voice Synthesis (TTS)</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Select voice provider, voice model, speed, and preview featured voices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Voice Provider</Label>
                  <select
                    value={voiceProvider}
                    onChange={(e) => {
                      setVoiceProvider(e.target.value);
                      const avail = VOMYRA_CATALOG.voice.voices[e.target.value as keyof typeof VOMYRA_CATALOG.voice.voices] || [];
                      if (avail && avail.length > 0 && avail[0]) setVoiceName(avail[0].name);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {voiceProviderOptions.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Voice</Label>
                  <select
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {voiceNameOptions.map((v) => (
                      <option key={v.name} value={v.name}>{v.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Language *</Label>
                  <select
                    value={voiceLanguage}
                    onChange={(e) => setVoiceLanguage(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {VOMYRA_CATALOG.voice.languages.map((l) => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Voice Rate / Speed</Label>
                    <span className="text-sm font-mono text-muted-foreground">{voiceSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {voiceProvider === "elevenlabs" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border bg-muted/20 p-4 mt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Stability ({voiceStability})</Label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={voiceStability}
                        onChange={(e) => setVoiceStability(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Similarity Boost ({voiceSimilarityBoost})</Label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={voiceSimilarityBoost}
                        onChange={(e) => setVoiceSimilarityBoost(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                    </div>
                  </div>
                )}

                {/* Featured Voices Grid */}
                <div className="space-y-3 pt-6 border-t">
                  <h3 className="text-lg font-bold tracking-tight">Featured Voices</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {(
                      VOMYRA_CATALOG.voice.featured_voices.filter(fv => fv.provider.toLowerCase() === (voiceProvider || "").toLowerCase()).length > 0
                        ? VOMYRA_CATALOG.voice.featured_voices.filter(fv => fv.provider.toLowerCase() === (voiceProvider || "").toLowerCase())
                        : VOMYRA_CATALOG.voice.featured_voices
                    ).map((fv: VoiceOption) => {
                      const isSelected = voiceName === fv.name;
                      return (
                        <div
                          key={fv.name + fv.language}
                          onClick={() => {
                            setVoiceProvider(fv.provider);
                            setVoiceName(fv.name);
                          }}
                          className={`group relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "border-emerald-500/80 bg-emerald-950/20 ring-1 ring-emerald-500/50"
                              : "border-border/60 bg-muted/30 hover:border-border hover:bg-muted/50"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-foreground">{fv.title}</h4>
                              {isSelected && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-black">
                                  <Check className="h-3 w-3" />
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">{fv.name}</p>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {fv.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                    tag === "Azure"
                                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                      : tag === "Hindi" || tag === "English"
                                      ? "bg-muted text-muted-foreground"
                                      : "bg-emerald-500/10 text-emerald-400"
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between pt-2 border-t border-border/40">
                            <button
                              type="button"
                              onClick={(e) => handlePlayVoiceSample(fv, e)}
                              title={playingVoice === fv.name ? "Stop Voice Sample" : "Play Voice Sample"}
                              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                playingVoice === fv.name
                                  ? "bg-emerald-500 text-black ring-2 ring-emerald-400 animate-pulse"
                                  : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                              }`}
                            >
                              {playingVoice === fv.name ? (
                                <Volume2 className="h-4 w-4 animate-bounce" />
                              ) : (
                                <Play className="h-4 w-4 fill-current ml-0.5" />
                              )}
                            </button>

                            <div className="text-right">
                              <p className="text-[11px] text-muted-foreground">Details:</p>
                              <p className="text-[11px] text-muted-foreground font-mono">{fv.locale}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advance Settings Tab */}
        {activeTab === "advance" && (
          <Card className="border bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Advance Settings & Call Behavior</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Set duration caps, silence timeouts, filler word injection, and context memory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Maximum Call Duration (seconds)</Label>
                  <Input
                    type="number"
                    value={maximumDuration}
                    onChange={(e) => setMaximumDuration(parseInt(e.target.value) || 600)}
                    className="bg-background/50 border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Silence Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={silenceTimeout}
                    onChange={(e) => setSilenceTimeout(parseInt(e.target.value) || 12)}
                    className="bg-background/50 border-input"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Inactivity Message</Label>
                  <Input
                    value={inactivityMessage}
                    onChange={(e) => setInactivityMessage(e.target.value)}
                    placeholder="Are you still there?"
                    className="bg-background/50 border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Timeout End Message</Label>
                  <Input
                    value={timeoutEndMessage}
                    onChange={(e) => setTimeoutEndMessage(e.target.value)}
                    placeholder="Thank you for calling. Goodbye!"
                    className="bg-background/50 border-input"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Filler Words Enabled</Label>
                    <p className="text-xs text-muted-foreground">Inject natural hesitation words ("hmm", "okay") while generating response.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFillerWordsEnabled(!fillerWordsEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      fillerWordsEnabled ? "bg-emerald-500" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        fillerWordsEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {fillerWordsEnabled && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Custom Filler Words (Comma separated)</Label>
                    <Input
                      value={fillerWords}
                      onChange={(e) => setFillerWords(e.target.value)}
                      placeholder="hmm, okay, right, got it"
                      className="bg-background/50 border-input"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <Label className="text-sm font-medium">Maintain Context</Label>
                    <p className="text-xs text-muted-foreground">Preserve memory and state across conversation turns.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMaintainContext(!maintainContext)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      maintainContext ? "bg-emerald-500" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        maintainContext ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center border-t border-border pt-4">
          <Button variant="outline" type="button" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-6"
          >
            {isPending ? "Creating Assistant..." : "Save Assistant"}
          </Button>
        </div>
      </form>
    </div>
  );
}
