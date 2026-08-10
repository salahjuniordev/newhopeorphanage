import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import { pageHead } from "@/lib/page-head";
import html from "@/legacy-pages/team.html?raw";

export const Route = createFileRoute("/team")({
  head: () =>
    pageHead({
      path: "/team",
      title: "Notre équipe — New Hope Orphanage",
      description:
        "Rencontrez l'équipe de New Hope Orphanage : éducateurs, personnel soignant et bénévoles qui accompagnent les enfants au quotidien à Yaoundé.",
    }),
  component: () => <LegacyPage html={html} title="Team — New Hope Orphanage" />,
});
