import { useEffect, useRef } from "react";
import { extractLegacy } from "@/lib/legacy-html";

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
  }
}

export function LegacyPage({ html, title }: LegacyPageProps) {
  const { styles, body } = extractLegacy(html);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  useEffect(() => {
    // After client mount, re-trigger jQuery $(document).ready handlers so
    // plugins (Swiper, SlickNav, Magnific popup, WOW, counters, parallax)
    // bind to the just-rendered DOM. function.js registers everything
    // inside $(document).ready, so calling .ready(fn) again re-runs nothing —
    // instead we dispatch DOMContentLoaded and call known plugin inits if
    // available.
    if (typeof window === "undefined") return;
    const $ = window.jQuery;
    if (!$) return;

    // Re-trigger ready queue is not safe; instead fire a custom init pulse
    // that function.js does not gate on. Most plugins are simple jQuery
    // calls on selectors — trigger common ones manually:
    try {
      // SlickNav mobile menu
      if ($.fn.slicknav) {
        $("#responsive-menu").slicknav({
          label: "",
          prependTo: ".mobile-menu",
          allowParentLinks: true,
        });
      }
      // Magnific popup for video
      if ($.fn.magnificPopup) {
        $(".popup-video, .popup-youtube, .popup-vimeo").magnificPopup({
          type: "iframe",
          mainClass: "mfp-fade",
          removalDelay: 160,
          preloader: false,
          fixedContentPos: false,
        });
        $(".popup-gallery").magnificPopup({
          type: "image",
          gallery: { enabled: true },
        });
      }
      // Counter up
      if ($.fn.counterUp) {
        $(".counter").counterUp({ delay: 10, time: 1000 });
      }
      // WOW animations
      if (typeof (window as unknown as { WOW?: new () => { init(): void } }).WOW !== "undefined") {
        new (window as unknown as { WOW: new () => { init(): void } }).WOW().init();
      }
      // Parallax
      if ($.fn.parallaxie) {
        $(".parallaxie").parallaxie({ speed: 0.5, offset: 0 });
      }
    } catch {
      // ignore — visual content still renders
    }
  }, [body]);

  return (
    <>
      {styles ? <style dangerouslySetInnerHTML={{ __html: styles }} /> : null}
      <div ref={ref} dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
