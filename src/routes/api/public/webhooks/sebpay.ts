import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/webhooks/sebpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const secret =
          process.env.SEBPAY_SECRET_KEY ?? process.env.STRIPE_TEST_API_KEY ?? "";

        const signature = request.headers.get("x-sebpay-signature") ?? "";
        if (secret && signature) {
          const expected = createHmac("sha256", secret).update(raw).digest("hex");
          const a = Buffer.from(signature, "utf8");
          const b = Buffer.from(expected, "utf8");
          if (a.length !== b.length || !timingSafeEqual(a, b)) {
            return new Response("Invalid signature", { status: 401 });
          }
        }

        let payload: {
          transaction_id?: string;
          external_reference?: string;
          status?: string;
          amount?: number;
          currency?: string;
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

        const query = supabaseAdmin
          .from("donations")
          .update({
            status,
            provider_transaction_id: payload.transaction_id ?? undefined,
            updated_at: new Date().toISOString(),
          });

        const { error } = payload.external_reference
          ? await query.eq("external_reference", payload.external_reference)
          : await query.eq("provider_transaction_id", payload.transaction_id!);

        if (error) {
          console.error("[sebpay webhook] update failed", error);
          return new Response("DB error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
