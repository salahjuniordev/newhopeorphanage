import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/webhooks/sebpay")({
  server: {
    handlers: {
      // SebPay (and their verification tooling) pings the callback URL before
      // enabling live transactions — answer 200 so the URL validates.
      GET: async () =>
        new Response(JSON.stringify({ ok: true, endpoint: "sebpay-webhook" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Sebpay-Signature",
          },
        }),
      POST: async ({ request }) => {
        const raw = await request.text();
        const secret = process.env.SEBPAY_SECRET_KEY ?? "";
        const webhookSecret = process.env.SEBPAY_WEBHOOK_SECRET ?? secret;

        if (!secret || !secret.startsWith("sk_live_")) {
          console.error("[sebpay webhook] live secret is unavailable");
          return new Response("Payment webhook unavailable", { status: 503 });
        }

        const signature =
          request.headers.get("x-sebpay-signature") ??
          request.headers.get("x-signature") ??
          request.headers.get("sebpay-signature") ??
          "";
        if (signature) {
          const expected = createHmac("sha256", webhookSecret).update(raw).digest("hex");
          const a = Buffer.from(signature.replace(/^sha256=/, "").trim(), "utf8");
          const b = Buffer.from(expected, "utf8");
          if (a.length !== b.length || !timingSafeEqual(a, b)) {
            console.error("[sebpay webhook] signature mismatch");
            return new Response("Invalid signature", { status: 401 });
          }
        }


        let payload: {
          transaction_id?: string;
          external_reference?: string;
          status?: string;
          amount?: number;
          currency?: string;
          message?: string;
        };
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        if (!payload?.external_reference && !payload?.transaction_id) {
          return new Response("Missing reference", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const status = String(payload.status ?? "pending").toLowerCase();

        // Look up the donation first so we can (a) short-circuit duplicate
        // webhook deliveries and (b) log a timeline event.
        const lookup = supabaseAdmin.from("donations").select("id, status");
        const { data: donation } = payload.external_reference
          ? await lookup.eq("external_reference", payload.external_reference).maybeSingle()
          : await lookup.eq("provider_transaction_id", payload.transaction_id!).maybeSingle();

        if (!donation) {
          return new Response("Unknown donation", { status: 404 });
        }

        // Idempotent webhook: if status is unchanged, acknowledge without
        // touching the row or appending a duplicate event.
        if (donation.status === status) {
          return new Response("ok (duplicate)", { status: 200 });
        }

        // Never regress a completed donation back to pending on a late retry.
        const terminal = ["approved", "success", "completed", "rejected", "failed"];
        if (terminal.includes(donation.status) && !terminal.includes(status)) {
          return new Response("ok (terminal, ignored)", { status: 200 });
        }

        const { error } = await supabaseAdmin
          .from("donations")
          .update({
            status,
            provider_transaction_id: payload.transaction_id ?? undefined,
            provider_message: payload.message ?? undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("id", donation.id);

        if (error) {
          console.error("[sebpay webhook] update failed", error);
          return new Response("DB error", { status: 500 });
        }

        const evt =
          status === "approved" || status === "success" || status === "completed"
            ? "completed"
            : status === "rejected" || status === "failed"
            ? "failed"
            : `status_${status}`;

        await supabaseAdmin.from("donation_events").insert({
          donation_id: donation.id,
          event: evt,
          message: payload.message ?? `Webhook: ${status}`,
          provider_status: status,
        });

        return new Response("ok", { status: 200 });
      },
    },
  },
});
