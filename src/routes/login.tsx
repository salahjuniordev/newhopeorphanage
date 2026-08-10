import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
 component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
 const navigate = useNavigate();
 const [mode, setMode] = useState<Mode>("signin");
 const [loading, setLoading] = useState(false);
 const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [fullName, setFullName] = useState("");
 const [phone, setPhone] = useState("");

 // Redirect if already signed in
 useEffect(() => {
 supabase.auth.getSession().then(({ data }) => {
 if (data.session) navigate({ to: "/dashboard", replace: true });
 });
 }, [navigate]);

 const onSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setMsg(null);
 setLoading(true);
 try {
 if (mode === "signin") {
 const { error } = await supabase.auth.signInWithPassword({ email, password });
 if (error) throw error;
 setMsg({ type: "ok", text: "Signed in. Redirecting…" });
 setTimeout(() => navigate({ to: "/dashboard", replace: true }), 600);
 } else {
 const { data, error } = await supabase.auth.signUp({
 email,
 password,
 options: {
 emailRedirectTo: `${window.location.origin}/dashboard`,
 data: { full_name: fullName, phone },
 },
 });
 if (error) throw error;
 if (data.session) {
 navigate({ to: "/dashboard", replace: true });
 } else {
 setMsg({
 type: "ok",
 text: "Account created. Check your email to confirm, then sign in.",
 });
 setMode("signin");
 }
 }
 } catch (err) {
 setMsg({ type: "err", text: err instanceof Error? err.message: "Something went wrong." });
 } finally {
 setLoading(false);
 }
 };

 const onGoogle = async () => {
 setMsg(null);
 setLoading(true);
 try {
 const result = await lovable.auth.signInWithOAuth("google", {
 redirect_uri: window.location.origin,
 });
 if (result.error) {
 setMsg({ type: "err", text: result.error.message?? "Google sign-in failed." });
 return;
 }
 if (result.redirected) return;
 navigate({ to: "/dashboard", replace: true });
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="nho-auth">
 <style>{AUTH_CSS}</style>
 <div className="nho-auth-panel-left">
 <div>
 <div className="nho-auth-logo"> New Hope Orphanage</div>
 <div className="nho-auth-sub">Yaoundé, Cameroon · Est. 2018</div>
 </div>
 <div>
 <blockquote>
 Every child deserves a <span>safe home</span> and a future full of hope.
 </blockquote>
 <p>Join our community of donors and volunteers making a difference every day.</p>
 </div>
 <div className="nho-auth-stats">
 <div><strong>50+</strong><span>Children</span></div>
 <div><strong>120+</strong><span>Donors</span></div>
 <div><strong>8 yrs</strong><span>Of Service</span></div>
 </div>
 </div>

 <div className="nho-auth-panel-right">
 <div className="nho-auth-box">
 <div className="nho-auth-tabs" role="tablist">
 <button
 type="button"
 role="tab"
 aria-selected={mode === "signin"}
 className={mode === "signin"? "is-on": ""}
 onClick={() => { setMode("signin"); setMsg(null); }}
 >Sign In</button>
 <button
 type="button"
 role="tab"
 aria-selected={mode === "signup"}
 className={mode === "signup"? "is-on": ""}
 onClick={() => { setMode("signup"); setMsg(null); }}
 >Create Account</button>
 </div>

 <h1 className="nho-auth-title">
 {mode === "signin"? "Welcome back ": "Join our mission "}
 </h1>
 <p className="nho-auth-desc">
 {mode === "signin"
? "Sign in to access your donor dashboard."
: "Create your free account to start donating."}
 </p>

 {msg && (
 <div className={`nho-auth-alert ${msg.type}`} role="alert">{msg.text}</div>
 )}

 <form onSubmit={onSubmit} className="nho-auth-form" noValidate>
 {mode === "signup" && (
 <>
 <label>Full name
 <input
 type="text"
 required
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 placeholder="Jean Dupont"
 />
 </label>
 <label>Phone (optional)
 <input
 type="tel"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 placeholder="+237 6XX XXX XXX"
 />
 </label>
 </>
 )}
 <label>Email
 <input
 type="email"
 required
 autoComplete="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="you@example.com"
 />
 </label>
 <label>Password
 <input
 type="password"
 required
 minLength={6}
 autoComplete={mode === "signin"? "current-password": "new-password"}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 />
 </label>
 <button type="submit" className="nho-auth-submit" disabled={loading}>
 {loading? "Please wait…": mode === "signin"? "Sign In": "Create my account"}
 </button>
 </form>

 <div className="nho-auth-divider"><span>or continue with</span></div>

 <button type="button" className="nho-auth-google" onClick={onGoogle} disabled={loading}>
 <img src="/legacy/images/auth/google.svg" width={18} height={18} alt="" /> Continue with Google
 </button>

 <p className="nho-auth-back">
 <Link to="/">← Back to New Hope Orphanage</Link>
 </p>
 </div>
 </div>
 </div>
 );
}

const AUTH_CSS = `
.nho-auth{display:flex;min-height:calc(100vh - 76px);background:#F8F8F8;font-family:'Onest','Inter',system-ui,sans-serif}
.nho-auth-panel-left{width:46%;padding:50px 60px;color:#fff;display:flex;flex-direction:column;justify-content:space-between;
 background:linear-gradient(160deg,#020D19 0%,#0A2036 50%,#FF6D00 100%);position:relative;overflow:hidden}
.nho-auth-logo{font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700}
.nho-auth-sub{font-size:.75rem;letter-spacing:2px;text-transform:uppercase;opacity:.65;margin-top:4px}
.nho-auth-panel-left blockquote{font-family:'Playfair Display',serif;font-size:1.8rem;line-height:1.4;margin:0 0 12px}
.nho-auth-panel-left blockquote span{color:#FF9A3D}
.nho-auth-panel-left p{opacity:.7;font-size:.9rem;margin:0}
.nho-auth-stats{display:flex;gap:32px}
.nho-auth-stats div{display:flex;flex-direction:column}
.nho-auth-stats strong{font-family:'Playfair Display',serif;font-size:1.6rem;color:#FF9A3D}
.nho-auth-stats span{font-size:.7rem;letter-spacing:1px;text-transform:uppercase;opacity:.6}
.nho-auth-panel-right{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 30px}
.nho-auth-box{width:100%;max-width:440px}
.nho-auth-tabs{display:flex;background:#EFEFEF;border-radius:50px;padding:5px;margin-bottom:28px}
.nho-auth-tabs button{flex:1;padding:11px;border:0;background:transparent;border-radius:50px;font:inherit;font-size:.9rem;font-weight:500;color:#828282;cursor:pointer;transition:.25s}
.nho-auth-tabs button.is-on{background:#FF6D00;color:#fff;box-shadow:0 4px 14px rgba(255,109,0,.4)}
.nho-auth-title{font-family:'Playfair Display',serif;font-size:1.7rem;color:#020D19;margin:0 0 6px}
.nho-auth-desc{color:#828282;font-size:.9rem;margin:0 0 22px}
.nho-auth-alert{padding:11px 14px;border-radius:10px;font-size:.85rem;margin-bottom:14px}
.nho-auth-alert.ok{background:#e8f8f0;color:#1e7a4d;border:1px solid #b2e4cc}
.nho-auth-alert.err{background:#fdf0f0;color:#b03333;border:1px solid #f5c6c6}
.nho-auth-form{display:flex;flex-direction:column;gap:14px}
.nho-auth-form label{display:flex;flex-direction:column;gap:6px;font-size:.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#020D19}
.nho-auth-form input{padding:12px 14px;border:1.5px solid #E5E5E5;border-radius:11px;font:inherit;font-size:.93rem;background:#fff;outline:none;transition:.2s}
.nho-auth-form input:focus{border-color:#FF6D00;box-shadow:0 0 0 3px rgba(255,109,0,.15)}
.nho-auth-submit{margin-top:6px;padding:13px;border:0;border-radius:11px;font:inherit;font-weight:600;font-size:.95rem;color:#fff;cursor:pointer;
 background:linear-gradient(135deg,#FF6D00,#FF9A3D);box-shadow:0 6px 20px rgba(255,109,0,.4);transition:.25s}
.nho-auth-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 10px 26px rgba(255,109,0,.5)}
.nho-auth-submit:disabled{opacity:.7;cursor:not-allowed}
.nho-auth-divider{display:flex;align-items:center;gap:12px;margin:18px 0;color:#828282;font-size:.78rem}
.nho-auth-divider::before,.nho-auth-divider::after{content:"";flex:1;height:1px;background:#E5E5E5}
.nho-auth-google{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:12px;border:1.5px solid #E5E5E5;border-radius:11px;background:#fff;font:inherit;font-size:.9rem;font-weight:500;color:#020D19;cursor:pointer;transition:.2s}
.nho-auth-google:hover{border-color:#FF6D00;background:#fff9f0}
.nho-auth-back{margin-top:22px;text-align:center;font-size:.82rem;color:#828282}
.nho-auth-back a{color:#E55F00;font-weight:600;text-decoration:none}
@media (max-width:900px){.nho-auth{flex-direction:column}.nho-auth-panel-left{width:100%;padding:32px 28px;gap:24px}.nho-auth-panel-left blockquote{font-size:1.3rem}}
`;
