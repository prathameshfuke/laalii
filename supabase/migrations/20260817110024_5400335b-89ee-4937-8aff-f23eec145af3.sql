REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.partner_can_see(uuid, uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_link_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.partner_can_see(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_link_member(uuid, uuid) TO authenticated;