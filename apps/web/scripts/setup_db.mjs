import { createClient } from "@supabase/supabase-js";

const url = "https://gkyilicraflkgcfgqypc.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWlsaWNyYWZsa2djZmdxeXBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA4Mzc0NiwiZXhwIjoyMTAxNjU5NzQ2fQ.DYf3RkJp3F8WFPNio6XiUVCYv2Fc7WztfKeLwI4N3eI";

const supabase = createClient(url, serviceKey);

async function main() {
  console.log("Checking voice_demo_calls table in Supabase...");
  const { data, error } = await supabase.from("voice_demo_calls").select("id").limit(1);
  if (error) {
    console.log("Query result error:", error);
    if (error.code === "42P01" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
      console.log("Table does not exist yet. Running table creation via SQL endpoint...");
      // Try posting to Supabase pg / sql endpoint if available, or logging SQL
      const sql = `
        CREATE TABLE IF NOT EXISTS public.voice_demo_calls (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          phone_number TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'reserved',
          call_id TEXT,
          provider TEXT NOT NULL DEFAULT 'vomyra',
          max_duration_seconds INT DEFAULT 60,
          notes TEXT,
          started_at TIMESTAMPTZ,
          completed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT now(),
          CONSTRAINT unique_user_demo_call UNIQUE (user_id)
        );
        ALTER TABLE public.voice_demo_calls ENABLE ROW LEVEL SECURITY;
      `;
      try {
        const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": serviceKey,
            "Authorization": `Bearer ${serviceKey}`
          },
          body: JSON.stringify({ query: sql })
        });
        console.log("RPC exec_sql status:", res.status, await res.text());
      } catch (e) {
        console.error("RPC exec_sql error:", e);
      }
    }
  } else {
    console.log("voice_demo_calls table exists! Rows sample:", data);
  }
}

main();
