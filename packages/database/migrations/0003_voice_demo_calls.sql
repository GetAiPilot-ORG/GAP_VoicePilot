-- Migration: 0003_voice_demo_calls.sql
-- Enforces one-time free test call restriction per user account at the database level.

CREATE TABLE IF NOT EXISTS public.voice_demo_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'reserved', -- 'reserved', 'initiated', 'completed', 'failed'
  call_id TEXT,
  provider TEXT NOT NULL DEFAULT 'vomyra',
  max_duration_seconds INT DEFAULT 60,
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_demo_call UNIQUE (user_id)
);

-- Index for quick lookup by user_id
CREATE INDEX IF NOT EXISTS idx_voice_demo_calls_user_id ON public.voice_demo_calls(user_id);

-- Enable RLS
ALTER TABLE public.voice_demo_calls ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own demo call record
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'voice_demo_calls' AND policyname = 'Users can select own demo calls'
  ) THEN
    CREATE POLICY "Users can select own demo calls"
      ON public.voice_demo_calls FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;
