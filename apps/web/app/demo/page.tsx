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
  X
} from "lucide-react";
import { submitDemoInquiry } from "@/app/actions/demo";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { label: "Product", href: "/product" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Workflow", href: "/#workflow" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
];

const SERVICE_OPTIONS = [
  "Sales & Lead Qualification Voice Agents",
  "Customer Support & Handoff Automation",
  "Inbound Call Routing & AI Answering",
  "Outbound Bulk Phone Campaigns",
  "Custom AI Voice Workflows & Integrations"
];

const TIME_SLOTS = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
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

export default function DemoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
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

      {/* Main Demo Inquiry Hero Section */}
      <main className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
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
      </main>

      {/* Footer */}
      <footer ref={footerRef}>
        <RuixenGradientFooter />
      </footer>
    </div>
  );
}
