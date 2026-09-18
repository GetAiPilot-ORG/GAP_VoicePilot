"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  RefreshCw,
  Plus,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  Headphones,
  ExternalLink,
  Shield,
  X,
  AlertCircle,
  Megaphone,
  ArrowUpRight,
  Bot,
  Activity,
  Sliders,
  Check,
  ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface WhatsAppNumberItem {
  id: string;
  phoneNumber: string;
  displayName: string;
  status: string;
  assignedAgentId: string | null;
  assignedAgentName: string;
  events: string[];
  callingEnabled: boolean;
  connectedAt: string;
}

export interface AssistantOption {
  id: string;
  name: string;
  provider_resource_id?: string;
}

interface WhatsAppClientProps {
  initialNumbers: WhatsAppNumberItem[];
  assistants: AssistantOption[];
}

export default function WhatsAppClient({ initialNumbers, assistants }: WhatsAppClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"numbers" | "campaigns">("numbers");
  const [numbers, setNumbers] = useState<WhatsAppNumberItem[]>(initialNumbers);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Connect Modal Form State
  const [connectStep, setConnectStep] = useState<"instructions" | "form">("instructions");
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>(assistants[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate connection setup & refresh
      await new Promise(r => setTimeout(r, 1200));
      setConnectSuccess(true);
      setTimeout(() => {
        setIsConnectModalOpen(false);
        setConnectSuccess(false);
        router.refresh();
      }, 1500);
    } catch (e) {
      alert("Failed to submit WhatsApp connection request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-black">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-black">WhatsApp</h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                CLOUD ENGINE
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-1 max-w-2xl leading-relaxed">
              Connect a WhatsApp Business number and pick the agent that answers calls to it — then use it to call a list of people, once they have allowed it.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-pill-secondary text-xs px-3.5 py-2 font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-soft transition-colors flex-1 sm:flex-none cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="btn-pill-primary text-xs px-4 py-2 font-bold flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] transition-transform bg-emerald-600 hover:bg-emerald-700 text-white border-transparent flex-1 sm:flex-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Connect WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-hairline text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab("numbers")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "numbers"
              ? "border-emerald-600 text-emerald-700 font-bold"
              : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          <span className="font-mono text-neutral-400">#</span>
          WhatsApp numbers
          {numbers.length > 0 && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono px-1.5 py-0.2 rounded-full">
              {numbers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("campaigns")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "campaigns"
              ? "border-emerald-600 text-emerald-700 font-bold"
              : "border-transparent text-neutral-500 hover:text-black"
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-neutral-500" />
          Campaigns
        </button>
      </div>

      {/* 3-Step Guide Banner (Matching Reference) */}
      <div className="bg-emerald-950 text-white rounded-[14px] p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border border-emerald-900 shadow-sm">
        {/* Step 1 */}
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-700">
            1
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Connect</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-0.5 leading-relaxed">
              Sign in with Meta and pick your WhatsApp Business number.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-700">
            2
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Assign an agent</span>
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-0.5 leading-relaxed">
              Choose which of your agents answers calls to that number.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-700">
            3
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Take calls</span>
              <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-0.5 leading-relaxed">
              Customers call your number in WhatsApp and the agent picks up.
            </p>
          </div>
        </div>
      </div>

      {/* TAB 1: WHATSAPP NUMBERS TABLE & EMPTY STATE */}
      {activeTab === "numbers" && (
        <div className="bg-white border border-hairline rounded-[14px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-hairline bg-surface-soft text-black/70 text-[11px] font-mono uppercase tracking-wider">
                  <th className="py-3 px-5">NUMBER</th>
                  <th className="py-3 px-5">STATUS</th>
                  <th className="py-3 px-5">AGENT</th>
                  <th className="py-3 px-5">EVENTS</th>
                  <th className="py-3 px-5">CALLING</th>
                  <th className="py-3 px-5">CONNECTED</th>
                  <th className="py-3 px-5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-xs">
                {numbers.length > 0 ? (
                  numbers.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-soft/60 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-black flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item.phoneNumber}</span>
                        {item.displayName && (
                          <span className="text-[11px] font-normal text-neutral-500 font-sans">
                            ({item.displayName})
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="inline-flex items-center gap-1.5 bg-surface-soft px-2.5 py-1 rounded-[6px] border border-hairline font-semibold">
                          <Bot className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.assignedAgentName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-neutral-600 font-mono text-[11px]">
                        Inbound / Outbound
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-emerald-700 font-semibold text-[11px]">Enabled</span>
                      </td>
                      <td className="py-4 px-5 text-neutral-500 font-mono text-[11px]">
                        {new Date(item.connectedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/dashboard/assistants/${item.assignedAgentId || ""}`}
                          className="text-xs font-semibold text-neutral-700 hover:text-black hover:underline"
                        >
                          Configure
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-neutral-500 bg-white">
                      <div className="max-w-md mx-auto space-y-3 flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-1">
                          <MessageSquare className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-black">No WhatsApp number connected</h3>
                        <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
                          Connect your WhatsApp Business number to let an agent handle incoming and outbound voice calls to it.
                        </p>
                        <button
                          onClick={() => setIsConnectModalOpen(true)}
                          className="btn-pill-primary text-xs px-5 py-2.5 font-bold inline-flex items-center gap-2 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Connect WhatsApp
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: WHATSAPP CAMPAIGNS */}
      {activeTab === "campaigns" && (
        <div className="bg-white border border-hairline rounded-[14px] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-black">WhatsApp Voice Campaigns</h2>
              <p className="text-xs text-neutral-500">Automate outbound voice conversations directly through WhatsApp to opted-in contact lists.</p>
            </div>
            <Link
              href="/dashboard/campaigns/create"
              className="btn-pill-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              New WhatsApp Campaign
            </Link>
          </div>

          <div className="border border-dashed border-hairline rounded-[12px] p-12 text-center space-y-3">
            <Megaphone className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="font-bold text-sm text-black">No Active WhatsApp Campaigns</p>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Broadcast personalized AI phone calls to your customer segments over WhatsApp with automated transcript recording.
            </p>
          </div>
        </div>
      )}

      {/* CONNECT WHATSAPP MODAL */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-black/10 rounded-[18px] max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp text-black text-left">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-black">Connect WhatsApp Business</h3>
                  <p className="text-xs text-neutral-500">Cloud API Integration with Meta WABA</p>
                </div>
              </div>

              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-surface-soft transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {connectSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-[12px]">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-bold text-emerald-950 text-sm">Connection Request Submitted</h4>
                <p className="text-xs text-emerald-800">
                  Your WhatsApp Business number is being synchronized. You will be able to assign agents immediately.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConnectSubmit} className="space-y-4">
                <div className="bg-surface-soft rounded-[12px] p-3.5 border border-hairline text-xs space-y-2 text-neutral-700">
                  <p className="font-bold text-black flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Meta Official Cloud Onboarding
                  </p>
                  <p className="text-[11px] leading-relaxed text-neutral-600">
                    Enter your dedicated phone number to register under WhatsApp Business API. Ensure the number is not actively bound to a personal WhatsApp phone app.
                  </p>
                </div>

                {/* Business Display Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">
                    WhatsApp Business Display Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. VoicePilot Customer Support"
                    className="w-full px-3.5 py-2.5 text-xs bg-surface-soft border border-hairline rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black"
                    required
                  />
                </div>

                {/* WhatsApp Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">
                    WhatsApp Phone Number (with country code)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 88394 95434"
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-surface-soft border border-hairline rounded-[10px] focus:outline-none focus:ring-1 focus:ring-black"
                    required
                  />
                </div>

                {/* Assign AI Voice Assistant */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black uppercase tracking-wider">
                    Default Answering Assistant
                  </label>
                  <div className="relative">
                    <select
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold bg-surface-soft border border-hairline rounded-[10px] appearance-none focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      {assistants.map((ast) => (
                        <option key={ast.id} value={ast.id}>
                          {ast.name} (Active Agent)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsConnectModalOpen(false)}
                    className="flex-1 py-2.5 rounded-[10px] border border-hairline text-xs font-semibold hover:bg-surface-soft text-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[10px] text-xs font-bold py-2.5 shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Connect & Verify
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
