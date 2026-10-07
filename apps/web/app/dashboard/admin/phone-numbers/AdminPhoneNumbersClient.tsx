"use client";

import * as React from "react";
import Link from "next/link";
import {
  Phone,
  CheckCircle2,
  Inbox,
  ShieldCheck,
  Search,
  Copy,
  Check,
  UserCheck,
  UserX,
  RefreshCw,
  Globe,
  Bot,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Building2,
  Mail,
  PlusCircle,
  X
} from "lucide-react";
import { adminAssignNumberAction, adminReleaseNumberAction } from "@/app/actions/phoneNumbers";

interface PhoneNumberItem {
  id: string;
  phone_number: string;
  provider: string;
  provider_resource_id?: string;
  workspace_id?: string | null;
  assigned_assistant_id?: string | null;
  status: string;
  created_at: string;
  current_period_start?: string | null;
  current_period_end?: string | null;
  workspaces?: {
    id: string;
    name: string;
    owner_id?: string;
  } | null;
  assistants?: {
    id: string;
    name: string;
  } | null;
  owner?: {
    id?: string;
    email?: string;
    full_name?: string;
  } | null;
}

interface WorkspaceItem {
  id: string;
  name: string;
  owner_id?: string;
  owner?: {
    email?: string;
    full_name?: string;
  } | null;
}

export function AdminPhoneNumbersClient({
  initialNumbers,
  vomyraNumbers = [],
  allWorkspaces = []
}: {
  initialNumbers: PhoneNumberItem[];
  vomyraNumbers: any[];
  allWorkspaces: WorkspaceItem[];
}) {
  const [numbers, setNumbers] = React.useState<PhoneNumberItem[]>(initialNumbers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterTab, setFilterTab] = React.useState<"all" | "assigned" | "pool" | "expired">("all");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Assign modal state
  const [assignModalNumber, setAssignModalNumber] = React.useState<string | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string>(allWorkspaces[0]?.id || "");

  // Computed subsets
  const assignedNumbers = numbers.filter(n => n.workspace_id !== null);
  const unassignedDbNumbers = numbers.filter(n => n.workspace_id === null);

  const allDbPhones = new Set(numbers.map(n => n.phone_number));
  const trulyAvailableVomyra = vomyraNumbers.filter(n => {
    const clean = String(n.phone_number || n.number).trim();
    return !allDbPhones.has(clean);
  });

  const totalPoolCount = unassignedDbNumbers.length + trulyAvailableVomyra.length;
  const expiredCount = assignedNumbers.filter(
    n => n.current_period_end && new Date(n.current_period_end).getTime() <= Date.now()
  ).length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAssignToWorkspace = async () => {
    if (!assignModalNumber || !selectedWorkspaceId) return;
    setIsProcessing(true);
    try {
      const res = await adminAssignNumberAction({
        phoneNumber: assignModalNumber,
        workspaceId: selectedWorkspaceId
      });

      if (res.success) {
        setToastMessage({ type: 'success', text: `Number ${assignModalNumber} successfully assigned!` });
        setAssignModalNumber(null);
        window.location.reload();
      } else {
        setToastMessage({ type: 'error', text: res.error || "Failed to assign number" });
      }
    } catch (e: any) {
      setToastMessage({ type: 'error', text: e.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReleaseToPool = async (phoneId: string, phoneNumber: string) => {
    if (!confirm(`Are you sure you want to unassign ${phoneNumber} and return it to the available pool?`)) {
      return;
    }
    setIsProcessing(true);
    try {
      const res = await adminReleaseNumberAction(phoneId);
      if (res.success) {
        setToastMessage({ type: 'success', text: `Number ${phoneNumber} released to pool!` });
        setNumbers(prev => prev.map(n => n.id === phoneId ? { ...n, workspace_id: null, assigned_assistant_id: null, status: 'unassigned' } : n));
      } else {
        setToastMessage({ type: 'error', text: res.error || "Failed to release number" });
      }
    } catch (e: any) {
      setToastMessage({ type: 'error', text: e.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter & Search logic
  const filteredAssigned = assignedNumbers.filter(n => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      n.phone_number.toLowerCase().includes(q) ||
      (n.workspaces?.name || "").toLowerCase().includes(q) ||
      (n.owner?.email || "").toLowerCase().includes(q) ||
      (n.owner?.full_name || "").toLowerCase().includes(q) ||
      (n.assistants?.name || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;

    const isExpired = Boolean(n.current_period_end && new Date(n.current_period_end).getTime() <= Date.now());

    if (filterTab === "expired") return isExpired;
    if (filterTab === "assigned") return true;
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

      {/* Admin Top Navigation & Header */}
      <div className="space-y-6 border-b border-hairline pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow text-neutral-500">// ADMIN CONTROL PANEL</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-white">
                ADMIN
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 mt-1">Phone Numbers Inventory</h1>
            <p className="text-sm text-neutral-600">Track all assigned numbers, inspect workspace allocations, and manage the available telephony pool.</p>
          </div>
        </div>

        {/* Sub-tabs between Admin Sections */}
        <div className="inline-flex p-1 bg-surface-soft border border-hairline rounded-xl gap-1">
          <Link
            href="/dashboard/admin/kyc"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-neutral-600 hover:text-black hover:bg-white/50 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
            <span>KYC Verifications</span>
          </Link>

          <Link
            href="/dashboard/admin/phone-numbers"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-white text-black shadow-xs border border-black/5"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phone Numbers Inventory</span>
          </Link>
        </div>
      </div>

      {/* Metrics Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-hairline shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Telephony Lines</span>
            <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-neutral-900">{numbers.length + trulyAvailableVomyra.length}</span>
            <p className="text-[11px] text-neutral-500 mt-0.5">Total across system &amp; Vomyra gateway</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-hairline shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Assigned Lines</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-600">{assignedNumbers.length}</span>
            <p className="text-[11px] text-neutral-500 mt-0.5">Bound to active workspaces</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-hairline shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Available Pool</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-indigo-600">{totalPoolCount}</span>
            <p className="text-[11px] text-neutral-500 mt-0.5">Ready for new provisioning</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-hairline shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Expired Lines</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-rose-600">{expiredCount}</span>
            <p className="text-[11px] text-neutral-500 mt-0.5">30-day period ended; awaiting renewal</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sub-Filters */}
        <div className="inline-flex p-1 bg-surface-soft border border-hairline rounded-xl gap-1">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "all" ? "bg-white text-black shadow-xs" : "text-neutral-600 hover:text-black"
            }`}
          >
            All Assigned ({assignedNumbers.length})
          </button>
          <button
            onClick={() => setFilterTab("assigned")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "assigned" ? "bg-white text-black shadow-xs" : "text-neutral-600 hover:text-black"
            }`}
          >
            Active Only ({assignedNumbers.length - expiredCount})
          </button>
          <button
            onClick={() => setFilterTab("expired")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "expired" ? "bg-white text-black shadow-xs" : "text-neutral-600 hover:text-black"
            }`}
          >
            Expired Lines ({expiredCount})
          </button>
          <button
            onClick={() => setFilterTab("pool")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterTab === "pool" ? "bg-white text-black shadow-xs" : "text-neutral-600 hover:text-black"
            }`}
          >
            Available Pool ({totalPoolCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search number, workspace, user..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-hairline bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
          />
        </div>
      </div>

      {/* VIEW 1: ASSIGNED NUMBERS TABLE */}
      {filterTab !== "pool" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Assigned Phone Lines Directory ({filteredAssigned.length})</span>
            </h2>
          </div>

          <div className="bg-white border border-hairline rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-surface-soft text-neutral-600 uppercase tracking-wider font-mono font-semibold border-b border-hairline">
                  <tr>
                    <th className="px-5 py-3.5">Phone Line</th>
                    <th className="px-5 py-3.5">Assigned Workspace &amp; Owner</th>
                    <th className="px-5 py-3.5">Assigned Assistant</th>
                    <th className="px-5 py-3.5">Validity Period</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredAssigned.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-neutral-400 font-medium">
                        No assigned phone lines match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAssigned.map((item) => {
                      const isExpired = Boolean(
                        item.current_period_end &&
                        new Date(item.current_period_end).getTime() <= Date.now()
                      );

                      const daysLeft = item.current_period_end 
                        ? Math.ceil((new Date(item.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        : null;

                      return (
                        <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                          {/* Phone Line */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isExpired ? "bg-rose-100 text-rose-700" : "bg-neutral-900 text-white"
                              }`}>
                                <Phone className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-neutral-900 text-sm">{item.phone_number}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(item.phone_number, item.id)}
                                    title="Copy"
                                    className="p-1 rounded text-neutral-400 hover:text-black hover:bg-neutral-100"
                                  >
                                    {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-500 uppercase">
                                  <Globe className="w-2.5 h-2.5" /> {item.provider}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Workspace & Owner */}
                          <td className="px-5 py-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                                <span className="font-semibold text-neutral-900">{item.workspaces?.name || "Unknown Workspace"}</span>
                              </div>
                              {item.owner?.email && (
                                <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  <span>{item.owner.email}</span>
                                  {item.owner.full_name && <span className="text-neutral-400 font-normal">({item.owner.full_name})</span>}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Assistant */}
                          <td className="px-5 py-4">
                            {item.assistants?.name ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-900 border border-hairline">
                                <Bot className="w-3.5 h-3.5 text-purple-600" />
                                {item.assistants.name}
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-xs italic">Unassigned bot</span>
                            )}
                          </td>

                          {/* Validity Period */}
                          <td className="px-5 py-4 font-mono text-xs">
                            {item.current_period_end ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 text-neutral-700">
                                  <Calendar className="w-3 h-3 text-neutral-400" />
                                  <span>{new Date(item.current_period_end).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                </div>
                                <span className={`text-[10px] font-bold ${isExpired ? "text-rose-600" : "text-emerald-700"}`}>
                                  {isExpired ? "Expired" : `${daysLeft} days remaining`}
                                </span>
                              </div>
                            ) : (
                              <span className="text-neutral-400 text-[11px]">Lifetime / Unlimited</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            {isExpired ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                                Expired
                              </span>
                            ) : item.assigned_assistant_id ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                                Unbound
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setAssignModalNumber(item.phone_number);
                                  setSelectedWorkspaceId(item.workspace_id || allWorkspaces[0]?.id || "");
                                }}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-hairline transition-all inline-flex items-center gap-1"
                                title="Reassign to another workspace"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Reassign</span>
                              </button>

                              <button
                                onClick={() => handleReleaseToPool(item.id, item.phone_number)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all inline-flex items-center gap-1"
                                title="Release back to available pool"
                              >
                                <UserX className="w-3 h-3" />
                                <span>Release</span>
                              </button>
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
        </div>
      )}

      {/* VIEW 2: AVAILABLE TELEPHONY POOL */}
      {(filterTab === "all" || filterTab === "pool") && (
        <div className="space-y-4 pt-4 border-t border-hairline">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-indigo-600" />
                <span>Available Numbers Pool ({totalPoolCount})</span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">Unassigned virtual numbers ready to be allocated to workspaces.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Unassigned numbers in local DB */}
            {unassignedDbNumbers.map(n => (
              <div key={n.id} className="p-4 rounded-xl border border-hairline bg-white shadow-xs flex items-center justify-between hover:border-black/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-sm text-neutral-900">{n.phone_number}</span>
                    <p className="text-[10px] text-neutral-500 font-mono">Local DB Pool</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAssignModalNumber(n.phone_number);
                    setSelectedWorkspaceId(allWorkspaces[0]?.id || "");
                  }}
                  className="btn-pill-primary bg-neutral-900 hover:bg-black text-white text-xs px-3 py-1.5 font-bold shadow-xs inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Assign</span>
                </button>
              </div>
            ))}

            {/* Truly available numbers in Vomyra gateway */}
            {trulyAvailableVomyra.map((n: any, idx: number) => {
              const num = String(n.phone_number || n.number).trim();
              return (
                <div key={idx} className="p-4 rounded-xl border border-hairline bg-white shadow-xs flex items-center justify-between hover:border-black/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono font-bold text-sm text-neutral-900">{num}</span>
                      <p className="text-[10px] text-emerald-700 font-semibold uppercase">Vomyra Gateway Pool</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAssignModalNumber(num);
                      setSelectedWorkspaceId(allWorkspaces[0]?.id || "");
                    }}
                    className="btn-pill-primary bg-neutral-900 hover:bg-black text-white text-xs px-3 py-1.5 font-bold shadow-xs inline-flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Assign</span>
                  </button>
                </div>
              );
            })}

            {totalPoolCount === 0 && (
              <div className="col-span-full p-8 border border-hairline rounded-xl text-center text-xs text-neutral-400 bg-surface-soft">
                No unassigned phone lines in the available pool.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ASSIGN / REASSIGN MODAL */}
      {assignModalNumber && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-hairline rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-scaleIn text-black">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Assign Phone Line
                </h3>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">{assignModalNumber}</p>
              </div>
              <button 
                onClick={() => setAssignModalNumber(null)}
                className="text-neutral-400 hover:text-black p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-neutral-700">
                Select Destination Workspace
              </label>
              <select
                value={selectedWorkspaceId}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-hairline bg-surface-soft text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
              >
                {allWorkspaces.map(ws => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} {ws.owner?.email ? `(${ws.owner.email})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-neutral-500">
                Assigning this phone number will grant 30-day validity to the selected workspace.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAssignModalNumber(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleAssignToWorkspace}
                className="btn-pill-primary bg-neutral-900 hover:bg-black text-white text-xs px-5 py-2.5 font-bold shadow-sm inline-flex items-center gap-2"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Confirm Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
