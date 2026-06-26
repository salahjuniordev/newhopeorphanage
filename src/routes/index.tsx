import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import html from "@/legacy-pages/index.html?raw";

export const Route = createFileRoute("/")({
  component: () => <LegacyPage html={html} title="New Hope Orphanage" />,
});
