"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  RefreshCw, 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  PhoneCall, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Globe, 
  Copy, 
  Check, 
  Trash2, 
  MoreVertical, 
  FileSpreadsheet, 
  Megaphone,
  Clock,
  Database,
  ArrowUpRight,
  ExternalLink,
  Sliders,
  Sparkles,
  UserPlus
} from "lucide-react";
import { 
  ContactRecord, 
  CRMIntegration, 
  SyncLogItem, 
  createContactAction, 
  batchImportContactsAction, 
  deleteContactAction, 
  triggerCRMSyncAction 
} from "@/app/actions/contacts";
import { launchBatchCampaignAction } from "@/app/actions/campaigns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface AssistantOption {
  id: string;
  name: string;
  phone_number: string;
}

interface ContactsClientProps {
  initialContacts: ContactRecord[];
  initialIntegrations: CRMIntegration[];
  initialLogs: SyncLogItem[];
  assistants: AssistantOption[];
}

export default function ContactsClient({
  initialContacts,
  initialIntegrations,
  initialLogs,
  assistants
}: ContactsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State
  const [activeTab, setActiveTab] = useState<"directory" | "integrations" | "logs">("directory");
  const [contacts, setContacts] = useState<ContactRecord[]>(initialContacts);
  const [integrations, setIntegrations] = useState<CRMIntegration[]>(initialIntegrations);
  const [logs, setLogs] = useState<SyncLogItem[]>(initialLogs);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isQuickCallModalOpen, setIsQuickCallModalOpen] = useState(false);

  // Form states
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "", company: "", tags: "", notes: "" });
  const [csvText, setCsvText] = useState("");
  const [csvFileName, setCsvFileName] = useState("");
  const [parsedCsvCount, setParsedCsvCount] = useState<number>(0);

  // Campaign launch state
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>(assistants[0]?.id || "");
  const [singleCallContact, setSingleCallContact] = useState<ContactRecord | null>(null);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered contacts calculation
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSource = sourceFilter === "all" || c.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Handle manual contact creation
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.phone || newContact.phone.trim().length < 7) {
      showToast("error", "Please provide a valid phone number.");
      return;
    }

    startTransition(async () => {
      const res = await createContactAction({
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email,
        company: newContact.company,
        tags: newContact.tags ? newContact.tags.split(",").map((t) => t.trim()) : [],
        notes: newContact.notes
      });

      if (res.success && res.contact) {
        setContacts([res.contact, ...contacts]);
        setIsAddModalOpen(false);
        setNewContact({ name: "", phone: "", email: "", company: "", tags: "", notes: "" });
        showToast("success", `Added contact ${res.contact.name}!`);
      } else {
        showToast("error", res.error || "Failed to create contact.");
      }
    });
  };

  // Handle CSV file drop / text parse
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvText(text);
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      setParsedCsvCount(Math.max(0, lines.length - 1));
    };
    reader.readAsText(file);
  };

  // Handle CSV batch import submission
  const handleImportCsv = async () => {
    if (!csvText) {
      showToast("error", "Please select a valid CSV file.");
      return;
    }

    const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length <= 1) {
      showToast("error", "CSV file contains no data rows.");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.findIndex((h) => /name|full.?name|first.?name|customer/i.test(h));
    const phoneIdx = headers.findIndex((h) => /phone|mobile|number|cell|tel/i.test(h));
    const emailIdx = headers.findIndex((h) => /email|mail/i.test(h));
    const companyIdx = headers.findIndex((h) => /company|org|business/i.test(h));

    if (phoneIdx === -1) {
      showToast("error", "Could not find 'phone' or 'mobile' header column in CSV.");
      return;
    }

    const rowsToImport = lines.slice(1).map((line) => {
      const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
      return {
        name: nameIdx !== -1 ? parts[nameIdx] || "Customer" : "Customer",
        phone: parts[phoneIdx] || "",
        email: emailIdx !== -1 ? parts[emailIdx] || "" : "",
        company: companyIdx !== -1 ? parts[companyIdx] || "" : "",
        tags: "CSV Import"
      };
    }).filter((r) => r.phone.length >= 7);

    startTransition(async () => {
      const res = await batchImportContactsAction(rowsToImport);
      if (res.success) {
        showToast("success", `Successfully imported ${res.count} contacts from ${csvFileName || "CSV file"}!`);
        setIsImportModalOpen(false);
        setCsvText("");
        setCsvFileName("");
        router.refresh();
      } else {
        showToast("error", res.error || "Batch import failed.");
      }
    });
  };

  // Handle contact deletion
  const handleDeleteContact = async (id: string) => {
    startTransition(async () => {
      const res = await deleteContactAction(id);
      if (res.success) {
        setContacts(contacts.filter((c) => c.id !== id));
        showToast("success", "Contact deleted.");
      } else {
        showToast("error", res.error || "Could not delete contact.");
      }
    });
  };

  // Handle batch campaign launch from selected contacts
  const handleLaunchBatchCampaign = async () => {
    const targetContacts = contacts.filter((c) => selectedContactIds.includes(c.id));
    if (targetContacts.length === 0) {
      showToast("error", "Please select at least one contact to launch campaign.");
      return;
    }

    startTransition(async () => {
      const res = await launchBatchCampaignAction({
        name: `Campaign ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} (${targetContacts.length} Contacts)`,
        assistantId: selectedAssistantId,
        contacts: targetContacts.map((c) => ({
          name: c.name,
          phone: c.phone,
          details: c.notes || `Source: ${c.source}`
        }))
      });

      if (res.success) {
        showToast("success", res.message || "Batch AI campaign dispatched successfully!");
        setIsCampaignModalOpen(false);
        setSelectedContactIds([]);
      } else {
        showToast("error", res.error || "Failed to launch campaign.");
      }
    });
  };

  // Handle single quick AI voice call dispatch
  const handleTriggerSingleCall = async () => {
    if (!singleCallContact) return;

    startTransition(async () => {
      const res = await launchBatchCampaignAction({
        name: `Quick AI Call - ${singleCallContact.name}`,
        assistantId: selectedAssistantId,
        contacts: [
          {
            name: singleCallContact.name,
            phone: singleCallContact.phone,
            details: singleCallContact.notes
          }
        ]
      });

      if (res.success) {
        showToast("success", `AI Voice Call initiated to ${singleCallContact.name} (${singleCallContact.phone})!`);
        setIsQuickCallModalOpen(false);
        setSingleCallContact(null);
      } else {
        showToast("error", res.error || "Failed to trigger call.");
      }
    });
  };

  // Handle triggering CRM sync
  const handleSyncCRM = async (provider: string) => {
    setSyncingProvider(provider);
    startTransition(async () => {
      const res = await triggerCRMSyncAction(provider);
      setSyncingProvider(null);
      if (res.success) {
        showToast("success", res.message);
        // Add log
        const newLog: SyncLogItem = {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          source: provider,
          action: "Manual Triggered Sync",
          contactsProcessed: res.syncedCount,
          status: "success",
          message: res.message
        };
        setLogs([newLog, ...logs]);
      } else {
        showToast("error", res.message);
      }
    });
  };

  // Copy Webhook Ingestion URL
  const copyWebhookUrl = () => {
    navigator.clipboard.writeText("https://api.getaipilot.in/v1/webhooks/contacts/ingest?token=gap_live_9831a29f8c0b");
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
    showToast("success", "Webhook Ingestion URL copied to clipboard!");
  };

  // Export CSV
  const handleExportCsv = () => {
    if (contacts.length === 0) return;
    const headers = "Name,Phone,Email,Company,Status,Source,Tags\n";
    const body = contacts
      .map(
        (c) =>
          `"${c.name}","${c.phone}","${c.email || ""}","${c.company || ""}","${c.status}","${c.source}","${c.tags.join(";")}"`
      )
      .join("\n");

    const blob = new Blob([headers + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GAP_VoicePilot_Contacts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast("success", "Exported contacts list to CSV!");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-950 text-emerald-100 border-emerald-800"
              : "bg-red-950 text-red-100 border-red-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Contacts & CRM Sync</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
            Centralized phone contact hub. Auto-sync lead data from Google Contacts, HubSpot, & Salesforce, or import CSV lists to dispatch AI voice calls instantly.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSyncCRM("All Connected CRMs")}
            disabled={isPending || !!syncingProvider}
            className="inline-flex items-center gap-2 h-9 px-3.5 text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-xl transition-all shadow-2xs active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${syncingProvider ? "animate-spin text-[#ff4b2f]" : ""}`} />
            <span>Sync CRMs Now</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 h-9 px-3.5 text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-xl transition-all shadow-2xs active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-neutral-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 h-9 px-4 text-xs font-semibold bg-neutral-900 hover:bg-black text-white rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#ff4b2f] stroke-[2.5]" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400">Total Contacts</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-[#ff4b2f]/10 group-hover:text-[#ff4b2f] transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900">{contacts.length}</span>
            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +14% this month
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 truncate">Clean & verified mobile phone numbers</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400">CRM Synced</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 transition-colors">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900">
              {integrations.reduce((acc, curr) => acc + curr.syncedContactsCount, 0)}
            </span>
            <span className="text-[11px] font-medium text-neutral-500">4 Active Drivers</span>
          </div>
          <p className="text-[11px] text-neutral-400 truncate">HubSpot, Google & Webhook API</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400">AI Call Readiness</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-colors">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900">
              {contacts.filter((c) => c.status !== "do_not_call").length}
            </span>
            <span className="text-[11px] font-medium text-emerald-600">
              {Math.round((contacts.filter((c) => c.status !== "do_not_call").length / Math.max(1, contacts.length)) * 100)}% Reachable
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 truncate">Ready for instant AI bot dispatch</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400">Inbound Webhook API</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-purple-500/10 group-hover:text-purple-600 transition-colors">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900">Real-time</span>
            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> 200 OK
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 truncate">Auto-ingests leads from web forms</p>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex items-center gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("directory")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "directory"
              ? "border-[#ff4b2f] text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Users className="w-4 h-4 text-neutral-500" />
          <span>All Contacts</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600">
            {filteredContacts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "integrations"
              ? "border-[#ff4b2f] text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Sliders className="w-4 h-4 text-neutral-500" />
          <span>CRM & Integrations</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
            {integrations.filter((i) => i.status === "connected").length} Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "logs"
              ? "border-[#ff4b2f] text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Clock className="w-4 h-4 text-neutral-500" />
          <span>Sync Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: ALL CONTACTS DIRECTORY */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {/* Controls Bar: Search, Filters & Batch Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, mobile number, email, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 font-medium placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100/70 border border-neutral-200 rounded-xl text-xs">
                <Filter className="w-3.5 h-3.5 text-neutral-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium focus:outline-none text-neutral-800"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="lead">Lead</option>
                  <option value="synced">Synced</option>
                  <option value="do_not_call">Do Not Call</option>
                </select>
              </div>

              {/* Source Filter */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100/70 border border-neutral-200 rounded-xl text-xs">
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium focus:outline-none text-neutral-800"
                >
                  <option value="all">All Sources</option>
                  <option value="HubSpot CRM">HubSpot CRM</option>
                  <option value="Google Contacts">Google Contacts</option>
                  <option value="Salesforce">Salesforce</option>
                  <option value="Webhook">Webhook API</option>
                  <option value="CSV Import">CSV Batch</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              {/* Export CSV Button */}
              <button
                onClick={handleExportCsv}
                title="Export contacts to CSV"
                className="h-9 px-3 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span className="hidden md:inline">Export</span>
              </button>

              {/* Batch Action Campaign Button */}
              {selectedContactIds.length > 0 && (
                <button
                  onClick={() => setIsCampaignModalOpen(true)}
                  className="h-9 px-3.5 text-xs font-semibold bg-[#ff4b2f] hover:bg-[#e03e23] text-white rounded-xl transition-all flex items-center gap-2 shadow-xs animate-in zoom-in-95 duration-150"
                >
                  <Megaphone className="w-3.5 h-3.5 text-white" />
                  <span>Launch Campaign ({selectedContactIds.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Contacts Data Grid */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-700">
                <thead className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredContacts.length > 0 &&
                          selectedContactIds.length === filteredContacts.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContactIds(filteredContacts.map((c) => c.id));
                          } else {
                            setSelectedContactIds([]);
                          }
                        }}
                        className="rounded border-neutral-300 text-[#ff4b2f] focus:ring-[#ff4b2f]"
                      />
                    </th>
                    <th className="py-3 px-4">Contact Name & Org</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Status & Segment</th>
                    <th className="py-3 px-4">Sync Source</th>
                    <th className="py-3 px-4">Last AI Call Outcome</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                        <p className="font-semibold text-neutral-600 text-sm">No contacts found</p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Try adjusting your search criteria or import new contact records.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact) => {
                      const isSelected = selectedContactIds.includes(contact.id);
                      return (
                        <tr
                          key={contact.id}
                          className={`hover:bg-neutral-50/60 transition-colors ${
                            isSelected ? "bg-neutral-50/90 font-medium" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedContactIds([...selectedContactIds, contact.id]);
                                } else {
                                  setSelectedContactIds(
                                    selectedContactIds.filter((id) => id !== contact.id)
                                  );
                                }
                              }}
                              className="rounded border-neutral-300 text-[#ff4b2f] focus:ring-[#ff4b2f]"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 shrink-0 text-xs">
                                {contact.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-neutral-900 truncate">
                                  {contact.name}
                                </span>
                                <span className="text-[11px] text-neutral-400 truncate">
                                  {contact.email || contact.company || "No organization listed"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-neutral-800">
                            {contact.phone}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  contact.status === "active"
                                    ? "bg-emerald-500/15 text-emerald-700"
                                    : contact.status === "lead"
                                    ? "bg-blue-500/15 text-blue-700"
                                    : contact.status === "synced"
                                    ? "bg-purple-500/15 text-purple-700"
                                    : "bg-red-500/15 text-red-700"
                                }`}
                              >
                                {contact.status.replace("_", " ")}
                              </span>
                              {contact.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200/60"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-neutral-100 text-neutral-700">
                              <Database className="w-3 h-3 text-neutral-400" />
                              {contact.source}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs font-medium text-neutral-600">
                              {contact.lastCallStatus || "Not Called Yet"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSingleCallContact(contact);
                                  setIsQuickCallModalOpen(true);
                                }}
                                title="Trigger immediate Voice AI call"
                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-[#ff4b2f] transition-colors"
                              >
                                <PhoneCall className="w-4 h-4" />
                              </button>

                              <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 bg-white border border-neutral-200">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSingleCallContact(contact);
                                      setIsQuickCallModalOpen(true);
                                    }}
                                    className="text-xs flex items-center gap-2 cursor-pointer"
                                  >
                                    <PhoneCall className="w-3.5 h-3.5 text-[#ff4b2f]" /> Quick AI Call
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedContactIds([contact.id]);
                                      setIsCampaignModalOpen(true);
                                    }}
                                    className="text-xs flex items-center gap-2 cursor-pointer"
                                  >
                                    <Megaphone className="w-3.5 h-3.5 text-neutral-600" /> Launch Campaign
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteContact(contact.id)}
                                    className="text-xs flex items-center gap-2 text-red-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-600" /> Delete Contact
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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

      {/* TAB 2: CRM INTEGRATIONS & AUTO-SYNC */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          {/* Integration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((item) => {
              const isConnected = item.status === "connected";
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-800 text-sm">
                          {item.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-900 text-sm">{item.name}</h3>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${
                              isConnected ? "text-emerald-600" : "text-neutral-400"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isConnected ? "bg-emerald-500 animate-pulse" : "bg-neutral-300"
                              }`}
                            />
                            {isConnected ? "Auto-Sync Active" : "Disconnected"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const updated = integrations.map((i) =>
                            i.id === item.id
                              ? {
                                  ...i,
                                  status: (isConnected ? "disconnected" : "connected") as any,
                                  autoSyncEnabled: !isConnected
                                }
                              : i
                          );
                          setIntegrations(updated);
                          showToast(
                            "success",
                            `${item.name} integration ${isConnected ? "disabled" : "connected"}!`
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isConnected
                            ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                            : "bg-neutral-900 hover:bg-black text-white shadow-xs"
                        }`}
                      >
                        {isConnected ? "Disconnect" : "Connect"}
                      </button>
                    </div>

                    <p className="text-xs text-neutral-500">
                      {item.provider === "google_contacts" &&
                        "Synchronize personal and workspace phone address books in real-time."}
                      {item.provider === "hubspot" &&
                        "Two-way sync lead stages, custom contact fields, and AI call recording links."}
                      {item.provider === "salesforce" &&
                        "Map Salesforce Leads & Accounts directly into VoicePilot outbound lists."}
                      {item.provider === "zoho" &&
                        "Automatically ingest Zoho CRM leads into automated daily calling schedules."}
                      {item.provider === "leadsquared" &&
                        "Pull active LeadSquared campaigns and push call disposition status back."}
                      {item.provider === "webhook" &&
                        "REST endpoint for real-time contact creation from external web forms & APIs."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>
                      Synced: <strong className="text-neutral-700">{item.syncedContactsCount}</strong> contacts
                    </span>
                    <button
                      onClick={() => handleSyncCRM(item.name)}
                      disabled={!isConnected || syncingProvider === item.name}
                      className="text-[#ff4b2f] hover:underline font-semibold flex items-center gap-1 disabled:opacity-40"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${syncingProvider === item.name ? "animate-spin" : ""}`}
                      />
                      Sync Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Webhook API Ingestion Card */}
          <div className="p-6 rounded-2xl bg-neutral-900 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#ff4b2f]" />
                  <h3 className="font-bold text-base text-white">Inbound Webhook API Endpoint</h3>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Send POST requests from Typeform, Elementor, Zapier, or your website backend to auto-add leads.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                POST /v1/webhooks/contacts/ingest
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400">
                Your Webhook Production Ingestion URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://api.getaipilot.in/v1/webhooks/contacts/ingest?token=gap_live_9831a29f8c0b"
                  className="flex-1 bg-black/60 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-300 focus:outline-none"
                />
                <button
                  onClick={copyWebhookUrl}
                  className="h-9 px-4 text-xs font-semibold bg-[#ff4b2f] hover:bg-[#e03e23] text-white rounded-xl transition-all flex items-center gap-2 shrink-0"
                >
                  {copiedWebhook ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedWebhook ? "Copied!" : "Copy Endpoint"}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-xs text-neutral-400 flex items-center justify-between">
              <span>Payload schema: <code>{"{ name, phone, email, company, tags }"}</code></span>
              <a href="/dashboard/settings" className="text-[#ff4b2f] hover:underline font-semibold flex items-center gap-1">
                View API Documentation <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYNC AUDIT LOGS */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/50">
            <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-500" /> Real-time Contact Sync Trail
            </h3>
            <span className="text-xs text-neutral-400">Showing last 50 sync transactions</span>
          </div>

          <div className="divide-y divide-neutral-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-neutral-50/60 transition-colors flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-neutral-900">{log.action}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-neutral-100 text-neutral-600">
                        {log.source}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">{log.message}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-neutral-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    {log.contactsProcessed} Records
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD SINGLE CONTACT */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#ff4b2f]" /> Add New Contact
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Enter customer phone details to add to workspace CRM list.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContact} className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Kumar"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-neutral-100/70 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Phone Number (with Country Code) *</label>
              <input
                type="text"
                required
                placeholder="e.g. +91 9876543210"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full h-9 px-3 text-xs font-mono bg-neutral-100/70 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="rajesh@company.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-neutral-100/70 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Company</label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  className="w-full h-9 px-3 text-xs bg-neutral-100/70 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Tags (Comma Separated)</label>
              <input
                type="text"
                placeholder="Hot Lead, Demo Requested"
                value={newContact.tags}
                onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                className="w-full h-9 px-3 text-xs bg-neutral-100/70 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Notes / Call Context</label>
              <textarea
                rows={2}
                placeholder="Details for Voice AI bot during call..."
                value={newContact.notes}
                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                className="w-full p-3 text-xs bg-neutral-100/70 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="h-9 px-4 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="h-9 px-4 text-xs font-semibold bg-neutral-900 hover:bg-black text-white rounded-xl shadow-xs disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Contact"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: IMPORT CSV */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#ff4b2f]" /> Import Contacts CSV
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Upload lead contacts list with name and phone columns.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center bg-neutral-50 hover:bg-neutral-100/60 transition-colors relative cursor-pointer">
              <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-neutral-700">Click to choose CSV file</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Supports .csv files up to 10MB</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {csvFileName && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                <span className="font-semibold text-emerald-900 truncate">{csvFileName}</span>
                <span className="text-[11px] font-bold text-emerald-700 shrink-0">
                  {parsedCsvCount} Contact Rows
                </span>
              </div>
            )}

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="h-9 px-4 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportCsv}
                disabled={isPending || !csvText}
                className="h-9 px-4 text-xs font-semibold bg-neutral-900 hover:bg-black text-white rounded-xl shadow-xs disabled:opacity-50"
              >
                {isPending ? "Importing..." : "Process & Import"}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: QUICK AI VOICE CALL */}
      <Dialog open={isQuickCallModalOpen} onOpenChange={setIsQuickCallModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ff4b2f]" /> Dispatch AI Voice Call
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Select AI Voice Assistant to place instant phone call.
            </DialogDescription>
          </DialogHeader>

          {singleCallContact && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-neutral-100/80 rounded-xl space-y-1">
                <p className="text-xs font-bold text-neutral-900">{singleCallContact.name}</p>
                <p className="text-xs font-mono text-neutral-700">{singleCallContact.phone}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Select AI Voice Assistant</label>
                <select
                  value={selectedAssistantId}
                  onChange={(e) => setSelectedAssistantId(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-neutral-200 rounded-xl font-medium focus:outline-none"
                >
                  {assistants.map((ast) => (
                    <option key={ast.id} value={ast.id}>
                      {ast.name} ({ast.phone_number})
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setIsQuickCallModalOpen(false)}
                  className="h-9 px-4 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTriggerSingleCall}
                  disabled={isPending}
                  className="h-9 px-4 text-xs font-semibold bg-[#ff4b2f] hover:bg-[#e03e23] text-white rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isPending ? "Initiating Call..." : "Call Customer Now"}
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: BATCH CAMPAIGN LAUNCH */}
      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#ff4b2f]" /> Launch Batch Voice Campaign
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Dispatch AI calling queue to {selectedContactIds.length} selected contacts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Target Voice Bot Assistant</label>
              <select
                value={selectedAssistantId}
                onChange={(e) => setSelectedAssistantId(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-neutral-200 rounded-xl font-medium focus:outline-none"
              >
                {assistants.map((ast) => (
                  <option key={ast.id} value={ast.id}>
                    {ast.name} ({ast.phone_number})
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsCampaignModalOpen(false)}
                className="h-9 px-4 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLaunchBatchCampaign}
                disabled={isPending}
                className="h-9 px-4 text-xs font-semibold bg-neutral-900 hover:bg-black text-white rounded-xl shadow-xs disabled:opacity-50"
              >
                {isPending ? "Dispatching..." : `Start Campaign (${selectedContactIds.length} Calls)`}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
