"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AssistantSelect } from "./components/AssistantSelect";
import {
  Phone,
  Plus,
  RefreshCw,
  UserX,
  CheckCircle2,
  X,
  ShoppingBag,
  Search,
  Globe,
  Wallet,
  Check,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Download,
  AlertCircle,
  Copy,
  Zap,
  Inbox,
  UploadCloud,
  FileText,
  Building2,
  HelpCircle,
  Activity
} from "lucide-react";

export interface PhoneNumberRecord {
  id: string;
  phone_number: string;
  provider: string;
  provider_resource_id: string;
  assigned_assistant_id?: string | null;
  assistants?: {
    id: string;
    name: string;
  } | null;
  status: "active" | "unassigned" | "purchased";
  created_at: string;
}

export interface KycRecord {
  id: string;
  workspace_id: string;
  business_name: string;
  use_case: string;
  status: "pending" | "approved" | "rejected";
  assigned_number?: string | null;
  created_at: string;
}

export interface AssistantOption {
  id: string;
  name: string;
}

interface PhoneNumbersClientProps {
  initialMyNumbers: PhoneNumberRecord[];
  initialKyc: KycRecord | null;
  assistants: AssistantOption[];
  workspaceBalance: number;
}

export function PhoneNumbersClient({
  initialMyNumbers,
  initialKyc,
  assistants,
  workspaceBalance: initialBalance
}: PhoneNumbersClientProps) {
  const [activeTab, setActiveTab] = React.useState<"my-numbers" | "buy-numbers">("my-numbers");

  const [myNumbers, setMyNumbers] = React.useState<PhoneNumberRecord[]>(initialMyNumbers);
  const [kycStatus, setKycStatus] = React.useState<KycRecord | null>(initialKyc);
  const [balance, setBalance] = React.useState<number>(initialBalance);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isSubmittingKyc, setIsSubmittingKyc] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const [toastMessage, setToastMessage] = React.useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const handleCopyNumber = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAssignAssistant = async (numberId: string, assistantId: string) => {
    try {
      const { assignPhoneNumberAction } = await import("@/app/actions/phoneNumbers");
      const res = await assignPhoneNumberAction(numberId, assistantId === "none" ? null : assistantId);
      
      if (res.success) {
        setMyNumbers((prev) =>
          prev.map((num) => {
            if (num.id === numberId) {
              const selectedAst = assistants.find((a) => a.id === assistantId);
              return {
                ...num,
                assigned_assistant_id: assistantId === "none" ? null : assistantId,
                assistants: assistantId === "none" || !selectedAst ? null : { id: selectedAst.id, name: selectedAst.name },
                status: assistantId === "none" ? "unassigned" : "active"
              };
            }
            return num;
          })
        );
        setToastMessage({
          type: 'success',
          text: assistantId === "none" ? "Phone number unassigned successfully." : "Assistant bound to phone number successfully."
        });
      } else {
        alert("Failed to update assignment: " + res.error);
      }
    } catch (e: any) {
      setToastMessage({
        type: 'error',
        text: "Failed to update assignment: " + e.message
      });
    }
  };

  // Fetch Vomyra Numbers via API
  const handleFetchVomyraNumbers = async () => {
    setIsFetching(true);
    setToastMessage(null);
    try {
      const { fetchAndSyncVomyraNumbersAction } = await import("@/app/actions/phoneNumbers");
      const res = await fetchAndSyncVomyraNumbersAction();
      
      if (res.myNumbers) setMyNumbers(res.myNumbers);

      if (res.fetchedNumbersCount && res.fetchedNumbersCount > 0) {
        setToastMessage({
          type: 'success',
          text: `Fetched & synchronized ${res.fetchedNumbersCount} phone number(s) to workspace!`
        });
      } else {
        setToastMessage({
          type: 'info',
          text: "No assigned phone numbers found in your account."
        });
      }
    } catch (e: any) {
      setToastMessage({
        type: 'error',
        text: "Failed to fetch phone numbers: " + e.message
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingKyc(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const { submitKycRequest } = await import("@/app/actions/kyc");
      const res = await submitKycRequest(formData);

      if (res.success) {
        setToastMessage({ type: 'success', text: 'KYC submitted successfully. Awaiting admin review.' });
        setKycStatus({
          id: 'temp',
          workspace_id: 'temp',
          business_name: formData.get('businessName') as string,
          use_case: formData.get('useCase') as string,
          status: 'pending',
          created_at: new Date().toISOString()
        });
      } else {
        setToastMessage({ type: 'error', text: res.error || 'Failed to submit KYC' });
      }
    } catch (err: any) {
      setToastMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  const totalMyNumbers = myNumbers.length;
  const activeMyNumbers = myNumbers.filter((n) => n.assigned_assistant_id).length;
  const unassignedMyNumbers = totalMyNumbers - activeMyNumbers;

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`flex items-center justify-between rounded-xl border p-4 text-xs font-semibold shadow-lg backdrop-blur-sm transition-all duration-200 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950'
            : toastMessage.type === 'info'
            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-950'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-950'
        }`}>
          <div className="flex items-center gap-3">
            {toastMessage.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
            {toastMessage.type === 'info' && <Download className="h-5 w-5 text-indigo-600 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 rounded-lg hover:bg-black/5 text-neutral-500 hover:text-black transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-hairline pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="eyebrow text-neutral-500">// PHONE NUMBERS</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Gateway
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Phone Numbers</h1>
          <p className="text-sm text-neutral-600 max-w-xl">
            Bind virtual phone lines directly to your GAP AI Voice Assistants for instant inbound & outbound calling.
          </p>
        </div>

        {/* Balance & API Fetch Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 px-4 py-2.5 rounded-xl text-xs shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-700 font-bold">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-neutral-500 text-[11px] block leading-none">AI Calling Balance</span>
              <span className="font-bold text-neutral-900 font-mono text-sm leading-tight block mt-0.5">
                {Math.floor(balance).toLocaleString()} <span className="text-xs font-sans font-medium text-neutral-500">Mins</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="inline-flex p-1 bg-surface-soft border border-hairline rounded-xl gap-1">
        <button
          onClick={() => setActiveTab("my-numbers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "my-numbers"
              ? "bg-white text-black shadow-sm border border-black/5"
              : "text-neutral-600 hover:text-black hover:bg-white/50"
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          <span>My Numbers</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeTab === 'my-numbers' ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
            {totalMyNumbers}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("buy-numbers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "buy-numbers"
              ? "bg-white text-black shadow-sm border border-black/5"
              : "text-neutral-600 hover:text-black hover:bg-white/50"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Request Number (KYC)</span>
          {kycStatus && (
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] uppercase font-mono font-semibold ${
              kycStatus.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
              kycStatus.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {kycStatus.status}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: MY NUMBERS */}
      {activeTab === "my-numbers" && (
        <div className="space-y-6">
          {/* Status Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Numbers */}
            <div className="p-5 rounded-2xl bg-white border border-hairline shadow-sm hover:border-black/20 transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Purchased Lines</span>
                <div className="w-8 h-8 rounded-xl bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white transition-colors flex items-center justify-center text-neutral-700">
                  <Phone className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black tracking-tight text-neutral-900">{totalMyNumbers}</span>
                <p className="text-[11px] text-neutral-500 mt-1">Total active phone lines in pool</p>
              </div>
            </div>

            {/* Active / Assigned */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 border border-emerald-200/80 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Active / Assigned</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center text-emerald-700">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-emerald-950">{activeMyNumbers}</span>
                  {activeMyNumbers > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/60 text-emerald-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Bound & Ready
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-800/80 mt-1">Bound to AI Voice Assistant bots</p>
              </div>
            </div>

            {/* Unassigned Pool */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 to-purple-100/30 border border-purple-200/80 shadow-sm hover:border-purple-300 transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-800">Unassigned Pool</span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center text-purple-700">
                  <Inbox className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black tracking-tight text-purple-950">{unassignedMyNumbers}</span>
                <p className="text-[11px] text-purple-800/80 mt-1">Available lines ready for assignment</p>
              </div>
            </div>
          </div>

          {/* Numbers Table Card */}
          <div className="bg-white border border-hairline rounded-2xl overflow-hidden shadow-sm">
            {myNumbers.length === 0 ? (
              <div className="p-10 sm:p-16 text-center space-y-4">
                {(!kycStatus || kycStatus.status !== 'approved') ? (
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-neutral-900">Identity Verification Required</h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        To purchase or assign virtual phone numbers to your workspace assistants, please complete your quick business KYC submission.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => setActiveTab("buy-numbers")}
                        className="btn-pill-primary bg-neutral-900 hover:bg-black text-white text-xs px-5 py-2.5 inline-flex items-center gap-2 rounded-xl shadow-md transition-all"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Complete KYC Verification</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-neutral-900">No Phone Numbers Found</h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Your KYC is approved! Please request a new line or contact support.
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-center gap-3">
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-surface-soft/80 text-neutral-500 uppercase tracking-wider font-mono font-semibold border-b border-hairline">
                    <tr>
                      <th className="px-6 py-4">Phone Line</th>
                      <th className="px-6 py-4">Provider</th>
                      <th className="px-6 py-4">Assigned AI Assistant</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {myNumbers.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors group">
                        {/* Phone Number */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-neutral-100 group-hover:bg-black group-hover:text-white text-neutral-700 transition-colors flex items-center justify-center shrink-0">
                              <Phone className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-mono font-bold text-neutral-900 text-sm tracking-tight">
                              {item.phone_number}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyNumber(item.phone_number, item.id)}
                              title="Copy Phone Number"
                              className="p-1 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-200/50 transition-colors ml-1"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Provider */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase bg-surface-soft border border-hairline text-neutral-800">
                            <Globe className="w-3 h-3 text-neutral-400" />
                            {item.provider}
                          </span>
                        </td>

                        {/* Assigned Assistant Dropdown */}
                        <td className="px-6 py-4">
                          <AssistantSelect
                            value={item.assigned_assistant_id || "none"}
                            assistants={assistants}
                            onSelect={(assistantId) => handleAssignAssistant(item.id, assistantId)}
                          />
                        </td>

                        {/* Status Tag */}
                        <td className="px-6 py-4">
                          {item.assigned_assistant_id ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-neutral-100 text-neutral-600 border border-hairline">
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          {item.assigned_assistant_id ? (
                            <button
                              onClick={() => handleAssignAssistant(item.id, "none")}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all inline-flex items-center gap-1"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Unassign</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-neutral-400 font-medium">No actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REQUEST NUMBER KYC */}
      {activeTab === "buy-numbers" && (
        <div className="max-w-2xl">
          {kycStatus ? (
            <div className="p-8 bg-white border border-hairline rounded-2xl text-center space-y-5 shadow-sm">
              {kycStatus.status === 'pending' && (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                    <ShieldCheck className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-neutral-900">KYC Verification in Progress</h3>
                    <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                      Your identity document and business details are currently under review by our admin team. Dedicated phone lines will be provisioned upon approval.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-semibold">
                    <Activity className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    <span>Status: Pending Review</span>
                  </div>
                </div>
              )}
              {kycStatus.status === 'approved' && (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-neutral-900">KYC Verification Approved</h3>
                    <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                      Your business identity is fully verified! You can sync or manage your assigned phone numbers in the "My Numbers" tab.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("my-numbers")}
                    className="btn-pill-primary bg-neutral-900 hover:bg-black text-white text-xs px-5 py-2.5 inline-flex items-center gap-2 rounded-xl shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Go to My Numbers</span>
                  </button>
                </div>
              )}
              {kycStatus.status === 'rejected' && (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-neutral-900">Verification Rejected</h3>
                    <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                      Unfortunately, your identity verification request could not be processed. Please reach out to support for assistance.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleKycSubmit} className="space-y-6 bg-white border border-hairline rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="space-y-2 border-b border-hairline pb-4">
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Business Identity Verification (KYC)
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Regulatory compliance requires business verification before virtual phone numbers can be provisioned.
                </p>
              </div>

              <div className="space-y-4">
                {/* Business Name */}
                <div className="space-y-1.5">
                  <label htmlFor="businessName" className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                    Business / Entity Name
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    required
                    className="w-full px-3.5 py-2.5 bg-surface-soft border border-hairline rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all placeholder:text-neutral-400 font-medium"
                    placeholder="Acme Voice Solutions Corp"
                  />
                </div>

                {/* Purpose */}
                <div className="space-y-1.5">
                  <label htmlFor="useCase" className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
                    Intended Use Case
                  </label>
                  <textarea
                    id="useCase"
                    name="useCase"
                    required
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-surface-soft border border-hairline rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all placeholder:text-neutral-400 font-medium resize-none"
                    placeholder="E.g., Inbound customer support automation, outbound sales lead qualification."
                  ></textarea>
                </div>

                {/* Document Upload Dropzone */}
                <div className="space-y-1.5">
                  <label htmlFor="document" className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-neutral-500" />
                    Upload ID / Business Registration Document
                  </label>
                  <div className="border-2 border-dashed border-hairline hover:border-black/30 rounded-xl p-6 text-center bg-surface-soft/50 hover:bg-white transition-all cursor-pointer relative">
                    <input
                      type="file"
                      id="document"
                      name="document"
                      required
                      accept=".pdf,image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-neutral-800">
                      Click to upload <span className="font-normal text-neutral-500">or drag and drop</span>
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-1">PDF, PNG, JPG (Government ID or Company Certificate)</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingKyc}
                  className="btn-pill-primary w-full justify-center flex items-center gap-2 px-5 py-3 text-xs font-bold shadow-md rounded-xl bg-neutral-900 hover:bg-black text-white transition-all disabled:opacity-50"
                >
                  {isSubmittingKyc ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>{isSubmittingKyc ? "Submitting Request..." : "Submit KYC Verification"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
