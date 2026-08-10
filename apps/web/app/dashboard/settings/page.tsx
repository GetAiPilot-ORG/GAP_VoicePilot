import { Key, Shield, Webhook, Phone, Copy, Check, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <div className="border-b border-hairline pb-6">
        <p className="eyebrow text-neutral-500">// DEVELOPER CONFIGURATION</p>
        <h1 className="text-3xl font-bold tracking-tight text-black mt-1">API & Telephony Credentials</h1>
        <p className="text-sm text-neutral-600">Manage GAP VoicePilot API keys, Webhooks, and SIP credentials.</p>
      </div>

      {/* API Key Box */}
      <div className="bg-white border border-hairline rounded-[14px] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-black flex items-center gap-2">
              <Key className="w-4 h-4 text-black" />
              Live Secret API Key
            </h2>
            <p className="text-xs text-neutral-500">Use this key to authenticate server-to-server requests to GAP VoicePilot API.</p>
          </div>
          <span className="eyebrow bg-block-lime text-black px-2.5 py-0.5 rounded-full border border-black/10 text-[10px]">
            ACTIVE
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input 
            type="password" 
            readOnly 
            value="gap_live_8f931a29841b00e39218ab573" 
            className="flex-1 bg-surface-soft border border-hairline rounded-[10px] px-4 py-2 text-xs font-mono text-neutral-800 min-w-0"
          />
          <button className="btn-pill-secondary rounded-[10px] text-xs px-4 py-2 justify-center">
            <Copy className="w-3.5 h-3.5" />
            Copy Key
          </button>
        </div>
      </div>

      {/* Webhook Endpoint Box */}
      <div className="bg-white border border-hairline rounded-[14px] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-black flex items-center gap-2">
              <Webhook className="w-4 h-4 text-black" />
              Webhook Endpoint URL
            </h2>
            <p className="text-xs text-neutral-500">GAP VoicePilot will post real-time call events & transcripts to this URL.</p>
          </div>
        </div>

        <div className="space-y-3">
          <input 
            type="text" 
            defaultValue="https://api.yourdomain.com/webhooks/voicepilot" 
            className="w-full bg-surface-soft border border-hairline rounded-[10px] px-4 py-2 text-xs font-mono text-neutral-800 focus:outline-none focus:border-black/30"
          />
          <button className="btn-pill-primary rounded-[10px] text-xs px-5 py-2">
            <Save className="w-3.5 h-3.5" />
            Save Webhook Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
