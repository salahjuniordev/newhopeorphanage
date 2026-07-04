import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { applyLang } from "./translate-dom";

export type Lang = "en" | "fr";

type Dict = Record<string, { en: string; fr: string }>;

export const NAV_DICT: Dict = {
  home: { en: "Home", fr: "Accueil" },
  about: { en: "About Us", fr: "À propos" },
  services: { en: "Services", fr: "Services" },
  servicesEducation: { en: "Education", fr: "Éducation" },
  servicesNutrition: { en: "Nutrition & Health", fr: "Nutrition & Santé" },
  servicesHealthcare: { en: "Healthcare Support", fr: "Soins de santé" },
  servicesFood: { en: "Food Support", fr: "Aide alimentaire" },
  team: { en: "Team", fr: "Équipe" },
  teamAll: { en: "Our Team", fr: "Notre équipe" },
  teamDetails: { en: "Team Details", fr: "Détails de l'équipe" },
  gallery: { en: "Video Gallery", fr: "Galerie vidéo" },
  faqs: { en: "FAQs", fr: "FAQ" },
  contact: { en: "Contact", fr: "Contact" },
  donate: { en: "Donate", fr: "Faire un don" },
  login: { en: "Login", fr: "Connexion" },
  dashboard: { en: "Dashboard", fr: "Tableau de bord" },
  needHelp: { en: "Need help!", fr: "Besoin d'aide !" },
  language: { en: "Language", fr: "Langue" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof NAV_DICT) => string;
}

const Ctx = createContext<I18nCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => NAV_DICT[k]?.en ?? String(k),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const rafRef = useRef<number | null>(null);

  // Debounced re-translation of the whole page body.
  const schedule = (l: Lang) => {
    if (typeof window === "undefined") return;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      try { applyLang(document.body, l); } catch { /* noop */ }
    });
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nho-lang") as Lang | null;
      const initial: Lang =
        stored === "en" || stored === "fr"
          ? stored
          : navigator.language?.toLowerCase().startsWith("fr")
            ? "fr"
            : "en";
      setLangState(initial);
      document.documentElement.lang = initial;
      schedule(initial);
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Observe DOM changes (route swaps, legacy HTML mounts) and re-translate.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mo = new MutationObserver(() => schedule(lang));
    mo.observe(document.body, { childList: true, subtree: true, characterData: false });
    return () => mo.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("nho-lang", l); } catch { /* noop */ }
    document.documentElement.lang = l;
    schedule(l);
  };

  const t = (key: keyof typeof NAV_DICT) => NAV_DICT[key]?.[lang] ?? NAV_DICT[key]?.en ?? String(key);
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);

