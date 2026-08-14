import { createClient } from "@supabase/supabase-js";

const url = "https://gkyilicraflkgcfgqypc.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWlsaWNyYWZsa2djZmdxeXBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA4Mzc0NiwiZXhwIjoyMTAxNjU5NzQ2fQ.DYf3RkJp3F8WFPNio6XiUVCYv2Fc7WztfKeLwI4N3eI";

const supabase = createClient(url, serviceKey);

async function test() {
  console.log("Testing Supabase connection...");
  const { data: profiles, error: pErr } = await supabase.from("profiles").select("id").limit(1);
  console.log("Profiles check:", { profiles, pErr });
}

test();
