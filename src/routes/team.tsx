import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import html from "@/legacy-pages/team.html?raw";

export const Route = createFileRoute("/team")({
  component: () => <LegacyPage html={html} title="Team — New Hope Orphanage" />,
});
