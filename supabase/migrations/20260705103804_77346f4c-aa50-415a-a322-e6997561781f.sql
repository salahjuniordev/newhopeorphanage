
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS operator text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'sebpay',
  ADD COLUMN IF NOT EXISTS provider_transaction_id text,
  ADD COLUMN IF NOT EXISTS external_reference text UNIQUE,
  ADD COLUMN IF NOT EXISTS provider_link text,
  ADD COLUMN IF NOT EXISTS provider_message text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS donations_external_reference_idx ON public.donations(external_reference);
CREATE INDEX IF NOT EXISTS donations_provider_transaction_id_idx ON public.donations(provider_transaction_id);
