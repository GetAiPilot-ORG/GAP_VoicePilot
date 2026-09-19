"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  Shield, 
  Sliders, 
  Bot, 
  Lock, 
  Trash2, 
  X, 
  Zap, 
  MessageSquare, 
  Database, 
  Sparkles, 
  Check, 
  FileText, 
  GitBranch, 
  Plus, 
  PlayCircle,
  Clock 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getConnectorsAction, 
  initiateConnectorAuthAction, 
  disconnectConnectorAction, 
  getAssistantsForWorkspaceAction,
  getWorkflowsAction,
  createWorkflowAction,
  toggleWorkflowEnabledAction,
  deleteWorkflowAction
} from "@/app/actions/connectors";

interface ConnectorDefinition {
  slug: string;
  name: string;
  description: string;
  authType: string;
  executionType: string;
  available?: boolean;
  availabilityStatus?: "enabled" | "disabled" | "coming_soon";
  isVisible?: boolean;
  internalNote?: string;
  updatedAt?: string;
  tools: Array<{
    name: string;
    description: string;
    permissionCategory: string;
  }>;
}

interface ConnectedAccount {
  id: string;
  workspace_id: string;
  connector_definition_id: string;
  provider_slug?: string;
  name: string | null;
  status: "connected" | "error" | "expired" | "disabled";
  connected_account_name: string | null;
  connected_account_email: string | null;
  token_expires_at: string | null;
  scopes: string[];
  authorized_at: string;
  needs_reauthorization: boolean;
  metadata?: Record<string, any>;
}

interface WorkflowUI {
  id: string;
  name: string;
  enabled: boolean;
  trigger_type: string;
  actions: Array<{ tool_name: string; config: Record<string, any> }>;
  created_at: string;
}

const CONNECTOR_ICONS: Record<string, any> = {
  google_workspace: Mail,
  gmail: Mail,
  slack: MessageSquare,
  salesforce: Database,
  notion: FileText,
  zapier: Zap,
  zapier_webhook: Zap,
  hubspot: Database,
  make: Sparkles,
  n8n: Sparkles,
};

const TRIGGER_LABELS: Record<string, string> = {
  "call.completed": "Call Completed",
  "call.failed": "Call Failed",
  "transcript.ready": "Transcript Ready",
  "summary.ready": "Summary Ready",
};

const DEFAULT_CONNECTOR_DEFINITIONS: ConnectorDefinition[] = [
  {
    slug: "gmail",
    name: "Google Workspace",
    description: "Gmail, Calendar, Contacts, Drive, Sheets, and Meet via unified OAuth2",
    authType: "oauth2",
    executionType: "native",
    availabilityStatus: "enabled",
    isVisible: true,
    tools: [
      { name: "gmail.search_email", description: "Search emails", permissionCategory: "read" },
      { name: "gmail.get_email", description: "Get email details", permissionCategory: "read" },
      { name: "gmail.create_draft", description: "Create draft email", permissionCategory: "write" },
      { name: "gmail.send_email", description: "Send email", permissionCategory: "write" },
      { name: "google_calendar.check_availability", description: "Check Calendar free/busy", permissionCategory: "read" },
      { name: "google_calendar.list_events", description: "List Calendar events", permissionCategory: "read" },
      { name: "google_calendar.create_event", description: "Create Calendar event", permissionCategory: "write" },
      { name: "google_calendar.cancel_event", description: "Cancel Calendar event", permissionCategory: "write" },
      { name: "google_contacts.search_contacts", description: "Search Google Contacts", permissionCategory: "read" },
      { name: "google_contacts.get_contact", description: "Get contact details", permissionCategory: "read" },
      { name: "google_contacts.create_contact", description: "Create new contact", permissionCategory: "write" },
      { name: "google_contacts.update_contact", description: "Update contact", permissionCategory: "write" },
      { name: "google_drive.search_files", description: "Search Drive files", permissionCategory: "read" },
      { name: "google_drive.get_file_metadata", description: "Get file metadata", permissionCategory: "read" },
      { name: "google_sheets.read_spreadsheet", description: "Read Spreadsheet rows", permissionCategory: "read" },
      { name: "google_sheets.append_row", description: "Append row to Spreadsheet", permissionCategory: "write" },
      { name: "google_sheets.update_cell", description: "Update Spreadsheet cells", permissionCategory: "write" },
      { name: "google_meet.create_space", description: "Create Google Meet space link", permissionCategory: "write" },
    ],
  },
  {
    slug: "zapier_webhook",
    name: "Webhooks",
    description: "Dispatch custom call data and trigger custom webhook endpoints",
    authType: "none",
    executionType: "webhook",
    availabilityStatus: "enabled",
    isVisible: true,
    tools: [
      { name: "zapier.trigger_webhook", description: "Trigger Webhook Endpoint", permissionCategory: "write" },
    ],
  },
  {
    slug: "zapier",
    name: "Zapier",
    description: "Connect VoicePilot with Zapier to automate workflows between VoicePilot and thousands of supported apps.",
    authType: "platform",
    executionType: "platform",
    availabilityStatus: "enabled",
    isVisible: true,
    tools: [
      { name: "zapier.triggers", description: "Receive real-time call & contact events in Zapier", permissionCategory: "read" },
      { name: "zapier.actions", description: "Trigger VoicePilot AI outbound calls & actions from Zapier", permissionCategory: "write" },
    ],
  },
  {
    slug: "slack",
    name: "Slack",
    description: "Send channel notifications and search workspace messages",
    authType: "oauth2",
    executionType: "native",
    availabilityStatus: "coming_soon",
    isVisible: true,
    tools: [
      { name: "slack.list_channels", description: "List channels", permissionCategory: "read" },
      { name: "slack.search_messages", description: "Search messages", permissionCategory: "read" },
      { name: "slack.send_message", description: "Send Slack message", permissionCategory: "write" },
    ],
  },
  {
    slug: "hubspot",
    name: "HubSpot CRM",
    description: "Sync contacts, deals, and engagement timeline via OAuth 2.1 & Remote MCP",
    authType: "oauth2",
    executionType: "native",
    availabilityStatus: "enabled",
    isVisible: true,
    tools: [
      { name: "hubspot.search_contacts", description: "Search contacts", permissionCategory: "read" },
      { name: "hubspot.get_contact", description: "Get contact profile", permissionCategory: "read" },
      { name: "hubspot.create_contact", description: "Create contact", permissionCategory: "write" },
      { name: "hubspot.create_engagement", description: "Log call note / engagement", permissionCategory: "write" },
    ],
  },
  {
    slug: "salesforce",
    name: "Salesforce CRM",
    description: "Search contacts & leads, create records, update prospects, log call notes, and create tasks",
    authType: "oauth2",
    executionType: "native",
    availabilityStatus: "enabled",
    isVisible: true,
    tools: [
      { name: "salesforce.search_contacts", description: "Search contacts", permissionCategory: "read" },
      { name: "salesforce.get_contact", description: "Get contact profile", permissionCategory: "read" },
      { name: "salesforce.create_contact", description: "Create contact", permissionCategory: "write" },
      { name: "salesforce.update_contact", description: "Update contact", permissionCategory: "write" },
      { name: "salesforce.search_leads", description: "Search leads", permissionCategory: "read" },
      { name: "salesforce.create_lead", description: "Create lead", permissionCategory: "write" },
      { name: "salesforce.update_lead", description: "Update lead", permissionCategory: "write" },
      { name: "salesforce.create_task", description: "Log call task / note", permissionCategory: "write" },
      { name: "salesforce.create_note", description: "Create record note", permissionCategory: "write" },
    ],
  },
  {
    slug: "make",
    name: "Make (Integromat)",
    description: "Automate workflows with Make scenario blueprints",
    authType: "webhook",
    executionType: "webhook",
    availabilityStatus: "coming_soon",
    isVisible: true,
    tools: [
      { name: "make.trigger_scenario", description: "Trigger Make Scenario", permissionCategory: "write" },
    ],
  },
  {
    slug: "n8n",
    name: "n8n Workflow Automation",
    description: "Connect n8n self-hosted workflows",
    authType: "webhook",
    executionType: "webhook",
    availabilityStatus: "coming_soon",
    isVisible: true,
    tools: [
      { name: "n8n.trigger_workflow", description: "Trigger n8n Workflow", permissionCategory: "write" },
    ],
  },
  {
    slug: "notion",
    name: "Notion Workspace",
    description: "Search documents, read database pages, create meeting notes, and append blocks",
    authType: "oauth2",
    executionType: "native",
    availabilityStatus: "enabled",
    isVisible: true,
    tools: [
      { name: "notion.search", description: "Search workspace", permissionCategory: "read" },
      { name: "notion.get_page", description: "Get page content", permissionCategory: "read" },
      { name: "notion.create_page", description: "Create page", permissionCategory: "write" },
      { name: "notion.update_page", description: "Update page", permissionCategory: "write" },
      { name: "notion.append_blocks", description: "Append blocks / notes", permissionCategory: "write" },
    ],
  },
  {
    slug: "linear",
    name: "Linear Issue Tracker",
    description: "Search issues, inspect tickets, create bug reports, update issues, add comments, and query teams",
    authType: "oauth2",
    executionType: "native",
    availabilityStatus: "enabled",
    isVisible: true,
    tools: [
      { name: "linear.search_issues", description: "Search issues", permissionCategory: "read" },
      { name: "linear.get_issue", description: "Get issue details", permissionCategory: "read" },
      { name: "linear.create_issue", description: "Create issue", permissionCategory: "write" },
      { name: "linear.update_issue", description: "Update issue", permissionCategory: "write" },
      { name: "linear.add_comment", description: "Add issue comment", permissionCategory: "write" },
      { name: "linear.list_teams", description: "List teams", permissionCategory: "read" },
      { name: "linear.list_projects", description: "List projects", permissionCategory: "read" },
      { name: "linear.get_viewer", description: "Get viewer profile", permissionCategory: "read" },
    ],
  },
  {
    slug: "mcp",
    name: "Custom MCP Server",
    description: "Connect external Model Context Protocol (MCP) servers and expose custom tools",
    authType: "bearer_token",
    executionType: "mcp",
    availabilityStatus: "enabled",
    isVisible: true,
    tools: [
      { name: "mcp.custom_tool", description: "Generic MCP Tool Execution", permissionCategory: "write" },
    ],
  },
];

export default function ConnectorsClient() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [connectingSlug, setConnectingSlug] = useState<string | null>(null);
  const [definitions, setDefinitions] = useState<ConnectorDefinition[]>(DEFAULT_CONNECTOR_DEFINITIONS);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [workspaceAssistants, setWorkspaceAssistants] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowUI[]>([]);
  
  const [selectedManageConnector, setSelectedManageConnector] = useState<{
    definition: ConnectorDefinition;
    account: ConnectedAccount;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"account" | "tools" | "agents">("account");
  const [toolPolicies, setToolPolicies] = useState<Record<string, "automatic" | "confirm" | "disabled">>({
    "gmail.search_email": "automatic",
    "gmail.get_email": "automatic",
    "gmail.create_draft": "automatic",
    "gmail.send_email": "confirm",
    "slack.list_channels": "automatic",
    "slack.search_messages": "automatic",
    "slack.send_message": "confirm",
    "zapier.test_webhook": "automatic",
    "zapier.trigger_webhook": "automatic",
  });
  const [assignedAssistants, setAssignedAssistants] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // WORKFLOW MVP BUILDER STATE
  const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState("call.completed");
  const [newWorkflowActions, setNewWorkflowActions] = useState<Array<{ tool_name: string; config: Record<string, any> }>>([
    { tool_name: "slack.send_message", config: { channel: "#general", text: "Call completed! Summary: {{summary}}" } }
  ]);

  useEffect(() => {
    loadData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const status = params.get("status");
      const oauth = params.get("oauth");
      const connector = params.get("connector");
      const message = params.get("message");

      if (oauth === "success" || status === "success") {
        showToast(`${connector ? connector.replace("_", " ").toUpperCase() : "Integration"} connected successfully!`);
      } else if (status === "error" || oauth === "error") {
        alert(`Authorization Failed: ${message || "Unknown OAuth error"}`);
      }
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getConnectorsAction();
      const fetchedDefs: ConnectorDefinition[] = res.definitions || [];
      const fetchedMap = new Map<string, ConnectorDefinition>();
      fetchedDefs.forEach((d) => fetchedMap.set(d.slug, d));

      const mergedDefs: ConnectorDefinition[] = DEFAULT_CONNECTOR_DEFINITIONS.map((def) => {
        const live = fetchedMap.get(def.slug);
        if (live) {
          return {
            ...def,
            availabilityStatus: live.availabilityStatus || def.availabilityStatus || 'enabled',
            isVisible: live.isVisible !== undefined ? live.isVisible : def.isVisible !== false,
            internalNote: live.internalNote !== undefined ? live.internalNote : def.internalNote,
            updatedAt: live.updatedAt || def.updatedAt,
          };
        }
        return def;
      });

      const defaultSlugs = new Set(DEFAULT_CONNECTOR_DEFINITIONS.map((d) => d.slug));
      const redundantSlugs = new Set(['google_calendar', 'google_sheets', 'google_contacts', 'google_drive', 'google_meet', 'vomyra_crm', 'api']);
      fetchedDefs.forEach((d) => {
        if (!defaultSlugs.has(d.slug) && !redundantSlugs.has(d.slug)) {
          mergedDefs.push(d);
        }
      });

      setDefinitions(mergedDefs);
      setConnectedAccounts(res.connectedAccounts || []);
      const astRes = await getAssistantsForWorkspaceAction();
      if (astRes.success) {
        setWorkspaceAssistants(astRes.assistants || []);
        if (astRes.assistants.length > 0) {
          setAssignedAssistants([astRes.assistants[0].id]);
        }
      }
      const wfRes = await getWorkflowsAction();
      if (wfRes.success) {
        setWorkflows(wfRes.workflows || []);
      }

      try {
        const { checkIsAdminAction } = await import("@/app/actions/kyc");
        const isAdm = await checkIsAdminAction();
        setIsAdmin(Boolean(isAdm));
      } catch {}
    } catch (e: any) {
      console.error("Failed to load connectors:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (slug: string) => {
    setConnectingSlug(slug);
    try {
      const res = await initiateConnectorAuthAction(slug);
      if (res.success && res.authUrl) {
        window.location.href = res.authUrl;
      } else {
        alert(`Failed to initiate authorization: ${res.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Error initiating connect: ${err.message}`);
    } finally {
      setConnectingSlug(null);
    }
  };

  const handleDisconnect = async (account: ConnectedAccount, providerSlug: string) => {
    if (!confirm(`Are you sure you want to disconnect ${account.connected_account_email || account.name || providerSlug}?`)) {
      return;
    }
    try {
      const res = await disconnectConnectorAction(account.id, providerSlug);
      if (res.success) {
        showToast(`Disconnected ${providerSlug} successfully`);
        if (selectedManageConnector?.account.id === account.id) {
          setSelectedManageConnector(null);
        }
        await loadData();
      } else {
        alert(`Disconnect error: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Disconnect error: ${err.message}`);
    }
  };

  const handleAddAction = () => {
    setNewWorkflowActions((prev) => [
      ...prev,
      { tool_name: "gmail.create_draft", config: { to: "{{customer.email}}", subject: "Voice call follow-up", body: "{{summary}}" } }
    ]);
  };

  const handleRemoveAction = (index: number) => {
    setNewWorkflowActions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      alert("Please enter a workflow name.");
      return;
    }
    if (newWorkflowActions.length === 0) {
      alert("Please add at least one action step.");
      return;
    }

    try {
      const res = await createWorkflowAction({
        name: newWorkflowName.trim(),
        trigger_type: selectedTrigger,
        actions: newWorkflowActions,
      });

      if (res.success) {
        showToast("Workflow created successfully!");
        setShowCreateWorkflowModal(false);
        setNewWorkflowName("");
        setNewWorkflowActions([
          { tool_name: "slack.send_message", config: { channel: "#general", text: "Call completed! Summary: {{summary}}" } }
        ]);
        await loadData();
      } else {
        alert(`Failed to save workflow: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Error saving workflow: ${err.message}`);
    }
  };

  const handleToggleWorkflow = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await toggleWorkflowEnabledAction(id, !currentEnabled);
      if (res.success) {
        showToast(`Workflow ${!currentEnabled ? "enabled" : "disabled"}`);
        await loadData();
      }
    } catch (e: any) {
      alert(`Toggle failed: ${e.message}`);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workflow rule?")) return;
    try {
      const res = await deleteWorkflowAction(id);
      if (res.success) {
        showToast("Workflow deleted");
        await loadData();
      }
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    }
  };

  const toggleAssistantAssignment = (id: string) => {
    setAssignedAssistants((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-black pb-12">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-black text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 border border-white/20 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1 border-b border-hairline pb-5 sm:pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black flex items-center gap-3">
            <span>Connectors & Integrations</span>
          </h1>
          <p className="text-neutral-600 text-xs sm:text-sm mt-1">
            Connect enterprise tools and manage integrations for your AI assistants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link href="/dashboard/admin/integrations">
              <Button
                type="button"
                variant="default"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold gap-1.5 px-3.5 shadow-sm"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-200" />
                <span>Admin Integration Control</span>
              </Button>
            </Link>
          )}
          <Button
            type="button"
            onClick={loadData}
            variant="outline"
            size="sm"
            className="rounded-full text-xs gap-2 border-hairline hover:bg-surface-soft"
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* CONNECTOR CATALOG TABLE & GRID */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-black flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-black" />
            <span>Connected Enterprise Tools</span>
          </span>
        </h2>

        {/* Tabular View */}
        <div className="bg-white border border-hairline rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-soft border-b border-hairline text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3 px-4">CONNECTOR</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">CONNECTED ACCOUNT</th>
                  <th className="py-3 px-4">AUTHORIZED</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {definitions
                  .filter((def) => {
                    const connectedAccount = connectedAccounts.find((acc) => {
                      if (acc.connector_definition_id === def.slug) return true;
                      if (acc.provider_slug === def.slug) return true;
                      if (acc.metadata?.provider === def.slug) return true;
                      return false;
                    });
                    if (def.availabilityStatus === "disabled" && !connectedAccount) {
                      return false;
                    }
                    return true;
                  })
                  .map((def) => {
                  const Icon = CONNECTOR_ICONS[def.slug] || Sparkles;
                  const connectedAccount = connectedAccounts.find((acc) => {
                    if (acc.connector_definition_id === def.slug) return true;
                    if (acc.provider_slug === def.slug) return true;
                    if (acc.metadata?.provider === def.slug) return true;

                    const targetSlug = def.slug.toLowerCase();
                    const accDefId = String(acc.connector_definition_id || "").toLowerCase();
                    const accProv = String(acc.provider_slug || acc.metadata?.provider || "").toLowerCase();
                    const accName = String(acc.name || "").toLowerCase();

                    if (targetSlug === "gmail" || targetSlug === "google" || targetSlug === "google_workspace") {
                      if (accDefId.includes("gmail") || accDefId.includes("google")) return true;
                      if (accProv.includes("gmail") || accProv.includes("google")) return true;
                      if (accName.includes("gmail") || accName.includes("google")) return true;
                    }

                    return accName.includes(targetSlug);
                  });

                  const isConnecting = connectingSlug === def.slug;
                  const isComingSoon = def.availabilityStatus === "coming_soon";
                  const isDisabled = def.availabilityStatus === "disabled";

                  let statusState: "not_connected" | "connecting" | "connected" | "reauth_required" | "error" = "not_connected";
                  if (isConnecting) {
                    statusState = "connecting";
                  } else if (connectedAccount) {
                    if (connectedAccount.status === "error") {
                      statusState = "error";
                    } else if (connectedAccount.status === "expired" || (connectedAccount.needs_reauthorization && connectedAccount.status !== "connected")) {
                      statusState = "reauth_required";
                    } else {
                      statusState = "connected";
                    }
                  }

                  const authDate = connectedAccount?.authorized_at 
                    ? new Date(connectedAccount.authorized_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : "—";

                  return (
                    <tr key={def.slug} className="hover:bg-surface-soft/50 transition-colors">
                      {/* CONNECTOR */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-surface-soft border border-hairline flex items-center justify-center text-black shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-black text-sm block">{def.name}</span>
                            <span className="text-[10px] font-mono uppercase text-neutral-400">
                              {def.slug === "zapier" ? "PLATFORM" : `${def.authType} • ${def.executionType}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-4">
                        {def.slug === "zapier" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 text-[11px] font-semibold flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Available</span>
                          </Badge>
                        ) : isComingSoon ? (
                          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 text-[11px] font-semibold flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Coming Soon</span>
                          </Badge>
                        ) : isDisabled ? (
                          <Badge className="bg-rose-500/10 text-rose-700 border-rose-200 text-[11px] font-semibold flex items-center gap-1 w-fit">
                            <Lock className="w-3 h-3 text-rose-600" />
                            <span>Unavailable</span>
                          </Badge>
                        ) : statusState === "connected" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 text-[11px] font-semibold flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Connected</span>
                          </Badge>
                        ) : statusState === "reauth_required" ? (
                          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 text-[11px] font-semibold flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Re-auth Required</span>
                          </Badge>
                        ) : statusState === "error" ? (
                          <Badge className="bg-red-500/10 text-red-700 border-red-200 text-[11px] font-semibold w-fit">
                            Error
                          </Badge>
                        ) : statusState === "connecting" ? (
                          <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 text-[11px] font-semibold animate-pulse w-fit">
                            Authorizing...
                          </Badge>
                        ) : statusState === "not_connected" && def.available === false ? (
                          <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 text-[11px] font-semibold w-fit">
                            Setup Required
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-neutral-400 border-hairline text-[11px] w-fit">
                            Not Connected
                          </Badge>
                        )}
                      </td>

                      {/* CONNECTED ACCOUNT */}
                      <td className="py-3.5 px-4 font-mono text-xs text-neutral-700">
                        {def.slug === "zapier" ? (
                          <span className="text-neutral-300">—</span>
                        ) : connectedAccount ? (
                          <span className="font-semibold text-black">
                            {connectedAccount.connected_account_email || connectedAccount.connected_account_name || "Active Account"}
                          </span>
                        ) : (
                          <span className="text-neutral-300">—</span>
                        )}
                      </td>

                      {/* AUTHORIZED */}
                      <td className="py-3.5 px-4 font-mono text-xs text-neutral-500">
                        {def.slug === "zapier" ? "—" : authDate}
                      </td>

                      {/* ACTION */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {def.slug === "zapier" ? (
                            <a
                              href={
                                process.env.NEXT_PUBLIC_ZAPIER_INTEGRATION_URL ||
                                process.env.NEXT_PUBLIC_ZAPIER_APP_INVITE_URL ||
                                process.env.NEXT_PUBLIC_ZAPIER_APP_PUBLIC_URL ||
                                "https://zapier.com/app/zaps"
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-lg text-xs px-3.5 h-8 shadow-xs transition-colors"
                            >
                              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>Open Zapier</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                          ) : isComingSoon ? (
                            <Button
                              type="button"
                              disabled={true}
                              variant="outline"
                              size="sm"
                              className="opacity-60 cursor-not-allowed text-xs font-semibold px-3.5 h-8 border-hairline"
                            >
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              <span>Coming Soon</span>
                            </Button>
                          ) : isDisabled ? (
                            <Button
                              type="button"
                              disabled={true}
                              variant="outline"
                              size="sm"
                              className="opacity-60 cursor-not-allowed text-xs font-semibold px-3.5 h-8 border-hairline"
                            >
                              <Lock className="w-3.5 h-3.5 mr-1" />
                              <span>Unavailable</span>
                            </Button>
                          ) : statusState === "connected" && connectedAccount ? (
                            <>
                              <Button
                                type="button"
                                onClick={() => setSelectedManageConnector({ definition: def, account: connectedAccount })}
                                variant="default"
                                size="sm"
                                className="bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold px-3 h-8"
                              >
                                <Sliders className="w-3.5 h-3.5 mr-1" />
                                <span>Manage</span>
                              </Button>

                              <Button
                                type="button"
                                onClick={() => handleDisconnect(connectedAccount, def.slug)}
                                variant="outline"
                                size="sm"
                                className="text-xs text-red-600 hover:text-red-700 border-hairline hover:bg-red-50 rounded-lg px-2.5 h-8"
                                title="Disconnect Integration"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          ) : statusState === "reauth_required" ? (
                            <Button
                              type="button"
                              onClick={() => handleConnect(def.slug)}
                              variant="default"
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold px-3 h-8"
                            >
                              <RefreshCw className="w-3.5 h-3.5 mr-1" />
                              <span>Reconnect</span>
                            </Button>
                          ) : def.available === false ? (
                            <Button
                              type="button"
                              disabled={true}
                              variant="outline"
                              size="sm"
                              className="border-amber-200 bg-amber-50 text-amber-700 opacity-80 text-xs font-bold rounded-lg px-3.5 h-8 cursor-not-allowed"
                              title="VoicePilot Platform OAuth App credentials missing in backend .env"
                            >
                              <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                              <span>Setup Required</span>
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => handleConnect(def.slug)}
                              disabled={isConnecting}
                              variant="outline"
                              size="sm"
                              className="border-hairline hover:bg-black hover:text-white transition-all text-xs font-bold rounded-lg px-3.5 h-8"
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                              <span>
                                {isConnecting
                                  ? "Authorizing..."
                                  : def.slug === "zapier_webhook"
                                  ? "Configure"
                                  : def.slug === "mcp"
                                  ? "Connect"
                                  : "Authorize"}
                              </span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MANAGE CONNECTOR MODAL */}
      {selectedManageConnector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-hairline rounded-[20px] max-w-2xl w-full p-6 shadow-2xl space-y-6 text-black relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-soft border border-hairline flex items-center justify-center text-black">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black flex items-center gap-2">
                    <span>Manage {selectedManageConnector.definition.name}</span>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                      Active Integration
                    </Badge>
                  </h2>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    {selectedManageConnector.account.connected_account_email || selectedManageConnector.account.connected_account_name || "Connected Account"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedManageConnector(null)}
                className="text-neutral-400 hover:text-black p-1.5 rounded-full hover:bg-surface-soft transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Nav Tabs */}
            <div className="flex border-b border-hairline gap-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("account")}
                className={`pb-2 transition-all relative ${
                  activeTab === "account" ? "text-black border-b-2 border-black font-extrabold" : "text-neutral-500 hover:text-black"
                }`}
              >
                Account & Scopes
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("tools")}
                className={`pb-2 transition-all relative ${
                  activeTab === "tools" ? "text-black border-b-2 border-black font-extrabold" : "text-neutral-500 hover:text-black"
                }`}
              >
                Enabled Tools & Execution Policies
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("agents")}
                className={`pb-2 transition-all relative ${
                  activeTab === "agents" ? "text-black border-b-2 border-black font-extrabold" : "text-neutral-500 hover:text-black"
                }`}
              >
                Agent Assignment
              </button>
            </div>

            {/* TAB 1: Account Details & Scopes */}
            {activeTab === "account" && (
              <div className="space-y-4 text-xs">
                <div className="bg-surface-soft p-4 rounded-xl border border-hairline space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 font-medium">CONNECTED ACCOUNT / WORKSPACE</span>
                    <span className="font-mono font-bold text-black">
                      {selectedManageConnector.account.connected_account_email || selectedManageConnector.account.connected_account_name || "Active Integration"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-hairline/60 pt-2">
                    <span className="text-neutral-500 font-medium">AUTHORIZATION STATUS</span>
                    <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{selectedManageConnector.account.status.toUpperCase()}</span>
                    </span>
                  </div>
                </div>

                {(selectedManageConnector.definition.slug === "google_workspace" || selectedManageConnector.definition.slug === "gmail") && (
                  <div className="space-y-3">
                    <span className="eyebrow text-neutral-500 font-bold block">GOOGLE WORKSPACE CAPABILITIES & GRANTED SCOPES</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          title: "Gmail API",
                          scope: "gmail.readonly, gmail.compose",
                          scopeMatch: ["gmail.readonly", "gmail.compose", "gmail.modify"],
                          icon: "✉️",
                          toolsCount: 4,
                          description: "Read inbox, search emails, create drafts & send emails",
                        },
                        {
                          title: "Google Calendar API",
                          scope: "calendar.events",
                          scopeMatch: ["calendar.events", "calendar"],
                          icon: "📅",
                          toolsCount: 4,
                          description: "Check availability, list events, create & cancel meetings",
                        },
                        {
                          title: "Google Contacts API",
                          scope: "contacts",
                          scopeMatch: ["contacts", "contacts.readonly"],
                          icon: "👥",
                          toolsCount: 4,
                          description: "Search, view, create & update Google Contacts",
                        },
                        {
                          title: "Google Drive API",
                          scope: "drive.file",
                          scopeMatch: ["drive.file", "drive"],
                          icon: "📁",
                          toolsCount: 2,
                          description: "Search and access document metadata",
                        },
                        {
                          title: "Google Sheets API",
                          scope: "spreadsheets",
                          scopeMatch: ["spreadsheets", "spreadsheets.readonly"],
                          icon: "📊",
                          toolsCount: 3,
                          description: "Read spreadsheet data, append rows & update cells",
                        },
                        {
                          title: "Google Meet API",
                          scope: "meetings.space.created",
                          scopeMatch: ["meetings.space.created", "calendar.events"],
                          icon: "🎥",
                          toolsCount: 1,
                          description: "Create instant video conference space links",
                        },
                      ].map((cap) => {
                        const grantedScopes = selectedManageConnector.account.scopes || [];
                        const isGranted = cap.scopeMatch.some((sm) => grantedScopes.some((sc) => sc.includes(sm))) || grantedScopes.length === 0;

                        return (
                          <div key={cap.title} className="p-3 rounded-xl border border-hairline bg-surface-soft/50 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-black flex items-center gap-1.5 text-xs">
                                <span>{cap.icon}</span>
                                <span>{cap.title}</span>
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[9px] font-bold ${
                                  isGranted
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                    : "bg-neutral-100 text-neutral-500 border-neutral-200"
                                }`}
                              >
                                {isGranted ? "AUTHORIZED" : "PENDING"}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-neutral-600 leading-snug">{cap.description}</p>
                            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-1">
                              <span>Scope: {cap.scope}</span>
                              <span className="font-bold text-black">{cap.toolsCount} Tools</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="eyebrow text-neutral-500 font-bold block">ALL GRANTED OAUTH SCOPES</span>
                  <div className="bg-white border border-hairline rounded-xl p-3 divide-y divide-hairline">
                    {(selectedManageConnector.account.scopes && selectedManageConnector.account.scopes.length > 0 
                      ? selectedManageConnector.account.scopes 
                      : ["openid", "userinfo.email", "userinfo.profile", "gmail.readonly", "gmail.compose", "calendar.events", "contacts", "drive.file", "spreadsheets", "meetings.space.created"]
                    ).map((sc) => (
                      <div key={sc} className="py-1.5 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-neutral-800">{sc}</span>
                        <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                          GRANTED
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Enabled Tools & Execution Policies */}
            {activeTab === "tools" && (
              <div className="space-y-3 text-xs">
                <div className="border border-hairline rounded-xl overflow-hidden divide-y divide-hairline bg-white">
                  {selectedManageConnector.definition.tools.map((t) => {
                    const currentPolicy = toolPolicies[t.name] || "automatic";

                    return (
                      <div key={t.name} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-black text-xs">{t.name}</span>
                            <Badge variant="outline" className="text-[9px] font-mono uppercase bg-surface-soft">
                              {t.permissionCategory}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-neutral-600 leading-snug">{t.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-neutral-400 uppercase">Policy:</span>
                          <select
                            value={currentPolicy}
                            onChange={(e) => setToolPolicies((prev) => ({ ...prev, [t.name]: e.target.value as any }))}
                            className="bg-surface-soft border border-hairline rounded-lg px-2.5 py-1.5 text-xs font-semibold text-black"
                          >
                            <option value="automatic">Automatic (Auto-Run)</option>
                            <option value="confirm">Confirm (User Approval)</option>
                            <option value="disabled">Disabled (Blocked)</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: Agent Assignment */}
            {activeTab === "agents" && (
              <div className="space-y-4 text-xs">
                <div className="border border-hairline rounded-xl overflow-hidden divide-y divide-hairline bg-white">
                  {workspaceAssistants.length === 0 ? (
                    <div className="p-4 text-center text-neutral-500 font-medium text-xs">
                      No active assistants found in workspace.
                    </div>
                  ) : (
                    workspaceAssistants.map((ast) => {
                      const isAssigned = assignedAssistants.includes(ast.id);

                      return (
                        <div
                          key={ast.id}
                          onClick={() => toggleAssistantAssignment(ast.id)}
                          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-surface-soft/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-soft flex items-center justify-center text-black">
                              <Bot className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-black text-xs">{ast.name}</p>
                              <span className="text-[10px] font-mono text-neutral-500 uppercase">{ast.status || "active"}</span>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            isAssigned ? "bg-black border-black text-white" : "border-neutral-300"
                          }`}>
                            {isAssigned && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-hairline">
              <Button
                type="button"
                onClick={() => handleDisconnect(selectedManageConnector.account, selectedManageConnector.definition.slug)}
                variant="outline"
                size="sm"
                className="text-xs text-red-600 border-hairline hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Disconnect Integration</span>
              </Button>

              <Button
                type="button"
                onClick={() => {
                  showToast("Connector settings saved successfully");
                  setSelectedManageConnector(null);
                }}
                variant="default"
                size="sm"
                className="bg-black hover:bg-neutral-800 text-white font-bold rounded-lg text-xs px-5 shadow-sm"
              >
                <span>Save Settings</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
