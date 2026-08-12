"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/primary-button";
import { GetDemoButton } from "@/components/demo/GetDemoButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Check,
  Database,
  Globe2,
  Headphones,
  LineChart,
  LogOut,
  Menu,
  Mic,
  MicOff,
  Phone,
  PhoneCall,
  Play,
  Pause,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Split,
  Terminal,
  Volume2,
  Wand2,
  X,
  Zap,
} from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const navItems = [
  { label: "Product", href: "/product" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Workflow", href: "/#workflow" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
];

const languageDemos = [
  {
    id: "hinglish",
    label: "Hinglish (Natural Mix)",
    agentPrompt:
      "Hi Rahul! I saw your demo request for VoicePilot on our website. Is now a good time to chat about setting up your AI sales agent?",
    userReply:
      "Haan, definitely! Mujhe jaanna tha ki customer call transfer kaise set up hoga?",
    agentAnswer:
      "Bilkul! Live call transfer ke liye aap dashboard me manager number configure kar sakte hain. Jab intent detect hoga, call instantly transfer ho jaayegi.",
    accent: "North Indian Conversational",
    latency: "220ms",
    accuracy: "99.4%",
    badgeColor: "bg-block-lime text-black",
  },
  {
    id: "hindi",
    label: "Hindi (pure & regional)",
    agentPrompt:
      "नमस्ते रोहन जी, VoicePilot सपोर्ट से बात कर रही हूँ। क्या आपके नए कैंपेन की टेस्टिंग सही से चल रही है?",
    userReply:
      "जी, लीड्स को कॉल तो जा रही है पर CRM में डाटा ऑटो-सिंक कैसे होगा?",
    agentAnswer:
      "बहुत आसान है! आप Webhook सेटिंग्स में अपना HubSpot या Salesforce API Key डालकर एक क्लिक में सारा कॉल ट्रांसक्रिप्ट और समरी सिंक कर सकते हैं।",
    accent: "Hindi Standard & Regional",
    latency: "235ms",
    accuracy: "98.9%",
    badgeColor: "bg-block-lilac text-black",
  },
  {
    id: "english",
    label: "Indian English",
    agentPrompt:
      "Hello Priya, welcome to GAP VoicePilot. I am your automated outbound sales assistant. How can I help structure your lead qualification workflow?",
    userReply:
      "Can you send a WhatsApp summary right after the phone call ends?",
    agentAnswer:
      "Yes! Every call trigger includes automated post-call webhooks that instantaneously dispatch SMS or WhatsApp updates to your prospect.",
    accent: "Indian Business English",
    latency: "210ms",
    accuracy: "99.7%",
    badgeColor: "bg-block-mint text-black",
  },
];

const codeSnippets = {
  curl: `curl -X POST https://api.voicepilot.gap.ai/v1/assistants \\
  -H "Authorization: Bearer vp_sk_8492048f72a" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Delhi Sales Qualifier",
    "language": "hi-IN-hinglish",
    "voice_id": "hi_female_conversational_v2",
    "system_prompt": "You are a friendly sales rep calling leads in New Delhi. Qualify budget and timeline.",
    "telephony": {
      "phone_number_id": "pn_948271049",
      "record_call": true,
      "max_duration_seconds": 600
    }
  }'`,
  node: `import { VoicePilotClient } from "@gap-ai/voicepilot";

const client = new VoicePilotClient({ apiKey: process.env.VOICEPILOT_API_KEY });

const assistant = await client.assistants.create({
  name: "Delhi Sales Qualifier",
  language: "hi-IN-hinglish",
  voiceId: "hi_female_conversational_v2",
  systemPrompt: "You are a friendly sales rep calling leads in New Delhi. Qualify budget and timeline.",
  telephony: {
    phoneNumberId: "pn_948271049",
    recordCall: true,
    maxDurationSeconds: 600
  }
});

console.log("Assistant deployed:", assistant.id);`,
  python: `from voicepilot import VoicePilot

client = VoicePilot(api_key="vp_sk_8492048f72a")

assistant = client.assistants.create(
    name="Delhi Sales Qualifier",
    language="hi-IN-hinglish",
    voice_id="hi_female_conversational_v2",
    system_prompt="You are a friendly sales rep calling leads in New Delhi. Qualify budget and timeline.",
    telephony={
        "phone_number_id": "pn_948271049",
        "record_call": True,
        "max_duration_seconds": 600
    }
)

print(f"Assistant created: {assistant.id}")`,
};

const featureGrid = [
  {
    icon: Zap,
    title: "Sub-250ms Audio Streaming",
    description:
      "Speech recognition, reasoning, and voice generation run on a unified low-latency socket loop so call turns feel completely natural.",
    blockBg: "bg-block-lime",
  },
  {
    icon: Globe2,
    title: "Native Hindi & Hinglish Models",
    description:
      "Trained specifically on Indian speech acoustics, code-switching, regional dialects, and local address forms without awkward translations.",
    blockBg: "bg-block-lilac",
  },
  {
    icon: Phone,
    title: "Dedicated Telephony & SIP",
    description:
      "Bind real 10-digit Indian business numbers, manage SIP trunks, and run automated inbound/outbound campaigns directly.",
    blockBg: "bg-block-mint",
  },
  {
    icon: Split,
    title: "Instant Live Call Transfer",
    description:
      "Detect high-intent buyers or upset callers in real time and seamlessly transfer the phone line to a human agent with full context.",
    blockBg: "bg-block-coral",
  },
  {
    icon: Database,
    title: "Automated CRM & Webhook Sync",
    description:
      "Transcripts, summaries, lead scores, and call recordings are pushed to HubSpot, Salesforce, or your custom endpoints instantly.",
    blockBg: "bg-block-navy text-white",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security & SLA",
    description:
      "End-to-end encryption, ISO & SOC2 readiness, compliance with Indian telecom regulations, and zero-data-retention options.",
    blockBg: "bg-surface-soft",
  },
];

const faqs = [
  {
    question: "What is the end-to-end latency for a VoicePilot phone call?",
    answer:
      "VoicePilot averages 210ms - 250ms total loop latency (Speech-To-Text -> LLM Inference -> Text-To-Speech). This allows the AI agent to listen, think, and respond without the unnatural 2-3 second pauses common in generic voice wrappers.",
  },
  {
    question: "How does VoicePilot handle language switching mid-call?",
    answer:
      "Our proprietary acoustic models detect Hinglish code-switching automatically. If a customer starts speaking English and switches to Hindi mid-sentence ('Sir can you tell me ki plan price kitna hai?'), the agent responds in natural Hinglish smoothly.",
  },
  {
    question: "Can I connect my existing Indian business phone numbers?",
    answer:
      "Yes. VoicePilot integrates via SIP trunking, Indian telecom providers, and virtual numbers. You can assign dedicated numbers directly inside the dashboard for inbound customer service or outbound sales campaigns.",
  },
  {
    question: "What happens if a customer asks to speak to a human manager?",
    answer:
      "VoicePilot supports real-time warm and cold call transfers. When the agent detects intent like 'transfer to human' or high frustration, it initiates a SIP transfer to your support desk and passes the live call context to your agent.",
  },
  {
    question: "Can I test the product before subscribing?",
    answer:
      "Yes! You can explore the full interactive call simulator right on this page, or sign up for free to access the dashboard and test calling workflows with free trial minutes.",
  },
];

export default function ProductPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeLangTab, setActiveLangTab] = useState<
    "hinglish" | "hindi" | "english"
  >("hinglish");
  const [activeCodeTab, setActiveCodeTab] = useState<
    "curl" | "node" | "python"
  >("curl");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isPlayingSim, setIsPlayingSim] = useState(false);
  const [simTurn, setSimTurn] = useState<
    "idle" | "listening" | "thinking" | "speaking"
  >("idle");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (timeZone: string) => {
    if (!currentTime) return "00:00:00";
    return currentTime.toLocaleTimeString("en-US", {
      timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  useEffect(() => {
    const footerEl = footerRef.current;
    if (!footerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { rootMargin: "0px", threshold: 0.05 }
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    let isMounted = true;
    const checkUser = async () => {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (isMounted && session?.user) {
          setUser(session.user);
        }
        const {
          data: { user: serverUser },
        } = await supabase.auth.getUser();
        if (isMounted) {
          setUser(serverUser ?? session?.user ?? null);
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    };

    void checkUser();
    return () => {
      isMounted = false;
    };
  }, []);

  // Audio simulator interval toggle
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingSim) {
      setSimTurn("listening");
      timer = setTimeout(() => {
        setSimTurn("thinking");
        timer = setTimeout(() => {
          setSimTurn("speaking");
          timer = setTimeout(() => {
            setSimTurn("idle");
            setIsPlayingSim(false);
          }, 3500);
        }, 800);
      }, 1800);
    } else {
      setSimTurn("idle");
    }
    return () => clearTimeout(timer);
  }, [isPlayingSim]);

  useGSAP(
    () => {
      const root = pageRef.current;
      if (!root) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const heroItems = gsap.utils.toArray<HTMLElement>(".hero-reveal", root);
      const revealItems = gsap.utils.toArray<HTMLElement>(
        ".section-reveal",
        root,
      );

      if (reduceMotion) {
        gsap.set([...heroItems, ...revealItems], {
          autoAlpha: 1,
          y: 0,
          clearProps: "transform",
        });
        return;
      }

      gsap.set(heroItems, { autoAlpha: 0, y: 28 });
      gsap.set(revealItems, { autoAlpha: 0, y: 34 });

      gsap
        .timeline({ defaults: { duration: 0.8, ease: "power3.out" } })
        .to(heroItems, { autoAlpha: 1, y: 0, stagger: 0.09 });

      ScrollTrigger.batch(revealItems, {
        start: "top 82%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true,
          });
        },
      });
    },
    { scope: pageRef },
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentLang =
    languageDemos.find((l) => l.id === activeLangTab) || languageDemos[0];
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "User");

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[#f7f6f0] text-black font-sans selection:bg-block-lime selection:text-black"
    >
      {/*
        THESIS: GAP VoicePilot Product page exposes the low-latency streaming voice engine, regional language mastery (Hindi, English, Hinglish), and telephony routing as an interactive operating room console, refusing generic SaaS marketing fluff.
        OWN-WORLD: High-contrast monochrome canvas, bold dark typography, pill controls, pastel poster block accents (bg-block-lime, bg-block-lilac, bg-block-mint, bg-block-navy, bg-block-coral), GSAP scroll triggers, interactive voice waveform simulator, and live API console.
        STORY: A technical operator or business founder explores the voice streaming pipeline, tests regional voice dialogues, inspects telephony & CRM integrations, reviews developer APIs, and launches an assistant.
        FIRST VIEWPORT: Floating pill navigation header, high-impact headline, live interactive call waveform console with real-time stream simulation and turn-taking indicators.
        FORM: Surface build candidate 3 inside established GAP VoicePilot visual world; seed key bed6f8f5.
        FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
      */}

      {/* Header */}
      <header
        className={`sticky top-2 z-50 mx-auto w-full md:w-[82%] lg:w-[76%] max-w-[1080px] px-3 sm:px-4 transition-all duration-300 ${
          isFooterVisible
            ? "opacity-0 -translate-y-8 pointer-events-none"
            : "opacity-100 translate-y-0 pointer-events-auto"
        }`}
      >
        <div className="flex h-16 items-center justify-between rounded-full border border-white/70 bg-white/75 p-2 pl-4 pr-2 shadow-[0_10px_35px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl ring-1 ring-black/5 transition-all duration-300">
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            title="GAP VoicePilot Home"
          >
            <Image
              src="/logo.png"
              alt="GAP VoicePilot Logo"
              width={40}
              height={40}
              className="h-9.5 w-9.5 object-contain"
              priority
            />
            <span className="text-xl font-extrabold tracking-tight text-black flex items-center gap-1">
              <span>GAP</span>
              <span className="font-array font-bold text-[#ff4b2f]">VoicePilot</span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => {
              const isActive = item.href === "/product";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-black text-white shadow-sm"
                      : "text-black/70 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 sm:flex shrink-0">
            {isAuthLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-black/5 animate-pulse" />
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition-all duration-200 hover:border-black/25 hover:shadow-md hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                    aria-label="Open account menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-xs font-semibold uppercase tracking-wider text-white shadow-inner">
                        {displayName.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="w-64 rounded-[20px] border border-black/10 bg-white/95 p-2 shadow-2xl backdrop-blur-xl"
                >
                  <DropdownMenuLabel className="px-3.5 py-2.5">
                    <span className="block truncate text-sm font-semibold text-black">
                      {displayName}
                    </span>
                    {user.email ? (
                      <span className="mt-0.5 block truncate text-xs font-medium text-black/45">
                        {user.email}
                      </span>
                    ) : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-black/5" />
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl px-3.5 py-2.5 font-medium transition-colors cursor-pointer"
                  >
                    <Link href="/dashboard">Open Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-xl px-3.5 py-2.5 font-medium text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                    onSelect={async () => {
                      const { signOut } = await import("@/app/actions/auth");
                      await signOut();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#ff4b2f]/40 bg-[#fff5f3] px-4 py-2 text-xs font-bold text-[#d93620] shadow-xs transition-all hover:bg-[#ffece8] hover:border-[#ff4b2f] hover:scale-105 active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#ff4b2f]" />
                  <span>Get a Demo</span>
                </Link>
                <Link
                  href="/login"
                  className="rounded-full px-3.5 py-2 text-xs font-semibold text-black/70 transition-colors hover:bg-black/5 hover:text-black"
                >
                  Sign In
                </Link>
                <PrimaryButton href="/dashboard" className="h-10 min-w-[145px]">
                  Get Started
                </PrimaryButton>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black transition-transform active:scale-95 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>

        <div
          className={`mt-2 md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}
        >
          <nav
            className="flex flex-col gap-1 rounded-3xl border border-black/10 bg-white/95 p-4 shadow-2xl backdrop-blur-xl"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-black hover:bg-surface-soft"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid gap-2 border-t border-black/5 pt-3">
              {user ? (
                <>
                  <div className="rounded-xl bg-surface-soft px-4 py-2.5">
                    <p className="truncate text-sm font-semibold text-black">
                      {displayName}
                    </p>
                    {user.email ? (
                      <p className="mt-0.5 truncate text-xs font-medium text-black/45">
                        {user.email}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="btn-pill-primary rounded-full py-2.5 text-center text-xs"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="btn-pill-secondary rounded-full py-2.5 text-center text-xs"
                  >
                    Sign In
                  </Link>
                  <PrimaryButton
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="h-10 w-full justify-between"
                  >
                    Get Started
                  </PrimaryButton>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Product Hero */}
        <section className="relative overflow-hidden bg-[#f7f6f0] pt-16 pb-20 sm:pt-20 lg:pt-24 lg:pb-28">
          <div className="hero-reveal mx-auto max-w-[1340px] px-6 lg:px-8">
            <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-block-lime px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-black shadow-sm">
                <Radio className="h-3.5 w-3.5 animate-pulse text-black" />
                <span>Realtime Speech Architecture</span>
              </div>

              <h1 className="mt-7 max-w-5xl text-balance font-array text-[clamp(2.2rem,5vw,4.5rem)] font-normal leading-[1.02] tracking-[-0.02em] text-black">
                The sub-240ms voice engine built for live Indian calls
              </h1>

              <p className="mt-7 max-w-2xl text-lg font-light leading-8 tracking-[-0.01em] text-black/80 md:text-xl">
                Stitch speech-to-text, reasoning, and regional voice synthesis
                into one live stream. Built for sales qualification, customer
                support, and automated dialing across Hindi, English, and
                Hinglish.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <PrimaryButton
                  href="/dashboard"
                  className="h-12 px-8 text-base"
                >
                  {user ? "Open Dashboard" : "Start for free"}
                </PrimaryButton>
                <a
                  href="#interactive-demo"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-7 text-base font-semibold text-black transition-all hover:bg-surface-soft hover:border-black/30"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Try Live Simulator
                </a>
              </div>
            </div>

            {/* Live Call Simulator Console */}
            <div
              id="interactive-demo"
              className="mt-16 rounded-[28px] border border-black/10 bg-black p-6 text-white shadow-2xl lg:p-8"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-block-lime text-black font-bold">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-white">
                      Live Call Pipeline Console
                    </h2>
                    <p className="text-xs text-white/55 font-mono">
                      ROOM_ID: call_inbound_delhi_8841 • REGION: ap-south-1
                      (Mumbai)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-mono">
                    <span
                      className={`h-2 w-2 rounded-full ${isPlayingSim ? "bg-emerald-400 animate-ping" : "bg-white/40"}`}
                    />
                    <span>STATUS: {simTurn.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-mono text-block-lime">
                    <Zap className="h-3.5 w-3.5" />
                    <span>LATENCY: 224ms</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPlayingSim((prev) => !prev)}
                    className="flex items-center gap-2 rounded-full bg-block-lime px-5 py-2 text-xs font-bold uppercase tracking-wider text-black transition-transform active:scale-95"
                  >
                    {isPlayingSim ? (
                      <>
                        <Pause className="h-4 w-4 fill-current" /> Pause Demo
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" /> Simulate Call
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Console Body */}
              <div className="mt-8 grid gap-8 lg:grid-cols-12">
                {/* Audio Waves & Turn-taking indicator */}
                <div className="flex flex-col justify-between rounded-[20px] bg-white/5 p-6 lg:col-span-5">
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-widest text-white/40">
                      Waveform & Signal
                    </p>
                    <div className="mt-6 flex h-24 items-center justify-center gap-1.5 rounded-xl bg-black/60 px-4">
                      {[
                        40, 65, 30, 90, 45, 100, 75, 50, 85, 35, 95, 60, 80, 45,
                        90, 70, 30, 85, 50, 95, 60, 40, 80, 35,
                      ].map((height, i) => (
                        <div
                          key={i}
                          className={`w-1.5 rounded-full transition-all duration-300 ${
                            isPlayingSim ? "bg-block-lime" : "bg-white/20"
                          }`}
                          style={{
                            height: isPlayingSim
                              ? `${Math.max(15, (height * ((i % 3) + 1)) % 90)}%`
                              : `${height * 0.3}%`,
                            animationDelay: `${i * 0.05}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-white/70">
                      <span>SPEECH SYNTHESIS</span>
                      <span className="text-block-lime">
                        Conversational Neural v2
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono text-white/70">
                      <span>BARGE-IN DETECTION</span>
                      <span className="text-white">Active (50ms cut-off)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono text-white/70">
                      <span>SAMPLING RATE</span>
                      <span className="text-white">24kHz PCM Opus</span>
                    </div>
                  </div>
                </div>

                {/* Realtime Stream Dialogue Box */}
                <div className="flex flex-col rounded-[20px] bg-white/5 p-6 lg:col-span-7">
                  <p className="font-mono text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
                    Live Audio Stream Transcript
                  </p>

                  <div className="space-y-4 text-sm font-sans flex-1">
                    <div className="rounded-xl bg-white/10 p-4 border border-white/5">
                      <div className="flex items-center justify-between text-xs text-block-lime font-mono mb-1">
                        <span>AI AGENT (VoicePilot)</span>
                        <span>00:02 • 218ms</span>
                      </div>
                      <p className="text-white font-medium">
                        &quot;Namaste Rohit! VoicePilot me aapka swagat hai.
                        Main aapke sales calls automate karne me kaise help kar
                        sakti hoon?&quot;
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                      <div className="flex items-center justify-between text-xs text-white/50 font-mono mb-1">
                        <span>CUSTOMER (Rohit)</span>
                        <span>00:06</span>
                      </div>
                      <p className="text-white/80 font-normal">
                        &quot;Hi! Mujhe daily 500 outbound qualification calls
                        bhejni hain. Kya setup quick ho jaayega?&quot;
                      </p>
                    </div>

                    <div
                      className={`rounded-xl p-4 border transition-all duration-300 ${isPlayingSim ? "bg-block-lime/20 border-block-lime" : "bg-white/10 border-white/5"}`}
                    >
                      <div className="flex items-center justify-between text-xs text-block-lime font-mono mb-1">
                        <span>AI AGENT (VoicePilot)</span>
                        <span>
                          {isPlayingSim ? "STREAMING NOW..." : "00:10 • 225ms"}
                        </span>
                      </div>
                      <p className="text-white font-medium">
                        &quot;Bilkul Rohit! 5 minutes me aapka assistant live ho
                        jaayega. Main aapki CSV leads list import karke
                        automatic outbound dialing initiate kar dungi!&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section
          id="features"
          className="mx-auto max-w-[1340px] px-6 py-20 lg:px-8"
        >
          <div className="section-reveal max-w-3xl">
            <h2 className="text-4xl font-[340] leading-[1.04] tracking-[-0.03em] md:text-6xl text-black">
              Engineered for low-latency call centers and sales teams.
            </h2>
            <p className="mt-5 text-lg font-light text-black/70">
              Every layer of the VoicePilot stack is optimized for real phone
              conversations, regional nuances, and operator workflows.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureGrid.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`section-reveal flex flex-col justify-between rounded-[24px] p-7 md:p-8 ${feature.blockBg} transition-transform duration-300 hover:scale-[1.01]`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-md">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider opacity-60">
                      SPEC APPROVED
                    </span>
                  </div>

                  <div className="mt-12">
                    <h3 className="text-2xl font-semibold tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed font-light opacity-90">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Language Engine Interactive Showcase */}
        <section
          id="languages"
          className="mx-auto max-w-[1340px] px-6 pb-24 lg:px-8"
        >
          <div className="section-reveal rounded-[28px] bg-surface-soft p-8 md:p-12 border border-black/5">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-[340] leading-[1.04] tracking-[-0.03em] md:text-5xl text-black">
                Regional Language Mastery (Hindi, Hinglish & English)
              </h2>
              <p className="mt-4 text-base font-light text-black/75">
                Indian callers speak in mixed dialects. VoicePilot agents
                preserve natural accents, code-switching, and local terms
                without breaking rhythm.
              </p>
            </div>

            {/* Language Tabs */}
            <div className="mt-8 flex flex-wrap gap-2">
              {languageDemos.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => setActiveLangTab(demo.id as any)}
                  className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                    activeLangTab === demo.id
                      ? "bg-black text-white shadow-md"
                      : "bg-white text-black border border-black/10 hover:bg-black/5"
                  }`}
                >
                  {demo.label}
                </button>
              ))}
            </div>

            {/* Selected Language Content Card */}
            <div className="mt-8 grid gap-8 rounded-[24px] bg-white p-6 shadow-xl border border-black/5 lg:grid-cols-12 lg:p-8">
              <div className="space-y-6 lg:col-span-7">
                <div>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${currentLang.badgeColor}`}
                  >
                    {currentLang.accent}
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold text-black tracking-tight">
                    Sample Conversation Dialogue
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-surface-soft p-4">
                    <p className="text-xs font-mono font-bold uppercase text-black/50 mb-1">
                      AI Prompt Greeting
                    </p>
                    <p className="text-base font-medium text-black">
                      {currentLang.agentPrompt}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/5 p-4">
                    <p className="text-xs font-mono font-bold uppercase text-black/50 mb-1">
                      Customer Speech
                    </p>
                    <p className="text-base font-normal text-black/85">
                      {currentLang.userReply}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-block-lime/30 p-4 border border-block-lime">
                    <p className="text-xs font-mono font-bold uppercase text-black/70 mb-1">
                      AI Instant Response
                    </p>
                    <p className="text-base font-medium text-black">
                      {currentLang.agentAnswer}
                    </p>
                  </div>
                </div>
              </div>

              {/* Language Metrics Sidebar */}
              <div className="flex flex-col justify-between rounded-[20px] bg-black p-6 text-white lg:col-span-5">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-widest text-white/50">
                    Model Benchmark
                  </p>
                  <div className="mt-6 space-y-5">
                    <div>
                      <p className="text-3xl font-extrabold text-block-lime">
                        {currentLang.latency}
                      </p>
                      <p className="text-xs text-white/60 font-mono">
                        End-to-End Voice Turn Latency
                      </p>
                    </div>

                    <div>
                      <p className="text-3xl font-extrabold text-white">
                        {currentLang.accuracy}
                      </p>
                      <p className="text-xs text-white/60 font-mono">
                        Speech Recognition Word Accuracy
                      </p>
                    </div>

                    <div>
                      <p className="text-base font-semibold text-white">
                        Code-Switching Support
                      </p>
                      <p className="text-xs text-white/60">
                        Seamless mid-sentence language switching without
                        restarting model context.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-block-lime hover:underline"
                  >
                    <span>Build {currentLang.label} Agent</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Developer API & Webhook Studio */}
        <section
          id="developer-api"
          className="mx-auto max-w-[1340px] px-6 pb-24 lg:px-8"
        >
          <div className="section-reveal rounded-[28px] bg-black p-8 md:p-12 text-white">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-mono text-block-lime mb-4">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>DEVELOPER FIRST API</span>
                </div>
                <h2 className="text-4xl font-[340] leading-[1.04] tracking-[-0.03em] md:text-5xl text-white">
                  Programmatic Assistant Control
                </h2>
                <p className="mt-3 max-w-xl text-base font-light text-white/70">
                  Deploy voice agents, assign 10-digit Indian business numbers,
                  and stream call webhooks with a single API request.
                </p>
              </div>

              {/* Language Switcher Pills */}
              <div className="flex items-center gap-2 rounded-full bg-white/10 p-1">
                {(["curl", "node", "python"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveCodeTab(lang)}
                    className={`rounded-full px-4 py-1.5 text-xs font-mono uppercase font-semibold transition-all ${
                      activeCodeTab === lang
                        ? "bg-block-lime text-black shadow-sm"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {lang === "curl"
                      ? "cURL"
                      : lang === "node"
                        ? "Node.js"
                        : "Python"}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Block Container */}
            <div className="relative mt-8 rounded-[20px] bg-neutral-950 p-5 font-mono text-xs leading-relaxed text-emerald-400 border border-white/10">
              <button
                type="button"
                onClick={handleCopyCode}
                className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20"
                aria-label="Copy code snippet"
              >
                {copiedCode ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copiedCode ? "Copied!" : "Copy"}</span>
              </button>

              <pre className="overflow-x-auto p-2 pt-6">
                <code>{codeSnippets[activeCodeTab]}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Security & Reliability Section */}
        <section
          id="security"
          className="mx-auto max-w-[1340px] px-6 pb-24 lg:px-8"
        >
          <div className="section-reveal grid gap-6 md:grid-cols-4">
            {[
              {
                title: "99.99% Telephony Uptime",
                desc: "Redundant SIP carrier routing across Indian telecom networks.",
              },
              {
                title: "Zero Data Retention",
                desc: "Opt-out options to ensure customer voice data is purged instantly.",
              },
              {
                title: "TRAI & DLT Compliant",
                desc: "Fully aligned with Indian telecom guidelines for business calling.",
              },
              {
                title: "SOC2 & ISO Ready",
                desc: "Enterprise-grade data encryption in transit and at rest.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[22px] border border-black/10 bg-white p-6 shadow-sm"
              >
                <ShieldCheck className="h-7 w-7 text-black mb-4" />
                <h3 className="text-lg font-semibold text-black tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs font-light text-black/70 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mx-auto max-w-[1340px] px-6 pb-24 lg:px-8">
          <div className="section-reveal rounded-[28px] bg-block-lime p-8 md:p-12 text-black">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <h2 className="text-4xl font-[340] leading-[1.04] tracking-[-0.03em] md:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="mt-4 text-base font-light text-black/80">
                  Got technical questions about latency, SIP integration, or
                  custom prompts?
                </p>
                <PrimaryButton
                  href="/dashboard"
                  variant="light"
                  className="mt-8"
                >
                  Launch Assistant
                </PrimaryButton>
              </div>

              <div className="grid gap-3">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={faq.question}
                      className="overflow-hidden rounded-[20px] bg-white border border-black/5 shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-black/[0.02]"
                        aria-expanded={isOpen}
                      >
                        <h3 className="text-base font-semibold tracking-tight text-black">
                          {faq.question}
                        </h3>
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                            isOpen
                              ? "rotate-180 bg-black text-white"
                              : "bg-surface-soft text-black/60"
                          }`}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-0 text-sm font-light leading-relaxed text-black/80">
                          <p className="border-t border-black/5 pt-3">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Conversion Banner */}
        <section className="mx-auto max-w-[1340px] px-6 pb-24 lg:px-8">
          <div className="section-reveal relative overflow-hidden rounded-[16px] border border-white/10 bg-[#090b10] p-10 md:p-16 text-center text-white shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-block-lime/10 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl text-white leading-[1.1]">
                Ready to deploy your first AI voice agent?
              </h2>
              <p className="mt-5 text-sm font-light text-white/70 md:text-base leading-relaxed max-w-2xl mx-auto">
                Join top sales and support teams using GAP VoicePilot for fast, reliable, regional voice calling across India.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-bold text-black transition-all hover:bg-neutral-200 active:scale-[0.98] shadow-lg"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-sm font-bold text-white transition-all hover:bg-white/15"
                >
                  View Minute Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Reference-Matched 100vh Landscape Footer */}
      <footer
        ref={footerRef}
        className="relative z-10 flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#f7f6f0] bg-cover bg-bottom bg-no-repeat text-black px-6 pt-12 pb-8 sm:px-12 sm:pt-16 sm:pb-12"
        style={{ backgroundImage: "url('/assets/footer-bg.png')" }}
      >
        <div className="mx-auto flex w-full max-w-[1340px] flex-1 flex-col justify-between">
          {/* Top Section: Brand + Clocks (Left) & Nav Links (Right) */}
          <div className="flex flex-col justify-between gap-12 md:flex-row md:items-start">
            {/* Left Column: Brand & World Clocks */}
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="GAP VoicePilot Logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
                <span className="text-xl font-extrabold tracking-tight text-black">
                  GAP <span className="font-array font-bold text-[#ff4b2f]">VoicePilot</span>
                </span>
              </div>

              <p className="mt-4 text-xs sm:text-sm font-normal leading-relaxed text-black/70 max-w-md">
                Sub-240ms AI voice engine for live Indian calls. Built in India at GAP Studio.
                <br />
                An independent voice intelligence & AI calling platform.
              </p>

              {/* World Clocks Row */}
              <div className="mt-8 grid grid-cols-4 gap-4 max-w-md">
                <div>
                  <div className="font-mono text-xs font-bold text-black tracking-wider">
                    {currentTime ? formatTime("Asia/Kolkata") : "18:35:58"}
                  </div>
                  <div className="mt-1 text-xs font-medium text-black/80">Bengaluru</div>
                  <div className="text-xs font-mono font-medium tracking-wider text-black/40 uppercase scale-90 origin-left">INDIA</div>
                </div>

                <div>
                  <div className="font-mono text-xs font-bold text-black tracking-wider">
                    {currentTime ? formatTime("America/New_York") : "08:05:58"}
                  </div>
                  <div className="mt-1 text-xs font-medium text-black/80">New York</div>
                  <div className="text-xs font-mono font-medium tracking-wider text-black/40 uppercase scale-90 origin-left">N. AMERICA</div>
                </div>

                <div>
                  <div className="font-mono text-xs font-bold text-black tracking-wider">
                    {currentTime ? formatTime("Europe/London") : "13:05:58"}
                  </div>
                  <div className="mt-1 text-xs font-medium text-black/80">London</div>
                  <div className="text-xs font-mono font-medium tracking-wider text-black/40 uppercase scale-90 origin-left">EUROPE</div>
                </div>

                <div>
                  <div className="font-mono text-xs font-bold text-black tracking-wider">
                    {currentTime ? formatTime("Asia/Tokyo") : "21:05:58"}
                  </div>
                  <div className="mt-1 text-xs font-medium text-black/80">Tokyo</div>
                  <div className="text-xs font-mono font-medium tracking-wider text-black/40 uppercase scale-90 origin-left">ASIA</div>
                </div>
              </div>
            </div>

            {/* Right Column: Links Grid */}
            <div className="flex gap-16 sm:gap-24">
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                  PRODUCT
                </h4>
                <ul className="mt-5 flex flex-col gap-3 text-xs font-medium text-black/75">
                  <li>
                    <Link href="/product" className="transition-colors hover:text-black">
                      Overview
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="transition-colors hover:text-black">
                      Console Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="transition-colors hover:text-black">
                      Pricing Plans
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="inline-flex items-center gap-1 transition-colors hover:text-black">
                      <span>Developer Docs</span>
                      <span className="text-xs">↗</span>
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-black/40">
                  LEGAL
                </h4>
                <ul className="mt-5 flex flex-col gap-3 text-xs font-medium text-black/75">
                  <li>
                    <a href="#" className="transition-colors hover:text-black">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors hover:text-black">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors hover:text-black">
                      TRAI & DLT Compliance
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors hover:text-black">
                      Security & DPA
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Middle Centered Info Line (Positioned just above mountain peak) */}
          <div className="mt-auto mb-12 flex flex-col items-center justify-center text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-xs font-semibold uppercase tracking-wider text-black/70 sm:text-xs">
              <span>© {new Date().getFullYear()} GAP VOICEPILOT</span>
              <span className="text-black/30">•</span>
              <span className="hover:text-black cursor-pointer underline decoration-black/30 underline-offset-4">GAPVOICE.DEV</span>
              <span className="text-black/30">•</span>
              <span className="hover:text-black cursor-pointer underline decoration-black/30 underline-offset-4">HELLO@GAPVOICE.DEV</span>
              <span className="text-black/30">•</span>
              <span>BUILT IN INDIA</span>
              <span className="text-black/30">•</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                ALL SYSTEMS OPERATIONAL
              </span>
            </div>
            <p className="mt-2 text-xs font-medium text-black/40 max-w-xl leading-normal">
              GAP VoicePilot is an enterprise AI voice engine. All trademarks belong to their respective owners.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Scroll to Top button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-xl transition-all hover:scale-110 active:scale-95"
          aria-label="Scroll to top"
        >
          <ChevronRight className="h-5 w-5 -rotate-90" />
        </button>
      )}
    </div>
  );
}
