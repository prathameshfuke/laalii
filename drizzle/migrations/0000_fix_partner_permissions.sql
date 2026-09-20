-- Fix permission denied for partner_can_see and is_link_member
-- PostgreSQL RLS policies evaluate functions as the authenticated querying role.
-- Granting EXECUTE allows RLS policies on profiles, cycles, and day_logs to evaluate properly.
GRANT EXECUTE ON FUNCTION public.partner_can_see(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_link_member(uuid, uuid) TO authenticated;