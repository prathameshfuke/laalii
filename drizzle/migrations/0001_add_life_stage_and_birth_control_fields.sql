ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS life_stage_mode TEXT NOT NULL DEFAULT 'period_tracking',
  ADD COLUMN IF NOT EXISTS birth_control_type TEXT,
  ADD COLUMN IF NOT EXISTS birth_control_reminder TEXT,
  ADD COLUMN IF NOT EXISTS clue_connect_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.day_logs
  ADD COLUMN IF NOT EXISTS birth_control_taken BOOLEAN NOT NULL DEFAULT false;