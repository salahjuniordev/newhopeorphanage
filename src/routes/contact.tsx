import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import { pageHead } from "@/lib/page-head";
import html from "@/legacy-pages/contact.html?raw";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      path: "/contact",
      title: "Contact — New Hope Orphanage in Cameroon",
      description:
        "Contact New Hope Orphanage in Yaoundé or Douala for information, to support our mission, or to learn more about our work with children.",
      ogDescription:
        "Contact New Hope Orphanage in Yaoundé or Douala to discover how to support our mission for children in Cameroon.",
      lang: "en",
    }),
  component: () => <LegacyPage html={html} title="Contact — New Hope Orphanage" />,
});
