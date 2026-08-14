import { createClient } from "@supabase/supabase-js";

const url = "https://gkyilicraflkgcfgqypc.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWlsaWNyYWZsa2djZmdxeXBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA4Mzc0NiwiZXhwIjoyMTAxNjU5NzQ2fQ.DYf3RkJp3F8WFPNio6XiUVCYv2Fc7WztfKeLwI4N3eI";

const supabase = createClient(url, serviceKey);

async function populateVoicePilotPlans() {
  console.log("=== Populating VoicePilot database plans table ===");

  const plans = [
    {
      id: "call_lite",
      name: "Start",
      price_monthly: 1499,
      included_credits: 250,
      max_assistants: 1,
      max_concurrent_calls: 1,
      is_active: true,
      features: {
        audience: "FOR STARTERS",
        description: "250 AI calling minutes included.",
        feeNote: "Effective rate: ₹6.00 / min • ₹0 platform fee.",
        extra_min_rate: 6,
        feature_list: [
          "250 AI Calling Minutes",
          "₹6.00 / min per-minute rate",
          "Hindi, English & Hinglish Support",
          "Custom AI System Prompts",
          "Basic Lead & Contact Capture"
        ]
      }
    },
    {
      id: "call_pro",
      name: "Build",
      price_monthly: 4999,
      included_credits: 1000,
      max_assistants: 5,
      max_concurrent_calls: 2,
      is_active: true,
      features: {
        audience: "FOR TEAMS",
        description: "Daily sales calls, live transfers & auto-CRM sync.",
        feeNote: "Effective rate: ₹5.00 / min • Includes 1,000 mins.",
        extra_min_rate: 5,
        is_popular: true,
        feature_list: [
          "1,000 AI Calling Minutes",
          "₹5.00 / min per-minute rate",
          "Realtime Live Call Transfer",
          "Automatic CRM Auto-Syncing",
          "Live Call Transcripts & Recording"
        ]
      }
    },
    {
      id: "call_elite",
      name: "Scale",
      price_monthly: 9999,
      included_credits: 2000,
      max_assistants: 20,
      max_concurrent_calls: 5,
      is_active: true,
      features: {
        audience: "FOR HIGH VOLUME",
        description: "Lowest per-minute rates for high-volume dialers.",
        feeNote: "Effective rate: ₹5.00 / min • Includes 2,000 mins.",
        extra_min_rate: 5,
        feature_list: [
          "2,000 AI Calling Minutes",
          "₹5.00 / min per-minute rate",
          "Unlimited Multi-Agent Workflows",
          "Priority SIP Latency Routing",
          "Dedicated Account Manager"
        ]
      }
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price_monthly: 0,
      included_credits: 0,
      max_assistants: 99,
      max_concurrent_calls: 99,
      is_active: true,
      features: {
        audience: "FOR ORGANIZATIONS",
        description: "Dedicated infrastructure with controls regulated teams require.",
        feeNote: "Contracted to your volume.",
        extra_min_rate: 0,
        is_enterprise: true,
        feature_list: [
          "Concurrency sized to your volume",
          "Custom per-minute bulk rates",
          "Custom SIP trunking & on-prem",
          "Forward-deployed engineer",
          "TRAI, SOC2 & DLT compliance",
          "Zero data retention & SSO"
        ]
      }
    }
  ];

  // Clean old obsolete plans
  await supabase.from("plans").delete().in("id", ["starter", "growth", "agency_pro"]);

  for (const plan of plans) {
    const { data, error } = await supabase.from("plans").upsert(plan).select();
    console.log(`Upsert plan ${plan.id}:`, data, error);
  }

  const { data: allDbPlans } = await supabase.from("plans").select("*").order("price_monthly", { ascending: true });
  console.log("\nFinal Plans in VoicePilot DB:", JSON.stringify(allDbPlans, null, 2));
}

populateVoicePilotPlans();
