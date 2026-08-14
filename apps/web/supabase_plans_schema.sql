-- =========================================================================
-- SQL Migration: Update & Populate VoicePilot `plans` Table in Supabase
-- =========================================================================

-- 1. Ensure `plans` table schema includes all required JSONB features & attributes
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  included_credits NUMERIC NOT NULL DEFAULT 0,
  max_assistants INT NOT NULL DEFAULT 1,
  max_concurrent_calls INT NOT NULL DEFAULT 1,
  features JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Public read access policy for UI rendering
CREATE POLICY "Public Read Access for VoicePilot Plans" ON public.plans
FOR SELECT USING (true);

-- 2. Populate VoicePilot `plans` Table with exact synchronized data
INSERT INTO public.plans (
  id,
  name,
  price_monthly,
  included_credits,
  max_assistants,
  max_concurrent_calls,
  features,
  is_active,
  created_at
) VALUES 
(
  'call_lite',
  'Start',
  1499,
  250,
  1,
  1,
  '{
    "audience": "FOR STARTERS",
    "description": "250 AI calling minutes included.",
    "feeNote": "Effective rate: ₹6.00 / min • ₹0 platform fee.",
    "extra_min_rate": 6,
    "feature_list": [
      "250 AI Calling Minutes",
      "₹6.00 / min per-minute rate",
      "Hindi, English & Hinglish Support",
      "Custom AI System Prompts",
      "Basic Lead & Contact Capture"
    ]
  }'::jsonb,
  true,
  now()
),
(
  'call_pro',
  'Build',
  4999,
  1000,
  5,
  2,
  '{
    "audience": "FOR TEAMS",
    "description": "Daily sales calls, live transfers & auto-CRM sync.",
    "feeNote": "Effective rate: ₹5.00 / min • Includes 1,000 mins.",
    "extra_min_rate": 5,
    "is_popular": true,
    "feature_list": [
      "1,000 AI Calling Minutes",
      "₹5.00 / min per-minute rate",
      "Realtime Live Call Transfer",
      "Automatic CRM Auto-Syncing",
      "Live Call Transcripts & Recording"
    ]
  }'::jsonb,
  true,
  now()
),
(
  'call_elite',
  'Scale',
  9999,
  2000,
  20,
  5,
  '{
    "audience": "FOR HIGH VOLUME",
    "description": "Lowest per-minute rates for high-volume dialers.",
    "feeNote": "Effective rate: ₹5.00 / min • Includes 2,000 mins.",
    "extra_min_rate": 5,
    "feature_list": [
      "2,000 AI Calling Minutes",
      "₹5.00 / min per-minute rate",
      "Unlimited Multi-Agent Workflows",
      "Priority SIP Latency Routing",
      "Dedicated Account Manager"
    ]
  }'::jsonb,
  true,
  now()
),
(
  'enterprise',
  'Enterprise',
  0,
  0,
  99,
  99,
  '{
    "audience": "FOR ORGANIZATIONS",
    "description": "Dedicated infrastructure with controls regulated teams require.",
    "feeNote": "Contracted to your volume.",
    "extra_min_rate": 0,
    "is_enterprise": true,
    "feature_list": [
      "Concurrency sized to your volume",
      "Custom per-minute bulk rates",
      "Custom SIP trunking & on-prem",
      "Forward-deployed engineer",
      "TRAI, SOC2 & DLT compliance",
      "Zero data retention & SSO"
    ]
  }'::jsonb,
  true,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  included_credits = EXCLUDED.included_credits,
  max_assistants = EXCLUDED.max_assistants,
  max_concurrent_calls = EXCLUDED.max_concurrent_calls,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;
