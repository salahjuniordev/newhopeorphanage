import { Fragment } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
 LayoutDashboard, HandHeart, MessageSquare, Users, ShieldCheck,
 Mail, LogOut, Trash2, Plus, Copy, Check, ExternalLink, Settings2, Sparkles,
} from "lucide-react";
import {
 ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
 BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import {
 claimFirstAdmin, listAllUsers, inviteAdmin, grantRole, revokeRole,
 revokeInvitation, deleteContactMessage,
} from "@/lib/admin.functions";
import "@/components/admin.css";

export const Route = createFileRoute("/admin")({
 component: AdminApp,
});

type TabKey = "overview" | "donations" | "messages" | "users" | "invites" | "settings";

interface DonationRow {
 id: string; amount: number; currency: string; cause: string | null;
 donor_name: string; donor_email: string; message: string | null;
 created_at: string; user_id: string | null;
}
interface MessageRow {
 id: string; name: string; email: string; phone: string | null;
 subject: string | null; message: string; created_at: string;
}
interface InvitationRow {
 id: string; email: string; role: string; token: string;
 accepted_at: string | null; created_at: string; invited_by: string | null;
}
interface UserRow {
 id: string; email: string; created_at: string; last_sign_in_at: string | null;
 full_name: string | null; phone: string | null; avatar_url: string | null;
 roles: string[];
}

const PALETTE = ["#f19100", "#ffc84a", "#c97200", "#5a3500", "#2c1a00", "#ff6a3d"];

function AdminApp() {
 const navigate = useNavigate();
 const [tab, setTab] = useState<TabKey>("overview");
 const [loading, setLoading] = useState(true);
 const [checking, setChecking] = useState(true);
 const [isAdmin, setIsAdmin] = useState(false);
 const [noAdmins, setNoAdmins] = useState(false);
 const [userId, setUserId] = useState<string | null>(null);
 const [userEmail, setUserEmail] = useState<string>("");

 const [donations, setDonations] = useState<DonationRow[]>([]);
 const [messages, setMessages] = useState<MessageRow[]>([]);
 const [invitations, setInvitations] = useState<InvitationRow[]>([]);
 const [users, setUsers] = useState<UserRow[]>([]);

 const fetchAllUsers = useServerFn(listAllUsers);
 const doClaimFirstAdmin = useServerFn(claimFirstAdmin);
 const doInvite = useServerFn(inviteAdmin);
 const doGrant = useServerFn(grantRole);
 const doRevokeRole = useServerFn(revokeRole);
 const doRevokeInv = useServerFn(revokeInvitation);
 const doDeleteMsg = useServerFn(deleteContactMessage);

 // --- Auth + admin check ---
 useEffect(() => {
 let cancelled = false;
 const check = async () => {
 const { data: sess } = await supabase.auth.getSession();
 if (!sess.session) { navigate({ to: "/login", replace: true }); return; }
 if (cancelled) return;
 setUserId(sess.session.user.id);
 setUserEmail(sess.session.user.email?? "");

 const { data: roleData } = await supabase
.from("user_roles")
.select("role")
.eq("user_id", sess.session.user.id)
.eq("role", "admin")
.maybeSingle();
 if (cancelled) return;
 if (roleData) {
 setIsAdmin(true);
 } else {
 // Check if there are zero admins so we can offer bootstrap
 const { count } = await supabase
.from("user_roles").select("*", { count: "exact", head: true })
.eq("role", "admin");
 setNoAdmins((count?? 0) === 0);
 }
 setChecking(false);
 };
 check();
 return () => { cancelled = true; };
 }, [navigate]);

 // --- Data load ---
 const loadAll = async () => {
 setLoading(true);
 const [d, m, i, u] = await Promise.all([
 supabase.from("donations").select("*").order("created_at", { ascending: false }),
 supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
 supabase.from("admin_invitations").select("*").order("created_at", { ascending: false }),
 fetchAllUsers().catch(() => []),
 ]);
 setDonations((d.data as DonationRow[])?? []);
 setMessages((m.data as MessageRow[])?? []);
 setInvitations((i.data as InvitationRow[])?? []);
 setUsers((u as UserRow[])?? []);
 setLoading(false);
 };

 useEffect(() => { if (isAdmin) loadAll(); /* eslint-disable-next-line */ }, [isAdmin]);

 // --- Date range filter (default: last 30 days) ---
 const [range, setRange] = useState<{ from: string; to: string }>(() => {
 const to = new Date();
 const from = new Date(); from.setDate(from.getDate() - 30);
 return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
 });
 const setPreset = (days: number) => {
 const to = new Date();
 const from = new Date(); from.setDate(from.getDate() - days);
 setRange({ from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) });
 };

 // --- Derived stats (filtered by date range) ---
 const stats = useMemo(() => {
 const fromMs = new Date(range.from + "T00:00:00").getTime();
 const toMs = new Date(range.to + "T23:59:59").getTime();
 const inRange = donations.filter((d) => {
 const t = new Date(d.created_at).getTime();
 return t >= fromMs && t <= toMs;
 });

 const total = inRange.reduce((s, d) => s + Number(d.amount || 0), 0);
 const byDay = new Map<string, number>();
 for (const d of inRange) {
 const day = new Date(d.created_at).toISOString().slice(0, 10);
 byDay.set(day, (byDay.get(day)?? 0) + Number(d.amount || 0));
 }
 // Fill gaps for a continuous line
 const days: { date: string; amount: number }[] = [];
 for (let t = fromMs; t <= toMs; t += 86400000) {
 const iso = new Date(t).toISOString().slice(0, 10);
 days.push({ date: iso.slice(5), amount: Math.round(byDay.get(iso)?? 0) });
 }

 const byCause = new Map<string, number>();
 for (const d of inRange) {
 const c = d.cause || "General";
 byCause.set(c, (byCause.get(c)?? 0) + Number(d.amount || 0));
 }
 const causes = [...byCause.entries()].map(([name, value]) => ({ name, value: Math.round(value) }));

 const byCurrency = new Map<string, number>();
 for (const d of inRange) {
 byCurrency.set(d.currency, (byCurrency.get(d.currency)?? 0) + Number(d.amount || 0));
 }
 const currencies = [...byCurrency.entries()].map(([name, value]) => ({ name, value: Math.round(value) }));

 return {
 total, days, causes, currencies,
 donationCount: inRange.length,
 messageCount: messages.length,
 userCount: users.length,
 pendingInvites: invitations.filter((i) =>!i.accepted_at).length,
 };
 }, [donations, messages, users, invitations, range]);

 // --- Handlers ---
 const handleClaim = async () => {
 try { await doClaimFirstAdmin({}); setIsAdmin(true); setNoAdmins(false); }
 catch (e) { alert(e instanceof Error? e.message: "Failed"); }
 };
 const handleSignOut = async () => {
 await supabase.auth.signOut();
 navigate({ to: "/", replace: true });
 };

 // --- Render gates ---
 if (checking) return <FullPageState text="Verifying access…" />;
 if (!isAdmin) {
 return (
 <div className="adm-gate">
 <div className="adm-gate-card">
 <ShieldCheck size={48} />
 <h1>Admin access required</h1>
 <p>Your account ({userEmail}) does not have admin privileges.</p>
 {noAdmins? (
 <>
 <p className="adm-gate-hint">No admin has been created yet. Claim the first admin seat now.</p>
 <button className="adm-btn adm-btn-primary" onClick={handleClaim}>
 <Sparkles size={16} /> Become the first admin
 </button>
 </>
 ): (
 <p className="adm-gate-hint">Ask an existing admin to invite you.</p>
 )}
 <Link to="/" className="adm-gate-back">← Back home</Link>
 </div>
 </div>
 );
 }

 const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
 { key: "overview", label: "Overview", icon: LayoutDashboard },
 { key: "donations", label: "Donations", icon: HandHeart },
 { key: "messages", label: "Messages", icon: MessageSquare },
 { key: "users", label: "Users", icon: Users },
 { key: "invites", label: "Admin Invites", icon: Mail },
 { key: "settings", label: "Settings", icon: Settings2 },
 ];

 return (
 <div className="adm-shell">
 <aside className="adm-side">
 <div className="adm-brand">
 <div className="adm-brand-mark">NH</div>
 <div>
 <div className="adm-brand-title">New Hope</div>
 <div className="adm-brand-sub">Admin Console</div>
 </div>
 </div>

 <nav className="adm-nav">
 {tabs.map((t) => {
 const Icon = t.icon;
 return (
 <button
 key={t.key}
 className={`adm-nav-item ${tab === t.key? "is-on": ""}`}
 onClick={() => setTab(t.key)}
 >
 <Icon size={18} />
 <span>{t.label}</span>
 {t.key === "invites" && stats.pendingInvites > 0 && (
 <span className="adm-badge">{stats.pendingInvites}</span>
 )}
 </button>
 );
 })}
 </nav>

 <div className="adm-side-foot">
 <div className="adm-user">
 <div className="adm-user-avatar">{(userEmail[0] || "A").toUpperCase()}</div>
 <div className="adm-user-info">
 <div className="adm-user-name">{userEmail}</div>
 <div className="adm-user-role">Administrator</div>
 </div>
 </div>
 <Link to="/" className="adm-side-link">
 <ExternalLink size={14} /> View site
 </Link>
 <button className="adm-side-link" onClick={handleSignOut}>
 <LogOut size={14} /> Sign out
 </button>
 </div>
 </aside>

 <main className="adm-main">
 <header className="adm-topbar">
 <div>
 <h1>{tabs.find((t) => t.key === tab)?.label}</h1>
 <p className="adm-topbar-sub">Manage everything happening on your platform.</p>
 </div>
 <button className="adm-btn adm-btn-ghost" onClick={loadAll} disabled={loading}>
 {loading? "Refreshing…": "Refresh"}
 </button>
 </header>

 {tab === "overview" && <OverviewTab stats={stats} recent={donations.slice(0, 6)} range={range} setRange={setRange} setPreset={setPreset} />}
 {tab === "donations" && <DonationsTab rows={donations} />}
 {tab === "messages" && (
 <MessagesTab rows={messages} onDelete={async (id) => {
 if (!confirm("Delete this message?")) return;
 await doDeleteMsg({ data: { id } });
 setMessages((prev) => prev.filter((r) => r.id!== id));
 }} />
 )}
 {tab === "users" && (
 <UsersTab
 rows={users}
 selfId={userId?? ""}
 onGrant={async (uid, role) => {
 await doGrant({ data: { userId: uid, role } });
 await loadAll();
 }}
 onRevoke={async (uid, role) => {
 await doRevokeRole({ data: { userId: uid, role } });
 await loadAll();
 }}
 />
 )}
 {tab === "invites" && (
 <InvitesTab
 rows={invitations}
 onInvite={async (email, role) => {
 await doInvite({ data: { email, role } });
 await loadAll();
 }}
 onResend={async (email, role) => {
 await doInvite({ data: { email, role: role as "admin" | "moderator" } });
 await loadAll();
 }}
 onRevoke={async (id) => {
 await doRevokeInv({ data: { id } });
 setInvitations((prev) => prev.filter((r) => r.id!== id));
 }}
 />
 )}
 {tab === "settings" && <SettingsTab email={userEmail} />}
 </main>
 </div>
 );
}

/* -------------------- Tabs -------------------- */

function OverviewTab({ stats, recent, range, setRange, setPreset }: {
 stats: {
 total: number; donationCount: number; messageCount: number; userCount: number;
 days: { date: string; amount: number }[];
 causes: { name: string; value: number }[];
 currencies: { name: string; value: number }[];
 pendingInvites: number;
 };
 recent: DonationRow[];
 range: { from: string; to: string };
 setRange: (r: { from: string; to: string }) => void;
 setPreset: (days: number) => void;
}) {
 return (
 <div className="adm-content">
 <div className="adm-card" style={{ padding: "14px 18px" }}>
 <div className="adm-toolbar" style={{ flexWrap: "wrap", gap: 10 }}>
 <strong style={{ fontSize: 13, color: "#5a4730" }}>Date range</strong>
 <input type="date" className="adm-input" value={range.from} max={range.to}
 onChange={(e) => setRange({...range, from: e.target.value })} />
 <span style={{ color: "#8a7050" }}>→</span>
 <input type="date" className="adm-input" value={range.to} min={range.from}
 onChange={(e) => setRange({...range, to: e.target.value })} />
 <button className="adm-btn adm-btn-ghost" onClick={() => setPreset(7)}>7d</button>
 <button className="adm-btn adm-btn-ghost" onClick={() => setPreset(30)}>30d</button>
 <button className="adm-btn adm-btn-ghost" onClick={() => setPreset(90)}>90d</button>
 <button className="adm-btn adm-btn-ghost" onClick={() => setPreset(365)}>1y</button>
 </div>
 </div>
 <div className="adm-kpis">
 <Kpi label="Total Raised" value={`$${stats.total.toLocaleString()}`} tone="primary" hint={`across ${stats.donationCount} donations`} />
 <Kpi label="Donations" value={stats.donationCount.toString()} tone="ok" />
 <Kpi label="Registered Users" value={stats.userCount.toString()} tone="info" />
 <Kpi label="Contact Messages" value={stats.messageCount.toString()} tone="warn" hint={`${stats.pendingInvites} open invites`} />
 </div>

 <div className="adm-grid-2">
 <div className="adm-card">
 <div className="adm-card-head"><h3>Donations trend ({range.from} → {range.to})</h3></div>
 <div className="adm-chart">
 <ResponsiveContainer width="100%" height={280}>
 <AreaChart data={stats.days}>
 <defs>
 <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="#f19100" stopOpacity={0.55} />
 <stop offset="100%" stopColor="#f19100" stopOpacity={0.02} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#efe6d3" />
 <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8a7050" }} />
 <YAxis tick={{ fontSize: 11, fill: "#8a7050" }} />
 <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #eadfc7" }} />
 <Area type="monotone" dataKey="amount" stroke="#f19100" strokeWidth={2.5} fill="url(#grad)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="adm-card">
 <div className="adm-card-head"><h3>By cause</h3></div>
 <div className="adm-chart">
 <ResponsiveContainer width="100%" height={280}>
 <PieChart>
 <Pie data={stats.causes} dataKey="value" nameKey="name" outerRadius={95} innerRadius={55} paddingAngle={2}>
 {stats.causes.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
 </Pie>
 <Tooltip />
 <Legend wrapperStyle={{ fontSize: 12 }} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 <div className="adm-grid-2">
 <div className="adm-card">
 <div className="adm-card-head"><h3>By currency</h3></div>
 <div className="adm-chart">
 <ResponsiveContainer width="100%" height={220}>
 <BarChart data={stats.currencies}>
 <CartesianGrid strokeDasharray="3 3" stroke="#efe6d3" />
 <XAxis dataKey="name" tick={{ fontSize: 11 }} />
 <YAxis tick={{ fontSize: 11 }} />
 <Tooltip />
 <Bar dataKey="value" fill="#c97200" radius={[8, 8, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="adm-card">
 <div className="adm-card-head"><h3>Recent donations</h3></div>
 <div className="adm-list">
 {recent.length === 0 && <div className="adm-empty">No donations yet.</div>}
 {recent.map((d) => (
 <div key={d.id} className="adm-list-row">
 <div>
 <div className="adm-list-primary">{d.donor_name}</div>
 <div className="adm-list-secondary">{d.cause || "General"} · {new Date(d.created_at).toLocaleDateString()}</div>
 </div>
 <div className="adm-list-amount">{d.currency} {Number(d.amount).toLocaleString()}</div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}

function DonationsTab({ rows }: { rows: DonationRow[] }) {
 const [q, setQ] = useState("");
 const filtered = rows.filter((r) =>
!q || [r.donor_name, r.donor_email, r.cause, r.message].join(" ").toLowerCase().includes(q.toLowerCase())
 );
 const csv = () => {
 const header = "Date,Donor,Email,Amount,Currency,Cause,Message";
 const body = filtered.map((r) => [
 new Date(r.created_at).toISOString(), esc(r.donor_name), esc(r.donor_email),
 r.amount, r.currency, esc(r.cause?? ""), esc(r.message?? ""),
 ].join(",")).join("\n");
 downloadCsv("donations.csv", `${header}\n${body}`);
 };
 return (
 <div className="adm-content">
 <div className="adm-card">
 <div className="adm-toolbar">
 <input className="adm-input" placeholder="Search donations…" value={q} onChange={(e) => setQ(e.target.value)} />
 <button className="adm-btn adm-btn-ghost" onClick={csv}>Export CSV</button>
 </div>
 <div className="adm-table-wrap">
 <table className="adm-table">
 <thead><tr><th>Date</th><th>Donor</th><th>Email</th><th>Amount</th><th>Cause</th><th>Message</th></tr></thead>
 <tbody>
 {filtered.map((r) => (
 <tr key={r.id}>
 <td>{new Date(r.created_at).toLocaleString()}</td>
 <td>{r.donor_name}</td>
 <td>{r.donor_email}</td>
 <td className="adm-t-amount">{r.currency} {Number(r.amount).toLocaleString()}</td>
 <td>{r.cause || "—"}</td>
 <td className="adm-t-msg">{r.message || "—"}</td>
 </tr>
 ))}
 {filtered.length === 0 && <tr><td colSpan={6} className="adm-empty">No matching donations.</td></tr>}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}

function MessagesTab({ rows, onDelete }: { rows: MessageRow[]; onDelete: (id: string) => Promise<void> }) {
 const [open, setOpen] = useState<string | null>(null);
 return (
 <div className="adm-content">
 <div className="adm-card">
 <div className="adm-table-wrap">
 <table className="adm-table">
 <thead><tr><th>Date</th><th>From</th><th>Subject</th><th>Preview</th><th></th></tr></thead>
 <tbody>
 {rows.map((r) => (
 <Fragment key={r.id}>
 <tr>
 <td>{new Date(r.created_at).toLocaleDateString()}</td>
 <td>
 <div className="adm-list-primary">{r.name}</div>
 <div className="adm-list-secondary">{r.email}</div>
 </td>
 <td>{r.subject || "—"}</td>
 <td className="adm-t-msg">{r.message.slice(0, 80)}{r.message.length > 80? "…": ""}</td>
 <td className="adm-t-actions">
 <button className="adm-icon-btn" onClick={() => setOpen(open === r.id? null: r.id)}>
 {open === r.id? "Hide": "View"}
 </button>
 <button className="adm-icon-btn adm-danger" onClick={() => onDelete(r.id)}>
 <Trash2 size={14} />
 </button>
 </td>
 </tr>
 {open === r.id && (
 <tr className="adm-expand">
 <td colSpan={5}>
 <div className="adm-msg-full">
 <strong>{r.subject || "(no subject)"}</strong>
 <p>{r.message}</p>
 {r.phone && <p className="adm-list-secondary"> {r.phone}</p>}
 <a href={`mailto:${r.email}`} className="adm-btn adm-btn-primary adm-btn-sm">
 <Mail size={14} /> Reply
 </a>
 </div>
 </td>
 </tr>
 )}
 </Fragment>
 ))}
 {rows.length === 0 && <tr><td colSpan={5} className="adm-empty">No messages yet.</td></tr>}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}

function UsersTab({ rows, selfId, onGrant, onRevoke }: {
 rows: UserRow[]; selfId: string;
 onGrant: (uid: string, role: "admin" | "moderator" | "user") => Promise<void>;
 onRevoke: (uid: string, role: "admin" | "moderator" | "user") => Promise<void>;
}) {
 const [q, setQ] = useState("");
 const filtered = rows.filter((u) =>
!q || [u.email, u.full_name, u.phone].join(" ").toLowerCase().includes(q.toLowerCase())
 );
 return (
 <div className="adm-content">
 <div className="adm-card">
 <div className="adm-toolbar">
 <input className="adm-input" placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} />
 <div className="adm-toolbar-hint">{rows.length} total</div>
 </div>
 <div className="adm-table-wrap">
 <table className="adm-table">
 <thead><tr><th>User</th><th>Joined</th><th>Last sign-in</th><th>Roles</th><th></th></tr></thead>
 <tbody>
 {filtered.map((u) => {
 const isAdminU = u.roles.includes("admin");
 const isMod = u.roles.includes("moderator");
 return (
 <tr key={u.id}>
 <td>
 <div className="adm-user-cell">
 <div className="adm-user-avatar sm">{(u.email[0] || "?").toUpperCase()}</div>
 <div>
 <div className="adm-list-primary">{u.full_name || "—"}</div>
 <div className="adm-list-secondary">{u.email}</div>
 </div>
 </div>
 </td>
 <td>{new Date(u.created_at).toLocaleDateString()}</td>
 <td>{u.last_sign_in_at? new Date(u.last_sign_in_at).toLocaleDateString(): "—"}</td>
 <td>
 <div className="adm-chips">
 {u.roles.length === 0 && <span className="adm-chip">user</span>}
 {u.roles.map((r) => (
 <span key={r} className={`adm-chip ${r === "admin"? "is-admin": r === "moderator"? "is-mod": ""}`}>{r}</span>
 ))}
 </div>
 </td>
 <td className="adm-t-actions">
 {!isAdminU? (
 <button className="adm-icon-btn" onClick={() => onGrant(u.id, "admin")}>Make admin</button>
 ): (
 <button
 className="adm-icon-btn adm-danger"
 disabled={u.id === selfId}
 title={u.id === selfId? "You cannot remove your own admin role": ""}
 onClick={() => onRevoke(u.id, "admin")}
 >Remove admin</button>
 )}
 {!isMod? (
 <button className="adm-icon-btn" onClick={() => onGrant(u.id, "moderator")}>+ Mod</button>
 ): (
 <button className="adm-icon-btn adm-danger" onClick={() => onRevoke(u.id, "moderator")}>− Mod</button>
 )}
 </td>
 </tr>
 );
 })}
 {filtered.length === 0 && <tr><td colSpan={5} className="adm-empty">No users found.</td></tr>}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}

const INVITE_EXPIRY_DAYS = 14;
type InviteStatus = "accepted" | "expired" | "pending";
function inviteStatus(r: InvitationRow): InviteStatus {
 if (r.accepted_at) return "accepted";
 const ageDays = (Date.now() - new Date(r.created_at).getTime()) / 86400000;
 return ageDays > INVITE_EXPIRY_DAYS? "expired": "pending";
}

function InvitesTab({ rows, onInvite, onResend, onRevoke }: {
 rows: InvitationRow[];
 onInvite: (email: string, role: "admin" | "moderator") => Promise<void>;
 onResend: (email: string, role: "admin" | "moderator") => Promise<void>;
 onRevoke: (id: string) => Promise<void>;
}) {
 const [email, setEmail] = useState("");
 const [role, setRole] = useState<"admin" | "moderator">("admin");
 const [busy, setBusy] = useState(false);
 const [copied, setCopied] = useState<string | null>(null);
 const [err, setErr] = useState<string | null>(null);
 const [resending, setResending] = useState<string | null>(null);
 const [flash, setFlash] = useState<string | null>(null);
 const [filter, setFilter] = useState<"all" | InviteStatus>("all");

 const submit = async (e: React.FormEvent) => {
 e.preventDefault();
 setErr(null); setBusy(true);
 try { await onInvite(email, role); setEmail(""); setFlash(`Invitation sent to ${email}`); setTimeout(() => setFlash(null), 3500); }
 catch (e) { setErr(e instanceof Error? e.message: "Failed"); }
 finally { setBusy(false); }
 };

 const copyLink = (token: string) => {
 const link = `${window.location.origin}/login?invite=${token}`;
 navigator.clipboard.writeText(link);
 setCopied(token);
 setTimeout(() => setCopied(null), 1600);
 };

 const doResend = async (r: InvitationRow) => {
 setResending(r.id);
 try {
 await onResend(r.email, r.role as "admin" | "moderator");
 setFlash(`Invitation re-sent to ${r.email}`);
 setTimeout(() => setFlash(null), 3500);
 } catch (e) {
 setErr(e instanceof Error? e.message: "Resend failed");
 } finally {
 setResending(null);
 }
 };

 const counts = useMemo(() => {
 const c = { all: rows.length, pending: 0, accepted: 0, expired: 0 };
 for (const r of rows) c[inviteStatus(r)]++;
 return c;
 }, [rows]);

 const visible = filter === "all"? rows: rows.filter((r) => inviteStatus(r) === filter);

 return (
 <div className="adm-content">
 <div className="adm-card">
 <div className="adm-card-head"><h3>Invite an administrator</h3></div>
 <form onSubmit={submit} className="adm-invite-form">
 <input className="adm-input" type="email" required placeholder="person@example.com"
 value={email} onChange={(e) => setEmail(e.target.value)} />
 <select className="adm-input" value={role} onChange={(e) => setRole(e.target.value as "admin" | "moderator")}>
 <option value="admin">Admin</option>
 <option value="moderator">Moderator</option>
 </select>
 <button className="adm-btn adm-btn-primary" disabled={busy}>
 <Plus size={16} /> {busy? "Sending…": "Send invitation"}
 </button>
 </form>
 {err && <div className="adm-alert adm-danger">{err}</div>}
 {flash && <div className="adm-alert" style={{ background: "#e8f8f0", color: "#1e7a4d", border: "1px solid #b2e4cc", padding: 10, borderRadius: 10, marginTop: 10 }}>{flash}</div>}
 <p className="adm-hint">
 Invitations expire after {INVITE_EXPIRY_DAYS} days. When the invitee signs up with this email, they receive the role automatically.
 </p>
 </div>

 <div className="adm-card">
 <div className="adm-card-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
 <h3>All invitations</h3>
 <div className="adm-toolbar" style={{ gap: 6 }}>
 {(["all", "pending", "accepted", "expired"] as const).map((s) => (
 <button key={s} className={`adm-btn adm-btn-ghost ${filter === s? "is-on": ""}`}
 style={filter === s? { background: "#f19100", color: "#fff", borderColor: "#f19100" }: undefined}
 onClick={() => setFilter(s)}>
 {s[0].toUpperCase() + s.slice(1)} ({counts[s]})
 </button>
 ))}
 </div>
 </div>
 <div className="adm-table-wrap">
 <table className="adm-table">
 <thead><tr><th>Email</th><th>Role</th><th>Status</th><th>Sent</th><th></th></tr></thead>
 <tbody>
 {visible.map((r) => {
 const status = inviteStatus(r);
 return (
 <tr key={r.id}>
 <td>{r.email}</td>
 <td><span className={`adm-chip ${r.role === "admin"? "is-admin": "is-mod"}`}>{r.role}</span></td>
 <td>
 {status === "accepted" && <span className="adm-chip is-ok"> Accepted {r.accepted_at? `· ${new Date(r.accepted_at).toLocaleDateString()}`: ""}</span>}
 {status === "pending" && <span className="adm-chip is-warn">⏳ Pending</span>}
 {status === "expired" && <span className="adm-chip adm-danger" style={{ background: "#fdecec", color: "#b03333" }}>⏱ Expired</span>}
 </td>
 <td>{new Date(r.created_at).toLocaleDateString()}</td>
 <td className="adm-t-actions">
 {status!== "accepted" && (
 <button className="adm-icon-btn" disabled={resending === r.id} onClick={() => doResend(r)}>
 <Mail size={14} /> {resending === r.id? "Sending…": "Resend"}
 </button>
 )}
 <button className="adm-icon-btn" onClick={() => copyLink(r.token)}>
 {copied === r.token? <><Check size={14} /> Copied</>: <><Copy size={14} /> Copy link</>}
 </button>
 {status!== "accepted" && (
 <button className="adm-icon-btn adm-danger" title="Revoke" onClick={() => onRevoke(r.id)}>
 <Trash2 size={14} />
 </button>
 )}
 </td>
 </tr>
 );
 })}
 {visible.length === 0 && <tr><td colSpan={5} className="adm-empty">No invitations in this view.</td></tr>}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}

function SettingsTab({ email }: { email: string }) {
 return (
 <div className="adm-content">
 <div className="adm-card">
 <div className="adm-card-head"><h3>Account</h3></div>
 <div className="adm-kv">
 <div><span>Email</span><strong>{email}</strong></div>
 <div><span>Role</span><strong>Administrator</strong></div>
 </div>
 </div>
 <div className="adm-card">
 <div className="adm-card-head"><h3>Website</h3></div>
 <div className="adm-quick-links">
 <Link to="/" className="adm-quick"><LayoutDashboard size={18} /> Home page</Link>
 <Link to="/donation" className="adm-quick"><HandHeart size={18} /> Donation page</Link>
 <Link to="/contact" className="adm-quick"><MessageSquare size={18} /> Contact page</Link>
 <Link to="/team" className="adm-quick"><Users size={18} /> Team page</Link>
 </div>
 </div>
 </div>
 );
}

/* -------------------- Bits -------------------- */

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone: "primary" | "ok" | "info" | "warn" }) {
 return (
 <div className={`adm-kpi tone-${tone}`}>
 <div className="adm-kpi-label">{label}</div>
 <div className="adm-kpi-value">{value}</div>
 {hint && <div className="adm-kpi-hint">{hint}</div>}
 </div>
 );
}

function FullPageState({ text }: { text: string }) {
 return <div className="adm-full-state"><div className="adm-spinner" />{text}</div>;
}

function esc(s: string) { return `"${s.replace(/"/g, '""')}"`; }
function downloadCsv(name: string, data: string) {
 const blob = new Blob([data], { type: "text/csv" });
 const a = document.createElement("a");
 a.href = URL.createObjectURL(blob); a.download = name; a.click();
 URL.revokeObjectURL(a.href);
}
