"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Phone,
  Mail,
  User as UserIcon,
  Building2,
  MessageSquare,
  Loader2,
  ArrowRight,
  Send,
  AlertCircle,
  Star,
  Zap,
  Globe2,
  ShieldCheck,
  Headphones,
  Bot,
  LogOut,
  Menu,
  X,
  Check,
  ArrowUp,
  PhoneCall
} from "lucide-react";
import { submitDemoInquiry } from "@/app/actions/demo";
import { PrimaryButton } from "@/components/ui/primary-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { label: "Product", href: "/product" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Workflow", href: "/#workflow" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "/#faq" },
];

const SERVICE_OPTIONS = [
  "Sales & Lead Qualification Voice Agents",
  "Customer Support & Handoff Automation",
  "Inbound Call Routing & AI Answering",
  "Outbound Bulk Phone Campaigns",
  "Dedicated Phone Number & Calling Channel (₹2,000/mo)",
  "Custom AI Voice Workflows & Integrations"
];

const TIME_SLOTS = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "06:00 PM - 08:00 PM"
];

const VALUE_PROPS = [
  {
    icon: Zap,
    title: "Sub-240ms Voice Latency",
    desc: "Experience real-time speech recognition and synthesis tuned for zero-delay Indian phone conversations."
  },
  {
    icon: Globe2,
    title: "Hindi, English & Hinglish Mastery",
    desc: "Agents adapt naturally to regional language switches without breaking script context."
  },
  {
    icon: Headphones,
    title: "Live Call Transfer & Handoff",
    desc: "Seamlessly route interested leads to human sales reps or support desks mid-call."
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Compliance & Privacy",
    desc: "Dedicated TRAI, DLT, and SOC2 compliant telephony infrastructure with zero data retention."
  }
];

const pricingPlans = [
  {
    audience: "FOR STARTERS",
    name: "Start",
    description: "250 AI calling minutes included.",
    price: "₹1,499",
    unit: "/mo",
    feeNote: "Effective rate: ₹6.00 / min • ₹0 platform fee.",
    action: "Start building",
    headerBg: "bg-[#e4ebd9] border-b border-black/10",
    buttonVariant: "dark",
    features: [
      "250 AI Calling Minutes",
      "₹6.00 / min per-minute rate",
      "Hindi, English & Hinglish Support",
      "Custom AI System Prompts",
      "Basic Lead & Contact Capture",
    ],
  },
  {
    audience: "FOR TEAMS",
    name: "Build",
    description: "Daily sales calls, live transfers & auto-CRM sync.",
    price: "₹4,999",
    unit: "/mo",
    feeNote: "Effective rate: ₹5.00 / min • Includes 1,000 mins.",
    action: "Start building",
    headerBg: "bg-[#f9f3e5] border-b border-black/10",
    buttonVariant: "dark",
    features: [
      "1,000 AI Calling Minutes",
      "₹5.00 / min per-minute rate",
      "Realtime Live Call Transfer",
      "Automatic CRM Auto-Syncing",
      "Live Call Transcripts & Recording",
    ],
  },
  {
    audience: "FOR HIGH VOLUME",
    name: "Scale",
    description: "Lowest per-minute rates for high-volume dialers.",
    price: "₹9,999",
    unit: "/mo",
    feeNote: "Effective rate: ₹5.00 / min • Includes 2,000 mins.",
    action: "Start building",
    headerBg: "bg-[#faeae1] border-b border-black/10",
    buttonVariant: "dark",
    features: [
      "2,000 AI Calling Minutes",
      "₹5.00 / min per-minute rate",
      "Unlimited Multi-Agent Workflows",
      "Priority SIP Latency Routing",
      "Dedicated Account Manager",
    ],
  },
  {
    audience: "FOR ORGANIZATIONS",
    name: "Enterprise",
    description: "Dedicated infrastructure with controls regulated teams require.",
    price: "Custom",
    unit: "",
    feeNote: "Contracted to your volume.",
    action: "Talk to our team",
    headerBg: "bg-[#e7e9e8] border-b border-black/10",
    buttonVariant: "outline",
    features: [
      "Concurrency sized to your volume",
      "Custom per-minute bulk rates",
      "Custom SIP trunking & on-prem",
      "Forward-deployed engineer",
      "TRAI, SOC2 & DLT compliance",
      "Zero data retention & SSO",
    ],
  },
];

export default function DemoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [requirement, setRequirement] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[0]);

  // UX State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (timeZone: string) => {
    if (!currentTime) return "00:00:00";
    return currentTime.toLocaleTimeString("en-GB", {
      timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  useEffect(() => {
    let isMounted = true;
    const checkUser = async () => {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted && session?.user) setUser(session.user);
        const { data: { user: serverUser } } = await supabase.auth.getUser();
        if (isMounted) setUser(serverUser ?? session?.user ?? null);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    };
    void checkUser();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const footerEl = footerRef.current;
    if (!footerEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0.05 }
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

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "User");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else {
      const cleanPhone = phone.replace(/[^0-9+]/g, "");
      if (cleanPhone.length < 8 || cleanPhone.length > 15) {
        newErrors.phone = "Please enter a valid 10-digit phone/WhatsApp number.";
      }
    }
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!service) newErrors.service = "Please select a service interested in.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await submitDemoInquiry({
        fullName,
        companyName,
        phone,
        email,
        service,
        requirement,
        preferredDate,
        preferredTime,
        source: "demo_page"
      });

      if (res.success) {
        setIsSubmitted(true);
        if (res.whatsappUrl) setWhatsappUrl(res.whatsappUrl);
      } else {
        setSubmitError(res.error || "Failed to submit demo request. Please try again.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f0] text-black font-sans selection:bg-block-lime selection:text-black">
      {/* Sticky Navigation Header */}
      <header
        className={`sticky top-2 z-50 mx-auto w-full md:w-[82%] lg:w-[76%] max-w-[1080px] px-3 sm:px-4 transition-all duration-300 ${
          isFooterVisible
            ? "opacity-0 -translate-y-8 pointer-events-none"
            : "opacity-100 translate-y-0 pointer-events-auto"
        }`}
      >
        <div className="flex h-16 items-center justify-between rounded-full border border-white/70 bg-white/75 p-2 pl-4 pr-2 shadow-[0_10px_35px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-2xl ring-1 ring-black/5 transition-all duration-300">
          <Link href="/" className="flex items-center gap-2 shrink-0" title="GAP VoicePilot Home">
            <Image src="/logo.png" alt="GAP VoicePilot Logo" width={40} height={40} className="h-9.5 w-9.5 object-contain" priority />
            <span className="text-xl font-extrabold tracking-tight text-black flex items-center gap-1">
              <span>GAP</span>
              <span className="font-array font-bold text-[#ff4b2f]">VoicePilot</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-black/70 transition-all hover:bg-black/5 hover:text-black"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex shrink-0">
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#ff4b2f] bg-[#fff5f3] px-4 py-2 text-xs font-bold text-[#d93620] shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#ff4b2f]" />
              <span>Get a Demo</span>
            </Link>
            {isAuthLoading ? (
              <div className="h-10 w-10 rounded-full bg-black/5 animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm hover:border-black/25 focus-visible:outline-none"
                    aria-label="Open account menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-xs font-semibold uppercase text-white">
                        {displayName.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={12} className="w-64 rounded-[20px] border border-black/10 bg-white/95 p-2 shadow-2xl backdrop-blur-xl">
                  <DropdownMenuLabel className="px-3.5 py-2.5">
                    <span className="block truncate text-sm font-semibold text-black">{displayName}</span>
                    {user.email && <span className="mt-0.5 block truncate text-xs font-medium text-black/45">{user.email}</span>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-black/5" />
                  <DropdownMenuItem asChild className="rounded-xl px-3.5 py-2.5 font-medium cursor-pointer">
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
            <nav className="flex flex-col gap-1 rounded-3xl border border-black/10 bg-white/95 p-4 shadow-2xl backdrop-blur-xl">
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
                <Link href="/demo" onClick={closeMobileMenu} className="inline-flex justify-center items-center gap-2 rounded-full bg-[#ff4b2f] text-white py-2.5 text-xs font-bold">
                  <Sparkles className="h-4 w-4" />
                  Get a Demo
                </Link>
                <Link href="/login" onClick={closeMobileMenu} className="btn-pill-secondary rounded-full py-2.5 text-center text-xs">
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="space-y-16 sm:space-y-24">
        {/* Main Demo Inquiry Hero Section */}
        <section className="mx-auto max-w-[1280px] px-5 pt-12 sm:px-8 sm:pt-16 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left Column: Value Proposition & Proof */}
            <div className="lg:col-span-6 space-y-8 text-left pt-2">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-surface-soft px-4 py-2 text-xs font-semibold text-black border border-black/5 shadow-xs">
                  <span className="flex items-center gap-0.5 text-[#ff4b2f]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </span>
                  <span className="text-black/55">Based on</span>
                  <span className="text-black font-bold">10,759+ live calls</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-array tracking-tight text-black leading-[0.95]">
                  Get a Personalized AI Voice Agent Demo
                </h1>
                <p className="text-base sm:text-lg text-black/70 font-light leading-relaxed max-w-xl">
                  Experience how GAP VoicePilot automates live sales calls, customer support follow-ups, and regional Hinglish workflows with sub-240ms voice latency.
                </p>
              </div>

              {/* Value Props Checklist */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/50">
                  WHAT YOU'LL SEE IN THE DEMO
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {VALUE_PROPS.map((prop) => {
                    const IconComp = prop.icon;
                    return (
                      <div
                        key={prop.title}
                        className="p-4 rounded-[20px] bg-white border border-black/10 shadow-xs space-y-2 transition-all hover:shadow-md"
                      >
                        <div className="h-9 w-9 rounded-full bg-surface-soft border border-black/5 flex items-center justify-center text-[#ff4b2f]">
                          <IconComp className="h-4 w-4" />
                        </div>
                        <h4 className="font-bold text-sm text-black">{prop.title}</h4>
                        <p className="text-xs text-black/60 font-light leading-relaxed">{prop.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Direct Contact Support Box */}
              <div className="p-5 rounded-[24px] bg-[#fff8f6] border border-[#ff4b2f]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#d93620]">
                    PREFER IMMEDIATE WHATSAPP CHAT?
                  </p>
                  <p className="text-xs text-black/70">
                    Connect directly with our AI solution engineering team right now.
                  </p>
                </div>
                <a
                  href="https://wa.me/919876543210?text=Hi%20GAP%20VoicePilot%20Team%2C%20I%20would%20like%20to%20get%20a%20demo."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 text-xs font-bold shrink-0 shadow-sm transition-all hover:scale-105"
                >
                  <Send className="h-3.5 w-3.5 fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Column: Contact / Inquiry Form Card */}
            <div className="lg:col-span-6 w-full">
              <div className="bg-white border border-black/10 rounded-[32px] p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] space-y-6 text-black text-left relative">
                
                {isSubmitted ? (
                  /* SUCCESS STATE */
                  <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
                    <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                      <CheckCircle2 className="h-11 w-11" />
                    </div>

                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-surface-soft border border-black/5 text-xs font-bold text-[#ff4b2f]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Demo Request Confirmed
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold font-array text-black tracking-tight pt-1">
                        Your demo request has been received.
                      </h2>
                      <p className="text-xs sm:text-sm text-black/60 max-w-md mx-auto leading-relaxed">
                        Our AI Voice Specialist will reach out to you on your scheduled demo date to demonstrate your custom voice workflow.
                      </p>
                    </div>

                    {/* Summary Box */}
                    <div className="bg-[#f7f6f0] border border-black/5 rounded-[24px] p-5 text-left space-y-2.5 text-xs font-mono text-black/80">
                      <div className="flex justify-between border-b border-black/5 pb-2">
                        <span className="text-black/45">Name:</span>
                        <span className="font-bold">{fullName}</span>
                      </div>
                      <div className="flex justify-between border-b border-black/5 pb-2">
                        <span className="text-black/45">Phone:</span>
                        <span className="font-bold">{phone}</span>
                      </div>
                      <div className="flex justify-between border-b border-black/5 pb-2">
                        <span className="text-black/45">Service:</span>
                        <span className="font-bold truncate max-w-[240px]">{service}</span>
                      </div>
                      {preferredDate && (
                        <div className="flex justify-between">
                          <span className="text-black/45">Preferred Time:</span>
                          <span className="font-bold">{preferredDate} ({preferredTime})</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 text-sm font-bold shadow-[0_6px_20px_rgba(37,211,102,0.3)] transition-all hover:scale-[1.01]"
                        >
                          <Send className="h-4 w-4 fill-current" />
                          <span>Continue on WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  /* FORM STATE */
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-soft border border-black/5 text-xs font-semibold text-[#ff4b2f]">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Request Live Walkthrough</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold font-array tracking-tight text-black pt-1">
                        Schedule Your Demo
                      </h2>
                      <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
                        Fill out your requirements below to test custom AI voice agents tailored to your business.
                      </p>
                    </div>

                    {submitError && (
                      <div className="p-3.5 rounded-[16px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-black uppercase tracking-wider">
                            Full Name <span className="text-[#ff4b2f]">*</span>
                          </label>
                          <div className="relative">
                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                            <input
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Rahul Sharma"
                              className={`w-full h-11 pl-10 pr-3.5 rounded-full bg-surface-soft border text-xs font-semibold text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all ${
                                errors.fullName ? "border-red-500 bg-red-50/20" : "border-black/10"
                              }`}
                            />
                          </div>
                          {errors.fullName && <p className="text-[11px] font-medium text-red-600 pl-2">{errors.fullName}</p>}
                        </div>

                        {/* Company Name */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-black uppercase tracking-wider">
                            Company Name
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                            <input
                              type="text"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="Acme Enterprises"
                              className="w-full h-11 pl-10 pr-3.5 rounded-full bg-surface-soft border border-black/10 text-xs font-semibold text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Phone Number */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-black uppercase tracking-wider">
                            Phone / WhatsApp <span className="text-[#ff4b2f]">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className={`w-full h-11 pl-10 pr-3.5 rounded-full bg-surface-soft border text-xs font-semibold text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all ${
                                errors.phone ? "border-red-500 bg-red-50/20" : "border-black/10"
                              }`}
                            />
                          </div>
                          {errors.phone && <p className="text-[11px] font-medium text-red-600 pl-2">{errors.phone}</p>}
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-black uppercase tracking-wider">
                            Email Address <span className="text-[#ff4b2f]">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="rahul@company.com"
                              className={`w-full h-11 pl-10 pr-3.5 rounded-full bg-surface-soft border text-xs font-semibold text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all ${
                                errors.email ? "border-red-500 bg-red-50/20" : "border-black/10"
                              }`}
                            />
                          </div>
                          {errors.email && <p className="text-[11px] font-medium text-red-600 pl-2">{errors.email}</p>}
                        </div>
                      </div>

                      {/* Service Interested In */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-black uppercase tracking-wider">
                          Service Interested In <span className="text-[#ff4b2f]">*</span>
                        </label>
                        <select
                          value={service}
                          onChange={(e) => setService(e.target.value)}
                          className="w-full h-11 px-4 rounded-full bg-surface-soft border border-black/10 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all cursor-pointer"
                        >
                          {SERVICE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date & Time Preferences */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-black uppercase tracking-wider">
                            Preferred Date
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 pointer-events-none" />
                            <input
                              type="date"
                              min={todayStr}
                              value={preferredDate}
                              onChange={(e) => setPreferredDate(e.target.value)}
                              className="w-full h-11 pl-10 pr-3.5 rounded-full bg-surface-soft border border-black/10 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-black uppercase tracking-wider">
                            Preferred Time Slot
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 pointer-events-none" />
                            <select
                              value={preferredTime}
                              onChange={(e) => setPreferredTime(e.target.value)}
                              className="w-full h-11 pl-10 pr-4 rounded-full bg-surface-soft border border-black/10 text-xs font-semibold text-black focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all cursor-pointer"
                            >
                              {TIME_SLOTS.map((ts) => (
                                <option key={ts} value={ts}>
                                  {ts}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Requirement */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-black uppercase tracking-wider">
                          Business Use Case / Requirement
                        </label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-black/40" />
                          <textarea
                            rows={3}
                            value={requirement}
                            onChange={(e) => setRequirement(e.target.value)}
                            placeholder="Describe your use case (e.g. 500 outbound calls/day, CRM sync, Hindi language support)..."
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-[20px] bg-surface-soft border border-black/10 text-xs font-medium text-black placeholder:text-black/35 focus:outline-none focus:ring-2 focus:ring-[#ff4b2f] transition-all leading-relaxed resize-none"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full group inline-flex h-12 items-center justify-between rounded-full bg-[#ff4b2f] hover:bg-[#e63e24] text-white pl-6 pr-2 shadow-[0_6px_20px_rgba(255,75,47,0.25)] transition-all duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b2f] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <span className="flex-1 text-center font-bold text-sm tracking-wide">
                            {isSubmitting ? "Submitting request..." : "Get My Demo"}
                          </span>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[2.5px] border-[#ff4b2f] bg-white transition-transform duration-300 group-hover:translate-x-0.5">
                            {isSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin text-[#ff4b2f]" />
                            ) : (
                              <ArrowRight className="h-4 w-4 text-[#ff4b2f]" />
                            )}
                          </span>
                        </button>
                      </div>

                      <p className="text-[11px] text-center text-black/45 pt-1">
                        No credit card required. Free 15-minute live customized voice demonstration.
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section (Matching Home Page) */}
        <section
          id="pricing"
          className="mx-auto max-w-[1340px] px-6 pt-12 pb-16 lg:px-8"
        >
          <div className="mb-12 text-left">
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-black/50">
              PRICING PLANS
            </p>
            <h2 className="text-4xl font-bold leading-[1.04] tracking-[-0.03em] md:text-6xl text-black">
              Clear pricing across every call.
            </h2>
            <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-black/75 md:text-lg">
              No token charges. No model-provider pass-throughs. No surprise bills.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className="flex flex-col rounded-[16px] border border-black/10 bg-white overflow-hidden shadow-xs transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Header Pastel Block */}
                <div className={`p-6 ${plan.headerBg}`}>
                  <p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-black/60">
                    {plan.audience}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-black">
                    {plan.name}
                  </h3>
                  <p className="mt-1.5 min-h-[36px] text-xs font-normal leading-relaxed text-black/70">
                    {plan.description}
                  </p>
                </div>

                {/* Body Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-black">
                      {plan.price}
                    </span>
                    {plan.unit && (
                      <span className="text-xs font-semibold text-black/60">
                        {plan.unit}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 mb-6 min-h-[18px] text-xs font-medium text-black/55">
                    {plan.feeNote}
                  </p>

                  <Link
                    href="/dashboard"
                    className={`inline-flex w-full items-center justify-center rounded-full py-3 text-xs font-bold transition-all active:scale-[0.98] ${
                      plan.buttonVariant === "outline"
                        ? "border border-black/20 bg-white text-black hover:bg-black/5"
                        : "bg-black text-white hover:bg-neutral-800 shadow-sm"
                    }`}
                  >
                    {plan.action}
                  </Link>

                  <ul className="mt-7 space-y-3 font-sans">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs font-medium leading-normal text-black/80">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-black/75" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          {/* Dedicated Telephony & Calling Channel Plan */}
          <div className="mt-8 rounded-[24px] border border-black/10 bg-white p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-left">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f4ff] border border-blue-200 text-xs font-bold text-blue-700">
                <PhoneCall className="h-3.5 w-3.5" />
                <span>TELEPHONY ADD-ON PLAN</span>
              </div>
              <h3 className="text-2xl font-bold text-black tracking-tight">
                Dedicated Phone Number & Concurrent Calling Channel Plan
              </h3>
              <p className="text-sm text-black/70 font-light leading-relaxed">
                Add dedicated virtual business numbers (080, 022, 011, or 1800 Toll-Free) and dedicated multi-channel call concurrency for inbound call answering & outbound AI campaigns.
              </p>
              <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-black/80">
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#ff4b2f]" /> 1 Dedicated Business Virtual Number</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#ff4b2f]" /> Dedicated Calling Concurrency Channel</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#ff4b2f]" /> TRAI & DLT Compliant SIP Trunking</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#ff4b2f]" /> Instant Setup & Number Activation</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0 w-full sm:w-auto">
              <div className="text-left md:text-right">
                <span className="text-3xl font-extrabold text-black">₹2,000</span>
                <span className="text-xs font-semibold text-black/60"> /month</span>
                <p className="text-[11px] text-black/50 font-medium mt-0.5">Per dedicated channel & number</p>
              </div>
              <Link
                href="/dashboard/phone-numbers"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-full bg-[#ff4b2f] hover:bg-[#e63e24] text-white px-6 text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
              >
                Get Dedicated Number
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Reference-Matched 100vh Landscape Footer (Matching Home Page) */}
      <footer
        ref={footerRef}
        className="relative z-10 flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#f7f6f0] bg-cover bg-bottom bg-no-repeat text-black px-6 pt-12 pb-8 sm:px-12 sm:pt-16 sm:pb-12"
        style={{ backgroundImage: "url('/assets/footer-bg.png')" }}
      >
        <div className="mx-auto flex w-full max-w-[1340px] flex-1 flex-col justify-between">
          {/* Top Section: Brand + Clocks (Left) & Nav Links (Right) */}
          <div className="flex flex-col justify-between gap-12 md:flex-row md:items-start text-left">
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

          {/* Middle Centered Info Line */}
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
