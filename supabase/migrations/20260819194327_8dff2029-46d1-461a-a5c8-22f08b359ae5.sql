-- 1. Restrict reads on partner_links to actual members
DROP POLICY IF EXISTS "link members read" ON public.partner_links;
CREATE POLICY "link members read" ON public.partner_links
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = partner_id);

-- 2. Remove the open "partner accepts link" update path; redemption now goes through an RPC
DROP POLICY IF EXISTS "partner accepts link" ON public.partner_links;

-- 3. Secure redemption function: matches on the exact code only
CREATE OR REPLACE FUNCTION public.redeem_invite(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _link public.partner_links%ROWTYPE;
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT * INTO _link
  FROM public.partner_links
  WHERE invite_code = upper(btrim(_code))
  LIMIT 1;

  IF _link.id IS NULL THEN
    RAISE EXCEPTION 'That invite code does not match anything.';
  END IF;
  IF _link.owner_id = _uid THEN
    RAISE EXCEPTION 'That is your own invite code.';
  END IF;
  IF _link.partner_id IS NOT NULL THEN
    IF _link.partner_id = _uid THEN
      RETURN _link.id;
    END IF;
    RAISE EXCEPTION 'That invite has already been used.';
  END IF;

  UPDATE public.partner_links
  SET partner_id = _uid, status = 'accepted'
  WHERE id = _link.id;

  RETURN _link.id;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_invite(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.redeem_invite(text) TO authenticated;

-- 4. Internal helpers should not be callable directly from the API
REVOKE ALL ON FUNCTION public.is_link_member(uuid, uuid) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.partner_can_see(uuid, uuid, text) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;