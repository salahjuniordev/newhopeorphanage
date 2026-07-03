import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/donation")({
  head: () => ({
    meta: [
      { title: "Donate — New Hope Orphanage" },
      { name: "description", content: "Support New Hope Orphanage. Every donation feeds, educates, and protects a child in Yaoundé, Cameroon." },
      { property: "og:title", content: "Donate — New Hope Orphanage" },
      { property: "og:description", content: "Your gift transforms lives. Donate to New Hope Orphanage today." },
    ],
  }),
  component: DonationPage,
});

const AMOUNTS = [10, 25, 50, 100, 250, 500];
const CAUSES = [
  { id: "general", label: "Where most needed" },
  { id: "education", label: "Education & Books" },
  { id: "food", label: "Food & Nutrition" },
  { id: "healthcare", label: "Healthcare Support" },
  { id: "shelter", label: "Shelter & Care" },
] as const;

function DonationPage() {
  const [amount, setAmount] = useState<number>(50);
  const [custom, setCustom] = useState("");
  const [cause, setCause] = useState<string>("general");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "XAF">("USD");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (!s) return;
      setUserId(s.user.id);
      if (s.user.email) setEmail((e) => e || s.user.email!);
      const meta = s.user.user_metadata as { full_name?: string } | undefined;
      if (meta?.full_name) setName((n) => n || meta.full_name!);
    });
  }, []);

  const finalAmount = custom ? Number(custom) : amount;
  const [receiptId, setReceiptId] = useState<string>("");
  const [receiptDate, setReceiptDate] = useState<string>("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!finalAmount || finalAmount <= 0) { setError("Please enter a valid amount."); return; }
    if (!name.trim() || !email.trim()) { setError("Please enter your name and email."); return; }
    setLoading(true);
    const { data, error: err } = await supabase.from("donations").insert({
      user_id: userId,
      donor_name: name.trim(),
      donor_email: email.trim(),
      amount: finalAmount,
      currency,
      cause: CAUSES.find((c) => c.id === cause)?.label ?? "General",
      message: message.trim() || null,
    }).select("id, created_at").single();
    setLoading(false);
    if (err) { setError(err.message); return; }
    setReceiptId(data?.id ?? "");
    setReceiptDate(data?.created_at ?? new Date().toISOString());
    setDone(true);
  };

  const downloadReceipt = () => {
    const causeLabel = CAUSES.find((c) => c.id === cause)?.label ?? "General";
    const shortId = (receiptId || crypto.randomUUID()).slice(0, 8).toUpperCase();
    const dateStr = new Date(receiptDate || Date.now()).toLocaleString();
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Donation Receipt ${shortId}</title>
<style>
body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1208;max-width:720px;margin:40px auto;padding:0 24px}
.hd{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #f19100;padding-bottom:16px}
.hd h1{font-family:Georgia,serif;font-size:28px;margin:0;color:#c97200}
.hd small{color:#8a7050}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;margin:24px 0}
.grid div{padding:10px 0;border-bottom:1px dashed #eadfc7}
.grid span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8a7050}
.grid strong{font-size:15px}
.amt{background:linear-gradient(135deg,#fff3df,#ffe6c2);padding:20px;border-radius:14px;text-align:center;margin:24px 0}
.amt div:first-child{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a7050}
.amt div:last-child{font-size:36px;font-weight:800;color:#c97200;margin-top:6px}
.ft{margin-top:32px;padding-top:16px;border-top:1px solid #eadfc7;color:#6a553a;font-size:13px;line-height:1.6}
.thx{font-family:Georgia,serif;font-style:italic;color:#c97200;text-align:center;font-size:18px;margin:24px 0}
@media print{.noprint{display:none}}
.noprint{text-align:center;margin-top:24px}
button{padding:10px 24px;background:#f19100;color:#fff;border:0;border-radius:8px;font-size:14px;cursor:pointer;font-weight:600}
</style></head><body>
<div class="hd"><div><h1>New Hope Orphanage</h1><small>Yaoundé, Cameroon</small></div><div style="text-align:right"><strong>Donation Receipt</strong><br><small>#${shortId}</small></div></div>
<div class="amt"><div>Total Contribution</div><div>${currency} ${finalAmount.toFixed(2)}</div></div>
<div class="grid">
<div><span>Donor</span><strong>${name}</strong></div>
<div><span>Email</span><strong>${email}</strong></div>
<div><span>Cause</span><strong>${causeLabel}</strong></div>
<div><span>Date</span><strong>${dateStr}</strong></div>
<div><span>Receipt No.</span><strong>${shortId}</strong></div>
<div><span>Payment Status</span><strong>Recorded — pending processing</strong></div>
</div>
${message ? `<div style="padding:14px;background:#fffaf0;border-radius:10px"><span style="font-size:11px;color:#8a7050;text-transform:uppercase;letter-spacing:1px">Message</span><br>${message.replace(/</g, "&lt;")}</div>` : ""}
<div class="thx">Thank you for giving a child a future.</div>
<div class="ft">This receipt confirms your generous contribution to New Hope Orphanage. Our team will contact you shortly with payment instructions. Keep this receipt for your records — it may be used for tax-deductible purposes where applicable.<br><br>New Hope Orphanage · contact@newhopeorphanage.org</div>
<div class="noprint"><button onclick="window.print()">Download / Print PDF</button></div>
<script>setTimeout(()=>window.print(),400)</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  if (done) {
    return (
      <div className="nho-donate-wrap">
        <style>{DONATE_CSS}</style>
        <div className="nho-donate-thanks">
          <div className="nho-donate-thanks-icon"><Sparkles size={44} /></div>
          <h1>Thank you, {name.split(" ")[0]} 🧡</h1>
          <p>Your pledge of <strong>{currency} {finalAmount.toFixed(2)}</strong> toward <strong>{CAUSES.find((c) => c.id === cause)?.label}</strong> has been recorded. Our team will reach out shortly with payment details.</p>
          <div className="nho-donate-thanks-cta">
            {userId ? (
              <Link to="/dashboard" className="nho-donate-btn-primary">View my dashboard</Link>
            ) : (
              <Link to="/login" className="nho-donate-btn-primary">Create an account to track</Link>
            )}
            <Link to="/" className="nho-donate-btn-ghost">Back to home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nho-donate-wrap">
      <style>{DONATE_CSS}</style>

      <header className="nho-donate-hero">
        <span className="nho-donate-eyebrow">Make a difference</span>
        <h1>Your gift gives a child a future</h1>
        <p>Every donation directly feeds, educates and protects children at New Hope Orphanage in Yaoundé, Cameroon.</p>
        <div className="nho-donate-trust">
          <span><ShieldCheck size={16}/> Secure & private</span>
          <span><Users size={16}/> 120+ donors</span>
          <span><Heart size={16}/> 100% to the cause</span>
        </div>
      </header>

      <div className="nho-donate-grid">
        <form onSubmit={submit} className="nho-donate-card" noValidate>
          <h2>1. Choose an amount</h2>
          <div className="nho-donate-amounts">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                className={amount === a && !custom ? "is-on" : ""}
                onClick={() => { setAmount(a); setCustom(""); }}
              >{currency === "XAF" ? a * 600 : a}</button>
            ))}
          </div>
          <label className="nho-donate-custom">
            Custom amount
            <div>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as "USD"|"EUR"|"XAF")}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="XAF">XAF</option>
              </select>
              <input
                inputMode="decimal"
                placeholder="Enter amount"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^\d.]/g, ""))}
              />
            </div>
          </label>

          <h2>2. Pick a cause</h2>
          <div className="nho-donate-causes">
            {CAUSES.map((c) => (
              <label key={c.id} className={cause === c.id ? "is-on" : ""}>
                <input type="radio" name="cause" value={c.id} checked={cause === c.id} onChange={() => setCause(c.id)} />
                <span>{c.label}</span>
              </label>
            ))}
          </div>

          <h2>3. Your details</h2>
          <div className="nho-donate-fields">
            <label>Full name
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" />
            </label>
            <label>Email
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            <label className="nho-donate-full">Message (optional)
              <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Words of hope for the children…" />
            </label>
          </div>

          {error && <div className="nho-donate-err" role="alert">{error}</div>}

          <button type="submit" disabled={loading} className="nho-donate-submit">
            {loading ? "Submitting…" : <>Donate {currency} {finalAmount || 0} <Heart size={18}/></>}
          </button>
          {!userId && (
            <p className="nho-donate-hint">
              Want to track your gifts? <Link to="/login">Create a free account</Link>.
            </p>
          )}
        </form>

        <aside className="nho-donate-side">
          <div className="nho-donate-side-card">
            <h3>Where your gift goes</h3>
            <ul>
              <li><strong>$10</strong><span>Feeds a child for a week</span></li>
              <li><strong>$25</strong><span>School supplies & uniforms</span></li>
              <li><strong>$50</strong><span>One month of healthcare</span></li>
              <li><strong>$100</strong><span>Shelter & care for a child</span></li>
            </ul>
          </div>
          <div className="nho-donate-side-card alt">
            <h3>Other ways to help</h3>
            <p>Sponsor a child, volunteer, or organise a fundraiser in your community.</p>
            <Link to="/contact" className="nho-donate-btn-ghost">Contact us</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

const DONATE_CSS = `
.nho-donate-wrap{max-width:1180px;margin:0 auto;padding:48px 22px 60px;font-family:'Onest','Inter',system-ui,sans-serif;color:#1a1208}
.nho-donate-hero{text-align:center;margin-bottom:34px}
.nho-donate-eyebrow{display:inline-block;padding:6px 14px;border-radius:999px;background:rgba(241,145,0,.12);color:#c97200;font-size:.78rem;font-weight:700;letter-spacing:1px;text-transform:uppercase}
.nho-donate-hero h1{font-family:'Playfair Display',serif;font-size:clamp(2rem,4vw,3rem);margin:14px 0 10px;line-height:1.15;color:#1a1208}
.nho-donate-hero p{color:#6a553a;max-width:640px;margin:0 auto;font-size:1.02rem}
.nho-donate-trust{display:flex;flex-wrap:wrap;justify-content:center;gap:22px;margin-top:18px;color:#8a7050;font-size:.85rem}
.nho-donate-trust span{display:inline-flex;align-items:center;gap:6px}
.nho-donate-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(280px,1fr);gap:24px}
@media (max-width:900px){.nho-donate-grid{grid-template-columns:1fr}}
.nho-donate-card{background:#fff;border:1px solid #ede7da;border-radius:22px;padding:30px;box-shadow:0 18px 50px -28px rgba(26,18,8,.25)}
.nho-donate-card h2{font-family:'Playfair Display',serif;font-size:1.18rem;margin:0 0 14px;color:#1a1208}
.nho-donate-card h2:not(:first-child){margin-top:26px}
.nho-donate-amounts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
@media (min-width:520px){.nho-donate-amounts{grid-template-columns:repeat(6,1fr)}}
.nho-donate-amounts button{padding:14px 6px;border-radius:14px;border:1.5px solid #ede0c8;background:#fffaf0;font:inherit;font-weight:700;color:#1a1208;cursor:pointer;transition:.18s}
.nho-donate-amounts button:hover{border-color:#f19100}
.nho-donate-amounts button.is-on{background:linear-gradient(135deg,#f19100,#ffc84a);color:#fff;border-color:transparent;box-shadow:0 8px 18px rgba(241,145,0,.32)}
.nho-donate-custom{display:block;margin-top:12px;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#5a4730}
.nho-donate-custom>div{display:flex;gap:8px;margin-top:6px}
.nho-donate-custom select,.nho-donate-custom input{padding:12px 14px;border:1.5px solid #ddd3c0;border-radius:11px;font:inherit;background:#fff;outline:none}
.nho-donate-custom select{font-weight:700;color:#1a1208}
.nho-donate-custom input{flex:1}
.nho-donate-custom input:focus,.nho-donate-fields input:focus,.nho-donate-fields textarea:focus{border-color:#f19100;box-shadow:0 0 0 3px rgba(241,145,0,.15)}
.nho-donate-causes{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}
.nho-donate-causes label{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1.5px solid #ede0c8;border-radius:14px;cursor:pointer;background:#fffaf0;font-weight:600;font-size:.92rem;color:#1a1208;transition:.18s}
.nho-donate-causes label input{accent-color:#f19100}
.nho-donate-causes label.is-on{border-color:#f19100;background:#fff3df}
.nho-donate-fields{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media (max-width:560px){.nho-donate-fields{grid-template-columns:1fr}}
.nho-donate-fields label{display:flex;flex-direction:column;gap:6px;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#5a4730}
.nho-donate-fields .nho-donate-full{grid-column:1/-1}
.nho-donate-fields input,.nho-donate-fields textarea{padding:12px 14px;border:1.5px solid #ddd3c0;border-radius:11px;font:inherit;background:#fff;outline:none;resize:vertical;color:#1a1208}
.nho-donate-err{margin-top:14px;padding:11px 14px;border-radius:10px;background:#fdf0f0;color:#b03333;border:1px solid #f5c6c6;font-size:.88rem}
.nho-donate-submit{margin-top:22px;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:15px;border:0;border-radius:14px;font:inherit;font-weight:700;font-size:1rem;color:#fff;cursor:pointer;background:linear-gradient(135deg,#f19100,#ffc84a);box-shadow:0 12px 30px rgba(241,145,0,.4);transition:.2s}
.nho-donate-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 16px 38px rgba(241,145,0,.5)}
.nho-donate-submit:disabled{opacity:.7;cursor:not-allowed}
.nho-donate-hint{margin:14px 0 0;text-align:center;color:#8a7050;font-size:.85rem}
.nho-donate-hint a{color:#c97200;font-weight:700;text-decoration:none}
.nho-donate-side{display:flex;flex-direction:column;gap:18px}
.nho-donate-side-card{background:#fff;border:1px solid #ede7da;border-radius:22px;padding:24px}
.nho-donate-side-card.alt{background:linear-gradient(160deg,#fff3df,#ffe6c2);border:0}
.nho-donate-side-card h3{font-family:'Playfair Display',serif;margin:0 0 14px;font-size:1.1rem;color:#1a1208}
.nho-donate-side-card ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
.nho-donate-side-card li{display:flex;align-items:baseline;gap:12px;padding:10px 12px;border-radius:12px;background:#fffaf0}
.nho-donate-side-card li strong{color:#c97200;font-size:1.05rem;min-width:48px}
.nho-donate-side-card li span{color:#6a553a;font-size:.9rem}
.nho-donate-side-card p{color:#5a4730;font-size:.92rem;margin:0 0 12px}
.nho-donate-btn-ghost{display:inline-block;padding:10px 18px;border-radius:999px;background:#fff;border:1.5px solid #f19100;color:#c97200;font-weight:700;text-decoration:none;font-size:.88rem}
.nho-donate-btn-primary{display:inline-block;padding:12px 22px;border-radius:999px;background:linear-gradient(135deg,#f19100,#ffc84a);color:#fff;font-weight:700;text-decoration:none;font-size:.95rem;box-shadow:0 10px 24px rgba(241,145,0,.4)}
.nho-donate-thanks{max-width:560px;margin:60px auto;text-align:center;background:#fff;padding:46px 34px;border-radius:24px;border:1px solid #ede7da;box-shadow:0 20px 60px -20px rgba(26,18,8,.2)}
.nho-donate-thanks-icon{width:80px;height:80px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f19100,#ffc84a);color:#fff;margin-bottom:18px}
.nho-donate-thanks h1{font-family:'Playfair Display',serif;font-size:1.9rem;margin:0 0 10px;color:#1a1208}
.nho-donate-thanks p{color:#6a553a;margin:0 0 22px}
.nho-donate-thanks-cta{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
`;
