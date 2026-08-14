import { createClient } from "@supabase/supabase-js";

const url = "https://gkyilicraflkgcfgqypc.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWlsaWNyYWZsa2djZmdxeXBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA4Mzc0NiwiZXhwIjoyMTAxNjU5NzQ2fQ.DYf3RkJp3F8WFPNio6XiUVCYv2Fc7WztfKeLwI4N3eI";

const supabase = createClient(url, serviceKey);

async function main() {
  console.log("=== Syncing Demo Assistant to Supabase ===");
  
  // 1. Get default workspace or first profile
  const { data: workspaces } = await supabase.from("workspaces").select("id, owner_id").limit(5);
  console.log("Workspaces found:", workspaces);

  if (workspaces && workspaces.length > 0) {
    for (const ws of workspaces) {
      const { data: existing } = await supabase
        .from("assistants")
        .select("id")
        .eq("workspace_id", ws.id)
        .eq("provider_resource_id", "6a7d9fd812df58f68ce4f83c")
        .maybeSingle();

      if (!existing) {
        const { data: inserted, error } = await supabase
          .from("assistants")
          .insert({
            workspace_id: ws.id,
            created_by: ws.owner_id,
            provider: "vomyra",
            provider_resource_id: "6a7d9fd812df58f68ce4f83c",
            name: "VoicePilot Public Demo Agent 2026",
            config_snapshot: {
              name: "VoicePilot Public Demo Agent 2026",
              model: "gpt-4o-mini",
              first_message: "Namaste! Hello from GAP VoicePilot. This is your live 60-second AI test call. How are you doing today?"
            },
            status: "active"
          })
          .select()
          .single();

        console.log(`Inserted demo assistant for workspace ${ws.id}:`, inserted, error);
      } else {
        console.log(`Demo assistant already exists for workspace ${ws.id}`);
      }
    }
  }
}

main();
