
-- Idempotency for donation creation
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS idempotency_key text;
CREATE UNIQUE INDEX IF NOT EXISTS donations_idempotency_key_uidx ON public.donations(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Timeline events for each donation
CREATE TABLE IF NOT EXISTS public.donation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  event text NOT NULL,
  message text,
  provider_status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS donation_events_donation_id_idx
  ON public.donation_events(donation_id, created_at);

GRANT SELECT ON public.donation_events TO authenticated;
GRANT ALL ON public.donation_events TO service_role;

ALTER TABLE public.donation_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own donation events" ON public.donation_events;
CREATE POLICY "Users read own donation events"
  ON public.donation_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.donations d
      WHERE d.id = donation_events.donation_id
        AND d.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins read all donation events" ON public.donation_events;
CREATE POLICY "Admins read all donation events"
  ON public.donation_events FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
