import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

type InitiateInput = {
  amount: number;
  currency: "XOF" | "XAF" | "EUR" | "USD";
  phone: string;
  operator: string;
  country: string;
  donor_name: string;
  donor_email: string;
  cause?: string | null;
  message?: string | null;
  otp_code?: string | null;
  idempotency_key?: string | null;
};

const SEBPAY_BASE = "https://newapi.sebpay.bj/api/v1";

export const initiateSebpayDonation = createServerFn({ method: "POST" })
  .inputValidator((data: InitiateInput) => {
    if (!data || typeof data !== "object") throw new Error("Invalid payload");
    if (!(data.amount > 0)) throw new Error("Invalid amount");
    if (data.currency === "XAF" || data.currency === "XOF") {
      // Provider rule: whole multiples of 200 only (its 2.5% fee must be a
      // whole unit), minimum 400.
      if (data.amount < 400 || data.amount % 200 !== 0) {
        throw new Error(
          `Mobile Money amounts must be a whole multiple of 200 ${data.currency} (minimum 400).`,
        );
      }
    }
    if (!data.phone?.trim()) throw new Error("Phone required");
    if (!data.operator?.trim()) throw new Error("Operator required");
    if (!data.country?.trim()) throw new Error("Country required");
    if (!data.donor_name?.trim()) throw new Error("Name required");
    if (!data.donor_email?.trim()) throw new Error("Email required");
    return data;
  })
  .handler(async ({ data }) => {
    const { publicKey, secretKey } = getKeys();
    const admin = await getAdmin();
    const userId = await getOptionalUserId();

    // ---------- Idempotency ----------
    // If the caller sent the same idempotency_key we already processed, return
    // that donation instead of creating a new one — prevents duplicate rows
    // AND duplicate charges from double-clicks or client-side retries.
    if (data.idempotency_key) {
      const { data: existing } = await admin
        .from("donations")
        .select("id, external_reference, status, provider_link, provider_message, provider_transaction_id")
        .eq("idempotency_key", data.idempotency_key)
        .maybeSingle();
      if (existing) {
        return {
          ok: true as const,
          donation_id: existing.id,
          external_reference: existing.external_reference!,
          provider_transaction_id: existing.provider_transaction_id ?? null,
          provider_link: existing.provider_link ?? null,
          status: existing.status,
          message: existing.provider_message ?? "Already in progress.",
          idempotent_replay: true as const,
        };
      }
    }

    const external_reference = `NHO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const phone = data.phone.replace(/[^\d]/g, "");
    const operator = data.operator.trim().toLowerCase();
    const country = data.country.trim().toUpperCase();

    const { data: inserted, error: insErr } = await admin
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
        user_id: userId,
        idempotency_key: data.idempotency_key ?? null,
      })
      .select("id, external_reference")
      .single();

    // Race: another concurrent request just inserted the same idempotency_key.
    // Fetch the winning row and return it.
    if (insErr && data.idempotency_key) {
      const { data: winner } = await admin
        .from("donations")
        .select("id, external_reference, status, provider_link, provider_message, provider_transaction_id")
        .eq("idempotency_key", data.idempotency_key)
        .maybeSingle();
      if (winner) {
        return {
          ok: true as const,
          donation_id: winner.id,
          external_reference: winner.external_reference!,
          provider_transaction_id: winner.provider_transaction_id ?? null,
          provider_link: winner.provider_link ?? null,
          status: winner.status,
          message: winner.provider_message ?? "Already in progress.",
          idempotent_replay: true as const,
        };
      }
    }
    if (insErr || !inserted) {
      throw new Error(insErr?.message ?? "Failed to record donation");
    }

    await logEvent(admin, inserted.id, "created", `Donation of ${data.currency} ${data.amount} recorded.`, "pending");

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
      const msg = `Network error: ${(err as Error).message}`;
      await admin
        .from("donations")
        .update({ status: "rejected", provider_message: msg, updated_at: new Date().toISOString() })
        .eq("id", inserted.id);
      await logEvent(admin, inserted.id, "failed", msg, "rejected");
      throw new Error("Payment service unreachable. Please try again.");
    }

    const text = await providerRes.text();
    let parsed: {
      success?: boolean;
      data?: { transaction_id?: string; status?: string; provider_link?: string; message?: string };
      message?: string;
    } = {};
    try { parsed = text ? JSON.parse(text) : {}; }
    catch { parsed = { message: text.slice(0, 300) }; }

    if (!providerRes.ok || parsed.success === false) {
      const raw = text ?? "";
      let baseMsg = parsed.message ?? parsed.data?.message ?? `SebPay error ${providerRes.status}`;
      // Surface the real provider reason instead of the generic wrapper text.
      if (raw.includes("amount_decimal_not_allowed")) {
        baseMsg = `This amount is not supported by Mobile Money. Please use a whole multiple of 200 ${data.currency} (e.g. ${Math.max(400, Math.round(data.amount / 200) * 200)}).`;
      } else if (raw.includes("amount_below_min")) {
        baseMsg = `This amount is below the Mobile Money minimum. Please donate at least 400 ${data.currency}.`;
      } else {
        const nested = raw.match(/"message\\?":\\?"([^"\\]{3,200})/);
        if (nested?.[1] && parsed.message) baseMsg = `${parsed.message} ${nested[1]}`;
      }
      const msg = `${baseMsg} [HTTP ${providerRes.status}]`;
      console.error("[sebpay] initiate failed", { status: providerRes.status, body: text.slice(0, 800), request: body });
      await admin
        .from("donations")
        .update({ status: "rejected", provider_message: msg, updated_at: new Date().toISOString() })
        .eq("id", inserted.id);
      await logEvent(admin, inserted.id, "failed", msg, "rejected");
      return {
        ok: false as const,
        error: msg,
        donation_id: inserted.id,
        external_reference,
      };
    }

    const providerData = parsed.data ?? {};
    const newStatus = (providerData.status ?? "pending").toLowerCase();
    await admin
      .from("donations")
      .update({
        provider_transaction_id: providerData.transaction_id ?? null,
        provider_link: providerData.provider_link ?? null,
        provider_message: providerData.message ?? parsed.message ?? null,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inserted.id);

    await logEvent(
      admin,
      inserted.id,
      "provider_accepted",
      `SebPay accepted collection${providerData.transaction_id ? ` (tx ${providerData.transaction_id})` : ""}.`,
      newStatus,
    );
    if (newStatus === "pending") {
      await logEvent(admin, inserted.id, "awaiting_confirmation", "Awaiting phone confirmation from donor.", newStatus);
    } else if (newStatus === "approved" || newStatus === "success") {
      await logEvent(admin, inserted.id, "completed", providerData.message ?? "Payment completed.", newStatus);
    }

    return {
      ok: true as const,
      donation_id: inserted.id,
      external_reference,
      provider_transaction_id: providerData.transaction_id ?? null,
      provider_link: providerData.provider_link ?? null,
      status: newStatus,
      message: providerData.message ?? parsed.message ?? null,
      idempotent_replay: false as const,
    };
  });

export type DonationEvent = {
  id: string;
  event: string;
  message: string | null;
  provider_status: string | null;
  created_at: string;
};

async function fetchEvents(admin: AdminClient, donation_id: string): Promise<DonationEvent[]> {
  const { data } = await admin
    .from("donation_events")
    .select("id, event, message, provider_status, created_at")
    .eq("donation_id", donation_id)
    .order("created_at", { ascending: true });
  return (data as DonationEvent[] | null) ?? [];
}

export const checkSebpayStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { external_reference: string }) => {
    if (!data?.external_reference) throw new Error("Missing external_reference");
    return data;
  })
  .handler(async ({ data }) => {
    const { publicKey, secretKey } = getKeys();
    const admin = await getAdmin();

    let remoteStatus: string | null = null;
    let remoteMsg: string | null = null;
    try {
      const res = await fetch(
        `${SEBPAY_BASE}/collections/${encodeURIComponent(data.external_reference)}`,
        {
          method: "GET",
          headers: { "X-Public-Key": publicKey, "X-Secret-Key": secretKey, Accept: "application/json" },
        },
      );
      const text = await res.text();
      const parsed = text ? JSON.parse(text) : {};
      if (res.ok && parsed?.data?.status) {
        remoteStatus = String(parsed.data.status).toLowerCase();
        remoteMsg = parsed.data.message ?? parsed.message ?? null;
      }
    } catch {
      /* ignore */
    }

    const { data: existing } = await admin
      .from("donations")
      .select("id, status")
      .eq("external_reference", data.external_reference)
      .maybeSingle();

    if (existing && remoteStatus && remoteStatus !== existing.status) {
      await admin
        .from("donations")
        .update({ status: remoteStatus, provider_message: remoteMsg, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      const evt =
        remoteStatus === "approved" || remoteStatus === "success"
          ? "completed"
          : remoteStatus === "rejected" || remoteStatus === "failed"
          ? "failed"
          : `status_${remoteStatus}`;
      await logEvent(admin, existing.id, evt, remoteMsg, remoteStatus);
    }

    const { data: row } = await admin
      .from("donations")
      .select("id, status, provider_message, provider_link, amount, currency, external_reference, created_at, provider_transaction_id")
      .eq("external_reference", data.external_reference)
      .maybeSingle();

    const events = row ? await fetchEvents(admin, row.id) : [];

    return {
      status: (row?.status ?? remoteStatus ?? "pending") as string,
      message: row?.provider_message ?? remoteMsg ?? null,
      provider_link: row?.provider_link ?? null,
      donation: row ?? null,
      events,
    };
  });

// Fetch events for a donation the caller can already see (dashboards).
export const getDonationEvents = createServerFn({ method: "POST" })
  .inputValidator((data: { donation_id: string }) => {
    if (!data?.donation_id) throw new Error("Missing donation_id");
    return data;
  })
  .handler(async ({ data }) => {
    const admin = await getAdmin();
    const events = await fetchEvents(admin, data.donation_id);
    return { events };
  });
