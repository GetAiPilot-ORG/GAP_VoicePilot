"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  X,
  Phone,
  Building2,
  Mail,
  Calendar,
  Check,
  FileText,
  UserCheck,
  UserX,
  RefreshCw,
  Eye,
  Activity,
  Fingerprint,
  CreditCard
} from "lucide-react";
import { approveKyc, rejectKyc, resetKycStatus } from "@/app/actions/kyc";

interface KycRequestItem {
  id: string;
  workspace_id: string;
  business_name: string;
  use_case?: string | null;
  status: "pending" | "approved" | "rejected";
  verification_method?: string | null;
  pan_verified?: boolean | null;
  pan_number_last4?: string | null;
  verified_pan_name?: string | null;
  digilocker_verified?: boolean | null;
  digilocker_verified_name?: string | null;
  created_at: string;
  updated_at?: string | null;
  reviewed_at?: string | null;
  assigned_number?: string | null;
  workspaces?: {
    id: string;
    name: string;
    owner_id?: string;
  } | null;
  owner?: {
    id?: string;
    email?: string;
    full_name?: string;
  } | null;
}

export function AdminKycClient({
  initialRequests = []
}: {
  initialRequests: KycRequestItem[];
  initialAvailableNumbers?: string[];
}) {
  const [requests, setRequests] = React.useState<KycRequestItem[]>(initialRequests);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterTab, setFilterTab] = React.useState<"all" | "pending" | "approved" | "rejected">("all");
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = React.useState<KycRequestItem | null>(null);
  const [toastMessage, setToastMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Counts
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  const handleApprove = async (id: string, businessName: string) => {
    setIsProcessing(id);
    try {
      const res = await approveKyc(id);
      if (res.success) {
        setToastMessage({ type: 'success', text: `Approved KYC for ${businessName}!` });
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved", reviewed_at: new Date().toISOString() } : r));
        if (selectedDetail?.id === id) {
          setSelectedDetail(prev => prev ? { ...prev, status: "approved" } : null);
        }
      } else {
        setToastMessage({ type: 'error', text: res.error || "Failed to approve KYC" });
      }
    } catch (e: any) {
      setToastMessage({ type: 'error', text: e.message });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (id: string, businessName: string) => {
    if (!confirm(`Are you sure you want to reject the KYC submission for ${businessName}?`)) {
      return;
    }
    setIsProcessing(id);
    try {
      const res = await rejectKyc(id);
      if (res.success) {
        setToastMessage({ type: 'success', text: `Rejected KYC for ${businessName}` });
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected", reviewed_at: new Date().toISOString() } : r));
        if (selectedDetail?.id === id) {
          setSelectedDetail(prev => prev ? { ...prev, status: "rejected" } : null);
        }
      } else {
        setToastMessage({ type: 'error', text: res.error || "Failed to reject KYC" });
      }
    } catch (e: any) {
      setToastMessage({ type: 'error', text: e.message });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReset = async (id: string, businessName: string) => {
    setIsProcessing(id);
    try {
      const res = await resetKycStatus(id);
      if (res.success) {
        setToastMessage({ type: 'success', text: `Reset status to pending for ${businessName}` });
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "pending", reviewed_at: null } : r));
        if (selectedDetail?.id === id) {
          setSelectedDetail(prev => prev ? { ...prev, status: "pending" } : null);
        }
      } else {
        setToastMessage({ type: 'error', text: res.error || "Failed to reset status" });
      }
    } catch (e: any) {
      setToastMessage({ type: 'error', text: e.message });
    } finally {
      setIsProcessing(null);
    }
  };

  // Filter & Search logic
  const filteredRequests = requests.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (r.business_name || "").toLowerCase().includes(q) ||
      (r.workspaces?.name || "").toLowerCase().includes(q) ||
      (r.owner?.email || "").toLowerCase().includes(q) ||
      (r.owner?.full_name || "").toLowerCase().includes(q) ||
      (r.verified_pan_name || "").toLowerCase().includes(q) ||
      (r.use_case || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterTab === "pending") return r.status === "pending";
    if (filterTab === "approved") return r.status === "approved";
    if (filterTab === "rejected") return r.status === "rejected";
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center justify-between gap-4 max-w-md border ${
          toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-center gap-3">
            {toastMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />}
            <span className="text-xs font-semibold">{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 rounded-md text-neutral-400 hover:text-black">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="space-y-6 border-b border-hairline pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow text-neutral-500">// ADMIN CONTROL PANEL</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-white">
                ADMIN
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 mt-1">KYC Verifications &amp; Compliance</h1>
            <p className="text-sm text-neutral-600">Review business entity submissions, verify PAN/DigiLocker authenticity, and approve virtual line allocations.</p>
          </div>
        </div>

        {/* Sub-tabs between Admin Sections */}
        <div className="inline-flex p-1 bg-surface-soft border border-hairline rounded-xl gap-1">
          <Link
            href="/dashboard/admin/kyc"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-white text-black shadow-xs border border-black/5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>KYC Verifications</span>
            <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-neutral-900 text-white font-mono">
              {totalCount}
            </span>
          </Link>

          <Link
            href="/dashboard/admin/phone-numbers"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-neutral-600 hover:text-black hover:bg-white/50 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-neutral-500" />
            <span>Phone Numbers Inventory</span>
          </Link>
        </div>
      </div>

      {/* Metrics Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-hairline shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Submissions</span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-neutral-900">{totalCount}</span>
            <p className="text-[11px] text-neutral-500 mt-0.5">All customer KYC registrations</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-hairline shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-amber-600">{pendingCount}</span>
            <p className="text-[11px] text-neutral-500 mt-0.5">Awaiting manual or final check</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-hairline shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Approved Entities</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-600">{approvedCount}</span>
            <p className="text-[11px] text-neutral-500 mt-0.5">Verified &amp; authorized for telephony</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-hairline shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Rejected / Action Req.</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-rose-600">{rejectedCount}</span>
            <p className="text-[11px] text-neutral-500 mt-0.5">Submissions needing resubmission</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Sub-Filters */}
        <div className="inline-flex p-1 bg-surface-soft border border-hairline rounded-xl gap-1">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "all" ? "bg-white text-black shadow-xs" : "text-neutral-600 hover:text-black"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterTab("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "pending" ? "bg-white text-black shadow-xs" : "text-neutral-600 hover:text-black"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterTab("approved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "approved" ? "bg-white text-black shadow-xs" : "text-neutral-600 hover:text-black"
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilterTab("rejected")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "rejected" ? "bg-white text-black shadow-xs" : "text-neutral-600 hover:text-black"
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business, user, PAN name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-hairline bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
          />
        </div>
      </div>

      {/* KYC Submissions Table */}
      <div className="bg-white border border-hairline rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-surface-soft text-neutral-600 uppercase tracking-wider font-mono font-semibold border-b border-hairline">
              <tr>
                <th className="px-5 py-3.5">Business &amp; Workspace</th>
                <th className="px-5 py-3.5">Account Owner</th>
                <th className="px-5 py-3.5">Verification Signals</th>
                <th className="px-5 py-3.5">Use Case</th>
                <th className="px-5 py-3.5">Submitted</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-neutral-400 font-medium">
                    No KYC submissions match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => {
                  const isApproved = r.status === "approved";
                  const isPending = r.status === "pending";
                  const isRejected = r.status === "rejected";

                  return (
                    <tr key={r.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Business & Workspace */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isApproved ? "bg-emerald-100 text-emerald-700" : isPending ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                          }`}>
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-neutral-900 text-sm">{r.business_name || "Unnamed Business"}</span>
                            <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                              <span>Workspace:</span>
                              <span className="font-medium text-neutral-700">{r.workspaces?.name || r.workspace_id}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Account Owner */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-neutral-900 block">
                            {r.owner?.full_name || (r.owner?.email ? r.owner.email.split('@')[0] : "Account Owner")}
                          </span>
                          {r.owner?.email && (
                            <p className="text-neutral-500 text-[11px] flex items-center gap-1 font-mono">
                              <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span>{r.owner.email}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Verification Signals */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          {r.pan_verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CreditCard className="w-2.5 h-2.5 text-emerald-600" />
                              <span>PAN Verified{r.verified_pan_name ? `: ${r.verified_pan_name}` : ''}</span>
                            </span>
                          )}
                          {r.digilocker_verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                              <Fingerprint className="w-2.5 h-2.5 text-blue-600" />
                              <span>DigiLocker Aadhaar Verified</span>
                            </span>
                          )}
                          {!r.pan_verified && !r.digilocker_verified && (
                            <span className="text-[10px] text-neutral-400 italic">Self-Submitted Document</span>
                          )}
                        </div>
                      </td>

                      {/* Use Case */}
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-neutral-700 text-xs truncate" title={r.use_case || "AI Voice Calling Assistants"}>
                          {r.use_case || "AI Voice Calling Assistants"}
                        </p>
                      </td>

                      {/* Submitted Date */}
                      <td className="px-5 py-4 font-mono text-[11px] text-neutral-500">
                        {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>

                      {/* Status Tag */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          isApproved ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                          isPending ? "bg-amber-100 text-amber-800 border border-amber-200" :
                          "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isApproved ? "bg-emerald-600" : isPending ? "bg-amber-600 animate-pulse" : "bg-rose-600"
                          }`}></span>
                          {r.status}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedDetail(r)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 border border-hairline transition-all"
                            title="View Full Submission Audit"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                disabled={isProcessing === r.id}
                                onClick={() => handleApprove(r.id, r.business_name)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all inline-flex items-center gap-1"
                                title="Approve KYC"
                              >
                                {isProcessing === r.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                <span>Approve</span>
                              </button>

                              <button
                                disabled={isProcessing === r.id}
                                onClick={() => handleReject(r.id, r.business_name)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all inline-flex items-center gap-1"
                                title="Reject KYC"
                              >
                                <UserX className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              disabled={isProcessing === r.id}
                              onClick={() => handleReset(r.id, r.business_name)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-neutral-500 hover:text-black hover:bg-neutral-100 border border-hairline transition-all"
                              title="Reset to Pending"
                            >
                              Reset
                            </button>
                          )}

                          {isRejected && (
                            <button
                              disabled={isProcessing === r.id}
                              onClick={() => handleApprove(r.id, r.business_name)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all inline-flex items-center gap-1"
                              title="Re-approve"
                            >
                              <Check className="w-3 h-3" />
                              <span>Re-Approve</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL & AUDIT MODAL */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-hairline rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-scaleIn text-black">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                  selectedDetail.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  selectedDetail.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900">{selectedDetail.business_name}</h3>
                  <p className="text-xs text-neutral-500">KYC Verification Audit Details</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDetail(null)}
                className="text-neutral-400 hover:text-black p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-soft border border-hairline">
                <div>
                  <span className="text-neutral-400 font-mono uppercase text-[10px] font-bold">Workspace</span>
                  <p className="font-semibold text-neutral-900 mt-0.5">{selectedDetail.workspaces?.name || selectedDetail.workspace_id}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-mono uppercase text-[10px] font-bold">Account Owner</span>
                  <p className="font-semibold text-neutral-900 mt-0.5">{selectedDetail.owner?.email || "Unknown"}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-mono uppercase text-[10px] font-bold">Submitted Date</span>
                  <p className="font-semibold text-neutral-900 mt-0.5">{new Date(selectedDetail.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-mono uppercase text-[10px] font-bold">Current Status</span>
                  <p className={`font-bold uppercase mt-0.5 ${
                    selectedDetail.status === 'approved' ? 'text-emerald-700' :
                    selectedDetail.status === 'pending' ? 'text-amber-700' : 'text-rose-700'
                  }`}>
                    {selectedDetail.status}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-wider">Verification Signals</span>
                <div className="p-3.5 rounded-xl border border-hairline space-y-2 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700 font-medium">PAN Verification:</span>
                    <span className={`font-bold ${selectedDetail.pan_verified ? 'text-emerald-600 flex items-center gap-1' : 'text-neutral-400'}`}>
                      {selectedDetail.pan_verified ? <><CheckCircle2 className="w-3.5 h-3.5" /> Verified</> : 'Not verified'}
                    </span>
                  </div>
                  {selectedDetail.verified_pan_name && (
                    <div className="flex items-center justify-between text-neutral-600">
                      <span>PAN Entity Name:</span>
                      <span className="font-mono font-semibold text-neutral-900">{selectedDetail.verified_pan_name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-700 font-medium">DigiLocker Aadhaar:</span>
                    <span className={`font-bold ${selectedDetail.digilocker_verified ? 'text-blue-600 flex items-center gap-1' : 'text-neutral-400'}`}>
                      {selectedDetail.digilocker_verified ? <><CheckCircle2 className="w-3.5 h-3.5" /> Authenticated</> : 'Not authenticated'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-wider">Business Calling Use Case</span>
                <p className="p-3 rounded-xl bg-surface-soft border border-hairline text-neutral-800 leading-relaxed">
                  {selectedDetail.use_case || "AI Voice Calling Assistants for inbound & outbound customer support."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
              >
                Close
              </button>
              {selectedDetail.status === 'pending' && (
                <button
                  type="button"
                  disabled={isProcessing === selectedDetail.id}
                  onClick={() => handleApprove(selectedDetail.id, selectedDetail.business_name)}
                  className="btn-pill-primary bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5 py-2 font-bold shadow-sm inline-flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Entity</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
