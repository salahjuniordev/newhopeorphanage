import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Heart, ShieldCheck, Sparkles, Users, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { initiateSebpayDonation, checkSebpayStatus, type DonationEvent as DonationTimelineEvent } from "@/lib/sebpay.functions";
import { DonationTimeline } from "@/components/DonationTimeline";
import { pageHead } from "@/lib/page-head";


export const Route = createFileRoute("/donation")({
  head: () =>
    pageHead({
      path: "/donation",
      title: "Faire un don — New Hope Orphanage au Cameroun",
      description:
        "Soutenez les enfants de New Hope Orphanage à Yaoundé et Douala en faisant un don et contribuez à leur offrir de nouvelles opportunités.",
      ogTitle: "Faire un don — New Hope Orphanage",
      ogDescription: "Votre soutien peut changer une vie. Faites un don à New Hope Orphanage et contribuez à offrir aux enfants un avenir plein d'espoir.",
    }),
  component: DonationPage,
});


const CAUSES = [
  { id: "general", label: "Where most needed" },
  { id: "education", label: "Education & Books" },
  { id: "food", label: "Food & Nutrition" },
  { id: "healthcare", label: "Healthcare Support" },
  { id: "shelter", label: "Shelter & Care" },
] as const;

// SebPay operator matrix (Central + West Africa Mobile Money)
const COUNTRIES = [
  { code: "CM", name: "Cameroon", currency: "XAF" as const, prefix: "237", operators: ["mtn", "orange"] },
  { code: "BJ", name: "Benin", currency: "XOF" as const, prefix: "229", operators: ["mtn", "moov"] },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF" as const, prefix: "225", operators: ["mtn", "moov", "orange", "wave"] },
  { code: "SN", name: "Senegal", currency: "XOF" as const, prefix: "221", operators: ["orange", "wave", "free"] },
  { code: "BF", name: "Burkina Faso", currency: "XOF" as const, prefix: "226", operators: ["moov", "orange"] },
  { code: "TG", name: "Togo", currency: "XOF" as const, prefix: "228", operators: ["moov", "yas"] },
  { code: "ML", name: "Mali", currency: "XOF" as const, prefix: "223", operators: ["moov", "orange"] },
] as const;

const OPERATOR_LABEL: Record<string, string> = {
  mtn: "MTN Mobile Money",
  orange: "Orange Money",
  moov: "Moov Money",
  wave: "Wave",
  free: "Free Money",
  yas: "Yas / Togocom",
};

const AMOUNTS_XAF = [1000, 2000, 5000, 10000, 25000, 50000];
// Mobile Money provider rule: the amount must be a whole multiple of 200
// (its 2.5% fee must land on a whole unit) and at least 400.
const AMOUNT_STEP = 200;
const MIN_AMOUNT = 400;
const normalizeAmount = (v: number) => Math.max(MIN_AMOUNT, Math.round(v / AMOUNT_STEP) * AMOUNT_STEP);

function DonationPage() {
  const initiate = useServerFn(initiateSebpayDonation);
  const check = useServerFn(checkSebpayStatus);

  const [countryCode, setCountryCode] = useState<(typeof COUNTRIES)[number]["code"]>("CM");
  const country = COUNTRIES.find((c) => c.code === countryCode)!;
  const [operator, setOperator] = useState<string>(country.operators[0]);
  const [amount, setAmount] = useState<number>(2000);
  const [custom, setCustom] = useState("");
  const [cause, setCause] = useState<string>("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tx, setTx] = useState<{
    external_reference: string;
    provider_link: string | null;
    status: string;
    message: string | null;
    events: DonationTimelineEvent[];
  } | null>(null);
  const pollRef = useRef<number | null>(null);
  // Stable idempotency key per form session — resubmits reuse the same key so
  // the server never creates a duplicate donation row / duplicate charge.
  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `nho-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  );

  const resetTransaction = () => {
    idempotencyKeyRef.current = crypto.randomUUID();
    setTx(null);
    setError(null);
  };

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

  // When country changes, reset operator to first available
  useEffect(() => {
    if (!country.operators.includes(operator as never)) {
      setOperator(country.operators[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  // Poll status while pending
  useEffect(() => {
    const TERMINAL = ["approved", "success", "successful", "completed", "paid", "rejected", "failed", "cancelled", "canceled", "expired"];
    if (!tx || TERMINAL.includes(tx.status)) {
      if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; }
      return;
    }

    if (pollRef.current) return;
    pollRef.current = window.setInterval(async () => {
      try {
        const res = await check({ data: { external_reference: tx.external_reference } });
        setTx((prev) => prev ? {
          ...prev,
          status: res.status,
          message: res.message ?? prev.message,
          events: res.events ?? prev.events,
        } : prev);
      } catch {
        /* ignore transient errors */
      }
    }, 4000);
    return () => {
      if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [tx, check]);

  const finalAmount = custom ? Number(custom) : amount;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!finalAmount || finalAmount <= 0) { setError("Please enter a valid amount."); return; }
    if (finalAmount < MIN_AMOUNT || finalAmount % AMOUNT_STEP !== 0) {
      const suggested = normalizeAmount(finalAmount);
      setError(`Mobile Money amounts must be a multiple of ${AMOUNT_STEP} ${country.currency} (minimum ${MIN_AMOUNT}). Try ${suggested.toLocaleString()}.`);
      return;
    }
    if (!name.trim() || !email.trim()) { setError("Please enter your name and email."); return; }

    const cleanedPhone = phone.replace(/[^\d]/g, "");
    if (cleanedPhone.length < 8) { setError("Please enter a valid Mobile Money phone number."); return; }
    const fullPhone = cleanedPhone.startsWith(country.prefix) ? cleanedPhone : country.prefix + cleanedPhone;

    setLoading(true);
    try {
      const res = await initiate({
        data: {
          amount: finalAmount,
          currency: country.currency,
          phone: fullPhone,
          operator,
          country: country.code,
          donor_name: name.trim(),
          donor_email: email.trim(),
          cause: CAUSES.find((c) => c.id === cause)?.label ?? "General",
          message: message.trim() || null,
          idempotency_key: idempotencyKeyRef.current,
        },
      });
      if (!res.ok) {
        setError(res.error || "Payment could not be initiated.");
        setLoading(false);
        return;
      }
      // Fetch the initial timeline right after creation.
      let initialEvents: DonationTimelineEvent[] = [];
      try {
        const s = await check({ data: { external_reference: res.external_reference } });
        initialEvents = s.events ?? [];
      } catch { /* ignore */ }
      setTx({
        external_reference: res.external_reference,
        provider_link: res.provider_link,
        status: res.status || "pending",
        message: res.message ?? "Check your phone to approve the payment.",
        events: initialEvents,
      });
      if (res.provider_link) {
        window.open(res.provider_link, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError((err as Error).message || "Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (!tx) return;
    const causeLabel = CAUSES.find((c) => c.id === cause)?.label ?? "General";
    const shortId = tx.external_reference.slice(-8).toUpperCase();
    const dateStr = new Date().toLocaleString();
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Donation Receipt ${shortId}</title>
<style>
body{font-family:'Helvetica Neue',Arial,sans-serif;color:#020D19;max-width:720px;margin:40px auto;padding:0 24px}
.hd{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #FF6D00;padding-bottom:16px}
.hd h1{font-family:Georgia,serif;font-size:28px;margin:0;color:#E55F00}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;margin:24px 0}
.grid div{padding:10px 0;border-bottom:1px dashed #E5E5E5}
.grid span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#828282}
.grid strong{font-size:15px}
.amt{background:linear-gradient(135deg,#FFF1E6,#FFE0CC);padding:20px;border-radius:14px;text-align:center;margin:24px 0}
.amt div:first-child{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#828282}
.amt div:last-child{font-size:36px;font-weight:800;color:#E55F00;margin-top:6px}
.ft{margin-top:32px;padding-top:16px;border-top:1px solid #E5E5E5;color:#6B6B6B;font-size:13px;line-height:1.6}
.thx{font-family:Georgia,serif;font-style:italic;color:#E55F00;text-align:center;font-size:18px;margin:24px 0}
@media print{.noprint{display:none}}
.noprint{text-align:center;margin-top:24px}
button{padding:10px 24px;background:#FF6D00;color:#fff;border:0;border-radius:8px;font-size:14px;cursor:pointer;font-weight:600}
</style></head><body>
<div class="hd"><div><h1>New Hope Orphanage</h1><small>Yaoundé, Cameroon</small></div><div style="text-align:right"><strong>Donation Receipt</strong><br><small>#${shortId}</small></div></div>
<div class="amt"><div>Total Contribution</div><div>${country.currency} ${finalAmount.toLocaleString()}</div></div>
<div class="grid">
<div><span>Donor</span><strong>${name}</strong></div>
<div><span>Email</span><strong>${email}</strong></div>
<div><span>Cause</span><strong>${causeLabel}</strong></div>
<div><span>Date</span><strong>${dateStr}</strong></div>
<div><span>Reference</span><strong>${tx.external_reference}</strong></div>
<div><span>Payment Status</span><strong>${tx.status}</strong></div>
</div>
<div class="thx">Thank you for giving a child a future.</div>
<div class="ft">Paid via SebPay Mobile Money. New Hope Orphanage · contact@newhopeorphanage.org</div>
<div class="noprint"><button onclick="window.print()">Download / Print PDF</button></div>
<script>setTimeout(()=>window.print(),400)</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  };

  // ---------- Post-submission status screen ----------
  if (tx) {
    const isApproved = ["approved", "success", "successful", "completed", "paid"].includes(tx.status);
    const isRejected = ["rejected", "failed", "cancelled", "canceled", "expired"].includes(tx.status);
    return (
      <div className="nho-donate-wrap">
        <style>{DONATE_CSS}</style>
        <div className="nho-donate-thanks">
          <div className="nho-donate-thanks-icon" style={{
            background: isRejected ? "linear-gradient(135deg,#c73838,#ff7a7a)" : isApproved ? "linear-gradient(135deg,#1f9d55,#7ce495)" : "linear-gradient(135deg,#FF6D00,#FF9A3D)",
          }}>
            {isApproved ? <CheckCircle2 size={44}/> : isRejected ? <XCircle size={44}/> : <Loader2 size={44} className="nho-spin"/>}
          </div>
          <h1>
            {isApproved ? `Thank you, ${name.split(" ")[0]}!` : isRejected ? "Payment not completed" : "Confirm on your phone"}
          </h1>
          <p>
            {isApproved
              ? <>Your gift of <strong>{country.currency} {finalAmount.toLocaleString()}</strong> toward <strong>{CAUSES.find((c) => c.id === cause)?.label}</strong> has been received. May your kindness bless the children.</>
              : isRejected
              ? <>{tx.message ?? "The payment was declined or expired. You can safely try again."}</>
              : <>{tx.message ?? `We sent a Mobile Money request to your ${OPERATOR_LABEL[operator] ?? operator} account. Approve it on your phone to complete the donation of ${country.currency} ${finalAmount.toLocaleString()}.`}</>
            }
          </p>
          <div style={{fontSize:".82rem",color:"#828282",marginTop:-10,marginBottom:18}}>Reference: {tx.external_reference}</div>
          <div className="nho-donate-thanks-cta">
            {isApproved && (
              <button type="button" onClick={downloadReceipt} className="nho-donate-btn-primary">Download receipt (PDF)</button>
            )}
            {isRejected && (
              <button type="button" onClick={resetTransaction} className="nho-donate-btn-primary">Try again</button>
            )}
            {tx.provider_link && !isApproved && !isRejected && (
              <a href={tx.provider_link} target="_blank" rel="noopener noreferrer" className="nho-donate-btn-primary">Open payment page</a>
            )}
            {userId ? (
              <Link to="/dashboard" className="nho-donate-btn-ghost">View my dashboard</Link>
            ) : (
              <Link to="/login" className="nho-donate-btn-ghost">Create an account</Link>
            )}
            <Link to="/" className="nho-donate-btn-ghost">Back to home</Link>
          </div>
          <DonationTimeline events={tx.events} externalReference={tx.external_reference} />
        </div>
      </div>
    );
  }

  // ---------- Donation form ----------
  return (
    <div className="nho-donate-wrap">
      <style>{DONATE_CSS}</style>

      <header className="nho-donate-hero">
        <span className="nho-donate-eyebrow">Make a difference</span>
        <h1>Your gift gives a child a future</h1>
        <p>Every donation directly feeds, educates and protects children at New Hope Orphanage in Yaoundé, Cameroon.</p>
        <div className="nho-donate-trust">
          <span><ShieldCheck size={16}/> Secure Mobile Money via SebPay</span>
          <span><Users size={16}/> 120+ donors</span>
          <span><Heart size={16}/> 100% to the cause</span>
        </div>
      </header>

      <div className="nho-donate-grid">
        <form onSubmit={submit} className="nho-donate-card" noValidate>
          <h2>1. Country & Mobile Money operator</h2>
          <div className="nho-donate-fields">
            <label>Country
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value as typeof countryCode)}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>
                ))}
              </select>
            </label>
            <label>Operator
              <select value={operator} onChange={(e) => setOperator(e.target.value)}>
                {country.operators.map((op) => (
                  <option key={op} value={op}>{OPERATOR_LABEL[op] ?? op}</option>
                ))}
              </select>
            </label>
          </div>

          <h2>2. Amount ({country.currency})</h2>
          <div className="nho-donate-amounts">
            {AMOUNTS_XAF.map((a) => (
              <button
                key={a}
                type="button"
                className={amount === a && !custom ? "is-on" : ""}
                onClick={() => { setAmount(a); setCustom(""); }}
              >{a.toLocaleString()}</button>
            ))}
          </div>
          <label className="nho-donate-custom">
            Custom amount
            <div>
              <span style={{padding:"12px 14px",border:"1.5px solid #E5E5E5",borderRadius:11,fontWeight:700,background:"#fff"}}>{country.currency}</span>
              <input
                inputMode="decimal"
                placeholder="Enter amount"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ""))}
                onBlur={() => { if (custom) setCustom(String(normalizeAmount(Number(custom)))); }}
              />
            </div>
            <small style={{display:"block",marginTop:6,color:"#8a7b63",fontWeight:500}}>
              Multiples of {AMOUNT_STEP} {country.currency}, minimum {MIN_AMOUNT}.
            </small>
          </label>

          <h2>3. Pick a cause</h2>
          <div className="nho-donate-causes">
            {CAUSES.map((c) => (
              <label key={c.id} className={cause === c.id ? "is-on" : ""}>
                <input type="radio" name="cause" value={c.id} checked={cause === c.id} onChange={() => setCause(c.id)} />
                <span>{c.label}</span>
              </label>
            ))}
          </div>

          <h2>4. Your details</h2>
          <div className="nho-donate-fields">
            <label>Full name
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" />
            </label>
            <label>Email
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            <label className="nho-donate-full">Mobile Money phone number
              <div style={{display:"flex",gap:8}}>
                <span style={{padding:"12px 14px",border:"1.5px solid #E5E5E5",borderRadius:11,fontWeight:700,background:"#fff"}}>+{country.prefix}</span>
                <input
                  required
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="6 XX XX XX XX"
                  style={{flex:1}}
                />
              </div>
            </label>
            <label className="nho-donate-full">Message (optional)
              <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Words of hope for the children…" />
            </label>
          </div>

          {error && <div className="nho-donate-err" role="alert">{error}</div>}

          <button type="submit" disabled={loading} className="nho-donate-submit">
            {loading ? <><Loader2 size={18} className="nho-spin"/> Sending Mobile Money request…</> : <>Donate {country.currency} {finalAmount || 0} <Heart size={18}/></>}
          </button>
          <p className="nho-donate-hint">
            You'll receive a Mobile Money prompt on your phone to confirm the payment.
          </p>
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
              <li><strong>1 000</strong><span>Feeds a child for a week</span></li>
              <li><strong>5 000</strong><span>School supplies & uniforms</span></li>
              <li><strong>10 000</strong><span>One month of healthcare</span></li>
              <li><strong>50 000</strong><span>Full shelter & care for a child</span></li>
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
.nho-donate-wrap{max-width:1180px;margin:0 auto;padding:48px 22px 60px;font-family:'Onest','Inter',system-ui,sans-serif;color:#020D19}
.nho-donate-hero{text-align:center;margin-bottom:34px}
.nho-donate-eyebrow{display:inline-block;padding:6px 14px;border-radius:999px;background:rgba(255,109,0,.12);color:#E55F00;font-size:.78rem;font-weight:700;letter-spacing:1px;text-transform:uppercase}
.nho-donate-hero h1{font-family:'Playfair Display',serif;font-size:clamp(2rem,4vw,3rem);margin:14px 0 10px;line-height:1.15;color:#020D19}
.nho-donate-hero p{color:#6B6B6B;max-width:640px;margin:0 auto;font-size:1.02rem}
.nho-donate-trust{display:flex;flex-wrap:wrap;justify-content:center;gap:22px;margin-top:18px;color:#828282;font-size:.85rem}
.nho-donate-trust span{display:inline-flex;align-items:center;gap:6px}
.nho-donate-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(280px,1fr);gap:24px}
@media (max-width:900px){.nho-donate-grid{grid-template-columns:1fr}}
.nho-donate-card{background:#fff;border:1px solid #EFEFEF;border-radius:22px;padding:30px;box-shadow:0 18px 50px -28px rgba(26,18,8,.25)}
.nho-donate-card h2{font-family:'Playfair Display',serif;font-size:1.18rem;margin:0 0 14px;color:#020D19}
.nho-donate-card h2:not(:first-child){margin-top:26px}
.nho-donate-amounts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
@media (min-width:520px){.nho-donate-amounts{grid-template-columns:repeat(6,1fr)}}
.nho-donate-amounts button{padding:14px 6px;border-radius:14px;border:1.5px solid #EFEFEF;background:#FFFFFF;font:inherit;font-weight:700;color:#020D19;cursor:pointer;transition:.18s;font-size:.9rem}
.nho-donate-amounts button:hover{border-color:#FF6D00}
.nho-donate-amounts button.is-on{background:linear-gradient(135deg,#FF6D00,#FF9A3D);color:#fff;border-color:transparent;box-shadow:0 8px 18px rgba(255,109,0,.32)}
.nho-donate-custom{display:block;margin-top:12px;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#4A4A4A}
.nho-donate-custom>div{display:flex;gap:8px;margin-top:6px}
.nho-donate-custom input{padding:12px 14px;border:1.5px solid #E5E5E5;border-radius:11px;font:inherit;background:#fff;outline:none;flex:1}
.nho-donate-custom input:focus,.nho-donate-fields input:focus,.nho-donate-fields textarea:focus,.nho-donate-fields select:focus{border-color:#FF6D00;box-shadow:0 0 0 3px rgba(255,109,0,.15)}
.nho-donate-causes{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}
.nho-donate-causes label{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1.5px solid #EFEFEF;border-radius:14px;cursor:pointer;background:#FFFFFF;font-weight:600;font-size:.92rem;color:#020D19;transition:.18s}
.nho-donate-causes label input{accent-color:#FF6D00}
.nho-donate-causes label.is-on{border-color:#FF6D00;background:#FFF1E6}
.nho-donate-fields{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media (max-width:560px){.nho-donate-fields{grid-template-columns:1fr}}
.nho-donate-fields label{display:flex;flex-direction:column;gap:6px;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#4A4A4A}
.nho-donate-fields .nho-donate-full{grid-column:1/-1}
.nho-donate-fields input,.nho-donate-fields textarea,.nho-donate-fields select{padding:12px 14px;border:1.5px solid #E5E5E5;border-radius:11px;font:inherit;background:#fff;outline:none;resize:vertical;color:#020D19}
.nho-donate-err{margin-top:14px;padding:11px 14px;border-radius:10px;background:#fdf0f0;color:#b03333;border:1px solid #f5c6c6;font-size:.88rem}
.nho-donate-submit{margin-top:22px;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:15px;border:0;border-radius:14px;font:inherit;font-weight:700;font-size:1rem;color:#fff;cursor:pointer;background:linear-gradient(135deg,#FF6D00,#FF9A3D);box-shadow:0 12px 30px rgba(255,109,0,.4);transition:.2s}
.nho-donate-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 16px 38px rgba(255,109,0,.5)}
.nho-donate-submit:disabled{opacity:.7;cursor:not-allowed}
.nho-donate-hint{margin:14px 0 0;text-align:center;color:#828282;font-size:.85rem}
.nho-donate-hint a{color:#E55F00;font-weight:700;text-decoration:none}
.nho-donate-side{display:flex;flex-direction:column;gap:18px}
.nho-donate-side-card{background:#fff;border:1px solid #EFEFEF;border-radius:22px;padding:24px}
.nho-donate-side-card.alt{background:linear-gradient(160deg,#FFF1E6,#FFE0CC);border:0}
.nho-donate-side-card h3{font-family:'Playfair Display',serif;margin:0 0 14px;font-size:1.1rem;color:#020D19}
.nho-donate-side-card ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
.nho-donate-side-card li{display:flex;align-items:baseline;gap:12px;padding:10px 12px;border-radius:12px;background:#FFFFFF}
.nho-donate-side-card li strong{color:#E55F00;font-size:1.05rem;min-width:64px}
.nho-donate-side-card li span{color:#6B6B6B;font-size:.9rem}
.nho-donate-side-card p{color:#4A4A4A;font-size:.92rem;margin:0 0 12px}
.nho-donate-btn-ghost{display:inline-block;padding:10px 18px;border-radius:999px;background:#fff;border:1.5px solid #FF6D00;color:#E55F00;font-weight:700;text-decoration:none;font-size:.88rem}
.nho-donate-btn-primary{display:inline-block;padding:12px 22px;border-radius:999px;background:linear-gradient(135deg,#FF6D00,#FF9A3D);color:#fff;font-weight:700;text-decoration:none;font-size:.95rem;box-shadow:0 10px 24px rgba(255,109,0,.4);border:0;cursor:pointer}
.nho-donate-thanks{max-width:560px;margin:60px auto;text-align:center;background:#fff;padding:46px 34px;border-radius:24px;border:1px solid #EFEFEF;box-shadow:0 20px 60px -20px rgba(26,18,8,.2)}
.nho-donate-thanks-icon{width:80px;height:80px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#FF6D00,#FF9A3D);color:#fff;margin-bottom:18px}
.nho-donate-thanks h1{font-family:'Playfair Display',serif;font-size:1.9rem;margin:0 0 10px;color:#020D19}
.nho-donate-thanks p{color:#6B6B6B;margin:0 0 22px}
.nho-donate-thanks-cta{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.nho-spin{animation:nho-spin 1s linear infinite}
@keyframes nho-spin{to{transform:rotate(360deg)}}
.nho-tl{margin-top:26px;text-align:left;background:#FFFFFF;border:1px solid #EFEFEF;border-radius:16px;padding:18px 20px}
.nho-tl.is-compact{margin-top:12px;padding:12px 14px;background:#fff;border-color:#efe6d3}
.nho-tl-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:10px;flex-wrap:wrap}
.nho-tl-head strong{font-size:.88rem;letter-spacing:.4px;text-transform:uppercase;color:#4A4A4A}
.nho-tl-ref{font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#828282}
.nho-tl-empty{color:#828282;font-size:.9rem}
.nho-tl-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px;position:relative}
.nho-tl-list:before{content:"";position:absolute;left:6px;top:6px;bottom:6px;width:2px;background:#EFEFEF;border-radius:2px}
.nho-tl-list li{position:relative;padding-left:22px}
.nho-tl-dot{position:absolute;left:0;top:6px;width:14px;height:14px;border-radius:50%;box-shadow:0 0 0 3px #fff}
.nho-tl-body{display:flex;flex-direction:column;gap:2px}
.nho-tl-row{display:flex;justify-content:space-between;gap:10px;align-items:baseline;flex-wrap:wrap}
.nho-tl-row strong{color:#020D19;font-size:.94rem}
.nho-tl-row time{color:#828282;font-size:.76rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.nho-tl-body p{margin:2px 0 0;color:#4A4A4A;font-size:.86rem}
`;
