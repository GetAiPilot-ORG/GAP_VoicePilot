export interface VoiceOption {
  name: string;
  title: string;
  provider: string;
  gender: "female" | "male" | "neutral";
  language: string;
  locale: string;
  tags: string[];
  preview_url?: string | null;
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
    providers: ["azure", "cartesia", "openai", "gap"],
    tts_models: {
      azure: [
        { id: "neural", label: "Azure Neural" }
      ],
      cartesia: [
        { id: "sonic-english", label: "Sonic English" },
        { id: "sonic-multilingual", label: "Sonic Multilingual" }
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
      ]
    },
    featured_voices: [
  {
    "name": "en-IN-AaravNeural",
    "title": "Aarav (English (India), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "English (India)",
    "locale": "en-IN",
    "tags": [
      "Azure",
      "English (India)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Aarav-General-Audio.wav"
  },
  {
    "name": "hi-IN-AaravNeural",
    "title": "Aarav (Hindi (India), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "Hindi (India)",
    "locale": "hi-IN",
    "tags": [
      "Azure",
      "Hindi (India)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Aarav-General-Audio.wav"
  },
  {
    "name": "mr-IN-AarohiNeural",
    "title": "Aarohi (Marathi (India), Female)",
    "provider": "azure",
    "gender": "female",
    "language": "Marathi (India)",
    "locale": "mr-IN",
    "tags": [
      "Azure",
      "Marathi (India)",
      "female"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/mr-IN-Aarohi-General-Audio.wav"
  },
  {
    "name": "hi-IN-AartiNeural",
    "title": "Aarti (Hindi (India), Female)",
    "provider": "azure",
    "gender": "female",
    "language": "Hindi (India)",
    "locale": "hi-IN",
    "tags": [
      "Azure",
      "Hindi (India)",
      "female"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Aarti-General-Audio.wav"
  },
  {
    "name": "en-IN-AartiNeural",
    "title": "Aarti (English (India), Female)",
    "provider": "azure",
    "gender": "female",
    "language": "English (India)",
    "locale": "en-IN",
    "tags": [
      "Azure",
      "English (India)",
      "female"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Aarti-General-Audio.wav"
  },
  {
    "name": "en-US-AriaNeural",
    "title": "Aria (English (US), Female)",
    "provider": "azure",
    "gender": "female",
    "language": "English (US)",
    "locale": "en-US",
    "tags": [
      "Azure",
      "English (US)",
      "female"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Aria-General-Audio.wav"
  },
  {
    "name": "en-IN-ArjunNeural",
    "title": "Arjun (English (India), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "English (India)",
    "locale": "en-IN",
    "tags": [
      "Azure",
      "English (India)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Arjun-General-Audio.wav"
  },
  {
    "name": "hi-IN-ArjunNeural",
    "title": "Arjun (Hindi (India), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "Hindi (India)",
    "locale": "hi-IN",
    "tags": [
      "Azure",
      "Hindi (India)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Arjun-General-Audio.wav"
  },
  {
    "name": "bn-IN-BashkarNeural",
    "title": "Bashkar (Bengali (India), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "Bengali (India)",
    "locale": "bn-IN",
    "tags": [
      "Azure",
      "Bengali (India)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/bn-IN-Bashkar-General-Audio.wav"
  },
  {
    "name": "en-US-DavisNeural",
    "title": "Davis (English (US), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "English (US)",
    "locale": "en-US",
    "tags": [
      "Azure",
      "English (US)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Davis-General-Audio.wav"
  },
  {
    "name": "gu-IN-DhwaniNeural",
    "title": "Dhwani (Gujarati (India), Female)",
    "provider": "azure",
    "gender": "female",
    "language": "Gujarati (India)",
    "locale": "gu-IN",
    "tags": [
      "Azure",
      "Gujarati (India)",
      "female"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/gu-IN-Dhwani-General-Audio.wav"
  },
  {
    "name": "kn-IN-GaganNeural",
    "title": "Gagan (Kannada (India), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "Kannada (India)",
    "locale": "kn-IN",
    "tags": [
      "Azure",
      "Kannada (India)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/kn-IN-Gagan-General-Audio.wav"
  },
  {
    "name": "en-US-GuyNeural",
    "title": "Guy (English (US), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "English (US)",
    "locale": "en-US",
    "tags": [
      "Azure",
      "English (US)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Guy-General-Audio.wav"
  },
  {
    "name": "en-US-JennyNeural",
    "title": "Jenny (English (US), Female)",
    "provider": "azure",
    "gender": "female",
    "language": "English (US)",
    "locale": "en-US",
    "tags": [
      "Azure",
      "English (US)",
      "female"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Jenny-General-Audio.wav"
  },
  {
    "name": "hi-IN-MadhurNeural",
    "title": "Madhur (Hindi (India), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "Hindi (India)",
    "locale": "hi-IN",
    "tags": [
      "Azure",
      "Hindi (India)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Madhur-General-Audio.wav"
  },
  {
    "name": "mr-IN-ManoharNeural",
    "title": "Manohar (Marathi (India), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "Marathi (India)",
    "locale": "mr-IN",
    "tags": [
      "Azure",
      "Marathi (India)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/mr-IN-Manohar-General-Audio.wav"
  },
  {
    "name": "te-IN-MohanNeural",
    "title": "Mohan (Telugu (India), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "Telugu (India)",
    "locale": "te-IN",
    "tags": [
      "Azure",
      "Telugu (India)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/te-IN-Mohan-General-Audio.wav"
  },
  {
    "name": "en-IN-NeerjaNeural",
    "title": "Neerja (English (India), Female)",
    "provider": "azure",
    "gender": "female",
    "language": "English (India)",
    "locale": "en-IN",
    "tags": [
      "Azure",
      "English (India)",
      "female"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Neerja-General-Audio.wav"
  },
  {
    "name": "gu-IN-NiranjanNeural",
    "title": "Niranjan (Gujarati (India), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "Gujarati (India)",
    "locale": "gu-IN",
    "tags": [
      "Azure",
      "Gujarati (India)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/gu-IN-Niranjan-General-Audio.wav"
  },
  {
    "name": "ta-IN-PallaviNeural",
    "title": "Pallavi (Tamil (India), Female)",
    "provider": "azure",
    "gender": "female",
    "language": "Tamil (India)",
    "locale": "ta-IN",
    "tags": [
      "Azure",
      "Tamil (India)",
      "female"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ta-IN-Pallavi-General-Audio.wav"
  },
  {
    "name": "en-IN-PrabhatNeural",
    "title": "Prabhat (English (India), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "English (India)",
    "locale": "en-IN",
    "tags": [
      "Azure",
      "English (India)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Prabhat-General-Audio.wav"
  },
  {
    "name": "kn-IN-SapnaNeural",
    "title": "Sapna (Kannada (India), Female)",
    "provider": "azure",
    "gender": "female",
    "language": "Kannada (India)",
    "locale": "kn-IN",
    "tags": [
      "Azure",
      "Kannada (India)",
      "female"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/kn-IN-Sapna-General-Audio.wav"
  },
  {
    "name": "te-IN-ShrutiNeural",
    "title": "Shruti (Telugu (India), Female)",
    "provider": "azure",
    "gender": "female",
    "language": "Telugu (India)",
    "locale": "te-IN",
    "tags": [
      "Azure",
      "Telugu (India)",
      "female"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/te-IN-Shruti-General-Audio.wav"
  },
  {
    "name": "en-GB-SoniaNeural",
    "title": "Sonia (English (UK), Female)",
    "provider": "azure",
    "gender": "female",
    "language": "English (UK)",
    "locale": "en-GB",
    "tags": [
      "Azure",
      "English (UK)",
      "female"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Sonia-General-Audio.wav"
  },
  {
    "name": "hi-IN-SwaraNeural",
    "title": "Swara (Hindi (India), Female)",
    "provider": "azure",
    "gender": "female",
    "language": "Hindi (India)",
    "locale": "hi-IN",
    "tags": [
      "Azure",
      "Hindi (India)",
      "female"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Swara-General-Audio.wav"
  },
  {
    "name": "bn-IN-TanishaaNeural",
    "title": "Tanishaa (Bengali (India), Female)",
    "provider": "azure",
    "gender": "female",
    "language": "Bengali (India)",
    "locale": "bn-IN",
    "tags": [
      "Azure",
      "Bengali (India)",
      "female"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/bn-IN-Tanishaa-General-Audio.wav"
  },
  {
    "name": "ta-IN-ValluvarNeural",
    "title": "Valluvar (Tamil (India), Male)",
    "provider": "azure",
    "gender": "male",
    "language": "Tamil (India)",
    "locale": "ta-IN",
    "tags": [
      "Azure",
      "Tamil (India)",
      "male"
    ],
    "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ta-IN-Valluvar-General-Audio.wav"
  },
  {
    "name": "f91ab3e6-5071-4e15-b016-cde6f2bcd222",
    "title": "Slow female voice for casual con (Female, Cartesia)",
    "provider": "cartesia",
    "gender": "female",
    "language": "Hindi",
    "locale": "hi",
    "tags": [
      "Cartesia",
      "Hindi",
      "female"
    ],
    "preview_url": null
  },
  {
    "name": "39d518b7-fd0b-4676-9b8b-29d64ff31e12",
    "title": "Warm adult male voice with a sli (Male, Cartesia)",
    "provider": "cartesia",
    "gender": "male",
    "language": "English",
    "locale": "en",
    "tags": [
      "Cartesia",
      "English",
      "male"
    ],
    "preview_url": null
  },
  {
    "name": "9cebb910-d4b7-4a4a-85a4-12c79137724c",
    "title": "Indian accented female for relat (Female, Cartesia)",
    "provider": "cartesia",
    "gender": "female",
    "language": "Hindi",
    "locale": "hi",
    "tags": [
      "Cartesia",
      "Hindi",
      "female"
    ],
    "preview_url": null
  },
  {
    "name": "2821fd0c-35c7-4adf-9c42-32e394bf85cb",
    "title": "Articulate, professional Hebrew  (Female, Cartesia)",
    "provider": "cartesia",
    "gender": "female",
    "language": "English",
    "locale": "he",
    "tags": [
      "Cartesia",
      "English",
      "female"
    ],
    "preview_url": null
  },
  {
    "name": "e2d48e7b-cd73-4c4c-bc1e-f232580e8709",
    "title": "Deep American adult male voice w (Male, Cartesia)",
    "provider": "cartesia",
    "gender": "male",
    "language": "English",
    "locale": "en",
    "tags": [
      "Cartesia",
      "English",
      "male"
    ],
    "preview_url": null
  },
  {
    "name": "f4d6bb07-f876-4464-ba70-cd48d8701890",
    "title": "Bright, expressive voice for pro (Female, Cartesia)",
    "provider": "cartesia",
    "gender": "female",
    "language": "English",
    "locale": "es",
    "tags": [
      "Cartesia",
      "English",
      "female"
    ],
    "preview_url": null
  },
  {
    "name": "6bc7c014-022b-42ce-8b53-a5ec878a7ca7",
    "title": "Formal adult female for direct a (Female, Cartesia)",
    "provider": "cartesia",
    "gender": "female",
    "language": "English",
    "locale": "pl",
    "tags": [
      "Cartesia",
      "English",
      "female"
    ],
    "preview_url": null
  },
  {
    "name": "2695b6b5-5543-4be1-96d9-3967fb5e7fec",
    "title": "Intentional, clear adult for con (Male, Cartesia)",
    "provider": "cartesia",
    "gender": "male",
    "language": "English",
    "locale": "es",
    "tags": [
      "Cartesia",
      "English",
      "male"
    ],
    "preview_url": null
  },
  {
    "name": "alloy",
    "title": "Alloy (Neutral, OpenAI)",
    "provider": "openai",
    "gender": "neutral",
    "language": "English (US)",
    "locale": "en-US",
    "tags": [
      "OpenAI",
      "English",
      "neutral"
    ],
    "preview_url": null
  },
  {
    "name": "echo",
    "title": "Echo (Male, OpenAI)",
    "provider": "openai",
    "gender": "male",
    "language": "English (US)",
    "locale": "en-US",
    "tags": [
      "OpenAI",
      "English",
      "male"
    ],
    "preview_url": null
  },
  {
    "name": "fable",
    "title": "Fable (Neutral - British, OpenAI)",
    "provider": "openai",
    "gender": "neutral",
    "language": "English (UK)",
    "locale": "en-GB",
    "tags": [
      "OpenAI",
      "English",
      "neutral"
    ],
    "preview_url": null
  },
  {
    "name": "onyx",
    "title": "Onyx (Deep Male, OpenAI)",
    "provider": "openai",
    "gender": "male",
    "language": "English (US)",
    "locale": "en-US",
    "tags": [
      "OpenAI",
      "English",
      "male"
    ],
    "preview_url": null
  },
  {
    "name": "nova",
    "title": "Nova (Warm Female, OpenAI)",
    "provider": "openai",
    "gender": "female",
    "language": "English (US)",
    "locale": "en-US",
    "tags": [
      "OpenAI",
      "English",
      "female"
    ],
    "preview_url": null
  },
  {
    "name": "shimmer",
    "title": "Shimmer (Expressive Female, OpenAI)",
    "provider": "openai",
    "gender": "female",
    "language": "English (US)",
    "locale": "en-US",
    "tags": [
      "OpenAI",
      "English",
      "female"
    ],
    "preview_url": null
  },
  {
    "name": "gap-aria",
    "title": "GAP Aria (Hindi - Ultra Fast)",
    "provider": "gap",
    "gender": "female",
    "language": "Hindi (India)",
    "locale": "hi-IN",
    "tags": [
      "GAP",
      "Hindi",
      "female"
    ],
    "preview_url": null
  },
  {
    "name": "gap-kabir",
    "title": "GAP Kabir (Hindi - Telephony)",
    "provider": "gap",
    "gender": "male",
    "language": "Hindi (India)",
    "locale": "hi-IN",
    "tags": [
      "GAP",
      "Hindi",
      "male"
    ],
    "preview_url": null
  },
  {
    "name": "gap-maya",
    "title": "GAP Maya (English - Conversational)",
    "provider": "gap",
    "gender": "female",
    "language": "English (US)",
    "locale": "en-US",
    "tags": [
      "GAP",
      "English",
      "female"
    ],
    "preview_url": null
  }
] as VoiceOption[],
    voices: {
  "azure": [
    {
      "name": "en-IN-AaravNeural",
      "title": "Aarav (English (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Aarav-General-Audio.wav"
    },
    {
      "name": "hi-IN-AaravNeural",
      "title": "Aarav (Hindi (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Hindi (India)",
      "locale": "hi-IN",
      "tags": [
        "Azure",
        "Hindi (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Aarav-General-Audio.wav"
    },
    {
      "name": "mr-IN-AarohiNeural",
      "title": "Aarohi (Marathi (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Marathi (India)",
      "locale": "mr-IN",
      "tags": [
        "Azure",
        "Marathi (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/mr-IN-Aarohi-General-Audio.wav"
    },
    {
      "name": "hi-IN-AartiNeural",
      "title": "Aarti (Hindi (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Hindi (India)",
      "locale": "hi-IN",
      "tags": [
        "Azure",
        "Hindi (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Aarti-General-Audio.wav"
    },
    {
      "name": "en-IN-AartiNeural",
      "title": "Aarti (English (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Aarti-General-Audio.wav"
    },
    {
      "name": "en-IN-Aarti:DragonHDIndicLatestNeural",
      "title": "Aarti:DragonHDIndicLatest (English (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Aarti:DragonHDIndicLatest-General-Audio.wav"
    },
    {
      "name": "en-IN-Aarti:DragonHDLatestNeural",
      "title": "Aarti:DragonHDLatest (English (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Aarti:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-IN-AartiIndicNeural",
      "title": "AartiIndic (English (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-AartiIndic-General-Audio.wav"
    },
    {
      "name": "en-IN-AashiNeural",
      "title": "Aashi (English (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Aashi-General-Audio.wav"
    },
    {
      "name": "en-GB-AbbiNeural",
      "title": "Abbi (English (UK), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Abbi-General-Audio.wav"
    },
    {
      "name": "ar-OM-AbdullahNeural",
      "title": "Abdullah (ar-OM, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-OM",
      "locale": "ar-OM",
      "tags": [
        "Azure",
        "ar-OM",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-OM-Abdullah-General-Audio.wav"
    },
    {
      "name": "en-NG-AbeoNeural",
      "title": "Abeo (en-NG, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "en-NG",
      "locale": "en-NG",
      "tags": [
        "Azure",
        "en-NG",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-NG-Abeo-General-Audio.wav"
    },
    {
      "name": "es-ES-AbrilNeural",
      "title": "Abril (Spanish (Spain), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Abril-General-Audio.wav"
    },
    {
      "name": "th-TH-AcharaNeural",
      "title": "Achara (th-TH, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "th-TH",
      "locale": "th-TH",
      "tags": [
        "Azure",
        "th-TH",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/th-TH-Achara-General-Audio.wav"
    },
    {
      "name": "en-GB-Ada:DragonHDLatestNeural",
      "title": "Ada:DragonHDLatest (English (UK), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Ada:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-GB-AdaMultilingualNeural",
      "title": "AdaMultilingual (English (UK), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-AdaMultilingual-General-Audio.wav"
    },
    {
      "name": "en-US-Adam:DragonHDLatestNeural",
      "title": "Adam:DragonHDLatest (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Adam:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-AdamMultilingualNeural",
      "title": "AdamMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-AdamMultilingual-General-Audio.wav"
    },
    {
      "name": "af-ZA-AdriNeural",
      "title": "Adri (af-ZA, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "af-ZA",
      "locale": "af-ZA",
      "tags": [
        "Azure",
        "af-ZA",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/af-ZA-Adri-General-Audio.wav"
    },
    {
      "name": "pl-PL-AgnieszkaNeural",
      "title": "Agnieszka (pl-PL, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "pl-PL",
      "locale": "pl-PL",
      "tags": [
        "Azure",
        "pl-PL",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pl-PL-Agnieszka-General-Audio.wav"
    },
    {
      "name": "tr-TR-AhmetNeural",
      "title": "Ahmet (tr-TR, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "tr-TR",
      "locale": "tr-TR",
      "tags": [
        "Azure",
        "tr-TR",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/tr-TR-Ahmet-General-Audio.wav"
    },
    {
      "name": "kk-KZ-AigulNeural",
      "title": "Aigul (kk-KZ, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "kk-KZ",
      "locale": "kk-KZ",
      "tags": [
        "Azure",
        "kk-KZ",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/kk-KZ-Aigul-General-Audio.wav"
    },
    {
      "name": "eu-ES-AinhoaNeural",
      "title": "Ainhoa (eu-ES, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "eu-ES",
      "locale": "eu-ES",
      "tags": [
        "Azure",
        "eu-ES",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/eu-ES-Ainhoa-General-Audio.wav"
    },
    {
      "name": "fr-FR-AlainNeural",
      "title": "Alain (French (France), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Alain-General-Audio.wav"
    },
    {
      "name": "ca-ES-AlbaNeural",
      "title": "Alba (ca-ES, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ca-ES",
      "locale": "ca-ES",
      "tags": [
        "Azure",
        "ca-ES",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ca-ES-Alba-General-Audio.wav"
    },
    {
      "name": "cy-GB-AledNeural",
      "title": "Aled (cy-GB, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "cy-GB",
      "locale": "cy-GB",
      "tags": [
        "Azure",
        "cy-GB",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/cy-GB-Aled-General-Audio.wav"
    },
    {
      "name": "mk-MK-AleksandarNeural",
      "title": "Aleksandar (mk-MK, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "mk-MK",
      "locale": "mk-MK",
      "tags": [
        "Azure",
        "mk-MK",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/mk-MK-Aleksandar-General-Audio.wav"
    },
    {
      "name": "it-IT-Alessio:DragonHDLatestNeural",
      "title": "Alessio:DragonHDLatest (Italian (Italy), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Alessio:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "it-IT-AlessioMultilingualNeural",
      "title": "AlessioMultilingual (Italian (Italy), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-AlessioMultilingual-General-Audio.wav"
    },
    {
      "name": "es-PE-AlexNeural",
      "title": "Alex (es-PE, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-PE",
      "locale": "es-PE",
      "tags": [
        "Azure",
        "es-PE",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-PE-Alex-General-Audio.wav"
    },
    {
      "name": "en-GB-AlfieNeural",
      "title": "Alfie (English (UK), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Alfie-General-Audio.wav"
    },
    {
      "name": "ar-BH-AliNeural",
      "title": "Ali (ar-BH, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-BH",
      "locale": "ar-BH",
      "tags": [
        "Azure",
        "ar-BH",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-BH-Ali-General-Audio.wav"
    },
    {
      "name": "ro-RO-AlinaNeural",
      "title": "Alina (ro-RO, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ro-RO",
      "locale": "ro-RO",
      "tags": [
        "Azure",
        "ro-RO",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ro-RO-Alina-General-Audio.wav"
    },
    {
      "name": "en-US-Alloy:DragonHDLatestNeural",
      "title": "Alloy:DragonHDLatest (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Alloy:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-AlloyTurboMultilingualNeural",
      "title": "AlloyTurboMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-AlloyTurboMultilingual-General-Audio.wav"
    },
    {
      "name": "es-US-AlonsoNeural",
      "title": "Alonso (es-US, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-US",
      "locale": "es-US",
      "tags": [
        "Azure",
        "es-US",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-US-Alonso-General-Audio.wav"
    },
    {
      "name": "es-ES-AlvaroNeural",
      "title": "Alvaro (Spanish (Spain), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Alvaro-General-Audio.wav"
    },
    {
      "name": "ar-QA-AmalNeural",
      "title": "Amal (ar-QA, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-QA",
      "locale": "ar-QA",
      "tags": [
        "Azure",
        "ar-QA",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-QA-Amal-General-Audio.wav"
    },
    {
      "name": "de-DE-AmalaNeural",
      "title": "Amala (German (Germany), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Amala-General-Audio.wav"
    },
    {
      "name": "en-US-AmandaMultilingualNeural",
      "title": "AmandaMultilingual (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-AmandaMultilingual-General-Audio.wav"
    },
    {
      "name": "ar-SY-AmanyNeural",
      "title": "Amany (ar-SY, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-SY",
      "locale": "ar-SY",
      "tags": [
        "Azure",
        "ar-SY",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-SY-Amany-General-Audio.wav"
    },
    {
      "name": "en-US-AmberNeural",
      "title": "Amber (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Amber-General-Audio.wav"
    },
    {
      "name": "am-ET-AmehaNeural",
      "title": "Ameha (am-ET, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "am-ET",
      "locale": "am-ET",
      "tags": [
        "Azure",
        "am-ET",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/am-ET-Ameha-General-Audio.wav"
    },
    {
      "name": "ar-DZ-AminaNeural",
      "title": "Amina (ar-DZ, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-DZ",
      "locale": "ar-DZ",
      "tags": [
        "Azure",
        "ar-DZ",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-DZ-Amina-General-Audio.wav"
    },
    {
      "name": "en-US-AnaNeural",
      "title": "Ana (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Ana-General-Audio.wav"
    },
    {
      "name": "hy-AM-AnahitNeural",
      "title": "Anahit (hy-AM, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "hy-AM",
      "locale": "hy-AM",
      "tags": [
        "Azure",
        "hy-AM",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hy-AM-Anahit-General-Audio.wav"
    },
    {
      "name": "en-IN-AnanyaNeural",
      "title": "Ananya (English (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Ananya-General-Audio.wav"
    },
    {
      "name": "hi-IN-AnanyaNeural",
      "title": "Ananya (Hindi (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Hindi (India)",
      "locale": "hi-IN",
      "tags": [
        "Azure",
        "Hindi (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Ananya-General-Audio.wav"
    },
    {
      "name": "ta-SG-AnbuNeural",
      "title": "Anbu (ta-SG, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ta-SG",
      "locale": "ta-SG",
      "tags": [
        "Azure",
        "ta-SG",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ta-SG-Anbu-General-Audio.wav"
    },
    {
      "name": "eu-ES-AnderNeural",
      "title": "Ander (eu-ES, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "eu-ES",
      "locale": "eu-ES",
      "tags": [
        "Azure",
        "eu-ES",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/eu-ES-Ander-General-Audio.wav"
    },
    {
      "name": "es-EC-AndreaNeural",
      "title": "Andrea (es-EC, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-EC",
      "locale": "es-EC",
      "tags": [
        "Azure",
        "es-EC",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-EC-Andrea-General-Audio.wav"
    },
    {
      "name": "es-GT-AndresNeural",
      "title": "Andres (es-GT, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-GT",
      "locale": "es-GT",
      "tags": [
        "Azure",
        "es-GT",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-GT-Andres-General-Audio.wav"
    },
    {
      "name": "en-US-AndrewNeural",
      "title": "Andrew (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Andrew-General-Audio.wav"
    },
    {
      "name": "en-US-Andrew:DragonHDLatestNeural",
      "title": "Andrew:DragonHDLatest (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Andrew:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-Andrew:DragonHDOmniLatestNeural",
      "title": "Andrew:DragonHDOmniLatest (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Andrew:DragonHDOmniLatest-General-Audio.wav"
    },
    {
      "name": "en-US-AndrewMultilingualNeural",
      "title": "AndrewMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-AndrewMultilingual-General-Audio.wav"
    },
    {
      "name": "en-US-Andrew2:DragonHDLatestNeural",
      "title": "Andrew2:DragonHDLatest (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Andrew2:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-Andrew3:DragonHDLatestNeural",
      "title": "Andrew3:DragonHDLatest (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Andrew3:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "fil-PH-AngeloNeural",
      "title": "Angelo (fil-PH, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "fil-PH",
      "locale": "fil-PH",
      "tags": [
        "Azure",
        "fil-PH",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fil-PH-Angelo-General-Audio.wav"
    },
    {
      "name": "sq-AL-AnilaNeural",
      "title": "Anila (sq-AL, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "sq-AL",
      "locale": "sq-AL",
      "tags": [
        "Azure",
        "sq-AL",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sq-AL-Anila-General-Audio.wav"
    },
    {
      "name": "en-AU-AnnetteNeural",
      "title": "Annette (English (Australia), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-Annette-General-Audio.wav"
    },
    {
      "name": "fr-CA-AntoineNeural",
      "title": "Antoine (fr-CA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "fr-CA",
      "locale": "fr-CA",
      "tags": [
        "Azure",
        "fr-CA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-CA-Antoine-General-Audio.wav"
    },
    {
      "name": "cs-CZ-AntoninNeural",
      "title": "Antonin (cs-CZ, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "cs-CZ",
      "locale": "cs-CZ",
      "tags": [
        "Azure",
        "cs-CZ",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/cs-CZ-Antonin-General-Audio.wav"
    },
    {
      "name": "pt-BR-AntonioNeural",
      "title": "Antonio (Portuguese (Brazil), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Antonio-General-Audio.wav"
    },
    {
      "name": "et-EE-AnuNeural",
      "title": "Anu (et-EE, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "et-EE",
      "locale": "et-EE",
      "tags": [
        "Azure",
        "et-EE",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/et-EE-Anu-General-Audio.wav"
    },
    {
      "name": "ja-JP-AoiNeural",
      "title": "Aoi (Japanese (Japan), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Japanese (Japan)",
      "locale": "ja-JP",
      "tags": [
        "Azure",
        "Japanese (Japan)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ja-JP-Aoi-General-Audio.wav"
    },
    {
      "name": "es-ES-ArabellaMultilingualNeural",
      "title": "ArabellaMultilingual (Spanish (Spain), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-ArabellaMultilingual-General-Audio.wav"
    },
    {
      "name": "id-ID-ArdiNeural",
      "title": "Ardi (id-ID, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "id-ID",
      "locale": "id-ID",
      "tags": [
        "Azure",
        "id-ID",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/id-ID-Ardi-General-Audio.wav"
    },
    {
      "name": "en-US-AriaNeural",
      "title": "Aria (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Aria-General-Audio.wav"
    },
    {
      "name": "en-US-Aria:DragonHDLatestNeural",
      "title": "Aria:DragonHDLatest (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Aria:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "fr-CH-ArianeNeural",
      "title": "Ariane (fr-CH, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "fr-CH",
      "locale": "fr-CH",
      "tags": [
        "Azure",
        "fr-CH",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-CH-Ariane-General-Audio.wav"
    },
    {
      "name": "en-IN-ArjunNeural",
      "title": "Arjun (English (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Arjun-General-Audio.wav"
    },
    {
      "name": "hi-IN-ArjunNeural",
      "title": "Arjun (Hindi (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Hindi (India)",
      "locale": "hi-IN",
      "tags": [
        "Azure",
        "Hindi (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Arjun-General-Audio.wav"
    },
    {
      "name": "en-IN-Arjun:DragonHDIndicLatestNeural",
      "title": "Arjun:DragonHDIndicLatest (English (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Arjun:DragonHDIndicLatest-General-Audio.wav"
    },
    {
      "name": "en-IN-Arjun:DragonHDLatestNeural",
      "title": "Arjun:DragonHDLatest (English (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Arjun:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-IN-ArjunIndicNeural",
      "title": "ArjunIndic (English (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-ArjunIndic-General-Audio.wav"
    },
    {
      "name": "es-ES-ArnauNeural",
      "title": "Arnau (Spanish (Spain), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Arnau-General-Audio.wav"
    },
    {
      "name": "nl-BE-ArnaudNeural",
      "title": "Arnaud (nl-BE, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "nl-BE",
      "locale": "nl-BE",
      "tags": [
        "Azure",
        "nl-BE",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/nl-BE-Arnaud-General-Audio.wav"
    },
    {
      "name": "ur-PK-AsadNeural",
      "title": "Asad (ur-PK, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ur-PK",
      "locale": "ur-PK",
      "tags": [
        "Azure",
        "ur-PK",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ur-PK-Asad-General-Audio.wav"
    },
    {
      "name": "en-US-AshleyNeural",
      "title": "Ashley (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Ashley-General-Audio.wav"
    },
    {
      "name": "en-KE-AsiliaNeural",
      "title": "Asilia (en-KE, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "en-KE",
      "locale": "en-KE",
      "tags": [
        "Azure",
        "en-KE",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-KE-Asilia-General-Audio.wav"
    },
    {
      "name": "el-GR-AthinaNeural",
      "title": "Athina (el-GR, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "el-GR",
      "locale": "el-GR",
      "tags": [
        "Azure",
        "el-GR",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/el-GR-Athina-General-Audio.wav"
    },
    {
      "name": "en-US-AvaNeural",
      "title": "Ava (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Ava-General-Audio.wav"
    },
    {
      "name": "en-US-Ava:DragonHDLatestNeural",
      "title": "Ava:DragonHDLatest (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Ava:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-us-ava:DragonHDOmniLatestNeural",
      "title": "ava:DragonHDOmniLatest (en-us, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "en-us",
      "locale": "en-us",
      "tags": [
        "Azure",
        "en-us",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-us-ava:DragonHDOmniLatest-General-Audio.wav"
    },
    {
      "name": "en-US-AvaMultilingualNeural",
      "title": "AvaMultilingual (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-AvaMultilingual-General-Audio.wav"
    },
    {
      "name": "en-US-Ava3:DragonHDLatestNeural",
      "title": "Ava3:DragonHDLatest (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Ava3:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "he-IL-AvriNeural",
      "title": "Avri (he-IL, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "he-IL",
      "locale": "he-IL",
      "tags": [
        "Azure",
        "he-IL",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/he-IL-Avri-General-Audio.wav"
    },
    {
      "name": "ar-OM-AyshaNeural",
      "title": "Aysha (ar-OM, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-OM",
      "locale": "ar-OM",
      "tags": [
        "Azure",
        "ar-OM",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-OM-Aysha-General-Audio.wav"
    },
    {
      "name": "az-AZ-BabekNeural",
      "title": "Babek (az-AZ, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "az-AZ",
      "locale": "az-AZ",
      "tags": [
        "Azure",
        "az-AZ",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/az-AZ-Babek-General-Audio.wav"
    },
    {
      "name": "az-AZ-BanuNeural",
      "title": "Banu (az-AZ, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "az-AZ",
      "locale": "az-AZ",
      "tags": [
        "Azure",
        "az-AZ",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/az-AZ-Banu-General-Audio.wav"
    },
    {
      "name": "bn-IN-BashkarNeural",
      "title": "Bashkar (Bengali (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Bengali (India)",
      "locale": "bn-IN",
      "tags": [
        "Azure",
        "Bengali (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/bn-IN-Bashkar-General-Audio.wav"
    },
    {
      "name": "ar-IQ-BasselNeural",
      "title": "Bassel (ar-IQ, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-IQ",
      "locale": "ar-IQ",
      "tags": [
        "Azure",
        "ar-IQ",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-IQ-Bassel-General-Audio.wav"
    },
    {
      "name": "mn-MN-BataaNeural",
      "title": "Bataa (mn-MN, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "mn-MN",
      "locale": "mn-MN",
      "tags": [
        "Azure",
        "mn-MN",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/mn-MN-Bataa-General-Audio.wav"
    },
    {
      "name": "es-MX-BeatrizNeural",
      "title": "Beatriz (Spanish (Mexico), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Beatriz-General-Audio.wav"
    },
    {
      "name": "es-CU-BelkysNeural",
      "title": "Belkys (es-CU, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-CU",
      "locale": "es-CU",
      "tags": [
        "Azure",
        "es-CU",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-CU-Belkys-General-Audio.wav"
    },
    {
      "name": "en-GB-BellaNeural",
      "title": "Bella (English (UK), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Bella-General-Audio.wav"
    },
    {
      "name": "it-IT-BenignoNeural",
      "title": "Benigno (Italian (Italy), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Benigno-General-Audio.wav"
    },
    {
      "name": "de-DE-BerndNeural",
      "title": "Bernd (German (Germany), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Bernd-General-Audio.wav"
    },
    {
      "name": "fil-PH-BlessicaNeural",
      "title": "Blessica (fil-PH, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "fil-PH",
      "locale": "fil-PH",
      "tags": [
        "Azure",
        "fil-PH",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fil-PH-Blessica-General-Audio.wav"
    },
    {
      "name": "ko-KR-BongJinNeural",
      "title": "BongJin (Korean (Korea), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Korean (Korea)",
      "locale": "ko-KR",
      "tags": [
        "Azure",
        "Korean (Korea)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ko-KR-BongJin-General-Audio.wav"
    },
    {
      "name": "bg-BG-BorislavNeural",
      "title": "Borislav (bg-BG, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "bg-BG",
      "locale": "bg-BG",
      "tags": [
        "Azure",
        "bg-BG",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/bg-BG-Borislav-General-Audio.wav"
    },
    {
      "name": "en-US-BrandonNeural",
      "title": "Brandon (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Brandon-General-Audio.wav"
    },
    {
      "name": "en-US-BrandonMultilingualNeural",
      "title": "BrandonMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-BrandonMultilingual-General-Audio.wav"
    },
    {
      "name": "en-US-Bree:DragonHDLatestNeural",
      "title": "Bree:DragonHDLatest (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Bree:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "pt-BR-BrendaNeural",
      "title": "Brenda (Portuguese (Brazil), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Brenda-General-Audio.wav"
    },
    {
      "name": "en-US-BrianNeural",
      "title": "Brian (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Brian-General-Audio.wav"
    },
    {
      "name": "en-US-Brian:DragonHDLatestNeural",
      "title": "Brian:DragonHDLatest (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Brian:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-BrianMultilingualNeural",
      "title": "BrianMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-BrianMultilingual-General-Audio.wav"
    },
    {
      "name": "fr-FR-BrigitteNeural",
      "title": "Brigitte (French (France), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Brigitte-General-Audio.wav"
    },
    {
      "name": "en-US-Caleb:DragonHDOmniLatestNeural",
      "title": "Caleb:DragonHDOmniLatest (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Caleb:DragonHDOmniLatest-General-Audio.wav"
    },
    {
      "name": "it-IT-CalimeroNeural",
      "title": "Calimero (Italian (Italy), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Calimero-General-Audio.wav"
    },
    {
      "name": "es-PE-CamilaNeural",
      "title": "Camila (es-PE, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-PE",
      "locale": "es-PE",
      "tags": [
        "Azure",
        "es-PE",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-PE-Camila-General-Audio.wav"
    },
    {
      "name": "es-MX-CandelaNeural",
      "title": "Candela (Spanish (Mexico), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Candela-General-Audio.wav"
    },
    {
      "name": "es-HN-CarlosNeural",
      "title": "Carlos (es-HN, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-HN",
      "locale": "es-HN",
      "tags": [
        "Azure",
        "es-HN",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-HN-Carlos-General-Audio.wav"
    },
    {
      "name": "es-MX-CarlotaNeural",
      "title": "Carlota (Spanish (Mexico), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Carlota-General-Audio.wav"
    },
    {
      "name": "en-AU-CarlyNeural",
      "title": "Carly (English (Australia), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-Carly-General-Audio.wav"
    },
    {
      "name": "it-IT-CataldoNeural",
      "title": "Cataldo (Italian (Italy), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Cataldo-General-Audio.wav"
    },
    {
      "name": "es-CL-CatalinaNeural",
      "title": "Catalina (es-CL, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-CL",
      "locale": "es-CL",
      "tags": [
        "Azure",
        "es-CL",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-CL-Catalina-General-Audio.wav"
    },
    {
      "name": "es-MX-CecilioNeural",
      "title": "Cecilio (Spanish (Mexico), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Cecilio-General-Audio.wav"
    },
    {
      "name": "fr-FR-CelesteNeural",
      "title": "Celeste (French (France), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Celeste-General-Audio.wav"
    },
    {
      "name": "lo-LA-ChanthavongNeural",
      "title": "Chanthavong (lo-LA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "lo-LA",
      "locale": "lo-LA",
      "tags": [
        "Azure",
        "lo-LA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/lo-LA-Chanthavong-General-Audio.wav"
    },
    {
      "name": "fr-BE-CharlineNeural",
      "title": "Charline (fr-BE, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "fr-BE",
      "locale": "fr-BE",
      "tags": [
        "Azure",
        "fr-BE",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-BE-Charline-General-Audio.wav"
    },
    {
      "name": "en-KE-ChilembaNeural",
      "title": "Chilemba (en-KE, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "en-KE",
      "locale": "en-KE",
      "tags": [
        "Azure",
        "en-KE",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-KE-Chilemba-General-Audio.wav"
    },
    {
      "name": "da-DK-ChristelNeural",
      "title": "Christel (da-DK, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "da-DK",
      "locale": "da-DK",
      "tags": [
        "Azure",
        "da-DK",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/da-DK-Christel-General-Audio.wav"
    },
    {
      "name": "de-DE-ChristophNeural",
      "title": "Christoph (German (Germany), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Christoph-General-Audio.wav"
    },
    {
      "name": "en-US-ChristopherNeural",
      "title": "Christopher (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Christopher-General-Audio.wav"
    },
    {
      "name": "en-US-ChristopherMultilingualNeural",
      "title": "ChristopherMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-ChristopherMultilingual-General-Audio.wav"
    },
    {
      "name": "en-CA-ClaraNeural",
      "title": "Clara (en-CA, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "en-CA",
      "locale": "en-CA",
      "tags": [
        "Azure",
        "en-CA",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-CA-Clara-General-Audio.wav"
    },
    {
      "name": "fr-FR-ClaudeNeural",
      "title": "Claude (French (France), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Claude-General-Audio.wav"
    },
    {
      "name": "nl-NL-ColetteNeural",
      "title": "Colette (nl-NL, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "nl-NL",
      "locale": "nl-NL",
      "tags": [
        "Azure",
        "nl-NL",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/nl-NL-Colette-General-Audio.wav"
    },
    {
      "name": "ga-IE-ColmNeural",
      "title": "Colm (ga-IE, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ga-IE",
      "locale": "ga-IE",
      "tags": [
        "Azure",
        "ga-IE",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ga-IE-Colm-General-Audio.wav"
    },
    {
      "name": "en-IE-ConnorNeural",
      "title": "Connor (en-IE, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "en-IE",
      "locale": "en-IE",
      "tags": [
        "Azure",
        "en-IE",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IE-Connor-General-Audio.wav"
    },
    {
      "name": "de-DE-ConradNeural",
      "title": "Conrad (German (Germany), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Conrad-General-Audio.wav"
    },
    {
      "name": "en-US-CoraNeural",
      "title": "Cora (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Cora-General-Audio.wav"
    },
    {
      "name": "en-US-CoraMultilingualNeural",
      "title": "CoraMultilingual (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-CoraMultilingual-General-Audio.wav"
    },
    {
      "name": "fr-FR-CoralieNeural",
      "title": "Coralie (French (France), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Coralie-General-Audio.wav"
    },
    {
      "name": "ja-JP-DaichiNeural",
      "title": "Daichi (Japanese (Japan), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Japanese (Japan)",
      "locale": "ja-JP",
      "tags": [
        "Azure",
        "Japanese (Japan)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ja-JP-Daichi-General-Audio.wav"
    },
    {
      "name": "es-MX-DaliaNeural",
      "title": "Dalia (Spanish (Mexico), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Dalia-General-Audio.wav"
    },
    {
      "name": "es-MX-DaliaMultilingualNeural",
      "title": "DaliaMultilingual (Spanish (Mexico), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-DaliaMultilingual-General-Audio.wav"
    },
    {
      "name": "en-US-Dana:DragonHDOmniLatestNeural",
      "title": "Dana:DragonHDOmniLatest (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Dana:DragonHDOmniLatest-General-Audio.wav"
    },
    {
      "name": "es-ES-DarioNeural",
      "title": "Dario (Spanish (Spain), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Dario-General-Audio.wav"
    },
    {
      "name": "ru-RU-DariyaNeural",
      "title": "Dariya (Russian (Russia), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Russian (Russia)",
      "locale": "ru-RU",
      "tags": [
        "Azure",
        "Russian (Russia)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ru-RU-Dariya-General-Audio.wav"
    },
    {
      "name": "en-AU-DarrenNeural",
      "title": "Darren (English (Australia), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-Darren-General-Audio.wav"
    },
    {
      "name": "sw-TZ-DaudiNeural",
      "title": "Daudi (sw-TZ, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "sw-TZ",
      "locale": "sw-TZ",
      "tags": [
        "Azure",
        "sw-TZ",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sw-TZ-Daudi-General-Audio.wav"
    },
    {
      "name": "kk-KZ-DauletNeural",
      "title": "Daulet (kk-KZ, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "kk-KZ",
      "locale": "kk-KZ",
      "tags": [
        "Azure",
        "kk-KZ",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/kk-KZ-Daulet-General-Audio.wav"
    },
    {
      "name": "en-US-DavisNeural",
      "title": "Davis (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Davis-General-Audio.wav"
    },
    {
      "name": "en-US-Davis:DragonHDLatestNeural",
      "title": "Davis:DragonHDLatest (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Davis:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-DavisMultilingualNeural",
      "title": "DavisMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-DavisMultilingual-General-Audio.wav"
    },
    {
      "name": "nl-BE-DenaNeural",
      "title": "Dena (nl-BE, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "nl-BE",
      "locale": "nl-BE",
      "tags": [
        "Azure",
        "nl-BE",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/nl-BE-Dena-General-Audio.wav"
    },
    {
      "name": "fr-FR-DeniseNeural",
      "title": "Denise (French (France), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Denise-General-Audio.wav"
    },
    {
      "name": "en-US-DerekMultilingualNeural",
      "title": "DerekMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-DerekMultilingual-General-Audio.wav"
    },
    {
      "name": "gu-IN-DhwaniNeural",
      "title": "Dhwani (Gujarati (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Gujarati (India)",
      "locale": "gu-IN",
      "tags": [
        "Azure",
        "Gujarati (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/gu-IN-Dhwani-General-Audio.wav"
    },
    {
      "name": "it-IT-DiegoNeural",
      "title": "Diego (Italian (Italy), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Diego-General-Audio.wav"
    },
    {
      "name": "fa-IR-DilaraNeural",
      "title": "Dilara (fa-IR, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "fa-IR",
      "locale": "fa-IR",
      "tags": [
        "Azure",
        "fa-IR",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fa-IR-Dilara-General-Audio.wav"
    },
    {
      "name": "jv-ID-DimasNeural",
      "title": "Dimas (jv-ID, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "jv-ID",
      "locale": "jv-ID",
      "tags": [
        "Azure",
        "jv-ID",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/jv-ID-Dimas-General-Audio.wav"
    },
    {
      "name": "ru-RU-DmitryNeural",
      "title": "Dmitry (Russian (Russia), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Russian (Russia)",
      "locale": "ru-RU",
      "tags": [
        "Azure",
        "Russian (Russia)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ru-RU-Dmitry-General-Audio.wav"
    },
    {
      "name": "pt-BR-DonatoNeural",
      "title": "Donato (Portuguese (Brazil), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Donato-General-Audio.wav"
    },
    {
      "name": "pt-PT-DuarteNeural",
      "title": "Duarte (pt-PT, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "pt-PT",
      "locale": "pt-PT",
      "tags": [
        "Azure",
        "pt-PT",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-PT-Duarte-General-Audio.wav"
    },
    {
      "name": "en-AU-DuncanNeural",
      "title": "Duncan (English (Australia), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-Duncan-General-Audio.wav"
    },
    {
      "name": "en-US-DustinMultilingualNeural",
      "title": "DustinMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-DustinMultilingual-General-Audio.wav"
    },
    {
      "name": "en-US-EchoTurboMultilingualNeural",
      "title": "EchoTurboMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-EchoTurboMultilingual-General-Audio.wav"
    },
    {
      "name": "ka-GE-EkaNeural",
      "title": "Eka (ka-GE, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ka-GE",
      "locale": "ka-GE",
      "tags": [
        "Azure",
        "ka-GE",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ka-GE-Eka-General-Audio.wav"
    },
    {
      "name": "es-AR-ElenaNeural",
      "title": "Elena (es-AR, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-AR",
      "locale": "es-AR",
      "tags": [
        "Azure",
        "es-AR",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-AR-Elena-General-Audio.wav"
    },
    {
      "name": "es-ES-EliasNeural",
      "title": "Elias (Spanish (Spain), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Elias-General-Audio.wav"
    },
    {
      "name": "en-TZ-ElimuNeural",
      "title": "Elimu (en-TZ, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "en-TZ",
      "locale": "en-TZ",
      "tags": [
        "Azure",
        "en-TZ",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-TZ-Elimu-General-Audio.wav"
    },
    {
      "name": "en-US-ElizabethNeural",
      "title": "Elizabeth (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Elizabeth-General-Audio.wav"
    },
    {
      "name": "de-DE-ElkeNeural",
      "title": "Elke (German (Germany), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Elke-General-Audio.wav"
    },
    {
      "name": "en-GB-ElliotNeural",
      "title": "Elliot (English (UK), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Elliot-General-Audio.wav"
    },
    {
      "name": "fr-FR-EloiseNeural",
      "title": "Eloise (French (France), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Eloise-General-Audio.wav"
    },
    {
      "name": "it-IT-ElsaNeural",
      "title": "Elsa (Italian (Italy), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Elsa-General-Audio.wav"
    },
    {
      "name": "en-AU-ElsieNeural",
      "title": "Elsie (English (Australia), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-Elsie-General-Audio.wav"
    },
    {
      "name": "es-ES-ElviraNeural",
      "title": "Elvira (Spanish (Spain), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Elvira-General-Audio.wav"
    },
    {
      "name": "pt-BR-ElzaNeural",
      "title": "Elza (Portuguese (Brazil), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Elza-General-Audio.wav"
    },
    {
      "name": "tr-TR-EmelNeural",
      "title": "Emel (tr-TR, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "tr-TR",
      "locale": "tr-TR",
      "tags": [
        "Azure",
        "tr-TR",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/tr-TR-Emel-General-Audio.wav"
    },
    {
      "name": "ro-RO-EmilNeural",
      "title": "Emil (ro-RO, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ro-RO",
      "locale": "ro-RO",
      "tags": [
        "Azure",
        "ro-RO",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ro-RO-Emil-General-Audio.wav"
    },
    {
      "name": "es-DO-EmilioNeural",
      "title": "Emilio (es-DO, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-DO",
      "locale": "es-DO",
      "tags": [
        "Azure",
        "es-DO",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-DO-Emilio-General-Audio.wav"
    },
    {
      "name": "en-IE-EmilyNeural",
      "title": "Emily (en-IE, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "en-IE",
      "locale": "en-IE",
      "tags": [
        "Azure",
        "en-IE",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IE-Emily-General-Audio.wav"
    },
    {
      "name": "en-US-EmmaNeural",
      "title": "Emma (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Emma-General-Audio.wav"
    },
    {
      "name": "en-US-Emma:DragonHDLatestNeural",
      "title": "Emma:DragonHDLatest (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Emma:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-EmmaMultilingualNeural",
      "title": "EmmaMultilingual (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-EmmaMultilingual-General-Audio.wav"
    },
    {
      "name": "en-US-Emma2:DragonHDLatestNeural",
      "title": "Emma2:DragonHDLatest (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Emma2:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "ca-ES-EnricNeural",
      "title": "Enric (ca-ES, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ca-ES",
      "locale": "ca-ES",
      "tags": [
        "Azure",
        "ca-ES",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ca-ES-Enric-General-Audio.wav"
    },
    {
      "name": "en-US-EricNeural",
      "title": "Eric (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Eric-General-Audio.wav"
    },
    {
      "name": "es-ES-EstrellaNeural",
      "title": "Estrella (Spanish (Spain), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Estrella-General-Audio.wav"
    },
    {
      "name": "en-GB-EthanNeural",
      "title": "Ethan (English (UK), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Ethan-General-Audio.wav"
    },
    {
      "name": "en-US-EvelynMultilingualNeural",
      "title": "EvelynMultilingual (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-EvelynMultilingual-General-Audio.wav"
    },
    {
      "name": "lv-LV-EveritaNeural",
      "title": "Everita (lv-LV, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "lv-LV",
      "locale": "lv-LV",
      "tags": [
        "Azure",
        "lv-LV",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/lv-LV-Everita-General-Audio.wav"
    },
    {
      "name": "en-NG-EzinneNeural",
      "title": "Ezinne (en-NG, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "en-NG",
      "locale": "en-NG",
      "tags": [
        "Azure",
        "en-NG",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-NG-Ezinne-General-Audio.wav"
    },
    {
      "name": "pt-BR-FabioNeural",
      "title": "Fabio (Portuguese (Brazil), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Fabio-General-Audio.wav"
    },
    {
      "name": "it-IT-FabiolaNeural",
      "title": "Fabiola (Italian (Italy), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Fabiola-General-Audio.wav"
    },
    {
      "name": "en-US-FableTurboMultilingualNeural",
      "title": "FableTurboMultilingual (English (US), Neutral)",
      "provider": "azure",
      "gender": "neutral",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "neutral"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-FableTurboMultilingual-General-Audio.wav"
    },
    {
      "name": "fr-CH-FabriceNeural",
      "title": "Fabrice (fr-CH, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "fr-CH",
      "locale": "fr-CH",
      "tags": [
        "Azure",
        "fr-CH",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-CH-Fabrice-General-Audio.wav"
    },
    {
      "name": "ar-KW-FahedNeural",
      "title": "Fahed (ar-KW, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-KW",
      "locale": "ar-KW",
      "tags": [
        "Azure",
        "ar-KW",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-KW-Fahed-General-Audio.wav"
    },
    {
      "name": "fa-IR-FaridNeural",
      "title": "Farid (fa-IR, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "fa-IR",
      "locale": "fa-IR",
      "tags": [
        "Azure",
        "fa-IR",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fa-IR-Farid-General-Audio.wav"
    },
    {
      "name": "ar-AE-FatimaNeural",
      "title": "Fatima (Arabic (UAE), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Arabic (UAE)",
      "locale": "ar-AE",
      "tags": [
        "Azure",
        "Arabic (UAE)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-AE-Fatima-General-Audio.wav"
    },
    {
      "name": "es-NI-FedericoNeural",
      "title": "Federico (es-NI, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-NI",
      "locale": "es-NI",
      "tags": [
        "Azure",
        "es-NI",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-NI-Federico-General-Audio.wav"
    },
    {
      "name": "nl-NL-FennaNeural",
      "title": "Fenna (nl-NL, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "nl-NL",
      "locale": "nl-NL",
      "tags": [
        "Azure",
        "nl-NL",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/nl-NL-Fenna-General-Audio.wav"
    },
    {
      "name": "pt-PT-FernandaNeural",
      "title": "Fernanda (pt-PT, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "pt-PT",
      "locale": "pt-PT",
      "tags": [
        "Azure",
        "pt-PT",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-PT-Fernanda-General-Audio.wav"
    },
    {
      "name": "it-IT-FiammaNeural",
      "title": "Fiamma (Italian (Italy), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Fiamma-General-Audio.wav"
    },
    {
      "name": "nb-NO-FinnNeural",
      "title": "Finn (nb-NO, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "nb-NO",
      "locale": "nb-NO",
      "tags": [
        "Azure",
        "nb-NO",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/nb-NO-Finn-General-Audio.wav"
    },
    {
      "name": "de-DE-Florian:DragonHDLatestNeural",
      "title": "Florian:DragonHDLatest (German (Germany), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Florian:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "de-DE-FlorianMultilingualNeural",
      "title": "FlorianMultilingual (German (Germany), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-FlorianMultilingual-General-Audio.wav"
    },
    {
      "name": "pt-BR-FranciscaNeural",
      "title": "Francisca (Portuguese (Brazil), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Francisca-General-Audio.wav"
    },
    {
      "name": "en-AU-FreyaNeural",
      "title": "Freya (English (Australia), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-Freya-General-Audio.wav"
    },
    {
      "name": "hr-HR-GabrijelaNeural",
      "title": "Gabrijela (hr-HR, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "hr-HR",
      "locale": "hr-HR",
      "tags": [
        "Azure",
        "hr-HR",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hr-HR-Gabrijela-General-Audio.wav"
    },
    {
      "name": "id-ID-GadisNeural",
      "title": "Gadis (id-ID, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "id-ID",
      "locale": "id-ID",
      "tags": [
        "Azure",
        "id-ID",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/id-ID-Gadis-General-Audio.wav"
    },
    {
      "name": "kn-IN-GaganNeural",
      "title": "Gagan (Kannada (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Kannada (India)",
      "locale": "kn-IN",
      "tags": [
        "Azure",
        "Kannada (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/kn-IN-Gagan-General-Audio.wav"
    },
    {
      "name": "fr-BE-GerardNeural",
      "title": "Gerard (fr-BE, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "fr-BE",
      "locale": "fr-BE",
      "tags": [
        "Azure",
        "fr-BE",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-BE-Gerard-General-Audio.wav"
    },
    {
      "name": "es-MX-GerardoNeural",
      "title": "Gerardo (Spanish (Mexico), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Gerardo-General-Audio.wav"
    },
    {
      "name": "it-IT-GianniNeural",
      "title": "Gianni (Italian (Italy), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Gianni-General-Audio.wav"
    },
    {
      "name": "ka-GE-GiorgiNeural",
      "title": "Giorgi (ka-GE, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ka-GE",
      "locale": "ka-GE",
      "tags": [
        "Azure",
        "ka-GE",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ka-GE-Giorgi-General-Audio.wav"
    },
    {
      "name": "pt-BR-GiovannaNeural",
      "title": "Giovanna (Portuguese (Brazil), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Giovanna-General-Audio.wav"
    },
    {
      "name": "de-DE-GiselaNeural",
      "title": "Gisela (German (Germany), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Gisela-General-Audio.wav"
    },
    {
      "name": "it-IT-GiuseppeNeural",
      "title": "Giuseppe (Italian (Italy), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Giuseppe-General-Audio.wav"
    },
    {
      "name": "it-IT-GiuseppeMultilingualNeural",
      "title": "GiuseppeMultilingual (Italian (Italy), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-GiuseppeMultilingual-General-Audio.wav"
    },
    {
      "name": "es-CO-GonzaloNeural",
      "title": "Gonzalo (es-CO, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-CO",
      "locale": "es-CO",
      "tags": [
        "Azure",
        "es-CO",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-CO-Gonzalo-General-Audio.wav"
    },
    {
      "name": "ko-KR-GookMinNeural",
      "title": "GookMin (Korean (Korea), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Korean (Korea)",
      "locale": "ko-KR",
      "tags": [
        "Azure",
        "Korean (Korea)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ko-KR-GookMin-General-Audio.wav"
    },
    {
      "name": "bs-BA-GoranNeural",
      "title": "Goran (bs-BA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "bs-BA",
      "locale": "bs-BA",
      "tags": [
        "Azure",
        "bs-BA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/bs-BA-Goran-General-Audio.wav"
    },
    {
      "name": "mt-MT-GraceNeural",
      "title": "Grace (mt-MT, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "mt-MT",
      "locale": "mt-MT",
      "tags": [
        "Azure",
        "mt-MT",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/mt-MT-Grace-General-Audio.wav"
    },
    {
      "name": "en-US-Grant:MAI-Voice-1",
      "title": "1 (English (US), Neutral)",
      "provider": "azure",
      "gender": "neutral",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "neutral"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Grant:MAI-Voice-1-General-Audio.wav"
    },
    {
      "name": "is-IS-GudrunNeural",
      "title": "Gudrun (is-IS, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "is-IS",
      "locale": "is-IS",
      "tags": [
        "Azure",
        "is-IS",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/is-IS-Gudrun-General-Audio.wav"
    },
    {
      "name": "ur-IN-GulNeural",
      "title": "Gul (Urdu (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Urdu (India)",
      "locale": "ur-IN",
      "tags": [
        "Azure",
        "Urdu (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ur-IN-Gul-General-Audio.wav"
    },
    {
      "name": "ps-AF-GulNawazNeural",
      "title": "GulNawaz (ps-AF, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ps-AF",
      "locale": "ps-AF",
      "tags": [
        "Azure",
        "ps-AF",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ps-AF-GulNawaz-General-Audio.wav"
    },
    {
      "name": "is-IS-GunnarNeural",
      "title": "Gunnar (is-IS, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "is-IS",
      "locale": "is-IS",
      "tags": [
        "Azure",
        "is-IS",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/is-IS-Gunnar-General-Audio.wav"
    },
    {
      "name": "en-US-GuyNeural",
      "title": "Guy (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Guy-General-Audio.wav"
    },
    {
      "name": "ar-AE-HamdanNeural",
      "title": "Hamdan (Arabic (UAE), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Arabic (UAE)",
      "locale": "ar-AE",
      "tags": [
        "Azure",
        "Arabic (UAE)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-AE-Hamdan-General-Audio.wav"
    },
    {
      "name": "ar-SA-HamedNeural",
      "title": "Hamed (Arabic (Saudi Arabia), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Arabic (Saudi Arabia)",
      "locale": "ar-SA",
      "tags": [
        "Azure",
        "Arabic (Saudi Arabia)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-SA-Hamed-General-Audio.wav"
    },
    {
      "name": "fi-FI-HarriNeural",
      "title": "Harri (fi-FI, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "fi-FI",
      "locale": "fi-FI",
      "tags": [
        "Azure",
        "fi-FI",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fi-FI-Harri-General-Audio.wav"
    },
    {
      "name": "hy-AM-HaykNeural",
      "title": "Hayk (hy-AM, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "hy-AM",
      "locale": "hy-AM",
      "tags": [
        "Azure",
        "hy-AM",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hy-AM-Hayk-General-Audio.wav"
    },
    {
      "name": "ar-TN-HediNeural",
      "title": "Hedi (ar-TN, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-TN",
      "locale": "ar-TN",
      "tags": [
        "Azure",
        "ar-TN",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-TN-Hedi-General-Audio.wav"
    },
    {
      "name": "ne-NP-HemkalaNeural",
      "title": "Hemkala (ne-NP, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ne-NP",
      "locale": "ne-NP",
      "tags": [
        "Azure",
        "ne-NP",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ne-NP-Hemkala-General-Audio.wav"
    },
    {
      "name": "fr-FR-HenriNeural",
      "title": "Henri (French (France), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Henri-General-Audio.wav"
    },
    {
      "name": "he-IL-HilaNeural",
      "title": "Hila (he-IL, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "he-IL",
      "locale": "he-IL",
      "tags": [
        "Azure",
        "he-IL",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/he-IL-Hila-General-Audio.wav"
    },
    {
      "name": "sv-SE-HilleviNeural",
      "title": "Hillevi (sv-SE, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "sv-SE",
      "locale": "sv-SE",
      "tags": [
        "Azure",
        "sv-SE",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sv-SE-Hillevi-General-Audio.wav"
    },
    {
      "name": "zh-HK-HiuGaaiNeural",
      "title": "HiuGaai (zh-HK, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "zh-HK",
      "locale": "zh-HK",
      "tags": [
        "Azure",
        "zh-HK",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-HK-HiuGaai-General-Audio.wav"
    },
    {
      "name": "zh-HK-HiuMaanNeural",
      "title": "HiuMaan (zh-HK, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "zh-HK",
      "locale": "zh-HK",
      "tags": [
        "Azure",
        "zh-HK",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-HK-HiuMaan-General-Audio.wav"
    },
    {
      "name": "vi-VN-HoaiMyNeural",
      "title": "HoaiMy (vi-VN, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "vi-VN",
      "locale": "vi-VN",
      "tags": [
        "Azure",
        "vi-VN",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/vi-VN-HoaiMy-General-Audio.wav"
    },
    {
      "name": "en-GB-HollieNeural",
      "title": "Hollie (English (UK), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Hollie-General-Audio.wav"
    },
    {
      "name": "zh-TW-HsiaoChenNeural",
      "title": "HsiaoChen (zh-TW, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "zh-TW",
      "locale": "zh-TW",
      "tags": [
        "Azure",
        "zh-TW",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-TW-HsiaoChen-General-Audio.wav"
    },
    {
      "name": "zh-TW-HsiaoYuNeural",
      "title": "HsiaoYu (zh-TW, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "zh-TW",
      "locale": "zh-TW",
      "tags": [
        "Azure",
        "zh-TW",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-TW-HsiaoYu-General-Audio.wav"
    },
    {
      "name": "pt-BR-HumbertoNeural",
      "title": "Humberto (Portuguese (Brazil), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Humberto-General-Audio.wav"
    },
    {
      "name": "ko-KR-HyunsuNeural",
      "title": "Hyunsu (Korean (Korea), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Korean (Korea)",
      "locale": "ko-KR",
      "tags": [
        "Azure",
        "Korean (Korea)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ko-KR-Hyunsu-General-Audio.wav"
    },
    {
      "name": "ko-KR-Hyunsu:DragonHDLatestNeural",
      "title": "Hyunsu:DragonHDLatest (Korean (Korea), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Korean (Korea)",
      "locale": "ko-KR",
      "tags": [
        "Azure",
        "Korean (Korea)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ko-KR-Hyunsu:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "ko-KR-HyunsuMultilingualNeural",
      "title": "HyunsuMultilingual (Korean (Korea), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Korean (Korea)",
      "locale": "ko-KR",
      "tags": [
        "Azure",
        "Korean (Korea)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ko-KR-HyunsuMultilingual-General-Audio.wav"
    },
    {
      "name": "sq-AL-IlirNeural",
      "title": "Ilir (sq-AL, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "sq-AL",
      "locale": "sq-AL",
      "tags": [
        "Azure",
        "sq-AL",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sq-AL-Ilir-General-Audio.wav"
    },
    {
      "name": "ar-LY-ImanNeural",
      "title": "Iman (ar-LY, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-LY",
      "locale": "ar-LY",
      "tags": [
        "Azure",
        "ar-LY",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-LY-Iman-General-Audio.wav"
    },
    {
      "name": "en-TZ-ImaniNeural",
      "title": "Imani (en-TZ, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "en-TZ",
      "locale": "en-TZ",
      "tags": [
        "Azure",
        "en-TZ",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-TZ-Imani-General-Audio.wav"
    },
    {
      "name": "it-IT-ImeldaNeural",
      "title": "Imelda (Italian (Italy), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Imelda-General-Audio.wav"
    },
    {
      "name": "ko-KR-InJoonNeural",
      "title": "InJoon (Korean (Korea), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Korean (Korea)",
      "locale": "ko-KR",
      "tags": [
        "Azure",
        "Korean (Korea)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ko-KR-InJoon-General-Audio.wav"
    },
    {
      "name": "de-AT-IngridNeural",
      "title": "Ingrid (de-AT, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "de-AT",
      "locale": "de-AT",
      "tags": [
        "Azure",
        "de-AT",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-AT-Ingrid-General-Audio.wav"
    },
    {
      "name": "es-ES-IreneNeural",
      "title": "Irene (Spanish (Spain), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Irene-General-Audio.wav"
    },
    {
      "name": "en-US-Iris:MAI-Voice-1",
      "title": "1 (English (US), Neutral)",
      "provider": "azure",
      "gender": "neutral",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "neutral"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Iris:MAI-Voice-1-General-Audio.wav"
    },
    {
      "name": "it-IT-IrmaNeural",
      "title": "Irma (Italian (Italy), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Irma-General-Audio.wav"
    },
    {
      "name": "it-IT-IsabellaNeural",
      "title": "Isabella (Italian (Italy), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Isabella-General-Audio.wav"
    },
    {
      "name": "it-IT-Isabella:DragonHDLatestNeural",
      "title": "Isabella:DragonHDLatest (Italian (Italy), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Isabella:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "it-IT-IsabellaMultilingualNeural",
      "title": "IsabellaMultilingual (Italian (Italy), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-IsabellaMultilingual-General-Audio.wav"
    },
    {
      "name": "nb-NO-IselinNeural",
      "title": "Iselin (nb-NO, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "nb-NO",
      "locale": "nb-NO",
      "tags": [
        "Azure",
        "nb-NO",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/nb-NO-Iselin-General-Audio.wav"
    },
    {
      "name": "es-ES-IsidoraMultilingualNeural",
      "title": "IsidoraMultilingual (Spanish (Spain), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-IsidoraMultilingual-General-Audio.wav"
    },
    {
      "name": "ar-DZ-IsmaelNeural",
      "title": "Ismael (ar-DZ, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-DZ",
      "locale": "ar-DZ",
      "tags": [
        "Azure",
        "ar-DZ",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-DZ-Ismael-General-Audio.wav"
    },
    {
      "name": "en-US-JacobNeural",
      "title": "Jacob (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Jacob-General-Audio.wav"
    },
    {
      "name": "fr-FR-JacquelineNeural",
      "title": "Jacqueline (French (France), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Jacqueline-General-Audio.wav"
    },
    {
      "name": "su-ID-JajangNeural",
      "title": "Jajang (su-ID, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "su-ID",
      "locale": "su-ID",
      "tags": [
        "Azure",
        "su-ID",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/su-ID-Jajang-General-Audio.wav"
    },
    {
      "name": "ar-MA-JamalNeural",
      "title": "Jamal (ar-MA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-MA",
      "locale": "ar-MA",
      "tags": [
        "Azure",
        "ar-MA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-MA-Jamal-General-Audio.wav"
    },
    {
      "name": "en-PH-JamesNeural",
      "title": "James (en-PH, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "en-PH",
      "locale": "en-PH",
      "tags": [
        "Azure",
        "en-PH",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-PH-James-General-Audio.wav"
    },
    {
      "name": "de-CH-JanNeural",
      "title": "Jan (de-CH, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "de-CH",
      "locale": "de-CH",
      "tags": [
        "Azure",
        "de-CH",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-CH-Jan-General-Audio.wav"
    },
    {
      "name": "en-US-JaneNeural",
      "title": "Jane (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Jane-General-Audio.wav"
    },
    {
      "name": "en-US-Jane:DragonHDLatestNeural",
      "title": "Jane:DragonHDLatest (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Jane:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-JasonNeural",
      "title": "Jason (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Jason-General-Audio.wav"
    },
    {
      "name": "en-US-Jasper:MAI-Voice-1",
      "title": "1 (English (US), Neutral)",
      "provider": "azure",
      "gender": "neutral",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "neutral"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Jasper:MAI-Voice-1-General-Audio.wav"
    },
    {
      "name": "es-GQ-JavierNeural",
      "title": "Javier (es-GQ, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-GQ",
      "locale": "es-GQ",
      "tags": [
        "Azure",
        "es-GQ",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-GQ-Javier-General-Audio.wav"
    },
    {
      "name": "fr-CA-JeanNeural",
      "title": "Jean (fr-CA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "fr-CA",
      "locale": "fr-CA",
      "tags": [
        "Azure",
        "fr-CA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-CA-Jean-General-Audio.wav"
    },
    {
      "name": "en-US-JennyNeural",
      "title": "Jenny (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Jenny-General-Audio.wav"
    },
    {
      "name": "en-US-Jenny:DragonHDLatestNeural",
      "title": "Jenny:DragonHDLatest (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Jenny:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-JennyMultilingualNeural",
      "title": "JennyMultilingual (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-JennyMultilingual-General-Audio.wav"
    },
    {
      "name": "da-DK-JeppeNeural",
      "title": "Jeppe (da-DK, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "da-DK",
      "locale": "da-DK",
      "tags": [
        "Azure",
        "da-DK",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/da-DK-Jeppe-General-Audio.wav"
    },
    {
      "name": "fr-FR-JeromeNeural",
      "title": "Jerome (French (France), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Jerome-General-Audio.wav"
    },
    {
      "name": "ko-KR-JiMinNeural",
      "title": "JiMin (Korean (Korea), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Korean (Korea)",
      "locale": "ko-KR",
      "tags": [
        "Azure",
        "Korean (Korea)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ko-KR-JiMin-General-Audio.wav"
    },
    {
      "name": "ca-ES-JoanaNeural",
      "title": "Joana (ca-ES, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ca-ES",
      "locale": "ca-ES",
      "tags": [
        "Azure",
        "ca-ES",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ca-ES-Joana-General-Audio.wav"
    },
    {
      "name": "en-AU-JoanneNeural",
      "title": "Joanne (English (Australia), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-Joanne-General-Audio.wav"
    },
    {
      "name": "de-AT-JonasNeural",
      "title": "Jonas (de-AT, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "de-AT",
      "locale": "de-AT",
      "tags": [
        "Azure",
        "de-AT",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-AT-Jonas-General-Audio.wav"
    },
    {
      "name": "es-MX-JorgeNeural",
      "title": "Jorge (Spanish (Mexico), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Jorge-General-Audio.wav"
    },
    {
      "name": "es-MX-JorgeMultilingualNeural",
      "title": "JorgeMultilingual (Spanish (Mexico), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-JorgeMultilingual-General-Audio.wav"
    },
    {
      "name": "mt-MT-JosephNeural",
      "title": "Joseph (mt-MT, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "mt-MT",
      "locale": "mt-MT",
      "tags": [
        "Azure",
        "mt-MT",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/mt-MT-Joseph-General-Audio.wav"
    },
    {
      "name": "fr-FR-JosephineNeural",
      "title": "Josephine (French (France), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Josephine-General-Audio.wav"
    },
    {
      "name": "en-US-Joy:MAI-Voice-1",
      "title": "1 (English (US), Neutral)",
      "provider": "azure",
      "gender": "neutral",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "neutral"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Joy:MAI-Voice-1-General-Audio.wav"
    },
    {
      "name": "es-CR-JuanNeural",
      "title": "Juan (es-CR, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-CR",
      "locale": "es-CR",
      "tags": [
        "Azure",
        "es-CR",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-CR-Juan-General-Audio.wav"
    },
    {
      "name": "pt-BR-JulioNeural",
      "title": "Julio (Portuguese (Brazil), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Julio-General-Audio.wav"
    },
    {
      "name": "en-US-June:MAI-Voice-1",
      "title": "1 (English (US), Neutral)",
      "provider": "azure",
      "gender": "neutral",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "neutral"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-June:MAI-Voice-1-General-Audio.wav"
    },
    {
      "name": "en-US-KaiNeural",
      "title": "Kai (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Kai-General-Audio.wav"
    },
    {
      "name": "bg-BG-KalinaNeural",
      "title": "Kalina (bg-BG, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "bg-BG",
      "locale": "bg-BG",
      "tags": [
        "Azure",
        "bg-BG",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/bg-BG-Kalina-General-Audio.wav"
    },
    {
      "name": "ta-MY-KaniNeural",
      "title": "Kani (ta-MY, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ta-MY",
      "locale": "ta-MY",
      "tags": [
        "Azure",
        "ta-MY",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ta-MY-Kani-General-Audio.wav"
    },
    {
      "name": "es-PR-KarinaNeural",
      "title": "Karina (es-PR, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-PR",
      "locale": "es-PR",
      "tags": [
        "Azure",
        "es-PR",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-PR-Karina-General-Audio.wav"
    },
    {
      "name": "es-HN-KarlaNeural",
      "title": "Karla (es-HN, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-HN",
      "locale": "es-HN",
      "tags": [
        "Azure",
        "es-HN",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-HN-Karla-General-Audio.wav"
    },
    {
      "name": "de-DE-KasperNeural",
      "title": "Kasper (German (Germany), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Kasper-General-Audio.wav"
    },
    {
      "name": "de-DE-KatjaNeural",
      "title": "Katja (German (Germany), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Katja-General-Audio.wav"
    },
    {
      "name": "hi-IN-KavyaNeural",
      "title": "Kavya (Hindi (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Hindi (India)",
      "locale": "hi-IN",
      "tags": [
        "Azure",
        "Hindi (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Kavya-General-Audio.wav"
    },
    {
      "name": "en-IN-KavyaNeural",
      "title": "Kavya (English (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Kavya-General-Audio.wav"
    },
    {
      "name": "ja-JP-KeitaNeural",
      "title": "Keita (Japanese (Japan), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Japanese (Japan)",
      "locale": "ja-JP",
      "tags": [
        "Azure",
        "Japanese (Japan)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ja-JP-Keita-General-Audio.wav"
    },
    {
      "name": "en-AU-KenNeural",
      "title": "Ken (English (Australia), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-Ken-General-Audio.wav"
    },
    {
      "name": "lo-LA-KeomanyNeural",
      "title": "Keomany (lo-LA, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "lo-LA",
      "locale": "lo-LA",
      "tags": [
        "Azure",
        "lo-LA",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/lo-LA-Keomany-General-Audio.wav"
    },
    {
      "name": "et-EE-KertNeural",
      "title": "Kert (et-EE, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "et-EE",
      "locale": "et-EE",
      "tags": [
        "Azure",
        "et-EE",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/et-EE-Kert-General-Audio.wav"
    },
    {
      "name": "de-DE-KillianNeural",
      "title": "Killian (German (Germany), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Killian-General-Audio.wav"
    },
    {
      "name": "en-AU-KimNeural",
      "title": "Kim (English (Australia), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-Kim-General-Audio.wav"
    },
    {
      "name": "de-DE-KlarissaNeural",
      "title": "Klarissa (German (Germany), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Klarissa-General-Audio.wav"
    },
    {
      "name": "de-DE-KlausNeural",
      "title": "Klaus (German (Germany), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Klaus-General-Audio.wav"
    },
    {
      "name": "ta-LK-KumarNeural",
      "title": "Kumar (ta-LK, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ta-LK",
      "locale": "ta-LK",
      "tags": [
        "Azure",
        "ta-LK",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ta-LK-Kumar-General-Audio.wav"
    },
    {
      "name": "en-IN-KunalNeural",
      "title": "Kunal (English (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Kunal-General-Audio.wav"
    },
    {
      "name": "hi-IN-KunalNeural",
      "title": "Kunal (Hindi (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Hindi (India)",
      "locale": "hi-IN",
      "tags": [
        "Azure",
        "Hindi (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Kunal-General-Audio.wav"
    },
    {
      "name": "es-ES-LaiaNeural",
      "title": "Laia (Spanish (Spain), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Laia-General-Audio.wav"
    },
    {
      "name": "ar-BH-LailaNeural",
      "title": "Laila (ar-BH, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-BH",
      "locale": "ar-BH",
      "tags": [
        "Azure",
        "ar-BH",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-BH-Laila-General-Audio.wav"
    },
    {
      "name": "ar-SY-LaithNeural",
      "title": "Laith (ar-SY, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-SY",
      "locale": "ar-SY",
      "tags": [
        "Azure",
        "ar-SY",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-SY-Laith-General-Audio.wav"
    },
    {
      "name": "es-MX-LarissaNeural",
      "title": "Larissa (Spanish (Mexico), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Larissa-General-Audio.wav"
    },
    {
      "name": "ps-AF-LatifaNeural",
      "title": "Latifa (ps-AF, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ps-AF",
      "locale": "ps-AF",
      "tags": [
        "Azure",
        "ps-AF",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ps-AF-Latifa-General-Audio.wav"
    },
    {
      "name": "ar-LB-LaylaNeural",
      "title": "Layla (ar-LB, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-LB",
      "locale": "ar-LB",
      "tags": [
        "Azure",
        "ar-LB",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-LB-Layla-General-Audio.wav"
    },
    {
      "name": "en-ZA-LeahNeural",
      "title": "Leah (en-ZA, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "en-ZA",
      "locale": "en-ZA",
      "tags": [
        "Azure",
        "en-ZA",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-ZA-Leah-General-Audio.wav"
    },
    {
      "name": "pt-BR-LeilaNeural",
      "title": "Leila (Portuguese (Brazil), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Leila-General-Audio.wav"
    },
    {
      "name": "de-CH-LeniNeural",
      "title": "Leni (de-CH, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "de-CH",
      "locale": "de-CH",
      "tags": [
        "Azure",
        "de-CH",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-CH-Leni-General-Audio.wav"
    },
    {
      "name": "lt-LT-LeonasNeural",
      "title": "Leonas (lt-LT, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "lt-LT",
      "locale": "lt-LT",
      "tags": [
        "Azure",
        "lt-LT",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/lt-LT-Leonas-General-Audio.wav"
    },
    {
      "name": "pt-BR-LeticiaNeural",
      "title": "Leticia (Portuguese (Brazil), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Leticia-General-Audio.wav"
    },
    {
      "name": "en-US-Lewis:DragonHDOmniLatestNeural",
      "title": "Lewis:DragonHDOmniLatest (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Lewis:DragonHDOmniLatest-General-Audio.wav"
    },
    {
      "name": "en-US-LewisMultilingualNeural",
      "title": "LewisMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-LewisMultilingual-General-Audio.wav"
    },
    {
      "name": "es-ES-LiaNeural",
      "title": "Lia (Spanish (Spain), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Lia-General-Audio.wav"
    },
    {
      "name": "en-CA-LiamNeural",
      "title": "Liam (en-CA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "en-CA",
      "locale": "en-CA",
      "tags": [
        "Azure",
        "en-CA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-CA-Liam-General-Audio.wav"
    },
    {
      "name": "en-GB-LibbyNeural",
      "title": "Libby (English (UK), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Libby-General-Audio.wav"
    },
    {
      "name": "es-MX-LibertoNeural",
      "title": "Liberto (Spanish (Mexico), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Liberto-General-Audio.wav"
    },
    {
      "name": "it-IT-LisandroNeural",
      "title": "Lisandro (Italian (Italy), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Lisandro-General-Audio.wav"
    },
    {
      "name": "en-US-LolaMultilingualNeural",
      "title": "LolaMultilingual (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-LolaMultilingual-General-Audio.wav"
    },
    {
      "name": "es-SV-LorenaNeural",
      "title": "Lorena (es-SV, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-SV",
      "locale": "es-SV",
      "tags": [
        "Azure",
        "es-SV",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-SV-Lorena-General-Audio.wav"
    },
    {
      "name": "es-CL-LorenzoNeural",
      "title": "Lorenzo (es-CL, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-CL",
      "locale": "es-CL",
      "tags": [
        "Azure",
        "es-CL",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-CL-Lorenzo-General-Audio.wav"
    },
    {
      "name": "de-DE-LouisaNeural",
      "title": "Louisa (German (Germany), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Louisa-General-Audio.wav"
    },
    {
      "name": "es-MX-LucianoNeural",
      "title": "Luciano (Spanish (Mexico), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Luciano-General-Audio.wav"
    },
    {
      "name": "fr-FR-LucienMultilingualNeural",
      "title": "LucienMultilingual (French (France), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-LucienMultilingual-General-Audio.wav"
    },
    {
      "name": "es-EC-LuisNeural",
      "title": "Luis (es-EC, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-EC",
      "locale": "es-EC",
      "tags": [
        "Azure",
        "es-EC",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-EC-Luis-General-Audio.wav"
    },
    {
      "name": "sk-SK-LukasNeural",
      "title": "Lukas (sk-SK, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "sk-SK",
      "locale": "sk-SK",
      "tags": [
        "Azure",
        "sk-SK",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sk-SK-Lukas-General-Audio.wav"
    },
    {
      "name": "en-ZA-LukeNeural",
      "title": "Luke (en-ZA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "en-ZA",
      "locale": "en-ZA",
      "tags": [
        "Azure",
        "en-ZA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-ZA-Luke-General-Audio.wav"
    },
    {
      "name": "en-SG-LunaNeural",
      "title": "Luna (en-SG, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "en-SG",
      "locale": "en-SG",
      "tags": [
        "Azure",
        "en-SG",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-SG-Luna-General-Audio.wav"
    },
    {
      "name": "en-US-LunaNeural",
      "title": "Luna (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Luna-General-Audio.wav"
    },
    {
      "name": "nl-NL-MaartenNeural",
      "title": "Maarten (nl-NL, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "nl-NL",
      "locale": "nl-NL",
      "tags": [
        "Azure",
        "nl-NL",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/nl-NL-Maarten-General-Audio.wav"
    },
    {
      "name": "pt-BR-Macerio:DragonHDLatestNeural",
      "title": "Macerio:DragonHDLatest (Portuguese (Brazil), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Macerio:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "pt-BR-MacerioMultilingualNeural",
      "title": "MacerioMultilingual (Portuguese (Brazil), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-MacerioMultilingual-General-Audio.wav"
    },
    {
      "name": "hi-IN-MadhurNeural",
      "title": "Madhur (Hindi (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Hindi (India)",
      "locale": "hi-IN",
      "tags": [
        "Azure",
        "Hindi (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Madhur-General-Audio.wav"
    },
    {
      "name": "uz-UZ-MadinaNeural",
      "title": "Madina (uz-UZ, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "uz-UZ",
      "locale": "uz-UZ",
      "tags": [
        "Azure",
        "uz-UZ",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/uz-UZ-Madina-General-Audio.wav"
    },
    {
      "name": "en-GB-MaisieNeural",
      "title": "Maisie (English (UK), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Maisie-General-Audio.wav"
    },
    {
      "name": "de-DE-MajaNeural",
      "title": "Maja (German (Germany), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Maja-General-Audio.wav"
    },
    {
      "name": "mr-IN-ManoharNeural",
      "title": "Manohar (Marathi (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Marathi (India)",
      "locale": "mr-IN",
      "tags": [
        "Azure",
        "Marathi (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/mr-IN-Manohar-General-Audio.wav"
    },
    {
      "name": "es-CU-ManuelNeural",
      "title": "Manuel (es-CU, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-CU",
      "locale": "es-CU",
      "tags": [
        "Azure",
        "es-CU",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-CU-Manuel-General-Audio.wav"
    },
    {
      "name": "pt-BR-ManuelaNeural",
      "title": "Manuela (Portuguese (Brazil), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Manuela-General-Audio.wav"
    },
    {
      "name": "it-IT-MarcelloMultilingualNeural",
      "title": "MarcelloMultilingual (Italian (Italy), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-MarcelloMultilingual-General-Audio.wav"
    },
    {
      "name": "es-BO-MarceloNeural",
      "title": "Marcelo (es-BO, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-BO",
      "locale": "es-BO",
      "tags": [
        "Azure",
        "es-BO",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-BO-Marcelo-General-Audio.wav"
    },
    {
      "name": "pl-PL-MarekNeural",
      "title": "Marek (pl-PL, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "pl-PL",
      "locale": "pl-PL",
      "tags": [
        "Azure",
        "pl-PL",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pl-PL-Marek-General-Audio.wav"
    },
    {
      "name": "es-PA-MargaritaNeural",
      "title": "Margarita (es-PA, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-PA",
      "locale": "es-PA",
      "tags": [
        "Azure",
        "es-PA",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-PA-Margarita-General-Audio.wav"
    },
    {
      "name": "es-CR-MariaNeural",
      "title": "Maria (es-CR, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-CR",
      "locale": "es-CR",
      "tags": [
        "Azure",
        "es-CR",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-CR-Maria-General-Audio.wav"
    },
    {
      "name": "mk-MK-MarijaNeural",
      "title": "Marija (mk-MK, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "mk-MK",
      "locale": "mk-MK",
      "tags": [
        "Azure",
        "mk-MK",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/mk-MK-Marija-General-Audio.wav"
    },
    {
      "name": "es-MX-MarinaNeural",
      "title": "Marina (Spanish (Mexico), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Marina-General-Audio.wav"
    },
    {
      "name": "es-PY-MarioNeural",
      "title": "Mario (es-PY, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-PY",
      "locale": "es-PY",
      "tags": [
        "Azure",
        "es-PY",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-PY-Mario-General-Audio.wav"
    },
    {
      "name": "es-GT-MartaNeural",
      "title": "Marta (es-GT, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-GT",
      "locale": "es-GT",
      "tags": [
        "Azure",
        "es-GT",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-GT-Marta-General-Audio.wav"
    },
    {
      "name": "ar-YE-MaryamNeural",
      "title": "Maryam (ar-YE, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-YE",
      "locale": "ar-YE",
      "tags": [
        "Azure",
        "ar-YE",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-YE-Maryam-General-Audio.wav"
    },
    {
      "name": "ja-JP-Masaru:DragonHDLatestNeural",
      "title": "Masaru:DragonHDLatest (Japanese (Japan), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Japanese (Japan)",
      "locale": "ja-JP",
      "tags": [
        "Azure",
        "Japanese (Japan)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ja-JP-Masaru:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "es-UY-MateoNeural",
      "title": "Mateo (es-UY, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-UY",
      "locale": "es-UY",
      "tags": [
        "Azure",
        "es-UY",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-UY-Mateo-General-Audio.wav"
    },
    {
      "name": "sv-SE-MattiasNeural",
      "title": "Mattias (sv-SE, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "sv-SE",
      "locale": "sv-SE",
      "tags": [
        "Azure",
        "sv-SE",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sv-SE-Mattias-General-Audio.wav"
    },
    {
      "name": "fr-FR-MauriceNeural",
      "title": "Maurice (French (France), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Maurice-General-Audio.wav"
    },
    {
      "name": "ja-JP-MayuNeural",
      "title": "Mayu (Japanese (Japan), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Japanese (Japan)",
      "locale": "ja-JP",
      "tags": [
        "Azure",
        "Japanese (Japan)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ja-JP-Mayu-General-Audio.wav"
    },
    {
      "name": "en-IN-Meera:DragonHDIndicLatestNeural",
      "title": "Meera:DragonHDIndicLatest (English (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Meera:DragonHDIndicLatest-General-Audio.wav"
    },
    {
      "name": "en-IN-Meera:DragonHDLatestNeural",
      "title": "Meera:DragonHDLatest (English (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Meera:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "am-ET-MekdesNeural",
      "title": "Mekdes (am-ET, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "am-ET",
      "locale": "am-ET",
      "tags": [
        "Azure",
        "am-ET",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/am-ET-Mekdes-General-Audio.wav"
    },
    {
      "name": "en-GB-MiaNeural",
      "title": "Mia (English (UK), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Mia-General-Audio.wav"
    },
    {
      "name": "en-US-MichelleNeural",
      "title": "Michelle (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Michelle-General-Audio.wav"
    },
    {
      "name": "ml-IN-MidhunNeural",
      "title": "Midhun (Malayalam (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Malayalam (India)",
      "locale": "ml-IN",
      "tags": [
        "Azure",
        "Malayalam (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ml-IN-Midhun-General-Audio.wav"
    },
    {
      "name": "en-NZ-MitchellNeural",
      "title": "Mitchell (en-NZ, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "en-NZ",
      "locale": "en-NZ",
      "tags": [
        "Azure",
        "en-NZ",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-NZ-Mitchell-General-Audio.wav"
    },
    {
      "name": "ar-QA-MoazNeural",
      "title": "Moaz (ar-QA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-QA",
      "locale": "ar-QA",
      "tags": [
        "Azure",
        "ar-QA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-QA-Moaz-General-Audio.wav"
    },
    {
      "name": "te-IN-MohanNeural",
      "title": "Mohan (Telugu (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Telugu (India)",
      "locale": "te-IN",
      "tags": [
        "Azure",
        "Telugu (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/te-IN-Mohan-General-Audio.wav"
    },
    {
      "name": "en-NZ-MollyNeural",
      "title": "Molly (en-NZ, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "en-NZ",
      "locale": "en-NZ",
      "tags": [
        "Azure",
        "en-NZ",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-NZ-Molly-General-Audio.wav"
    },
    {
      "name": "en-US-MonicaNeural",
      "title": "Monica (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Monica-General-Audio.wav"
    },
    {
      "name": "ar-MA-MounaNeural",
      "title": "Mouna (ar-MA, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-MA",
      "locale": "ar-MA",
      "tags": [
        "Azure",
        "ar-MA",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-MA-Mouna-General-Audio.wav"
    },
    {
      "name": "so-SO-MuuseNeural",
      "title": "Muuse (so-SO, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "so-SO",
      "locale": "so-SO",
      "tags": [
        "Azure",
        "so-SO",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/so-SO-Muuse-General-Audio.wav"
    },
    {
      "name": "bn-BD-NabanitaNeural",
      "title": "Nabanita (bn-BD, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "bn-BD",
      "locale": "bn-BD",
      "tags": [
        "Azure",
        "bn-BD",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/bn-BD-Nabanita-General-Audio.wav"
    },
    {
      "name": "vi-VN-NamMinhNeural",
      "title": "NamMinh (vi-VN, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "vi-VN",
      "locale": "vi-VN",
      "tags": [
        "Azure",
        "vi-VN",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/vi-VN-NamMinh-General-Audio.wav"
    },
    {
      "name": "ja-JP-NanamiNeural",
      "title": "Nanami (Japanese (Japan), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Japanese (Japan)",
      "locale": "ja-JP",
      "tags": [
        "Azure",
        "Japanese (Japan)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ja-JP-Nanami-General-Audio.wav"
    },
    {
      "name": "ja-JP-Nanami:DragonHDLatestNeural",
      "title": "Nanami:DragonHDLatest (Japanese (Japan), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Japanese (Japan)",
      "locale": "ja-JP",
      "tags": [
        "Azure",
        "Japanese (Japan)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ja-JP-Nanami:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-NancyNeural",
      "title": "Nancy (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Nancy-General-Audio.wav"
    },
    {
      "name": "en-US-NancyMultilingualNeural",
      "title": "NancyMultilingual (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-NancyMultilingual-General-Audio.wav"
    },
    {
      "name": "ja-JP-NaokiNeural",
      "title": "Naoki (Japanese (Japan), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Japanese (Japan)",
      "locale": "ja-JP",
      "tags": [
        "Azure",
        "Japanese (Japan)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ja-JP-Naoki-General-Audio.wav"
    },
    {
      "name": "en-AU-NatashaNeural",
      "title": "Natasha (English (Australia), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-Natasha-General-Audio.wav"
    },
    {
      "name": "en-IN-NeerjaNeural",
      "title": "Neerja (English (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Neerja-General-Audio.wav"
    },
    {
      "name": "en-IN-NeerjaIndicNeural",
      "title": "NeerjaIndic (English (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-NeerjaIndic-General-Audio.wav"
    },
    {
      "name": "en-AU-NeilNeural",
      "title": "Neil (English (Australia), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-Neil-General-Audio.wav"
    },
    {
      "name": "el-GR-NestorasNeural",
      "title": "Nestoras (el-GR, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "el-GR",
      "locale": "el-GR",
      "tags": [
        "Azure",
        "el-GR",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/el-GR-Nestoras-General-Audio.wav"
    },
    {
      "name": "cy-GB-NiaNeural",
      "title": "Nia (cy-GB, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "cy-GB",
      "locale": "cy-GB",
      "tags": [
        "Azure",
        "cy-GB",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/cy-GB-Nia-General-Audio.wav"
    },
    {
      "name": "sr-Latn-RS-NicholasNeural",
      "title": "Nicholas (sr-Latn, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "sr-Latn",
      "locale": "sr-Latn",
      "tags": [
        "Azure",
        "sr-Latn",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sr-Latn-RS-Nicholas-General-Audio.wav"
    },
    {
      "name": "sr-RS-NicholasNeural",
      "title": "Nicholas (sr-RS, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "sr-RS",
      "locale": "sr-RS",
      "tags": [
        "Azure",
        "sr-RS",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sr-RS-Nicholas-General-Audio.wav"
    },
    {
      "name": "pt-BR-NicolauNeural",
      "title": "Nicolau (Portuguese (Brazil), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Nicolau-General-Audio.wav"
    },
    {
      "name": "es-ES-NilNeural",
      "title": "Nil (Spanish (Spain), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Nil-General-Audio.wav"
    },
    {
      "name": "my-MM-NilarNeural",
      "title": "Nilar (my-MM, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "my-MM",
      "locale": "my-MM",
      "tags": [
        "Azure",
        "my-MM",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/my-MM-Nilar-General-Audio.wav"
    },
    {
      "name": "lv-LV-NilsNeural",
      "title": "Nils (lv-LV, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "lv-LV",
      "locale": "lv-LV",
      "tags": [
        "Azure",
        "lv-LV",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/lv-LV-Nils-General-Audio.wav"
    },
    {
      "name": "gu-IN-NiranjanNeural",
      "title": "Niranjan (Gujarati (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Gujarati (India)",
      "locale": "gu-IN",
      "tags": [
        "Azure",
        "Gujarati (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/gu-IN-Niranjan-General-Audio.wav"
    },
    {
      "name": "th-TH-NiwatNeural",
      "title": "Niwat (th-TH, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "th-TH",
      "locale": "th-TH",
      "tags": [
        "Azure",
        "th-TH",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/th-TH-Niwat-General-Audio.wav"
    },
    {
      "name": "en-GB-NoahNeural",
      "title": "Noah (English (UK), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Noah-General-Audio.wav"
    },
    {
      "name": "hu-HU-NoemiNeural",
      "title": "Noemi (hu-HU, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "hu-HU",
      "locale": "hu-HU",
      "tags": [
        "Azure",
        "hu-HU",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hu-HU-Noemi-General-Audio.wav"
    },
    {
      "name": "fi-FI-NooraNeural",
      "title": "Noora (fi-FI, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "fi-FI",
      "locale": "fi-FI",
      "tags": [
        "Azure",
        "fi-FI",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fi-FI-Noora-General-Audio.wav"
    },
    {
      "name": "ar-KW-NouraNeural",
      "title": "Noura (ar-KW, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-KW",
      "locale": "ar-KW",
      "tags": [
        "Azure",
        "ar-KW",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-KW-Noura-General-Audio.wav"
    },
    {
      "name": "en-US-Nova:DragonHDLatestNeural",
      "title": "Nova:DragonHDLatest (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Nova:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-NovaTurboMultilingualNeural",
      "title": "NovaTurboMultilingual (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-NovaTurboMultilingual-General-Audio.wav"
    },
    {
      "name": "es-MX-NuriaNeural",
      "title": "Nuria (Spanish (Mexico), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Nuria-General-Audio.wav"
    },
    {
      "name": "pa-IN-OjasNeural",
      "title": "Ojas (Punjabi (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Punjabi (India)",
      "locale": "pa-IN",
      "tags": [
        "Azure",
        "Punjabi (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pa-IN-Ojas-General-Audio.wav"
    },
    {
      "name": "en-GB-OliverNeural",
      "title": "Oliver (English (UK), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Oliver-General-Audio.wav"
    },
    {
      "name": "en-GB-OliviaNeural",
      "title": "Olivia (English (UK), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Olivia-General-Audio.wav"
    },
    {
      "name": "en-GB-Ollie:DragonHDLatestNeural",
      "title": "Ollie:DragonHDLatest (English (UK), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Ollie:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-GB-OllieMultilingualNeural",
      "title": "OllieMultilingual (English (UK), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-OllieMultilingual-General-Audio.wav"
    },
    {
      "name": "ar-LY-OmarNeural",
      "title": "Omar (ar-LY, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-LY",
      "locale": "ar-LY",
      "tags": [
        "Azure",
        "ar-LY",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-LY-Omar-General-Audio.wav"
    },
    {
      "name": "lt-LT-OnaNeural",
      "title": "Ona (lt-LT, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "lt-LT",
      "locale": "lt-LT",
      "tags": [
        "Azure",
        "lt-LT",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/lt-LT-Ona-General-Audio.wav"
    },
    {
      "name": "en-US-OnyxTurboMultilingualNeural",
      "title": "OnyxTurboMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-OnyxTurboMultilingual-General-Audio.wav"
    },
    {
      "name": "ga-IE-OrlaNeural",
      "title": "Orla (ga-IE, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ga-IE",
      "locale": "ga-IE",
      "tags": [
        "Azure",
        "ga-IE",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ga-IE-Orla-General-Audio.wav"
    },
    {
      "name": "ms-MY-OsmanNeural",
      "title": "Osman (ms-MY, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ms-MY",
      "locale": "ms-MY",
      "tags": [
        "Azure",
        "ms-MY",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ms-MY-Osman-General-Audio.wav"
    },
    {
      "name": "uk-UA-OstapNeural",
      "title": "Ostap (uk-UA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "uk-UA",
      "locale": "uk-UA",
      "tags": [
        "Azure",
        "uk-UA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/uk-UA-Ostap-General-Audio.wav"
    },
    {
      "name": "ta-IN-PallaviNeural",
      "title": "Pallavi (Tamil (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Tamil (India)",
      "locale": "ta-IN",
      "tags": [
        "Azure",
        "Tamil (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ta-IN-Pallavi-General-Audio.wav"
    },
    {
      "name": "it-IT-PalmiraNeural",
      "title": "Palmira (Italian (Italy), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Palmira-General-Audio.wav"
    },
    {
      "name": "es-US-PalomaNeural",
      "title": "Paloma (es-US, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-US",
      "locale": "es-US",
      "tags": [
        "Azure",
        "es-US",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-US-Paloma-General-Audio.wav"
    },
    {
      "name": "es-VE-PaolaNeural",
      "title": "Paola (es-VE, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-VE",
      "locale": "es-VE",
      "tags": [
        "Azure",
        "es-VE",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-VE-Paola-General-Audio.wav"
    },
    {
      "name": "es-MX-PelayoNeural",
      "title": "Pelayo (Spanish (Mexico), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Pelayo-General-Audio.wav"
    },
    {
      "name": "nb-NO-PernilleNeural",
      "title": "Pernille (nb-NO, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "nb-NO",
      "locale": "nb-NO",
      "tags": [
        "Azure",
        "nb-NO",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/nb-NO-Pernille-General-Audio.wav"
    },
    {
      "name": "sl-SI-PetraNeural",
      "title": "Petra (sl-SI, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "sl-SI",
      "locale": "sl-SI",
      "tags": [
        "Azure",
        "sl-SI",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sl-SI-Petra-General-Audio.wav"
    },
    {
      "name": "en-US-Phoebe:DragonHDLatestNeural",
      "title": "Phoebe:DragonHDLatest (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Phoebe:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-Phoebe:DragonHDOmniLatestNeural",
      "title": "Phoebe:DragonHDOmniLatest (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Phoebe:DragonHDOmniLatest-General-Audio.wav"
    },
    {
      "name": "en-US-PhoebeMultilingualNeural",
      "title": "PhoebeMultilingual (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-PhoebeMultilingual-General-Audio.wav"
    },
    {
      "name": "it-IT-PierinaNeural",
      "title": "Pierina (Italian (Italy), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Pierina-General-Audio.wav"
    },
    {
      "name": "km-KH-PisethNeural",
      "title": "Piseth (km-KH, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "km-KH",
      "locale": "km-KH",
      "tags": [
        "Azure",
        "km-KH",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/km-KH-Piseth-General-Audio.wav"
    },
    {
      "name": "uk-UA-PolinaNeural",
      "title": "Polina (uk-UA, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "uk-UA",
      "locale": "uk-UA",
      "tags": [
        "Azure",
        "uk-UA",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/uk-UA-Polina-General-Audio.wav"
    },
    {
      "name": "en-IN-PrabhatNeural",
      "title": "Prabhat (English (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Prabhat-General-Audio.wav"
    },
    {
      "name": "en-IN-PrabhatIndicNeural",
      "title": "PrabhatIndic (English (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-PrabhatIndic-General-Audio.wav"
    },
    {
      "name": "bn-BD-PradeepNeural",
      "title": "Pradeep (bn-BD, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "bn-BD",
      "locale": "bn-BD",
      "tags": [
        "Azure",
        "bn-BD",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/bn-BD-Pradeep-General-Audio.wav"
    },
    {
      "name": "th-TH-PremwadeeNeural",
      "title": "Premwadee (th-TH, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "th-TH",
      "locale": "th-TH",
      "tags": [
        "Azure",
        "th-TH",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/th-TH-Premwadee-General-Audio.wav"
    },
    {
      "name": "as-IN-PriyomNeural",
      "title": "Priyom (as-IN, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "as-IN",
      "locale": "as-IN",
      "tags": [
        "Azure",
        "as-IN",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/as-IN-Priyom-General-Audio.wav"
    },
    {
      "name": "sw-KE-RafikiNeural",
      "title": "Rafiki (sw-KE, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "sw-KE",
      "locale": "sw-KE",
      "tags": [
        "Azure",
        "sw-KE",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sw-KE-Rafiki-General-Audio.wav"
    },
    {
      "name": "de-DE-RalfNeural",
      "title": "Ralf (German (Germany), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Ralf-General-Audio.wav"
    },
    {
      "name": "ar-LB-RamiNeural",
      "title": "Rami (ar-LB, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-LB",
      "locale": "ar-LB",
      "tags": [
        "Azure",
        "ar-LB",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-LB-Rami-General-Audio.wav"
    },
    {
      "name": "es-DO-RamonaNeural",
      "title": "Ramona (es-DO, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-DO",
      "locale": "es-DO",
      "tags": [
        "Azure",
        "es-DO",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-DO-Ramona-General-Audio.wav"
    },
    {
      "name": "ar-IQ-RanaNeural",
      "title": "Rana (ar-IQ, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-IQ",
      "locale": "ar-IQ",
      "tags": [
        "Azure",
        "ar-IQ",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-IQ-Rana-General-Audio.wav"
    },
    {
      "name": "pt-PT-RaquelNeural",
      "title": "Raquel (pt-PT, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "pt-PT",
      "locale": "pt-PT",
      "tags": [
        "Azure",
        "pt-PT",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-PT-Raquel-General-Audio.wav"
    },
    {
      "name": "en-US-Reed:MAI-Voice-1",
      "title": "1 (English (US), Neutral)",
      "provider": "azure",
      "gender": "neutral",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "neutral"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Reed:MAI-Voice-1-General-Audio.wav"
    },
    {
      "name": "ar-TN-ReemNeural",
      "title": "Reem (ar-TN, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-TN",
      "locale": "ar-TN",
      "tags": [
        "Azure",
        "ar-TN",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-TN-Reem-General-Audio.wav"
    },
    {
      "name": "hi-IN-RehaanNeural",
      "title": "Rehaan (Hindi (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Hindi (India)",
      "locale": "hi-IN",
      "tags": [
        "Azure",
        "Hindi (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Rehaan-General-Audio.wav"
    },
    {
      "name": "en-IN-RehaanNeural",
      "title": "Rehaan (English (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (India)",
      "locale": "en-IN",
      "tags": [
        "Azure",
        "English (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-IN-Rehaan-General-Audio.wav"
    },
    {
      "name": "sw-TZ-RehemaNeural",
      "title": "Rehema (sw-TZ, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "sw-TZ",
      "locale": "sw-TZ",
      "tags": [
        "Azure",
        "sw-TZ",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sw-TZ-Rehema-General-Audio.wav"
    },
    {
      "name": "fr-FR-Remy:DragonHDLatestNeural",
      "title": "Remy:DragonHDLatest (French (France), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Remy:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "fr-FR-RemyMultilingualNeural",
      "title": "RemyMultilingual (French (France), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-RemyMultilingual-General-Audio.wav"
    },
    {
      "name": "es-MX-RenataNeural",
      "title": "Renata (Spanish (Mexico), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Renata-General-Audio.wav"
    },
    {
      "name": "it-IT-RinaldoNeural",
      "title": "Rinaldo (Italian (Italy), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Italian (Italy)",
      "locale": "it-IT",
      "tags": [
        "Azure",
        "Italian (Italy)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/it-IT-Rinaldo-General-Audio.wav"
    },
    {
      "name": "es-PA-RobertoNeural",
      "title": "Roberto (es-PA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-PA",
      "locale": "es-PA",
      "tags": [
        "Azure",
        "es-PA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-PA-Roberto-General-Audio.wav"
    },
    {
      "name": "es-SV-RodrigoNeural",
      "title": "Rodrigo (es-SV, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-SV",
      "locale": "es-SV",
      "tags": [
        "Azure",
        "es-SV",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-SV-Rodrigo-General-Audio.wav"
    },
    {
      "name": "en-US-RogerNeural",
      "title": "Roger (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Roger-General-Audio.wav"
    },
    {
      "name": "gl-ES-RoiNeural",
      "title": "Roi (gl-ES, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "gl-ES",
      "locale": "gl-ES",
      "tags": [
        "Azure",
        "gl-ES",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/gl-ES-Roi-General-Audio.wav"
    },
    {
      "name": "sl-SI-RokNeural",
      "title": "Rok (sl-SI, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "sl-SI",
      "locale": "sl-SI",
      "tags": [
        "Azure",
        "sl-SI",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sl-SI-Rok-General-Audio.wav"
    },
    {
      "name": "en-PH-RosaNeural",
      "title": "Rosa (en-PH, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "en-PH",
      "locale": "en-PH",
      "tags": [
        "Azure",
        "en-PH",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-PH-Rosa-General-Audio.wav"
    },
    {
      "name": "en-GB-RyanNeural",
      "title": "Ryan (English (UK), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Ryan-General-Audio.wav"
    },
    {
      "name": "en-GB-Ryan:DragonHDLatestNeural",
      "title": "Ryan:DragonHDLatest (English (UK), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Ryan:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-RyanMultilingualNeural",
      "title": "RyanMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-RyanMultilingual-General-Audio.wav"
    },
    {
      "name": "gl-ES-SabelaNeural",
      "title": "Sabela (gl-ES, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "gl-ES",
      "locale": "gl-ES",
      "tags": [
        "Azure",
        "gl-ES",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/gl-ES-Sabela-General-Audio.wav"
    },
    {
      "name": "ne-NP-SagarNeural",
      "title": "Sagar (ne-NP, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ne-NP",
      "locale": "ne-NP",
      "tags": [
        "Azure",
        "ne-NP",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ne-NP-Sagar-General-Audio.wav"
    },
    {
      "name": "ar-YE-SalehNeural",
      "title": "Saleh (ar-YE, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-YE",
      "locale": "ar-YE",
      "tags": [
        "Azure",
        "ar-YE",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-YE-Saleh-General-Audio.wav"
    },
    {
      "name": "ar-EG-SalmaNeural",
      "title": "Salma (ar-EG, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-EG",
      "locale": "ar-EG",
      "tags": [
        "Azure",
        "ar-EG",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-EG-Salma-General-Audio.wav"
    },
    {
      "name": "ur-IN-SalmanNeural",
      "title": "Salman (Urdu (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Urdu (India)",
      "locale": "ur-IN",
      "tags": [
        "Azure",
        "Urdu (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ur-IN-Salman-General-Audio.wav"
    },
    {
      "name": "es-CO-SalomeNeural",
      "title": "Salome (es-CO, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-CO",
      "locale": "es-CO",
      "tags": [
        "Azure",
        "es-CO",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-CO-Salome-General-Audio.wav"
    },
    {
      "name": "en-HK-SamNeural",
      "title": "Sam (en-HK, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "en-HK",
      "locale": "en-HK",
      "tags": [
        "Azure",
        "en-HK",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-HK-Sam-General-Audio.wav"
    },
    {
      "name": "si-LK-SameeraNeural",
      "title": "Sameera (si-LK, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "si-LK",
      "locale": "si-LK",
      "tags": [
        "Azure",
        "si-LK",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/si-LK-Sameera-General-Audio.wav"
    },
    {
      "name": "en-US-SamuelMultilingualNeural",
      "title": "SamuelMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-SamuelMultilingual-General-Audio.wav"
    },
    {
      "name": "ar-JO-SanaNeural",
      "title": "Sana (ar-JO, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ar-JO",
      "locale": "ar-JO",
      "tags": [
        "Azure",
        "ar-JO",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-JO-Sana-General-Audio.wav"
    },
    {
      "name": "kn-IN-SapnaNeural",
      "title": "Sapna (Kannada (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Kannada (India)",
      "locale": "kn-IN",
      "tags": [
        "Azure",
        "Kannada (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/kn-IN-Sapna-General-Audio.wav"
    },
    {
      "name": "en-US-SaraNeural",
      "title": "Sara (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Sara-General-Audio.wav"
    },
    {
      "name": "ta-LK-SaranyaNeural",
      "title": "Saranya (ta-LK, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ta-LK",
      "locale": "ta-LK",
      "tags": [
        "Azure",
        "ta-LK",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ta-LK-Saranya-General-Audio.wav"
    },
    {
      "name": "uz-UZ-SardorNeural",
      "title": "Sardor (uz-UZ, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "uz-UZ",
      "locale": "uz-UZ",
      "tags": [
        "Azure",
        "uz-UZ",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/uz-UZ-Sardor-General-Audio.wav"
    },
    {
      "name": "es-ES-SaulNeural",
      "title": "Saul (Spanish (Spain), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Saul-General-Audio.wav"
    },
    {
      "name": "es-VE-SebastianNeural",
      "title": "Sebastian (es-VE, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-VE",
      "locale": "es-VE",
      "tags": [
        "Azure",
        "es-VE",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-VE-Sebastian-General-Audio.wav"
    },
    {
      "name": "fi-FI-SelmaNeural",
      "title": "Selma (fi-FI, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "fi-FI",
      "locale": "fi-FI",
      "tags": [
        "Azure",
        "fi-FI",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fi-FI-Selma-General-Audio.wav"
    },
    {
      "name": "ko-KR-SeoHyeonNeural",
      "title": "SeoHyeon (Korean (Korea), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Korean (Korea)",
      "locale": "ko-KR",
      "tags": [
        "Azure",
        "Korean (Korea)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ko-KR-SeoHyeon-General-Audio.wav"
    },
    {
      "name": "de-DE-Seraphina:DragonHDLatestNeural",
      "title": "Seraphina:DragonHDLatest (German (Germany), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Seraphina:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "de-DE-SeraphinaMultilingualNeural",
      "title": "SeraphinaMultilingual (German (Germany), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-SeraphinaMultilingual-General-Audio.wav"
    },
    {
      "name": "en-US-Serena:DragonHDLatestNeural",
      "title": "Serena:DragonHDLatest (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Serena:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-SerenaMultilingualNeural",
      "title": "SerenaMultilingual (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-SerenaMultilingual-General-Audio.wav"
    },
    {
      "name": "ar-EG-ShakirNeural",
      "title": "Shakir (ar-EG, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-EG",
      "locale": "ar-EG",
      "tags": [
        "Azure",
        "ar-EG",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-EG-Shakir-General-Audio.wav"
    },
    {
      "name": "en-US-ShimmerTurboMultilingualNeural",
      "title": "ShimmerTurboMultilingual (English (US), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-ShimmerTurboMultilingual-General-Audio.wav"
    },
    {
      "name": "ja-JP-ShioriNeural",
      "title": "Shiori (Japanese (Japan), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Japanese (Japan)",
      "locale": "ja-JP",
      "tags": [
        "Azure",
        "Japanese (Japan)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ja-JP-Shiori-General-Audio.wav"
    },
    {
      "name": "te-IN-ShrutiNeural",
      "title": "Shruti (Telugu (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Telugu (India)",
      "locale": "te-IN",
      "tags": [
        "Azure",
        "Telugu (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/te-IN-Shruti-General-Audio.wav"
    },
    {
      "name": "iu-Latn-CA-SiqiniqNeural",
      "title": "Siqiniq (iu-Latn, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "iu-Latn",
      "locale": "iu-Latn",
      "tags": [
        "Azure",
        "iu-Latn",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/iu-Latn-CA-Siqiniq-General-Audio.wav"
    },
    {
      "name": "iu-Cans-CA-SiqiniqNeural",
      "title": "Siqiniq (iu-Cans, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "iu-Cans",
      "locale": "iu-Cans",
      "tags": [
        "Azure",
        "iu-Cans",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/iu-Cans-CA-Siqiniq-General-Audio.wav"
    },
    {
      "name": "jv-ID-SitiNeural",
      "title": "Siti (jv-ID, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "jv-ID",
      "locale": "jv-ID",
      "tags": [
        "Azure",
        "jv-ID",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/jv-ID-Siti-General-Audio.wav"
    },
    {
      "name": "ml-IN-SobhanaNeural",
      "title": "Sobhana (Malayalam (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Malayalam (India)",
      "locale": "ml-IN",
      "tags": [
        "Azure",
        "Malayalam (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ml-IN-Sobhana-General-Audio.wav"
    },
    {
      "name": "es-BO-SofiaNeural",
      "title": "Sofia (es-BO, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-BO",
      "locale": "es-BO",
      "tags": [
        "Azure",
        "es-BO",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-BO-Sofia-General-Audio.wav"
    },
    {
      "name": "sv-SE-SofieNeural",
      "title": "Sofie (sv-SE, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "sv-SE",
      "locale": "sv-SE",
      "tags": [
        "Azure",
        "sv-SE",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sv-SE-Sofie-General-Audio.wav"
    },
    {
      "name": "en-GB-SoniaNeural",
      "title": "Sonia (English (UK), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Sonia-General-Audio.wav"
    },
    {
      "name": "en-GB-Sonia:DragonHDLatestNeural",
      "title": "Sonia:DragonHDLatest (English (UK), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Sonia:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "ko-KR-SoonBokNeural",
      "title": "SoonBok (Korean (Korea), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Korean (Korea)",
      "locale": "ko-KR",
      "tags": [
        "Azure",
        "Korean (Korea)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ko-KR-SoonBok-General-Audio.wav"
    },
    {
      "name": "sr-Latn-RS-SophieNeural",
      "title": "Sophie (sr-Latn, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "sr-Latn",
      "locale": "sr-Latn",
      "tags": [
        "Azure",
        "sr-Latn",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sr-Latn-RS-Sophie-General-Audio.wav"
    },
    {
      "name": "sr-RS-SophieNeural",
      "title": "Sophie (sr-RS, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "sr-RS",
      "locale": "sr-RS",
      "tags": [
        "Azure",
        "sr-RS",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sr-RS-Sophie-General-Audio.wav"
    },
    {
      "name": "hr-HR-SreckoNeural",
      "title": "Srecko (hr-HR, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "hr-HR",
      "locale": "hr-HR",
      "tags": [
        "Azure",
        "hr-HR",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hr-HR-Srecko-General-Audio.wav"
    },
    {
      "name": "km-KH-SreymomNeural",
      "title": "Sreymom (km-KH, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "km-KH",
      "locale": "km-KH",
      "tags": [
        "Azure",
        "km-KH",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/km-KH-Sreymom-General-Audio.wav"
    },
    {
      "name": "en-US-SteffanNeural",
      "title": "Steffan (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Steffan-General-Audio.wav"
    },
    {
      "name": "en-US-Steffan:DragonHDLatestNeural",
      "title": "Steffan:DragonHDLatest (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Steffan:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "en-US-SteffanMultilingualNeural",
      "title": "SteffanMultilingual (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-SteffanMultilingual-General-Audio.wav"
    },
    {
      "name": "or-IN-SubhasiniNeural",
      "title": "Subhasini (or-IN, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "or-IN",
      "locale": "or-IN",
      "tags": [
        "Azure",
        "or-IN",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/or-IN-Subhasini-General-Audio.wav"
    },
    {
      "name": "or-IN-SukantNeural",
      "title": "Sukant (or-IN, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "or-IN",
      "locale": "or-IN",
      "tags": [
        "Azure",
        "or-IN",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/or-IN-Sukant-General-Audio.wav"
    },
    {
      "name": "ko-KR-SunHiNeural",
      "title": "SunHi (Korean (Korea), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Korean (Korea)",
      "locale": "ko-KR",
      "tags": [
        "Azure",
        "Korean (Korea)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ko-KR-SunHi-General-Audio.wav"
    },
    {
      "name": "ko-KR-SunHi:DragonHDLatestNeural",
      "title": "SunHi:DragonHDLatest (Korean (Korea), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Korean (Korea)",
      "locale": "ko-KR",
      "tags": [
        "Azure",
        "Korean (Korea)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ko-KR-SunHi:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "ta-MY-SuryaNeural",
      "title": "Surya (ta-MY, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ta-MY",
      "locale": "ta-MY",
      "tags": [
        "Azure",
        "ta-MY",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ta-MY-Surya-General-Audio.wav"
    },
    {
      "name": "ru-RU-SvetlanaNeural",
      "title": "Svetlana (Russian (Russia), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Russian (Russia)",
      "locale": "ru-RU",
      "tags": [
        "Azure",
        "Russian (Russia)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ru-RU-Svetlana-General-Audio.wav"
    },
    {
      "name": "hi-IN-SwaraNeural",
      "title": "Swara (Hindi (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Hindi (India)",
      "locale": "hi-IN",
      "tags": [
        "Azure",
        "Hindi (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hi-IN-Swara-General-Audio.wav"
    },
    {
      "name": "fr-CA-SylvieNeural",
      "title": "Sylvie (fr-CA, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "fr-CA",
      "locale": "fr-CA",
      "tags": [
        "Azure",
        "fr-CA",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-CA-Sylvie-General-Audio.wav"
    },
    {
      "name": "fr-CA-Sylvie:DragonHDLatestNeural",
      "title": "Sylvie:DragonHDLatest (fr-CA, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "fr-CA",
      "locale": "fr-CA",
      "tags": [
        "Azure",
        "fr-CA",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-CA-Sylvie:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "ar-JO-TaimNeural",
      "title": "Taim (ar-JO, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "ar-JO",
      "locale": "ar-JO",
      "tags": [
        "Azure",
        "ar-JO",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-JO-Taim-General-Audio.wav"
    },
    {
      "name": "hu-HU-TamasNeural",
      "title": "Tamas (hu-HU, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "hu-HU",
      "locale": "hu-HU",
      "tags": [
        "Azure",
        "hu-HU",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/hu-HU-Tamas-General-Audio.wav"
    },
    {
      "name": "es-PY-TaniaNeural",
      "title": "Tania (es-PY, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-PY",
      "locale": "es-PY",
      "tags": [
        "Azure",
        "es-PY",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-PY-Tania-General-Audio.wav"
    },
    {
      "name": "bn-IN-TanishaaNeural",
      "title": "Tanishaa (Bengali (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Bengali (India)",
      "locale": "bn-IN",
      "tags": [
        "Azure",
        "Bengali (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/bn-IN-Tanishaa-General-Audio.wav"
    },
    {
      "name": "de-DE-TanjaNeural",
      "title": "Tanja (German (Germany), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "German (Germany)",
      "locale": "de-DE",
      "tags": [
        "Azure",
        "German (Germany)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/de-DE-Tanja-General-Audio.wav"
    },
    {
      "name": "iu-Latn-CA-TaqqiqNeural",
      "title": "Taqqiq (iu-Latn, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "iu-Latn",
      "locale": "iu-Latn",
      "tags": [
        "Azure",
        "iu-Latn",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/iu-Latn-CA-Taqqiq-General-Audio.wav"
    },
    {
      "name": "iu-Cans-CA-TaqqiqNeural",
      "title": "Taqqiq (iu-Cans, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "iu-Cans",
      "locale": "iu-Cans",
      "tags": [
        "Azure",
        "iu-Cans",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/iu-Cans-CA-Taqqiq-General-Audio.wav"
    },
    {
      "name": "es-ES-TeoNeural",
      "title": "Teo (Spanish (Spain), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Teo-General-Audio.wav"
    },
    {
      "name": "es-GQ-TeresaNeural",
      "title": "Teresa (es-GQ, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-GQ",
      "locale": "es-GQ",
      "tags": [
        "Azure",
        "es-GQ",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-GQ-Teresa-General-Audio.wav"
    },
    {
      "name": "pt-BR-ThalitaNeural",
      "title": "Thalita (Portuguese (Brazil), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Thalita-General-Audio.wav"
    },
    {
      "name": "pt-BR-Thalita:DragonHDLatestNeural",
      "title": "Thalita:DragonHDLatest (Portuguese (Brazil), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Thalita:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "pt-BR-ThalitaMultilingualNeural",
      "title": "ThalitaMultilingual (Portuguese (Brazil), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-ThalitaMultilingual-General-Audio.wav"
    },
    {
      "name": "zu-ZA-ThandoNeural",
      "title": "Thando (zu-ZA, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "zu-ZA",
      "locale": "zu-ZA",
      "tags": [
        "Azure",
        "zu-ZA",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zu-ZA-Thando-General-Audio.wav"
    },
    {
      "name": "zu-ZA-ThembaNeural",
      "title": "Themba (zu-ZA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "zu-ZA",
      "locale": "zu-ZA",
      "tags": [
        "Azure",
        "zu-ZA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zu-ZA-Themba-General-Audio.wav"
    },
    {
      "name": "fr-CA-ThierryNeural",
      "title": "Thierry (fr-CA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "fr-CA",
      "locale": "fr-CA",
      "tags": [
        "Azure",
        "fr-CA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-CA-Thierry-General-Audio.wav"
    },
    {
      "name": "fr-CA-Thierry:DragonHDLatestNeural",
      "title": "Thierry:DragonHDLatest (fr-CA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "fr-CA",
      "locale": "fr-CA",
      "tags": [
        "Azure",
        "fr-CA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-CA-Thierry:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "my-MM-ThihaNeural",
      "title": "Thiha (my-MM, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "my-MM",
      "locale": "my-MM",
      "tags": [
        "Azure",
        "my-MM",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/my-MM-Thiha-General-Audio.wav"
    },
    {
      "name": "si-LK-ThiliniNeural",
      "title": "Thilini (si-LK, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "si-LK",
      "locale": "si-LK",
      "tags": [
        "Azure",
        "si-LK",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/si-LK-Thilini-General-Audio.wav"
    },
    {
      "name": "en-GB-ThomasNeural",
      "title": "Thomas (English (UK), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "Azure",
        "English (UK)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-GB-Thomas-General-Audio.wav"
    },
    {
      "name": "en-AU-TimNeural",
      "title": "Tim (English (Australia), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-Tim-General-Audio.wav"
    },
    {
      "name": "en-AU-TinaNeural",
      "title": "Tina (English (Australia), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-Tina-General-Audio.wav"
    },
    {
      "name": "es-AR-TomasNeural",
      "title": "Tomas (es-AR, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-AR",
      "locale": "es-AR",
      "tags": [
        "Azure",
        "es-AR",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-AR-Tomas-General-Audio.wav"
    },
    {
      "name": "en-US-TonyNeural",
      "title": "Tony (English (US), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "Azure",
        "English (US)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-US-Tony-General-Audio.wav"
    },
    {
      "name": "es-ES-TrianaNeural",
      "title": "Triana (Spanish (Spain), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Triana-General-Audio.wav"
    },
    {
      "name": "es-MX-Tristan:DragonHDLatestNeural",
      "title": "Tristan:DragonHDLatest (Spanish (Mexico), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Tristan:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "es-ES-Tristan:DragonHDLatestNeural",
      "title": "Tristan:DragonHDLatest (Spanish (Spain), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Tristan:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "es-ES-TristanMultilingualNeural",
      "title": "TristanMultilingual (Spanish (Spain), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-TristanMultilingual-General-Audio.wav"
    },
    {
      "name": "su-ID-TutiNeural",
      "title": "Tuti (su-ID, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "su-ID",
      "locale": "su-ID",
      "tags": [
        "Azure",
        "su-ID",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/su-ID-Tuti-General-Audio.wav"
    },
    {
      "name": "so-SO-UbaxNeural",
      "title": "Ubax (so-SO, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "so-SO",
      "locale": "so-SO",
      "tags": [
        "Azure",
        "so-SO",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/so-SO-Ubax-General-Audio.wav"
    },
    {
      "name": "ur-PK-UzmaNeural",
      "title": "Uzma (ur-PK, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ur-PK",
      "locale": "ur-PK",
      "tags": [
        "Azure",
        "ur-PK",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ur-PK-Uzma-General-Audio.wav"
    },
    {
      "name": "pa-IN-VaaniNeural",
      "title": "Vaani (Punjabi (India), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Punjabi (India)",
      "locale": "pa-IN",
      "tags": [
        "Azure",
        "Punjabi (India)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pa-IN-Vaani-General-Audio.wav"
    },
    {
      "name": "es-UY-ValentinaNeural",
      "title": "Valentina (es-UY, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-UY",
      "locale": "es-UY",
      "tags": [
        "Azure",
        "es-UY",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-UY-Valentina-General-Audio.wav"
    },
    {
      "name": "pt-BR-ValerioNeural",
      "title": "Valerio (Portuguese (Brazil), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Valerio-General-Audio.wav"
    },
    {
      "name": "ta-IN-ValluvarNeural",
      "title": "Valluvar (Tamil (India), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Tamil (India)",
      "locale": "ta-IN",
      "tags": [
        "Azure",
        "Tamil (India)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ta-IN-Valluvar-General-Audio.wav"
    },
    {
      "name": "ta-SG-VenbaNeural",
      "title": "Venba (ta-SG, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ta-SG",
      "locale": "ta-SG",
      "tags": [
        "Azure",
        "ta-SG",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ta-SG-Venba-General-Audio.wav"
    },
    {
      "name": "es-ES-VeraNeural",
      "title": "Vera (Spanish (Spain), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Vera-General-Audio.wav"
    },
    {
      "name": "bs-BA-VesnaNeural",
      "title": "Vesna (bs-BA, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "bs-BA",
      "locale": "bs-BA",
      "tags": [
        "Azure",
        "bs-BA",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/bs-BA-Vesna-General-Audio.wav"
    },
    {
      "name": "es-PR-VictorNeural",
      "title": "Victor (es-PR, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "es-PR",
      "locale": "es-PR",
      "tags": [
        "Azure",
        "es-PR",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-PR-Victor-General-Audio.wav"
    },
    {
      "name": "sk-SK-ViktoriaNeural",
      "title": "Viktoria (sk-SK, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "sk-SK",
      "locale": "sk-SK",
      "tags": [
        "Azure",
        "sk-SK",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sk-SK-Viktoria-General-Audio.wav"
    },
    {
      "name": "fr-FR-Vivienne:DragonHDLatestNeural",
      "title": "Vivienne:DragonHDLatest (French (France), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Vivienne:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "fr-FR-VivienneMultilingualNeural",
      "title": "VivienneMultilingual (French (France), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-VivienneMultilingual-General-Audio.wav"
    },
    {
      "name": "cs-CZ-VlastaNeural",
      "title": "Vlasta (cs-CZ, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "cs-CZ",
      "locale": "cs-CZ",
      "tags": [
        "Azure",
        "cs-CZ",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/cs-CZ-Vlasta-General-Audio.wav"
    },
    {
      "name": "zh-HK-WanLungNeural",
      "title": "WanLung (zh-HK, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "zh-HK",
      "locale": "zh-HK",
      "tags": [
        "Azure",
        "zh-HK",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-HK-WanLung-General-Audio.wav"
    },
    {
      "name": "en-SG-WayneNeural",
      "title": "Wayne (en-SG, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "en-SG",
      "locale": "en-SG",
      "tags": [
        "Azure",
        "en-SG",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-SG-Wayne-General-Audio.wav"
    },
    {
      "name": "af-ZA-WillemNeural",
      "title": "Willem (af-ZA, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "af-ZA",
      "locale": "af-ZA",
      "tags": [
        "Azure",
        "af-ZA",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/af-ZA-Willem-General-Audio.wav"
    },
    {
      "name": "en-AU-WilliamNeural",
      "title": "William (English (Australia), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-William-General-Audio.wav"
    },
    {
      "name": "en-AU-WilliamMultilingualNeural",
      "title": "WilliamMultilingual (English (Australia), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "English (Australia)",
      "locale": "en-AU",
      "tags": [
        "Azure",
        "English (Australia)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-AU-WilliamMultilingual-General-Audio.wav"
    },
    {
      "name": "yue-CN-XiaoMinNeural",
      "title": "XiaoMin (yue-CN, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "yue-CN",
      "locale": "yue-CN",
      "tags": [
        "Azure",
        "yue-CN",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/yue-CN-XiaoMin-General-Audio.wav"
    },
    {
      "name": "zh-CN-liaoning-XiaobeiNeural",
      "title": "Xiaobei (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-liaoning-Xiaobei-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaochenNeural",
      "title": "Xiaochen (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaochen-General-Audio.wav"
    },
    {
      "name": "zh-CN-Xiaochen:DragonHDLatestNeural",
      "title": "Xiaochen:DragonHDLatest (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaochen:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaochenMultilingualNeural",
      "title": "XiaochenMultilingual (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-XiaochenMultilingual-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaohanNeural",
      "title": "Xiaohan (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaohan-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaomengNeural",
      "title": "Xiaomeng (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaomeng-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaomoNeural",
      "title": "Xiaomo (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaomo-General-Audio.wav"
    },
    {
      "name": "zh-CN-shaanxi-XiaoniNeural",
      "title": "Xiaoni (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-shaanxi-Xiaoni-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaoqiuNeural",
      "title": "Xiaoqiu (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaoqiu-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaorouNeural",
      "title": "Xiaorou (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaorou-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaoruiNeural",
      "title": "Xiaorui (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaorui-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaoshuangNeural",
      "title": "Xiaoshuang (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaoshuang-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaoshuangMultilingualNeural",
      "title": "XiaoshuangMultilingual (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-XiaoshuangMultilingual-General-Audio.wav"
    },
    {
      "name": "wuu-CN-XiaotongNeural",
      "title": "Xiaotong (wuu-CN, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "wuu-CN",
      "locale": "wuu-CN",
      "tags": [
        "Azure",
        "wuu-CN",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/wuu-CN-Xiaotong-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaoxiaoNeural",
      "title": "Xiaoxiao (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaoxiao-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaoxiaoDialectsNeural",
      "title": "XiaoxiaoDialects (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-XiaoxiaoDialects-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaoxiaoMultilingualNeural",
      "title": "XiaoxiaoMultilingual (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-XiaoxiaoMultilingual-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaoyanNeural",
      "title": "Xiaoyan (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaoyan-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaoyiNeural",
      "title": "Xiaoyi (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaoyi-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaoyouNeural",
      "title": "Xiaoyou (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaoyou-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaoyouMultilingualNeural",
      "title": "XiaoyouMultilingual (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-XiaoyouMultilingual-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaoyuMultilingualNeural",
      "title": "XiaoyuMultilingual (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-XiaoyuMultilingual-General-Audio.wav"
    },
    {
      "name": "zh-CN-Xiaoyue:DragonHDOmniLatestNeural",
      "title": "Xiaoyue:DragonHDOmniLatest (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaoyue:DragonHDOmniLatest-General-Audio.wav"
    },
    {
      "name": "zh-CN-XiaozhenNeural",
      "title": "Xiaozhen (Chinese (Mandarin), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Xiaozhen-General-Audio.wav"
    },
    {
      "name": "es-ES-XimenaNeural",
      "title": "Ximena (Spanish (Spain), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Ximena-General-Audio.wav"
    },
    {
      "name": "es-ES-Ximena:DragonHDLatestNeural",
      "title": "Ximena:DragonHDLatest (Spanish (Spain), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-Ximena:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "es-MX-Ximena:DragonHDLatestNeural",
      "title": "Ximena:DragonHDLatest (Spanish (Mexico), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Ximena:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "es-ES-XimenaMultilingualNeural",
      "title": "XimenaMultilingual (Spanish (Spain), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Spanish (Spain)",
      "locale": "es-ES",
      "tags": [
        "Azure",
        "Spanish (Spain)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-ES-XimenaMultilingual-General-Audio.wav"
    },
    {
      "name": "es-MX-YagoNeural",
      "title": "Yago (Spanish (Mexico), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Spanish (Mexico)",
      "locale": "es-MX",
      "tags": [
        "Azure",
        "Spanish (Mexico)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-MX-Yago-General-Audio.wav"
    },
    {
      "name": "en-HK-YanNeural",
      "title": "Yan (en-HK, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "en-HK",
      "locale": "en-HK",
      "tags": [
        "Azure",
        "en-HK",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/en-HK-Yan-General-Audio.wav"
    },
    {
      "name": "pt-BR-YaraNeural",
      "title": "Yara (Portuguese (Brazil), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Portuguese (Brazil)",
      "locale": "pt-BR",
      "tags": [
        "Azure",
        "Portuguese (Brazil)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pt-BR-Yara-General-Audio.wav"
    },
    {
      "name": "as-IN-YashicaNeural",
      "title": "Yashica (as-IN, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "as-IN",
      "locale": "as-IN",
      "tags": [
        "Azure",
        "as-IN",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/as-IN-Yashica-General-Audio.wav"
    },
    {
      "name": "ms-MY-YasminNeural",
      "title": "Yasmin (ms-MY, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ms-MY",
      "locale": "ms-MY",
      "tags": [
        "Azure",
        "ms-MY",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ms-MY-Yasmin-General-Audio.wav"
    },
    {
      "name": "ms-MY-Yasmin:DragonHDLatestNeural",
      "title": "Yasmin:DragonHDLatest (ms-MY, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "ms-MY",
      "locale": "ms-MY",
      "tags": [
        "Azure",
        "ms-MY",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ms-MY-Yasmin:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "mn-MN-YesuiNeural",
      "title": "Yesui (mn-MN, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "mn-MN",
      "locale": "mn-MN",
      "tags": [
        "Azure",
        "mn-MN",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/mn-MN-Yesui-General-Audio.wav"
    },
    {
      "name": "es-NI-YolandaNeural",
      "title": "Yolanda (es-NI, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "es-NI",
      "locale": "es-NI",
      "tags": [
        "Azure",
        "es-NI",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/es-NI-Yolanda-General-Audio.wav"
    },
    {
      "name": "ko-KR-YuJinNeural",
      "title": "YuJin (Korean (Korea), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Korean (Korea)",
      "locale": "ko-KR",
      "tags": [
        "Azure",
        "Korean (Korea)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ko-KR-YuJin-General-Audio.wav"
    },
    {
      "name": "zh-TW-YunJheNeural",
      "title": "YunJhe (zh-TW, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "zh-TW",
      "locale": "zh-TW",
      "tags": [
        "Azure",
        "zh-TW",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-TW-YunJhe-General-Audio.wav"
    },
    {
      "name": "yue-CN-YunSongNeural",
      "title": "YunSong (yue-CN, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "yue-CN",
      "locale": "yue-CN",
      "tags": [
        "Azure",
        "yue-CN",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/yue-CN-YunSong-General-Audio.wav"
    },
    {
      "name": "zh-CN-henan-YundengNeural",
      "title": "Yundeng (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-henan-Yundeng-General-Audio.wav"
    },
    {
      "name": "zh-CN-Yunfan:DragonHDLatestNeural",
      "title": "Yunfan:DragonHDLatest (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Yunfan:DragonHDLatest-General-Audio.wav"
    },
    {
      "name": "zh-CN-YunfanMultilingualNeural",
      "title": "YunfanMultilingual (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-YunfanMultilingual-General-Audio.wav"
    },
    {
      "name": "zh-CN-YunfengNeural",
      "title": "Yunfeng (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Yunfeng-General-Audio.wav"
    },
    {
      "name": "zh-CN-YunhaoNeural",
      "title": "Yunhao (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Yunhao-General-Audio.wav"
    },
    {
      "name": "zh-CN-YunjianNeural",
      "title": "Yunjian (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Yunjian-General-Audio.wav"
    },
    {
      "name": "zh-CN-YunjieNeural",
      "title": "Yunjie (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Yunjie-General-Audio.wav"
    },
    {
      "name": "zh-CN-Yunqi:DragonHDOmniLatestNeural",
      "title": "Yunqi:DragonHDOmniLatest (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Yunqi:DragonHDOmniLatest-General-Audio.wav"
    },
    {
      "name": "zh-CN-YunxiNeural",
      "title": "Yunxi (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Yunxi-General-Audio.wav"
    },
    {
      "name": "zh-CN-sichuan-YunxiNeural",
      "title": "Yunxi (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-sichuan-Yunxi-General-Audio.wav"
    },
    {
      "name": "zh-CN-YunxiaNeural",
      "title": "Yunxia (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Yunxia-General-Audio.wav"
    },
    {
      "name": "zh-CN-shandong-YunxiangNeural",
      "title": "Yunxiang (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-shandong-Yunxiang-General-Audio.wav"
    },
    {
      "name": "zh-CN-YunxiaoMultilingualNeural",
      "title": "YunxiaoMultilingual (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-YunxiaoMultilingual-General-Audio.wav"
    },
    {
      "name": "zh-CN-YunyangNeural",
      "title": "Yunyang (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Yunyang-General-Audio.wav"
    },
    {
      "name": "zh-CN-YunyeNeural",
      "title": "Yunye (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Yunye-General-Audio.wav"
    },
    {
      "name": "zh-CN-YunyiMultilingualNeural",
      "title": "YunyiMultilingual (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-YunyiMultilingual-General-Audio.wav"
    },
    {
      "name": "zh-CN-YunzeNeural",
      "title": "Yunze (Chinese (Mandarin), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "Chinese (Mandarin)",
      "locale": "zh-CN",
      "tags": [
        "Azure",
        "Chinese (Mandarin)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/zh-CN-Yunze-General-Audio.wav"
    },
    {
      "name": "wuu-CN-YunzheNeural",
      "title": "Yunzhe (wuu-CN, Male)",
      "provider": "azure",
      "gender": "male",
      "language": "wuu-CN",
      "locale": "wuu-CN",
      "tags": [
        "Azure",
        "wuu-CN",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/wuu-CN-Yunzhe-General-Audio.wav"
    },
    {
      "name": "fr-FR-YvesNeural",
      "title": "Yves (French (France), Male)",
      "provider": "azure",
      "gender": "male",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "male"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Yves-General-Audio.wav"
    },
    {
      "name": "fr-FR-YvetteNeural",
      "title": "Yvette (French (France), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "French (France)",
      "locale": "fr-FR",
      "tags": [
        "Azure",
        "French (France)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/fr-FR-Yvette-General-Audio.wav"
    },
    {
      "name": "ar-SA-ZariyahNeural",
      "title": "Zariyah (Arabic (Saudi Arabia), Female)",
      "provider": "azure",
      "gender": "female",
      "language": "Arabic (Saudi Arabia)",
      "locale": "ar-SA",
      "tags": [
        "Azure",
        "Arabic (Saudi Arabia)",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/ar-SA-Zariyah-General-Audio.wav"
    },
    {
      "name": "pl-PL-ZofiaNeural",
      "title": "Zofia (pl-PL, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "pl-PL",
      "locale": "pl-PL",
      "tags": [
        "Azure",
        "pl-PL",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/pl-PL-Zofia-General-Audio.wav"
    },
    {
      "name": "sw-KE-ZuriNeural",
      "title": "Zuri (sw-KE, Female)",
      "provider": "azure",
      "gender": "female",
      "language": "sw-KE",
      "locale": "sw-KE",
      "tags": [
        "Azure",
        "sw-KE",
        "female"
      ],
      "preview_url": "https://ai.azure.com/speechassetscache/ttsvoice/Masterpieces/sw-KE-Zuri-General-Audio.wav"
    }
  ],
  "cartesia": [
    {
      "name": "f91ab3e6-5071-4e15-b016-cde6f2bcd222",
      "title": "Slow female voice for casual con (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "39d518b7-fd0b-4676-9b8b-29d64ff31e12",
      "title": "Warm adult male voice with a sli (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9cebb910-d4b7-4a4a-85a4-12c79137724c",
      "title": "Indian accented female for relat (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "2821fd0c-35c7-4adf-9c42-32e394bf85cb",
      "title": "Articulate, professional Hebrew  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e2d48e7b-cd73-4c4c-bc1e-f232580e8709",
      "title": "Deep American adult male voice w (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f4d6bb07-f876-4464-ba70-cd48d8701890",
      "title": "Bright, expressive voice for pro (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6bc7c014-022b-42ce-8b53-a5ec878a7ca7",
      "title": "Formal adult female for direct a (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "2695b6b5-5543-4be1-96d9-3967fb5e7fec",
      "title": "Intentional, clear adult for con (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3ccc4544-84f7-45e3-ae57-5c52b5a1fac6",
      "title": "Soothing voice with calm depth a (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "498e7f37-7fa3-4e2c-b8e2-8b6e9276f956",
      "title": "Calm and composed voice for clea (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a0e8430e-1267-4a4d-baa5-a5d5e53122a9",
      "title": "Aila offers a paced and approach (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "fb02b554-7d64-4f90-841e-e57fc88f410c",
      "title": "Calm and personable delivery sui (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "80c81aee-b6ad-4d12-9af8-a9c79c2e141d",
      "title": "Calm voice with soothing balance (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d6032980-a170-4fdc-adfc-aabc93db0ae4",
      "title": "Ainsley pairs welcoming tone wit (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "83604597-55fa-4ccc-8357-730b313f353f",
      "title": "Friendly and upbeat adult female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ms",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "80256320-7688-4ad3-a062-39b37bbfab33",
      "title": "Aitana stays natural without los (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "cc71692b-f326-499b-8f8f-90a415b4d3fb",
      "title": "A composed and articulate tone i (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "or",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "446f922f-c43a-4aad-9a8b-ad2af568e882",
      "title": "Clear and professional male for  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "96e6974d-57a9-4325-89c8-43f065f8bd95",
      "title": "A voice that navigates support i (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ta",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "87748186-23bb-4158-a1eb-332911b0b708",
      "title": "Wistful, wise, elderly male for  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9a0894a9-28f0-436e-9a1d-e92bccbce4dd",
      "title": "English male adult voice with a  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "17044048-bfab-44b2-9532-9c1b65e9c217",
      "title": "Lively, warm British male with a (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3a35daa1-ba81-451c-9b21-59332e9db2f3",
      "title": "Warm voice with a rich tone and  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "0e21713a-5e9a-428a-bed4-90d410b87f13",
      "title": "Graceful female for providing in (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c8403b5c-6465-4396-9065-a440d376528a",
      "title": "This voice offers a calm, precis (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "cd7b67f4-22a4-49a0-a197-3fa16f7e64d4",
      "title": "Steady and assured delivery for  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "069ff31a-5524-4945-a403-f746ee617507",
      "title": "Polished Russian voice for capab (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ru",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5e7d492a-5502-482e-b315-ebf587427806",
      "title": "Calm, balanced delivery for thou (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "50d6beb4-80ea-4802-8387-6c948fe84208",
      "title": "Playful, elderly male for media  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9904416a-0831-44ea-b8ee-5f145e8f9bbf",
      "title": "Delivers information with measur (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5522c839-bbd9-4485-8d84-ba3d75cd3330",
      "title": "Alicia offers a calm, reassuring (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "38aabb6a-f52b-4fb0-a3d1-988518f4dc06",
      "title": "Warm female for phone systems, v (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c8f7835e-28a3-4f0c-80d7-c1302ac62aae",
      "title": "Sophisticated, steady British ma (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9287676d-f0cc-423f-ac03-3b3c7242f091",
      "title": "Confident young adult male voice (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2747b6cf-fa34-460c-97db-267566918881",
      "title": "Confident, approachable young ad (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "43300c5e-f925-4cd2-adf7-0a031c0e242e",
      "title": "Crisp advisory tone for concise  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "37eb1575-353e-44f4-855d-894b4f003642",
      "title": "Delivers information with precis (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "or",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ccfea4bf-b3f4-421e-87ed-dd05dae01431",
      "title": "Warm, friendly voice with a supp (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4853bafa-52cc-48c8-86a1-1edf8c76e429",
      "title": "Alonso delivers engaging clear e (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b60048c2-abb5-43fa-b403-90dce232e55e",
      "title": "Inviting and approachable tone p (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a7a59115-2425-4192-844c-1e98ec7d6877",
      "title": "English female adult voice with  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "043cfc81-d69f-4bee-ae1e-7862cb358650",
      "title": "Strong, composed female voice su (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "2590a84a-68cf-4b08-970d-b4ff824bf242",
      "title": "Warm French Canadian female voic (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6304c635-6681-4f9e-85b6-a97f4d26461a",
      "title": "Calm, soft-spoken adult female f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "91925fe5-42ee-4ebe-96c1-c84b12a85a32",
      "title": "Friendly young adult male voice  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "gu",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "97303aad-1a66-4edf-870a-58e6ba545005",
      "title": "Warm, conversational Hindi male  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "faa75703-00e3-4a57-9955-0703001e3231",
      "title": "Polished female for capable prof (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1cf751f6-8749-43ab-98bd-230dd633abdb",
      "title": "Warm, friendly female for natura (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "48b9e1de-e2fa-4914-8b32-31c437813548",
      "title": "Clear steady tone with a paced d (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "bn",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "38a146c3-69d7-40ad-aada-76d5a2621758",
      "title": "Deep male for historical narrati (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "sv",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "a053f6bc-7df4-40de-96d4-de026bc47ce8",
      "title": "Expressive adult male voice with (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "id",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "34acfaee-c556-41ee-a5f6-c687fb20357c",
      "title": "Clear and monotone adult female  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ro",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "59b37da2-92ba-401a-9e4e-b1d16898d9bc",
      "title": "Professional Spanish female for  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "db229dfe-f5de-4be4-91fd-7b077c158578",
      "title": "Smooth male for story narration (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3f64ef99-d87b-4b51-b217-df7351f7886a",
      "title": "Casual yet firm middle-aged male (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ro",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d46e87a1-7c6d-4b18-9359-926f4a35ffdf",
      "title": "Dependable, measured Mexican mal (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "887149a8-4616-42ad-b2ce-c3819176f45d",
      "title": "Wise-sounding elderly male voice (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "072d954b-8379-4b6b-816a-bb0cd38725f8",
      "title": "Clear South African female for c (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d1c819ba-0384-496b-b63b-eb57a96a43cc",
      "title": "Hospitable and warm articulation (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "tl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c4cbcb7d-d9fa-4eac-b547-46831718ef58",
      "title": "Gentle young adult male voice wi (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "tl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5c32dce6-936a-4892-b131-bafe474afe5f",
      "title": "Energetic and approachable adult (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "mr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "209d9a43-03eb-40d8-a7b7-51a6d54c052f",
      "title": "Soft-spoken adult female voice f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d4470f50-295e-4e11-82a2-158d45bf6abc",
      "title": "Inviting and approachable tone p (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ta",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ac317dac-1b8f-434f-b198-a490e2a4914d",
      "title": "Soft-spoken adult female voice w (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "nl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "225ba8cf-9fc2-4371-a78c-fe38ba38898a",
      "title": "Clear, articulate Dutch female f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "nl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "0418348a-0ca2-4e90-9986-800fb8b3bbc0",
      "title": "Clear and smooth male for phone  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "7e8cb11d-37af-476b-ab8f-25da99b18644",
      "title": "Expressive male voice for storyt (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "882079ce-8513-4a0e-8c0c-c7b8995b12f4",
      "title": "Manages inquiries with a poised  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ef191366-f52f-447a-a398-ed8c0f2943a1",
      "title": "Warm, conversational British mal (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ec1e269e-9ca0-402f-8a18-58e0e022355a",
      "title": "Friendly and approachable female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1f575487-6f3d-40e0-862a-814f55b5fb15",
      "title": "Engaging voice with expressive w (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "2a6a0bd5-9fe4-41a9-a73e-6a7d3ca1ac57",
      "title": "Delivers information with a focu (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "12e85709-099c-480a-ba3e-875c41a9611a",
      "title": "Arlo's friendly, mid-toned Austr (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "bb7e8daa-8b79-47a2-8408-a7a1cc72b53c",
      "title": "Refined and confident tone for f (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ed8a381a-0704-4d12-8544-0560cc3f32da",
      "title": "Steady and formal delivery. Perf (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d2870b91-1b4c-47ab-81a8-3718d8e9c222",
      "title": "Expressive adult voice with a li (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ta",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "95d51f79-c397-46f9-b49a-23763d3eaa2d",
      "title": "Hinglish female for bilingual co (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3f04e815-3260-4f50-8fd9-af9c657be4c2",
      "title": "Clear, steady male voice that co (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "41e97793-a58d-40b7-8430-83465e186f94",
      "title": "This voice offers a calm and met (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ur",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "52271edb-c161-4c76-9e33-c5c1d39de6e3",
      "title": "Steady, grounded delivery for re (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "00967b2f-88a6-4a31-8153-110a92134b9f",
      "title": "Firm adult male for audiobooks a (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "7f423809-0011-4658-ba48-a411f5e516ba",
      "title": "Warm and authoritative Hindi mal (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b576c504-cbd1-4224-af06-04067c5a5e3e",
      "title": "Polished Swedish female for effi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "sv",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "53199cc1-d10d-4fe0-9129-af434b8dde20",
      "title": "With a measured pace and clear a (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "87041166-c212-4838-9028-05d7437df750",
      "title": "Warm voice with a relaxed, natur (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e2ab5462-e7c8-492d-a244-41f39444af6e",
      "title": "This voice offers a clear and at (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d3cc405c-a812-489b-afe5-f3d50a7a8310",
      "title": "This voice provides a clear and  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "sv",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "8f091740-3df1-4795-8bd9-dc62d88e5131",
      "title": "Fairy like female for character  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1fcd23d0-bf12-4896-8f60-4f21ef5c9b98",
      "title": "Reliable and approachable guide  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "cccc21e8-5bcf-4ff0-bc7f-be4e40afc544",
      "title": "High pitched, energetic young fe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "858c98dc-db9e-4d1a-9435-557cdf77685c",
      "title": "Calm, consultative presence for  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4ff88d85-28a2-4870-bdc4-cd9697fd5af5",
      "title": "Patient and reassuring delivery  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "63d6f469-8c2c-489d-b53f-d36f0bbdcd4b",
      "title": "Friendly and calm adult female f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ebc02c0d-61fd-48f2-a6c9-0d6683b7d466",
      "title": "Ayala's expressive yet controlle (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "91e91d74-8eb4-43cd-97d3-7466c21db00d",
      "title": "Relaxed adult male voice with a  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "tr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "bb2347fe-69e9-4810-873f-ffd759fe8420",
      "title": "Friendly female for narrations a (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "tr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "31c55968-a9f4-4115-8831-3a16952179c8",
      "title": "Upbeat and enthusiastic adult fe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "791d5162-d5eb-40f0-8189-f19db44611d8",
      "title": "Confident, young Indian male for (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "0f95596c-09c4-4418-99fe-5c107e0713c0",
      "title": "Firm and clear adult voice with  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "tr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "13524ffb-a918-499a-ae97-c98c7c4408c4",
      "title": "Inviting, friendly male for cust (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4fb26a05-57de-4d21-855a-f51adae44f38",
      "title": "Inviting, friendly male for cust (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d4b44b9a-82bc-4b65-b456-763fce4c52f9",
      "title": "Friendly, natural female for eng (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "bbee10a8-4f08-4c5c-8282-e69299115055",
      "title": "slightly raspy voiced middle age (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4c5c7be8-6b3b-4c62-b915-c54d049c198f",
      "title": "Professional adult male for high (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "hu",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3c0f09d6-e0d7-499c-a594-70c5b7b93048",
      "title": "Polished, and formal British mal (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "7cf0e2b1-8daf-4fe4-89ad-f6039398f359",
      "title": "Confident, firm male for narrati (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "02aeee94-c02b-456e-be7a-659672acf82d",
      "title": "Consistent voice for clear, conv (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2d5b8c3a-116c-4741-acaf-ba4fa289eba2",
      "title": "Excited and cheerful voice with  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5def377d-908b-4540-8bd7-3c968fcae351",
      "title": "Clear, methodical French male fo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "fdd6abff-902a-4885-9f5f-0d3d9f7567e5",
      "title": "Bold and reassured voice perfect (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "76961778-5ce4-4aa9-9cdf-66a029d61a8f",
      "title": "Soft and understanding tone for  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "te",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "fd91495f-b8da-4944-ab8f-674c13089d7f",
      "title": "Provides a steady and reliable p (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a167e0f3-df7e-4d52-a9c3-f949145efdab",
      "title": "Energetic adult male for engagin (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "538a8872-3799-4df5-b373-b78493b766c6",
      "title": "Warm, welcoming Spanish female t (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4aa74047-d005-4463-ba2e-a0d9b261fb87",
      "title": "Clear male for tutorials and exp (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "nl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5cad89c9-d88a-4832-89fb-55f2f16d13d3",
      "title": "Confident voice with strong clar (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "607167f6-9bf2-473c-accc-ac7b3b66b30b",
      "title": "Cheerful, friendly female voice  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3d808d23-cb09-4c39-8afd-528e209cba4f",
      "title": "English male adult voice with a  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5241b0aa-3c09-479d-b0b8-a6ec68daef5e",
      "title": "Brielle delivers engaging renewa (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "46788d8e-cdf9-4d5c-9125-094eb2e4d44c",
      "title": "Strong and aggressive American-a (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "391f4c0a-f1a8-4c21-9aa2-7a07f0a4b0dc",
      "title": "Bright and trustworthy Australia (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7fb023fd-f842-42ce-9119-a9e23d650336",
      "title": "Bright and trustworthy Australia (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e07c00bc-4134-4eae-9ea4-1a55fb45746b",
      "title": "Confident adult female for conve (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b603811e-54c2-4a0a-8854-09eab9ffa63f",
      "title": "Clear, dependable Brazilian male (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2948c301-9211-4112-8f36-4c3fc836ef12",
      "title": "Confident voice with clear enunc (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "af6beeea-d732-40b6-8292-73af0035b740",
      "title": "Authoritative male for providing (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b9cf5ec3-eaa4-46a5-a5b2-b0d0f22395a2",
      "title": "Confident male voice with author (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "00a77add-48d5-4ef6-8157-71e5437b282d",
      "title": "Smooth, young adult female for e (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "da4a4eff-3b7e-4846-8f70-f075ff61222c",
      "title": "Neutral, confident young adult m (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "a8a1eb38-5f15-4c1d-8722-7ac0f329727d",
      "title": "This voice is soft and calm, sui (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "03496517-369a-4db1-8236-3d3ae459ddf7",
      "title": "Soothing female for meditations  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "df872fcd-da17-4b01-a49f-a80d7aaee95e",
      "title": "Laidback voice with a natural, c (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "30212483-5c20-479c-8121-f93cd24e30a6",
      "title": "Lively voice for relaxed, casual (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "bef2ba57-5c10-433b-b215-3bef35110a81",
      "title": "Lively voice for relaxed, casual (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "55deba52-bc73-4481-ab69-9c8831c8a7c3",
      "title": "Calm, neutral female for custome (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4325f426-c4e0-418e-a0e5-97fcdfcdf8e6",
      "title": "Elegant, articulated French fema (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5063f45b-d9e0-4095-b056-8f3ee055d411",
      "title": "Soothing, warm male for feel goo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ed82c17b-4704-4d34-be43-5d19065acdf1",
      "title": "Matured male voice with calm dep (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "1fc31370-81b1-4588-9c1a-f93793c6e01d",
      "title": "Inviting, young accented male fo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9ebc775b-c579-4c31-b37c-2306cbe9cc91",
      "title": "Warm, lively young adult male vo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "727f663b-0e90-4031-90f2-558b7334425b",
      "title": "Natural adult female voice for c (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "bf991597-6c13-47e4-8411-91ec2de5c466",
      "title": "Authortative, mature female for  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3797b3c0-ab71-40dc-bfa0-a8c6ff9c1e8b",
      "title": "Warm, approachable presence for  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f9836c6e-a0bd-460e-9d3c-f7299fa60f94",
      "title": "Friendly, inviting, slow young a (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "0b32066b-2bcc-44b9-89ab-0223a09d1606",
      "title": "Friendly young adult male for cu (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "86e30c1d-714b-4074-a1f2-1cb6b552fb49",
      "title": "Friendly young adult male for cu (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ee8b13e7-98af-4b15-89d1-8d402be10c94",
      "title": "Friendly young adult male for cu (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "96c64eb5-a945-448f-9710-980abe7a514c",
      "title": "Friendly, young adult male for c (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4df027cb-2920-4a1f-8c34-f21529d5c3fe",
      "title": "Friendly, young adult male for c (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3246e36c-ac8c-418d-83cd-4eaad5a3b887",
      "title": "Friendly young adult male for cu (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5c43e078-5ba4-4e1f-9639-8d85a403f76a",
      "title": "Friendly young adult male for cu (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "66f5935b-af2e-4ec9-bb3e-59112e9ddc93",
      "title": "Friendly young adult male for cu (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4f7f1324-1853-48a6-b294-4e78e8036a83",
      "title": "Wistful, young male for emotiona (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d7862948-75c3-4c7c-ae28-2959fe166f49",
      "title": "Echo-y, mystical male for charac (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "162e0f37-8504-474c-bb33-c606c01890dc",
      "title": "Natural, approachable for everyd (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e8e5fffb-252c-436d-b842-8879b84445b6",
      "title": "Nice, young adult female for cas (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5539dace-8bf7-44c1-a603-160e69e740ca",
      "title": "Cedric keeps guidance clear and  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "0caedb75-417f-4e36-9b64-c21354cb94c8",
      "title": "Enunciating male for smooth conv (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "sv",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ad38904c-0ce9-42b1-9159-5ad5352ef089",
      "title": "With a thoughtful and analytical (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ca566b43-944e-4474-b494-7d9f0695f307",
      "title": "Relaxed voice with smooth tone a (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3af40927-948e-429b-b92d-e2158f79fb9f",
      "title": "Casual female voice with an easy (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4b5112be-c461-44a2-a66b-0dd7f98db4a0",
      "title": "With steady clarity and warmth,  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "aaa0bf6d-bc07-40f2-bc6b-66afc5fd42f6",
      "title": "Clear, dependable Thai male buil (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "th",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "356f4a89-d056-4e2e-8c73-865fa4d3af0a",
      "title": "Casual male voice with a warm, n (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "82c2afc8-ebbc-4802-8ccf-036dc0fa1e3b",
      "title": "A clear and composed voice, perf (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "te",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ec58877e-44ae-4581-9078-a04225d42bd4",
      "title": "Very deep, adult male for charac (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "71a7ad14-091c-4e8e-a314-022ece01c121",
      "title": "Elegant, young adult female for  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "59cb0f89-5d66-49f8-b965-f72b252789e0",
      "title": "Dependable sound for everyday as (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f762e181-ddc7-486e-9a48-636bd7e229d4",
      "title": "English female adult voice with  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3264ada2-4a79-4666-badc-49e2267be692",
      "title": "High energy adult male great for (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "1242fb95-7ddd-44ac-8a05-9e8a22a6137d",
      "title": "Smooth, welcoming adult female f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f039066f-cdb7-45ed-b51d-1034ae2f04a0",
      "title": "Smooth, welcoming adult female f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "15a9cd88-84b0-4a8b-95f2-5d583b54c72e",
      "title": "Soothing, neutral female for nar (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "01eaafa9-308a-4276-a017-6ab0cf061b1f",
      "title": "Middle-aged American female voic (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "41534e16-2966-4c6b-9670-111411def906",
      "title": "Firm, deep male with old time ra (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c78dd7ae-6692-4c44-a2a2-834e365afe60",
      "title": "Approachable male voice with a c (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c0f43c66-9f21-4034-b485-8f1d3340d759",
      "title": "Businesslike voice with confiden (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f80e7298-93f5-46d0-86f2-b8f29cfc88bd",
      "title": "Friendly, calm young adult femal (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "57a3a9e0-a91c-4c94-a2bb-e6cbab3ae649",
      "title": "This voice offers clear, articul (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4111bc29-d7ff-4a15-90db-819f7b4f7706",
      "title": "Warm with a friendly cadence and (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "db69127a-dbaf-4fa9-b425-2fe67680c348",
      "title": "Raspy voice with rugged tone, pe (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b24f41fd-00a3-4cd8-992a-a0c9f13f3ef1",
      "title": "Offers a composed and articulate (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "98a34ef2-2140-4c28-9c71-663dc4dd7022",
      "title": "Gentle, measured male voice with (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "18f8d87b-0da9-4efa-b504-4580e303f7db",
      "title": "Casual voice with an engaging, u (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3e39e9a5-585c-4f5f-bac6-5e4905c51095",
      "title": "Articulate, approachable male de (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "e39b9fc0-23f5-4616-962a-da99c8ccb1dc",
      "title": "Confident voice with clear artic (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "8d8ce8c9-44a4-46c4-b10f-9a927b99a853",
      "title": "Natural, cheery young adult fema (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "92c41dd4-04aa-45de-8504-a92b40cb8818",
      "title": "Expressive American adult male v (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "1ec736fa-db96-4eea-9299-235ce2cb7a0e",
      "title": "Decisive Irish male for straight (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9c8880b2-ccf9-4730-b805-cea23df247d7",
      "title": "Mature, confident voice with com (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "49743b08-0f5d-4741-839c-b12933853780",
      "title": "Warm and highly relatable, excel (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c46cf1f6-49a1-4d67-9a57-ff859a4046d3",
      "title": "Cora offers a helpful and articu (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "630ed21c-2c5c-41cf-9d82-10a7fd668370",
      "title": "Inviting, cheerful young adult m (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "41468051-3a85-4b68-92ad-64add250d369",
      "title": "Casual male voice with a friendl (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "16a4052e-1f11-47ac-95f5-9330bee062f9",
      "title": "Warm, professional, measured del (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "afea9efe-7b21-45d5-8e6b-0baf250b5c0a",
      "title": "With a methodical and composed d (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9e8db62d-056f-47f3-b3b6-1b05767f9176",
      "title": "Authoritative male for presentat (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "nl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3a1546bd-6781-4376-984d-70b4e9f3d2c4",
      "title": "Supportive and composed tone for (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a759ecc5-ac21-487e-88c7-288bdfe76999",
      "title": "Low pitched, intense male with a (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "e8a863c6-22c7-4671-86ca-91cacffc038d",
      "title": "Business-like, clear male for pr (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "32b3f3c5-7171-46aa-abe7-b598964aa793",
      "title": "Very young female for children's (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "23e9e50a-4ea2-447b-b589-df90dbb848a2",
      "title": "Kind male for inviting and authe (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "dbfa416f-d5c3-4006-854b-235ef6bdf4fd",
      "title": "Deep and serious male voice with (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "cc00e582-ed66-4004-8336-0175b85c85f6",
      "title": "Neutral female voice with clear  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "47c38ca4-5f35-497b-b1a3-415245fb35e1",
      "title": "Clear, crisp male voice for digi (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5c5ad5e7-1020-476b-8b91-fdcbe9cc313c",
      "title": "Calm and trusting Mexican accent (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "66d882f5-3076-4b4c-a30f-e1db8b01ed6b",
      "title": "Delivers a composed and articula (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ur",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "09ed0318-2f4a-41b1-abe5-d11da7537c31",
      "title": "Expressive and upbeat American-a (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "25b7aaa6-1670-42dc-b791-419322400803",
      "title": "Confident adult female for direc (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ru",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "23112795-d54e-4560-9568-791a87c30201",
      "title": "Husky matured male voice with ri (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "996a8b96-4804-46f0-8e05-3fd4ef1a87cd",
      "title": "Firm and confident female voice  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "8d110413-2f14-44a2-8203-2104db4340e9",
      "title": "Deep, friendly adult male for ha (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2bc8e99c-bf1c-4977-93ff-151d7383921c",
      "title": "Offers structured and dependable (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "35b2cfc1-e6fb-4d69-a598-c1780612be4a",
      "title": "Delivering with steady confidenc (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "fd098a10-ba9e-445e-b144-be2a9f3dac02",
      "title": "Engaging adult male for advertis (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b08c966e-2146-4592-99eb-3171a714a43c",
      "title": "Engaging adult male for advertis (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9d2b4a7f-7ced-4fb8-b570-9ce21fb931c8",
      "title": "Engaging adult male for advertis (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "da69d796-4603-4419-8a95-293bfc5679eb",
      "title": "Engaging adult male for advertis (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "6b622a1d-906f-44af-b60c-7bef365bf124",
      "title": "Engaging adult male for advertis (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c4e848dc-d4fd-4bc8-90ea-8525563ec0e5",
      "title": "Engaging adult male for advertis (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "a3a4fe2a-d402-41d1-be7d-28f71eda755f",
      "title": "Engaging adult male for advertis (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "10d17ae0-8f64-472a-be00-f00a98c729e0",
      "title": "Engaging adult male for advertis (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "90c896fa-aaa1-41af-a612-5267636440a3",
      "title": "Casual male voice with a relaxed (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "29fae03b-356a-4c74-9441-c5341d5557d4",
      "title": "A direct and clear voice for del (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "or",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "705a78d1-45c1-474d-8c8f-d30d559657a0",
      "title": "Friendly Southern female voice w (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "267cd81d-ce80-43b5-996e-17ef75d2016a",
      "title": "A professional and connecting vo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "8a1b8af0-c4f6-423f-a268-5507fd4aefdf",
      "title": "Professional female voice with c (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "68fb6747-b6ea-4c44-a18e-4e29921424d3",
      "title": "Low-register, grounded presence  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5cf0e4d9-ca2b-4fd5-81fa-89db3b645539",
      "title": "No-nonsense voice with steady co (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "50849023-76e9-46c7-af52-9ec39888a165",
      "title": "Warm yet authoritative middle-ag (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "el",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "910fb75e-1d20-4840-ac63-ac6b26a71bdc",
      "title": "Warm, genuine Hindi male perfect (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "1259b7e3-cb8a-43df-9446-30971a46b8b0",
      "title": "Warm, conversational Indian male (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "87a983d8-3471-4c4b-9ade-f1d10a4110ac",
      "title": "Laidback male voice with a smoot (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "083de431-6b5c-4b18-a2dc-264eafa205f2",
      "title": "Chirpy matured female voice with (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ea93f57f-7c71-4d79-aeaa-0a39b150f6ca",
      "title": "Matured voice with a casual, fri (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a8136a0c-9642-497a-882d-8d591bdcb2fa",
      "title": "Firm, mature adult female for cu (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "399002e9-7f7d-42d4-a6a8-9b91bd809b9d",
      "title": "Lively young adult male voice fo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2be00b67-d53f-4eb5-89e7-96c224d56fbc",
      "title": "Loud and expressive adult male v (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "218a8026-7a26-4dc5-9753-9e75dffe1ea6",
      "title": "Confident, measured delivery tha (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "fbee0e7d-a83a-4082-bad1-13c70f86da4e",
      "title": "Strong and expressive adult male (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "53e3dafc-dff6-4c81-9dc7-58aa9d73a51d",
      "title": "Provides a helpful and direct pr (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "or",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7c6219d2-e8d2-462c-89d8-7ecba7c75d65",
      "title": "Lively and cheerful adult female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "kn",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d2d3584d-1b44-428e-aab1-30255d28d978",
      "title": "Diya pairs a welcoming tone with (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "888b7df4-e165-4852-bfec-0ab2b96aaa46",
      "title": "Approachable adult male voice wi (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ru",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "59697755-8cfb-4ccf-9da4-f2201d06b067",
      "title": "Strong voice with commanding pro (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d709a7e8-9495-4247-aef0-01b3207d11bf",
      "title": "Neutral male voice with balanced (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c0832d40-57c5-4a34-991a-907b2cf0bfbf",
      "title": "Confident, assured Southern fema (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "586b6832-1ca1-43ad-b974-527dc13c2532",
      "title": "Welcoming male for providing ins (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "57c90262-e4a1-4496-b256-98e3a92d8d82",
      "title": "A thoughtful and organized voice (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "0c8ed86e-6c64-40f0-b252-b773911de6bb",
      "title": "Warm and relatable female voice  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "66c6b81c-ddb7-4892-bdd5-19b5a7be38e7",
      "title": "Casual female voice with a relax (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e3827ec5-697a-4b7c-9704-1a23041bbc51",
      "title": "High pitched, earnest, very youn (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b2222537-1561-4425-8c3c-e1aca96ad853",
      "title": "Casual male voice with an easy,  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "83ae58a1-7e97-4b94-b03f-e4cc0a10d8af",
      "title": "Young clean delivery that keeps  (Neutral, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "neutral"
      ],
      "preview_url": null
    },
    {
      "name": "c8605446-247c-4d39-acd4-8f4c28aa363c",
      "title": "Elderly, confident female for na (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "19e399df-5b30-4fba-9d1d-99434f993614",
      "title": "Matured female voice with gentle (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "921034a2-aace-4ef7-87b1-b9bc455c9a15",
      "title": "Matured male voice with steady p (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3efb11f3-4c0e-43c2-bad5-85ab99e993e2",
      "title": "Eduardo offers an approachable s (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5fb68a42-0ed7-46fa-8a8f-ad4b332fbf6f",
      "title": "Confident voice with clarity and (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "daa4d6bb-da62-4e16-8065-76cd87942475",
      "title": "Strong Hebrew male providing a c (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f0377496-2708-4cc9-b2f8-1b7fdb5e1a2a",
      "title": "Assured voice with calm confiden (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7d7d769c-5ab1-4dd5-bb17-ec8d4b69d03d",
      "title": "Clear, professional adult female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "00e9ec78-2002-41dd-8d19-6b1d3b17a461",
      "title": "Offers a composed and articulate (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "cefcb124-080b-4655-b31f-932f3ee743de",
      "title": "Smooth and grounded female with  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c0c52199-e35f-4681-b68a-949ee499617e",
      "title": "Warm, approachable Swiss-German  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6a176356-ada1-4b48-b2ae-3a3fdd485680",
      "title": "Deep male for entertainment and  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "8036098f-cff4-401e-bfba-f0a6a6e5e49b",
      "title": "Methodical adult female for prec (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "tr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "00510a15-4216-4fdc-a0ab-05d74cd9f795",
      "title": "Firm and professional adult fema (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "sv",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7a8ae0b6-504a-49af-92d3-4e7e2eb84ca1",
      "title": "Approachable and cheerful voice  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "64b2a604-f0de-449f-9d90-255602357c05",
      "title": "Casual female voice with a smoot (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d6f67b55-1fec-4319-8949-32ec9fa863c9",
      "title": "A composed and attentive presenc (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "248be419-c632-4f23-adf1-5324ed7dbf1d",
      "title": "Enunicating young female for pro (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "2a12b36c-7f9b-4c3a-9f7a-72731b15323a",
      "title": "Approachable presence for bright (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a151affa-feaa-439e-8df8-c1d3f91dc6b9",
      "title": "Authentic female voice with bala (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5c9e800f-2a92-4720-969b-99c4ab8fbc87",
      "title": "Authentic female voice with bala (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "8d2c9eda-31df-477a-9eb6-df6f00b82845",
      "title": "Bright, approachable Southern fe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7edf9efb-58fc-46ba-a648-3a00a86b111b",
      "title": "English male adult voice with a  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "6c64b57a-bc65-48e4-bff4-12dbe85606cd",
      "title": "Clear and well-paced adult femal (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "cb2694c3-715f-4da9-99f3-1c974fff2928",
      "title": "A warm and articulate voice, ide (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "43a317e9-f1b9-45bf-bbdb-1d4a52e46f0d",
      "title": "Calm neutral adult female great  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c7eafe22-8b71-40cd-850b-c5a3bbd8f8d2",
      "title": "Soft and delicate female with a  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b0689631-eee7-4a6c-bb86-195f1d267c2e",
      "title": "Upbeat voice with a friendly ton (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f6ce3444-478b-4ce4-982e-bcb72dffe7aa",
      "title": "Cheerful voice with warm and wel (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f6ff7c0c-e396-40a9-a70b-f7607edb6937",
      "title": "Casual adult female for natural  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "735287ee-ce91-4b08-8de4-63315c5ba1fb",
      "title": "Energetic, upbeat young adult fe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "39f753ef-b0eb-41cd-aa53-2f3c284f948f",
      "title": "Soothing male for calming dialog (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "tr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "32a806e8-894e-41ad-a4d5-6d9154d7b1e6",
      "title": "Relaxed and approachable adult m (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "sv",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "8918ddfe-2ad4-4cc8-a573-e020ca13f3f5",
      "title": "Cheerful and optimistic adult fe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ab636c8b-9960-4fb3-bb0c-b7b655fb9745",
      "title": "Clear voice for consistent, syst (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "72656902-fb4b-4c31-af52-c3b68e2cae26",
      "title": "Esha offers a soft, reassuring H (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "392e340d-bf73-4199-9f46-8baca484f4cb",
      "title": "Esteban holds consistency across (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "1a0c6bb2-bc1b-476e-8d45-56a66300362b",
      "title": "Steady, gentle Southern American (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e97c3b37-1aa5-46af-afb7-9545086aaa92",
      "title": "Clear and cheerful adult female  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "hu",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f0e50f2a-9116-4510-9c5b-fec928daff4b",
      "title": "Laid-back with a relaxed, low-ke (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "23da166b-9675-425a-a56f-10d92da2e35f",
      "title": "A professional and composed pres (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "bd89603f-0efb-4721-a0c8-d10b3642acc3",
      "title": "Practical and easygoing delivery (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3c7dfd17-3fa8-47aa-aacc-6313fe025442",
      "title": "A clear, neutral, and precise fe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "320f7211-3dc3-4292-89b1-3661e8cac27c",
      "title": "Calm voice with soft warmth and  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e5d4c33a-d8f6-46e8-a10f-b5afecc35648",
      "title": "Formal British female for high-l (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f8aacd6e-1ac2-42d3-bcbf-125336ecd0f2",
      "title": "Professional Polish female for e (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a976c076-3e31-4bf2-a178-8c3ce3d52b2a",
      "title": "Grounded and calm presence for p (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "81452d3b-a5f6-4ef4-afff-542182fac725",
      "title": "Provides precise and efficient s (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "9d216805-e52e-4b1e-966a-6447df592a5d",
      "title": "A natural tracking desk style ra (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "526ab945-9cbf-4bd2-9c72-3833d55d4c68",
      "title": "This voice offers a composed and (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "8281db18-6ac5-47bb-91a8-ce23a1f1d951",
      "title": "Warm and fatherly adult male voi (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ms",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "731ace69-ee17-41bc-8c6f-665c9f1db95c",
      "title": "Polite, steady Arabic female for (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "caa06a3e-c85d-459d-a1c0-4a25eeb60aeb",
      "title": "Comforting and hospitable Southe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "0b904166-a29f-4d2e-bb20-41ca302f98e9",
      "title": "Cheery, confident adult woman fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a37639f0-2f0a-4de4-9942-875a187af878",
      "title": "Relaxed, conversational male for (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "616c64d7-f541-436b-9b8d-e79cfbe19ef9",
      "title": "A supportive voice, perfect for  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4fbae271-89c4-494d-8181-6eddca393453",
      "title": "Femke holds consistency across a (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "nl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "453c418c-125e-4e5a-b048-03fec55d0963",
      "title": "Offers precise and reassuring co (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b4b8e2af-6139-466e-a93a-30c20d2e1fc5",
      "title": "Approachable, Mexican female ide (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "15070120-82ab-48e5-87e5-c4bf28fa4bf9",
      "title": "Finn provides an upbeat and amia (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "a01c369f-6d2d-4185-bc20-b32c225eab70",
      "title": "Chirpy and energetic British fem (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "de075c71-b2dd-4723-848d-ea9aa9cd010b",
      "title": "Youthful, spirited Dutch female  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "nl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b8f073cd-cb60-43ef-aa01-feb59a8b7394",
      "title": "With steady clarity and warmth,  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "79743797-2087-422f-8dc7-86f9efca85f1",
      "title": "Confident and engaging male for  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d609f27f-f1a4-410f-85bb-10037b4fba99",
      "title": "Enunciating female for natural c (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "236bb1fb-dc41-4a2b-84d6-d22d2a2aaae1",
      "title": "Elderly man speaking over a crac (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "79d2cf27-444a-4c3a-9eed-2ad5cf795a3b",
      "title": "Fraser brings a bright and artic (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "bcdcad6d-4eb6-4a71-89fd-1ae2ce9f95d8",
      "title": "A bright and articulate voice, i (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "sv",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6c6b05bf-ae5f-4013-82ab-7348e99ffdb2",
      "title": "Expressive female for clear comm (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "sv",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "8832a0b5-47b2-4751-bb22-6a8e2149303d",
      "title": "This voice is velvety and neutra (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5c3c89e5-535f-43ef-b14d-f8ffe148c1f0",
      "title": "This voice is even and rich, per (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ab7c61f5-3daa-47dd-a23b-4ac0aac5f5c3",
      "title": "This voice is friendly and calm, (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "97e7d7a9-dfaa-4758-a936-f5f844ac34cc",
      "title": "Positive and gentle male for con (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f5e6c270-2aa9-463f-b48b-579a39284ce2",
      "title": "An approachable and steady tone  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "36e0c00b-1bfd-4ad7-a0e8-928d4cadca00",
      "title": "Firm and well-paced adult male v (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "hu",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5ef98b2a-68d2-4a35-ac52-632a2d288ea6",
      "title": "Serious, elderly Spanish man for (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c58bda25-abd5-4c72-97a2-4dbe049b368d",
      "title": "Upbeat voice with bright energy  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "dc52ada6-0e11-4684-a8fa-e0af5b7bdcb2",
      "title": "Measured and direct delivery for (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f4a3a8e4-694c-4c45-9ca0-27caf97901b5",
      "title": "Casual male voice with a relaxed (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3cd7da94-509d-4a2a-b0f0-67fd39fe4e8e",
      "title": "This articulate and resourceful  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "or",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "62ae83ad-4f6a-430b-af41-a9bede9286ca",
      "title": "Confident, emotive British femal (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4bc3cb8c-adb9-4bb8-b5d5-cbbef950b991",
      "title": "Steady, British male voice for c (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d132064c-b931-4a80-bf0d-02a331ec4572",
      "title": "Friendly adult male with a casua (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "bg",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5deeaea9-c3cf-4288-82ec-22d8f04eb158",
      "title": "Deep, distinct middle-aged male  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2d693a9c-fc75-4313-aefb-c9cfaa17dd83",
      "title": "Deep, distinct middle-aged male  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "029c3c7a-b6d9-44f0-814b-200d849830ff",
      "title": "Deep male for conversational sup (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "84b969ad-19c7-428d-b742-48d387f7f138",
      "title": "Warm, genuine Hebrew male perfec (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "36d94908-c5b9-4014-b521-e69aee5bead0",
      "title": "Firm and clear adult female voic (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "88b329db-85d7-47cc-a5c5-98225a756721",
      "title": "Vintage-style adult male voice w (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "58e531e3-b212-49df-adee-c335a19c2429",
      "title": "Warm, authentic Spanish male per (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "36b42fcb-60c5-4bec-b077-cb1a00a92ec6",
      "title": "Male, simulating the acoustics o (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c2ad7092-0447-47ea-948b-61fbb6faf153",
      "title": "Polished, bright Australian fema (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a4a16c5e-5902-4732-b9b6-2a48efd2e11b",
      "title": "Polished, bright Australian fema (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1628cfcd-a161-4e47-98ff-46bffa4ab290",
      "title": "Confident male voice with a clea (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d46abd1d-2d02-43e8-819f-51fb652c1c61",
      "title": "Reliable, clear male voice with  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "a0e99841-438c-4a64-b679-ae501e7d6091",
      "title": "Neutral, deep male for conversat (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "34d923aa-c3b5-4f21-aac7-2c1f12730d4b",
      "title": "Elderly male for narrations (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c99d36f3-5ffd-4253-803a-535c1bc9c306",
      "title": "Elderly male for narrations (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "dbaa1a0d-e004-442d-866f-5431b18d8d54",
      "title": "Character-rich voice for storyte (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "8bacd442-a107-4ec1-b6f1-2fcb3f6f4d56",
      "title": "Soft and caring adult male voice (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pa",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "28a942b5-74f3-47bb-9b56-4c3f2562d3ba",
      "title": "Calm, measured Brazilian male su (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4dd4630e-19e0-4243-bca0-676ff85119b7",
      "title": "Refined and smooth articulation  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "cec7cae1-ac8b-4a59-9eac-ec48366f37ae",
      "title": "Casual female voice with a relax (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "db408a93-859c-4a0a-b6a2-220c074cc90d",
      "title": "Relaxed female voice with a warm (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "02009efe-320b-43e4-9b2f-8a20153d32c5",
      "title": "This voice clearly guides listen (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "16212f18-4955-4be9-a6cd-2196ce2c11d1",
      "title": "Warm and friendly adult male voi (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "a892d232-f705-40d7-bc8d-e368b295ec2a",
      "title": "Deep male voice with classic res (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "fdf6303b-4cfa-4f8e-b7ae-acb398984cf9",
      "title": "Casual voice with a relaxed, nat (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c5d00dfb-501f-43f3-8e79-c810d24f5acd",
      "title": "Adult female for highly structur (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "df89f42f-f285-4613-adbf-14eedcec4c9e",
      "title": "Crisp, professional British male (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3dcaa773-fb1a-47f7-82a4-1bf756c4e1fb",
      "title": "Seasoned male for friendly conve (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "00a472d9-32a2-4648-a733-f53e484a381e",
      "title": "With steady clarity and warmth,  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "861213b7-f057-45c8-9527-0f4c144f1a03",
      "title": "Clear, polite Japanese female fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1df0b2fe-acb0-4484-8f32-9e231d9e7a90",
      "title": "Harvey offers a calm, reassuring (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "664aec8a-64a4-4437-8a0b-a61aa4f51fe6",
      "title": "Strong, authoritative voice for  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f014dce5-df0e-4cfa-98e1-bd4bb73bb0b1",
      "title": "Easy to place in commerce, care, (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "eb7d0d3b-e427-483b-bbca-1c009c33f8a7",
      "title": "Smooth professional delivery, pe (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b042270c-d46f-4d4f-8fb0-7dd7c5fe5615",
      "title": "Energetic and captivating male w (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b0f46533-d4bb-493f-a26f-a99e1f2e86e3",
      "title": "Warm, relatable young adult male (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "65c34eec-42c9-4a75-a8bd-b676fb847b72",
      "title": "Friendly adult female voice for  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fi",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d9f4af15-c402-4f50-bbda-d8823d028d6a",
      "title": "A natural express host style rat (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "eede54e1-c038-4b4d-b655-809eeaa45c4c",
      "title": "Smooth, polished Swedish male su (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "sv",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d1cbea67-e4d3-47cd-be2a-2bd4e646b002",
      "title": "Articulate, dependable German ma (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "87286a8d-7ea7-4235-a41a-dd9fa6630feb",
      "title": "A relaxed, youthful male voice w (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f6f315e4-4fb3-4440-92ea-2edb01f9bf1b",
      "title": "Warm, confident, and approachabl (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "6a16c1f4-462b-44de-998d-ccdaa4125a0a",
      "title": "Lively, confident male for annou (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "1cd6668f-84b9-41a2-adbd-b7328f8d6ef4",
      "title": "Hila is a warm and clear voice,  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d0ff6870-dd30-420d-8568-d756d806ea62",
      "title": "Polished Japanese female for pol (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1d210168-d764-462c-8ab6-288a6d5a9579",
      "title": "Steady Japanese male for clear t (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "aef96ff9-4578-4b5d-9744-7fb347cbe4d4",
      "title": "Cheerful voice with bright warmt (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "0d42f0f6-c019-4082-b250-1c16133d1c82",
      "title": "Male adult voice with a clear, a (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "7a5d4663-88ae-47b7-808e-8f9b9ee4127b",
      "title": "Upbeat, happy young adult woman  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "002622d8-19d0-4567-a16a-f99c7397c062",
      "title": "Natural voice for clear, engagin (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4cf80313-54dc-4ca9-a17c-3e5b8f68a78c",
      "title": "Seasoned male voice with rich ch (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "1463a4e1-56a1-4b41-b257-728d56e93605",
      "title": "Expressive, young adult male for (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "90dba946-774b-40ed-98d9-ac3835117827",
      "title": "Warm, welcoming Korean female th (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "33124162-0d74-48af-ab1c-c1c01bac0247",
      "title": "Ido's mid-pitched voice offers a (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "e4411d96-83e8-4e3a-b336-1d55a6f5eb31",
      "title": "Delivers information with a thou (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5a93ae96-9e3e-4b9d-8575-5f62b7de6d0f",
      "title": "Polished, articulate delivery fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "bdab08ad-4137-4548-b9db-6142854c7525",
      "title": "Bollywood male artist for seriou (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "10c66789-dbc8-4759-ae3f-161c717bee10",
      "title": "A clear and steady voice offerin (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ur",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5f83e88f-9b5a-4563-95c4-904f4b0036e9",
      "title": "Providing a calm and empathetic  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "db74bd0c-9ea6-4d08-b78e-c3c0a54dfd2d",
      "title": "Easy to place in commerce, care, (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f852eb8d-a177-48cd-bf63-7e4dcab61a36",
      "title": "Serene female for relaxing narra (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "sv",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7c58f4a4-a72c-42fa-a503-41b9408820f3",
      "title": "Confident, articulate French fem (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a7beff01-8f8b-4809-bfe6-e2166e57e0c2",
      "title": "Her measured and thoughtful deli (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "642014de-c0e3-4133-adc0-36b5309c23e6",
      "title": "Graceful female for narrations a (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ru",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c894559e-d529-4d70-a6fb-3330ecf7ef6b",
      "title": "Warm, conversational American fe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "60e94cf5-8069-459f-a91e-3ff852a51107",
      "title": "Warm, expressive Dutch female fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "nl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f39bf583-3b3d-402f-9ffb-6179d9ec3e35",
      "title": "Confident, clear, and firm adult (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c0c374aa-09be-42d9-9828-4d2d7df86962",
      "title": "Smooth and approachable female w (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c9611be8-aae9-4a93-bb1c-98dd6b7d52a4",
      "title": "Rich, expressive Brazilian femal (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "22f1a356-56c2-4428-bc91-2ab2e6d0c215",
      "title": "Formal adult female for professi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4590a461-bc68-4a50-8d14-ac04f5923d22",
      "title": "Youthful female voice with a cle (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "gu",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "fd2ada67-c2d9-4afe-b474-6386b87d8fc3",
      "title": "Conversational male for Hinglish (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "14008c51-fbf4-418e-ae23-9316a03dcfa2",
      "title": "A reassuring and articulate pres (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "eef47c0d-cb49-4160-a4a0-6b97ed4c81e6",
      "title": "Calm voice with gentle warmth an (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "db3dc8a6-d8f8-4ca5-add9-559c849a6fa0",
      "title": "Measured, thoughtful tone for st (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "a1a16724-b1f3-4b27-9e47-8a175115e93c",
      "title": "Relaxed adult male voice for eas (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "hr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "fcbecbcc-0cef-4615-8b5a-712fe1b39dd0",
      "title": "Clear and authoritative adult fe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "bg",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6776173b-fd72-460d-89b3-d85812ee518d",
      "title": "Friendly and chill male voice wi (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
      "title": "Confident, young adult female fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "92579402-6868-412e-b845-3efed0be7a9e",
      "title": "A serene and composed voice that (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "663afeec-d082-4ab5-827e-2e41bf73a25b",
      "title": "Serious female for formal conver (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "89f4372f-1f73-4b85-8e1e-5d24ed8bc826",
      "title": "Calm, measured Korean male suite (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "729651dc-c6c3-4ee5-97fa-350da1f88600",
      "title": "Friendly, young adult male for w (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2a3503b2-b6b6-4534-a224-e8c0679cec4a",
      "title": "Clear male for narrations (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "42b39f37-515f-4eee-8546-73e841679c1d",
      "title": "Very deep, authoritative male fo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "a5136bf9-224c-4d76-b823-52bd5efcffcc",
      "title": "Friendly, laid-back male voice f (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b5c1bab5-f036-481f-9295-4db6f06f6443",
      "title": "Casual voice with a warm, friend (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "42f14755-88c3-4124-aae3-5cc3a9618e8f",
      "title": "Clear adult male great for provi (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "82db1f84-5b96-4364-b04a-4c7ff80e2f8a",
      "title": "Clear, professional Czech male f (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "cs",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "bdc4a3ce-2e22-4398-8cd6-76b7160d2298",
      "title": "Clear and crisp female voice wit (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "cs",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "fb7d8d97-9730-4165-bd79-36b5ce61b5f2",
      "title": "Janani delivers content with a c (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ta",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "2a17e905-8f14-4db7-9b9d-9223a8e3f278",
      "title": "A crisp, modern voice with a fri (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "58fbaf73-d7de-4e82-a6b3-118180e7057c",
      "title": "Bright, warm female voice for gu (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "69092565-1c93-4a88-9f2c-ac8cddaf9f65",
      "title": "Engaging voice with a casual, fr (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7ea5e9c2-b719-4dc3-b870-5ba5f14d31d8",
      "title": "Calm and neutral female voice wi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "8ccd7fcd-846a-4594-bde2-5feec2cba73a",
      "title": "Steady adult male for direct and (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fi",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3faa81ae-d3d8-4ab1-9e44-e50e46d33c30",
      "title": "Warm, expressive voice for custo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "e98bd614-9b9d-4031-b930-ed72482af858",
      "title": "A bright, expressive Australian  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "991c62ce-631f-48b0-8060-2a0ebecbd15b",
      "title": "Expressive adult female voice wi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pa",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e9f0368b-3662-4a01-b037-e13ca5203c74",
      "title": "Approachable adult male voice fo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "500d5ceb-6a05-41a1-9cf8-e1562a03ca89",
      "title": "This voice conveys a capable and (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ac197a78-cec7-4c50-93e5-93bdc1910b11",
      "title": "Approachable adult female great  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6cb8801d-259a-4bdc-978f-b45808d58cd3",
      "title": "High energy voice with clear and (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4b250449-c635-4b63-bd1d-b654b12ffcd4",
      "title": "Clear and firm adult male voice  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "nl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "42332792-6e9f-4b2c-a106-3ff97e34a79d",
      "title": "Gentle and reassuring tone desig (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "tl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "7c1ecd2d-1c83-4d5d-a25c-b3820a274a2e",
      "title": "Friendly, emotionally aware voic (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "25d7abcb-4d6d-4aca-adce-8a1c85620c8b",
      "title": "Crisp and articulate delivery de (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "bbc5d060-50e1-45a3-87ff-191b8cea3092",
      "title": "Casual male voice with an easygo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f39d8500-0d9b-4b8b-a080-38f5188f5892",
      "title": "Smooth, confident, and engaging  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7e2a44d1-76b8-42b8-9507-fedfe3a803c8",
      "title": "Formal Mandarin male for structu (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "51afbb31-bc56-468d-b122-4f388b7c25d9",
      "title": "Delivers engaging helpful anchor (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "304fdbd8-65e6-40d6-ab78-f9d18b9efdf9",
      "title": "Relaxing female for narrations a (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e4d5f4c4-6601-4779-bee1-b3c14d629dc6",
      "title": "Cheerful voice with lively warmt (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "cda9a0ca-0378-420a-9697-2241be5db771",
      "title": "Jimena offers a clear clear expl (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6eb8965c-e295-47bd-a9e4-3eeebb3abcff",
      "title": "Clear Mandarin female for reliab (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "15628352-2ede-4f1b-89e6-ceda0c983fbc",
      "title": "Professional and polite adult fe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5abd2130-146a-41b1-bcdb-974ea8e19f56",
      "title": "Young adult female for casual co (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c9440d34-5641-427b-bbb7-80ef7462576d",
      "title": "Young adult female for casual co (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a7b8d8fa-f6e5-4908-900e-0c11d1d82519",
      "title": "Upbeat matured female voice with (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c8750946-6b70-4dbf-b760-8cc554e98a0c",
      "title": "Tuned for support desks and demo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "34575e71-908f-4ab6-ab54-b08c95d6597d",
      "title": "Casual, friendly male for natura (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4b31d090-8d2d-4bcd-8a32-1c135301e26e",
      "title": "Deep, resonant presence for conf (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d1d9c946-7cfc-4378-85a4-07d09827cb7e",
      "title": "Rich, honeyed Southern female pe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "dff81230-ff75-49a4-af44-f6b2f43500d8",
      "title": "Casual male voice thats warm, fr (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "87bc56aa-ab01-4baa-9071-77d497064686",
      "title": "Welcoming adult male for engagin (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "7b001dff-b8b2-4da7-92e4-5c794798effa",
      "title": "Seasoned, relaxed voice with a w (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "68db3d29-e0ab-4d4f-a5d5-e34ee47d38b7",
      "title": "Deep voice with firm tone for pr (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3ca54c01-ef9a-4f44-9f73-adbde3a26ef8",
      "title": "Offers a calm and even delivery, (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "7d444628-dd13-442b-b687-71a6baf0c07e",
      "title": "Gentle and reassuring tone desig (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3b7d569e-01fc-45ef-b74b-29460956c691",
      "title": "Josette's inviting and clear voi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "8bfb1d08-a77a-4a7c-a4b7-af377380c6eb",
      "title": "Sharp and precise delivery ideal (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "tl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5cd73b8e-703e-4f73-9e30-56876c620204",
      "title": "Crisp and articulate delivery de (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "tl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c68a8bd0-f99e-4e7f-915d-a097da6d024c",
      "title": "Friendly, reassuring voice for c (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4d3d2e9c-14e4-4802-a8d8-bd5268a73fde",
      "title": "Confident voice with clear artic (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "8f1e9d27-96ff-405e-9213-7432a784ac0b",
      "title": "Delivers information with a poli (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "273f9ef7-9fc2-4def-88bb-ab108c6249ca",
      "title": "Soft, graceful tone with a compo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5319c0b1-3dd1-4c00-b721-bfd2ec88ef56",
      "title": "Friendly and cheerful male voice (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "cc4276e6-1ebc-429a-8c7d-930993d51abc",
      "title": "Professional, warm French male f (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c9115185-0086-4cf4-bfdd-0d36425db387",
      "title": "Upbeat and inviting young female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "cb9c954d-bcaa-43ed-82bf-aeb5e88a3cb5",
      "title": "Offering a composed and structur (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "43e52207-96fc-4e01-aaf8-cae317e43fdb",
      "title": "Methodical Polish male for preci (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "eda5bbff-1ff1-4886-8ef1-4e69a77640a0",
      "title": "Deep, friendly adult male for co (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "a935f15c-4b24-41dd-ba82-b90035720d16",
      "title": "A calm and clear voice perfect f (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "8810fbfa-b317-4503-9974-9774d08b5897",
      "title": "Gentle and hospitable voice good (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "th",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "44863732-e415-4084-8ba1-deabe34ce3d2",
      "title": "Upbeat, positive, and gentle fem (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4f7b1820-6263-4615-87a7-b105768d8f64",
      "title": "Polished Norwegian voice for eff (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "no",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3f4ade23-6eb4-4279-ab05-6a144947c4d5",
      "title": "Friendly female for casual conve (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "19f28c21-ae34-499f-b64a-f7b09cd9b516",
      "title": "A clear, helpful voice with a ca (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ta",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ea7b5eee-39d9-40b0-b241-1910cbca9c62",
      "title": "Approachable adult female voice  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "abf68668-6549-462c-8426-1fa7b466b91d",
      "title": "Warm and approachable adult fema (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "sk",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "575a5d29-1fdc-4d4e-9afa-5a9a71759864",
      "title": "Melodic female for storytelling (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "489b647b-5662-408f-8c95-82e26ef8d29e",
      "title": "Direct, no-nonsense female voice (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f786b574-daa5-4673-aa0c-cbe3e8534c02",
      "title": "Enunciating young adult female f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c323c793-41f9-47b8-99dc-9b44b0440b84",
      "title": "Soft and calm adult female voice (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "da",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "9436e723-612d-4114-aeb0-fa00d4d639bf",
      "title": "Lively confident male for advert (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "56e35e2d-6eb6-4226-ab8b-9776515a7094",
      "title": "Mature Indian female for custome (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "01d7796d-ac10-4ea3-8df0-3cc04f2d25ff",
      "title": "Crisp and articulate delivery de (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ta",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "25d2c432-139c-4035-bfd6-9baaabcdd006",
      "title": "Friendly voice with natural tone (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ta",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1ac31ebd-9113-405b-9d80-4a4bbbeea91c",
      "title": "Casual female voice with a frien (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "75599e98-4d9b-4f1a-947f-67495c087091",
      "title": "Holds consistency across alphanu (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "9fa83ce3-c3a8-4523-accc-173904582ced",
      "title": "Chill, young adult male for casu (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4b1e0bf9-53a0-4e9e-8664-ba1314dbcb38",
      "title": "Casual voice with a friendly, na (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "050f5a7a-9d2b-4b76-84e3-2d056a0a3eb0",
      "title": "Upbeat voice with lively energy  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "358e650d-ac0b-4a74-b14f-aca3daa40d79",
      "title": "Clear, steady, and professional  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ffd984de-0b16-49f7-8a1a-13b2806a8ad0",
      "title": "This voice delivers complex info (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6b92f628-be90-497c-8f4c-3b035002df71",
      "title": "Calm, deep male for news narrati (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "aa086107-101b-4182-a628-c51186d74166",
      "title": "Well-paced male voice with clear (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "cf14fdcd-24a0-4d63-958a-c784f33d8e7c",
      "title": "Well-paced male voice with clear (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "876c39e1-9ecd-42cd-b0c1-8b3906f0be19",
      "title": "Well-paced male voice with clear (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "911b8b22-887f-4caf-bf87-85d834c08708",
      "title": "Well-paced male voice with clear (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "83e45f18-fac4-40db-a43b-03257883b437",
      "title": "Well-paced male voice with clear (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "cb605424-d682-48e9-94db-34cc567cf1c6",
      "title": "Well-paced male voice with clear (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "64875a07-f57e-4a70-b702-4e3fb25efeda",
      "title": "Well-paced male voice with clear (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "abe7dee1-6051-43d3-9a9f-1ac1312497a7",
      "title": "Well-paced male voice with clear (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d1708217-3c6f-46c5-a46f-d47abdcd59e5",
      "title": "Expertly coordinates information (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b068aef8-2c18-4a1d-bafb-e8f6d2239d60",
      "title": "Composed, fluent delivery for cl (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b0aa4612-81d2-4df3-9730-3fc064754b1f",
      "title": "Voice with cheerful tone and exp (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f8f5f1b2-f02d-4d8e-a40d-fd850a487b3d",
      "title": "Upbeat, enunciating Indian accen (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "228fca29-3a0a-435c-8728-5cb483251068",
      "title": "Confident voice with strong clar (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "eb649460-7e23-43bc-ad20-0a7a2749b938",
      "title": "Friendly voice with a smooth, ea (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "57dcab65-68ac-45a6-8480-6c4c52ec1cd1",
      "title": "Emotive, young adult female for  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ac5a9529-3965-4eac-b574-dce63664fbf4",
      "title": "Kiran provides a steady and trus (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2578354e-4b18-4d28-832c-5943344b7085",
      "title": "Gentle and reassuring tone desig (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "24c61c42-b538-468e-a9ad-16c7a032c9cb",
      "title": "Deep, grounded male voice for na (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c63361f8-d142-4c62-8da7-8f8149d973d6",
      "title": "Easygoing adult male voice with  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "a50a04b8-35ee-487e-8b87-97f0eee68a64",
      "title": "Professional adult male for smoo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "th",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5283efe8-07d1-4e3a-b615-2ae4a81c1b73",
      "title": "Inviting and clear voice offers  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "efa653e5-314d-46ca-9f90-70ac7d6ca71e",
      "title": "Engaging male voice with express (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c961b81c-a935-4c17-bfb3-ba2239de8c2f",
      "title": "Friendly male voice with a warm, (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "33658a29-5982-44c5-9114-0b2c31e100b4",
      "title": "A professional and reassuring vo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "efc5488b-5429-4e72-aaa2-570981cf47d9",
      "title": "Cheerful and friendly female voi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7f98e662-142d-41ba-89a2-12452640ce6d",
      "title": "Casual and upbeat adult female v (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ta",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "bf32f849-7bc9-4b91-8c62-954588efcc30",
      "title": "Firm, neutral adult woman for pr (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "85b356c1-c638-404d-b986-f54a53d957d6",
      "title": "Providing thoughtful support and (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "8d826d43-20ad-4c56-8d37-1048eccca1bf",
      "title": "Friendly, approachable Brazilian (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d6dca1b6-cdd8-4e9c-823c-e03979261740",
      "title": "Approachable adult male voice wi (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "no",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b426013c-002b-4e89-8874-8cd20b68373a",
      "title": "Bright and clear adult female vo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ml",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1cc00672-e9d4-455e-b3fb-31dfb7aad231",
      "title": "Laura provides a steady and reli (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "cb6a8744-41b0-4cdc-b643-fabeb545c6a9",
      "title": "Warm voice with gentle empathy a (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a33f7a4c-100f-41cf-a1fd-5822e8fc253f",
      "title": "Expressive female voice for narr (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7345dfa5-ee04-44d2-abf4-29262b880ab4",
      "title": "Strong, definitive French male p (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c6bbc7d5-4b35-4d49-b1c6-4417019a61c1",
      "title": "Approachable and upbeat, a stron (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d2c66146-c1c8-4c3a-9870-38e5a6b72442",
      "title": "Charming matured male voice with (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "999df508-4de5-40a7-8bd3-8c12f678c284",
      "title": "Chill voice with a smooth, easyg (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1ade29fc-6b82-4607-9e70-361720139b12",
      "title": "Smooth female for casual convers (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f0ed6159-0362-4510-9e2c-adaf3336081e",
      "title": "Natural American female voice wi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "758a5cff-af0b-4bdf-84bd-4c1b5525c249",
      "title": "Warm and approachable voice, ide (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4ab1ff51-476d-42bb-8019-4d315f7c0c05",
      "title": "Cool German female for clear com (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "adc919b3-6ebf-47fd-8a46-27c5169d6d94",
      "title": "Bright, cheerful voice with clea (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "adff5dcb-249f-463f-aa89-d98d8ca05e88",
      "title": "High energy adult male great for (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "0834f3df-e650-4766-a20c-5a93a43aa6e3",
      "title": "Friendly and approachable male v (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "dbebd077-80cb-4bcf-b43b-4552f96341bb",
      "title": "Casual and approachable adult ma (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ka",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4703c250-66e4-4682-a223-0a60acafcfc0",
      "title": "Strong, confident voice for cust (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "56b87df1-594d-4135-992c-1112bb504c59",
      "title": "Cheery, young female for enterta (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "fa7bfcdc-603c-4bf1-a600-a371400d2f8c",
      "title": "Expressive female for conversati (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "tr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "41f3c367-e0a8-4a85-89e0-c27bae9c9b6d",
      "title": "Casual, friendly young male for  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "8e8f222d-c817-4cc5-822b-8bf76ca7e98d",
      "title": "Gentle, clear delivery for atten (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "vi",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "21d8f579-b69c-42f0-8313-c50c6be05531",
      "title": "Reliable and consistent tone for (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "tl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4af7c703-f2a9-45dd-a7fd-724cf7efc371",
      "title": "Melodic female for gentle and em (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b503f001-80b8-49d3-8666-8d7700fc5ca2",
      "title": "Gentle, motherly middle-aged fem (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "dda51133-5d43-4a3b-84e6-e68c13f60cba",
      "title": "Relaxed, casual voice for friend (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "829ccd10-f8b3-43cd-b8a0-4aeaa81f3b30",
      "title": "Clear, confident mature female f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a38e4e85-e815-43ab-acf1-907c4688dd6c",
      "title": "Happy adult female with a laidba (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "935a9060-373c-49e4-b078-f4ea6326987a",
      "title": "Voice with gentle tone and natur (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "vi",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b54dc7e4-afca-4877-aa67-2c725419b600",
      "title": "Gentle delivery for confident as (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c1b9a03e-747f-40ad-8e7b-18caf8aaac0b",
      "title": "Soothing female voice with gentl (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "653b9445-ae0c-4312-a3ce-375504cff31e",
      "title": "Casual, neutral adult man for co (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d718e944-b313-4998-b011-d1cc078d4ef3",
      "title": "Casual female for natural conver (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "0e8d318d-7b5a-49d1-9952-dc265248c12a",
      "title": "This voice combines clarity with (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ea7c252f-6cb1-45f5-8be9-b4f6ac282242",
      "title": "Casual voice with an easy, conve (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "0b66a153-548f-4f2c-b734-09a13b0bd163",
      "title": "Calm and clearly enunciated voic (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ee16f140-f6dc-490e-a1ed-c1d537ea0086",
      "title": "Approachable Italian adult male  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "25bf938a-025c-4dd0-906f-8cf8be2e26e9",
      "title": "Settled delivery with a slow and (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5cc54223-ec0c-4c50-87e9-b9947264e1f4",
      "title": "Female with clear enunciation fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "57c63422-d911-4666-815b-0c332e4d7d6a",
      "title": "Female with clear enunciation fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ba0add52-783c-4ec0-8b9c-7a6b60f99d1c",
      "title": "Female with clear enunciation fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "414da90b-16b3-4e88-86f5-3c3945e8fa4b",
      "title": "Female with clear enunciation fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "8843adfb-77d3-455a-86f9-de0651555ec6",
      "title": "Female with clear enunciation fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "2d01710c-7c77-4cf1-b0d0-5902a25f6e17",
      "title": "Female with clear enunciation fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "fb78f09f-f998-4061-ad51-d71f90388f0e",
      "title": "Female with clear enunciation fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c2da2a3e-b0d6-46bf-a09a-68562617a50a",
      "title": "Female with clear enunciation fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "004e0148-b251-48ae-b77a-234fbb5e2099",
      "title": "This voice offers a calm and ana (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "e70cceed-576e-4fc1-9fc1-f1e137f15367",
      "title": "Delivers information with a meth (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "700d1ee3-a641-4018-ba6e-899dcadc9e2b",
      "title": "Pleasant, clear female for casua (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e019ed7e-6079-4467-bc7f-b599a5dccf6f",
      "title": "Casual male for natural conversa (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "af482421-80f4-4379-b00c-a118def29cde",
      "title": "Enunciating male for storytellin (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "nl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c0925108-d541-4dc4-bbae-39f4e57ba10c",
      "title": "Bright, welcoming Spanish female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e5923af7-a329-4e9b-b95a-5ace4a083535",
      "title": "Charismatic and engaging male fo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2f251ac3-89a9-4a77-a452-704b474ccd01",
      "title": "Reassuring British female for cu (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f4d8ad0e-ad3a-4c37-b99d-ff28e366781b",
      "title": "Provides insightful explanations (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "sv",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b5aa8098-49ef-475d-89b0-c9262ecf33fd",
      "title": "Clear and distinctive male with  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "e00dd3df-19e7-4cd4-827a-7ff6687b6954",
      "title": "Confident male for phone systems (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "61001bc6-9064-40a4-b8b2-29178e0fa558",
      "title": "Seasoned male voice for casual,  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "8e14933d-ecd7-402b-9505-795130d69b35",
      "title": "Seasoned male voice for casual,  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "7b2c0a2e-3dd3-4a44-b16b-26ecd8134279",
      "title": "Seasoned male voice for casual,  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "79b8126f-c5d9-4a73-8585-ba5e1a077ed6",
      "title": "Seasoned male voice for casual,  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3d79b1fd-daaa-439c-bff3-903dc18e7684",
      "title": "Seasoned male voice for casual,  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5c7b66c2-3b58-464d-8a12-093410a269c5",
      "title": "Seasoned male voice for casual,  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "63426c82-a0c9-4f23-a175-50eb64c95ec1",
      "title": "Seasoned male voice for casual,  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "725d43d6-1196-480e-bd87-728ae5eff9e1",
      "title": "Seasoned male voice for casual,  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "e13cae5c-ec59-4f71-b0a6-266df3c9bb8e",
      "title": "Squeaky, young female for media  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "9261664a-c3d0-4200-9038-5466bcf3a09c",
      "title": "Natural and conversational adult (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "tl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c96a7d7d-3457-4979-8665-522f7b3e36fb",
      "title": "Methodical French voice for prec (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "63fdecc2-4e1d-4aa3-a442-27204e3cd3b5",
      "title": "An inviting and expressive voice (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e8e2079b-b690-40e6-8e21-02721d3d56bc",
      "title": "Elegant and precise articulation (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d7e54830-4754-4b17-952c-bcdb7e80a2fb",
      "title": "Friendly, grandmotherly female f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3817fdb0-7ae1-42d2-b46e-734dd9601bf2",
      "title": "Warm, French Canadian female for (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "02fe5732-a072-4767-83e3-a91d41d274ca",
      "title": "Enthusiastic, young adult female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "134838f5-ce7e-4876-ac32-6367b99daf83",
      "title": "Enthusiastic, young adult female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "98c87826-dba2-44f4-b123-4c7e3c8a2647",
      "title": "Enthusiastic, young adult female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5993c2c9-5d59-403e-b459-946c8b302086",
      "title": "Enthusiastic young adult female  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "62305e79-9d39-4643-b003-5e0b096fe4f4",
      "title": "Enthusiastic young adult female  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "27c12970-3efb-4f39-a78a-2fbb7bddc941",
      "title": "Enthusiastic young adult female  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "30236d07-62d0-4c63-abf7-df46aa45e473",
      "title": "Enthusiastic, young adult female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a5def41e-2e73-433f-92f7-5f1d99fef05d",
      "title": "Enthusiastic, young adult female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6d14ac2a-4dda-46f8-bd6f-0722db08ec00",
      "title": "Grounded and soothing voice that (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "tl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "02a924f6-bb49-4177-8fbb-52238c5056d6",
      "title": "Gentle, welcoming delivery for f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5a033900-2ed6-4fd4-a257-707f2688e713",
      "title": "Prompt, polished voice with cris (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b738fa95-b787-4529-9170-34be41e95b95",
      "title": "Tuned for support desks and demo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "63ff761f-c1e8-414b-b969-d1833d1c870c",
      "title": "Lively and experienced male voic (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2f8e82c4-cb94-4e6d-8b6a-29bf58ceb60a",
      "title": "Upbeat and inviting young female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "948196a7-fe02-417b-9b6d-c45ee0803565",
      "title": "Clear, mature male voice with a  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ce74c4da-4aee-435d-bc6d-81d1a9367e12",
      "title": "Friendly adult male for casual c (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d358377a-cd1d-45c5-abd0-701314e36cbe",
      "title": "Bright, energetic Polish male th (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "79693aee-1207-4771-a01e-20c393c89e6f",
      "title": "Friendly and professional male f (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "13ff5deb-2591-42ad-a356-63a04e524411",
      "title": "Calm, measured Spanish male suit (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9301949d-b7cd-40d9-a246-5a4430992d6b",
      "title": "Composed voice with approachable (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "0b6d3ccb-f421-4e49-80f7-4bfa39f6eb8e",
      "title": "Resonant Czech male with a calm  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "cs",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "a2364c9d-1fe3-4553-9eff-100c4fe5ffc8",
      "title": "Wise matured voice with expressi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "26403c37-80c1-4a1a-8692-540551ca2ae5",
      "title": "Matured female voice with calm a (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ae823354-f9be-4aef-8543-f569644136b4",
      "title": "Motherly voice with a calm, nurt (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6d912a43-805f-4673-bbc8-a9e6c45a6ad0",
      "title": "Warm firm adult female for workp (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f9fc912e-52f0-448a-8bfa-47e9ca75f25a",
      "title": "smooth and supportive young adul (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3d9b50f9-10c5-4026-9ae1-c4a698f67fc5",
      "title": "Encouraging matured voice with w (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5619d38c-cf51-4d8e-9575-48f61a280413",
      "title": "Deep, confident male voice with  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9b4d08b6-0494-4301-ab92-9150f4ee2718",
      "title": "Refined, composed German female  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "de38f545-c574-44e8-9b54-a7d6fec1c6b1",
      "title": "Approachable Spanish female idea (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "dcddf1f4-b114-4b5d-9158-895cbba0e406",
      "title": "A mature, composed delivery offe (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "7360f116-6306-4e9a-b487-1235f35a0f21",
      "title": "Bold and enthusiastic male voice (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "49808e4c-998a-40a8-b2ea-8ac8e8ce779e",
      "title": "Deep, comforting voice with calm (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5c42302c-194b-4d0c-ba1a-8cb485c84ab9",
      "title": "Mature adult female for instruct (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "9825cf5f-6aff-412a-80c5-bc58a8d55bc4",
      "title": "Voice with warm, conversational  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b58b6b46-1a27-46ba-8648-bc203a5d394e",
      "title": "Chill voice with a smooth, conve (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2fc4f1ec-bfd0-46f1-8e6d-d4279eaaf838",
      "title": "Warm, genuine Mexican male perfe (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "93c98a2b-7d15-4f7b-8236-294b1e02b1c0",
      "title": "Knowledgeable French male convey (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "996ec149-0dca-4389-ad08-e2d6f906b4bf",
      "title": "Presents data and insights with  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "bfd3644b-d561-4b1c-a01f-d9af98cb67c0",
      "title": "High pitched, silly male for fun (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "408daed0-c597-4c27-aae8-fa0497d644bf",
      "title": "Reassuring male for soothing dia (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "7849a11e-4107-44ae-bc7e-77bea41ec019",
      "title": "Steady adult male for structured (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fi",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "cc7d2711-69af-4072-9674-df588dd85682",
      "title": "Calm adult male for reassuring a (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "6fbca103-0f7f-4e49-97ed-49a53b4f3534",
      "title": "Smooth voice with a calm, laid-b (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "cbaf8084-f009-4838-a096-07ee2e6612b1",
      "title": "Friendly, casual female voice wi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "80f117a5-5196-4b64-8b4c-efda3d3ab176",
      "title": "This voice offers a measured and (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4014f0c9-d3eb-4eca-af2b-fd6004f526be",
      "title": "Steady and even pacing that offe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ta",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a81fccdc-5595-4dfc-ae76-4de6a515b8a2",
      "title": "Friendly, approachable Hindi fem (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "911d97fc-e9f5-4249-bf11-50d4edb7b8d8",
      "title": "Mehak works especially well for  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a53c3509-ec3f-425c-a223-977f5f7424dd",
      "title": "Expressive adult female voice wi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "dcc82bcd-647e-4478-955f-8232d5122f8b",
      "title": "Enthusiastic voice with bright,  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d6b0c62a-c7ff-477c-9a1f-eadd64b94360",
      "title": "Outgoing voice with lively warmt (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f107908f-7d23-45d2-8ae7-8da35a0955ef",
      "title": "Melisa V3 - kleva.co (Neutral, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "neutral"
      ],
      "preview_url": null
    },
    {
      "name": "eb929394-68e7-4e08-bd2f-e7055728a5e1",
      "title": "Bright, professional Danish fema (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "da",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1d3ba41a-96e6-44ad-aabb-9817c56caa68",
      "title": "Firm, young female for customer  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d7bf7d75-64b7-4c1e-86c0-79d647366587",
      "title": "Gentle and reassuring tone desig (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d813d699-27f0-4231-83b4-6bd1bce106ba",
      "title": "A composed, soft, and articulate (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "187d1cc5-a771-4ccd-9110-9df8c4e39499",
      "title": "Friendly young adult female for  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e63d7d05-76b0-4ff5-b8fb-503a82688bfe",
      "title": "Offers warm and efficient assist (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ae1a833b-0d95-4b7f-8d05-d6418c6f8049",
      "title": "Firm and strong adult male voice (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fi",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b66b3a19-31b3-401f-8b08-40d46a61e4f1",
      "title": "Steady Czech voice for capable p (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "cs",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f114a467-c40a-4db8-964d-aaba89cd08fa",
      "title": "Deep, soothing mature male for p (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2835e382-643b-4ac6-8f6c-74df549a7ad0",
      "title": "Crisp, natural Finnish female fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fi",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "29e5f8b4-b953-4160-848f-40fae182235b",
      "title": "Cheery, young female for enterta (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d6905573-8e91-4e32-b103-fd4d1205cd87",
      "title": "Enthusiastic female voice with b (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "0e58d60a-2f1a-4252-81bd-3db6af45fb41",
      "title": "Easygoing adult male voice with  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "vi",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "537a82ae-4926-4bfb-9aec-aff0b80a12a5",
      "title": "Laidback voice with a smooth, ap (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "7706804e-ea85-443a-968a-b9bf363bdde8",
      "title": "Crisp, natural Korean female bui (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "295cc815-c869-4a5a-b2b2-a4f2272ffccb",
      "title": "Delivers intricate information w (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2f4d204f-a5dc-4196-81bc-155986b76ab6",
      "title": "Bright, youthful female voice fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "03b1c65d-4b7f-4c09-91a8-e2f6f78cb2c9",
      "title": "Bright and cheerful American-acc (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1b4ea5fb-b1c0-43ee-a7be-4e315878c2b1",
      "title": "English female adult voice with  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "0ee8beaa-db49-4024-940d-c7ea09b590b3",
      "title": "Polished American female for hig (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4ad22058-7cb6-402c-a115-196cbfc25dce",
      "title": "Crisp, approachable German male  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5a31e4fb-f823-4359-aa91-82c0ae9a991c",
      "title": "Deep male for narrations and aud (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "tr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "efddb3d2-4464-45e0-9f8a-fcd5fd4fc54f",
      "title": "Friendly and clear Singaporean f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7348f896-8516-4382-9c8f-ad2aee1ffedc",
      "title": "Naledi offers an engaging and in (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "aa3ccc4a-cfd8-405c-acf5-1873a527b006",
      "title": "Delivers messages with a polishe (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "273193f7-dbff-438e-b8af-fcc499200b1c",
      "title": "Warm and welcoming delivery for  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "th",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7a62541e-5492-410e-95ff-3abd096fce87",
      "title": "Measured Russian female for high (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ru",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b87d697c-0af2-4617-a72f-a17444b32d1b",
      "title": "Steady warm tone for customer ca (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "779673f3-895f-4935-b6b5-b031dc78b319",
      "title": "Serene female for relaxing audio (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ru",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e2d08065-b658-466b-ad52-cef8ee21d307",
      "title": "English female adult voice with  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "97f4b8fb-f2fe-444b-bb9a-c109783a857a",
      "title": "Confident, firm young adult male (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "8193c793-825c-4bb1-b522-13d458ce8d68",
      "title": "Warm specialist for supportive s (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d26313b0-ddd1-4daf-9cd1-d9b39c026a3a",
      "title": "With steady clarity and warmth,  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "9b953e7b-86a8-42f0-b625-1434fb15392b",
      "title": "Deep male for excellent storytel (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "47f3bbb1-e98f-4e0c-92c5-5f0325e1e206",
      "title": "Clear, composed female voice for (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "731d8feb-5eb8-4e2b-b6b3-723dfccdcd18",
      "title": "Delivers information with a meas (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "afa425cf-5489-4a09-8a3f-d3cb1f82150d",
      "title": "Casual male for phone calls and  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "862e933f-b21c-457b-8df8-8e35c6923ef8",
      "title": "Conveys genuine understanding an (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ur",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f3222e9e-2798-4b2e-9830-e3f0393f8cc2",
      "title": "Nikhil provides precise and effi (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b45eba5b-2215-4da7-9c7c-121c95ed7b81",
      "title": "Nostalgic, middle-aged male voic (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "el",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "8c889eba-5b31-4179-8fb2-37bbee22db64",
      "title": "Warm, genuine Swedish male for p (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "sv",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d051b675-6863-44cc-b7ba-356858ed7df8",
      "title": "Delivers information with a comp (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "th",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "0f14d8cb-f039-41fe-a813-a9b4bee7eed8",
      "title": "Refined, composed Hindi female p (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "80e4e2b3-ec54-4930-97ac-667eba950352",
      "title": "Refined and smooth articulation  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ta",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3408d527-179f-434a-94cb-962d5578642d",
      "title": "With a polished and capable tone (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "96355f3d-0179-4c9a-a8d8-11ef0779a9b8",
      "title": "Soft, clear Dutch female for emp (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "nl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a924b0e6-9253-4711-8fc3-5cb8e0188c94",
      "title": "Slow-paced voice with gentle war (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3e32f3c5-9ac0-4192-9994-87fdb277120f",
      "title": "Clear and authoritative adult ma (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "65209f8e-6140-4a20-b819-3cc2e21da19b",
      "title": "Warm, engaging, and effortlessly (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "78291f16-fc9b-4f72-a21b-1ac7d767d104",
      "title": "Bringing a methodical and reliab (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "bf9d8264-6a49-4baa-8918-842c7b86d0d8",
      "title": "This voice offers a calm and pre (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f4c1a0b2-669d-403f-b440-4b34b34856aa",
      "title": "Balanced, neutral female voice t (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "fc923f89-1de5-4ddf-b93c-6da2ba63428a",
      "title": "Smooth, expressive voice for eng (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "9d8c6b2e-0a23-4a15-ae1b-121d5b5af417",
      "title": "Calm, dependable Spanish female  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "9aea78cb-ba89-4a82-aa15-31b55a89b75d",
      "title": "Octavio stays natural without lo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "05ffab9c-d380-4909-8375-cd12f59238c3",
      "title": "Approachable adult male voice wi (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "uk",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9ed9f7e7-3ef6-4773-9dd3-ffcb479ca1f0",
      "title": "Upbeat and confident adult femal (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ru",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ee7ea9f8-c0c1-498c-9279-764d6b56d189",
      "title": "Polite, young adult male for cus (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f31cc6a7-c1e8-4764-980c-60a361443dd1",
      "title": "Friendly, happy adult female for (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e3087ad8-7018-4154-9a87-11577f916cd4",
      "title": "Lively, energetic adult male for (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "431b7e77-b46d-4eda-8362-db430ac0913c",
      "title": "Calm, measured Hebrew male suite (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4c2dcd38-5608-45ca-8f11-51c88208d01c",
      "title": "Deep, silky male voice that deli (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "22df7143-7987-4e15-a720-d65c69a443b3",
      "title": "Keen, professional delivery with (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d42fc8d7-efdd-44df-bb2e-a6e093601917",
      "title": "Seasoned and composed voice with (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "0ea47942-be0b-4bc7-a1bf-5dba008dc1cc",
      "title": "Owen provides precise and effici (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "bd9120b6-7761-47a6-a446-77ca49132781",
      "title": "Elevated, mature adult male for  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4e1a8eca-d53a-45ea-bb73-5c00be75f03e",
      "title": "Warm, conversational Hindi male  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "846fa30b-6e1a-49b9-b7df-6be47092a09a",
      "title": "Smooth and captivating male with (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "61510db3-e266-4dfb-8dd6-e4f976b1351e",
      "title": "Pablo's inviting and clear voice (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "28ca2041-5dda-42df-8123-f58ea9c3da00",
      "title": "Friendly female with a slight En (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d4db5fb9-f44b-4bd1-85fa-192e0f0d75f9",
      "title": "Clear and professional adult wom (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e361b786-2768-4308-9369-a09793d4dd73",
      "title": "Bold and lively voice for expres (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "30894953-bcce-41fe-892c-15ce19c843ff",
      "title": "Casual, supportive warmth for fr (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "bec003e2-3cb3-429c-8468-206a393c67ad",
      "title": "Friendly female for customer sup (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e5a6cd18-d552-4192-9533-82a08cac8f23",
      "title": "Matured voice with lively warmth (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3e1ed423-17e5-4773-b87c-25b031106e41",
      "title": "Deep and firm male voice with a  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "65b25c5d-ff07-4687-a04c-da2f43ef6fa9",
      "title": "This voice is helpful and cheery (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "250fdc17-cc1b-4ff1-8538-63988791cd3e",
      "title": "A natural transfer desk style ra (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ebecd063-10f4-422e-a8ff-556ce5c4d4e4",
      "title": "Voice with energetic clarity and (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "te",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d6c52d6f-6478-47a2-ad54-dbc8f3335a2b",
      "title": "Soft-spoken, poised Southern fem (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "15d0c2e2-8d29-44c3-be23-d585d5f154a1",
      "title": "Formal and steady Mexican adult  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ca590fdc-df56-4d2e-94a4-ef5b423c7ddf",
      "title": "Steady and articulate adult male (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "sk",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "89266bab-6e15-455d-8654-e18c440b0656",
      "title": "Resonant adult male voice, remin (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "cs",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2a2624ad-bd06-4563-81fd-0519742e25d2",
      "title": "Firm and strict adult female voi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "hr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f4e419a9-fc75-4252-9d4e-93e4247f07c9",
      "title": "Provides a steady and reliable p (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4fbf4e27-4c2f-4587-94b7-f66a574d3565",
      "title": "This voice provides clear and or (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "bfd5390b-e4f9-4e44-95ab-9ebd223acd62",
      "title": "Professional, calm adult male gr (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "56df0456-8f47-4f7a-ac26-40c2f9797104",
      "title": "Deep and resonant adult male voi (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "baf84392-fa95-4d44-8871-d32ee36b0e01",
      "title": "Clear, articulate South African  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3d335974-4c4a-400a-84dc-ebf4b73aada6",
      "title": "Confident male for providing ins (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "81cd8d19-45e7-47b2-ad0e-bcd94f557ad0",
      "title": "Bright, upbeat delivery for help (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "59ba7dee-8f9a-432f-a6c0-ffb33666b654",
      "title": "Soft-spoken adult female voice f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "bn",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6baae46d-1226-45b5-a976-c7f9b797aae2",
      "title": "Firm and articulate middle-aged  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "kn",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "92da9281-7cf3-4c61-be0f-face03a3312f",
      "title": "Clear, approachable Hindi female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "cd6256ef-2b2a-41f6-a8d8-c1307af5061f",
      "title": "Confident voice with expressive  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f6141af3-5f94-418c-80ed-a45d450e7e2e",
      "title": "Authoritative, adult female for  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5568a7df-e5ab-4442-9fae-2e9ba1b15ad8",
      "title": "Polished narrator with a measure (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "045f0292-0731-4a4c-971d-64594fc2c35a",
      "title": "Confident voice with clear artic (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "10bd4af4-825b-49b8-b8bd-0ca11865536e",
      "title": "Refined and smooth articulation  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "07b6f895-78b9-4921-8e10-8a21c99c2e8a",
      "title": "Engaging, charismatic Brazilian  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "cbb6fdf0-30dd-49f6-af7d-bbb1185c1fa5",
      "title": "A composed and reliable presence (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "393dd459-f8d8-4c3e-a86b-ec43a1113d0b",
      "title": "Approachable adult male voice fo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "6b7468f5-d6b0-4d6b-b38a-46f6d6e5bac7",
      "title": "Expressive male voice for inform (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "1ce291a1-0771-4732-a3f7-8cca29bf055f",
      "title": "Matured male voice with powerful (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9b67072c-d46c-465d-87dc-f7a1c6db2bf3",
      "title": "With a measured pace and clear a (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "cf061d8b-a752-4865-81a2-57570a6e0565",
      "title": "Warm, welcoming Telugu female th (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "te",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "98bf39ce-b44a-49d7-9794-fb9a9329fd11",
      "title": "Expressive, lively Arabic female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "565510e8-6b45-45de-8758-13588fbaec73",
      "title": "Approachable male voice with a l (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "57b6bf63-c7a1-4ffc-8e10-23bf45152dd6",
      "title": "Soft-spoken, empathetic female v (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "533b2990-5b82-45a4-b9f2-367776972ca6",
      "title": "Steady, polished delivery for pr (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c7c790c5-2bf4-47e4-bc83-5f43e61f3803",
      "title": "Casual, friendly female voice wi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a3520a8f-226a-428d-9fcd-b0a4711a6829",
      "title": "This voice is even, full, and re (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e5e5c8d7-3924-4ff6-981a-cb667034be29",
      "title": "Regina delivers measured, profes (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "74f42072-6245-4fe2-b5dc-3dc9b56fdbd0",
      "title": "Authoritative voice with polishe (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "205fc552-2cce-4307-baa1-598b9dc3dd01",
      "title": "Combines clarity with a friendly (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "177df681-25b1-48c2-bb47-03ca5fa27f0a",
      "title": "Calm Japanese male suited for pr (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9e7ef2cf-b69c-46ac-9e35-bbfd73ba82af",
      "title": "Bold and lively male with high e (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "de07efe3-b309-418b-bdca-42827223efd2",
      "title": "Emotive, energetic young adult f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d3793b7b-4996-409c-9d59-96dd09f47717",
      "title": "Lively and upbeat matured voice, (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c2ac25f9-ecc4-4f56-9095-651354df60c0",
      "title": "Firm adult female fit for broadc (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b2a31ee9-7373-4122-852d-eec9576e2fa6",
      "title": "A steady and approachable presen (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "or",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "21b81c14-f85b-436d-aff5-43f2e788ecf8",
      "title": "Casual, young female for authent (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7be83d14-4707-43ad-9774-e24eb38320f0",
      "title": "An engaging and attentive voice  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d179b385-3cd4-4972-b155-e7cb2445776f",
      "title": "Clear, composed delivery for dir (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "049de96c-781a-4728-8365-82899c178a43",
      "title": "A composed and reassuring vocal  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "78e608e9-7258-464d-83c0-badcef173bab",
      "title": "Ritesh provides measured, confid (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "faf0731e-dfb9-4cfc-8119-259a79b27e12",
      "title": "Friendly woman for playful conve (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "8985388c-1332-4ce7-8d55-789628aa3df4",
      "title": "Neutral, mature female for narra (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "079e3a17-5545-4bc5-93e3-e11df6fe37b8",
      "title": "Gentle, reassuring Latino male p (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4877b818-c7fe-4c89-b1cf-eadf8e23da72",
      "title": "Clear, measured Hindi male suite (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f688c0a6-dddd-48ba-8246-c099d494a162",
      "title": "Relaxing voice with smooth depth (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "a0ad191b-2f51-4dc9-8cf3-7d1c8f5c5317",
      "title": "Offers a steady and reassuring p (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5ee9feff-1265-424a-9d7f-8e4d431a12c7",
      "title": "Intense, deep young adult male f (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "d3e3d5d5-07b0-484f-9967-dbc8f15b60d5",
      "title": "Ronan offers a trustworthy and c (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "8d7d11ff-d985-48a2-a737-1da0b6fedc8b",
      "title": "Friendly male voice with an easy (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "921f4026-af53-4761-ac56-1c32e44856e8",
      "title": "Consultative and composed delive (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9329fbdb-e285-4fba-95ec-592e15f14476",
      "title": "Motherlike female voice with a c (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "fb936dd1-66ea-43a0-86bd-18a6203dcda2",
      "title": "Happy, approachable middle-aged  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3143159f-07d9-4bd9-a4e4-c5dd3d7339b9",
      "title": "Her calm and empathetic delivery (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f24ae0b7-a3d2-4dd1-89df-959bdc4ab179",
      "title": "Steady voice with balanced tone  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "8c254787-4eb4-4577-bd3d-fb3c273baea2",
      "title": "Provides a reliable and steady v (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "701a96e1-7fdd-4a6c-a81e-a4a450403599",
      "title": "Confident male for narrations (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "328e0683-d1a7-4cde-ad46-0ee69a3cbd6a",
      "title": "Warm French-Canadian female voic (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f2ddbdca-59d9-4363-abeb-a197d65ea24a",
      "title": "Measured, professional delivery  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2ba861ea-7cdc-43d1-8608-4045b5a41de5",
      "title": "Casual adult male voice for ever (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "bn",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ed9ccfa4-8fa1-40f8-bfb2-cb7d67d2f9cd",
      "title": "Adult female for everyday dialog (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "0ad65e7f-006c-47cf-bd31-52279d487913",
      "title": "Warm, mature voice for caring, r (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ab109683-f31f-40d7-b264-9ec3e26fb85e",
      "title": "Friendly, deep mature adult male (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "11af83e2-23eb-452f-956e-7fee218ccb5c",
      "title": "Firm, authoritative female for p (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f7755efb-1848-4321-aa22-5e5be5d32486",
      "title": "Relaxed voice with calm, natural (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "14c639be-eccb-447c-949e-112bd6dd326a",
      "title": "An articulate and engaging voice (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f44c64fe-5030-4325-ac04-1d63b74861a9",
      "title": "This voice offers clear, step-by (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "6d4b1416-8d54-4d94-a788-8a802c086544",
      "title": "Soft yet commanding adult female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "0a9a5903-0a30-4d2e-b6b6-891f73d4b4e0",
      "title": "Relaxed female voice with an eas (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6303e5fb-a0a7-48f9-bb1a-dd42c216dc5d",
      "title": "Energetic adult male for engagin (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "1e9b9b3d-d2ce-4cac-9d05-bc36a63fa28e",
      "title": "Warm, attentive delivery for org (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "579dc63a-1c19-4512-866a-1295dff18f0f",
      "title": "This voice offers precise and re (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6adbb439-0865-468c-9e68-adbb0eb2e71c",
      "title": "Gentle female for calm conversat (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "04bfd756-4fd4-42c2-9ccf-37f647c5bf54",
      "title": "Firm, confident adult female for (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "761afc95-bef5-44dd-aa07-d3c678912e43",
      "title": "Firm, confident adult female for (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5e10a334-7fa5-46d4-a64b-5ae6185da3fd",
      "title": "Firm, confident adult female for (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f4e8781b-a420-4080-81cf-576331238efa",
      "title": "Firm, confident adult female for (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d3e03deb-5439-4203-add1-ca9a7501eaa7",
      "title": "Firm, confident adult female for (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f5a7e270-a91b-463e-8997-8ed08b6a6a77",
      "title": "A warm and natural sound makes t (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "638efaaa-4d0c-442e-b701-3fae16aad012",
      "title": "Friendly male for customer suppo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "382109c0-5c85-4fd1-9d94-b3ec07a4486b",
      "title": "This voice provides clear and pr (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "47651485-d776-4cc9-872f-e2c28120b7fb",
      "title": "Offers an articulate and systema (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ur",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "55e2a153-c61e-4784-85c8-e954cb22fe29",
      "title": "Formal male voice with clear pro (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "0eb213fe-4658-45bc-9442-33a48b24b133",
      "title": "Cheerful female for engaging con (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "nl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "bef24f4f-adc9-4cef-acbf-cc1ceb98224b",
      "title": "Crisp, approachable Mexican male (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "432fc642-6a83-4975-b77a-c605903b5ba6",
      "title": "Crisp, approachable Hindi female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b913ef45-3fbb-4fd0-9564-7746cc7119ea",
      "title": "A voice offering steady, methodi (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ur",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "694f9389-aac1-45b6-b726-9d9369183238",
      "title": "Soothing female for meditations  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "330c4fa0-1da3-4c55-8e97-951bfd724e20",
      "title": "Voice with laidback tone and gen (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "te",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "998c6d1b-0bd0-4d27-bce7-ed030e3c9e6c",
      "title": "Provides a confident and consist (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "or",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3f38cbe2-ce6a-4051-b5dc-2b2ee20b9bc1",
      "title": "Chill female voice with a smooth (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "78ab82d5-25be-4f7d-82b3-7ad64e5b85b2",
      "title": "Adult female for casual, authent (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "0cd0cde2-3b93-42b5-bcb9-f214a591aa29",
      "title": "Clear and bright female with a g (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "2f22b9bc-b0eb-4cb6-b5ae-0c099a0fdfad",
      "title": "Energetic American adult male vo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "1cb5b8bc-77c9-4e7c-a251-da02348e2727",
      "title": "Casual voice with an easy, relax (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b7187e84-fe22-4344-ba4a-bc013fcb533e",
      "title": "Warm male for audiobooks and cle (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "63927f41-9616-4ac2-89cf-f3afa346e0ef",
      "title": "Relaxing and calm voice with gen (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ce9ca2b6-2bed-4452-99bb-052e1ec0b534",
      "title": "Inviting and approachable tone p (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "11c61307-4f9e-4db8-ac3b-bfa5f2a731ce",
      "title": "Deep female for calming conversa (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3ef78ba6-9aaa-46a2-b5b5-f9ded76a2370",
      "title": "Female adult voice with a relaxe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1e4176b1-3db9-44d6-a601-4fe68b041942",
      "title": "Reliable Russian male for clear, (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ru",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b3610b4c-0fd6-4912-89d1-ace6cb6054dd",
      "title": "Clear, approachable Hindi female (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "548172e3-7581-406b-8788-f5346fb992de",
      "title": "This composed South African voic (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "8cbfe3ab-8364-4e72-b606-93f749519c66",
      "title": "Casual male voice with clear, st (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "4418bb06-8329-49a1-bb11-53bb64ca0547",
      "title": "Grounded and soothing voice that (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "te",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "64462aed-aafc-45d4-84cd-ecb4b3763a0a",
      "title": "Upbeat male for commercials, ann (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "39b376fc-488e-4d0c-8b37-e00b72059fdd",
      "title": "Enunciating male for customer su (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "0d2162c2-2fe9-40a7-b3c1-43eab576a64b",
      "title": "Friendly voice with a bright, ap (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "cfce9402-0067-458b-95a7-95846f469406",
      "title": "This voice provides a warm and u (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d0be495c-5e23-4b88-b12d-bc42d38be9a5",
      "title": "Deeply warm and steady tone desi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c7be5dde-c1e6-4ebe-9096-ddc4b4edb1cc",
      "title": "Neutral, conversational Hindi ma (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f9a4b3a6-b44b-469f-90e3-c8e19bd30e99",
      "title": "Neutral, firm female for providi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b629d743-2b5a-4ffd-b5bb-9de9b969a690",
      "title": "Clear and confident voice, ideal (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4e41a434-85fc-4614-b203-af79ba44d473",
      "title": "Soft-spoken American-accented fe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b7d50908-b17c-442d-ad8d-810c63997ed9",
      "title": "Slow, chill young adult female f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7e19344f-9f17-47d7-a13a-4366ad06ebf3",
      "title": "Gentle and steady male voice wit (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3b554273-4299-48b9-9aaf-eefd438e3941",
      "title": "Firm, young accented female for  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "07bc462a-c644-49f1-baf7-82d5599131be",
      "title": "Clear and natural adult female v (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "te",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "d79d2b77-9192-4e10-9407-5d43ca034803",
      "title": "Approachable Irish female for fr (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b441c4fd-4910-4c55-ae56-f0291057e2cc",
      "title": "Cheerful and optimistic adult fe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "id",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4459a9a5-69d6-4680-b970-e13dc51845b6",
      "title": "Breathes life into words with a  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "db6b0ed5-d5d3-463d-ae85-518a07d3c2b4",
      "title": "Approachable American female ide (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "01fd7d67-d2a0-4e4e-8c48-42611c71a926",
      "title": "Easygoing voice with effortless  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "0046dfd7-171b-4442-9eb7-0712fa712a7a",
      "title": "Her precise and articulate tone  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "or",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6b02ffe5-e3cb-48c0-a023-c72f85953375",
      "title": "Gentle and reassuring tone desig (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "90c7d657-9599-4cd0-9ed2-2568359e4d1a",
      "title": "Polished adult female for effici (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "it",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4663e61a-a9c2-40e1-94c5-c461ed9d3d31",
      "title": "This clear and composed voice gu (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c9f95851-235c-458c-acfb-67cdb2558538",
      "title": "This voice embodies a helpful an (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5de076e9-7b28-4442-b279-e7d80d573505",
      "title": "Upbeat and confident adult male  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "th",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "cd6c48a9-774b-4397-98b4-9948c0a790f0",
      "title": "Casual voice with a natural, fri (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "bf0a246a-8642-498a-9950-80c35e9276b5",
      "title": "Mature female for natural conver (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6e6993ab-22b2-4a7e-9867-b40f92e01d8c",
      "title": "Offering a naturally engaging an (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "926e0766-f380-4d77-aeb0-9aa4ebb16b38",
      "title": "Voice with confident, businessli (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "da",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "69c18e1d-fab0-4747-b9da-58617cd8b9e4",
      "title": "Confident, friendly Korean femal (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3bf35adc-bcc4-464b-b834-c90c88cf6492",
      "title": "Casual voice with an engaging, u (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "6d287143-8db3-434a-959c-df147192da27",
      "title": "Mature-sounding female voice wit (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6a73e45f-3fa6-427c-97da-0fc6a7a1bc0d",
      "title": "Steady and even pacing that offe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b134c304-d095-4d2b-a77a-914f5e8e84e7",
      "title": "Deep voice with commanding prese (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "7c8ba972-4960-4c43-bea0-8178e2205696",
      "title": "Deep, firm adult male for narrat (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9fb269e7-70fe-4cbe-aa3f-28bdb67e3e84",
      "title": "Deep, firm adult male for narrat (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c1c65fc2-528a-4dde-a2c4-f822785c2704",
      "title": "Deep, firm adult male for narrat (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f96dc0b1-7900-4894-a339-81fb46d515a7",
      "title": "Deep, firm adult male for narrat (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "adde00e9-c98f-42ae-a94d-fc9f92f11c76",
      "title": "Deep, firm adult male for narrat (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "80713a53-e484-4f69-9852-7891096016ac",
      "title": "Deep, firm adult male for narrat (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b1ce5126-4d08-42c3-adef-d3eb39e90c7a",
      "title": "Deep, firm adult male for narrat (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "6fd4f468-0345-4f41-81d0-3f48ebc295e0",
      "title": "Deep, firm adult male for narrat (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "17488b72-f815-44d8-bdd9-869971c3ec06",
      "title": "Conversational voice with a rela (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "da743a82-ddf2-4d9b-8eb8-ff67ca0b138e",
      "title": "Approachable Dutch male for prof (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "nl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "a0fc16d3-01af-482b-910f-ed063c3d79d3",
      "title": "Refined, composed Korean female  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ccc7bb22-dcd0-42e4-822e-0731b950972f",
      "title": "Expressive adult female voice wi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "th",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "be79f378-47fe-4f9c-b92b-f02cefa62ccf",
      "title": "Deep male for serious conversati (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "156fb8d2-335b-4950-9cb3-a2d33befec77",
      "title": "Upbeat female for engaging conve (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4ff0f045-c140-4aa3-9210-529083f86fca",
      "title": "Offers a composed and considerat (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "th",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f227bc18-3704-47fe-b759-8c78a450fdfa",
      "title": "Clear and well-enunciated adult  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "mr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "8634bd27-0acf-4056-b014-4fea0385ed9e",
      "title": "Matured voice with a natural, co (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "126a0835-beea-4e77-a883-f66eabcf6dd4",
      "title": "Swati offers a clear, approachab (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "573e3144-a684-4e72-ac2b-9b2063a50b53",
      "title": "Firm female for instructions and (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a466f9e2-28eb-4bb7-925c-8e8984950700",
      "title": "Steady, Danish male voice for re (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "da",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b56c6aac-f35f-46f7-9361-e8f078cec72e",
      "title": "Smooth voice with easy warmth an (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e1717dc3-b87b-4720-aa7f-b6db290e0609",
      "title": "Warm, genuine Korean for podcast (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b8e1169c-f16a-4064-a6e0-95054169e553",
      "title": "Serious adult male voice with a  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "06950fa3-534d-46b3-93bb-f852770ea0b5",
      "title": "Smooth, expressive male with a w (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "bd05edd9-cec9-4600-9af4-c9ba4e032ff9",
      "title": "Friendly and clear voice that ma (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "94c2e193-a498-44e4-b958-174478734c3f",
      "title": "Clean and authoritative articula (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "0bfbea6c-2f8f-4f86-b411-aa2316561e36",
      "title": "Professional and clear adult fem (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ka",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "24894159-1d4e-4b7c-80ca-4ae37dce9400",
      "title": "Delivers content with a pleasant (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "373e661a-f0ef-4e34-a09e-183184a443e6",
      "title": "Laidback voice with smooth tone  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "710feaa3-b550-42f3-b3eb-6f37f2a7cc0a",
      "title": "English male adult voice with an (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c59c247b-6aa9-4ab6-91f9-9eabea7dc69e",
      "title": "Friendly young adult male for pr (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3308b492-50cc-417e-89dd-1f446c574546",
      "title": "Confident voice with clear, comp (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "db873303-3a70-4d9d-867a-0d70a6377195",
      "title": "Calm, measured Arabic male suite (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "064b17af-d36b-4bfb-b003-be07dba1b649",
      "title": "Friendly female for audiobooks a (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ru",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c1cfee3d-532d-47f8-8dd2-8e5b2b66bf1d",
      "title": "Versatile articulate male for st (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "tr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "32a91a5d-05d2-4c1e-bd5a-ff5fd0c413f2",
      "title": "Calm, precise sound for careful  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "f8685385-96f6-4c12-8520-49e4914bcbfe",
      "title": "Professional adult female for hi (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "cs",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "6ccbfb76-1fc6-48f7-b71d-91ac6298247b",
      "title": "Friendly female voice with a war (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "db938869-18b5-4c21-be8b-2ffdfba6d8d4",
      "title": "Methodical adult male for struct (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "th",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "692846ad-1a6b-49b8-bfc5-86421fd41a19",
      "title": "Professional South African femal (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "79f8b5fb-2cc8-479a-80df-29f7a7cf1a3e",
      "title": "Steady, enunciating, confident y (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "21c2f7ab-dacb-4847-a593-3cd20668c4b3",
      "title": "With a composed and clear presen (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "95e9fdaf-cf0b-4739-b1de-3350ca50774a",
      "title": "Clear, methodical Dutch male for (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "nl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "fb26447f-308b-471e-8b00-8e9f04284eb5",
      "title": "Cheery, expressive gender neutra (Neutral, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "neutral"
      ],
      "preview_url": null
    },
    {
      "name": "384b625b-da5d-49e8-a76d-a2855d4f31eb",
      "title": "Earnest male for conversations a (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "03224226-ab6a-4231-92f9-953e4f758f9e",
      "title": "This voice delivers dependable a (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "6a360542-a117-4ed5-9e09-e8bf9b05eabb",
      "title": "Calm, clear male for narrations (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pt",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "86600680-b836-41e1-9916-8475728dcc14",
      "title": "Engaging voice with lively clari (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "146485fd-8736-41c7-88a8-7cdd0da34d84",
      "title": "Nasal-y male for casual conversa (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "91b4cf29-5166-44eb-8054-30d40ecc8081",
      "title": "Natural, firm adult female for a (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3d5ce2fb-e56c-42f0-9ed9-4662484063b4",
      "title": "Warm, conversational British mal (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "efd255c7-f030-43d3-b5d8-c7b72063be70",
      "title": "English male adult voice with a  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "49e02441-83ea-4c77-bda8-79fdd7f07e92",
      "title": "Young professional male for prov (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "82a7fc13-2927-4e42-9b8a-bb1f9e506521",
      "title": "Energetic male for casual conver (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "40104aff-a015-4da1-9912-af950fbec99e",
      "title": "Firm, young male for instruction (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c45bc5ec-dc68-4feb-8829-6e6b2748095d",
      "title": "Deep, elderly male for narration (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "56c7989e-7a5f-4d12-838f-e0f910e7356e",
      "title": "Tristan's steady South African t (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "726d5ae5-055f-4c3d-8355-d9677de68937",
      "title": "Strong, dependable male voice de (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "820a3788-2b37-4d21-847a-b65d8a68c99a",
      "title": "Direct and confidence inspiring  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c50d415d-a023-4cf2-817f-6b05c1be9d35",
      "title": "Ursula is tuned for support desk (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ad8eee76-d702-4a1f-a1bd-7596755ae4c9",
      "title": "Expressive and upbeat young adul (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "af346552-54bf-4c2b-a4d4-9d2820f51b6c",
      "title": "Authoritative mature female for  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "0d09e991-5763-406e-b637-02bc431ef72d",
      "title": "Energetic French female for enga (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "dd951538-c475-4bde-a3f7-9fd7b3e4d8f5",
      "title": "Firm adult female great for prov (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "a0149de0-42cd-45b6-be89-5fb7baf6c6e7",
      "title": "Veronica offers a clear warm gui (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "643f5eee-459d-4b41-b4fc-0b8407139be6",
      "title": "Clear and crisp voice with preci (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7fe6faca-172f-4fd9-a193-25642b8fdb07",
      "title": "Versatile, engaging adult male f (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "dc30854e-e398-4579-9dc8-16f6cb2c19b9",
      "title": "Crisp, professional British fema (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ebe0038b-1790-40bd-98cd-924313e58d3b",
      "title": "A warm and understanding presenc (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "sv",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "3a8e6fea-81e5-4d4d-8755-86093146cdb8",
      "title": "Gentle and reassuring tone desig (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "te",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "993981f6-28bd-4325-bde7-428afd33ad7f",
      "title": "Vihaan brings a warm, reassuring (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "374b80da-e622-4dfc-90f6-1eeb13d331c9",
      "title": "Friendly and easygoing male voic (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ml",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "adf97b9d-905c-41de-9fe9-afb387116d06",
      "title": "Polite, friendly male voice for  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "38bded0a-3ab4-42d1-8e47-2e0b6b10ced9",
      "title": "Expressive adult male voice with (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "te",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b9de4a89-2257-424b-94c2-db18ba68c81a",
      "title": "Clear and smooth female for phon (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "80e11491-2d8a-4361-ac61-c4f3e0a4f7e7",
      "title": "Energetic, engaging adult male g (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "098fb15d-2597-4186-8b74-25340050b6e7",
      "title": "Grounded, knowledgeable delivery (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "20e68f5c-08e5-42d0-8e9b-6e716fd1ae66",
      "title": "Low-pitched, grounded male voice (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "Hindi",
      "locale": "hi",
      "tags": [
        "Cartesia",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "ca31ce53-ebf6-4e51-b87d-2f65d5d1f7f8",
      "title": "Voice with rich emotion and expr (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "40e0f496-a220-46bb-975a-7ef465b3d92b",
      "title": "Composed, Swiss-German female fo (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "de",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3d83e30f-c31b-4f26-b442-7075feafa53a",
      "title": "Country-sounding male voice with (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "fbf7d2ec-ebea-49f2-8889-a482b9b0a7ed",
      "title": "Country-sounding male voice with (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f1cdfb4a-bf7d-4e83-916e-8f0802278315",
      "title": "Warm, confident voice for clear, (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "79bfcec0-720c-41f2-a33a-f12383e9627f",
      "title": "Clear and firm adult male voice  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "aec42b73-8c46-4528-a377-537b5ecb8e7b",
      "title": "Experienced, reassuring delivery (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "2a4d065a-ac91-4203-a015-eb3fc3ee3365",
      "title": "Kind male for engaging with cust (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "6fccb471-26f7-4f7a-93dd-542935db6c20",
      "title": "Casual voice with a relaxed, fri (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "f3c7d5d2-c1e1-41a0-bd88-8b5512be5335",
      "title": "Calm, even voice with a composed (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5f621418-ab01-4bf4-9a9d-73d66032234e",
      "title": "Friendly female for approachable (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "4ef93bb3-682a-46e6-b881-8e157b6b4388",
      "title": "Deep male for narrations and doc (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "pl",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "5fc5c797-12c5-4f2b-ac9b-d4e53c08098f",
      "title": "Friendly, clear American male wi (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "b8cd71e3-bc14-4538-a530-d6314731c036",
      "title": "Soft-spoken adult female voice f (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "vi",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "3597a26f-80ef-4bd5-8101-9699bc764917",
      "title": "Steady, clear Latina female idea (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "5ba248b0-29d8-4c62-a8af-366eaa17a310",
      "title": "Easy to place in commerce, care, (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1daba551-67af-465e-a189-f91495aa2347",
      "title": "Voice with relaxed tone and frie (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ff857c8e-e7f9-4afd-af42-dce9f3c5ab02",
      "title": "Composed Hebrew female for relia (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "c5bc902c-bc31-40a8-b81f-7d3a1e1920bd",
      "title": "Hebrew female for efficient cust (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "daf747c6-6bc2-4083-bd59-aa94dce23f5d",
      "title": "Firm adult female for conversati (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "1a602be4-3b57-4bef-a270-dfa5efed0541",
      "title": "With a balanced and articulate c (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "95d91579-a3f1-4bb3-b5e1-9a97ef401628",
      "title": "Steady and even pacing that offe (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "he",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "fbc431c6-7d79-4ef5-b1bb-aab9f579c690",
      "title": "A consistently clear and reassur (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "9cbad5f7-fbf6-4416-a22f-1ecc75ad40a2",
      "title": "Articulate  delivery designed fo (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "0f5ac064-30c7-4cf6-8748-d275f682a0d5",
      "title": "This voice offers a calm and pre (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "dd610410-2b01-426e-b673-2c69bcf5f93b",
      "title": "Guides listeners through process (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e90c6678-f0d3-4767-9883-5d0ecf5894a8",
      "title": "Kind adult female for empathetic (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "zh",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "dd10411e-a9f9-49fd-83bf-199c624352c4",
      "title": "Delivers presentations with meti (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "59d4fd2f-f5eb-4410-8105-58db7661144f",
      "title": "Calm, more serious female for ne (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "2b568345-1d48-4047-b25f-7baccf842eb0",
      "title": "Friendly, professional and upbea (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "cac92886-4b7c-4bc1-a524-e0f79c0381be",
      "title": "Cheerful voice with a bright yet (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ko",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e7296ced-7f95-49fa-9ece-5852c15f58ff",
      "title": "Delivers complex information wit (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "7ca2afba-a719-4f06-9af2-ea2b8e3cf14c",
      "title": "A reliable and organized voice,  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "cb21b4af-0e46-44f7-9128-51be7f898311",
      "title": "Offers meticulous explanations w (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ja",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ed81fd13-2016-4a49-8fe3-c0d2761695fc",
      "title": "Firm, energetic male for lively  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "40f9b5d1-bc79-43a6-b5cc-1c692b3b40d2",
      "title": "Engaging Arabic male that captur (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "ar",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "aa2cafe9-97ba-4052-ac3c-875000f95212",
      "title": "Zander delivers a measured and c (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "afb19d1b-4044-4f34-a962-f4aef640a002",
      "title": "Enthusiastic voice with energeti (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "263b9cc0-0d99-44e7-ae92-3d4ad5d2ad18",
      "title": "Lively, positive delivery that b (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "01fc5e31-71e9-40dc-a220-06dbd4b4ed7e",
      "title": "A clear and empathetic voice, pe (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "ur",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "e00d0e4c-a5c8-443f-a8a3-473eb9a62355",
      "title": "High pitched, friendly, young ad (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "48369ca9-0645-40de-9821-0d55e18a03c2",
      "title": "Upbeat female voice with lively  (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "en",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "dcf62f33-7cff-4f20-85b2-2efaa68cbc32",
      "title": "Expressive female for clear comm (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "pl",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "b56a7171-86f0-42b6-b3fa-a316794aa4e0",
      "title": "She expertly conveys instruction (Female, Cartesia)",
      "provider": "cartesia",
      "gender": "female",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "ca526927-b7c8-4a64-95d7-235d30b7771f",
      "title": "Natural delivery without droppin (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "es",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "c6ccfe32-6bee-484a-a8a2-7a51bee93f99",
      "title": "This voice offers a precise and  (Male, Cartesia)",
      "provider": "cartesia",
      "gender": "male",
      "language": "English",
      "locale": "fr",
      "tags": [
        "Cartesia",
        "English",
        "male"
      ],
      "preview_url": null
    }
  ],
  "openai": [
    {
      "name": "alloy",
      "title": "Alloy (Neutral, OpenAI)",
      "provider": "openai",
      "gender": "neutral",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "OpenAI",
        "English",
        "neutral"
      ],
      "preview_url": null
    },
    {
      "name": "echo",
      "title": "Echo (Male, OpenAI)",
      "provider": "openai",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "OpenAI",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "fable",
      "title": "Fable (Neutral - British, OpenAI)",
      "provider": "openai",
      "gender": "neutral",
      "language": "English (UK)",
      "locale": "en-GB",
      "tags": [
        "OpenAI",
        "English",
        "neutral"
      ],
      "preview_url": null
    },
    {
      "name": "onyx",
      "title": "Onyx (Deep Male, OpenAI)",
      "provider": "openai",
      "gender": "male",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "OpenAI",
        "English",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "nova",
      "title": "Nova (Warm Female, OpenAI)",
      "provider": "openai",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "OpenAI",
        "English",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "shimmer",
      "title": "Shimmer (Expressive Female, OpenAI)",
      "provider": "openai",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "OpenAI",
        "English",
        "female"
      ],
      "preview_url": null
    }
  ],
  "gap": [
    {
      "name": "gap-aria",
      "title": "GAP Aria (Hindi - Ultra Fast)",
      "provider": "gap",
      "gender": "female",
      "language": "Hindi (India)",
      "locale": "hi-IN",
      "tags": [
        "GAP",
        "Hindi",
        "female"
      ],
      "preview_url": null
    },
    {
      "name": "gap-kabir",
      "title": "GAP Kabir (Hindi - Telephony)",
      "provider": "gap",
      "gender": "male",
      "language": "Hindi (India)",
      "locale": "hi-IN",
      "tags": [
        "GAP",
        "Hindi",
        "male"
      ],
      "preview_url": null
    },
    {
      "name": "gap-maya",
      "title": "GAP Maya (English - Conversational)",
      "provider": "gap",
      "gender": "female",
      "language": "English (US)",
      "locale": "en-US",
      "tags": [
        "GAP",
        "English",
        "female"
      ],
      "preview_url": null
    }
  ]
},
    languages: [
      { id: "hi-IN", label: "Hindi (India)" },
      { id: "en-IN", label: "English (India)" },
      { id: "en-US", label: "English (US)" },
      { id: "en-GB", label: "English (UK)" },
      { id: "ta-IN", label: "Tamil (India)" },
      { id: "te-IN", label: "Telugu (India)" },
      { id: "mr-IN", label: "Marathi (India)" },
      { id: "bn-IN", label: "Bengali (India)" },
      { id: "gu-IN", label: "Gujarati (India)" },
      { id: "kn-IN", label: "Kannada (India)" },
      { id: "ml-IN", label: "Malayalam (India)" },
      { id: "pa-IN", label: "Punjabi (India)" },
      { id: "ur-IN", label: "Urdu (India)" },
      { id: "es-ES", label: "Spanish (Spain)" },
      { id: "fr-FR", label: "French (France)" },
      { id: "de-DE", label: "German (Germany)" },
      { id: "ar-SA", label: "Arabic (Saudi Arabia)" }
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
