import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import { pageHead } from "@/lib/page-head";
import html from "@/legacy-pages/index.html?raw";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      path: "/",
      title: "New Hope Orphanage — Offrir un avenir aux enfants de Yaoundé",
      description:
        "New Hope Orphanage accueille, nourrit, soigne et scolarise des enfants orphelins à Yaoundé, au Cameroun. Découvrez nos actions et soutenez-les par un don.",
      ogTitle: "New Hope Orphanage — Un foyer, une école, un avenir",
      ogDescription:
        "Chaque don finance les repas, les soins et la scolarité des enfants accueillis par New Hope Orphanage à Yaoundé.",
    }),
  component: () => <LegacyPage html={html} title="New Hope Orphanage" />,
});
