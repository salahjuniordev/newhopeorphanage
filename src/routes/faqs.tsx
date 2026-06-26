import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import html from "@/legacy-pages/faqs.html?raw";

export const Route = createFileRoute("/faqs")({
  component: () => <LegacyPage html={html} title="FAQs — New Hope Orphanage" />,
});
