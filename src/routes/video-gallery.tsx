import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import { pageHead } from "@/lib/page-head";
import html from "@/legacy-pages/video-gallery.html?raw";

export const Route = createFileRoute("/video-gallery")({
  head: () =>
    pageHead({
      path: "/video-gallery",
      title: "Galerie vidéo — New Hope Orphanage",
      description:
        "Vidéos et images du quotidien à New Hope Orphanage : repas, salles de classe, soins de santé et moments de joie partagés avec les enfants.",
    }),
  component: () => <LegacyPage html={html} title="Video Gallery — New Hope Orphanage" />,
});
