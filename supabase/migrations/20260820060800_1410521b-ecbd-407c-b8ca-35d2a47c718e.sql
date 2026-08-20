ALTER TABLE public.day_logs ADD COLUMN IF NOT EXISTS symptom_severity jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS care_dismissed_cycle date;