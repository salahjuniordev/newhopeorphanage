import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import html from "@/legacy-pages/login.html?raw";

export const Route = createFileRoute("/login")({
  component: () => <LegacyPage html={html} title="Login — New Hope Orphanage" />,
});
