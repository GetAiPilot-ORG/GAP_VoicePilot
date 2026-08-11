"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  BarChart3,
  Bot,
  CheckCircle2,
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
  { label: "Pricing", href: "#pricing" },
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

      <header className="sticky top-0 z-50 border-b border-hairline bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex min-w-0 items-center gap-4" title="GAP VoicePilot Home">
            <span className="relative flex h-16 w-16 shrink-0 overflow-hidden">
              <Image src="/logo.png" alt="GAP VoicePilot Logo" width={64} height={64} className="h-full w-full object-contain" priority />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-xl font-semibold tracking-[-0.02em] text-black">GAP</span>
              <span className="mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.34em] text-black/50">
                VoicePilot
              </span>
            </span>
          </Link>

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-black/58 transition-colors hover:text-black"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <>
                <Link href="/dashboard" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition-transform hover:scale-[1.02]">
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-white text-black transition-colors hover:bg-surface-soft"
                      aria-label="Open account menu"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-black text-sm font-semibold uppercase text-white">
                          {displayName.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={12} className="w-64 rounded-[18px] border-hairline bg-white p-2">
                    <DropdownMenuLabel className="px-3 py-2">
                      <span className="block truncate text-sm font-semibold text-black">{displayName}</span>
                      {user.email ? <span className="mt-1 block truncate text-xs font-medium text-black/45">{user.email}</span> : null}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-hairline" />
                    <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 font-medium">
                      <Link href="/dashboard">Open Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-xl px-3 py-2.5 font-medium text-red-600 focus:bg-block-pink focus:text-red-700"
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
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-full px-5 py-3 text-sm font-semibold text-black/60 transition-colors hover:bg-surface-soft hover:text-black">
                  Sign In
                </Link>
                <Link href="/dashboard" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition-transform hover:scale-[1.02]">
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-soft text-black transition-transform active:scale-95 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className={`md:hidden ${mobileMenuOpen ? "border-t border-hairline bg-white" : "hidden"}`}>
          <nav className="mx-auto flex max-w-[1440px] flex-col gap-1 px-5 py-5" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="rounded-2xl px-4 py-3 text-base font-semibold text-black hover:bg-surface-soft"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-4 grid gap-2 border-t border-hairline pt-4">
              {user ? (
                <>
                  <div className="rounded-2xl bg-surface-soft px-4 py-3">
                    <p className="truncate text-sm font-semibold text-black">{displayName}</p>
                    {user.email ? <p className="mt-1 truncate text-xs font-medium text-black/45">{user.email}</p> : null}
                  </div>
                  <Link href="/dashboard" onClick={closeMobileMenu} className="btn-pill-primary rounded-full py-3">
                    Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      closeMobileMenu();
                      const { signOut } = await import("@/app/actions/auth");
                      await signOut();
                    }}
                    className="btn-pill-secondary rounded-full py-3 text-red-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobileMenu} className="btn-pill-secondary rounded-full py-3">
                    Sign In
                  </Link>
                  <Link href="/dashboard" onClick={closeMobileMenu} className="btn-pill-primary rounded-full py-3">
                    Launch Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="min-h-[calc(100svh-80px)] w-full bg-white">
          <div className="hero-reveal relative flex min-h-[calc(100svh-80px)] w-full flex-col overflow-hidden bg-white px-5 pb-0 pt-16 sm:px-8 sm:pt-20 lg:px-14">
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
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ff4b2f] px-7 text-base font-semibold text-white shadow-[0_16px_34px_rgba(255,75,47,0.24)] transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b2f] focus-visible:ring-offset-2"
                >
                  {user ? "Open Dashboard" : "Start for free"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/assistants"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#ff4b2f]/55 bg-white px-7 text-base font-semibold text-[#d93620] transition-colors hover:bg-[#fff3ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b2f] focus-visible:ring-offset-2"
                >
                  Explore agents
                </Link>
              </div>
            </div>

            <div className="hero-pulse relative mx-auto mt-auto h-[34vh] min-h-[260px] w-full max-w-[1380px] sm:min-h-[300px] lg:min-h-[340px]">
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
                    strokeWidth="1.4"
                    strokeOpacity={0.14 + index * 0.035}
                  />
                ))}
                {[74, 114, 154, 194, 234, 274].map((y, index) => (
                  <path
                    key={`right-${y}`}
                    d={`M 1180 ${y} C 965 ${y + 34 + index * 4}, 810 ${178 + index * 3}, 590 205`}
                    stroke="#ff4b2f"
                    strokeWidth="1.4"
                    strokeOpacity={0.14 + index * 0.035}
                  />
                ))}
              </svg>

              <div className="absolute left-1/2 top-[58%] z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[24px] bg-[#ff4b2f] shadow-[0_28px_70px_rgba(255,75,47,0.34)] sm:h-24 sm:w-24">
                <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-white sm:h-14 sm:w-14">
                  <Image src="/logo.png" alt="GAP VoicePilot" width={44} height={44} className="h-10 w-10 object-contain sm:h-11 sm:w-11" />
                </span>
              </div>

              {[
                { name: "Agent", className: "left-[12%] top-[18%]", icon: Bot, surface: "bg-block-lime" },
                { name: "Calls", className: "left-[27%] top-[58%]", icon: PhoneCall, surface: "bg-white" },
                { name: "Reports", className: "left-[11%] bottom-[9%]", icon: BarChart3, surface: "bg-black text-white" },
                { name: "CRM", className: "right-[29%] top-[57%]", icon: DatabaseZap, surface: "bg-block-pink" },
                { name: "Support", className: "right-[12%] top-[19%]", icon: Headphones, surface: "bg-white" },
                { name: "Campaigns", className: "right-[11%] bottom-[9%]", icon: Activity, surface: "bg-block-navy text-white" },
              ].map((tile) => {
                const TileIcon = tile.icon;
                return (
                  <div
                    key={tile.name}
                    className={`absolute z-10 hidden h-16 w-16 items-center justify-center rounded-[18px] border border-black/8 shadow-[0_22px_55px_rgba(0,0,0,0.13)] sm:flex ${tile.className} ${tile.surface}`}
                    aria-label={tile.name}
                  >
                    <TileIcon className="h-7 w-7" />
                  </div>
                );
              })}

              <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-3 gap-3 sm:hidden">
                {[
                  ["Voice", "Hindi + English"],
                  ["Calls", "Live routing"],
                  ["CRM", "Auto sync"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[16px] bg-surface-soft p-3 text-left">
                    <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-black/45">{label}</p>
                    <p className="mt-1 text-xs font-semibold text-black">{value}</p>
                  </div>
                ))}
              </div>
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
                <Link href="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white">
                  Open Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-3">
                {faqs.map((faq) => (
                  <div key={faq.question} className="rounded-[18px] bg-white p-5">
                    <h3 className="text-base font-semibold tracking-[-0.01em] text-black">{faq.question}</h3>
                    <p className="mt-3 text-sm font-light leading-6 text-black">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline bg-white py-12">
        <div className="mx-auto flex max-w-[1340px] flex-col gap-8 px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 overflow-hidden rounded-full bg-black">
              <Image src="/logo.png" alt="GAP Logo" width={36} height={36} className="h-full w-full object-cover" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-black">GAP VoicePilot</p>
              <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">Realtime AI calling</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-black/65">
            <Link href="/dashboard" className="hover:text-black">Dashboard</Link>
            <Link href="/dashboard/assistants" className="hover:text-black">Assistants</Link>
            <Link href="/dashboard/calls" className="hover:text-black">Call Logs</Link>
            <Link href="/dashboard/billing" className="hover:text-black">Plans</Link>
          </div>

          <p className="text-xs font-medium text-black/45">2026 GAP VoicePilot Platform.</p>
        </div>
      </footer>
    </div>
  );
}
