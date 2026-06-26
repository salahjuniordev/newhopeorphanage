import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import html from "@/legacy-pages/dashboard.html?raw";

export const Route = createFileRoute("/dashboard")({
  component: () => <LegacyPage html={html} title="Dashboard — New Hope Orphanage" />,
});
