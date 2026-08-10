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

export interface AvailableNumberItem {
  id: string;
  phone_number: string;
  country: string;
  country_code: string;
  provider: string;
  monthly_price: number;
}

export interface AssistantOption {
  id: string;
  name: string;
}

interface PhoneNumbersClientProps {
  initialMyNumbers: PhoneNumberRecord[];
  initialAvailableNumbers: AvailableNumberItem[];
  assistants: AssistantOption[];
  workspaceBalance: number;
}

export function PhoneNumbersClient({
  initialMyNumbers,
  initialAvailableNumbers,
  assistants,
  workspaceBalance: initialBalance
}: PhoneNumbersClientProps) {
  const [activeTab, setActiveTab] = React.useState<"my-numbers" | "buy-numbers">("my-numbers");

  const [myNumbers, setMyNumbers] = React.useState<PhoneNumberRecord[]>(initialMyNumbers);
  const [availableNumbers, setAvailableNumbers] = React.useState<AvailableNumberItem[]>(initialAvailableNumbers);
  const [balance, setBalance] = React.useState<number>(initialBalance);
  const [isFetching, setIsFetching] = React.useState(false);

  // Filters state for Marketplace
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCountry, setSelectedCountry] = React.useState<string>("all");
  const [purchasingNumberId, setPurchasingNumberId] = React.useState<string | null>(null);
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
      if (res.availableNumbers) setAvailableNumbers(res.availableNumbers);

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

  const handlePurchaseNumber = async (item: AvailableNumberItem) => {
    setPurchasingNumberId(item.id);
    try {
      const { buyPhoneNumberAction } = await import("@/app/actions/phoneNumbers");
      const res = await buyPhoneNumberAction(item.id, item.phone_number, item.provider);

      if (res.success && res.newNumber) {
        setAvailableNumbers((prev) => prev.filter((n) => n.id !== item.id));
        setMyNumbers((prev) => [
          {
            id: res.newNumber.id,
            phone_number: res.newNumber.phone_number,
            provider: res.newNumber.provider,
            provider_resource_id: res.newNumber.provider_resource_id,
            assigned_assistant_id: null,
            assistants: null,
            status: "unassigned",
            created_at: new Date().toISOString()
          },
          ...prev
        ]);
        setToastMessage({
          type: 'success',
          text: `Phone number ${item.phone_number} acquired successfully!`
        });
        setActiveTab("my-numbers");
      }
    } catch (e: any) {
      alert("Purchase failed: " + e.message);
    } finally {
      setPurchasingNumberId(null);
    }
  };

  const filteredAvailable = availableNumbers.filter((num) => {
    const matchesSearch = num.phone_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      num.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === "all" || num.country_code.toLowerCase() === selectedCountry.toLowerCase();
    return matchesSearch && matchesCountry;
  });

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
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Available Marketplace ({availableNumbers.length})</span>
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
                <Phone className="w-8 h-8 text-neutral-300 mx-auto" />
                <p className="text-xs font-semibold text-neutral-700">No phone numbers assigned to your workspace yet.</p>
                <p className="text-[11px] text-neutral-500">Click "Sync Telephony Numbers" to query your gateway, or browse available marketplace numbers below.</p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    disabled={isFetching}
                    onClick={handleFetchVomyraNumbers}
                    className="btn-pill-primary text-xs px-4 py-2 inline-flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isFetching ? "Syncing API..." : "Sync Telephony Numbers"}
                  </button>
                  <button
                    onClick={() => setActiveTab("buy-numbers")}
                    className="btn-pill-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5"
                  >
                    Browse Available Numbers
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
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

      {/* TAB 2: BUY AVAILABLE NUMBERS */}
      {activeTab === "buy-numbers" && (
        <div className="space-y-6">
          {/* Marketplace Search & Filter Header */}
          <div className="p-4 rounded-[10px] bg-surface-soft border border-hairline flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search number or area code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-hairline rounded-[10px] focus:outline-none focus:border-black/30"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-semibold text-neutral-600 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Country:
              </span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-2 bg-white border border-hairline rounded-[10px] text-xs font-medium text-black focus:outline-none"
              >
                <option value="all">All Countries</option>
                <option value="US">United States (+1)</option>
                <option value="IN">India (+91)</option>
              </select>
            </div>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailable.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white border border-hairline rounded-[10px] text-neutral-500 text-xs">
                No available virtual numbers match your search filter.
              </div>
            ) : (
              filteredAvailable.map((num) => {
                const isBuying = purchasingNumberId === num.id;
                return (
                  <div
                    key={num.id}
                    className="p-4 rounded-[10px] bg-white border border-hairline hover:border-black/30 shadow-sm transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                          {num.country} ({num.country_code})
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-surface-soft border border-hairline text-neutral-600">
                          {num.provider}
                        </span>
                      </div>
                      <div className="text-lg font-extrabold font-mono text-black">
                        {num.phone_number}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-hairline flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-black">${num.monthly_price.toFixed(2)}</span>
                        <span className="text-[10px] text-neutral-500"> /month</span>
                      </div>

                      <button
                        disabled={isBuying}
                        onClick={() => handlePurchaseNumber(num)}
                        className="btn-pill-primary rounded-[10px] text-xs px-3.5 py-1.5 shadow-sm"
                      >
                        {isBuying ? "Claiming..." : "Claim Number"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
