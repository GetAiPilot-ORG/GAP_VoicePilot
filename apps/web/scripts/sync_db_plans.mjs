import { createClient } from "@supabase/supabase-js";

const url = "https://gkyilicraflkgcfgqypc.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWlsaWNyYWZsa2djZmdxeXBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA4Mzc0NiwiZXhwIjoyMTAxNjU5NzQ2fQ.DYf3RkJp3F8WFPNio6XiUVCYv2Fc7WztfKeLwI4N3eI";

const supabase = createClient(url, serviceKey);

async function syncPlans() {
  console.log("=== Updating database plans table ===");

  const plansToUpsert = [
    {
      id: "call_lite",
      name: "CALL LITE",
      price_monthly: 1499,
      included_credits: 250,
      max_assistants: 1,
      max_concurrent_calls: 1,
      features: { campaigns: false, extra_min_rate: 6 },
      is_active: true
    },
    {
      id: "call_pro",
      name: "CALL PRO",
      price_monthly: 4999,
      included_credits: 1000,
      max_assistants: 5,
      max_concurrent_calls: 2,
      features: { campaigns: true, extra_min_rate: 5 },
      is_active: true
    },
    {
      id: "call_elite",
      name: "CALL ELITE",
      price_monthly: 9999,
      included_credits: 2000,
      max_assistants: 20,
      max_concurrent_calls: 5,
      features: { campaigns: true, extra_min_rate: 5 },
      is_active: true
    }
  ];

  for (const plan of plansToUpsert) {
    const { data, error } = await supabase.from("plans").upsert(plan).select();
    console.log(`Plan ${plan.id} upsert result:`, data, error);
  }
}

syncPlans();
