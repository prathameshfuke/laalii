REVOKE ALL ON FUNCTION public.partner_can_see(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_link_member(uuid, uuid) FROM PUBLIC, anon, authenticated;