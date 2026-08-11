"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
  AlertCircle
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

  const [toastMessage, setToastMessage] = React.useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

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
      alert("Failed to update assignment: " + e.message);
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
          text: `Fetched & saved ${res.fetchedNumbersCount} phone number(s) to Supabase!`
        });
      } else {
        setToastMessage({
          type: 'info',
          text: "No assigned phone numbers found in your Telephony account."
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
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`flex items-center justify-between rounded-[10px] border p-4 text-xs font-bold shadow-md ${
          toastMessage.type === 'success' 
            ? 'bg-block-lime border-black/10 text-black'
            : toastMessage.type === 'info'
            ? 'bg-purple-50 border-purple-200 text-purple-950'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {toastMessage.type === 'success' && <CheckCircle2 className="h-5 w-5 text-black" />}
            {toastMessage.type === 'info' && <Download className="h-5 w-5 text-purple-600" />}
            {toastMessage.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600" />}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-black/70 hover:text-black">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="eyebrow text-neutral-500">// TELEPHONY MARKETPLACE</p>
          <h1 className="text-3xl font-bold tracking-tight text-black mt-1">Phone Numbers</h1>
          <p className="text-sm text-neutral-600">Bind virtual phone numbers directly to your GAP AI Voice Assistants.</p>
        </div>

        {/* Balance & API Fetch Button */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            disabled={isFetching}
            onClick={handleFetchVomyraNumbers}
            className="btn-pill-primary rounded-[10px] text-xs px-3.5 py-2 shadow-sm flex items-center gap-2"
          >
            <Download className={`w-3.5 h-3.5 ${isFetching ? "animate-bounce" : ""}`} />
            {isFetching ? "Syncing..." : "Sync Telephony Numbers"}
          </button>

          <div className="flex items-center gap-2 bg-block-cream border border-black/10 px-3.5 py-2 rounded-[10px] text-xs">
            <Wallet className="h-4 w-4 text-black" />
            <span className="text-neutral-600 font-medium hidden sm:inline">AI Calling Balance:</span>
            <span className="font-bold text-black font-mono">{Math.floor(balance)} Mins</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline pb-2">
        <button
          onClick={() => setActiveTab("my-numbers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-xs font-bold transition-all ${
            activeTab === "my-numbers"
              ? "bg-black text-white shadow-sm"
              : "text-neutral-600 hover:text-black hover:bg-surface-soft"
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          <span>My Numbers ({totalMyNumbers})</span>
        </button>

        <button
          onClick={() => setActiveTab("buy-numbers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-xs font-bold transition-all ${
            activeTab === "buy-numbers"
              ? "bg-black text-white shadow-sm"
              : "text-neutral-600 hover:text-black hover:bg-surface-soft"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Request Number (KYC)</span>
        </button>
      </div>

      {/* TAB 1: MY NUMBERS */}
      {activeTab === "my-numbers" && (
        <div className="space-y-6">
          {/* Status Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-[10px] bg-block-lime/30 border border-hairline flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/60">Purchased Numbers</span>
              <span className="text-3xl font-extrabold text-black mt-2">{totalMyNumbers}</span>
            </div>
            <div className="p-4 rounded-[10px] bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800">Active / Assigned</span>
              <span className="text-3xl font-extrabold text-emerald-950 mt-2">{activeMyNumbers}</span>
            </div>
            <div className="p-4 rounded-[10px] bg-purple-50 border border-purple-200 flex flex-col justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-800">Unassigned Pool</span>
              <span className="text-3xl font-extrabold text-purple-950 mt-2">{unassignedMyNumbers}</span>
            </div>
          </div>

          {/* Numbers Table */}
          <div className="bg-white border border-hairline rounded-[10px] overflow-hidden shadow-sm">
            {myNumbers.length === 0 ? (
              <div className="p-8 sm:p-12 text-center space-y-3">
                {(!kycStatus || kycStatus.status !== 'approved') ? (
                  <>
                    <ShieldCheck className="w-8 h-8 text-neutral-300 mx-auto" />
                    <p className="text-xs font-semibold text-neutral-700">Identity verification required</p>
                    <p className="text-[11px] text-neutral-500 max-w-md mx-auto">
                      You must verify your business identity (KYC) before you can purchase or assign phone numbers to your workspace.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setActiveTab("buy-numbers")}
                        className="btn-pill-primary bg-black hover:bg-neutral-800 text-white text-xs px-5 py-2.5 inline-flex items-center gap-2 rounded-[10px] shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verify KYC Now
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Phone className="w-8 h-8 text-neutral-300 mx-auto" />
                    <p className="text-xs font-semibold text-neutral-700">No phone numbers assigned to your workspace yet.</p>
                    <p className="text-[11px] text-neutral-500">Click "Sync Telephony Numbers" to query your gateway, or request numbers via the KYC tab.</p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        disabled={isFetching}
                        onClick={handleFetchVomyraNumbers}
                        className="btn-pill-primary text-xs px-4 py-2 inline-flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {isFetching ? "Syncing API..." : "Sync Telephony Numbers"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-surface-soft text-neutral-500 uppercase tracking-wider font-mono font-semibold border-b border-hairline">
                    <tr>
                      <th className="p-4">Phone Number</th>
                      <th className="p-4">Provider</th>
                      <th className="p-4">Assigned Assistant</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {myNumbers.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-soft/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-black text-sm">
                          {item.phone_number}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-soft border border-hairline text-neutral-700">
                            {item.provider}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={item.assigned_assistant_id || "none"}
                            onChange={(e) => handleAssignAssistant(item.id, e.target.value)}
                            className="px-3 py-1.5 bg-white border border-hairline rounded-[10px] text-xs font-medium text-black focus:outline-none focus:border-black/30"
                          >
                            <option value="none">-- Unassigned --</option>
                            {assistants.map((ast) => (
                              <option key={ast.id} value={ast.id}>
                                {ast.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4">
                          {item.assigned_assistant_id ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 text-neutral-600 border border-hairline">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {item.assigned_assistant_id && (
                            <button
                              onClick={() => handleAssignAssistant(item.id, "none")}
                              className="btn-pill-secondary rounded-[10px] text-xs px-3 py-1.5 text-red-600 hover:text-red-700"
                            >
                              Unassign
                            </button>
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
            <div className="p-8 bg-white border border-hairline rounded-[10px] text-center space-y-4 shadow-sm">
              {kycStatus.status === 'pending' && (
                <>
                  <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
                  <h3 className="text-lg font-bold text-black">KYC Verification in Progress</h3>
                  <p className="text-sm text-neutral-600 max-w-sm mx-auto">
                    Your KYC request is currently under review by our admin team. You will be assigned a phone number as soon as it is approved.
                  </p>
                </>
              )}
              {kycStatus.status === 'approved' && (
                <>
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-lg font-bold text-black">KYC Approved</h3>
                  <p className="text-sm text-neutral-600 max-w-sm mx-auto">
                    Your KYC has been approved and a phone number has been assigned to your workspace. Please check the "My Numbers" tab.
                  </p>
                </>
              )}
              {kycStatus.status === 'rejected' && (
                <>
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                  <h3 className="text-lg font-bold text-black">KYC Rejected</h3>
                  <p className="text-sm text-neutral-600 max-w-sm mx-auto">
                    Unfortunately, your KYC request was rejected. Please contact support for more information.
                  </p>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleKycSubmit} className="space-y-6 bg-white border border-hairline rounded-[10px] p-6 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-black flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Identity Verification (KYC)
                </h3>
                <p className="text-sm text-neutral-600">
                  To get a dedicated phone number, you need to complete KYC. Please provide your details and upload a valid ID.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="businessName" className="text-xs font-bold text-neutral-700">Business / Individual Name</label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    required
                    className="w-full px-3 py-2 bg-surface-soft border border-hairline rounded-[8px] text-sm focus:outline-none focus:border-black/30"
                    placeholder="Acme Corp or John Doe"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="useCase" className="text-xs font-bold text-neutral-700">Purpose of Use</label>
                  <textarea
                    id="useCase"
                    name="useCase"
                    required
                    rows={3}
                    className="w-full px-3 py-2 bg-surface-soft border border-hairline rounded-[8px] text-sm focus:outline-none focus:border-black/30 resize-none"
                    placeholder="E.g., Inbound customer support, outbound sales campaigns"
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="document" className="text-xs font-bold text-neutral-700">Upload ID Document (PDF, JPG, PNG)</label>
                  <input
                    type="file"
                    id="document"
                    name="document"
                    required
                    accept=".pdf,image/*"
                    className="w-full px-3 py-2 bg-surface-soft border border-hairline rounded-[8px] text-sm focus:outline-none focus:border-black/30"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">Provide a government-issued ID or company registration document.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingKyc}
                  className="btn-pill-primary w-full justify-center flex items-center gap-2 px-4 py-2.5 text-sm font-bold shadow-sm"
                >
                  {isSubmittingKyc ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  {isSubmittingKyc ? "Submitting..." : "Submit KYC & Request Number"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
