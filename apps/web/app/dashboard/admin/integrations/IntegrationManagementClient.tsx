"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  Search, 
  Layers, 
  FileText,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  getAdminConnectorAvailabilitiesAction, 
  updateConnectorAvailabilityAction 
} from "@/app/actions/connectors";

export interface ConnectorAvailabilityItem {
  slug: string;
  name: string;
  availability_status: "enabled" | "disabled" | "coming_soon";
  is_visible: boolean;
  internal_note?: string;
  updated_at: string;
}

export default function IntegrationManagementClient() {
  const [loading, setLoading] = useState(true);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [items, setItems] = useState<ConnectorAvailabilityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAdminConnectorAvailabilitiesAction();
      if (res.success && res.availabilities) {
        setItems(res.availabilities);
      }
    } catch (e) {
      console.error("Failed to load admin availabilities:", e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateItem = async (
    slug: string,
    newStatus: "enabled" | "disabled" | "coming_soon",
    newVisible: boolean,
    newNote?: string
  ) => {
    setSavingSlug(slug);
    try {
      const res = await updateConnectorAvailabilityAction(slug, newStatus, newVisible, newNote);
      if (res.success && res.record) {
        setItems((prev) =>
          prev.map((item) => (item.slug === slug ? { ...item, ...res.record } : item))
        );
        showToast(`Updated '${slug}' status to ${newStatus}`);
      } else {
        alert(res.error || "Failed to update integration state");
      }
    } catch (e: any) {
      alert("Error saving integration state: " + e.message);
    } finally {
      setSavingSlug(null);
    }
  };

  const redundantSlugs = new Set(["google_calendar", "google_sheets", "vomyra_crm", "api", "outlook"]);

  const filteredItems = items
    .filter((item) => !redundantSlugs.has(item.slug))
    .map((item) => (item.slug === "gmail" ? { ...item, name: "Google Workspace" } : item))
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.availability_status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  const getStatusBadge = (status: "enabled" | "disabled" | "coming_soon") => {
    switch (status) {
      case "enabled":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-[11px] gap-1">
            <CheckCircle2 className="w-3 h-3" /> ENABLED
          </Badge>
        );
      case "disabled":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-mono text-[11px] gap-1">
            <AlertTriangle className="w-3 h-3" /> DISABLED
          </Badge>
        );
      case "coming_soon":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-mono text-[11px] gap-1">
            <Clock className="w-3 h-3" /> COMING SOON
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-950 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] font-mono tracking-widest uppercase">
                ADMIN CONTROL CENTER
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Integration Availability Management</h1>
            <p className="text-neutral-300 max-w-2xl text-sm leading-relaxed">
              Control global connector availability, customer visibility, and state enforcement across VoicePilot.
            </p>
          </div>
          <Button
            onClick={loadData}
            variant="outline"
            disabled={loading}
            className="border-white/20 bg-white/10 hover:bg-white/20 text-white gap-2 self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Matrix
          </Button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search integration or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs font-mono text-neutral-500 uppercase">Status Filter:</span>
            {["all", "enabled", "disabled", "coming_soon"].map((st) => (
              <Button
                key={st}
                variant={statusFilter === st ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(st)}
                className={`text-xs capitalize font-mono ${
                  statusFilter === st
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {st.replace("_", " ")}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-500 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-mono">Loading Integration Matrix...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800">
          <Layers className="w-10 h-10 mx-auto text-neutral-400 mb-3" />
          <p className="text-base font-semibold">No integrations match query</p>
          <p className="text-xs text-neutral-500 mt-1">Try adjusting search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <IntegrationCard
              key={item.slug}
              item={item}
              isSaving={savingSlug === item.slug}
              onSave={handleUpdateItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function IntegrationCard({
  item,
  isSaving,
  onSave,
}: {
  item: ConnectorAvailabilityItem;
  isSaving: boolean;
  onSave: (
    slug: string,
    status: "enabled" | "disabled" | "coming_soon",
    visible: boolean,
    note?: string
  ) => void;
}) {
  const [status, setStatus] = useState<"enabled" | "disabled" | "coming_soon">(item.availability_status);
  const [visible, setVisible] = useState<boolean>(item.is_visible);
  const [note, setNote] = useState<string>(item.internal_note || "");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setStatus(item.availability_status);
    setVisible(item.is_visible);
    setNote(item.internal_note || "");
    setHasChanges(false);
  }, [item]);

  const handleStatusChange = (val: "enabled" | "disabled" | "coming_soon") => {
    setStatus(val);
    setHasChanges(true);
  };

  const handleVisibleToggle = () => {
    setVisible(!visible);
    setHasChanges(true);
  };

  const handleNoteChange = (val: string) => {
    setNote(val);
    setHasChanges(true);
  };

  const handleSaveClick = () => {
    onSave(item.slug, status, visible, note);
  };

  return (
    <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              {item.name}
            </CardTitle>
            <CardDescription className="text-xs font-mono text-neutral-400 mt-0.5">
              Provider Key: <span className="text-indigo-500 font-semibold">{item.slug}</span>
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVisibleToggle}
            title={visible ? "Visible to customers" : "Hidden from customers"}
            className={`h-8 px-2 text-xs font-mono gap-1 border ${
              visible
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
                : "border-neutral-300 dark:border-neutral-700 text-neutral-400 bg-neutral-100 dark:bg-neutral-800"
            }`}
          >
            {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {visible ? "Visible" : "Hidden"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 text-xs">
        {/* Availability Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400">
            Global Integration Status
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-lg">
            {(["enabled", "disabled", "coming_soon"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusChange(st)}
                className={`py-1.5 px-2 rounded-md font-mono text-[11px] capitalize transition-all ${
                  status === st
                    ? st === "enabled"
                      ? "bg-emerald-600 text-white shadow-sm font-semibold"
                      : st === "disabled"
                      ? "bg-rose-600 text-white shadow-sm font-semibold"
                      : "bg-amber-600 text-white shadow-sm font-semibold"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Internal Admin Note */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Admin Internal Note
          </label>
          <Input
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="e.g. Disabled pending OAuth audit"
            className="bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-xs"
          />
        </div>

        {/* Last Updated Timestamp */}
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
          <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
          {hasChanges && <span className="text-amber-500 font-semibold">• Unsaved Changes</span>}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleSaveClick}
          disabled={isSaving || !hasChanges}
          size="sm"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs gap-1.5 mt-2"
        >
          {isSaving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {isSaving ? "Saving..." : "Save Availability State"}
        </Button>
      </CardContent>
    </Card>
  );
}
