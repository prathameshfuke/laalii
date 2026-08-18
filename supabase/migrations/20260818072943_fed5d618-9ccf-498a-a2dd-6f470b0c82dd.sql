-- Profile: role, onboarding progress, intent mode
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS onboarding_step text,
  ADD COLUMN IF NOT EXISTS intent text NOT NULL DEFAULT 'tracking';

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IS NULL OR role IN ('primary','partner'));
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_intent_check CHECK (intent IN ('tracking','conceive','avoid'));

-- Existing users keep working: they already onboarded as primary
UPDATE public.profiles SET role = 'primary' WHERE role IS NULL AND onboarded = true;

-- Fertile-window sharing, opt-in, off by default
ALTER TABLE public.partner_links
  ADD COLUMN IF NOT EXISTS share_fertile boolean NOT NULL DEFAULT false;

-- Intimacy lives in its own table so it can never be reached by partner policies
CREATE TABLE IF NOT EXISTS public.intimacy_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  activity text,
  desire smallint,
  symptoms text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date),
  CHECK (activity IS NULL OR activity IN ('none','protected','unprotected')),
  CHECK (desire IS NULL OR (desire BETWEEN 1 AND 5))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.intimacy_logs TO authenticated;
GRANT ALL ON public.intimacy_logs TO service_role;

ALTER TABLE public.intimacy_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own intimacy logs" ON public.intimacy_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER intimacy_logs_touch
  BEFORE UPDATE ON public.intimacy_logs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Teach partner_can_see about the fertile category
CREATE OR REPLACE FUNCTION public.partner_can_see(_owner uuid, _viewer uuid, _category text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_links l
    WHERE l.owner_id = _owner
      AND l.partner_id = _viewer
      AND l.status = 'accepted'
      AND CASE _category
            WHEN 'phase' THEN l.share_phase
            WHEN 'mood' THEN l.share_mood
            WHEN 'symptoms' THEN l.share_symptoms
            WHEN 'milestones' THEN l.share_milestones
            WHEN 'fertile' THEN l.share_fertile
            ELSE false
          END
  )
$$;

-- Cycles and profile basics also readable when only the fertile indicator is shared
DROP POLICY IF EXISTS "partner reads cycles" ON public.cycles;
CREATE POLICY "partner reads cycles" ON public.cycles
  FOR SELECT TO authenticated
  USING (
    public.partner_can_see(user_id, auth.uid(), 'phase')
    OR public.partner_can_see(user_id, auth.uid(), 'fertile')
  );

DROP POLICY IF EXISTS "partner reads profile" ON public.profiles;
CREATE POLICY "partner reads profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    public.partner_can_see(id, auth.uid(), 'phase')
    OR public.partner_can_see(id, auth.uid(), 'fertile')
    OR public.partner_can_see(id, auth.uid(), 'mood')
    OR public.partner_can_see(id, auth.uid(), 'symptoms')
  );