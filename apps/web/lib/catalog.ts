export interface VoiceOption {
  name: string;
  title: string;
  provider: string;
  gender: "female" | "male" | "neutral";
  language: string;
  locale: string;
  tags: string[];
}

export const GAP_CATALOG = {
  ai: {
    providers: ["openai", "groq", "gap", "xai"],
    models: {
      openai: [
        { id: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
        { id: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
        { id: "gpt-4o", label: "GPT-4o" },
        { id: "gpt-4o-mini", label: "GPT-4o Mini" },
        { id: "gpt-5.4-mini", label: "GPT-5.4 Mini" },
        { id: "gpt-5.4-nano", label: "GPT-5.4 Nano" }
      ],
      groq: [
        { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile" },
        { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant" },
        { id: "llama3-8b-8192", label: "Llama 3 8B (8192)" },
        { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
        { id: "qwen/qwen3-32b", label: "Qwen3 32B" }
      ],
      gap: [
        { id: "gap-fast-1", label: "GAP Fast 1" },
        { id: "gap-pro-1", label: "GAP Pro 1" }
      ],
      vomyra: [
        { id: "vomyra-fast-1", label: "GAP Fast 1" },
        { id: "vomyra-pro-1", label: "GAP Pro 1" }
      ],
      xai: [
        { id: "grok-4-1-fast", label: "Grok 4.1 Fast" },
        { id: "grok-4-1-fast-reasoning", label: "Grok 4.1 Fast Reasoning" },
        { id: "grok-4.20-0309-reasoning", label: "Grok 4.20 Reasoning" }
      ]
    }
  },
  voice: {
    providers: ["azure", "cartesia", "elevenlabs", "openai", "gap", "xai"],
    tts_models: {
      elevenlabs: [
        { id: "eleven_flash_v2_5", label: "Eleven Flash v2.5" },
        { id: "eleven_multilingual_v2", label: "Eleven Multilingual v2" },
        { id: "eleven_turbo_v2_5", label: "Eleven Turbo v2.5" }
      ],
      cartesia: [
        { id: "sonic-english", label: "Sonic English" },
        { id: "sonic-multilingual", label: "Sonic Multilingual" }
      ],
      azure: [
        { id: "neural", label: "Azure Neural" }
      ],
      openai: [
        { id: "tts-1", label: "TTS-1" },
        { id: "tts-1-hd", label: "TTS-1 HD" }
      ],
      gap: [
        { id: "gap-tts-std", label: "GAP Voice Standard" }
      ],
      vomyra: [
        { id: "vomyra-tts-std", label: "GAP Voice Standard" }
      ],
      xai: [
        { id: "xai-tts-1", label: "xAI TTS 1" }
      ]
    },
    featured_voices: [
      {
        name: "hi-IN-AartiNeural",
        title: "Aarti - Azure",
        provider: "azure",
        gender: "female",
        language: "Hindi",
        locale: "IN • unknown",
        tags: ["Azure", "Hindi", "female", "general"]
      },
      {
        name: "hi-IN-ArjunNeural",
        title: "Arjun - Azure",
        provider: "azure",
        gender: "male",
        language: "Hindi",
        locale: "IN • unknown",
        tags: ["Azure", "Hindi", "male", "general"]
      },
      {
        name: "en-IN-AartiNeural",
        title: "Aarti - Azure",
        provider: "azure",
        gender: "female",
        language: "English",
        locale: "IN • unknown",
        tags: ["Azure", "English", "female", "general"]
      },
      {
        name: "en-IN-ArjunNeural",
        title: "Arjun - Azure",
        provider: "azure",
        gender: "male",
        language: "English",
        locale: "IN • unknown",
        tags: ["Azure", "English", "male", "general"]
      },
      {
        name: "en-US-AriaNeural",
        title: "Aria - Azure",
        provider: "azure",
        gender: "female",
        language: "English",
        locale: "US • unknown",
        tags: ["Azure", "English", "female", "general"]
      },
      {
        name: "rachel",
        title: "Rachel - ElevenLabs",
        provider: "elevenlabs",
        gender: "female",
        language: "English",
        locale: "US • conversational",
        tags: ["ElevenLabs", "English", "female", "expressive"]
      },
      {
        name: "drew",
        title: "Drew - ElevenLabs",
        provider: "elevenlabs",
        gender: "male",
        language: "English",
        locale: "US • news",
        tags: ["ElevenLabs", "English", "male", "professional"]
      },
      {
        name: "alloy",
        title: "Alloy - OpenAI",
        provider: "openai",
        gender: "neutral",
        language: "English",
        locale: "US • natural",
        tags: ["OpenAI", "English", "neutral", "balanced"]
      },
      {
        name: "echo",
        title: "Echo - OpenAI",
        provider: "openai",
        gender: "male",
        language: "English",
        locale: "US • warm",
        tags: ["OpenAI", "English", "male", "conversational"]
      },
      {
        name: "fable",
        title: "Fable - OpenAI",
        provider: "openai",
        gender: "male",
        language: "English",
        locale: "US • expressive",
        tags: ["OpenAI", "English", "male", "storyteller"]
      },
      {
        name: "onyx",
        title: "Onyx - OpenAI",
        provider: "openai",
        gender: "male",
        language: "English",
        locale: "US • deep",
        tags: ["OpenAI", "English", "male", "authoritative"]
      },
      {
        name: "nova",
        title: "Nova - OpenAI",
        provider: "openai",
        gender: "female",
        language: "English",
        locale: "US • energetic",
        tags: ["OpenAI", "English", "female", "lively"]
      },
      {
        name: "shimmer",
        title: "Shimmer - OpenAI",
        provider: "openai",
        gender: "female",
        language: "English",
        locale: "US • clear",
        tags: ["OpenAI", "English", "female", "calm"]
      },
      {
        name: "vomyra-hindi-1",
        title: "GAP Hindi Standard",
        provider: "gap",
        gender: "female",
        language: "Hindi",
        locale: "IN • standard",
        tags: ["GAP", "Hindi", "female", "natural"]
      },
      {
        name: "vomyra-english-1",
        title: "GAP English Standard",
        provider: "gap",
        gender: "male",
        language: "English",
        locale: "IN • standard",
        tags: ["GAP", "English", "male", "professional"]
      },
      {
        name: "244d4432-5638-445b-9d0e-f2378a9630d6",
        title: "Barbershop Man - Cartesia",
        provider: "cartesia",
        gender: "male",
        language: "English",
        locale: "US • sonic",
        tags: ["Cartesia", "English", "male", "expressive"]
      },
      {
        name: "79a125e8-cd45-4c13-8a67-188112f4dd22",
        title: "Helpful Woman - Cartesia",
        provider: "cartesia",
        gender: "female",
        language: "English",
        locale: "US • sonic",
        tags: ["Cartesia", "English", "female", "helpful"]
      },
      {
        name: "xai-voice-1",
        title: "xAI Standard - xAI",
        provider: "xai",
        gender: "neutral",
        language: "English",
        locale: "US • grok",
        tags: ["xAI", "English", "neutral", "fast"]
      }
    ] as VoiceOption[],
    voices: {
      azure: [
        { name: "hi-IN-AartiNeural", title: "Aarti (Hindi Female)", gender: "female", language: "hi-IN" },
        { name: "hi-IN-ArjunNeural", title: "Arjun (Hindi Male)", gender: "male", language: "hi-IN" },
        { name: "hi-IN-AaravNeural", title: "Aarav (Hindi Male)", gender: "male", language: "hi-IN" },
        { name: "en-IN-AartiNeural", title: "Aarti (Indian English Female)", gender: "female", language: "en-IN" },
        { name: "en-IN-ArjunNeural", title: "Arjun (Indian English Male)", gender: "male", language: "en-IN" },
        { name: "en-IN-AaravNeural", title: "Aarav (Indian English Male)", gender: "male", language: "en-IN" },
        { name: "en-US-AriaNeural", title: "Aria (US Female)", gender: "female", language: "en-US" },
        { name: "en-US-DavisNeural", title: "Davis (US Male)", gender: "male", language: "en-US" }
      ],
      elevenlabs: [
        { name: "rachel", title: "Rachel (Calm & Clear)", gender: "female", language: "en-US" },
        { name: "drew", title: "Drew (Well-rounded)", gender: "male", language: "en-US" },
        { name: "clyde", title: "Clyde (War-veteran)", gender: "male", language: "en-US" },
        { name: "domi", title: "Domi (Strong)", gender: "female", language: "en-US" }
      ],
      cartesia: [
        { name: "244d4432-5638-445b-9d0e-f2378a9630d6", title: "Barbershop Man", gender: "male", language: "en-US" },
        { name: "79a125e8-cd45-4c13-8a67-188112f4dd22", title: "Helpful Woman", gender: "female", language: "en-US" }
      ],
      openai: [
        { name: "alloy", title: "Alloy", gender: "neutral", language: "en-US" },
        { name: "echo", title: "Echo", gender: "male", language: "en-US" },
        { name: "fable", title: "Fable", gender: "male", language: "en-US" },
        { name: "onyx", title: "Onyx", gender: "male", language: "en-US" },
        { name: "nova", title: "Nova", gender: "female", language: "en-US" },
        { name: "shimmer", title: "Shimmer", gender: "female", language: "en-US" }
      ],
      gap: [
        { name: "vomyra-hindi-1", title: "GAP Hindi Standard", gender: "female", language: "hi-IN" },
        { name: "vomyra-english-1", title: "GAP English Standard", gender: "male", language: "en-IN" }
      ],
      vomyra: [
        { name: "vomyra-hindi-1", title: "GAP Hindi Standard", gender: "female", language: "hi-IN" },
        { name: "vomyra-english-1", title: "GAP English Standard", gender: "male", language: "en-IN" }
      ],
      xai: [
        { name: "xai-voice-1", title: "xAI Standard Voice", gender: "neutral", language: "en-US" }
      ]
    },
    languages: [
      { id: "hi-IN", label: "Hindi (India)" },
      { id: "en-IN", label: "English (India)" },
      { id: "en-US", label: "English (US)" },
      { id: "en-GB", label: "English (UK)" },
      { id: "es-ES", label: "Spanish (Spain)" }
    ]
  },
  stt: {
    providers: ["azure", "deepgram", "cartesia", "gladia", "smallest_ai", "groq", "openai"],
    language_modes: [
      { id: "single", label: "Single Language" },
      { id: "multiple", label: "Bilingual (faster response time)" }
    ],
    deepgram_models: [
      { id: "nova-2", label: "Nova-2 (Recommended)" },
      { id: "nova-2-general", label: "Nova-2 General" },
      { id: "nova-2-meeting", label: "Nova-2 Meeting" },
      { id: "enhanced", label: "Enhanced" }
    ],
    cartesia_models: [
      { id: "ink-whisper", label: "Ink Whisper" },
      { id: "ink-multilingual", label: "Ink Multilingual" }
    ],
    gladia_models: [
      { id: "fast", label: "Fast" },
      { id: "accurate", label: "Accurate" }
    ]
  }
};

export const VOMYRA_CATALOG = GAP_CATALOG;
