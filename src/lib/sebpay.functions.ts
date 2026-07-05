import { createServerFn } from "@tanstack/react-start";

const SEBPAY_BASE = "https://newapi.sebpay.bj/api/v1";
const DEFAULT_PUBLIC_KEY = "pk_test_FSx10KtxDhAt4VGlepQ7awviBaEjQeiukfxAGwz7";

type InitiateInput = {
  amount: number;
  currency: "XOF" | "XAF" | "EUR" | "USD";
  phone: string; // international, no '+'
  operator: string; // slug: mtn, moov, orange, wave...
  country: string; // ISO code: CM, BJ, CI...
  donor_name: string;
  donor_email: string;
  cause?: string | null;
  message?: string | null;
  otp_code?: string | null;
};

function getKeys() {
  const publicKey = process.env.SEBPAY_PUBLIC_KEY ?? DEFAULT_PUBLIC_KEY;
  const secretKey =
    process.env.SEBPAY_SECRET_KEY ?? process.env.STRIPE_TEST_API_KEY ?? "";
  if (!secretKey) throw new Error("SEBPAY_SECRET_KEY is not configured");
  return { publicKey, secretKey };
}

function getCallbackUrl() {
  const origin =
    process.env.SITE_URL ??
    process.env.PUBLIC_SITE_URL ??
    "https://newhopeorphanage.lovable.app";
  return `${origin.replace(/\/$/, "")}/api/public/webhooks/sebpay`;
}

export const initiateSebpayDonation = createServerFn({ method: "POST" })
  .inputValidator((data: InitiateInput) => {
    if (!data || typeof data !== "object") throw new Error("Invalid payload");
    if (!(data.amount > 0)) throw new Error("Invalid amount");
    if (!data.phone?.trim()) throw new Error("Phone required");
    if (!data.operator?.trim()) throw new Error("Operator required");
    if (!data.country?.trim()) throw new Error("Country required");
    if (!data.donor_name?.trim()) throw new Error("Name required");
    if (!data.donor_email?.trim()) throw new Error("Email required");
    return data;
  })
  .handler(async ({ data }) => {
    const { publicKey, secretKey } = getKeys();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Create donation row first (status pending) — id becomes external_reference
    const external_reference = `NHO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const phone = data.phone.replace(/[^\d]/g, "");
    const operator = data.operator.trim().toLowerCase();
    const country = data.country.trim().toUpperCase();

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("donations")
      .insert({
        donor_name: data.donor_name.trim(),
        donor_email: data.donor_email.trim(),
        amount: data.amount,
        currency: data.currency,
        cause: data.cause ?? "General",
        message: data.message ?? null,
        phone,
        operator,
        country,
        provider: "sebpay",
        external_reference,
        status: "pending",
      })
      .select("id, external_reference")
      .single();

    if (insErr || !inserted) {
      throw new Error(insErr?.message ?? "Failed to record donation");
    }

    // Call SebPay collections API
    const body: Record<string, unknown> = {
      amount: data.amount,
      currency: data.currency,
      phone,
      operator,
      country,
      external_reference,
      callback_url: getCallbackUrl(),
    };
    if (data.otp_code) body.otp_code = data.otp_code;

    let providerRes: Response;
    try {
      providerRes = await fetch(`${SEBPAY_BASE}/collections`, {
        method: "POST",
        headers: {
          "X-Public-Key": publicKey,
          "X-Secret-Key": secretKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      await supabaseAdmin
        .from("donations")
        .update({
          status: "rejected",
          provider_message: `Network error: ${(err as Error).message}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", inserted.id);
      throw new Error("Payment service unreachable. Please try again.");
    }

    const text = await providerRes.text();
    let parsed: {
      success?: boolean;
      data?: {
        transaction_id?: string;
        status?: string;
        provider_link?: string;
        message?: string;
      };
      message?: string;
    } = {};
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = { message: text.slice(0, 300) };
    }

    if (!providerRes.ok || parsed.success === false) {
      const msg = parsed.message ?? parsed.data?.message ?? `SebPay error ${providerRes.status}`;
      await supabaseAdmin
        .from("donations")
        .update({
          status: "rejected",
          provider_message: msg,
          updated_at: new Date().toISOString(),
        })
        .eq("id", inserted.id);
      return {
        ok: false as const,
        error: msg,
        donation_id: inserted.id,
        external_reference,
      };
    }

    const providerData = parsed.data ?? {};
    await supabaseAdmin
      .from("donations")
      .update({
        provider_transaction_id: providerData.transaction_id ?? null,
        provider_link: providerData.provider_link ?? null,
        provider_message: providerData.message ?? parsed.message ?? null,
        status: (providerData.status ?? "pending").toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", inserted.id);

    return {
      ok: true as const,
      donation_id: inserted.id,
      external_reference,
      provider_transaction_id: providerData.transaction_id ?? null,
      provider_link: providerData.provider_link ?? null,
      status: (providerData.status ?? "pending").toLowerCase(),
      message: providerData.message ?? parsed.message ?? null,
    };
  });

export const checkSebpayStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { external_reference: string }) => {
    if (!data?.external_reference) throw new Error("Missing external_reference");
    return data;
  })
  .handler(async ({ data }) => {
    const { publicKey, secretKey } = getKeys();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let remoteStatus: string | null = null;
    let remoteMsg: string | null = null;
    try {
      const res = await fetch(
        `${SEBPAY_BASE}/collections/${encodeURIComponent(data.external_reference)}`,
        {
          method: "GET",
          headers: {
            "X-Public-Key": publicKey,
            "X-Secret-Key": secretKey,
            Accept: "application/json",
          },
        },
      );
      const text = await res.text();
      const parsed = text ? JSON.parse(text) : {};
      if (res.ok && parsed?.data?.status) {
        remoteStatus = String(parsed.data.status).toLowerCase();
        remoteMsg = parsed.data.message ?? parsed.message ?? null;
      }
    } catch {
      // fall back to DB status
    }

    if (remoteStatus) {
      await supabaseAdmin
        .from("donations")
        .update({
          status: remoteStatus,
          provider_message: remoteMsg,
          updated_at: new Date().toISOString(),
        })
        .eq("external_reference", data.external_reference);
    }

    const { data: row } = await supabaseAdmin
      .from("donations")
      .select("id, status, provider_message, provider_link, amount, currency, external_reference, created_at")
      .eq("external_reference", data.external_reference)
      .maybeSingle();

    return {
      status: (row?.status ?? remoteStatus ?? "pending") as string,
      message: row?.provider_message ?? remoteMsg ?? null,
      provider_link: row?.provider_link ?? null,
      donation: row ?? null,
    };
  });
