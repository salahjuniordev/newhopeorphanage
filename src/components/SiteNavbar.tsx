import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useI18n, type Lang } from "@/lib/i18n";

const SERVICES = [
  { key: "servicesEducation" as const, hash: "#Services" },
  { key: "servicesNutrition" as const, hash: "#Services" },
  { key: "servicesHealthcare" as const, hash: "#Healthcare access" },
  { key: "servicesFood" as const, hash: "#Services" },
];

export function SiteNavbar() {
  const { t, lang, setLang } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));
  const homeHash = (hash: string) => (pathname === "/" ? hash : `/${hash}`);

  return (
    <header className={`nho-nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="nho-nav-inner">
        <Link to="/" className="nho-brand" aria-label="New Hope Orphanage">
          <img src="/legacy/images/new%20hope%20orphanage.svg" alt="New Hope Orphanage" />
        </Link>

        <nav className={`nho-links ${open ? "is-open" : ""}`} aria-label="Primary">
          <Link to="/" className={`nho-link ${isActive("/") && pathname === "/" ? "is-active" : ""}`}>
            {t("home")}
          </Link>
          <a href={homeHash("#about-us")} className="nho-link">{t("about")}</a>

          <div className="nho-dropdown">
            <button className="nho-link nho-has-caret" type="button" aria-haspopup="true">
              {t("services")}
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <ul className="nho-menu">
              {SERVICES.map((s) => (
                <li key={s.key}>
                  <a href={homeHash(s.hash)}>{t(s.key)}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="nho-dropdown">
            <button className="nho-link nho-has-caret" type="button" aria-haspopup="true">
              {t("team")}
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <ul className="nho-menu">
              <li><Link to="/team">{t("teamAll")}</Link></li>
              <li><Link to="/team-single">{t("teamDetails")}</Link></li>
            </ul>
          </div>

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
