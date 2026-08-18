CREATE POLICY "partner leaves link" ON public.partner_links
  FOR DELETE TO authenticated
  USING (auth.uid() = partner_id);