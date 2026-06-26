import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import html from "@/legacy-pages/video-gallery.html?raw";

export const Route = createFileRoute("/video-gallery")({
  component: () => <LegacyPage html={html} title="Video Gallery — New Hope Orphanage" />,
});
