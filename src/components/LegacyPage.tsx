import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { extractLegacy } from "@/lib/legacy-html";
import { supabase } from "@/integrations/supabase/client";

interface LegacyPageProps {
  html: string;
  title?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jQuery?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Swiper?: any;
  }
}

// Inline placeholder used when an image/video asset fails to load. Preserves
// layout (fills its container) and shows the broken filename so we know what's
// missing without breaking the surrounding design.
const PLACEHOLDER_STYLE = `
.preloader{display:none !important}

.nho-asset-fallback{
  display:flex;align-items:center;justify-content:center;text-align:center;
  width:100%;height:100%;min-height:160px;
  background:linear-gradient(135deg,#fdecd4 0%,#f7c873 100%);
  color:#5a3a13;font-family:'Onest',system-ui,sans-serif;font-weight:600;
  font-size:13px;padding:12px;border-radius:inherit;line-height:1.4;
  word-break:break-word;
}
.nho-asset-fallback small{display:block;opacity:.7;font-weight:500;margin-top:4px}
/* Active nav link */
.main-menu .navbar-nav > li.nho-active > .nav-link,
.slicknav_nav > li.nho-active > a{
  color:#f7941e !important;
}
/* Make sure logo image always has a reserved box so missing logo still
   keeps header layout */
.navbar-brand img{max-height:60px;width:auto}
.nho-form-toast{padding:12px 14px;border-radius:10px;margin-bottom:14px;font-size:14px;font-weight:500}
.nho-form-toast--ok{background:#e8f8f0;color:#1e7a4d;border:1px solid #b2e4cc}
.nho-form-toast--err{background:#fdf0f0;color:#b03333;border:1px solid #f5c6c6}
`;

// Map route pathname → the menu link target it should activate.
function activeHrefFor(pathname: string): string | null {
  if (pathname === "/") return "/";
  // Trim trailing slash
  const p = pathname.replace(/\/$/, "");
  return p || "/";
}

export function LegacyPage({ html, title }: LegacyPageProps) {
  const { styles, body } = extractLegacy(html);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  // After mount: highlight active nav link, wire fallbacks, init plugins.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = ref.current;
    if (!root) return;

    // ---- Active nav link state ----
    const active = activeHrefFor(pathname);
    if (active) {
      root.querySelectorAll<HTMLAnchorElement>(".main-menu a.nav-link").forEach((a) => {
        const href = a.getAttribute("href");
        const li = a.closest("li");
        if (!li) return;
        li.classList.toggle("nho-active", href === active);
      });
    }

    // ---- Asset fallback: broken images & videos ----
    const onError = (e: Event) => {
      const t = e.target as HTMLElement;
      if (!t) return;
      if (t.tagName === "IMG") {
        const img = t as HTMLImageElement;
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = "1";
        const label = img.getAttribute("alt") || img.getAttribute("src")?.split("/").pop() || "Image";
        const w = img.width || img.clientWidth;
        const h = img.height || img.clientHeight;
        const div = document.createElement("div");
        div.className = "nho-asset-fallback";
        if (w) div.style.minWidth = `${w}px`;
        if (h) div.style.minHeight = `${h}px`;
        div.innerHTML = `<div>${label}<small>image unavailable</small></div>`;
        img.replaceWith(div);
      } else if (t.tagName === "VIDEO" || t.tagName === "SOURCE") {
        const vid = (t.tagName === "SOURCE" ? t.parentElement : t) as HTMLVideoElement | null;
        if (!vid || vid.dataset.fallbackApplied) return;
        vid.dataset.fallbackApplied = "1";
        const div = document.createElement("div");
        div.className = "nho-asset-fallback";
        div.style.minHeight = "240px";
        div.innerHTML = `<div>Video<small>unavailable</small></div>`;
        vid.replaceWith(div);
      }
    };
    root.addEventListener("error", onError, true);

    // ---- jQuery plugins ----
    const $ = window.jQuery;
    if (!$) return () => root.removeEventListener("error", onError, true);

    try {
      // SlickNav mobile menu — clones #menu into .responsive-menu
      if ($.fn.slicknav && $("#menu", root).length && !$(".slicknav_menu", root).length) {
        $("#menu", root).slicknav({
          label: "",
          prependTo: $(".responsive-menu", root)[0] ? ".responsive-menu" : "body",
          allowParentLinks: true,
        });
      }

      // Magnific popup for videos (handles youtube + mp4 via iframe)
      if ($.fn.magnificPopup) {
        $(".popup-video, .popup-youtube, .popup-vimeo", root).magnificPopup({
          disableOn: 0,
          type: "iframe",
          mainClass: "mfp-fade",
          removalDelay: 160,
          preloader: false,
          fixedContentPos: false,
          callbacks: {
            // Pause/cleanup any media element when the popup closes
            close: function () {
              document.querySelectorAll("video").forEach((v) => {
                try {
                  v.pause();
                } catch {
                  /* noop */
                }
              });
            },
          },
          iframe: {
            patterns: {
              // Allow plain .mp4 / .webm to load in the iframe
              mp4: {
                index: ".mp4",
                src: "%id%",
              },
              webm: {
                index: ".webm",
                src: "%id%",
              },
            },
          },
        });
        $(".popup-gallery, .gallery-items", root).magnificPopup({
          delegate: "a",
          type: "image",
          gallery: { enabled: true },
        });
      }

      // Swiper sliders
      const SwiperCtor = window.Swiper;
      if (SwiperCtor) {
        root.querySelectorAll(".hero-slider-layout .swiper").forEach((el) => {
          new SwiperCtor(el as HTMLElement, {
            slidesPerView: 1,
            speed: 1000,
            loop: true,
            autoplay: { delay: 4000 },
            pagination: { el: ".hero-pagination", clickable: true },
          });
        });
        root.querySelectorAll(".testimonial-slider .swiper").forEach((el) => {
          new SwiperCtor(el as HTMLElement, {
            slidesPerView: 1,
            speed: 1000,
            spaceBetween: 30,
            loop: true,
            autoplay: { delay: 5000 },
            pagination: { el: ".testimonial-pagination", clickable: true },
            navigation: {
              nextEl: ".testimonial-button-next",
              prevEl: ".testimonial-button-prev",
            },
          });
        });
        root.querySelectorAll(".donar-company-slider .swiper").forEach((el) => {
          new SwiperCtor(el as HTMLElement, {
            slidesPerView: 2,
            speed: 2000,
            spaceBetween: 50,
            loop: true,
            autoplay: { delay: 5000 },
            breakpoints: { 768: { slidesPerView: 3 }, 991: { slidesPerView: 3 } },
          });
        });
      }

      if ($.fn.counterUp) $(".counter", root).counterUp({ delay: 10, time: 1000 });
      if ($.fn.parallaxie) $(".parallaxie", root).parallaxie({ speed: 0.5, offset: 0 });
      const WOW = (window as unknown as { WOW?: new () => { init(): void } }).WOW;
      if (WOW) new WOW().init();
    } catch (err) {
      console.warn("[LegacyPage] plugin init failed", err);
    }

    // ---- Wire contact + donation forms to Lovable Cloud ----
    const onSubmit = async (ev: Event) => {
      const form = ev.target as HTMLFormElement;
      if (!form || form.tagName !== "FORM") return;
      const isContact = !!form.closest(".contact-form-area, .contact-form, #contact-form");
      const isDonation = !!form.closest(".donation-form-area, .donation-form, #donation-form");
      if (!isContact && !isDonation) return;
      ev.preventDefault();
      const fd = new FormData(form);
      const get = (...keys: string[]) => {
        for (const k of keys) {
          const v = fd.get(k);
          if (v != null && String(v).trim()) return String(v).trim();
        }
        return "";
      };
      const btn = form.querySelector<HTMLButtonElement>('button[type="submit"], input[type="submit"]');
      const origLabel = btn?.innerText;
      if (btn) { btn.disabled = true; if ("innerText" in btn) btn.innerText = "Sending…"; }
      try {
        if (isContact) {
          const { error } = await supabase.from("contact_messages").insert({
            name: get("name", "fname", "full_name", "your-name"),
            email: get("email", "your-email"),
            phone: get("phone", "tel"),
            subject: get("subject", "your-subject"),
            message: get("message", "msg", "your-message") || " ",
          });
          if (error) throw error;
        } else {
          const amountRaw = get("amount", "donation-amount", "donate-amount") || "0";
          const amount = Number(amountRaw.replace(/[^\d.]/g, "")) || 0;
          if (!amount) throw new Error("Please enter a donation amount.");
          const { data: { user } } = await supabase.auth.getUser();
          const { error } = await supabase.from("donations").insert({
            user_id: user?.id ?? null,
            donor_name: get("name", "fname", "full_name") || user?.email || "Anonymous",
            donor_email: get("email") || user?.email || "anonymous@example.com",
            amount,
            currency: get("currency") || "USD",
            cause: get("cause", "category"),
            message: get("message"),
          });
          if (error) throw error;
        }
        form.reset();
        const ok = document.createElement("div");
        ok.className = "nho-form-toast nho-form-toast--ok";
        ok.textContent = isContact ? "Message sent — thank you!" : "Thank you for your donation!";
        form.prepend(ok);
        setTimeout(() => ok.remove(), 5000);
      } catch (err) {
        const msg = document.createElement("div");
        msg.className = "nho-form-toast nho-form-toast--err";
        msg.textContent = err instanceof Error ? err.message : "Submission failed.";
        form.prepend(msg);
        setTimeout(() => msg.remove(), 5000);
      } finally {
        if (btn) { btn.disabled = false; if (origLabel) btn.innerText = origLabel; }
      }
    };
    root.addEventListener("submit", onSubmit);

    return () => {
      root.removeEventListener("error", onError, true);
      root.removeEventListener("submit", onSubmit);
    };
  }, [body, pathname]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PLACEHOLDER_STYLE + (styles || "") }} />
      <div ref={ref} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
