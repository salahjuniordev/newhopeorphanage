import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

export const SEBPAY_BASE = "https://newapi.sebpay.bj/api/v1";

export function getSebpayKeys() {
  const publicKey = process.env['SEBPAY_PUBLIC_KEY'] ?? "";
  const secretKey = process.env['SEBPAY_SECRET_KEY'] ?? "";

  if (!publicKey || !secretKey) {
    throw new Error(
      "Production payments are unavailable on this deployment because its SebPay credentials are missing.",
    );
  }
  if (!publicKey.startsWith("pk_live_") || !secretKey.startsWith("sk_live_")) {
    throw new Error("Production payments require SebPay live credentials.");
  }

  return { publicKey, secretKey };
}

export function getSebpayCallbackUrl() {
  const origin = process.env['SITE_URL'] ?? process.env['PUBLIC_SITE_URL'] ?? "https://newhopeorphanage.lovable.app";
  return `${origin.replace(/\/$/, "")}/api/public/webhooks/sebpay`;
}

export async function getOptionalUserId(): Promise<string | null> {
  try {
    const auth = getRequestHeader("authorization") ?? getRequestHeader("Authorization");
    if (!auth?.toLowerCase().startsWith("bearer ")) return null;
    const token = auth.slice(7).trim();
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!token || !url || !key) return null;
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await client.auth.getUser(token);
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export type AdminClient = Awaited<ReturnType<typeof getAdmin>>;

export async function logDonationEvent(
  admin: AdminClient,
  donationId: string,
  event: string,
  message?: string | null,
  providerStatus?: string | null,
) {
  const { error } = await admin.from("donation_events").insert({
    donation_id: donationId,
    event,
    message: message ?? null,
    provider_status: providerStatus ?? null,
  });
  if (error) console.error("[sebpay] failed to log event", event, error.message);
}