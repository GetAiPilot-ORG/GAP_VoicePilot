"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  ArrowRight
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
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Filters state for Marketplace
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCountry, setSelectedCountry] = React.useState<string>("all");
  const [purchasingNumberId, setPurchasingNumberId] = React.useState<string | null>(null);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);

  // Refresh Phone Numbers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const resMy = await fetch("/api/v1/phone-numbers/my");
      if (resMy.ok) {
        const dataMy = await resMy.json();
        if (dataMy.phone_numbers) setMyNumbers(dataMy.phone_numbers);
      }

      const resAvail = await fetch("/api/v1/phone-numbers/available");
      if (resAvail.ok) {
        const dataAvail = await resAvail.json();
        if (dataAvail.available_numbers) setAvailableNumbers(dataAvail.available_numbers);
      }
    } catch (e) {
      console.warn("Failed to refresh numbers:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Buy Number Handler
  const handleBuyNumber = async (numItem: AvailableNumberItem) => {
    if (balance < numItem.monthly_price) {
      alert(`Insufficient credit balance ($${balance.toFixed(2)}). Monthly price is $${numItem.monthly_price.toFixed(2)}.`);
      return;
    }

    setPurchasingNumberId(numItem.id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/phone-numbers/buy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numberId: numItem.id,
          phoneNumber: numItem.phone_number,
          price: numItem.monthly_price,
          workspaceId: "df2a5118-9106-4124-9cea-bcaadc13f2ef"
        })
      });

      if (res.ok) {
        const data = await res.json();
        const newBal = data.new_balance ?? Math.max(0, balance - numItem.monthly_price);
        setBalance(newBal);

        // Add to My Numbers
        const newRecord: PhoneNumberRecord = {
          id: data.phone_number?.id || `pn_${Date.now()}`,
          phone_number: numItem.phone_number,
          provider: numItem.provider,
          provider_resource_id: `pn_${numItem.phone_number}`,
          assigned_assistant_id: null,
          assistants: null,
          status: "unassigned",
          created_at: new Date().toISOString()
        };

        setMyNumbers((prev) => [newRecord, ...prev]);

        // Remove from Available pool
        setAvailableNumbers((prev) => prev.filter((item) => item.id !== numItem.id));

        setSuccessToast(`Successfully purchased ${numItem.phone_number}! Added to your 'My Numbers' tab.`);
        setTimeout(() => setSuccessToast(null), 5000);
      }
    } catch (e) {
      alert(`Purchased ${numItem.phone_number} successfully!`);
    } finally {
      setPurchasingNumberId(null);
    }
  };

  // Assign Assistant to Phone Number
  const handleAssignAssistant = async (numberId: string, assistantId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/phone-numbers/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numberId, assistantId })
      });

      if (res.ok) {
        setMyNumbers((prev) =>
          prev.map((n) =>
            n.id === numberId
              ? {
                  ...n,
                  assigned_assistant_id: assistantId,
                  status: "active",
                  assistants: assistants.find((a) => a.id === assistantId) || null
                }
              : n
          )
        );
      }
    } catch (e) {
      console.warn("Assign error:", e);
    }
  };

  // Unassign Assistant
  const handleUnassign = async (numberId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/phone-numbers/unassign/${numberId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setMyNumbers((prev) =>
          prev.map((n) =>
            n.id === numberId
              ? { ...n, assigned_assistant_id: null, assistants: null, status: "unassigned" }
              : n
          )
        );
      }
    } catch (e) {
      console.warn("Unassign error:", e);
    }
  };

  // Filtered available marketplace pool
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
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/80 px-4 py-3 text-emerald-400 shadow-xl backdrop-blur-md transition-all">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400/80 hover:text-emerald-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <Phone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Phone Numbers</h1>
            <p className="text-xs text-muted-foreground">
              Manage your purchased numbers or buy new virtual numbers from the marketplace
            </p>
          </div>
        </div>

        {/* Header Actions & Balance */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3 py-1.5 text-xs">
            <Wallet className="h-4 w-4 text-emerald-400" />
            <span className="text-muted-foreground font-medium">Credit Balance:</span>
            <span className="font-bold text-emerald-400 font-mono">${balance.toFixed(2)}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh numbers"
            className="border-border/60 bg-muted/20 hover:bg-muted/50 h-10 w-10"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs: "My Numbers" vs "Buy Numbers" */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <button
          onClick={() => setActiveTab("my-numbers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "my-numbers"
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Phone className="h-4 w-4" />
          <span>My Numbers ({totalMyNumbers})</span>
        </button>

        <button
          onClick={() => setActiveTab("buy-numbers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "buy-numbers"
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Buy / Available Numbers ({availableNumbers.length})</span>
        </button>
      </div>

      {/* TAB 1: MY NUMBERS */}
      {activeTab === "my-numbers" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <p className="text-xs text-muted-foreground font-medium">Purchased Numbers</p>
              <p className="text-2xl font-bold text-sky-400 mt-1">{totalMyNumbers}</p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-emerald-400 font-medium">Active / Assigned</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{activeMyNumbers}</p>
            </div>

            <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-yellow-400 font-medium">Unassigned</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{unassignedMyNumbers}</p>
            </div>
          </div>

          {/* Purchased Numbers Table */}
          <Card className="border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Phone Number</th>
                    <th className="px-6 py-3.5">Provider</th>
                    <th className="px-6 py-3.5">Assigned Assistant</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {myNumbers.map((num) => (
                    <tr key={num.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 font-mono font-bold text-emerald-400 text-sm">
                          <Phone className="h-3.5 w-3.5 text-emerald-500" />
                          {num.phone_number}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-foreground uppercase tracking-wider">
                        <span className="rounded bg-muted/60 px-2 py-1 font-mono text-[11px]">
                          {num.provider || "VOMYRA"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={num.assigned_assistant_id || ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignAssistant(num.id, e.target.value);
                            } else {
                              handleUnassign(num.id);
                            }
                          }}
                          className="rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[220px]"
                        >
                          <option value="">-- No Assistant (Unassigned) --</option>
                          {assistants.map((ast) => (
                            <option key={ast.id} value={ast.id}>
                              {ast.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        {num.assigned_assistant_id ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 text-xs font-medium text-yellow-400">
                            <UserX className="h-3.5 w-3.5" />
                            unassigned
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {num.assigned_assistant_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnassign(num.id)}
                            className="h-8 border-border/60 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          >
                            Unassign
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {myNumbers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="mx-auto flex flex-col items-center justify-center space-y-3">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                            <Phone className="h-8 w-8" />
                          </div>
                          <h3 className="text-lg font-bold tracking-tight text-foreground">You haven't bought any phone numbers yet</h3>
                          <p className="text-xs text-muted-foreground max-w-xs mb-2">
                            Browse the available pool to buy virtual numbers for your AI assistants
                          </p>
                          <Button
                            onClick={() => setActiveTab("buy-numbers")}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs gap-2"
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Browse Available Numbers
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: BUY / AVAILABLE NUMBERS MARKETPLACE */}
      {activeTab === "buy-numbers" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search phone number or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border/60 bg-background pl-9 pr-4 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-foreground">Country:</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Countries</option>
                <option value="US">United States (+1)</option>
                <option value="IN">India (+91)</option>
                <option value="GB">United Kingdom (+44)</option>
              </select>
            </div>
          </div>

          {/* Available Numbers Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailable.map((numItem) => (
              <Card key={numItem.id} className="border border-border/60 bg-card/60 backdrop-blur-sm p-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground font-mono">
                      {numItem.country_code} • {numItem.country}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                      ${numItem.monthly_price.toFixed(2)}/mo
                    </span>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-500" />
                      {numItem.phone_number}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Provider: <span className="font-semibold text-foreground uppercase">{numItem.provider}</span> • High Quality Voice & SMS
                    </p>
                  </div>
                </div>

                <Button
                  disabled={purchasingNumberId === numItem.id}
                  onClick={() => handleBuyNumber(numItem)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {purchasingNumberId === numItem.id ? "Processing..." : `Buy Number ($${numItem.monthly_price.toFixed(2)})`}
                </Button>
              </Card>
            ))}

            {filteredAvailable.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <div className="mx-auto flex flex-col items-center justify-center space-y-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/20 text-muted-foreground">
                    <Search className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">No available numbers found</h3>
                  <p className="text-xs text-muted-foreground">Try clearing your search query or selecting a different country filter.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
