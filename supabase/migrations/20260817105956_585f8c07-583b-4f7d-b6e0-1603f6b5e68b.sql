CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  mascot_name text NOT NULL DEFAULT 'Laali',
  birth_year int,
  avg_cycle_length int NOT NULL DEFAULT 28,
  luteal_length int NOT NULL DEFAULT 14,
  advanced_tracking boolean NOT NULL DEFAULT false,
  reduce_motion boolean NOT NULL DEFAULT false,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cycles TO authenticated;
GRANT ALL ON public.cycles TO service_role;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.day_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  flow text,
  symptoms text[] NOT NULL DEFAULT '{}',
  moods text[] NOT NULL DEFAULT '{}',
  note text,
  bbt numeric,
  mucus text,
  medications text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.day_logs TO authenticated;
GRANT ALL ON public.day_logs TO service_role;
ALTER TABLE public.day_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.partner_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  share_phase boolean NOT NULL DEFAULT false,
  share_mood boolean NOT NULL DEFAULT false,
  share_symptoms boolean NOT NULL DEFAULT false,
  share_milestones boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_links TO authenticated;
GRANT ALL ON public.partner_links TO service_role;
ALTER TABLE public.partner_links ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.partner_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.partner_links(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_notes TO authenticated;
GRANT ALL ON public.partner_notes TO service_role;
ALTER TABLE public.partner_notes ENABLE ROW LEVEL SECURITY;

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
        ELSE false
      END
  )
$$;

CREATE OR REPLACE FUNCTION public.is_link_member(_link uuid, _viewer uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_links l
    WHERE l.id = _link AND (l.owner_id = _viewer OR l.partner_id = _viewer)
  )
$$;

CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "partner reads profile" ON public.profiles FOR SELECT TO authenticated
  USING (public.partner_can_see(id, auth.uid(), 'phase'));

CREATE POLICY "own cycles" ON public.cycles FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "partner reads cycles" ON public.cycles FOR SELECT TO authenticated
  USING (public.partner_can_see(user_id, auth.uid(), 'phase'));

CREATE POLICY "own day logs" ON public.day_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "partner reads day logs" ON public.day_logs FOR SELECT TO authenticated
  USING (public.partner_can_see(user_id, auth.uid(), 'mood')
      OR public.partner_can_see(user_id, auth.uid(), 'symptoms'));

CREATE POLICY "link members read" ON public.partner_links FOR SELECT TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = partner_id OR status = 'pending');
CREATE POLICY "owner creates link" ON public.partner_links FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner updates link" ON public.partner_links FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "partner accepts link" ON public.partner_links FOR UPDATE TO authenticated
  USING (status = 'pending' AND partner_id IS NULL)
  WITH CHECK (partner_id = auth.uid() AND status = 'accepted');
CREATE POLICY "owner deletes link" ON public.partner_links FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "link members read notes" ON public.partner_notes FOR SELECT TO authenticated
  USING (public.is_link_member(link_id, auth.uid()));
CREATE POLICY "members send notes" ON public.partner_notes FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_link_member(link_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER day_logs_touch BEFORE UPDATE ON public.day_logs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER partner_links_touch BEFORE UPDATE ON public.partner_links
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();