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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Globe2,
  Headphones,
  LogOut,
  Menu,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
  Check,
  Minus,
} from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const navItems = [
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Workflow", href: "/#workflow" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/pricing#faq" },
];

const pricingPlans = [
  {
    name: "Call Lite",
    monthlyPrice: 1499,
    annualPrice: 1199,
    note: "For validating your first voice agent workflow",
    action: "Start Lite Plan",
    featured: false,
    badge: undefined,
    minutes: "100 AI Minutes",
    features: [
      "1 Dedicated Phone Number",
      "100 AI Calling Minutes included",
      "Hindi, English & Hinglish Support",
      "Custom System Prompts",
      "Basic Lead & Contact Capture",
      "Standard Webhook Notifications",
      "Email & Community Support",
    ],
  },
  {
    name: "Call Pro",
    monthlyPrice: 2999,
    annualPrice: 2399,
    note: "For daily sales calls and customer support teams",
    action: "Start Pro Plan",
    featured: true,
    badge: "MOST POPULAR",
    minutes: "500 AI Minutes",
    features: [
      "3 Dedicated Phone Numbers",
      "500 AI Calling Minutes included",
      "Hindi, English & Hinglish Support",
      "Real-time Live Call Transfer",
      "Automatic CRM Syncing & Notes",
      "High-Definition Call Recording",
      "Live Call Monitoring & Transcripts",
      "Priority Webhook & API Latency",
      "Priority Email & Chat Support",
    ],
  },
  {
    name: "Call Elite",
    monthlyPrice: 7999,
    annualPrice: 6399,
    note: "For high-volume enterprises and automated call desks",
    action: "Contact Enterprise Sales",
    featured: false,
    badge: "ENTERPRISE",
    minutes: "2,000 AI Minutes",
    features: [
      "10 Dedicated Phone Numbers",
      "2,000 AI Calling Minutes included",
      "Unlimited Multi-Agent Workflows",
      "Custom Neural Voice Clone",
      "Custom SIP & PBX Trunk Integration",
      "Dedicated Technical Account Manager",
      "99.9% Uptime SLA Guarantee",
      "Custom Contract & Invoice Billing",
    ],
  },
];

const featureComparison = [
  {
    category: "AI Calling & Voice Engine",
    items: [
      { feature: "AI Calling Minutes Included", lite: "100 Mins", pro: "500 Mins", elite: "2,000 Mins" },
      { feature: "Cartesia & ElevenLabs Neural Pipeline", lite: true, pro: true, elite: true },
      { feature: "Regional Languages (Hindi, English, Hinglish)", lite: true, pro: true, elite: true },
      { feature: "Custom Voice Cloning", lite: false, pro: false, elite: true },
      { feature: "Extra Minute Rate", lite: "₹3.50/min", pro: "₹2.50/min", elite: "₹1.80/min" },
    ],
  },
  {
    category: "Telephony & Operations",
    items: [
      { feature: "Dedicated Business Numbers", lite: "1 Number", pro: "3 Numbers", elite: "10 Numbers" },
      { feature: "Live Call Handoff / Human Transfer", lite: false, pro: true, elite: true },
      { feature: "Outbound Automated Campaigns", lite: false, pro: true, elite: true },
      { feature: "Inbound IVR & Call Routing", lite: true, pro: true, elite: true },
      { feature: "Custom SIP Trunking", lite: false, pro: false, elite: true },
    ],
  },
  {
    category: "Data & Analytics",
    items: [
      { feature: "Call Recording & Transcripts", lite: "Basic", pro: "Full HD", elite: "Unlimited HD" },
      { feature: "Realtime Sentiment & Intent Extraction", lite: false, pro: true, elite: true },
      { feature: "CRM Auto-Sync (HubSpot, Salesforce, Webhooks)", lite: false, pro: true, elite: true },
      { feature: "Export Data (CSV / JSON)", lite: true, pro: true, elite: true },
    ],
  },
  {
    category: "Security & SLA Support",
    items: [
      { feature: "SSL & Enterprise Data Encryption", lite: true, pro: true, elite: true },
      { feature: "Support SLA", lite: "Standard Email", pro: "Priority Email & Chat", elite: "24/7 Dedicated AM" },
      { feature: "99.9% Uptime SLA Guarantee", lite: false, pro: false, elite: true },
    ],
  },
];

const faqs = [
  {
    question: "How are calling minutes calculated?",
    answer:
      "Minutes are billed strictly on connected call duration rounded up to the nearest second. If a call lasts 45 seconds, only 45 seconds of your minute balance is deducted.",
  },
  {
    question: "What happens if I run out of calling minutes?",
    answer:
      "You can easily recharge AI calling minutes anytime directly from your dashboard balance button or enable auto-recharge. Unused minutes on paid plans rollover to the next month.",
  },
  {
    question: "Can I bring my own existing phone numbers or SIP trunks?",
    answer:
      "Yes! Our Call Elite plan supports custom SIP trunking and direct PBX integration, allowing you to connect existing telephony infrastructure seamlessly.",
  },
  {
    question: "Does VoicePilot support mixed Hinglish conversations?",
    answer:
      "Absolutely. Our neural voice pipeline is specifically tuned for Indian business communication, smoothly understanding code-switched Hindi, English, and Hinglish phrases in live conversations.",
  },
  {
    question: "Is there any long-term contract or cancellation fee?",
    answer:
      "No long-term commitments required. You can upgrade, downgrade, or cancel your subscription at any time directly from the Plans & Billing dashboard.",
  },
];

export default function PricingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();

        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted && session?.user) {
          setUser(session.user);
        }

        const { data: { user: serverUser } } = await supabase.auth.getUser();
        if (isMounted) {
          setUser(serverUser ?? session?.user ?? null);
        }
      } catch (e) {
        console.warn("Could not check auth status on pricing page:", e);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useGSAP(
    () => {
      const reveals = gsap.utils.toArray<HTMLElement>(".section-reveal");
      reveals.forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    },
    { scope: containerRef }
  );

  const displayName = user
    ? user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User"
    : "User";

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f7f6f0] text-black antialiased font-sans">
      {/* Sticky Header Navigation */}
      <header className="sticky top-4 z-50 mx-auto w-full md:w-[82%] lg:w-[76%] max-w-[1080px] px-3 sm:px-4">
        <div className="flex h-16 items-center justify-between rounded-full border border-white/70 bg-white/80 p-2 pl-4 pr-2 shadow-[0_10px_35px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl ring-1 ring-black/5 transition-all duration-300">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" title="GAP VoicePilot Home">
            <Image src="/logo.png" alt="GAP VoicePilot Logo" width={40} height={40} className="h-10 w-10 object-contain" priority />
            <span className="flex flex-col leading-none">
              <span className="text-base font-extrabold tracking-tight text-black">GAP</span>
              <span className="font-array text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#ff4b2f] -mt-0.5">
                VOICEPILOT
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  item.href === "/pricing"
                    ? "bg-black text-white shadow-xs"
                    : "text-black/70 hover:bg-black/5 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            ))}
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
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition-all duration-200 hover:border-black/25 hover:shadow-md hover:scale-105"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-black text-xs font-semibold text-white">
                        {displayName.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={12} className="w-64 rounded-[20px] border border-black/10 bg-white p-2 shadow-2xl">
                  <DropdownMenuLabel className="px-3.5 py-2.5">
                    <span className="block truncate text-sm font-semibold text-black">{displayName}</span>
                    {user.email ? <span className="mt-0.5 block truncate text-xs font-medium text-black/45">{user.email}</span> : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-black/5" />
                  <DropdownMenuItem asChild className="rounded-xl px-3.5 py-2.5 font-medium cursor-pointer">
                    <Link href="/dashboard">Open Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-xl px-3.5 py-2.5 font-medium text-red-600 focus:bg-red-50 cursor-pointer"
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
                <Link href="/login" className="rounded-full px-3.5 py-2 text-xs font-semibold text-black/70 hover:bg-black/5">
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
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black md:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mt-2 md:hidden">
            <nav className="flex flex-col gap-1 rounded-3xl border border-black/10 bg-white p-4 shadow-2xl">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-black/80 hover:bg-black/5"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-black/10">
                <Link href="/login" className="rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-black/80 hover:bg-black/5">
                  Sign In
                </Link>
                <PrimaryButton href="/dashboard" className="w-full">
                  Get Started Free
                </PrimaryButton>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="pt-16 md:pt-24 lg:pt-28">
        {/* Pricing Hero Section */}
        <section className="mx-auto max-w-[1340px] px-6 pb-16 lg:px-8 text-center pt-4 md:pt-8">
          <h1 className="section-reveal font-array text-4xl font-[340] leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-7xl max-w-4xl mx-auto">
            Pay for voice minutes.<br />Scale autonomous agents.
          </h1>

          <p className="section-reveal mt-6 max-w-2xl mx-auto text-base sm:text-lg font-light leading-relaxed text-black/75">
            Deploy ultra-low latency Hindi, English & Hinglish AI voice agents. Simple predictable pricing with zero per-seat fees or lock-in contracts.
          </p>

          {/* Clean Monthly / Annual Billing Switcher */}
          <div className="section-reveal mt-10 inline-flex items-center rounded-full border border-black/10 bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                !isAnnual ? "bg-black text-white shadow-xs font-bold" : "text-black/60 hover:text-black"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                isAnnual ? "bg-black text-white shadow-xs font-bold" : "text-black/60 hover:text-black"
              }`}
            >
              Annual Billing
              <span className="rounded-full bg-emerald-500/15 text-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Save 20%
              </span>
            </button>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="mx-auto max-w-[1340px] px-6 pb-24 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3 items-stretch">
            {pricingPlans.map((plan) => {
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              return (
                <article
                  key={plan.name}
                  className={`section-reveal relative flex h-full flex-col justify-between rounded-[32px] p-8 sm:p-9 transition-all duration-300 ${
                    plan.featured
                      ? "border-2 border-black/15 bg-white text-black shadow-xl scale-[1.02]"
                      : "border border-black/10 bg-white text-black shadow-xs hover:shadow-xl hover:-translate-y-1"
                  }`}
                >
                  {plan.badge && (
                    <div className={`absolute -top-3.5 right-8 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md ${
                      plan.featured ? "bg-[#ff4b2f]" : "bg-neutral-900"
                    }`}>
                      {plan.featured && <Sparkles className="h-3 w-3 fill-current" />}
                      <span>{plan.badge}</span>
                    </div>
                  )}

                  <div>
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-black/45">
                      {plan.name}
                    </p>

                    <div className="mt-5 flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold tracking-tight sm:text-5xl text-black">
                        ₹{price.toLocaleString()}
                      </span>
                      <span className="text-sm font-normal text-black/55">
                        / month
                      </span>
                    </div>

                    <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700">
                      <Zap className="h-3.5 w-3.5 fill-current" />
                      <span>{plan.minutes}</span>
                    </div>

                    <p className="mt-3 text-sm font-normal leading-relaxed text-black/70 min-h-[40px]">
                      {plan.note}
                    </p>
                  </div>

                  {/* Feature List */}
                  <div className="my-8 flex-1 border-t border-black/8 pt-6">
                    <ul className="space-y-3.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-xs sm:text-sm font-medium leading-normal text-black/85">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-black/80" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Balanced Button Components */}
                  <Link
                    href="/dashboard"
                    className={`group flex h-12 w-full items-center justify-center gap-2 rounded-full font-bold text-sm shadow-sm transition-all duration-200 active:scale-[0.98] ${
                      plan.featured
                        ? "bg-[#ff4b2f] text-white hover:bg-[#e03a1e] shadow-md hover:shadow-lg"
                        : "bg-black text-white hover:bg-neutral-800 hover:shadow-md"
                    }`}
                  >
                    <span>{plan.action}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* Feature Comparison Table Section */}
        <section className="mx-auto max-w-[1340px] px-6 pb-24 lg:px-8">
          <div className="section-reveal mb-12 text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-black/50">DETAILED COMPARISON</p>
            <h2 className="mt-3 text-3xl font-[340] tracking-[-0.03em] sm:text-5xl">
              Compare features across plans
            </h2>
          </div>

          <div className="section-reveal overflow-x-auto rounded-[28px] border border-black/10 bg-white shadow-xs">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10 bg-neutral-50/80">
                  <th className="p-6 text-sm font-bold text-black">Features</th>
                  <th className="p-6 text-center text-sm font-bold text-black w-48">Call Lite</th>
                  <th className="p-6 text-center text-sm font-bold text-[#ff4b2f] w-48 bg-[#ff4b2f]/5">Call Pro</th>
                  <th className="p-6 text-center text-sm font-bold text-black w-48">Call Elite</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((cat) => (
                  <React.Fragment key={cat.category}>
                    <tr className="border-b border-black/10 bg-neutral-100/50">
                      <td colSpan={4} className="px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black/60">
                        {cat.category}
                      </td>
                    </tr>
                    {cat.items.map((item) => (
                      <tr key={item.feature} className="border-b border-black/5 hover:bg-neutral-50/50 transition-colors">
                        <td className="p-6 text-xs sm:text-sm font-medium text-black">{item.feature}</td>
                        <td className="p-6 text-center text-xs sm:text-sm font-medium text-black/70">
                          {typeof item.lite === "boolean" ? (
                            item.lite ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <Minus className="mx-auto h-4 w-4 text-black/20" />
                          ) : (
                            item.lite
                          )}
                        </td>
                        <td className="p-6 text-center text-xs sm:text-sm font-semibold text-black bg-[#ff4b2f]/5">
                          {typeof item.pro === "boolean" ? (
                            item.pro ? <Check className="mx-auto h-4 w-4 text-[#ff4b2f]" /> : <Minus className="mx-auto h-4 w-4 text-black/20" />
                          ) : (
                            item.pro
                          )}
                        </td>
                        <td className="p-6 text-center text-xs sm:text-sm font-medium text-black/70">
                          {typeof item.elite === "boolean" ? (
                            item.elite ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <Minus className="mx-auto h-4 w-4 text-black/20" />
                          ) : (
                            item.elite
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section id="faq" className="mx-auto max-w-[1340px] px-6 pb-24 lg:px-8">
          <div className="section-reveal rounded-[28px] bg-block-cream border border-black/10 p-7 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-black/60">PRICING FAQ</p>
                <h2 className="text-3xl font-[340] leading-[1.06] tracking-[-0.03em] sm:text-5xl">
                  Frequently asked questions
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-black/70">
                  Have questions about plan limits or billing cycles? Reach out to our technical team anytime.
                </p>
                <PrimaryButton href="/dashboard" variant="primary" className="mt-8">
                  Open Dashboard
                </PrimaryButton>
              </div>

              <div className="grid gap-3">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <article
                      key={faq.question}
                      className="rounded-[20px] border border-black/10 bg-white transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="flex w-full items-center justify-between p-5 text-left text-base font-semibold text-black"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`ml-4 h-5 w-5 shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-[#ff4b2f]" : "text-black/40"
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <p className="px-5 pb-5 text-sm font-light leading-relaxed text-black/75">
                          {faq.answer}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Footer Component */}
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
                    <span className="mt-1 font-array text-xs font-semibold uppercase tracking-[0.22em] text-[#ff4b2f]">
                      VoicePilot
                    </span>
                  </span>
                </div>

                <p className="mt-5 max-w-md text-sm font-normal leading-relaxed text-black/70">
                  Deploy ultra-low latency Hindi, English, and Hinglish AI voice agents for automated calling, lead qualification, and customer support.
                </p>

                <form onSubmit={(e) => e.preventDefault()} className="mt-7 flex max-w-md items-center gap-2 rounded-full border border-black/15 bg-neutral-100/80 p-1.5 shadow-sm transition-all focus-within:border-black/40 focus-within:ring-2 focus-within:ring-black/5">
                  <input
                    type="email"
                    placeholder="Enter work email for updates"
                    className="w-full bg-transparent px-4 text-xs text-black placeholder:text-black/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-black px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98]"
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
                  <li><Link href="/#capabilities" className="transition-all hover:text-black hover:translate-x-1 inline-block">Hinglish Voice Models</Link></li>
                  <li><Link href="/#capabilities" className="transition-all hover:text-black hover:translate-x-1 inline-block">Sub-second Latency</Link></li>
                  <li><Link href="/#capabilities" className="transition-all hover:text-black hover:translate-x-1 inline-block">Dynamic Campaign Flow</Link></li>
                  <li><Link href="/pricing" className="transition-all hover:text-black hover:translate-x-1 inline-block">Flexible Usage Plans</Link></li>
                  <li><Link href="/pricing#faq" className="transition-all hover:text-black hover:translate-x-1 inline-block">Frequently Asked Questions</Link></li>
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
    </div>
  );
}
