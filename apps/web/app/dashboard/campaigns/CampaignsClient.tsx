"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Upload,
  RefreshCw,
  Download,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  FileSpreadsheet,
  X,
  Phone,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";
import { launchBatchCampaignAction } from "@/app/actions/campaigns";

export interface CampaignJob {
  id: string;
  name: string;
  assistant_id?: string;
  assistant_name?: string;
  total_contacts?: number;
  completed_contacts?: number;
  failed_contacts?: number;
  status: string;
  created_at: string;
  completed_at?: string | null;
  target_audience?: string;
  success_rate?: string;
}

export interface AssistantOption {
  id: string;
  name: string;
  phone_number?: string;
}

interface CampaignsClientProps {
  initialCampaigns: CampaignJob[];
  assistants: AssistantOption[];
}

interface ParsedRow {
  id: number;
  phone: string;
  followUpDate: string;
  name: string;
  details: string;
}

export function CampaignsClient({ initialCampaigns, assistants }: CampaignsClientProps) {
  const [campaigns, setCampaigns] = React.useState<CampaignJob[]>(initialCampaigns);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [modalStep, setModalStep] = React.useState<"upload" | "preview">("upload");

  // File Upload State
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [parsedRows, setParsedRows] = React.useState<ParsedRow[]>([]);
  const [selectedAssistantId, setSelectedAssistantId] = React.useState<string>(
    assistants[0]?.id || ""
  );
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedDetailRow, setSelectedDetailRow] = React.useState<ParsedRow | null>(null);
  const [selectedJobLogs, setSelectedJobLogs] = React.useState<CampaignJob | null>(null);
  const [isJobLogsModalOpen, setIsJobLogsModalOpen] = React.useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleDownloadTemplate = () => {
    const csvContent = "mobile,followUpdate,name\n9999999999,2:13:2025 2:37PM,sample\n9343418163,8:10:2026 03:20PM,shwet\n8839495434,8:10:2026 03:10PM,kundan";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "campaign_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleParseAndPreview = async () => {
    if (!selectedFile) return;

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        alert("The uploaded spreadsheet is empty.");
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      if (!worksheet) {
        alert("The worksheet could not be read.");
        return;
      }

      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });

      if (rawRows.length === 0) {
        alert("No valid rows found in the uploaded file.");
        return;
      }

function normalizeFollowUpDate(raw: any): string {
  if (raw === undefined || raw === null || raw === "") {
    return new Date().toISOString().split("T")[0] || "2026-08-10";
  }

  // 1. Handle Excel Serial Numbers (e.g. 46244.63900462963)
  const num = Number(raw);
  if (!isNaN(num) && num > 10000 && num < 100000) {
    try {
      const utcDate = new Date(Math.round((num - 25569) * 86400 * 1000));
      if (!isNaN(utcDate.getTime())) {
        const yyyy = utcDate.getUTCFullYear();
        const mm = String(utcDate.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(utcDate.getUTCDate()).padStart(2, "0");
        const hh = String(utcDate.getUTCHours()).padStart(2, "0");
        const min = String(utcDate.getUTCMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
      }
    } catch {}
  }

  const str = String(raw).trim();

  // 2. Fix dates written with colons like "8:10:2026 03:10PM" or "8:10:2026"
  const colonDateMatch = str.match(/^(\d{1,2}):(\d{1,2}):(\d{4})(.*)$/);
  if (colonDateMatch && colonDateMatch[1] && colonDateMatch[2] && colonDateMatch[3]) {
    const month = colonDateMatch[1].padStart(2, "0");
    const day = colonDateMatch[2].padStart(2, "0");
    const year = colonDateMatch[3];
    const rest = (colonDateMatch[4] || "").trim();
    return `${year}-${month}-${day}${rest ? " " + rest : ""}`;
  }

  // 3. Slashes "08/10/2026 03:10 PM"
  const slashDateMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(.*)$/);
  if (slashDateMatch && slashDateMatch[1] && slashDateMatch[2] && slashDateMatch[3]) {
    const p1 = slashDateMatch[1].padStart(2, "0");
    const p2 = slashDateMatch[2].padStart(2, "0");
    const year = slashDateMatch[3];
    const rest = (slashDateMatch[4] || "").trim();
    return `${year}-${p1}-${p2}${rest ? " " + rest : ""}`;
  }

  return str;
}

      const defaultDate = new Date().toISOString().split("T")[0] || "2026-08-10";

      const parsed: ParsedRow[] = rawRows.map((row, index) => {
        // Find name column dynamically
        const nameKey = Object.keys(row).find((k) =>
          /name|full.?name|first.?name|customer.?name|contact.?name/i.test(k)
        );
        const nameVal = nameKey ? String(row[nameKey] ?? "").trim() : `Contact ${index + 1}`;

        // Find phone column dynamically
        const phoneKey = Object.keys(row).find((k) =>
          /phone|mobile|contact.?number|customer.?number|cell|tel|number/i.test(k)
        );
        const phoneVal = phoneKey ? String(row[phoneKey] ?? "").trim() : "";

        // Find follow up date column dynamically
        const dateKey = Object.keys(row).find((k) =>
          /follow.?up|date|time|schedule|slot/i.test(k)
        );
        const rawDate = dateKey ? String(row[dateKey] ?? "").trim() : "";
        const dateVal = rawDate ? normalizeFollowUpDate(rawDate) : defaultDate;

        // Find details / notes column dynamically
        const detailsKey = Object.keys(row).find((k) =>
          /detail|notes?|description|comment|info|message|intent|type/i.test(k)
        );
        const detailsVal = detailsKey ? String(row[detailsKey] ?? "").trim() : "Outbound Lead";

        return {
          id: index + 1,
          name: nameVal || `Contact ${index + 1}`,
          phone: phoneVal || "N/A",
          followUpDate: dateVal,
          details: detailsVal
        };
      });

      setParsedRows(parsed);
      setModalStep("preview");
    } catch (err: any) {
      console.error("Error parsing spreadsheet file:", err);
      // Fallback to text CSV line parser if XLSX encounters an issue
      try {
        const text = await selectedFile.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          alert("CSV file does not contain contact rows.");
          return;
        }

        const firstLine = lines[0] ?? "";
        const headers = firstLine.split(",").map((h) => h.trim().toLowerCase());
        const nameIdx = headers.findIndex((h) => /name/i.test(h));
        const phoneIdx = headers.findIndex((h) => /phone|mobile|number|tel/i.test(h));
        const dateIdx = headers.findIndex((h) => /date|time/i.test(h));
        const detailsIdx = headers.findIndex((h) => /detail|note|info/i.test(h));

        const fallbackDate = new Date().toISOString().split("T")[0] || "";
        const rows: ParsedRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i] ?? "";
          const cols = currentLine.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
          if (cols.length > 0 && cols.some((c) => c.length > 0)) {
            const rawName = nameIdx !== -1 ? cols[nameIdx] : undefined;
            const rawPhone = phoneIdx !== -1 ? cols[phoneIdx] : cols[0];
            const rawDate = dateIdx !== -1 ? cols[dateIdx] : undefined;
            const rawDetails = detailsIdx !== -1 ? cols[detailsIdx] : undefined;

            rows.push({
              id: i,
              name: rawName ? rawName : `Lead #${i}`,
              phone: rawPhone ? rawPhone : "N/A",
              followUpDate: rawDate ? rawDate : fallbackDate,
              details: rawDetails ? rawDetails : "Batch Contact"
            });
          }
        }

        if (rows.length > 0) {
          setParsedRows(rows);
          setModalStep("preview");
          return;
        }
      } catch (fallbackErr) {
        console.error("Fallback CSV parser error:", fallbackErr);
      }
      alert("Failed to parse file: " + (err.message || "Invalid spreadsheet format"));
    }
  };

  const handleProcessCall = async () => {
    if (!selectedAssistantId) {
      alert("Please select a Voice Assistant for this campaign.");
      return;
    }
    if (parsedRows.length === 0) {
      alert("No valid contacts found in the file to call.");
      return;
    }

    setIsProcessing(true);
    const campaignName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : "Outbound Dispatch Campaign";

    try {
      const res = await launchBatchCampaignAction({
        name: campaignName,
        assistantId: selectedAssistantId,
        contacts: parsedRows
      });

      if (res.success) {
        const newJob: CampaignJob = {
          id: res.campaign?.id || `#JOB-${Math.floor(1000 + Math.random() * 9000)}`,
          name: campaignName,
          assistant_id: selectedAssistantId,
          total_contacts: parsedRows.length,
          status: "in_progress",
          created_at: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          })
        };

        setCampaigns((prev) => [newJob, ...prev]);
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        setParsedRows([]);
        setModalStep("upload");
      } else {
        alert("Failed to launch campaign: " + (res.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error initiating campaign: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalJobs = campaigns.length;
  const completedJobs = campaigns.filter((c) => c.status === "completed").length;
  const inProgressJobs = campaigns.filter((c) => c.status === "in_progress" || c.status === "running").length;

  const totalPages = Math.ceil(totalJobs / itemsPerPage) || 1;
  const paginatedJobs = campaigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="eyebrow text-neutral-500">// OUTBOUND CALL DISPATCHER</p>
          <h1 className="text-3xl font-bold tracking-tight text-black mt-1">Campaigns</h1>
          <p className="text-sm text-neutral-600">Monitor and manage high-concurrency bulk AI call jobs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            onClick={handleRefresh}
            title="Refresh jobs"
            className="btn-pill-secondary rounded-[10px] text-xs p-2.5"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="btn-pill-secondary rounded-[10px] text-xs px-3.5 sm:px-4 py-2.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download CSV Template</span>
            <span className="sm:hidden">CSV Template</span>
          </button>

          <button
            onClick={() => {
              setIsUploadModalOpen(true);
              setModalStep("upload");
            }}
            className="btn-pill-primary rounded-[10px] text-xs px-4 sm:px-5 py-2.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Job
          </button>
        </div>
      </div>

      {/* KPI Color Block Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-block-lime rounded-[14px] p-5 text-black border border-black/5">
          <p className="eyebrow text-black/70">TOTAL DISPATCH JOBS</p>
          <p className="text-3xl font-bold mt-2">{totalJobs}</p>
        </div>

        <div className="bg-block-mint rounded-[14px] p-5 text-black border border-black/5">
          <p className="eyebrow text-black/70">COMPLETED CAMPAIGNS</p>
          <p className="text-3xl font-bold mt-2">{completedJobs}</p>
        </div>

        <div className="bg-block-lilac rounded-[14px] p-5 text-black border border-black/5">
          <p className="eyebrow text-black/70">IN PROGRESS</p>
          <p className="text-3xl font-bold mt-2">{inProgressJobs}</p>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white border border-hairline rounded-[14px] overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-hairline flex items-center justify-between bg-surface-soft/40">
          <h2 className="text-base font-bold text-black">Active & Historic Jobs</h2>
          <span className="eyebrow text-neutral-500 bg-white px-3 py-1 rounded-full border border-hairline text-[10px]">
            {totalJobs} JOBS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft text-black/70">
                <th className="py-3.5 px-6 eyebrow text-[11px]">JOB ID</th>
                <th className="py-3.5 px-6 eyebrow text-[11px]">CAMPAIGN NAME</th>
                <th className="py-3.5 px-6 eyebrow text-[11px]">CREATED AT</th>
                <th className="py-3.5 px-6 eyebrow text-[11px]">STATUS</th>
                <th className="py-3.5 px-6 eyebrow text-[11px] text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline text-xs">
              {paginatedJobs.map((job) => (
                <tr key={job.id} className="hover:bg-surface-soft/60 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-black text-sm">
                    {job.id}
                  </td>
                  <td className="py-4 px-6 font-bold text-black">
                    {job.name}
                  </td>
                  <td className="py-4 px-6 text-neutral-600 font-mono">
                    {job.created_at}
                  </td>
                  <td className="py-4 px-6">
                    {job.status === "completed" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-block-lime text-black font-semibold text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-800" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-block-lilac text-black font-semibold text-[11px]">
                        <Clock className="h-3.5 w-3.5 text-purple-900" />
                        In Progress
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        setSelectedJobLogs(job);
                        setIsJobLogsModalOpen(true);
                      }}
                      className="btn-pill-primary rounded-[8px] text-[11px] px-3.5 py-1.5 shadow-xs hover:scale-[1.02] transition-transform"
                    >
                      View Logs
                    </button>
                  </td>
                </tr>
              ))}

              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500 bg-white">
                    <p className="font-semibold text-black">No campaign jobs found</p>
                    <p className="text-xs text-neutral-500 mt-1">Upload a lead CSV or Excel file to queue your first automated outbound calling campaign.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Job Logs Modal */}
      {isJobLogsModalOpen && selectedJobLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-[16px] border border-hairline p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-black">Campaign Dispatch</h3>
                  <span className="font-mono text-xs bg-surface-soft px-2 py-0.5 rounded border border-hairline font-bold">
                    {selectedJobLogs.id}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">{selectedJobLogs.name}</p>
              </div>
              <button
                onClick={() => setIsJobLogsModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-surface-soft transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-surface-soft p-3 rounded-[10px] border border-hairline">
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Total Contacts</p>
                <p className="text-xl font-bold text-black mt-0.5">{selectedJobLogs.total_contacts}</p>
              </div>
              <div className="bg-surface-soft p-3 rounded-[10px] border border-hairline">
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Status</p>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 mt-1 capitalize">
                  {selectedJobLogs.status}
                </span>
              </div>
              <div className="bg-surface-soft p-3 rounded-[10px] border border-hairline">
                <p className="text-[10px] text-neutral-500 font-bold uppercase">AI Assistant</p>
                <p className="font-bold text-black mt-0.5 truncate">{selectedJobLogs.assistant_name || "Voice Assistant"}</p>
              </div>
              <div className="bg-surface-soft p-3 rounded-[10px] border border-hairline">
                <p className="text-[10px] text-neutral-500 font-bold uppercase">Dispatched At</p>
                <p className="font-mono text-neutral-700 mt-0.5 text-[11px]">{selectedJobLogs.created_at}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-hairline flex items-center justify-between">
              <button
                onClick={() => setIsJobLogsModalOpen(false)}
                className="btn-pill-secondary rounded-[10px] text-xs px-4 py-2"
              >
                Close
              </button>

              <a
                href="/dashboard/calls"
                className="btn-pill-primary rounded-[10px] text-xs px-4 py-2 shadow-sm inline-flex items-center gap-1.5 hover:scale-[1.02] transition-transform"
              >
                <span>View Call Records</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && modalStep === "upload" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-[14px] border border-hairline p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-2 font-bold text-base text-black">
                <Upload className="h-5 w-5 text-black" />
                <span>Add New Campaign Job</span>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-[8px] hover:bg-surface-soft text-neutral-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Upload a CSV or Excel file containing customer data to preview and process.
            </p>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload-input")?.click()}
              className="cursor-pointer flex flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-hairline bg-surface-soft p-8 text-center hover:border-black/30 transition-colors"
            >
              <input
                id="file-upload-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              <div className="w-12 h-12 rounded-[10px] bg-black text-white flex items-center justify-center mb-3">
                <Upload className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-sm text-black">Click to upload or drag and drop</h4>
              <p className="text-xs text-neutral-500 mt-1">Supports CSV and Excel files (.csv, .xlsx)</p>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between rounded-[10px] bg-block-cream border border-black/10 p-3.5">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-black" />
                  <p className="text-xs font-bold text-black">{selectedFile.name}</p>
                </div>
                <button onClick={() => setSelectedFile(null)} className="text-neutral-500 hover:text-black">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="btn-pill-secondary rounded-[10px] text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                disabled={!selectedFile}
                onClick={handleParseAndPreview}
                className="btn-pill-primary rounded-[10px] text-xs px-5 py-2"
              >
                Parse & Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review & Edit Data Modal (1:1 Vomyra Parity) */}
      {isUploadModalOpen && modalStep === "preview" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-3xl bg-white rounded-[16px] border border-hairline p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <h3 className="font-bold text-lg text-black">Review & Edit Data ({parsedRows.length} rows)</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Review and edit the parsed data before creating the job. Click on any date to adjust scheduling.</p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-surface-soft transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Select Phone Number / Caller ID (Top Selector) */}
            <div className="bg-surface-soft/80 border border-hairline rounded-[12px] p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <label className="text-[11px] font-bold text-black uppercase tracking-wider block mb-1">Select Phone Number / Caller ID</label>
                <select
                  value={selectedAssistantId}
                  onChange={(e) => setSelectedAssistantId(e.target.value)}
                  className="w-full bg-white border border-hairline rounded-[8px] px-3 py-1.5 text-xs font-semibold text-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  {assistants.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.phone_number || "7943494977"} - {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contacts Table (1:1 Vomyra Column Order: #, Phone Number, Follow Up Date, Name, Details) */}
            <div className="rounded-[12px] border border-hairline overflow-hidden text-xs shadow-xs">
              <table className="w-full text-left">
                <thead className="bg-surface-soft font-bold border-b border-hairline text-neutral-700">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Phone Number</th>
                    <th className="p-3">Follow Up Date</th>
                    <th className="p-3">Name</th>
                    <th className="p-3 text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {parsedRows.map((r, i) => (
                    <tr key={r.id} className="hover:bg-surface-soft/30 transition-colors">
                      <td className="p-3 text-center text-neutral-400 font-mono">{i + 1}</td>
                      <td className="p-3 font-mono font-semibold text-black">{r.phone}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={r.followUpDate}
                          onChange={(e) => {
                            const updated = [...parsedRows];
                            if (updated[i]) updated[i].followUpDate = e.target.value;
                            setParsedRows(updated);
                          }}
                          placeholder="YYYY-MM-DD HH:mm (e.g. 2026-08-10 16:00)"
                          className="w-full px-2.5 py-1 text-xs font-mono bg-surface-soft border border-hairline rounded-[6px] focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </td>
                      <td className="p-3 font-bold text-black">{r.name}</td>
                      <td className="p-3 text-center">
                        <span title={r.details} className="inline-flex items-center justify-center p-1 rounded-md text-emerald-600 hover:bg-emerald-50 cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-neutral-500 font-mono">
                Showing 1 to {parsedRows.length} of {parsedRows.length} rows
              </span>

              <div className="flex gap-3">
                <button
                  onClick={() => setModalStep("upload")}
                  className="btn-pill-secondary rounded-[10px] text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  disabled={isProcessing || parsedRows.length === 0}
                  onClick={handleProcessCall}
                  className="inline-flex items-center gap-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 shadow-md transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {isProcessing ? "Processing Calls..." : "Process Call"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
