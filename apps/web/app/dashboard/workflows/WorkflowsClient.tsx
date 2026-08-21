"use client";

import React, { useState, useEffect } from "react";
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  RefreshCw, 
  PlayCircle, 
  Check, 
  X,
  Zap,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getWorkflowsAction,
  createWorkflowAction,
  toggleWorkflowEnabledAction,
  deleteWorkflowAction
} from "@/app/actions/connectors";

interface WorkflowUI {
  id: string;
  name: string;
  enabled: boolean;
  trigger_type: string;
  actions: Array<{ tool_name: string; config: Record<string, any> }>;
  created_at: string;
}

const TRIGGER_LABELS: Record<string, string> = {
  "call.completed": "Call Completed",
  "call.failed": "Call Failed",
  "transcript.ready": "Transcript Ready",
  "summary.ready": "Summary Ready",
};

export default function WorkflowsClient() {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<WorkflowUI[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // WORKFLOW CREATOR STATE
  const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState("call.completed");
  const [newWorkflowActions, setNewWorkflowActions] = useState<Array<{ tool_name: string; config: Record<string, any> }>>([
    { tool_name: "slack.send_message", config: { channel: "#general", text: "Call completed! Summary: {{summary}}" } }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getWorkflowsAction();
      if (res.success) {
        setWorkflows(res.workflows || []);
      }
    } catch (e: any) {
      console.error("Failed to load workflows:", e);
    } finally {
      setLoading(false);
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
        showToast("Workflow rule created successfully!");
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
            <span>Workflows & Automation</span>
            <Badge variant="outline" className="text-[10px] font-mono tracking-widest uppercase bg-surface-soft text-neutral-700">
              EVENT ENGINE
            </Badge>
          </h1>
          <p className="text-neutral-600 text-xs sm:text-sm mt-1">
            Automate multi-step connector actions when AI call events happen (WHEN event THEN action).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setShowCreateWorkflowModal(true)}
            variant="default"
            size="sm"
            className="bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold gap-1.5 px-4 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workflow</span>
          </Button>

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

      {/* WORKFLOW RULES LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-black flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-black" />
            <span>Active Automated Rules</span>
            <Badge variant="outline" className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border-emerald-200">
              {workflows.length} RULES
            </Badge>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.length === 0 ? (
            <Card className="col-span-2 border-dashed border-hairline bg-surface-soft/40 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white border border-hairline mx-auto flex items-center justify-center text-neutral-500 shadow-xs">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-black">No Workflows Configured</p>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Create automated rules to execute connected tools (Slack, Gmail, Salesforce, Zapier) when calls complete.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setShowCreateWorkflowModal(true)}
                variant="outline"
                size="sm"
                className="text-xs font-bold border-hairline bg-white hover:bg-black hover:text-white rounded-lg px-4"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                <span>Create First Workflow</span>
              </Button>
            </Card>
          ) : (
            workflows.map((wf) => (
              <Card key={wf.id} className="border-hairline shadow-xs bg-white flex flex-col justify-between overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-black flex items-center gap-2">
                        <span>{wf.name}</span>
                        {wf.enabled ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[9px] py-0">
                            ACTIVE
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-neutral-400 border-hairline text-[9px]">
                            DISABLED
                          </Badge>
                        )}
                      </CardTitle>
                      <span className="text-[10px] font-mono text-neutral-400">Created {new Date(wf.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleWorkflow(wf.id, wf.enabled)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-all ${wf.enabled ? "bg-black" : "bg-neutral-200"}`}
                        title="Toggle Workflow Enabled/Disabled"
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-all ${wf.enabled ? "translate-x-4" : "translate-x-0"}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteWorkflow(wf.id)}
                        className="text-neutral-400 hover:text-red-600 p-1 transition-all"
                        title="Delete Workflow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-2 border-t border-hairline/60 bg-surface-soft/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-neutral-400 font-bold uppercase text-[10px]">WHEN (TRIGGER):</span>
                    <Badge variant="outline" className="bg-white border-hairline font-bold text-black text-[10px]">
                      {TRIGGER_LABELS[wf.trigger_type] || wf.trigger_type}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <span className="text-neutral-400 font-bold uppercase text-[10px] font-mono block">THEN (ACTIONS):</span>
                    <div className="space-y-1">
                      {wf.actions.map((act, i) => (
                        <div key={i} className="bg-white border border-hairline p-2 rounded-lg text-[11px] font-mono flex items-center justify-between">
                          <span className="font-bold text-black">{act.tool_name}</span>
                          <span className="text-[10px] text-neutral-500 truncate max-w-[200px]">
                            {JSON.stringify(act.config)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* CREATE WORKFLOW MODAL */}
      {showCreateWorkflowModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-hairline rounded-[20px] max-w-xl w-full p-6 shadow-2xl space-y-5 text-black relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-hairline pb-3">
              <div>
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  <span>Create Automated Workflow</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">Automate connector tool execution when call events complete.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateWorkflowModal(false)}
                className="text-neutral-400 hover:text-black p-1.5 rounded-full hover:bg-surface-soft"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Workflow Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase text-neutral-600">Workflow Name</label>
              <input
                type="text"
                placeholder="e.g. Post Call Summary to Slack & Email"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                className="w-full bg-surface-soft border border-hairline rounded-xl px-3 py-2 text-xs font-medium text-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Trigger Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-mono uppercase text-neutral-600">WHEN (Trigger Event)</label>
              <select
                value={selectedTrigger}
                onChange={(e) => setSelectedTrigger(e.target.value)}
                className="w-full bg-surface-soft border border-hairline rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="call.completed">Call Completed (call.completed)</option>
                <option value="call.failed">Call Failed (call.failed)</option>
                <option value="transcript.ready">Transcript Ready (transcript.ready)</option>
                <option value="summary.ready">Summary Ready (summary.ready)</option>
              </select>
            </div>

            {/* Actions List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold font-mono uppercase text-neutral-600">THEN (Execute Actions)</label>
                <Button
                  type="button"
                  onClick={handleAddAction}
                  variant="outline"
                  size="sm"
                  className="text-[11px] font-bold border-hairline py-0.5 h-7"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add Action</span>
                </Button>
              </div>

              <div className="space-y-3">
                {newWorkflowActions.map((act, index) => (
                  <div key={index} className="bg-surface-soft p-3 rounded-xl border border-hairline space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">Step {index + 1}</span>
                      {newWorkflowActions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAction(index)}
                          className="text-neutral-400 hover:text-red-600 text-xs"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <select
                      value={act.tool_name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewWorkflowActions((prev) =>
                          prev.map((a, i) =>
                            i === index
                              ? {
                                  tool_name: val,
                                  config:
                                    val === "slack.send_message"
                                      ? { channel: "#general", text: "Call completed: {{summary}}" }
                                      : val === "gmail.create_draft"
                                      ? { to: "team@company.com", subject: "Call Follow-up", body: "{{summary}}" }
                                      : val === "salesforce.add_call_note"
                                      ? { lead_id: "{{customer.id}}", note: "{{summary}}" }
                                      : { webhook_url: "https://hooks.zapier.com/...", event: "call.completed" },
                                }
                              : a
                          )
                        );
                      }}
                      className="w-full bg-white border border-hairline rounded-lg px-2.5 py-1.5 text-xs font-bold text-black"
                    >
                      <option value="slack.send_message">Slack → Send Message (slack.send_message)</option>
                      <option value="gmail.create_draft">Gmail → Create Draft (gmail.create_draft)</option>
                      <option value="salesforce.add_call_note">Salesforce → Add Call Note (salesforce.add_call_note)</option>
                      <option value="zapier.trigger_webhook">Zapier → Trigger Webhook (zapier.trigger_webhook)</option>
                    </select>

                    {/* Quick Config Inputs */}
                    {act.tool_name === "slack.send_message" && (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Channel e.g. #general"
                          value={act.config.channel || "#general"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewWorkflowActions((prev) =>
                              prev.map((a, i) => (i === index ? { ...a, config: { ...a.config, channel: val } } : a))
                            );
                          }}
                          className="bg-white border border-hairline px-2 py-1 rounded text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Message text e.g. {{summary}}"
                          value={act.config.text || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewWorkflowActions((prev) =>
                              prev.map((a, i) => (i === index ? { ...a, config: { ...a.config, text: val } } : a))
                            );
                          }}
                          className="bg-white border border-hairline px-2 py-1 rounded text-xs"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
              <Button
                type="button"
                onClick={() => setShowCreateWorkflowModal(false)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleSaveWorkflow}
                variant="default"
                size="sm"
                className="bg-black hover:bg-neutral-800 text-white font-bold text-xs px-5 rounded-lg"
              >
                <span>Save Workflow</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
