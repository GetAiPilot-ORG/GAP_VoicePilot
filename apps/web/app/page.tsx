"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PrimaryButton } from "@/components/ui/primary-button";
import { RuixenGradientFooter } from "@/components/ui/ruixen-gradient-footer";
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
  ArrowUp,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  DatabaseZap,
  Globe2,
  Headphones,
  LineChart,
  LogOut,
  Menu,
  Mic,
  Phone,
  PhoneCall,
  Play,
  ShieldCheck,
  Sparkles,
  Split,
  Star,
  Terminal,
  X,
  Zap,
} from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const navItems = [
  { label: "Capabilities", href: "#capabilities" },
  { label: "Workflow", href: "#workflow" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "#faq" },
];

const capabilityBlocks = [
  {
    label: "Streaming voice",
    title: "A direct voice loop tuned for fast, natural replies.",
    description:
      "Speech recognition, reasoning, and voice output stay stitched together through a realtime pipeline built for live phone conversations.",
    icon: Zap,
    surface: "bg-block-lime",
  },
  {
    label: "Regional language",
    title: "Hindi, English, and Hinglish conversations feel local.",
    description:
      "Agents can greet, qualify, and recover naturally across mixed-language calls without making your customer feel transferred to a script.",
    icon: Globe2,
    surface: "bg-block-lilac",
  },
  {
    label: "Telephony ready",
    title: "Bind numbers, route calls, and launch campaigns from one place.",
    description:
      "Use dedicated business numbers, SIP routes, and campaign dispatching without hiding the operational state from your team.",
    icon: Phone,
    surface: "bg-block-mint",
  },
];

const workflowSteps = [
  {
    title: "Design the agent",
    copy: "Define the goal, language, fallback behavior, and handoff rules before the first call goes live.",
    icon: Bot,
  },
  {
    title: "Connect numbers",
    copy: "Attach phone numbers and choose inbound support, outbound campaign, or mixed routing.",
    icon: PhoneCall,
  },
  {
    title: "Watch every call",
    copy: "Review live status, transcript notes, outcomes, recordings, and follow-up signals in the dashboard.",
    icon: LineChart,
  },
];

const pricingPlans = [
  {
    name: "Call Lite",
    price: "Rs. 1,499",
    note: "For validating one voice workflow",
    action: "Start Lite",
    featured: false,
    features: [
      "1 dedicated business number",
      "100 AI calling minutes",
      "Hindi and English voice agent",
      "Custom AI voice prompt",
      "Basic lead capture",
    ],
  },
  {
    name: "Call Pro",
    price: "Rs. 2,999",
    note: "For daily sales and support calls",
    action: "Start Pro",
    featured: true,
    features: [
      "500 AI calling minutes",
      "CRM auto-updating",
      "Live call transfer",
      "Call recording",
      "Realtime dashboard",
    ],
  },
  {
    name: "Call Elite",
    price: "Rs. 7,999",
    note: "For high-volume teams",
    action: "Contact Sales",
    featured: false,
    features: [
      "2000 AI calling minutes",
      "Multiple agent workflows",
      "Advanced CRM integration",
      "Priority support",
      "Account manager",
    ],
  },
];

const faqs = [
  {
    question: "Can I test VoicePilot without a custom setup?",
    answer:
      "Yes. The public landing page stays open, and the dashboard flow lets you configure agents, phone numbers, campaigns, and call tests when you are ready.",
  },
  {
    question: "What makes the voice experience feel fast?",
    answer:
      "The product is organized around a realtime speech-to-reasoning-to-speech loop, with live call state visible instead of hidden behind batch jobs.",
  },
  {
    question: "Does it support Indian language workflows?",
    answer:
      "Yes. The homepage and product copy center Hindi, English, and Hinglish use cases for sales, support, and local business calls.",
  },
  {
    question: "Can I connect real business numbers?",
    answer:
      "Yes. The dashboard includes phone-number and campaign areas so teams can connect numbers and run inbound or outbound workflows.",
  },
];

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
    const checkUser = async () => {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch {
        setUser(null);
      }
    };

    void checkUser();
  }, []);

  useGSAP(
    () => {
      const root = pageRef.current;
      if (!root) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const heroItems = gsap.utils.toArray<HTMLElement>(".hero-reveal", root);
      const revealItems = gsap.utils.toArray<HTMLElement>(".section-reveal", root);

      if (reduceMotion) {
        gsap.set([...heroItems, ...revealItems], { autoAlpha: 1, y: 0, clearProps: "transform" });
        return;
      }

      gsap.set(heroItems, { autoAlpha: 0, y: 28 });
      gsap.set(revealItems, { autoAlpha: 0, y: 34 });

      gsap
        .timeline({ defaults: { duration: 0.8, ease: "power3.out" } })
        .to(heroItems, { autoAlpha: 1, y: 0, stagger: 0.09 })
        .fromTo(
          ".hero-pulse",
          { scale: 0.96, rotate: -1 },
          { scale: 1, rotate: 0, duration: 1.1, ease: "elastic.out(1, 0.65)" },
          "-=0.65",
        );

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

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "User");

  return (
    <div ref={pageRef} className="min-h-screen bg-white text-black font-sans selection:bg-block-lime selection:text-black">
      {/*
        THESIS: VoicePilot becomes an editorial operating-room homepage, not another blue SaaS pitch.
        OWN-WORLD: White canvas, black ink, pill controls, pastel poster blocks, and flat product-system compositions from DESIGN.md.
        STORY: A visitor sees the live-call mechanism, then understands setup, monitoring, pricing, and next action.
        FIRST VIEWPORT: Sticky monochrome nav, oversized headline, dual CTA, and a lilac realtime console artifact.
        FORM: Established DESIGN.md world extended into a full persuasive homepage; GSAP animates one staged reveal system.
      */}

      <header className="sticky top-4 z-50 mx-auto w-full md:w-[82%] lg:w-[76%] max-w-[1080px] px-3 sm:px-4">
        <div className="flex h-16 items-center justify-between rounded-full border border-white/70 bg-white/75 p-2 pl-4 pr-2 shadow-[0_10px_35px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl ring-1 ring-black/5 transition-all duration-300">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" title="GAP VoicePilot Home">
            <Image src="/logo.png" alt="GAP VoicePilot Logo" width={40} height={40} className="h-10 w-10 object-contain" priority />
            <span className="flex flex-col leading-none">
              <span className="text-base font-extrabold tracking-tight text-black">GAP</span>
              <span className="font-array text-[11.5px] font-bold uppercase tracking-[0.08em] text-black/75 -mt-0.5">
                VOICEPILOT
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-black/70 transition-all hover:bg-black/5 hover:text-black"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex shrink-0">
            {user ? (
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
                <DropdownMenuContent align="end" sideOffset={12} className="w-64 rounded-[20px] border border-black/10 bg-white/95 p-2 shadow-2xl backdrop-blur-xl">
                  <DropdownMenuLabel className="px-3.5 py-2.5">
                    <span className="block truncate text-sm font-semibold text-black">{displayName}</span>
                    {user.email ? <span className="mt-0.5 block truncate text-xs font-medium text-black/45">{user.email}</span> : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-black/5" />
                  <DropdownMenuItem asChild className="rounded-xl px-3.5 py-2.5 font-medium transition-colors cursor-pointer">
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
                <Link href="/login" className="rounded-full px-3.5 py-2 text-xs font-semibold text-black/70 transition-colors hover:bg-black/5 hover:text-black">
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
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <div className={`mt-2 md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}>
          <nav className="flex flex-col gap-1 rounded-3xl border border-black/10 bg-white/95 p-4 shadow-2xl backdrop-blur-xl" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-black hover:bg-surface-soft"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid gap-2 border-t border-black/5 pt-3">
              {user ? (
                <>
                  <div className="rounded-xl bg-surface-soft px-4 py-2.5">
                    <p className="truncate text-sm font-semibold text-black">{displayName}</p>
                    {user.email ? <p className="mt-0.5 truncate text-xs font-medium text-black/45">{user.email}</p> : null}
                  </div>
                  <Link href="/dashboard" onClick={closeMobileMenu} className="btn-pill-primary rounded-full py-2.5 text-center text-xs">
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      closeMobileMenu();
                      const { signOut } = await import("@/app/actions/auth");
                      await signOut();
                    }}
                    className="btn-pill-secondary rounded-full py-2.5 text-xs text-red-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobileMenu} className="btn-pill-secondary rounded-full py-2.5 text-center text-xs">
                    Sign In
                  </Link>
                  <PrimaryButton href="/dashboard" onClick={closeMobileMenu} className="h-10 w-full justify-between">
                    Get Started
                  </PrimaryButton>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="min-h-[calc(100svh-80px)] w-full bg-white">
          <div className="hero-reveal relative flex min-h-[calc(100svh-80px)] w-full flex-col overflow-hidden bg-white px-5 pb-0 pt-16 sm:px-8 sm:pt-16 lg:px-14">
            <div className="mx-auto flex max-w-5xl flex-1 flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-4 py-2 text-xs font-semibold text-black shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <span className="flex items-center gap-0.5 text-[#ff4b2f]" aria-label="Five star rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </span>
                <span className="text-black/55">Based on</span>
                <span className="text-black">10,759+ live calls</span>
              </div>

              <h1 className="mt-7 max-w-5xl text-balance font-display text-[clamp(3.45rem,7.5vw,6.7rem)] font-normal leading-[0.92] tracking-[-0.035em] text-black">
                Launch every AI phone agent with no setup & no hidden fees
              </h1>
              <p className="mt-7 max-w-2xl text-base font-light leading-7 tracking-[-0.01em] text-black md:text-xl md:leading-8">
                Build Hindi, English, and Hinglish voice workflows in one fast workspace for sales calls, support follow-ups, and campaign routing.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <PrimaryButton href="/dashboard">
                  {user ? "Open Dashboard" : "Start for free"}
                </PrimaryButton>
                <Link
                  href="/dashboard/assistants"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#ff4b2f]/55 bg-white px-7 text-base font-semibold text-[#d93620] transition-colors hover:bg-[#fff3ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b2f] focus-visible:ring-offset-2"
                >
                  Explore agents
                </Link>
              </div>
            </div>

            <div className="hero-pulse relative mx-auto mt-auto h-[36vh] min-h-[280px] w-full max-w-[1380px] sm:min-h-[320px] lg:min-h-[360px]">
              <div className="absolute left-1/2 top-1/2 h-[220px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#ff4b2f]/10 via-[#ff9a3c]/15 to-[#ff4b2f]/10 blur-3xl pointer-events-none" />

              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 1180 360"
                fill="none"
                role="img"
                aria-label="VoicePilot connects calling workflows with sales and support tools"
                preserveAspectRatio="none"
              >
                {[72, 112, 152, 192, 232, 272].map((y, index) => (
                  <path
                    key={`left-${y}`}
                    d={`M 0 ${y} C 215 ${y + 34 + index * 4}, 370 ${178 + index * 3}, 590 205`}
                    stroke="#ff4b2f"
                    strokeWidth="1.6"
                    strokeOpacity={0.12 + index * 0.03}
                    className="animate-pulse-glow"
                  />
                ))}
                {[74, 114, 154, 194, 234, 274].map((y, index) => (
                  <path
                    key={`right-${y}`}
                    d={`M 1180 ${y} C 965 ${y + 34 + index * 4}, 810 ${178 + index * 3}, 590 205`}
                    stroke="#ff4b2f"
                    strokeWidth="1.6"
                    strokeOpacity={0.12 + index * 0.03}
                    className="animate-pulse-glow"
                  />
                ))}
              </svg>

              <div className="absolute left-1/2 top-[57%] z-30 flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-[16px] border border-black/10 bg-white p-1 shadow-[0_14px_35px_rgba(0,0,0,0.1)] transition-all duration-300 hover:scale-105 sm:h-14 sm:w-14 sm:p-1.5">
                  <Image src="/logo.png" alt="GAP VoicePilot" width={56} height={56} className="h-full w-full object-contain rounded-[10px]" />
                </div>
              </div>

              {[
                { name: "Agent", label: "AI Voice Agent", className: "left-[5%] sm:left-[10%] top-[14%] sm:top-[16%]", icon: Bot, surface: "bg-[#f4fce3] border-[#d8f5a2] text-[#2b5200]", float: "animate-float-slow" },
                { name: "Calls", label: "Live Call Routing", className: "left-[18%] sm:left-[24%] top-[54%] sm:top-[56%]", icon: PhoneCall, surface: "bg-white border-black/10 text-black shadow-md", float: "animate-float-reverse" },
                { name: "Reports", label: "Realtime Analytics", className: "left-[4%] sm:left-[9%] bottom-[12%] sm:bottom-[8%]", icon: BarChart3, surface: "bg-black border-black text-white shadow-xl", float: "animate-float-slow" },
                { name: "CRM", label: "CRM Auto-Sync", className: "right-[20%] sm:right-[26%] top-[53%] sm:top-[55%]", icon: DatabaseZap, surface: "bg-[#fff0f6] border-[#ffdeeb] text-[#a61e4d]", float: "animate-float-reverse" },
                { name: "Support", label: "Support Handoff", className: "right-[5%] sm:right-[10%] top-[15%] sm:top-[17%]", icon: Headphones, surface: "bg-white border-black/10 text-black shadow-md", float: "animate-float-slow" },
                { name: "Campaigns", label: "Outbound Dialing", className: "right-[4%] sm:right-[9%] bottom-[12%] sm:bottom-[8%]", icon: Activity, surface: "bg-[#0c192c] border-black/20 text-white shadow-xl", float: "animate-float-reverse" },
              ].map((tile) => {
                const TileIcon = tile.icon;
                return (
                  <div
                    key={tile.name}
                    className={`group absolute z-20 flex items-center gap-2.5 rounded-full border px-3.5 py-2 shadow-lg transition-all duration-300 hover:z-30 hover:scale-105 hover:shadow-2xl sm:px-4 sm:py-2.5 ${tile.className} ${tile.surface} ${tile.float}`}
                    aria-label={tile.label}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 p-1 group-hover:scale-110 transition-transform">
                      <TileIcon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-semibold tracking-tight whitespace-nowrap">
                      {tile.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="capabilities" className="mx-auto max-w-[1340px] px-6 py-24 lg:px-8">
          <div className="section-reveal max-w-4xl">
            <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-black/50">Capabilities</p>
            <h2 className="text-4xl font-[340] leading-[1.04] tracking-[-0.03em] md:text-6xl">
              The call stack is visible, editable, and ready for operators.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {capabilityBlocks.map((block) => {
              const Icon = block.icon;
              return (
                <article key={block.title} className={`${block.surface} section-reveal flex min-h-[360px] flex-col justify-between rounded-[24px] p-7 md:p-8`}>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-black/65">{block.label}</p>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold leading-tight tracking-[-0.015em] text-black">{block.title}</h3>
                    <p className="mt-4 text-base font-light leading-7 text-black">{block.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-[1340px] px-6 pb-24 lg:px-8">
          <div className="section-reveal rounded-[24px] bg-block-lime p-7 md:p-12">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Workflow</p>
                <h2 className="text-4xl font-[340] leading-[1.04] tracking-[-0.03em] md:text-6xl">
                  From agent brief to answered call.
                </h2>
              </div>
              <p className="max-w-xl text-xl font-light leading-8 tracking-[-0.01em] text-black">
                The homepage now shows the operational journey instead of only listing features: design, connect, dispatch, and learn from every conversation.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {workflowSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-[18px] bg-white p-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-8 text-2xl font-semibold tracking-[-0.015em]">{step.title}</h3>
                    <p className="mt-4 text-sm font-light leading-6 text-black">{step.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="engine" className="mx-auto grid max-w-[1340px] gap-6 px-6 pb-24 lg:grid-cols-[1fr_1.05fr] lg:px-8">
          <div className="section-reveal rounded-[24px] bg-black p-7 text-white md:p-10">
            <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Realtime console</p>
            <h2 className="text-4xl font-[340] leading-[1.04] tracking-[-0.03em] md:text-5xl">
              Every live call leaves a usable trail.
            </h2>
            <p className="mt-6 text-lg font-light leading-8 text-white">
              Monitor call state, capture transcript highlights, and route follow-ups without waiting for a separate reporting export.
            </p>
          </div>

          <div className="section-reveal rounded-[24px] bg-block-navy p-5 text-white md:p-7">
            <div className="grid gap-3">
              {[
                { icon: Mic, title: "Speech stream", value: "Listening and transcribing" },
                { icon: Split, title: "Decision point", value: "Demo booking intent found" },
                { icon: Clock3, title: "Follow-up", value: "Calendar invite queued" },
                { icon: ShieldCheck, title: "Operator state", value: "No human handoff needed" },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.title} className="flex items-center justify-between gap-5 rounded-[16px] bg-white/10 p-4">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{row.title}</p>
                        <p className="mt-1 text-xs font-light text-white/70">{row.value}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-block-lime" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1340px] px-6 pb-24 lg:px-8">
          <div className="section-reveal rounded-[24px] bg-block-coral p-7 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Developer surface</p>
                <h2 className="text-4xl font-[340] leading-[1.04] tracking-[-0.03em] md:text-6xl">
                  Integrations stay readable.
                </h2>
                <p className="mt-6 max-w-lg text-lg font-light leading-8 text-black">
                  Keep APIs, webhooks, phone providers, and CRM updates visible as product objects, not hidden settings.
                </p>
              </div>

              <div className="rounded-[18px] bg-white p-5">
                {[
                  { method: "POST", endpoint: "/assistants", icon: Bot },
                  { method: "POST", endpoint: "/campaigns/dispatch", icon: Activity },
                  { method: "GET", endpoint: "/calls/live", icon: Headphones },
                  { method: "SYNC", endpoint: "/crm/outcomes", icon: DatabaseZap },
                ].map((api) => {
                  const Icon = api.icon;
                  return (
                    <div key={api.endpoint} className="flex items-center justify-between gap-4 border-b border-hairline py-4 last:border-b-0">
                      <div className="flex items-center gap-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-black">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-black/45">{api.method}</p>
                          <p className="mt-1 font-mono text-sm font-semibold text-black">{api.endpoint}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-black/45" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-[1340px] px-6 pb-24 lg:px-8">
          <div className="section-reveal mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-black/50">Pricing</p>
              <h2 className="text-4xl font-[340] leading-[1.04] tracking-[-0.03em] md:text-6xl">
                Pick the call volume. Keep the system simple.
              </h2>
            </div>
            <p className="max-w-sm text-base font-light leading-7 text-black">
              Every plan keeps the core agent workflow visible; scale minutes and service depth as the team grows.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`section-reveal flex min-h-[520px] flex-col rounded-[24px] p-7 ${
                  plan.featured ? "bg-black text-white" : "border border-hairline bg-white text-black"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className={plan.featured ? "font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white/55" : "font-mono text-xs font-semibold uppercase tracking-[0.18em] text-black/45"}>
                      {plan.name}
                    </p>
                    {plan.featured ? <span className="rounded-full bg-block-lime px-3 py-1 text-xs font-semibold text-black">Popular</span> : null}
                  </div>
                  <p className="mt-8 text-4xl font-semibold tracking-[-0.03em]">{plan.price}</p>
                  <p className={plan.featured ? "mt-3 text-sm font-light text-white/70" : "mt-3 text-sm font-light text-black"}>
                    {plan.note}
                  </p>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm font-light leading-6">
                      <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? "text-block-lime" : "text-black"}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/dashboard"
                  className={`mt-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] ${
                    plan.featured ? "bg-white text-black" : "bg-black text-white"
                  }`}
                >
                  {plan.action}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-[1340px] px-6 pb-24 lg:px-8">
          <div className="section-reveal rounded-[24px] bg-block-lime p-7 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-black/60">FAQ</p>
                <h2 className="text-4xl font-[340] leading-[1.04] tracking-[-0.03em] md:text-5xl">
                  Questions before the first call?
                </h2>
                <PrimaryButton href="/dashboard" variant="light" className="mt-8">
                  Open Dashboard
                </PrimaryButton>
              </div>

              <div className="grid gap-3">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={faq.question}
                      className="overflow-hidden rounded-[18px] bg-white border border-black/5 shadow-sm transition-all duration-200"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-black/[0.02]"
                        aria-expanded={isOpen}
                      >
                        <h3 className="text-base font-semibold tracking-[-0.01em] text-black">
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
                        <div className="px-5 pb-5 pt-0 text-sm font-light leading-6 text-black/80">
                          <p className="border-t border-black/5 pt-3">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-black/10 bg-white/90 backdrop-blur-sm pt-20 pb-10">
        <div className="mx-auto w-full max-w-[1340px] px-6 lg:px-8">
          <div className="grid gap-12 pb-16 lg:grid-cols-12">
            <div className="flex flex-col justify-between lg:col-span-5">
              <div>
                <div className="flex items-center gap-3.5">
                  <span className="relative flex h-11 w-11 shrink-0 overflow-hidden">
                    <Image src="/logo.png" alt="GAP Logo" width={44} height={44} className="h-full w-full object-contain" />
                  </span>
                  <span className="flex flex-col leading-none">
                    <span className="text-base font-bold tracking-tight text-black">GAP</span>
                    <span className="mt-1 font-array text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
                      VoicePilot
                    </span>
                  </span>
                </div>

                <p className="mt-5 max-w-md text-sm font-normal leading-relaxed text-black/70">
                  Deploy ultra-low latency Hindi, English, and Hinglish AI voice agents for automated calling, lead qualification, and customer support.
                </p>

                <form onSubmit={(e) => e.preventDefault()} className="mt-7 flex max-w-md items-center gap-2 rounded-full border border-black/15 bg-surface-soft/80 p-1.5 shadow-sm transition-all focus-within:border-black/40 focus-within:ring-2 focus-within:ring-black/5">
                  <input
                    type="email"
                    placeholder="Enter work email for updates"
                    className="w-full bg-transparent px-4 text-xs text-black placeholder:text-black/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-black px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-black/85 active:scale-[0.98]"
                  >
                    Subscribe
                  </button>
                </form>
              </div>

              <div className="mt-8 flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-50/80 px-3.5 py-1.5 w-fit text-xs font-medium text-emerald-900">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>All systems operational & active</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
              <div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-black">Product</h3>
                <ul className="mt-5 flex flex-col gap-3.5 text-xs font-medium text-black/65">
                  <li><Link href="/dashboard" className="transition-all hover:text-black hover:translate-x-1 inline-block">Dashboard Overview</Link></li>
                  <li><Link href="/dashboard/assistants" className="transition-all hover:text-black hover:translate-x-1 inline-block">AI Voice Assistants</Link></li>
                  <li><Link href="/dashboard/calls" className="transition-all hover:text-black hover:translate-x-1 inline-block">Realtime Call Logs</Link></li>
                  <li><Link href="/dashboard/phone-numbers" className="transition-all hover:text-black hover:translate-x-1 inline-block">Phone Numbers</Link></li>
                  <li><Link href="/dashboard/billing" className="transition-all hover:text-black hover:translate-x-1 inline-block">Credits & Subscriptions</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-black">Capabilities</h3>
                <ul className="mt-5 flex flex-col gap-3.5 text-xs font-medium text-black/65">
                  <li><Link href="#capabilities" className="transition-all hover:text-black hover:translate-x-1 inline-block">Hinglish Voice Models</Link></li>
                  <li><Link href="#capabilities" className="transition-all hover:text-black hover:translate-x-1 inline-block">Sub-second Latency</Link></li>
                  <li><Link href="#capabilities" className="transition-all hover:text-black hover:translate-x-1 inline-block">Dynamic Campaign Flow</Link></li>
                  <li><Link href="#pricing" className="transition-all hover:text-black hover:translate-x-1 inline-block">Flexible Usage Plans</Link></li>
                  <li><Link href="#faq" className="transition-all hover:text-black hover:translate-x-1 inline-block">Frequently Asked Questions</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-black">Company & Legal</h3>
                <ul className="mt-5 flex flex-col gap-3.5 text-xs font-medium text-black/65">
                  <li><a href="#" className="transition-all hover:text-black hover:translate-x-1 inline-block">About GAP Platform</a></li>
                  <li><a href="#" className="transition-all hover:text-black hover:translate-x-1 inline-block">Privacy Policy</a></li>
                  <li><a href="#" className="transition-all hover:text-black hover:translate-x-1 inline-block">Terms of Service</a></li>
                  <li><a href="#" className="transition-all hover:text-black hover:translate-x-1 inline-block">Security Architecture</a></li>
                  <li><a href="#" className="transition-all hover:text-black hover:translate-x-1 inline-block">Contact Support</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-black/10 pt-8 text-xs font-medium text-black/50 sm:flex-row">
            <p>© 2026 GAP VoicePilot. All rights reserved.</p>
            <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-black/60">
              <span className="transition-colors hover:text-black cursor-pointer">Privacy</span>
              <span>•</span>
              <span className="transition-colors hover:text-black cursor-pointer">Terms</span>
              <span>•</span>
              <span className="transition-colors hover:text-black cursor-pointer">Cookies</span>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-black/40">Engineered for Next-Gen AI Calling</p>
          </div>
        </div>
      </footer>

      {/* Floating Scroll to Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top of page"
        title="Scroll to top"
        className={`group fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black shadow-[0_12px_32px_rgba(0,0,0,0.14)] backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-black hover:text-white active:scale-95 sm:bottom-8 sm:right-8 ${
          showScrollTop
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-6 opacity-0 pointer-events-none"
        }`}
      >
        <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
      </button>
    </div>
  );
}
