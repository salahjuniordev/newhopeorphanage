import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import { pageHead } from "@/lib/page-head";
import html from "@/legacy-pages/team.html?raw";

export const Route = createFileRoute("/team")({
  head: () =>
    pageHead({
      path: "/team",
      title: "Our Team — New Hope Orphanage in Cameroon",
      description:
        "Meet the educators, caregivers, and volunteers who support children every day at New Hope Orphanage in Yaoundé and Douala, Cameroon.",
      lang: "en",
    }),
  component: () => <LegacyPage html={html} title="Team — New Hope Orphanage" />,
});
