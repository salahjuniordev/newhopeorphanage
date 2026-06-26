import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import html from "@/legacy-pages/team-single.html?raw";

export const Route = createFileRoute("/team-single")({
  component: () => <LegacyPage html={html} title="Team Member — New Hope Orphanage" />,
});
