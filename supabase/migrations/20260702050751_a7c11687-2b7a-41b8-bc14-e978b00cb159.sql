
-- 1) Revoke public EXECUTE on SECURITY DEFINER trigger function.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2) Replace permissive INSERT policies with validated WITH CHECK expressions.
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 200
    AND length(btrim(email)) BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(btrim(message)) BETWEEN 1 AND 5000
  );

DROP POLICY IF EXISTS "Anyone can donate" ON public.donations;
CREATE POLICY "Anyone can donate"
  ON public.donations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(donor_name)) BETWEEN 1 AND 200
    AND length(btrim(donor_email)) BETWEEN 3 AND 320
    AND donor_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND amount > 0
    AND amount <= 1000000
    AND (user_id IS NULL OR user_id = auth.uid())
  );
