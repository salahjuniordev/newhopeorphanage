import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { pageHead } from "@/lib/page-head";

const LOGO_SRC = "/nho-logo.webp";

export const Route = createFileRoute("/login")({
  head: () =>
    pageHead({
      path: "/login",
      title: "Connexion et inscription — New Hope Orphanage",
      description:
        "Connectez-vous ou créez votre compte New Hope Orphanage pour faire un don, suivre l'historique de vos dons et gérer votre profil de donateur.",
    }),

  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
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
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Something went wrong." });
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
        setMsg({ type: "err", text: result.error.message ?? "Google sign-in failed." });
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

      {/* Brand / story panel */}
      <aside className="nho-auth-aside">
        <div className="nho-auth-glow" aria-hidden="true" />
        <div className="nho-auth-aside-top">
          <img className="nho-auth-mark" src={LOGO_SRC} alt="New Hope Orphanage" width={80} height={80} decoding="async" />
          <span className="nho-auth-chip">Yaoundé, Cameroon · Est. 2018</span>
        </div>

        <div className="nho-auth-aside-mid">
          <h2>
            Every child deserves a <span>safe home</span> and a future full of hope.
          </h2>
          <p>Join our community of donors and volunteers making a difference every day.</p>
        </div>

        <ul className="nho-auth-stats">
          <li><strong>50+</strong><span>Children</span></li>
          <li><strong>120+</strong><span>Donors</span></li>
          <li><strong>8 yrs</strong><span>Of service</span></li>
        </ul>
      </aside>

      {/* Form panel */}
      <main className="nho-auth-main">
        <div className="nho-auth-card">
          <div className="nho-auth-tabs" role="tablist" aria-label="Authentication mode">
            <span className={`nho-auth-thumb ${mode === "signup" ? "right" : ""}`} aria-hidden="true" />
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              className={mode === "signin" ? "is-on" : ""}
              onClick={() => { setMode("signin"); setMsg(null); }}
            >Sign in</button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={mode === "signup" ? "is-on" : ""}
              onClick={() => { setMode("signup"); setMsg(null); }}
            >Create account</button>
          </div>

          <h1 className="nho-auth-title">
            {mode === "signin" ? "Welcome back" : "Join our mission"}
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
                <label className="nho-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jean Dupont"
                  />
                </label>
                <label className="nho-field">
                  <span>Phone (optional)</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                  />
                </label>
              </>
            )}
            <label className="nho-field">
              <span>Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label className="nho-field">
              <span>Password</span>
              <span className="nho-pw">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >{showPw ? "Hide" : "Show"}</button>
              </span>
            </label>

            <button type="submit" className="nho-auth-submit" disabled={loading}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create my account"}
            </button>
          </form>

          <div className="nho-auth-divider"><span>or continue with</span></div>

          <button type="button" className="nho-auth-google" onClick={onGoogle} disabled={loading}>
            <img src="/legacy/images/auth/google.svg" width={18} height={18} alt="" />
            Continue with Google
          </button>

          <p className="nho-auth-back">
            <Link to="/">← Back to New Hope Orphanage</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

const AUTH_CSS = `
.nho-auth{
  --nho-accent:#FF6D00;--nho-accent-2:#FF9A3D;--nho-ink:#020D19;--nho-muted:#828282;
  --nho-line:#E5E5E5;--nho-soft:#F8F8F8;
  display:grid;grid-template-columns:minmax(0,46%) minmax(0,1fr);
  min-height:calc(100vh - 76px);background:var(--nho-soft);
  font-family:'Onest','Inter',system-ui,sans-serif;color:var(--nho-ink);
}
.nho-auth-aside{
  position:relative;overflow:hidden;padding:56px 56px 48px;
  display:flex;flex-direction:column;justify-content:space-between;gap:40px;
  background:radial-gradient(120% 90% at 0% 0%,#0A2036 0%,#020D19 55%,#020D19 100%);
  color:#fff;
}
.nho-auth-glow{
  position:absolute;width:520px;height:520px;right:-180px;bottom:-200px;border-radius:50%;
  background:radial-gradient(circle,rgba(255,109,0,.55) 0%,rgba(255,109,0,0) 68%);
  filter:blur(6px);pointer-events:none;
}
.nho-auth-aside > *{position:relative;z-index:1}
.nho-auth-mark{height:80px;width:auto;display:block;background:#fff;border-radius:16px;padding:8px 12px}
.nho-auth-chip{
  display:inline-block;margin-top:18px;padding:6px 14px;border-radius:999px;
  font-size:.7rem;letter-spacing:1.6px;text-transform:uppercase;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);color:rgba(255,255,255,.78);
}
.nho-auth-aside-mid h2{
  font-family:'Playfair Display',serif;font-size:2.05rem;line-height:1.35;margin:0 0 14px;font-weight:700;color:#fff;
}
.nho-auth-aside-mid h2 span{color:var(--nho-accent-2)}
.nho-auth-aside-mid p{margin:0;color:rgba(255,255,255,.7);font-size:.95rem;line-height:1.6;max-width:34ch}
.nho-auth-stats{list-style:none;margin:0;padding:0;display:flex;gap:14px}
.nho-auth-stats li{
  flex:1;padding:14px 16px;border-radius:16px;display:flex;flex-direction:column;gap:2px;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
}
.nho-auth-stats strong{font-family:'Playfair Display',serif;font-size:1.45rem;color:var(--nho-accent-2)}
.nho-auth-stats span{font-size:.66rem;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,.6)}

.nho-auth-main{display:flex;align-items:center;justify-content:center;padding:48px 28px}
.nho-auth-card{
  width:100%;max-width:452px;background:#fff;border:1px solid var(--nho-line);
  border-radius:26px;padding:34px 32px;box-shadow:0 30px 70px -45px rgba(2,13,25,.45);
}
.nho-auth-tabs{
  position:relative;display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:5px;
  background:var(--nho-soft);border:1px solid var(--nho-line);border-radius:999px;margin-bottom:26px;
}
.nho-auth-thumb{
  position:absolute;top:5px;bottom:5px;left:5px;width:calc(50% - 5px);border-radius:999px;
  background:linear-gradient(135deg,var(--nho-accent),var(--nho-accent-2));
  box-shadow:0 8px 20px -8px rgba(255,109,0,.7);transition:transform .28s cubic-bezier(.4,0,.2,1);
}
.nho-auth-thumb.right{transform:translateX(100%)}
.nho-auth-tabs button{
  position:relative;z-index:1;padding:11px 8px;border:0;background:transparent;border-radius:999px;
  font:inherit;font-size:.9rem;font-weight:600;color:var(--nho-muted);cursor:pointer;transition:color .25s;
}
.nho-auth-tabs button.is-on{color:#fff}
.nho-auth-title{font-family:'Playfair Display',serif;font-size:1.75rem;margin:0 0 6px;font-weight:700;color:var(--nho-ink)}
.nho-auth-desc{color:var(--nho-muted);font-size:.92rem;margin:0 0 22px}
.nho-auth-alert{padding:11px 14px;border-radius:12px;font-size:.85rem;margin-bottom:16px}
.nho-auth-alert.ok{background:#ECFBF3;color:#1E7A4D;border:1px solid #BEE9D4}
.nho-auth-alert.err{background:#FDF0F0;color:#B03333;border:1px solid #F5C6C6}
.nho-auth-form{display:flex;flex-direction:column;gap:15px}
.nho-field{display:flex;flex-direction:column;gap:7px}
.nho-field > span{font-size:.74rem;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--nho-ink)}
.nho-field input{
  width:100%;padding:13px 15px;border:1.5px solid var(--nho-line);border-radius:13px;
  font:inherit;font-size:.94rem;background:var(--nho-soft);color:var(--nho-ink);outline:none;transition:.2s;
}
.nho-field input::placeholder{color:#B4B4B4}
.nho-field input:focus{border-color:var(--nho-accent);background:#fff;box-shadow:0 0 0 4px rgba(255,109,0,.13)}
.nho-pw{position:relative;display:block}
.nho-pw input{padding-right:70px}
.nho-pw button{
  position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:transparent;
  font:inherit;font-size:.76rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;
  color:var(--nho-accent);cursor:pointer;padding:6px 8px;border-radius:8px;
}
.nho-pw button:hover{background:rgba(255,109,0,.08)}
.nho-auth-submit{
  margin-top:8px;padding:14px;border:0;border-radius:13px;font:inherit;font-weight:700;font-size:.96rem;
  color:#fff;cursor:pointer;background:linear-gradient(135deg,var(--nho-accent),var(--nho-accent-2));
  box-shadow:0 12px 28px -12px rgba(255,109,0,.85);transition:.25s;
}
.nho-auth-submit:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 18px 34px -14px rgba(255,109,0,.95)}
.nho-auth-submit:disabled{opacity:.65;cursor:not-allowed}
.nho-auth-divider{display:flex;align-items:center;gap:12px;margin:20px 0;color:var(--nho-muted);font-size:.76rem}
.nho-auth-divider::before,.nho-auth-divider::after{content:"";flex:1;height:1px;background:var(--nho-line)}
.nho-auth-google{
  width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:13px;
  border:1.5px solid var(--nho-line);border-radius:13px;background:#fff;font:inherit;font-size:.92rem;
  font-weight:600;color:var(--nho-ink);cursor:pointer;transition:.2s;
}
.nho-auth-google:hover{border-color:var(--nho-accent);background:#FFF6EF}
.nho-auth-back{margin-top:22px;text-align:center;font-size:.84rem;color:var(--nho-muted)}
.nho-auth-back a{color:var(--nho-accent);font-weight:600;text-decoration:none}
.nho-auth-back a:hover{text-decoration:underline}
@media (max-width:980px){
  .nho-auth{grid-template-columns:1fr}
  .nho-auth-aside{padding:34px 28px;gap:26px}
  .nho-auth-aside-mid h2{font-size:1.5rem}
  .nho-auth-main{padding:28px 18px 60px}
  .nho-auth-card{padding:26px 20px;border-radius:22px}
}
`;
