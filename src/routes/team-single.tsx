import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import { pageHead } from "@/lib/page-head";
import html from "@/legacy-pages/team-single.html?raw";

export const Route = createFileRoute("/team-single")({
  head: () =>
    pageHead({
      path: "/team-single",
      title: "Membre de l'équipe — New Hope Orphanage",
      description:
        "Portrait d'un membre de l'équipe de New Hope Orphanage : son parcours, son rôle auprès des enfants et son engagement à Yaoundé.",
      ogType: "profile",
    }),
  component: () => <LegacyPage html={html} title="Team Member — New Hope Orphanage" />,
});
