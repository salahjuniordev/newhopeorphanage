import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Heart, PlayCircle, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import "./bottom-nav.css";

const TABS = [
  { to: "/", label: "Home", Icon: Home, match: (p: string) => p === "/" },
  { to: "/donation", label: "Donate", Icon: Heart, match: (p: string) => p.startsWith("/donation") },
  { to: "/video-gallery", label: "Gallery", Icon: PlayCircle, match: (p: string) => p.startsWith("/video-gallery") },
  { to: "/contact", label: "Contact", Icon: Mail, match: (p: string) => p.startsWith("/contact") },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => mounted && setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const accountTo = signedIn ? "/dashboard" : "/login";
  const accountActive = pathname.startsWith("/dashboard") || pathname.startsWith("/login");

  return (
    <nav className="nho-bottom-nav" aria-label="Quick navigation">
      {TABS.map(({ to, label, Icon, match }) => {
        const active = match(pathname);
        return (
          <Link key={to} to={to} className={`nho-bn-item ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined}>
            <span className="nho-bn-icon"><Icon size={22} strokeWidth={2} /></span>
            <span className="nho-bn-label">{label}</span>
          </Link>
        );
      })}
      <Link to={accountTo} className={`nho-bn-item ${accountActive ? "is-active" : ""}`} aria-current={accountActive ? "page" : undefined}>
        <span className="nho-bn-icon"><User size={22} strokeWidth={2} /></span>
        <span className="nho-bn-label">{signedIn ? "Account" : "Sign In"}</span>
      </Link>
    </nav>
  );
}
