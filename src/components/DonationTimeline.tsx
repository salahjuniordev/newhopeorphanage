import type { DonationEvent as DonationTimelineEvent } from "@/lib/sebpay.functions";

export type { DonationTimelineEvent };

const LABELS: Record<string, string> = {
  created: "Collection created",
  provider_accepted: "Provider accepted request",
  awaiting_confirmation: "Awaiting phone confirmation",
  completed: "Payment completed",
  failed: "Payment failed",
};

function label(e: string) {
  return LABELS[e] ?? e.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function dotColor(e: string, s: string | null) {
  if (e === "completed" || s === "approved" || s === "success") return "#1f9d55";
  if (e === "failed" || s === "rejected" || s === "failed") return "#c73838";
  if (e === "created" || e === "provider_accepted") return "#f19100";
  return "#8a7050";
}

export function DonationTimeline({
  events,
  externalReference,
  compact = false,
}: {
  events: DonationTimelineEvent[];
  externalReference?: string | null;
  compact?: boolean;
}) {
  return (
    <div className={`nho-tl ${compact ? "is-compact" : ""}`}>
      <style>{TIMELINE_CSS}</style>
      <div className="nho-tl-head">
        <strong>Donation timeline</strong>
        {externalReference && <span className="nho-tl-ref">Ref: {externalReference}</span>}
      </div>
      {events.length === 0 ? (
        <div className="nho-tl-empty">No events yet.</div>
      ) : (
        <ol className="nho-tl-list">
          {events.map((ev) => (
            <li key={ev.id}>
              <span className="nho-tl-dot" style={{ background: dotColor(ev.event, ev.provider_status) }} />
              <div className="nho-tl-body">
                <div className="nho-tl-row">
                  <strong>{label(ev.event)}</strong>
                  <time>{new Date(ev.created_at).toLocaleString()}</time>
                </div>
                {ev.message && <p>{ev.message}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

const TIMELINE_CSS = `
.nho-tl{margin-top:26px;text-align:left;background:#fffaf0;border:1px solid #f0e4c9;border-radius:16px;padding:18px 20px;font-family:'Onest','Inter',system-ui,sans-serif}
.nho-tl.is-compact{margin-top:12px;padding:14px 16px;background:#fff;border-color:#efe6d3}
.nho-tl-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.nho-tl-head strong{font-size:.78rem;letter-spacing:.6px;text-transform:uppercase;color:#5a4730}
.nho-tl-ref{font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#8a7050}
.nho-tl-empty{color:#8a7050;font-size:.9rem}
.nho-tl-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px;position:relative}
.nho-tl-list:before{content:"";position:absolute;left:6px;top:6px;bottom:6px;width:2px;background:#f0e4c9;border-radius:2px}
.nho-tl-list li{position:relative;padding-left:24px}
.nho-tl-dot{position:absolute;left:0;top:6px;width:14px;height:14px;border-radius:50%;box-shadow:0 0 0 3px #fff}
.nho-tl-body{display:flex;flex-direction:column;gap:2px}
.nho-tl-row{display:flex;justify-content:space-between;gap:10px;align-items:baseline;flex-wrap:wrap}
.nho-tl-row strong{color:#1a1208;font-size:.94rem}
.nho-tl-row time{color:#8a7050;font-size:.74rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.nho-tl-body p{margin:2px 0 0;color:#5a4730;font-size:.86rem;line-height:1.4}
`;
