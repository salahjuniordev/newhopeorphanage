import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

interface Donation {
  id: string;
  amount: number;
  currency: string;
  cause: string | null;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
}

function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) navigate({ to: "/login", replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) navigate({ to: "/login", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: d }] = await Promise.all([
        supabase.from("profiles").select("full_name, phone").eq("id", session.user.id).maybeSingle(),
        supabase.from("donations").select("id, amount, currency, cause, created_at").eq("user_id", session.user.id).order("created_at", { ascending: false }),
      ]);
      setProfile(p ?? null);
      setDonations((d as Donation[] | null) ?? []);
      setLoading(false);
    })();
  }, [session]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  if (!session) return null;
  const total = donations.reduce((acc, d) => acc + Number(d.amount), 0);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px", fontFamily: "'Onest','Inter',system-ui,sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, margin: 0, color: "#1a1208" }}>
            Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋
          </h1>
          <p style={{ margin: "6px 0 0", color: "#8a7050" }}>{session.user.email}</p>
        </div>
        <button onClick={signOut} style={{ padding: "10px 18px", borderRadius: 999, border: "1px solid #ddd3c0", background: "#fff", cursor: "pointer", fontWeight: 600 }}>Sign out</button>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 32 }}>
        <Card label="Total Donated" value={`$${total.toFixed(2)}`} accent="#f19100" />
        <Card label="Donations" value={String(donations.length)} accent="#3db07a" />
        <Card label="Member since" value={new Date(session.user.created_at).toLocaleDateString()} accent="#5a3500" />
      </section>

      <section style={{ background: "#fff", border: "1px solid #ede7da", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontFamily: "'Playfair Display',serif", color: "#1a1208" }}>Your donations</h2>
          <Link to="/donation" style={{ background: "linear-gradient(135deg,#f19100,#ffc84a)", color: "#fff", padding: "10px 18px", borderRadius: 999, textDecoration: "none", fontWeight: 600 }}>Donate again</Link>
        </div>
        {loading ? (
          <p style={{ color: "#8a7050" }}>Loading…</p>
        ) : donations.length === 0 ? (
          <p style={{ color: "#8a7050" }}>You haven’t made any donations yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#8a7050", fontSize: 13 }}>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid #ede7da" }}>Date</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid #ede7da" }}>Cause</th>
                <th style={{ padding: "10px 8px", borderBottom: "1px solid #ede7da", textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id}>
                  <td style={{ padding: "12px 8px", borderBottom: "1px solid #f5efe2" }}>{new Date(d.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "12px 8px", borderBottom: "1px solid #f5efe2" }}>{d.cause ?? "General"}</td>
                  <td style={{ padding: "12px 8px", borderBottom: "1px solid #f5efe2", textAlign: "right", fontWeight: 600 }}>{d.currency} {Number(d.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Card({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ede7da", borderRadius: 16, padding: 22 }}>
      <div style={{ color: "#8a7050", fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, color: accent, marginTop: 6 }}>{value}</div>
    </div>
  );
}
