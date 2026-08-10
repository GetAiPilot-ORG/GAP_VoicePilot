"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Bot, 
  Mic, 
  Zap, 
  Phone, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Activity, 
  Globe,
  Code2,
  PhoneCall,
  Terminal,
  Cpu,
  Layers,
  Sliders,
  Check,
  Menu,
  X,
  LogOut
} from "lucide-react";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (e) {}
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-block-lime selection:text-black">
      {/* Public Navbar */}
      <header className="sticky top-0 z-50 w-full h-[64px] border-b border-hairline bg-white/90 backdrop-blur-md">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer" title="GAP VoicePilot Home">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="GAP VoicePilot Logo" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col leading-none justify-center">
              <span className="font-bold text-base sm:text-lg tracking-tight text-black">GAP</span>
              <span className="text-[9px] sm:text-[11px] font-mono tracking-widest text-neutral-400 font-semibold uppercase mt-[1px]">VOICEPILOT</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            <a href="#features" className="px-3.5 py-1.5 rounded-[10px] text-sm font-medium text-neutral-600 hover:text-black hover:bg-surface-soft transition-all">
              Capabilities
            </a>
            <a href="#engine" className="px-3.5 py-1.5 rounded-[10px] text-sm font-medium text-neutral-600 hover:text-black hover:bg-surface-soft transition-all">
              Voice Engine
            </a>
            <a href="#pricing" className="px-3.5 py-1.5 rounded-[10px] text-sm font-medium text-neutral-600 hover:text-black hover:bg-surface-soft transition-all">
              Pricing
            </a>
            <a href="#faq" className="px-3.5 py-1.5 rounded-[10px] text-sm font-medium text-neutral-600 hover:text-black hover:bg-surface-soft transition-all">
              FAQ
            </a>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-xs font-semibold text-neutral-700 max-w-[180px] truncate" title={user.email}>
                  {user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split("@")[0] : "User")}
                </span>
                <Link href="/dashboard" className="btn-pill-primary rounded-[10px] text-xs px-5 py-2 shadow-sm hover:scale-[1.02] transition-transform">
                  Go to Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button 
                  onClick={async () => {
                    const { signOut } = await import("@/app/actions/auth");
                    await signOut();
                  }}
                  className="p-2 rounded-[10px] text-neutral-500 hover:text-red-600 hover:bg-surface-soft border border-hairline transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-pill-secondary rounded-[10px] text-xs px-4 py-2">
                  Sign In
                </Link>
                <Link href="/dashboard" className="btn-pill-primary rounded-[10px] text-xs px-5 py-2 shadow-sm hover:scale-[1.02] transition-transform">
                  Launch Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-[10px] text-neutral-700 hover:text-black hover:bg-surface-soft border border-hairline transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-hairline bg-white px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-2">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-[8px] text-sm font-medium text-neutral-800 hover:bg-surface-soft transition-colors"
              >
                Capabilities
              </a>
              <a 
                href="#engine" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-[8px] text-sm font-medium text-neutral-800 hover:bg-surface-soft transition-colors"
              >
                Voice Engine
              </a>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-[8px] text-sm font-medium text-neutral-800 hover:bg-surface-soft transition-colors"
              >
                Pricing
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-[8px] text-sm font-medium text-neutral-800 hover:bg-surface-soft transition-colors"
              >
                FAQ
              </a>
            </nav>
            <div className="pt-2 border-t border-hairline flex flex-col gap-2.5">
              {user ? (
                <>
                  <p className="text-xs text-neutral-500 font-semibold px-1 truncate">
                    {user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split("@")[0] : "User")}
                  </p>
                  <Link 
                    href="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-pill-primary rounded-[10px] text-xs w-full justify-center py-2.5"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                  <button 
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      const { signOut } = await import("@/app/actions/auth");
                      await signOut();
                    }}
                    className="btn-pill-secondary rounded-[10px] text-xs w-full justify-center py-2.5 text-red-600 border-red-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-pill-secondary rounded-[10px] text-xs w-full justify-center py-2.5"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-pill-primary rounded-[10px] text-xs w-full justify-center py-2.5"
                  >
                    Launch Dashboard
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-6 pt-10 pb-16 md:pt-24 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-soft border border-hairline">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="eyebrow text-neutral-800 text-[9px] sm:text-[11px]">// REAL-TIME VOICE AI PLATFORM</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-black leading-[1.1]">
              Autonomous Voice Agents with <span className="underline decoration-block-lime decoration-wavy decoration-2">Sub-400ms</span> Latency.
            </h1>

            <p className="text-base sm:text-xl text-neutral-600 max-w-2xl font-normal leading-relaxed">
              GAP VoicePilot powers human-like conversational AI for outbound sales, automated customer support, and instant telephony dispatch across global phone networks.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 pt-2 sm:pt-4">
              <Link href="/dashboard" className="btn-pill-primary rounded-[10px] text-sm sm:text-base px-7 py-3 text-center shadow-lg hover:scale-[1.02] transition-transform">
                {user ? "Go to Dashboard" : "Start Free Trial"}
                <ArrowRight className="w-4 h-4 ml-1 inline-block" />
              </Link>

              <Link href="/dashboard/assistants" className="btn-pill-secondary rounded-[10px] text-sm sm:text-base px-6 py-3 text-center">
                Explore Voice Assistants
              </Link>
            </div>


            {/* Badges strip */}
            <div className="pt-8 flex flex-wrap items-center gap-6 text-xs font-medium text-neutral-500 border-t border-hairline mt-8">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>&lt; 400ms Response Latency</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" />
                <span>Hindi, English & Hinglish Native</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Twilio & Plivo SIP Integration</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card / Interactive Preview */}
          <div className="lg:col-span-5">
            <div className="bg-surface-soft border border-hairline rounded-[14px] p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-black text-white flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-black">GAP Sales Agent #1</h3>
                    <p className="text-[11px] text-neutral-500">Cartesia Neural • English + Hindi</p>
                  </div>
                </div>
                <span className="eyebrow bg-block-lime text-black px-2.5 py-1 rounded-full text-[10px] border border-black/10">
                  LIVE STREAM
                </span>
              </div>

              {/* Waveform graphic */}
              <div className="bg-white border border-hairline rounded-[10px] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Audio Waveform Pipeline</span>
                  <span className="font-mono text-emerald-600 font-bold">340ms Turnaround</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 h-14 bg-surface-soft rounded-[8px] px-4">
                  {[30, 60, 90, 45, 100, 75, 40, 85, 95, 60, 80, 50, 90, 70, 40, 85, 100, 60, 30].map((height, i) => (
                    <div 
                      key={i} 
                      style={{ height: `${height}%` }} 
                      className="w-1.5 bg-black rounded-full animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Sample Dialog transcript */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white border border-hairline rounded-[10px] space-y-1">
                  <p className="text-neutral-400 font-mono text-[10px]">USER:</p>
                  <p className="text-neutral-800 font-medium font-sans">"Namaste! Can you schedule a demo call for tomorrow at 3 PM?"</p>
                </div>
                <div className="p-3 bg-block-lime/30 border border-block-lime rounded-[10px] space-y-1">
                  <p className="text-emerald-800 font-mono text-[10px]">GAP AGENT (AI):</p>
                  <p className="text-black font-semibold font-sans">"Namaste! Absolutely. I have booked your demo for tomorrow at 3 PM. Sending invite!"</p>
                </div>
              </div>

              <Link href="/dashboard" className="btn-pill-primary rounded-[10px] w-full text-xs justify-center py-2.5">
                Launch Console & Test Live Agent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DESIGN.md Color Block Capabilities Grid */}
      <section id="features" className="max-w-[1340px] mx-auto px-6 py-16 space-y-8">
        <div className="space-y-2">
          <p className="eyebrow text-neutral-500">// ARCHITECTURE & CAPABILITIES</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black">
            Engineered for Production Voice Operations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lime Block */}
          <div className="bg-block-lime rounded-[14px] p-8 text-black border border-black/5 flex flex-col justify-between h-auto min-h-[300px] shadow-sm hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-black/70">01. STREAMING ENGINE</span>
              <div className="w-10 h-10 rounded-[10px] bg-black text-white flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-3 mt-8">
              <h3 className="text-2xl font-bold tracking-tight">Ultra-Low Latency WebSocket Pipeline</h3>
              <p className="text-black/80 text-sm leading-relaxed">
                Seamless full-duplex WebSocket stream linking Deepgram STT, Groq/OpenAI LLM, and Cartesia/ElevenLabs TTS for instantaneous responses.
              </p>
            </div>
          </div>

          {/* Lilac Block */}
          <div className="bg-block-lilac rounded-[14px] p-8 text-black border border-black/5 flex flex-col justify-between h-auto min-h-[300px] shadow-sm hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-black/70">02. MULTI-LINGUAL VOICE</span>
              <div className="w-10 h-10 rounded-[10px] bg-black text-white flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-3 mt-8">
              <h3 className="text-2xl font-bold tracking-tight">Native Hindi, English & Hinglish Speech</h3>
              <p className="text-black/80 text-sm leading-relaxed">
                Bilingual voice agents capable of switching languages dynamically during live calls with regional accent support.
              </p>
            </div>
          </div>

          {/* Mint Block */}
          <div className="bg-block-mint rounded-[14px] p-8 text-black border border-black/5 flex flex-col justify-between h-auto min-h-[300px] shadow-sm hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-black/70">03. TELEPHONY CPaaS</span>
              <div className="w-10 h-10 rounded-[10px] bg-black text-white flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-3 mt-8">
              <h3 className="text-2xl font-bold tracking-tight">1-Click Phone Number Binding</h3>
              <p className="text-black/80 text-sm leading-relaxed">
                Connect virtual phone numbers directly via Twilio, Plivo, or custom SIP trunks for inbound support & outbound campaigns.
              </p>
            </div>
          </div>

          {/* Navy Block */}
          <div className="bg-block-navy rounded-[14px] p-8 text-white border border-black/10 flex flex-col justify-between h-auto min-h-[300px] shadow-sm hover:scale-[1.01] transition-transform">
            <div className="flex items-center justify-between">
              <span className="eyebrow text-white/70">04. CAMPAIGN AUTOMATION</span>
              <div className="w-10 h-10 rounded-[10px] bg-block-lime text-black flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-3 mt-8">
              <h3 className="text-2xl font-bold tracking-tight text-block-lime">High-Concurrency Outbound Dispatcher</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Dispatch thousands of concurrent AI calls automatically with retry logic, live call transcripts, and sentiment analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - DESIGN.md Lilac Block */}
      <section id="pricing" className="max-w-[1340px] mx-auto px-6 py-12">
        <div className="bg-block-lilac rounded-[24px] p-8 md:p-14 text-black border border-black/5 shadow-sm space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              <p className="eyebrow text-black/70 font-mono">PRICING</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-black leading-none">
                Simple pricing,<br />no surprises.
              </h2>
            </div>
            <p className="text-black/80 text-sm max-w-sm leading-relaxed">
              Start for free and scale as your volume grows. Every plan includes unlimited agents and full analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* CALL LITE */}
            <div className="bg-[#f3ebfc] rounded-[14px] p-8 flex flex-col justify-between space-y-6 border border-black/5">
              <div className="space-y-4">
                <p className="eyebrow text-neutral-600 font-mono tracking-wider">CALL LITE</p>
                <div>
                  <span className="text-4xl md:text-5xl font-bold text-black">₹1,499</span>
                  <span className="text-sm font-normal text-neutral-600">/mo</span>
                </div>
                <hr className="border-black/10" />
                <ul className="space-y-3 text-xs text-neutral-800 font-medium">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> 1 Dedicated Business Number</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> 1 Calling Channel</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> 100 AI Calling Minutes Included</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> Hindi and English Voice Agent</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> Custom AI Voice Prompt</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> Basic Lead Capture</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> Call History</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> Email Reporting</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> Extra Calling Minutes @ ₹5/min</li>
                </ul>
              </div>
              <Link href="/dashboard" className="w-full bg-[#1e1b36] hover:bg-black text-white py-3 rounded-full text-center text-xs font-semibold block transition-colors">
                Get Started
              </Link>
            </div>

            {/* CALL PRO (Black Featured Card) */}
            <div className="bg-black text-white rounded-[14px] p-8 flex flex-col justify-between space-y-6 shadow-xl relative">
              <div className="space-y-4">
                <p className="eyebrow text-neutral-400 font-mono tracking-wider">CALL PRO</p>
                <div>
                  <span className="text-4xl md:text-5xl font-bold text-white">₹2,999</span>
                  <span className="text-sm font-normal text-neutral-400">/mo</span>
                </div>
                <hr className="border-neutral-800" />
                <ul className="space-y-3 text-xs text-neutral-200 font-medium">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-white shrink-0" /> 1 Dedicated Business Number</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-white shrink-0" /> 1 Calling Channel</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-white shrink-0" /> 500 AI Calling Minutes Included</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Hindi and English Voice Agent</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-white shrink-0" /> CRM Auto-Updating</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Live Call Transfer</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Call Recording</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Real-Time Dashboard</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Advanced AI Personalization</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-white shrink-0" /> Extra Calling Minutes @ ₹4/min</li>
                </ul>
              </div>
              <Link href="/dashboard" className="w-full bg-white text-black hover:bg-neutral-100 py-3 rounded-full text-center text-xs font-semibold block transition-colors">
                Get Started
              </Link>
            </div>

            {/* CALL ELITE */}
            <div className="bg-[#f3ebfc] rounded-[14px] p-8 flex flex-col justify-between space-y-6 border border-black/5">
              <div className="space-y-4">
                <p className="eyebrow text-neutral-600 font-mono tracking-wider">CALL ELITE</p>
                <div>
                  <span className="text-4xl md:text-5xl font-bold text-black">₹7,999</span>
                  <span className="text-sm font-normal text-neutral-600">/mo</span>
                </div>
                <hr className="border-black/10" />
                <ul className="space-y-3 text-xs text-neutral-800 font-medium">
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> 1 Dedicated Business Number</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> 1 Dedicated Calling Channel</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> 2000 AI Calling Minutes Included</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> Multiple AI Agent Workflows</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> Advanced CRM Integration</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> Custom Workflow Triggers</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> Call Recording and Analytics</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> Priority Support</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> Account Manager</li>
                  <li className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-black shrink-0" /> Extra Calling Minutes @ ₹3/min</li>
                </ul>
              </div>
              <Link href="/dashboard" className="w-full bg-[#1e1b36] hover:bg-black text-white py-3 rounded-full text-center text-xs font-semibold block transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-[1340px] mx-auto px-6 py-16 space-y-8 border-t border-hairline">
        <div className="space-y-2">
          <p className="eyebrow text-neutral-500">// FREQUENTLY ASKED QUESTIONS</p>
          <h2 className="text-3xl font-bold tracking-tight text-black">Everything you need to know</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-surface-soft p-6 rounded-[14px] border border-hairline space-y-2">
            <h3 className="font-bold text-black">Can I test GAP VoicePilot without logging in?</h3>
            <p className="text-neutral-600 text-xs leading-relaxed">
              Yes! The landing page is public. You can inspect features, documentation, and pricing. To configure agents and trigger calls, access the Dashboard console.
            </p>
          </div>

          <div className="bg-surface-soft p-6 rounded-[14px] border border-hairline space-y-2">
            <h3 className="font-bold text-black">How low is the voice response latency?</h3>
            <p className="text-neutral-600 text-xs leading-relaxed">
              End-to-end conversation latency is typically under 340ms-400ms using our direct WebSocket streaming pipeline with Cartesia and Groq.
            </p>
          </div>

          <div className="bg-surface-soft p-6 rounded-[14px] border border-hairline space-y-2">
            <h3 className="font-bold text-black">Are Hindi and Indian accents supported?</h3>
            <p className="text-neutral-600 text-xs leading-relaxed">
              Yes, GAP VoicePilot natively supports Hindi, Indian English, and Hinglish with high-accuracy speech synthesis and recognition.
            </p>
          </div>

          <div className="bg-surface-soft p-6 rounded-[14px] border border-hairline space-y-2">
            <h3 className="font-bold text-black">Can I connect my existing Twilio or Plivo account?</h3>
            <p className="text-neutral-600 text-xs leading-relaxed">
              Yes, you can bind your existing phone numbers or SIP trunks directly in the Phone Numbers settings inside the dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline bg-white py-12">
        <div className="max-w-[1340px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] overflow-hidden shrink-0">
              <Image src="/logo.png" alt="GAP Logo" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col leading-none justify-center">
              <span className="font-bold text-sm tracking-tight text-black">GAP</span>
              <span className="text-[10px] font-mono tracking-widest text-neutral-400 font-semibold uppercase mt-[1px]">VOICEPILOT</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-black transition-colors">Dashboard</Link>
            <Link href="/dashboard/assistants" className="hover:text-black transition-colors">Assistants</Link>
            <Link href="/dashboard/calls" className="hover:text-black transition-colors">Call Logs</Link>
            <Link href="/dashboard/billing" className="hover:text-black transition-colors">Plans & Billing</Link>
          </div>
          <p>© 2026 GAP VoicePilot Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
