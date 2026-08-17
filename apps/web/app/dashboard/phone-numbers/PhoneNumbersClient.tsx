"use client";

import * as React from "react";
import { AssistantSelect } from "./components/AssistantSelect";
import {
  Phone,
  RefreshCw,
  UserX,
  CheckCircle2,
  X,
  Globe,
  Wallet,
  Check,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Copy,
  Zap,
  Inbox,
  Activity,
  ExternalLink,
  Lock,
  Fingerprint,
  Download,
  ShieldAlert
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
  current_period_end?: string | null;
}

export interface KycRecord {
  id: string;
  workspace_id: string;
  business_name: string;
  use_case: string;
  status: "pending" | "approved" | "rejected";
  assigned_number?: string | null;
  created_at: string;
  pan_verified?: boolean | null;
  digilocker_verified?: boolean | null;
  verified_pan_name?: string | null;
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
  dedicatedNumberEntitlements: number;
  initialSubscription?: any;
}

export function PhoneNumbersClient({
  initialMyNumbers,
  initialKyc,
  assistants,
  workspaceBalance: initialBalance,
  dedicatedNumberEntitlements: initialEntitlements,
  initialSubscription
}: PhoneNumbersClientProps) {
  const [activeTab, setActiveTab] = React.useState<"my-numbers" | "buy-numbers">("my-numbers");

  const [myNumbers, setMyNumbers] = React.useState<PhoneNumberRecord[]>(initialMyNumbers);
  const [kycStatus, setKycStatus] = React.useState<KycRecord | null>(initialKyc);
  const [balance, setBalance] = React.useState<number>(initialBalance);
  const [dedicatedNumberEntitlements, setDedicatedNumberEntitlements] = React.useState<number>(initialEntitlements || 0);
  const [subscription, setSubscription] = React.useState<any>(initialSubscription);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isClaiming, setIsClaiming] = React.useState(false);
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

  const handleClaimNumber = async () => {
    setIsClaiming(true);
    setToastMessage(null);
    try {
      const { claimPhoneNumberAction } = await import("@/app/actions/phoneNumbers");
      const res = await claimPhoneNumberAction();
      
      if (res.success) {
        setToastMessage({ type: 'success', text: 'Number claimed successfully!' });
        if (res.newNumber) {
          setMyNumbers(prev => [res.newNumber, ...prev]);
        }
        // Force reload to update entitlements
        window.location.reload();
      } else {
        setToastMessage({ type: 'error', text: res.error || 'Failed to claim number' });
      }
    } catch (e: any) {
      setToastMessage({ type: 'error', text: 'Error claiming number: ' + e.message });
    } finally {
      setIsClaiming(false);
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

  const totalMyNumbers = myNumbers.length;
  const expiredNumbersCount = myNumbers.filter(
    (n) => n.current_period_end && new Date(n.current_period_end).getTime() <= Date.now()
  ).length;
  const activeMyNumbers = myNumbers.filter(
    (n) => n.assigned_assistant_id && (!n.current_period_end || new Date(n.current_period_end).getTime() > Date.now())
  ).length;
  const unassignedMyNumbers = myNumbers.filter(
    (n) => !n.assigned_assistant_id && (!n.current_period_end || new Date(n.current_period_end).getTime() > Date.now())
  ).length;

  const isKycFullySubmitted = kycStatus && (
    kycStatus.status === 'approved' || 
    kycStatus.status === 'rejected' || 
    (kycStatus.status === 'pending' && kycStatus.digilocker_verified)
  );

  const isPlanExpired = Boolean(
    subscription &&
    new Date(subscription.current_period_end).getTime() <= Date.now()
  );

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
          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs shadow-xs border ${
            isPlanExpired 
              ? "bg-rose-50 border-rose-200 text-rose-950" 
              : "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20"
          }`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold ${
              isPlanExpired ? "bg-rose-200 text-rose-700" : "bg-amber-500/15 text-amber-700"
            }`}>
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-neutral-500 text-[11px] block leading-none">AI Calling Balance</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-bold text-neutral-900 font-mono text-sm leading-tight block">
                  {Math.floor(balance).toLocaleString()} <span className="text-xs font-sans font-medium text-neutral-500">Mins</span>
                </span>
                {isPlanExpired && (
                  <span className="text-[10px] font-bold text-rose-600 ml-1">(Plan Expired)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expired Plan Alert Banner */}
      {isPlanExpired && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 shadow-inner">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-rose-950 text-sm">
                Your {subscription?.plans?.name || "Starter"} Plan has Expired
              </p>
              <p className="text-rose-800 text-[11px] mt-0.5">
                Your wallet balance of <strong>{Math.floor(balance).toLocaleString()} AI Mins</strong> is preserved. Renew your 30-day plan to keep your dedicated lines and voice agents fully active.
              </p>
            </div>
          </div>
          <a
            href="/dashboard/billing"
            className="btn-pill-primary bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 py-2 shrink-0 inline-flex items-center gap-1.5 font-bold shadow-xs"
          >
            <span>Renew Plan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Expired Dedicated Numbers Alert Banner */}
      {expiredNumbersCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-medium animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 shadow-inner">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-rose-950 text-sm">
                {expiredNumbersCount} Dedicated Phone Line{expiredNumbersCount > 1 ? 's' : ''} Expired
              </p>
              <p className="text-rose-800 text-[11px] mt-0.5">
                Your dedicated business line has reached its 30-day validity. Renew your dedicated number to maintain active inbound and outbound calls.
              </p>
            </div>
          </div>
          <a
            href="/dashboard/billing"
            className="btn-pill-primary bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 py-2 shrink-0 inline-flex items-center gap-1.5 font-bold shadow-xs"
          >
            <span>Renew Number</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

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
          {isKycFullySubmitted && kycStatus && (
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
          <div className={`grid grid-cols-1 ${expiredNumbersCount > 0 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
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
                <p className="text-[11px] text-neutral-500 mt-1">Total dedicated phone lines in pool</p>
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

            {/* Expired Lines Metric (if any) */}
            {expiredNumbersCount > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/80 to-rose-100/30 border border-rose-200/80 shadow-sm hover:border-rose-300 transition-all flex flex-col justify-between group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Expired Lines</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-colors flex items-center justify-center text-rose-700">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tight text-rose-950">{expiredNumbersCount}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200/80 text-rose-900">
                      Needs Renewal
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-800/80 mt-1">Validity ended; renew to re-activate</p>
                </div>
              </div>
            )}

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

          {/* Paid Entitlements Ready Banner (Standalone Card) */}
          {dedicatedNumberEntitlements > 0 && (!kycStatus || kycStatus.status !== 'approved') && (
            <div className="p-5 rounded-2xl border border-amber-300 bg-amber-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-950 text-sm">You have {dedicatedNumberEntitlements} number(s) pending</h3>
                  <p className="text-xs text-amber-800 mt-0.5">Please complete your business KYC to provision your dedicated lines.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("buy-numbers")}
                className="btn-pill-primary bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 font-bold shrink-0"
              >
                Go to KYC
              </button>
            </div>
          )}

          {dedicatedNumberEntitlements > 0 && kycStatus?.status === 'approved' && (
            <div className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-950 text-sm">Claim Your Dedicated Number</h3>
                  <p className="text-xs text-emerald-800 mt-0.5">You have {dedicatedNumberEntitlements} paid entitlement(s) ready to be provisioned.</p>
                </div>
              </div>
              <button
                disabled={isClaiming}
                onClick={handleClaimNumber}
                className="btn-pill-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 py-2.5 flex items-center gap-2 font-bold shadow-sm transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
              >
                {isClaiming ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Phone className="w-3.5 h-3.5" />}
                {isClaiming ? "Provisioning..." : "Provision New Number"}
              </button>
            </div>
          )}

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
                ) : dedicatedNumberEntitlements > 0 ? (
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-neutral-900">Provision Your Dedicated Number</h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        You have {dedicatedNumberEntitlements} paid number entitlement{dedicatedNumberEntitlements > 1 ? 's' : ''} ready. Click below to provision and allocate your dedicated business line.
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <button
                        disabled={isClaiming}
                        onClick={handleClaimNumber}
                        className="btn-pill-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 py-2.5 inline-flex items-center gap-2 rounded-xl shadow-md transition-all font-bold cursor-pointer"
                      >
                        {isClaiming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                        <span>{isClaiming ? "Provisioning..." : "Provision Number Now"}</span>
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
                        Your KYC is approved! Purchase a dedicated number from the Plans &amp; Billing page to get started.
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <a
                        href="/dashboard/billing"
                        className="btn-pill-primary bg-neutral-900 hover:bg-black text-white text-xs px-5 py-2.5 inline-flex items-center gap-2 rounded-xl shadow-md transition-all"
                      >
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span>Go to Plans &amp; Billing</span>
                      </a>
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
                    {myNumbers.map((item) => {
                      const isNumberExpired = Boolean(
                        item.current_period_end &&
                        new Date(item.current_period_end).getTime() <= Date.now()
                      );

                      return (
                        <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors group">
                          {/* Phone Number */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                isNumberExpired 
                                  ? "bg-rose-100 text-rose-700" 
                                  : "bg-neutral-100 group-hover:bg-black group-hover:text-white text-neutral-700"
                              }`}>
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
                            {isNumberExpired ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                                Expired ({new Date(item.current_period_end!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })})
                              </span>
                            ) : item.assigned_assistant_id ? (
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
                            <div className="inline-flex items-center justify-end gap-2">
                              {isNumberExpired && (
                                <a
                                  href="/dashboard/billing"
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all inline-flex items-center gap-1 shadow-2xs font-bold"
                                >
                                  <Wallet className="w-3.5 h-3.5" />
                                  <span>Renew Line</span>
                                </a>
                              )}
                              {item.assigned_assistant_id ? (
                                <button
                                  onClick={() => handleAssignAssistant(item.id, "none")}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all inline-flex items-center gap-1"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Unassign</span>
                                </button>
                              ) : !isNumberExpired ? (
                                <span className="text-[11px] text-neutral-400 font-medium">No actions</span>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
          {isKycFullySubmitted && kycStatus ? (
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
            <KycDigiLockerPanel existingKyc={kycStatus} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── KYC Verification Panel (PAN + DigiLocker) ───────────────────────────────
function KycDigiLockerPanel({ existingKyc }: { existingKyc: KycRecord | null }) {
  const [step, setStep] = React.useState<1 | 2>(existingKyc?.pan_verified ? 2 : 1);
  const [pan, setPan] = React.useState("");
  const [businessName, setBusinessName] = React.useState(existingKyc?.business_name || "");
  const [isVerifyingPan, setIsVerifyingPan] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [verifiedPanName, setVerifiedPanName] = React.useState<string | null>(existingKyc?.verified_pan_name || null);

  const handleVerifyPan = async () => {
    if (!pan || pan.length !== 10 || !businessName) {
      setError("Please enter Business Name and a valid 10-character PAN.");
      return;
    }
    setIsVerifyingPan(true);
    setError(null);
    try {
      const { verifyPanWithSetu } = await import("@/app/actions/setu-kyc");
      const res = await verifyPanWithSetu(pan, businessName);
      if (res.success) {
        setVerifiedPanName(res.verifiedName || null);
        setStep(2);
      } else {
        setError(res.error || "PAN verification failed.");
      }
    } catch (e: any) {
      setError(e.message || "Unexpected error.");
    } finally {
      setIsVerifyingPan(false);
    }
  };

  const handleDigiLockerRedirect = async () => {
    setIsRedirecting(true);
    setError(null);
    try {
      const { initiateDigiLockerKyc } = await import("@/app/actions/setu-kyc");
      const res = await initiateDigiLockerKyc();
      if (res.success && res.digilockerUrl) {
        window.location.href = res.digilockerUrl;
      } else {
        setError(res.error || "Failed to initiate DigiLocker.");
        setIsRedirecting(false);
      }
    } catch (e: any) {
      setError(e.message || "Unexpected error.");
      setIsRedirecting(false);
    }
  };

  return (
    <div className="space-y-6 bg-white border border-hairline rounded-2xl p-6 sm:p-8 shadow-sm max-w-lg mx-auto">
      {/* Header */}
      <div className="space-y-2 border-b border-hairline pb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">
            Business KYC Verification
          </h3>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Complete our automated 2-step KYC to provision virtual phone numbers instantly.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <p className="text-xs text-rose-700 font-medium">{error}</p>
        </div>
      )}

      {/* Step 1: PAN Verification */}
      <div className={`space-y-4 p-5 rounded-2xl border transition-all ${step === 1 ? 'border-indigo-200 bg-indigo-50/30' : 'border-hairline bg-surface-soft/50 opacity-60'}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${step === 1 ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
              {step > 1 ? <Check className="w-3 h-3" /> : '1'}
            </span>
            PAN Verification
          </h4>
          {step > 1 && (
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Verified</span>
          )}
        </div>

        {step === 1 ? (
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-neutral-700 mb-1 block">Business / Entity Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Acme Corp Pvt Ltd"
                className="w-full px-3 py-2 text-sm bg-white border border-hairline rounded-lg focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-neutral-700 mb-1 block">10-Digit PAN Number</label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="w-full px-3 py-2 text-sm bg-white border border-hairline rounded-lg focus:outline-none focus:border-indigo-400 font-mono uppercase"
              />
            </div>
            <button
              onClick={handleVerifyPan}
              disabled={isVerifyingPan || !pan || !businessName}
              className="w-full py-2.5 mt-2 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifyingPan ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              Verify PAN
            </button>
          </div>
        ) : (
          <div className="pt-1">
            <p className="text-xs text-neutral-600">Verified as <span className="font-bold text-neutral-900">{verifiedPanName}</span></p>
          </div>
        )}
      </div>

      {/* Step 2: DigiLocker */}
      <div className={`space-y-4 p-5 rounded-2xl border transition-all ${step === 2 ? 'border-indigo-200 bg-indigo-50/30' : 'border-hairline bg-surface-soft/50 opacity-60'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${step === 2 ? 'bg-indigo-600' : 'bg-neutral-300'}`}>
            2
          </span>
          <h4 className="text-sm font-bold text-neutral-900">Aadhaar Authentication</h4>
        </div>

        {step === 2 ? (
          <div className="space-y-4 pt-1">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Verify your identity instantly via DigiLocker using Aadhaar OTP.
            </p>
            <div className="flex items-start gap-2.5 p-3 bg-blue-50/80 border border-blue-100 rounded-xl">
              <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-800 leading-relaxed">
                <span className="font-bold">Secure &amp; private.</span> We only receive your name and masked Aadhaar. Powered by <a href="https://setu.co" target="_blank" rel="noreferrer" className="font-bold underline underline-offset-2">Setu</a>.
              </p>
            </div>
            <button
              onClick={handleDigiLockerRedirect}
              disabled={isRedirecting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isRedirecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  <span>Verify with DigiLocker</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="pt-1">
            <p className="text-xs text-neutral-400">Complete PAN verification first</p>
          </div>
        )}
      </div>
    </div>
  );
}
