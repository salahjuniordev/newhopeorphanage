import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import { pageHead } from "@/lib/page-head";
import html from "@/legacy-pages/index.html?raw";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      path: "/",
      title: "New Hope Orphanage — Offrir un avenir aux enfants au Cameroun",
      description:
        "New Hope Orphanage accompagne des enfants à Yaoundé et Douala en leur offrant un environnement sûr, de l'éducation et un avenir plein d'espoir.",
      ogTitle: "New Hope Orphanage — Un foyer, une école, un avenir",
      ogDescription:
        "Découvrez New Hope Orphanage à Yaoundé et Douala et soutenez notre mission pour offrir aux enfants un environnement sûr, de l'éducation et un avenir meilleur.",
    }),
  component: () => <LegacyPage html={html} title="New Hope Orphanage" />,
});
