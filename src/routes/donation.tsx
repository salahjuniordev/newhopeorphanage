import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import html from "@/legacy-pages/donation.html?raw";

export const Route = createFileRoute("/donation")({
  component: () => <LegacyPage html={html} title="Donation — New Hope Orphanage" />,
});
