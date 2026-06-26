import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import html from "@/legacy-pages/contact.html?raw";

export const Route = createFileRoute("/contact")({
  component: () => <LegacyPage html={html} title="Contact — New Hope Orphanage" />,
});
