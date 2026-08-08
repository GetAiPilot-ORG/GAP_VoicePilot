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

export interface CampaignJob {
  id: string;
  name: string;
  assistant_id?: string;
  assistant_name?: string;
  total_contacts: number;
  completed_contacts?: number;
  failed_contacts?: number;
  status: "completed" | "failed" | "in_progress" | "running" | "queued";
  created_at: string;
  completed_at?: string | null;
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

const DEFAULT_SAMPLE_CAMPAIGNS: CampaignJob[] = [
  {
    id: "#JOB-9821a",
    name: "Q3 Outbound Sales Outreach",
    assistant_name: "Sales Prospector Bot",
    total_contacts: 150,
    completed_contacts: 142,
    failed_contacts: 8,
    status: "completed",
    created_at: "Aug 08, 2026 09:30 AM",
    completed_at: "Aug 08, 2026 10:15 AM"
  },
  {
    id: "#JOB-4019b",
    name: "Customer Feedback Voice Pulse",
    assistant_name: "Support Pilot Pro",
    total_contacts: 50,
    completed_contacts: 38,
    failed_contacts: 0,
    status: "in_progress",
    created_at: "Aug 08, 2026 10:45 AM",
    completed_at: null
  }
];

export function CampaignsClient({ initialCampaigns, assistants }: CampaignsClientProps) {
  const [campaigns, setCampaigns] = React.useState<CampaignJob[]>(
    initialCampaigns.length > 0 ? initialCampaigns : DEFAULT_SAMPLE_CAMPAIGNS
  );
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

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleDownloadTemplate = () => {
    const csvContent = "Name,Phone Number,Follow Up Date,Details\nJohn Doe,9174222385,2026-08-10,Interested in AI sales bot\nJane Smith,9198765432,2026-08-12,Scheduled product demo call";
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
      const rows: ParsedRow[] = [
        { id: 1, name: "Rahul Sharma", phone: "+91 98765 43210", followUpDate: "2026-08-10", details: "High intent sales lead" },
        { id: 2, name: "Anita Patel", phone: "+1 (800) 459-2901", followUpDate: "2026-08-12", details: "Demo follow up call" }
      ];
      setParsedRows(rows);
      setModalStep("preview");
    } catch (err) {
      alert("Failed to parse file.");
    }
  };

  const handleProcessCall = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newJobId = `#JOB-${Math.floor(1000 + Math.random() * 9000)}`;
      const newJob: CampaignJob = {
        id: newJobId,
        name: selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : "Outbound Dispatch Job",
        assistant_id: selectedAssistantId,
        total_contacts: parsedRows.length,
        status: "completed",
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
      setIsProcessing(false);
    }, 600);
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

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            title="Refresh jobs"
            className="btn-pill-secondary rounded-[10px] text-xs p-2.5"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="btn-pill-secondary rounded-[10px] text-xs px-4 py-2.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download CSV Template
          </button>

          <button
            onClick={() => {
              setIsUploadModalOpen(true);
              setModalStep("upload");
            }}
            className="btn-pill-primary rounded-[10px] text-xs px-5 py-2.5 shadow-sm"
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
        <div className="p-5 border-b border-hairline flex items-center justify-between bg-surface-soft/40">
          <h2 className="text-base font-bold text-black">Active & Historic Jobs</h2>
          <span className="eyebrow text-neutral-500 bg-white px-3 py-1 rounded-full border border-hairline text-[10px]">
            {totalJobs} JOBS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
                    <button className="btn-pill-secondary rounded-[8px] text-[11px] px-3 py-1.5">
                      View Logs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

      {/* Review Modal */}
      {isUploadModalOpen && modalStep === "preview" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-[14px] border border-hairline p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <h3 className="font-bold text-lg text-black">Review Data ({parsedRows.length} contacts)</h3>
                <p className="text-xs text-neutral-500 mt-1">Verify lead list before triggering automated calls.</p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-neutral-500 hover:text-black">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-[10px] border border-hairline overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-surface-soft font-bold border-b border-hairline">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {parsedRows.map((r, i) => (
                    <tr key={r.id}>
                      <td className="p-3 text-neutral-400 font-mono">{i + 1}</td>
                      <td className="p-3 font-bold text-black">{r.name}</td>
                      <td className="p-3 font-mono text-emerald-700 font-semibold">{r.phone}</td>
                      <td className="p-3 text-neutral-600">{r.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
              <button
                onClick={() => setModalStep("upload")}
                className="btn-pill-secondary rounded-[10px] text-xs px-4 py-2"
              >
                Back
              </button>
              <button
                disabled={isProcessing}
                onClick={handleProcessCall}
                className="btn-pill-primary rounded-[10px] text-xs px-6 py-2"
              >
                {isProcessing ? "Launching Job..." : "Confirm & Launch Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
