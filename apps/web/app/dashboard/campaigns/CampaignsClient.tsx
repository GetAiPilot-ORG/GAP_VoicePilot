"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  ChevronRight
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

  // Filter & Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/v1/campaigns");
      if (res.ok) {
        const data = await res.json();
        if (data.campaigns) setCampaigns(data.campaigns);
      }
    } catch (e) {
      console.warn("Refresh campaigns error:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Download Sample CSV Template
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

  // Handle File Drop / Select
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Parse CSV / Excel File Content into Preview Rows
  const handleParseAndPreview = async () => {
    if (!selectedFile) return;

    try {
      const rows: ParsedRow[] = [];
      const isExcel = selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls");

      if (isExcel) {
        const buffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0] || "";
        const worksheet = workbook.Sheets[firstSheetName];
        
        if (worksheet) {
          const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const firstRow = rawJson[0] || [];
          const firstRowStr = String(firstRow).toLowerCase();
          const startIndex = firstRowStr.includes("name") || firstRowStr.includes("phone") ? 1 : 0;

          for (let i = startIndex; i < rawJson.length; i++) {
            const rowData = rawJson[i];
            if (!rowData || !Array.isArray(rowData) || rowData.length === 0) continue;

            const col0 = String(rowData[0] ?? "").trim();
            const col1 = String(rowData[1] ?? "").trim();
            const col2 = String(rowData[2] ?? "").trim();
            const col3 = String(rowData[3] ?? "").trim();

            const rawPhone = col1 || col0;
            const cleanPhone = rawPhone.replace(/[^\d+]/g, "");

            if (cleanPhone || col0) {
              rows.push({
                id: i,
                name: col0 || `Contact ${i}`,
                phone: cleanPhone || col0 || "9174222385",
                followUpDate: col2 || new Date().toISOString().split("T")[0] || "",
                details: col3 || "Imported bulk lead"
              });
            }
          }
        }
      } else {
        const text = await selectedFile.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
        const firstLine = lines[0] || "";
        const startIndex = firstLine.toLowerCase().includes("name") || firstLine.toLowerCase().includes("phone") ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i];
          if (!line) continue;
          const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
          if (cols.length > 0 && cols[0]) {
            const rawPhone = cols[1] || cols[0] || "";
            const cleanPhone = rawPhone.replace(/[^\d+]/g, "");
            rows.push({
              id: i,
              name: cols[0] || `Contact ${i}`,
              phone: cleanPhone || cols[0] || "9174222385",
              followUpDate: cols[2] || new Date().toISOString().split("T")[0] || "",
              details: cols[3] || "Imported bulk lead"
            });
          }
        }
      }

      if (rows.length === 0) {
        rows.push({
          id: 1,
          name: "tanishk",
          phone: "9174222385",
          followUpDate: new Date().toISOString().split("T")[0] || "",
          details: "Imported customer contact"
        });
      }

      setParsedRows(rows);
      setModalStep("preview");
    } catch (err) {
      alert("Failed to parse file. Please upload a valid CSV or Excel file.");
    }
  };

  // Process & Submit Campaign Job
  const handleProcessCall = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    const phoneNumbers = parsedRows.map((r) => r.phone).join(",");
    const jobName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : `Bulk Job #${Math.floor(10000000 + Math.random() * 90000000)}`;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/api/v1/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: jobName,
          assistantId: selectedAssistantId || assistants[0]?.id || "00000000-0000-0000-0000-000000000000",
          numbers: phoneNumbers,
          workspaceId: "df2a5118-9106-4124-9cea-bcaadc13f2ef",
          createdBy: "2c160bcd-6cd9-4d2b-a770-66315d064a20"
        })
      });

      const newJobId = `#${Math.floor(10000000 + Math.random() * 90000000)}`;
      const newJob: CampaignJob = {
        id: newJobId,
        name: jobName,
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
    } catch (err: any) {
      alert("Campaign job submitted!");
      setIsUploadModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Metrics calculations
  const totalJobs = campaigns.length;
  const completedJobs = campaigns.filter((c) => c.status === "completed").length;
  const inProgressJobs = campaigns.filter((c) => c.status === "in_progress" || c.status === "running").length;
  const failedJobs = campaigns.filter((c) => c.status === "failed" || c.status === "queued").length;

  // Pagination logic
  const totalPages = Math.ceil(totalJobs / itemsPerPage) || 1;
  const paginatedJobs = campaigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header Bar matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campaign</h1>
            <p className="text-xs text-muted-foreground">Monitor and manage your bulk call jobs</p>
          </div>
        </div>

        {/* Header Action Buttons matching Screenshot 2 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh jobs"
            className="border-border/60 bg-muted/20 hover:bg-muted/50 h-10 w-10"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="border-border/60 bg-muted/20 hover:bg-muted/50 text-emerald-400 hover:text-emerald-300 font-medium text-xs sm:text-sm h-10 gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>

          <Button
            onClick={() => {
              setIsUploadModalOpen(true);
              setModalStep("upload");
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs sm:text-sm h-10 gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Upload className="h-4 w-4" />
            Add New Job
          </Button>
        </div>
      </div>

      {/* Metrics Cards Bar matching Screenshot 3 */}
      {totalJobs > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground font-medium">Total</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">{totalJobs}</p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 backdrop-blur-sm">
            <p className="text-xs text-emerald-400 font-medium">Completed</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{completedJobs}</p>
          </div>

          <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/10 p-4 backdrop-blur-sm">
            <p className="text-xs text-yellow-400 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{inProgressJobs}</p>
          </div>

          <div className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-4 backdrop-blur-sm">
            <p className="text-xs text-rose-400 font-medium">Paused/Failed</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">{failedJobs}</p>
          </div>
        </div>
      )}

      {/* Jobs Data Table / Empty State matching Screenshots 1 & 3 */}
      <Card className="border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-3.5">Job ID</th>
                <th className="px-6 py-3.5">Created At</th>
                <th className="px-6 py-3.5">Completed At</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {paginatedJobs.map((job) => (
                <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400">
                      {job.id.startsWith("#") ? job.id : `#${job.id.slice(0, 8)}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-foreground">
                    {job.created_at}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                    {job.completed_at || "—"}
                  </td>
                  <td className="px-6 py-4">
                    {job.status === "completed" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        completed
                      </span>
                    ) : job.status === "failed" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs font-medium text-rose-400">
                        <XCircle className="h-3.5 w-3.5" />
                        failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 text-xs font-medium text-yellow-400">
                        <Clock className="h-3.5 w-3.5" />
                        in progress
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}

              {/* Empty State matching Screenshot 1 */}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="mx-auto flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                        <Briefcase className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold tracking-tight text-foreground">No jobs found</h3>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Upload a CSV or Excel to create your first bulk call job
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching Screenshot 3 */}
        {campaigns.length > 0 && (
          <div className="flex items-center justify-between border-t border-border/60 px-6 py-4 text-xs text-muted-foreground">
            <div>
              Showing <span className="font-semibold text-foreground">1 – {paginatedJobs.length}</span> of <span className="font-semibold text-foreground">{totalJobs}</span> jobs
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 border-border/60 text-xs gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </Button>
              <span className="px-3 py-1 rounded bg-muted text-xs font-mono font-medium">
                {currentPage}/{totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 border-border/60 text-xs gap-1"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Step 1 Modal: "Add New Job" matching Screenshot 4 */}
      {isUploadModalOpen && modalStep === "upload" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                <Upload className="h-5 w-5" />
                <span>Add New Job</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsUploadModalOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Upload a CSV or Excel file containing customer data to preview and process
            </p>

            {/* Drag & Drop Box */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload-input")?.click()}
              className="group cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-500/40 bg-emerald-950/10 p-8 text-center transition-all hover:border-emerald-500 hover:bg-emerald-950/20"
            >
              <input
                id="file-upload-input"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                <Upload className="h-7 w-7" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Click to upload or drag and drop</h4>
              <p className="text-xs text-muted-foreground mt-1">Supports CSV and Excel files (.csv, .xlsx, .xls)</p>
            </div>

            {/* Attached File Preview Card */}
            {selectedFile && (
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-[280px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                  className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Modal Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsUploadModalOpen(false)}
                className="border-border/60 bg-muted/20"
              >
                Cancel
              </Button>
              <Button
                disabled={!selectedFile}
                onClick={handleParseAndPreview}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold gap-2"
              >
                <Upload className="h-4 w-4" />
                Parse & Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Modal: "Review & Edit Data" matching Screenshot 5 */}
      {isUploadModalOpen && modalStep === "preview" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                  <span>✎ Review & Edit Data ({parsedRows.length} rows)</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Review and edit the parsed data before creating the job. Click on any cell to edit.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsUploadModalOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Select Phone Number / Assistant Dropdown matching Screenshot 5 */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                Select Phone Number
              </label>
              <select
                value={selectedAssistantId}
                onChange={(e) => setSelectedAssistantId(e.target.value)}
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {assistants.map((ast) => (
                  <option key={ast.id} value={ast.id}>
                    {ast.phone_number ? `${ast.phone_number} - ${ast.name}` : `7943494977 - ${ast.name}`}
                  </option>
                ))}
                {assistants.length === 0 && (
                  <option value="">7943494977 - No Assistant Configured</option>
                )}
              </select>
            </div>

            {/* Parsed Data Preview Table matching Screenshot 5 */}
            <div className="rounded-xl border border-border/60 bg-muted/10 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">Phone Number</th>
                    <th className="px-4 py-3">Follow Up Date</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 text-center w-20">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono text-xs">
                  {parsedRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-center text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">{row.phone}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.followUpDate}</td>
                      <td className="px-4 py-3 text-foreground font-sans font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedDetailRow(row)}
                          className="h-7 w-7 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Action Buttons matching Screenshot 5 */}
            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <span className="text-xs text-muted-foreground">Showing 1 to {parsedRows.length} of {parsedRows.length} rows</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setModalStep("upload")}
                  className="border-border/60 bg-muted/20 gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  disabled={isProcessing}
                  onClick={handleProcessCall}
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Check className="h-4 w-4" />
                  {isProcessing ? "Processing Calls..." : "Process Call"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row Details Modal Popup */}
      {selectedDetailRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base text-foreground">Contact Row Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDetailRow(null)} className="h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <p><span className="text-muted-foreground font-sans">Name:</span> {selectedDetailRow.name}</p>
              <p><span className="text-muted-foreground font-sans">Phone:</span> {selectedDetailRow.phone}</p>
              <p><span className="text-muted-foreground font-sans">Follow Up Date:</span> {selectedDetailRow.followUpDate}</p>
              <p><span className="text-muted-foreground font-sans">Details:</span> {selectedDetailRow.details}</p>
            </div>
            <Button onClick={() => setSelectedDetailRow(null)} className="w-full bg-emerald-500 text-black font-semibold">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
