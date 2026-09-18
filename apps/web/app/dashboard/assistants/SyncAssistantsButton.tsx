"use client";

import React, { useState } from "react";
import { RefreshCw, CheckCircle2, CloudDownload } from "lucide-react";
import { syncAssistantsWithVomyraAction } from "@/app/actions/assistants";

export default function SyncAssistantsButton() {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await syncAssistantsWithVomyraAction();
      if (res.success) {
        setMessage(`Synced! (${res.importedCount} imported, ${res.cleanedCount} cleaned)`);
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (err: any) {
      alert("Sync error: " + (err.message || "Failed to sync with cloud"));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {message}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="btn-pill-secondary text-xs px-3.5 py-2.5 font-semibold flex items-center gap-1.5 hover:bg-neutral-100 transition-all border border-hairline shadow-xs disabled:opacity-50"
        title="Synchronize live voice agents from Voice Cloud"
      >
        <CloudDownload className={`w-3.5 h-3.5 text-neutral-600 ${syncing ? "animate-bounce" : ""}`} />
        <span>{syncing ? "Syncing Cloud..." : "Sync with Cloud"}</span>
      </button>
    </div>
  );
}
