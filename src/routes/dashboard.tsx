import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Heart, LogOut, User as UserIcon, Mail, Phone, Sparkles, Calendar, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { getDonationEvents, type DonationEvent } from "@/lib/sebpay.functions";
import { DonationTimeline } from "@/components/DonationTimeline";

export const Route = createFileRoute("/dashboard")({
 component: Dashboard,
});

interface Donation {
 id: string; amount: number; currency: string; cause: string | null;
 created_at: string; message: string | null;
 status: string; external_reference: string | null; provider_message: string | null;
}
interface Profile { full_name: string | null; phone: string | null; avatar_url: string | null }

function Dashboard() {
 const navigate = useNavigate();
 const [session, setSession] = useState<Session | null>(null);
 const [profile, setProfile] = useState<Profile | null>(null);
 const [donations, setDonations] = useState<Donation[]>([]);
 const [loading, setLoading] = useState(true);
 const [tab, setTab] = useState<"overview"|"donations"|"profile">("overview");
 const [editName, setEditName] = useState("");
 const [editPhone, setEditPhone] = useState("");
 const [saving, setSaving] = useState(false);
 const [saveMsg, setSaveMsg] = useState<string | null>(null);
 const [isAdmin, setIsAdmin] = useState(false);

 useEffect(() => {
 const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
 setSession(s);
 if (!s) navigate({ to: "/login", replace: true });
 });
 supabase.auth.getSession().then(async ({ data }) => {
 setSession(data.session);
 if (!data.session) { navigate({ to: "/login", replace: true }); return; }
 const { data: r } = await supabase
.from("user_roles")
.select("role")
.eq("user_id", data.session.user.id)
.eq("role", "admin")
.maybeSingle();
 setIsAdmin(!!r);
 });
 return () => sub.subscription.unsubscribe();
 }, [navigate]);

 useEffect(() => {
 if (!session) return;
 (async () => {
 setLoading(true);
 const [{ data: p }, { data: d }] = await Promise.all([
 supabase.from("profiles").select("full_name, phone, avatar_url").eq("id", session.user.id).maybeSingle(),
 supabase.from("donations").select("id, amount, currency, cause, created_at, message, status, external_reference, provider_message").eq("user_id", session.user.id).order("created_at", { ascending: false }),
 ]);
 // ensure profile exists
 if (!p) {
 const meta = session.user.user_metadata as { full_name?: string; avatar_url?: string } | undefined;
 await supabase.from("profiles").insert({ id: session.user.id, full_name: meta?.full_name?? null, avatar_url: meta?.avatar_url?? null });
 const { data: p2 } = await supabase.from("profiles").select("full_name, phone, avatar_url").eq("id", session.user.id).maybeSingle();
 setProfile(p2?? null);
 setEditName(p2?.full_name?? "");
 setEditPhone(p2?.phone?? "");
 } else {
 setProfile(p);
 setEditName(p.full_name?? "");
 setEditPhone(p.phone?? "");
 }
 setDonations((d as Donation[] | null)?? []);
 setLoading(false);
 })();
 }, [session]);

 const signOut = async () => {
 await supabase.auth.signOut();
 navigate({ to: "/", replace: true });
 };

 const saveProfile = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!session) return;
 setSaving(true); setSaveMsg(null);
 const { error } = await supabase.from("profiles").update({
 full_name: editName.trim() || null,
 phone: editPhone.trim() || null,
 }).eq("id", session.user.id);
 setSaving(false);
 if (error) { setSaveMsg(error.message); return; }
 setSaveMsg("Saved!");
 setProfile((p) => ({...(p?? { avatar_url: null }), full_name: editName.trim() || null, phone: editPhone.trim() || null } as Profile));
 setTimeout(() => setSaveMsg(null), 2400);
 };

 if (!session) return null;
 const total = donations.reduce((acc, d) => acc + Number(d.amount), 0);
 const firstName = profile?.full_name?.split(" ")[0]?? session.user.email?.split("@")[0]?? "Friend";
 const initial = (profile?.full_name?? session.user.email?? "?").charAt(0).toUpperCase();

 return (
 <div className="nho-dash-wrap">
 <style>{DASH_CSS}</style>

 <header className="nho-dash-hero">
 <div className="nho-dash-hero-inner">
 <div className="nho-dash-avatar">
 {profile?.avatar_url? <img src={profile.avatar_url} alt="" />: <span>{initial}</span>}
 </div>
 <div>
 <span className="nho-dash-eyebrow">Welcome back</span>
 <h1>Hi, {firstName} </h1>
 <p>{session.user.email}</p>
 </div>
 {isAdmin && (
 <Link to="/admin" className="nho-dash-signout" style={{ marginRight: 8, background: "linear-gradient(135deg,#f19100,#ffc84a)", color: "#fff", borderColor: "transparent" }}>
 <Sparkles size={16}/> Admin console
 </Link>
 )}
 <button onClick={signOut} className="nho-dash-signout" aria-label="Sign out">
 <LogOut size={16}/> Sign out
 </button>
 </div>
 </header>

 <section className="nho-dash-stats">
 <Stat icon={<Heart size={20}/>} label="Total donated" value={`$${total.toFixed(2)}`} accent="#f19100"/>
 <Stat icon={<Sparkles size={20}/>} label="Donations" value={String(donations.length)} accent="#3db07a"/>
 <Stat icon={<Calendar size={20}/>} label="Member since" value={new Date(session.user.created_at).toLocaleDateString()} accent="#5a3500"/>
 </section>

 <nav className="nho-dash-tabs" role="tablist">
 {(["overview","donations","profile"] as const).map((t) => (
 <button key={t} role="tab" aria-selected={tab===t} className={tab===t? "is-on": ""} onClick={() => setTab(t)}>
 {t === "overview"? "Overview": t === "donations"? "My donations": "Profile"}
 </button>
 ))}
 </nav>

 <section className="nho-dash-panel">
 {tab === "overview" && (
 <div className="nho-dash-overview">
 <div className="nho-dash-card">
 <h2>Recent activity</h2>
 {loading? <p className="muted">Loading…</p>: donations.length === 0? (
 <div className="nho-dash-empty">
 <p>You haven’t made any donations yet.</p>
 <Link to="/donation" className="nho-dash-cta">Make your first donation</Link>
 </div>
 ): (
 <ul className="nho-dash-recent">
 {donations.slice(0,4).map((d) => (
 <li key={d.id}>
 <span className="nho-dash-recent-icon"><Heart size={16}/></span>
 <div>
 <strong>{d.currency} {Number(d.amount).toFixed(2)}</strong>
 <small>{d.cause?? "General"} · {new Date(d.created_at).toLocaleDateString()}</small>
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>
 <div className="nho-dash-card alt">
 <h2>Keep the hope alive</h2>
 <p>Your continued support means hot meals, books, and safe shelter for every child.</p>
 <Link to="/donation" className="nho-dash-cta">Donate again</Link>
 </div>
 </div>
 )}

 {tab === "donations" && (
 <div className="nho-dash-card">
 <div className="nho-dash-row">
 <h2>My donations</h2>
 <Link to="/donation" className="nho-dash-cta sm">New donation</Link>
 </div>
 {loading? <p className="muted">Loading…</p>: donations.length === 0? (
 <p className="muted">No donations yet.</p>
 ): (
 <div className="nho-dash-table">
 <div className="nho-dash-thead">
 <span>Date</span><span>Cause</span><span>Status</span><span>Reference</span><span style={{textAlign:"right"}}>Amount</span>
 </div>
 {donations.map((d) => (
 <DonationRow key={d.id} d={d} />
 ))}
 </div>
 )}
 </div>
 )}

 {tab === "profile" && (
 <form onSubmit={saveProfile} className="nho-dash-card nho-dash-profile">
 <h2>My profile</h2>
 <label><UserIcon size={14}/> Full name
 <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" />
 </label>
 <label><Mail size={14}/> Email
 <input value={session.user.email?? ""} disabled />
 </label>
 <label><Phone size={14}/> Phone
 <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+237 6XX XXX XXX" />
 </label>
 {saveMsg && <div className="nho-dash-save-msg">{saveMsg}</div>}
 <button type="submit" disabled={saving} className="nho-dash-cta">{saving? "Saving…": "Save changes"}</button>
 </form>
 )}
 </section>
 </div>
 );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
 return (
 <div className="nho-dash-stat">
 <span className="nho-dash-stat-icon" style={{background:`${accent}1f`,color:accent}}>{icon}</span>
 <div>
 <small>{label}</small>
 <strong style={{color:accent}}>{value}</strong>
 </div>
 </div>
 );
}

const DASH_CSS = `
.nho-dash-wrap{max-width:1180px;margin:0 auto;padding:40px 22px 60px;font-family:'Onest','Inter',system-ui,sans-serif;color:#1a1208}
.nho-dash-hero{background:linear-gradient(135deg,#fff3df 0%,#ffe6c2 100%);border-radius:24px;padding:30px;margin-bottom:22px;border:1px solid #f6e1bb}
.nho-dash-hero-inner{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.nho-dash-eyebrow{display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(241,145,0,.18);color:#c97200;font-size:.72rem;font-weight:700;letter-spacing:1px;text-transform:uppercase}
.nho-dash-hero h1{font-family:'Playfair Display',serif;font-size:clamp(1.7rem,3vw,2.3rem);margin:8px 0 4px;color:#1a1208}
.nho-dash-hero p{margin:0;color:#6a553a;font-size:.92rem}
.nho-dash-avatar{width:74px;height:74px;border-radius:50%;background:linear-gradient(135deg,#f19100,#ffc84a);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;overflow:hidden;box-shadow:0 10px 24px rgba(241,145,0,.35)}
.nho-dash-avatar img{width:100%;height:100%;object-fit:cover}
.nho-dash-signout{margin-left:auto;display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;border:1.5px solid #ddd3c0;background:#fff;font:inherit;font-weight:600;font-size:.85rem;color:#5a4730;cursor:pointer;transition:.2s}
.nho-dash-signout:hover{border-color:#f19100;color:#c97200}
.nho-dash-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:22px}
.nho-dash-stat{display:flex;align-items:center;gap:14px;background:#fff;border:1px solid #ede7da;border-radius:18px;padding:18px 20px}
.nho-dash-stat-icon{width:44px;height:44px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center}
.nho-dash-stat small{display:block;color:#8a7050;font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.6px}
.nho-dash-stat strong{font-family:'Playfair Display',serif;font-size:1.5rem;display:block;line-height:1.1;margin-top:2px}
.nho-dash-tabs{display:flex;gap:6px;padding:6px;background:#fff;border:1px solid #ede7da;border-radius:14px;margin-bottom:18px;overflow-x:auto}
.nho-dash-tabs button{flex:1;min-width:120px;padding:11px 14px;border:0;border-radius:10px;font:inherit;font-weight:600;font-size:.9rem;color:#6a553a;background:transparent;cursor:pointer;transition:.2s;white-space:nowrap}
.nho-dash-tabs button.is-on{background:linear-gradient(135deg,#f19100,#ffc84a);color:#fff;box-shadow:0 6px 14px rgba(241,145,0,.3)}
.nho-dash-card{background:#fff;border:1px solid #ede7da;border-radius:22px;padding:26px}
.nho-dash-card.alt{background:linear-gradient(160deg,#fff3df,#ffe6c2);border:0}
.nho-dash-card h2{font-family:'Playfair Display',serif;font-size:1.2rem;margin:0 0 14px;color:#1a1208}
.nho-dash-row{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
.nho-dash-overview{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(260px,1fr);gap:16px}
@media (max-width:780px){.nho-dash-overview{grid-template-columns:1fr}}
.nho-dash-cta{display:inline-block;padding:11px 20px;border-radius:999px;background:linear-gradient(135deg,#f19100,#ffc84a);color:#fff;font-weight:700;text-decoration:none;font-size:.9rem;border:0;cursor:pointer;font-family:inherit;box-shadow:0 8px 20px rgba(241,145,0,.35)}
.nho-dash-cta.sm{padding:8px 16px;font-size:.82rem}
.nho-dash-empty{text-align:center;padding:24px 0}
.nho-dash-empty p{color:#8a7050;margin:0 0 14px}
.nho-dash-recent{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.nho-dash-recent li{display:flex;gap:12px;align-items:center;padding:12px 14px;border-radius:14px;background:#fffaf0}
.nho-dash-recent-icon{width:34px;height:34px;border-radius:50%;background:rgba(241,145,0,.18);color:#c97200;display:inline-flex;align-items:center;justify-content:center}
.nho-dash-recent strong{display:block;color:#1a1208}
.nho-dash-recent small{color:#8a7050;font-size:.8rem}
.nho-dash-table{display:flex;flex-direction:column}
.nho-dash-thead,.nho-dash-trow{display:grid;grid-template-columns:1fr 1fr 1.4fr.8fr;gap:14px;padding:12px 8px;align-items:center}
.nho-dash-thead{border-bottom:1px solid #ede7da;font-size:.72rem;text-transform:uppercase;letter-spacing:.6px;color:#8a7050;font-weight:700}
.nho-dash-trow{border-bottom:1px solid #f5efe2;font-size:.92rem}
@media (max-width:640px){.nho-dash-thead{display:none}.nho-dash-trow{grid-template-columns:1fr 1fr;row-gap:4px}}
.muted{color:#8a7050}
.nho-dash-profile{display:flex;flex-direction:column;gap:14px;max-width:520px}
.nho-dash-profile label{display:flex;flex-direction:column;gap:6px;font-size:.76rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#5a4730}
.nho-dash-profile label svg{display:inline;vertical-align:-2px;margin-right:6px;color:#c97200}
.nho-dash-profile input{padding:12px 14px;border:1.5px solid #ddd3c0;border-radius:11px;font:inherit;background:#fff;outline:none;color:#1a1208}
.nho-dash-profile input:focus{border-color:#f19100;box-shadow:0 0 0 3px rgba(241,145,0,.15)}
.nho-dash-profile input:disabled{background:#f7f1e4;color:#8a7050}
.nho-dash-save-msg{padding:10px 14px;border-radius:10px;background:#e8f8f0;color:#1e7a4d;border:1px solid #b2e4cc;font-size:.88rem}
`;
