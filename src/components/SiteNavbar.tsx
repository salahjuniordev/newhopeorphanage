import { useEffect, useRef, useState, useCallback, type KeyboardEvent } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useI18n, type Lang } from "@/lib/i18n";
// Served from /public so it resolves on every host (Lovable, Vercel, custom domains).
const LOGO_SRC = "/nho-logo.webp";


// Sections on the home page that legacy markup uses as anchor ids.
const SERVICES: { key: "servicesEducation" | "servicesNutrition" | "servicesHealthcare" | "servicesFood"; hash: string }[] = [
  { key: "servicesEducation", hash: "#our-services" },
  { key: "servicesHealthcare", hash: "#our-services" },
  { key: "servicesNutrition", hash: "#our-services" },
  { key: "servicesFood", hash: "#our-services" },
];

// Smooth scroll respecting sticky navbar height.
function smoothScrollTo(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id) || document.querySelector<HTMLElement>(`[name="${id}"]`);
  if (!el) return;
  const navH = parseInt(getComputedStyle(document.body).getPropertyValue("--nho-nav-h")) || 76;
  const y = el.getBoundingClientRect().top + window.scrollY - navH - 8;
  window.scrollTo({ top: y, behavior: "smooth" });
}

export function SiteNavbar() {
  const { t, lang, setLang } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change.
  useEffect(() => setOpen(false), [pathname]);

  // Smooth-scroll to hash after route load (e.g. clicking Services link from /contact navigates to / then scrolls).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) {
      // Wait one frame so legacy content is in the DOM.
      requestAnimationFrame(() => smoothScrollTo(window.location.hash));
    }
  }, [pathname]);

  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  // Handle navigation to a hash on the home page. If already on home → smooth scroll
  // without touching layout. Otherwise navigate to "/" and scroll on landing.
  const goToHomeHash = useCallback(
    (hash: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      setOpen(false);
      if (pathname === "/") {
        history.replaceState(null, "", hash);
        smoothScrollTo(hash);
      } else {
        navigate({ to: "/", hash: hash.replace(/^#/, "") });
      }
    },
    [pathname, navigate],
  );

  return (
    <header className={`nho-nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="nho-nav-inner">
        <Link to="/" className="nho-brand" aria-label="New Hope Orphanage">
          <img src={LOGO_SRC} alt="New Hope Orphanage" width={80} height={80} fetchPriority="high" decoding="async" />
        </Link>

        <nav className={`nho-links ${open ? "is-open" : ""}`} aria-label="Primary">
          <Link to="/" className={`nho-link ${pathname === "/" ? "is-active" : ""}`}>{t("home")}</Link>
          <Link to="/about-us" className={`nho-link ${isActive("/about-us") ? "is-active" : ""}`}>{t("about")}</Link>

          <Dropdown label={t("services")}>
            {SERVICES.map((s) => (
              <li key={s.key} role="none">
                <a role="menuitem" href={`/${s.hash}`} onClick={goToHomeHash(s.hash)}>{t(s.key)}</a>
              </li>
            ))}
          </Dropdown>

          <Dropdown label={t("team")}>
            <li role="none"><Link role="menuitem" to="/team">{t("teamAll")}</Link></li>
            <li role="none"><Link role="menuitem" to="/team-single">{t("teamDetails")}</Link></li>
          </Dropdown>

          <Link to="/video-gallery" className={`nho-link ${isActive("/video-gallery") ? "is-active" : ""}`}>{t("gallery")}</Link>
          <Link to="/faqs" className={`nho-link ${isActive("/faqs") ? "is-active" : ""}`}>{t("faqs")}</Link>
          <Link to="/contact" className={`nho-link ${isActive("/contact") ? "is-active" : ""}`}>{t("contact")}</Link>
          <Link to="/dashboard" className={`nho-link ${isActive("/dashboard") ? "is-active" : ""}`}>{t("dashboard")}</Link>
        </nav>

        <div className="nho-actions">
          <LangSwitch lang={lang} setLang={setLang} />
          <Link to="/login" className="nho-btn-ghost">{t("login")}</Link>
          <Link to="/donation" className="nho-btn-cta">{t("donate")}</Link>
          <button
            type="button"
            className={`nho-burger ${open ? "is-open" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}

function Dropdown({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close on outside click / escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onMenuKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const items = Array.from(ref.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]') ?? []);
    if (items.length === 0) return;
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const onBtnKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => {
        ref.current?.querySelector<HTMLAnchorElement>('[role="menuitem"]')?.focus();
      });
    }
  };

  return (
    <div
      ref={ref}
      className="nho-dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={btnRef}
        type="button"
        className="nho-link nho-has-caret"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onBtnKeyDown}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul
        className={`nho-menu ${open ? "is-open" : ""}`}
        role="menu"
        aria-hidden={!open}
        onKeyDown={onMenuKeyDown}
      >
        {children}
      </ul>
    </div>
  );
}

function LangSwitch({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="nho-lang" role="group" aria-label="Language">
      <button
        type="button"
        className={lang === "en" ? "is-on" : ""}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
      >EN</button>
      <span className="nho-lang-sep" aria-hidden="true" />
      <button
        type="button"
        className={lang === "fr" ? "is-on" : ""}
        onClick={() => setLang("fr")}
        aria-pressed={lang === "fr"}
      >FR</button>
    </div>
  );
}
