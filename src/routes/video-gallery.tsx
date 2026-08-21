import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import { pageHead } from "@/lib/page-head";
import html from "@/legacy-pages/video-gallery.html?raw";

export const Route = createFileRoute("/video-gallery")({
  head: () =>
    pageHead({
      path: "/video-gallery",
      title: "Galerie vidéo — New Hope Orphanage au Cameroun",
      description:
        "Découvrez en vidéo la vie, les activités et les moments partagés au sein de New Hope Orphanage à Yaoundé et Douala.",
      ogDescription:
        "Découvrez la vie de New Hope Orphanage à travers nos vidéos, nos activités et les moments vécus avec les enfants.",
    }),
  component: () => <LegacyPage html={html} title="Video Gallery — New Hope Orphanage" />,
});
