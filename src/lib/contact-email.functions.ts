import { createServerFn } from "@tanstack/react-start";

const CONTACT_INBOX = "newhorpeorphanahe@gmail.com";

type ContactEmailInput = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Sends the contact-form notification to the orphanage inbox through Resend.
 * Kept server-only so RESEND_API_KEY is never exposed to the browser.
 */
export const sendContactEmail = createServerFn({ method: "POST" })
  .inputValidator((data: ContactEmailInput) => {
    if (!data || typeof data !== "object") throw new Error("Invalid payload");
    if (!data.name?.trim()) throw new Error("Name required");
    if (!data.email?.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
      throw new Error("Valid email required");
    }
    if (!data.message?.trim()) throw new Error("Message required");
    return data;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[contact-email] RESEND_API_KEY is not configured");
      throw new Error("Email service is not configured.");
    }

    const from =
      process.env.RESEND_EMAIL_FROM?.trim() || "New Hope Orphanage <onboarding@resend.dev>";

    const rows: Array<[string, string]> = [
      ["Name", data.name],
      ["Email", data.email],
      ["Phone", data.phone ?? ""],
      ["Subject", data.subject ?? ""],
    ];

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#222">
        <h2 style="color:#FF6D00;margin-bottom:16px">New contact message — New Hope Orphanage</h2>
        <table style="width:100%;border-collapse:collapse">
          ${rows
            .filter(([, v]) => v)
            .map(
              ([k, v]) =>
                `<tr><td style="padding:6px 8px;font-weight:bold;white-space:nowrap;vertical-align:top">${k}:</td><td style="padding:6px 8px">${escapeHtml(v)}</td></tr>`,
            )
            .join("")}
        </table>
        <p style="margin:18px 0 6px;font-weight:bold">Message:</p>
        <p style="white-space:pre-wrap;background:#f7f7f7;padding:12px;border-radius:8px">${escapeHtml(data.message)}</p>
      </div>
    `;

    const text = [
      ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
      "",
      "Message:",
      data.message,
    ].join("\n");

    let res: Response;
    try {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [CONTACT_INBOX],
          reply_to: data.email.trim(),
          subject: `New contact message from ${data.name.trim()}`,
          html,
          text,
        }),
      });
    } catch (err) {
      console.error("[contact-email] network error", err);
      throw new Error("Email service unreachable.");
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[contact-email] resend error", res.status, body.slice(0, 500));
      throw new Error(`Email delivery failed (${res.status}).`);
    }

    return { ok: true as const };
  });
