"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Check,
  Play,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Wrench,
  Lock,
  Layers,
  ShieldCheck,
  Zap,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { configureAssistantToolAction, testAssistantToolAction } from "@/app/actions/assistants";
import { getToolCallingDefaults, ToolSpecificFieldDef } from "@/lib/toolCallingDefaults";

export interface ToolAssignmentConfig {
  assistant_id: string;
  tool_name: string;
  tool_title?: string;
  description?: string;
  provider_slug?: string;
  category: "READ" | "WRITE" | "DESTRUCTIVE";
  enabled: boolean;
  when_to_use: string;
  requires_confirmation: boolean;
  timeout_ms: number;
  failure_message: string;
  allowed_during_call: boolean;
  connected_account_email?: string | null;
  is_connector_authorized: boolean;
  sync_status?: "synced" | "failed" | "pending";
  sync_error?: string | null;
  tool_specific_config?: Record<string, any>;
}

interface AssistantToolConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: ToolAssignmentConfig;
  onSaved: (updatedConfig: ToolAssignmentConfig) => void;
}

// ─── Toggle Component ─────────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
  disabled = false
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
        value && !disabled ? "bg-emerald-500" : disabled && value ? "bg-black" : "bg-neutral-300"
      } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Tool-Specific Field Renderer ─────────────────────────────────────────────
function ToolSpecificField({
  field,
  value,
  onChange
}: {
  field: ToolSpecificFieldDef;
  value: any;
  onChange: (key: string, v: any) => void;
}) {
  const displayValue = value !== undefined && value !== null ? value : field.default;

  const labelEl = (
    <div className="space-y-0.5 flex-1">
      <Label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
        {field.label}
      </Label>
      {field.description && (
        <p className="text-[10px] text-neutral-400 leading-relaxed">{field.description}</p>
      )}
    </div>
  );

  if (field.type === "toggle") {
    return (
      <div className="flex items-start justify-between gap-4">
        {labelEl}
        <Toggle value={!!displayValue} onChange={(v) => onChange(field.key, v)} />
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="space-y-1">
        {labelEl}
        <Input
          type="number"
          value={displayValue ?? ""}
          onChange={(e) => onChange(field.key, parseInt(e.target.value) || field.default)}
          className="bg-surface-soft border border-hairline rounded-xl px-3 py-2 text-xs font-bold"
          placeholder={field.placeholder}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-1">
        {labelEl}
        <select
          value={displayValue ?? field.default}
          onChange={(e) => onChange(field.key, e.target.value)}
          className="w-full bg-surface-soft border border-hairline rounded-xl px-3 py-2 text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-black/20"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-1">
        {labelEl}
        <Textarea
          rows={3}
          value={displayValue ?? ""}
          onChange={(e) => onChange(field.key, e.target.value)}
          className="bg-surface-soft border border-hairline rounded-xl p-3 text-xs font-semibold leading-relaxed"
          placeholder={field.placeholder}
        />
      </div>
    );
  }

  // Default: text
  return (
    <div className="space-y-1">
      {labelEl}
      <Input
        type="text"
        value={displayValue ?? ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="bg-surface-soft border border-hairline rounded-xl px-3 py-2 text-xs font-semibold"
        placeholder={field.placeholder}
      />
    </div>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export function AssistantToolConfigDrawer({
  isOpen,
  onClose,
  config,
  onSaved
}: AssistantToolConfigDrawerProps) {
  const toolDefaults = getToolCallingDefaults(config.tool_name);

  const isWriteOrDestructive =
    config.category === "WRITE" ||
    config.category === "DESTRUCTIVE" ||
    toolDefaults.category !== "READ";

  // Common settings state
  const [enabled, setEnabled] = useState(config.enabled !== false);
  const [whenToUse, setWhenToUse] = useState(
    config.when_to_use || toolDefaults.when_to_use
  );
  const [requiresConfirmation, setRequiresConfirmation] = useState(
    isWriteOrDestructive ? true : (config.requires_confirmation ?? toolDefaults.requires_confirmation)
  );
  const [timeoutMs, setTimeoutMs] = useState(config.timeout_ms || toolDefaults.timeout_ms);
  const [failureMessage, setFailureMessage] = useState(
    config.failure_message || toolDefaults.failure_message
  );
  const [allowedDuringCall, setAllowedDuringCall] = useState(
    config.allowed_during_call !== undefined
      ? config.allowed_during_call
      : toolDefaults.allowed_during_call
  );

  // Tool-specific config state (keyed by field.key)
  const [toolSpecificConfig, setToolSpecificConfig] = useState<Record<string, any>>(
    () => {
      const base: Record<string, any> = {};
      // Start from schema defaults
      for (const field of toolDefaults.tool_specific_schema || []) {
        if (field.workflow_only) continue; // skip workflow-only fields in drawer
        base[field.key] = field.default;
      }
      // Override with saved values
      if (config.tool_specific_config) {
        Object.assign(base, config.tool_specific_config);
      }
      return base;
    }
  );

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Reset state when drawer opens with new config
  useEffect(() => {
    if (isOpen) {
      const defs = getToolCallingDefaults(config.tool_name);
      const isWD =
        config.category === "WRITE" || config.category === "DESTRUCTIVE" || defs.category !== "READ";

      setEnabled(config.enabled !== false);
      setWhenToUse(config.when_to_use || defs.when_to_use);
      setRequiresConfirmation(
        isWD ? true : (config.requires_confirmation ?? defs.requires_confirmation)
      );
      setTimeoutMs(config.timeout_ms || defs.timeout_ms);
      setFailureMessage(config.failure_message || defs.failure_message);
      setAllowedDuringCall(
        config.allowed_during_call !== undefined ? config.allowed_during_call : defs.allowed_during_call
      );

      // Reset tool-specific config
      const base: Record<string, any> = {};
      for (const field of defs.tool_specific_schema || []) {
        if (field.workflow_only) continue;
        base[field.key] = field.default;
      }
      if (config.tool_specific_config) Object.assign(base, config.tool_specific_config);
      setToolSpecificConfig(base);

      setTestResult(null);
      setTestError(null);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  // Fields to render in drawer (exclude workflow_only fields)
  const callTimeFields = (toolDefaults.tool_specific_schema || []).filter(
    (f) => !f.workflow_only
  );

  const handleFieldChange = (key: string, val: any) => {
    setToolSpecificConfig((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    if (!config.is_connector_authorized) {
      alert(
        `Cannot save: Connect ${config.provider_slug?.toUpperCase() || "the integration"} first.`
      );
      return;
    }

    setSaving(true);
    setToastMsg(null);

    const finalConfirmation = isWriteOrDestructive ? true : requiresConfirmation;

    try {
      const payload = {
        tool_name: config.tool_name,
        enabled,
        when_to_use: whenToUse,
        requires_confirmation: finalConfirmation,
        timeout_ms: Number(timeoutMs) || toolDefaults.timeout_ms,
        failure_message: failureMessage,
        allowed_during_call: allowedDuringCall,
        category: toolDefaults.category || config.category,
        tool_specific_config: toolSpecificConfig
      };

      const res = await configureAssistantToolAction(config.assistant_id, payload);
      if (res.success && res.assignment) {
        onSaved({
          ...config,
          ...res.assignment,
          connected_account_email: config.connected_account_email,
          is_connector_authorized: config.is_connector_authorized,
          tool_specific_config: toolSpecificConfig
        });
        showToast("Configuration saved successfully!");
        setTimeout(() => onClose(), 1000);
      } else {
        alert(res.error || "Failed to save configuration");
      }
    } catch (err: any) {
      alert("Save Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRunTest = async () => {
    setTesting(true);
    setTestResult(null);
    setTestError(null);

    try {
      const sampleParams = {
        assistant_id: config.assistant_id,
        test_query: "Verification test execution",
        ...toolSpecificConfig
      };

      const res = await testAssistantToolAction(
        config.assistant_id,
        config.tool_name,
        sampleParams
      );
      if (res.success) {
        setTestResult(res);
      } else {
        setTestError(res.error || "Test execution failed");
      }
    } catch (err: any) {
      setTestError(err.message || "Execution test error");
    } finally {
      setTesting(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const supportsWorkflow = toolDefaults.execution_capabilities.includes("workflow");
  const categoryColor =
    config.category === "READ"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : config.category === "WRITE"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-red-100 text-red-800 border-red-200";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden text-black">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="p-6 border-b border-hairline bg-surface-soft/40 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-black">
                {config.tool_title || config.tool_name}
              </h2>
              <Badge className={`font-mono text-[10px] uppercase font-bold ${categoryColor}`}>
                {config.category}
              </Badge>
              {isWriteOrDestructive && (
                <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[9px] font-bold gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Confirmation Enforced
                </Badge>
              )}
            </div>
            <p className="text-xs text-neutral-600 font-mono">{config.tool_name}</p>
            {config.description && (
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed max-w-lg">
                {config.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Toast */}
          {toastMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* 1. Connected Account */}
          <div className="p-4 rounded-xl border border-hairline bg-surface-soft/30 space-y-2">
            <Label className="eyebrow text-neutral-500">CONNECTED ACCOUNT</Label>
            {config.is_connector_authorized ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-black">
                    {config.tool_name.startsWith("slack.")
                      ? "Slack Workspace"
                      : "Google Workspace"}{" "}
                    — {config.connected_account_email || "Authorized Account"}
                  </span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-700 text-[10px] font-mono font-bold">
                  ACTIVE
                </Badge>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Connect{" "}
                    {config.tool_name.startsWith("slack.") ? "Slack" : "Google Workspace"} first
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  This tool requires an active OAuth connection. Connect in Connectors before
                  enabling.
                </p>
                <a
                  href="/dashboard/connectors"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-colors"
                >
                  <span>Go to Connectors</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* 2. Enable & When To Use */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold uppercase text-black">
                  Enable Tool for Assistant
                </Label>
                <p className="text-[11px] text-neutral-500">
                  Allow AI to call this tool during live calls.
                </p>
              </div>
              <Toggle
                value={enabled && config.is_connector_authorized}
                onChange={setEnabled}
                disabled={!config.is_connector_authorized}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="eyebrow text-neutral-500">WHEN TO USE (LLM INSTRUCTIONS) *</Label>
              <p className="text-[11px] text-neutral-500">
                Exact triggers for the Voice AI model. Be specific.
              </p>
              <Textarea
                rows={3}
                value={whenToUse}
                onChange={(e) => setWhenToUse(e.target.value)}
                className="bg-surface-soft border border-hairline rounded-xl p-3 text-xs font-semibold leading-relaxed"
                placeholder="Use when caller explicitly asks to..."
              />
            </div>
          </div>

          {/* 3. Safety & Confirmation */}
          <div className="space-y-4 pt-4 border-t border-hairline">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-bold uppercase text-black">
                    Requires Confirmation
                  </Label>
                  {isWriteOrDestructive && (
                    <Badge className="bg-amber-100 text-amber-800 text-[9px] font-bold gap-1">
                      <Lock className="w-2.5 h-2.5" /> MANDATORY
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500">
                  Caller must verbally confirm before action executes.
                </p>
              </div>
              <Toggle
                value={requiresConfirmation || isWriteOrDestructive}
                onChange={setRequiresConfirmation}
                disabled={isWriteOrDestructive}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="eyebrow text-neutral-500">TIMEOUT (MS)</Label>
                <Input
                  type="number"
                  value={timeoutMs}
                  onChange={(e) => setTimeoutMs(parseInt(e.target.value) || 10000)}
                  className="bg-surface-soft border border-hairline rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="eyebrow text-neutral-500">ALLOWED DURING CALL</Label>
                <div className="flex items-center gap-2 pt-1">
                  <Toggle value={allowedDuringCall} onChange={setAllowedDuringCall} />
                  <span className="text-xs font-bold">
                    {allowedDuringCall ? "Yes (Active Call)" : "Post Call Only"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="eyebrow text-neutral-500">FAILURE MESSAGE (ON ERROR)</Label>
              <Input
                value={failureMessage}
                onChange={(e) => setFailureMessage(e.target.value)}
                className="bg-surface-soft border border-hairline rounded-xl px-3 py-2 text-xs font-semibold"
                placeholder="Tool execution failed. Please try again."
              />
            </div>
          </div>

          {/* 4. Tool-Specific Settings — Only rendered if the tool has schema fields */}
          {callTimeFields.length > 0 && (
            <div className="pt-4 border-t border-hairline space-y-4">
              <div>
                <Label className="eyebrow text-neutral-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>TOOL SETTINGS</span>
                </Label>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Fine-tune behavior specific to{" "}
                  <span className="font-mono text-black text-[10px]">{config.tool_name}</span>.
                </p>
              </div>

              <div className="bg-surface-soft/40 border border-hairline rounded-xl p-4 space-y-5">
                {callTimeFields.map((field) => (
                  <ToolSpecificField
                    key={field.key}
                    field={field}
                    value={toolSpecificConfig[field.key]}
                    onChange={handleFieldChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 5. Tool Test */}
          <div className="p-4 rounded-xl border border-hairline bg-surface-soft/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="eyebrow text-neutral-500 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-black" />
                  <span>TEST & VERIFY</span>
                </Label>
                <p className="text-[11px] text-neutral-500">
                  Dry-run to confirm the tool is reachable and authorized.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleRunTest}
                disabled={testing}
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-bold gap-1.5 bg-white border-hairline shadow-xs hover:bg-neutral-50"
              >
                <Play className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
                <span>{testing ? "Testing..." : "🧪 Test Tool"}</span>
              </Button>
            </div>

            {testError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-mono font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{testError}</span>
              </div>
            )}

            {testResult && (
              <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between font-bold text-emerald-800">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    STATUS: PASS
                  </span>
                  <span>Latency: {testResult.latency_ms}ms</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-[11px] text-neutral-700 overflow-x-auto">
                  <p className="font-bold text-black mb-1">Response Preview:</p>
                  <pre className="text-[10px] text-neutral-600 font-mono leading-relaxed">
                    {JSON.stringify(testResult.output_preview, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* 6. Workflow Automation Badge — only for tools that support workflows */}
          {supportsWorkflow && (
            <div className="p-4 rounded-xl border border-violet-200 bg-violet-50/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-600" />
                  <div>
                    <p className="text-xs font-bold text-violet-900">After-Call Automations</p>
                    <p className="text-[11px] text-violet-600/80">
                      This tool can also run automatically after calls via Workflows.
                    </p>
                  </div>
                </div>
                <a
                  href="/dashboard/workflows"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold transition-colors"
                >
                  <span>Manage Workflows</span>
                  <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className="p-4 border-t border-hairline bg-surface-soft/50 flex items-center justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold px-4"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !config.is_connector_authorized}
            size="sm"
            className="rounded-xl text-xs font-bold px-6 bg-black hover:bg-neutral-800 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>
    </div>
  );
}
