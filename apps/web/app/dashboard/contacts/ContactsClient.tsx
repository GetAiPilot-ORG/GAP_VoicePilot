"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  FileSpreadsheet, 
  Megaphone,
  Phone
} from "lucide-react";
import { 
  ContactRecord, 
  createContactAction, 
  batchImportContactsAction, 
  deleteContactAction 
} from "@/app/actions/contacts";
import { launchBatchCampaignAction } from "@/app/actions/campaigns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface AssistantOption {
  id: string;
  name: string;
  phone_number: string;
}

interface ContactsClientProps {
  initialContacts: ContactRecord[];
  assistants: AssistantOption[];
}

export default function ContactsClient({
  initialContacts,
  assistants
}: ContactsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State
  const [contacts, setContacts] = useState<ContactRecord[]>(initialContacts);
  
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
      showToast("error", "Please provide a valid phone number with country code.");
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
        showToast("success", `Successfully imported ${res.count} contacts!`);
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
        showToast("success", "Contact removed.");
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
        name: `Campaign ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} (${targetContacts.length} Leads)`,
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

  // Export CSV
  const handleExportCsv = () => {
    if (contacts.length === 0) {
      showToast("error", "No contacts to export.");
      return;
    }
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
    a.download = `VoicePilot_Contacts_${new Date().toISOString().slice(0, 10)}.csv`;
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
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Contacts & Leads</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200">
              {contacts.length} Total
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
            Manage customer phone numbers, import CSV contact lists, and dispatch outbound AI voice calls.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 h-9 px-3.5 text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-xl transition-all shadow-2xs active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-neutral-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 h-9 px-3.5 text-xs font-medium bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-xl transition-all shadow-2xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export CSV</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400">Total Contacts</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-neutral-200 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900">{contacts.length}</span>
            <span className="text-[11px] font-medium text-neutral-500">In Directory</span>
          </div>
          <p className="text-[11px] text-neutral-400 truncate">Saved under active workspace</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400">AI Call Reachability</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 transition-colors">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900">
              {contacts.filter((c) => c.status !== "do_not_call").length}
            </span>
            <span className="text-[11px] font-medium text-emerald-600">
              {contacts.length > 0 ? Math.round((contacts.filter((c) => c.status !== "do_not_call").length / contacts.length) * 100) : 100}% Ready
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 truncate">Available for instant bot calls</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400">Active Leads</span>
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-900">
              {contacts.filter((c) => c.status === "lead" || c.source === "CSV Import").length}
            </span>
            <span className="text-[11px] font-medium text-blue-600">Leads & Imports</span>
          </div>
          <p className="text-[11px] text-neutral-400 truncate">Prospects for campaigns</p>
        </div>
      </div>

      {/* Main Directory Container */}
      <div className="space-y-4">
        {/* Controls Bar: Search, Filters & Batch Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="contacts-search-input"
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
                className="bg-transparent text-neutral-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="lead">Lead</option>
                <option value="do_not_call">Do Not Call</option>
              </select>
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100/70 border border-neutral-200 rounded-xl text-xs">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-transparent text-neutral-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Sources</option>
                <option value="Manual">Manual</option>
                <option value="CSV Import">CSV Import</option>
                <option value="Inbound Webhook API">Inbound Webhook</option>
              </select>
            </div>

            {/* Batch Action: Launch Campaign Button */}
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
                  <th className="py-3 px-4">Status & Tags</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Last AI Call</th>
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
                        Click "Add Contact" or "Import CSV" to add phone numbers to your workspace.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => {
                    const isSelected = selectedContactIds.includes(contact.id);
                    return (
                      <tr
                        key={contact.id}
                        className={`hover:bg-neutral-50/70 transition-colors group ${
                          isSelected ? "bg-[#ff4b2f]/5" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4">
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

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 text-xs shrink-0">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-neutral-900 block leading-tight">
                                {contact.name}
                              </span>
                              <span className="text-[11px] text-neutral-400">
                                {contact.company || contact.email || "Individual Customer"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-neutral-800">
                          {contact.phone}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                contact.status === "active"
                                  ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                                  : contact.status === "lead"
                                  ? "bg-blue-500/10 text-blue-700 border border-blue-500/20"
                                  : "bg-red-500/10 text-red-700 border border-red-500/20"
                              }`}
                            >
                              {contact.status}
                            </span>
                            {contact.tags?.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 text-neutral-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600">
                            {contact.source}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-xs text-neutral-500">
                            {contact.lastCallStatus || "Not Called Yet"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
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

                            <button
                              onClick={() => handleDeleteContact(contact.id)}
                              title="Delete contact"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* MODAL: ADD CONTACT */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#ff4b2f]" /> Add New Contact
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Enter customer phone details to add to workspace CRM list.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContact} className="space-y-3.5 py-2">
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
              <p className="text-[11px] text-neutral-400 mt-0.5">Supports .csv files with name, phone, email, company headers</p>
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
              <PhoneCall className="w-5 h-5 text-[#ff4b2f]" /> Dispatch AI Voice Call
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Select AI Voice Assistant to place instant phone call.
            </DialogDescription>
          </DialogHeader>

          {singleCallContact && (
            <div className="py-2 space-y-3">
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
                <span className="font-bold text-neutral-900 block">{singleCallContact.name}</span>
                <span className="font-mono text-neutral-600">{singleCallContact.phone}</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Select AI Voice Assistant</label>
                <select
                  value={selectedAssistantId}
                  onChange={(e) => setSelectedAssistantId(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-neutral-100/70 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 cursor-pointer font-medium"
                >
                  {assistants.map((asst) => (
                    <option key={asst.id} value={asst.id}>
                      {asst.name} ({asst.phone_number})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

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
              className="h-9 px-4 text-xs font-semibold bg-[#ff4b2f] hover:bg-[#e03e23] text-white rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{isPending ? "Connecting..." : "Call Customer Now"}</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: BATCH CAMPAIGN DISPATCH */}
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

          <div className="py-2 space-y-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Target Voice Bot Assistant</label>
              <select
                value={selectedAssistantId}
                onChange={(e) => setSelectedAssistantId(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-neutral-100/70 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 cursor-pointer font-medium"
              >
                {assistants.map((asst) => (
                  <option key={asst.id} value={asst.id}>
                    {asst.name} ({asst.phone_number})
                  </option>
                ))}
              </select>
            </div>
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
              {isPending ? "Starting Queue..." : `Start Campaign (${selectedContactIds.length} Calls)`}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
