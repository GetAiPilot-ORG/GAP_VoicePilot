"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowRight, Zap, CheckCircle2, AlertCircle, Lock } from "lucide-react";

function OAuthAuthorizeContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client_id") || "vp_client_zapier_app245289_cli";
  const redirectUri = searchParams.get("redirect_uri") || "https://zapier.com/dashboard/auth/oauth/return/App245289CLIAPI/";
  const state = searchParams.get("state") || "";
  const scopeStr = searchParams.get("scope") || "profile:read assistants:read calls:read calls:write contacts:read contacts:write zapier:subscribe";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scopeList = scopeStr.split(/[\s,]+/).filter(Boolean);

  const scopeLabels: Record<string, { label: string; desc: string }> = {
    "profile:read": { label: "View User Profile", desc: "Access your account profile and email address" },
    "assistants:read": { label: "Read Assistants", desc: "Access configured AI VoicePilot assistants" },
    "calls:read": { label: "Read Call Logs & Transcripts", desc: "Access voice call history, transcripts, and analytics" },
    "calls:write": { label: "Create Outbound Calls", desc: "Trigger automated outbound AI voice calls" },
    "contacts:read": { label: "Read Workspace Contacts", desc: "Access workspace address book and contacts" },
    "contacts:write": { label: "Create & Update Contacts", desc: "Add or update workspace contacts" },
    "zapier:subscribe": { label: "Manage Zapier Subscriptions", desc: "Register real-time REST webhooks for call triggers" },
  };

  const handleApprove = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/oauth/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          clientId,
          redirectUri,
          state,
          scope: scopeStr,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error_description || data.error || "Authorization failed");
      }

      // Redirect to Zapier Callback URL
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      setError(err.message || "Failed to complete authorization");
      setLoading(false);
    }
  };

  const handleDeny = () => {
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set("error", "access_denied");
    callbackUrl.searchParams.set("error_description", "User denied authorization request");
    if (state) callbackUrl.searchParams.set("state", state);
    window.location.href = callbackUrl.toString();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        
        {/* Header Branding */}
        <div className="flex items-center justify-center space-x-4 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Zap className="w-6 h-6" />
          </div>
          <ArrowRight className="w-5 h-5 text-slate-600" />
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
            GAP
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-slate-100">
            Zapier wants to connect to your GAP VoicePilot account
          </h1>
          <p className="text-sm text-slate-400">
            This will allow Zapier to automate voice workflows and sync call data.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Permissions List */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Requested Permissions</span>
          </h2>
          
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {scopeList.map((sc) => {
              const info = scopeLabels[sc] || { label: sc, desc: `Access permission for ${sc}` };
              return (
                <div key={sc} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-slate-200">{info.label}</div>
                    <div className="text-xs text-slate-400">{info.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-3 text-xs text-slate-400">
          <Lock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>Your access tokens are encrypted and permanently bound to your current active workspace.</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            onClick={handleDeny}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition disabled:opacity-50"
          >
            Deny
          </button>

          <button
            type="button"
            onClick={handleApprove}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-sm shadow-lg shadow-orange-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authorizing...</span>
            ) : (
              <>
                <span>Allow Access</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function OAuthAuthorizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-slate-400 text-sm">Loading authorization prompt...</div>
      </div>
    }>
      <OAuthAuthorizeContent />
    </Suspense>
  );
}
