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
  ExternalLink,
  Lock,
  Fingerprint,
  Download,
  RadioTower,
  ClipboardCheck,
  Landmark,
  BadgeCheck,
  Clock3
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

const kycTone = {
  pending: {
    label: "Pending review",
    shell: "bg-[#fff7e6] text-amber-950 border-amber-200",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    shell: "bg-emerald-50 text-emerald-950 border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    shell: "bg-rose-50 text-rose-950 border-rose-200",
    dot: "bg-rose-500",
  },
} as const;

function KycStatusPill({ status }: { status?: KycRecord["status"] | null }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-600">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
        Not started
      </span>
    );
  }

  const tone = kycTone[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone.shell}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {tone.label}
    </span>
  );
}

function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "mint" | "lilac";
}) {
  const tones = {
    neutral: "bg-white text-neutral-950 border-black/10",
    mint: "bg-block-mint/50 text-emerald-950 border-emerald-200",
    lilac: "bg-block-lilac/50 text-purple-950 border-purple-200",
  };

  return (
    <div className={`rounded-[24px] border p-5 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-current/55">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/70 text-black">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-xs font-medium text-current/65">{detail}</p>
    </div>
  );
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

  const totalMyNumbers = myNumbers.length;
  const activeMyNumbers = myNumbers.filter((n) => n.assigned_assistant_id).length;
  const unassignedMyNumbers = totalMyNumbers - activeMyNumbers;

  return (
    <div className="mx-auto max-w-7xl space-y-12 pb-24 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`flex items-center justify-between rounded-[14px] border px-4 py-3 text-xs font-semibold shadow-[0_18px_45px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-200 ${
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
      <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                <RadioTower className="h-3.5 w-3.5" />
                Live Gateway
              </span>
              <KycStatusPill status={kycStatus?.status} />
            </div>
            <div className="mt-5 max-w-2xl">
              <h1 className="text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">Phone Numbers</h1>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Manage verified phone lines, bind assistants, and complete business KYC before provisioning new numbers.
              </p>
            </div>
          </div>

          <div className="border-t border-black/10 bg-block-lime/60 p-5 sm:p-7 lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-black/55">AI Calling Balance</p>
                <p className="mt-2 font-mono text-3xl font-black tracking-tight text-black">
                  {Math.floor(balance).toLocaleString()}
                  <span className="ml-2 font-sans text-sm font-bold text-black/55">mins</span>
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white text-black shadow-sm">
                <Wallet className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold text-black/65">
              <div className="rounded-[12px] bg-white/70 px-3 py-2">
                <span className="block text-black/45">Lines</span>
                <span className="mt-0.5 block text-black">{totalMyNumbers}</span>
              </div>
              <div className="rounded-[12px] bg-white/70 px-3 py-2">
                <span className="block text-black/45">Bound</span>
                <span className="mt-0.5 block text-black">{activeMyNumbers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid gap-2 rounded-[24px] border border-black/10 bg-surface-soft p-1.5 sm:inline-grid sm:grid-cols-2">
        <button
          onClick={() => setActiveTab("my-numbers")}
          className={`flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "my-numbers"
              ? "bg-white text-black shadow-sm"
              : "text-neutral-600 hover:bg-white/60 hover:text-black"
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          <span>My Numbers</span>
          <span className={`px-1.5 py-0.2 rounded-md text-xs ${activeTab === 'my-numbers' ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
            {totalMyNumbers}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("buy-numbers")}
          className={`flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === "buy-numbers"
              ? "bg-white text-black shadow-sm"
              : "text-neutral-600 hover:bg-white/60 hover:text-black"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Request Number (KYC)</span>
          {kycStatus && (
            <span className={`px-1.5 py-0.2 rounded-md text-xs uppercase font-mono font-semibold ${
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
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricTile
              label="Purchased lines"
              value={totalMyNumbers}
              detail="Numbers available in this workspace."
              icon={Phone}
            />
            <MetricTile
              label="Active routes"
              value={activeMyNumbers}
              detail="Bound to assistant call flows."
              icon={Zap}
              tone="mint"
            />
            <MetricTile
              label="Ready pool"
              value={unassignedMyNumbers}
              detail="Waiting for assistant assignment."
              icon={Inbox}
              tone="lilac"
            />
          </div>

          {/* Numbers Table Card */}
          <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-sm">
            {myNumbers.length === 0 ? (
              <div className="p-8 sm:p-14">
                {(!kycStatus || kycStatus.status !== 'approved') ? (
                  <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-[220px_1fr] md:items-center">
                    <div className="rounded-[24px] bg-block-mint/70 p-5 text-black">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <p className="mt-8 text-xs font-bold uppercase text-black/55">Provisioning locked</p>
                      <p className="mt-1 text-2xl font-black tracking-tight">KYC first</p>
                    </div>
                    <div className="space-y-4 text-left">
                      <div>
                        <h3 className="text-xl font-black tracking-tight text-neutral-950">Verify your business to request numbers</h3>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                          Complete PAN verification and DigiLocker authentication before a dedicated phone line is assigned.
                        </p>
                      </div>
                      <div className="grid gap-2 text-xs font-semibold text-neutral-700 sm:grid-cols-2">
                        <div className="rounded-[12px] border border-black/10 bg-surface-soft px-3 py-2">
                          <span className="block text-neutral-500">Step 1</span>
                          PAN verification
                        </div>
                        <div className="rounded-[12px] border border-black/10 bg-surface-soft px-3 py-2">
                          <span className="block text-neutral-500">Step 2</span>
                          DigiLocker Aadhaar consent
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("buy-numbers")}
                        className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                      >
                        <ShieldCheck className="h-4 w-4 text-block-lime" />
                        <span>Start KYC Verification</span>
                        <ArrowRight className="h-3.5 w-3.5 opacity-70" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto max-w-md space-y-4 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[16px] bg-surface-soft text-neutral-700">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-neutral-950">No phone numbers yet</h3>
                      <p className="mt-2 text-sm leading-6 text-neutral-600">
                        Your KYC is approved. The assigned line will appear here after admin provisioning.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="border-b border-black/10 bg-surface-soft text-neutral-500">
                    <tr>
                      <th className="px-5 py-3 text-xs font-bold uppercase">Phone Line</th>
                      <th className="px-5 py-3 text-xs font-bold uppercase">Provider</th>
                      <th className="px-5 py-3 text-xs font-bold uppercase">Assigned AI Assistant</th>
                      <th className="px-5 py-3 text-xs font-bold uppercase">Status</th>
                      <th className="px-5 py-3 text-right text-xs font-bold uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10">
                    {myNumbers.map((item) => (
                      <tr key={item.id} className="group transition-colors hover:bg-surface-soft/70">
                        {/* Phone Number */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-black text-white transition-colors">
                              <Phone className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-mono text-sm font-black tracking-tight text-neutral-950">
                              {item.phone_number}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyNumber(item.phone_number, item.id)}
                              title="Copy Phone Number"
                              className="ml-1 rounded-[8px] p-1 text-neutral-400 transition-colors hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-black/20"
                            >
                              {copiedId === item.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Provider */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-black/10 bg-white px-2.5 py-1 text-xs font-bold uppercase text-neutral-800">
                            <Globe className="h-3 w-3 text-neutral-400" />
                            {item.provider}
                          </span>
                        </td>

                        {/* Assigned Assistant Dropdown */}
                        <td className="px-5 py-4">
                          <AssistantSelect
                            value={item.assigned_assistant_id || "none"}
                            assistants={assistants}
                            onSelect={(assistantId) => handleAssignAssistant(item.id, assistantId)}
                          />
                        </td>

                        {/* Status Tag */}
                        <td className="px-5 py-4">
                          {item.assigned_assistant_id ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase text-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-neutral-100 px-2.5 py-1 text-xs font-bold uppercase text-neutral-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400"></span>
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          {item.assigned_assistant_id ? (
                            <button
                              onClick={() => handleAssignAssistant(item.id, "none")}
                              className="inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all hover:border-rose-200 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            >
                              <UserX className="h-3.5 w-3.5" />
                              <span>Unassign</span>
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-400 font-medium">No actions</span>
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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          {kycStatus ? (
            <div className="rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.06)] sm:p-8">
              {kycStatus.status === 'pending' && (
                <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-center">
                  <div className="rounded-[24px] bg-[#fff7e6] p-5 text-amber-950">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white text-amber-700 shadow-sm">
                      <Clock3 className="h-5 w-5" />
                    </div>
                    <p className="mt-10 text-xs font-bold uppercase text-amber-900/55">Review queue</p>
                    <p className="mt-1 text-2xl font-black tracking-tight">Pending</p>
                  </div>
                  <div>
                    <KycStatusPill status="pending" />
                    <h3 className="mt-4 text-2xl font-black tracking-tight text-neutral-950">KYC verification in progress</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
                      Your PAN and DigiLocker verification are under review by our admin team. Dedicated phone lines will be provisioned upon approval.
                    </p>
                    <div className="mt-5 grid gap-2 text-xs font-semibold text-neutral-700 sm:grid-cols-3">
                      <div className="rounded-[12px] bg-surface-soft px-3 py-2">PAN checked</div>
                      <div className="rounded-[12px] bg-surface-soft px-3 py-2">Aadhaar consented</div>
                      <div className="rounded-[12px] bg-surface-soft px-3 py-2">Admin assigning line</div>
                    </div>
                  </div>
                </div>
              )}
              {kycStatus.status === 'approved' && (
                <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-center">
                  <div className="rounded-[24px] bg-block-mint/70 p-5 text-emerald-950">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white text-emerald-700 shadow-sm">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <p className="mt-10 text-xs font-bold uppercase text-emerald-900/55">Verified</p>
                    <p className="mt-1 text-2xl font-black tracking-tight">Approved</p>
                  </div>
                  <div>
                    <KycStatusPill status="approved" />
                    <h3 className="mt-4 text-2xl font-black tracking-tight text-neutral-950">KYC verification approved</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
                      Your business identity is fully verified! You can sync or manage your assigned phone numbers in the "My Numbers" tab.
                    </p>
                    <button
                      onClick={() => setActiveTab("my-numbers")}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Go to My Numbers</span>
                    </button>
                  </div>
                </div>
              )}
              {kycStatus.status === 'rejected' && (
                <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-center">
                  <div className="rounded-[24px] bg-rose-50 p-5 text-rose-950">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white text-rose-700 shadow-sm">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <p className="mt-10 text-xs font-bold uppercase text-rose-900/55">Needs support</p>
                    <p className="mt-1 text-2xl font-black tracking-tight">Rejected</p>
                  </div>
                  <div>
                    <KycStatusPill status="rejected" />
                    <h3 className="mt-4 text-2xl font-black tracking-tight text-neutral-950">Verification rejected</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
                      Unfortunately, your identity verification request could not be processed. Please reach out to support for assistance.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <KycDigiLockerPanel />
          )}
          <div className="rounded-[24px] border border-black/10 bg-black p-6 text-white shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-black">
              <ClipboardCheck className="h-4 w-4" />
            </div>
            <h3 className="mt-5 text-xl font-black tracking-tight">Verification checklist</h3>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${kycStatus ? "bg-block-lime text-black" : "bg-white/10 text-white/55"}`}>
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-white/80">PAN name verification</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${kycStatus ? "bg-block-lime text-black" : "bg-white/10 text-white/55"}`}>
                  <Fingerprint className="h-3.5 w-3.5" />
                </span>
                <span className="text-white/80">DigiLocker Aadhaar consent</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${kycStatus?.status === "approved" ? "bg-block-lime text-black" : "bg-white/10 text-white/55"}`}>
                  <Phone className="h-3.5 w-3.5" />
                </span>
                <span className="text-white/80">Phone line assignment</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── KYC Verification Panel (PAN + DigiLocker) ───────────────────────────────
function KycDigiLockerPanel() {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [pan, setPan] = React.useState("");
  const [businessName, setBusinessName] = React.useState("");
  const [isVerifyingPan, setIsVerifyingPan] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [verifiedPanName, setVerifiedPanName] = React.useState<string | null>(null);
  const [panConsent, setPanConsent] = React.useState(false);

  const handleVerifyPan = async () => {
    if (!pan || pan.length !== 10 || !businessName) {
      setError("Please enter Business Name and a valid 10-character PAN.");
      return;
    }
    if (!panConsent) {
      setError("Please provide consent to verify this PAN for business KYC.");
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
    <div className="overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
      <div className="border-b border-black/10 bg-surface-soft p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-black text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="mt-4 text-2xl font-black tracking-tight text-neutral-950">
              Business KYC verification
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
              Verify PAN first, then complete Aadhaar authentication with DigiLocker.
            </p>
          </div>
          <div className="flex min-w-[172px] rounded-full border border-black/10 bg-white p-1 text-xs font-bold">
            <span className={`flex flex-1 items-center justify-center rounded-full px-3 py-1.5 ${step === 1 ? "bg-black text-white" : "text-neutral-500"}`}>
              PAN
            </span>
            <span className={`flex flex-1 items-center justify-center rounded-full px-3 py-1.5 ${step === 2 ? "bg-black text-white" : "text-neutral-500"}`}>
              DigiLocker
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {error && (
          <div className="flex items-start gap-3 rounded-[14px] border border-rose-200 bg-rose-50 p-3 text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs font-semibold leading-5">{error}</p>
          </div>
        )}

        <div className={`rounded-[24px] border p-5 transition-all ${step === 1 ? "border-black/15 bg-white shadow-sm" : "border-emerald-200 bg-emerald-50"}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${step > 1 ? "bg-emerald-600 text-white" : "bg-black text-white"}`}>
                {step > 1 ? <Check className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}
              </span>
              <div>
                <h4 className="text-sm font-black text-neutral-950">PAN Verification</h4>
                <p className="text-xs font-medium text-neutral-500">Business name and PAN match</p>
              </div>
            </div>
            {step > 1 && (
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold uppercase text-emerald-700">
                Verified
              </span>
            )}
          </div>

          {step === 1 ? (
            <div className="mt-5 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-neutral-500">Business / Entity Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Acme Corp Pvt Ltd"
                  className="w-full rounded-[12px] border border-black/10 bg-surface-soft px-3 py-2.5 text-sm font-semibold text-neutral-950 outline-none transition-colors placeholder:text-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-neutral-500">PAN Number</label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="w-full rounded-[12px] border border-black/10 bg-surface-soft px-3 py-2.5 font-mono text-sm font-black uppercase text-neutral-950 outline-none transition-colors placeholder:text-neutral-400 focus:border-black focus:bg-white focus:ring-2 focus:ring-black/10"
                />
              </div>
              <label className="flex items-start gap-3 rounded-[14px] border border-black/10 bg-white p-3 text-xs font-medium leading-5 text-neutral-600">
                <input
                  type="checkbox"
                  checked={panConsent}
                  onChange={(e) => setPanConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 accent-black"
                />
                <span>
                  I consent to verify this PAN with Setu for business KYC and phone number provisioning.
                </span>
              </label>
              <button
                onClick={handleVerifyPan}
                disabled={isVerifyingPan || !pan || !businessName || !panConsent}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                {isVerifyingPan ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Landmark className="h-4 w-4" />}
                Verify PAN
              </button>
            </div>
          ) : (
            <div className="mt-4 rounded-[12px] bg-white px-3 py-2 text-xs font-semibold text-neutral-700">
              Verified as <span className="font-black text-neutral-950">{verifiedPanName}</span>
            </div>
          )}
        </div>

        <div className={`rounded-[24px] border p-5 transition-all ${step === 2 ? "border-black/15 bg-white shadow-sm" : "border-black/10 bg-surface-soft opacity-75"}`}>
          <div className="flex items-center gap-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${step === 2 ? "bg-black text-white" : "bg-neutral-200 text-neutral-500"}`}>
              <Fingerprint className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-black text-neutral-950">Aadhaar Authentication</h4>
              <p className="text-xs font-medium text-neutral-500">DigiLocker consent and OTP</p>
            </div>
          </div>

          {step === 2 ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-[14px] border border-blue-100 bg-blue-50 p-3">
                <div className="flex items-start gap-2.5">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                  <p className="text-xs font-medium leading-5 text-blue-900">
                    We only receive your name and masked Aadhaar. Powered by <a href="https://setu.co" target="_blank" rel="noreferrer" className="font-black underline underline-offset-2">Setu</a>.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDigiLockerRedirect}
                disabled={isRedirecting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                {isRedirecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4" />
                    <span>Verify with DigiLocker</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="mt-4 rounded-[12px] bg-white px-3 py-2 text-xs font-semibold text-neutral-500">
              Complete PAN verification first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
