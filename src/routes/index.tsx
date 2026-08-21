import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import { pageHead } from "@/lib/page-head";
import html from "@/legacy-pages/index.html?raw";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      path: "/",
      title: "New Hope Orphanage — Supporting Children in Cameroon",
      description:
        "New Hope Orphanage provides care, education, and opportunities for children in Yaoundé and Douala, Cameroon. Donate, volunteer, or partner with us.",
      ogTitle: "New Hope Orphanage — A Home, A School, A Future for Children in Cameroon",
      ogDescription:
        "New Hope Orphanage supports children in Yaoundé and Douala, Cameroon with safe shelter, education, and a path to a brighter future.",
      lang: "en",
    }),
  component: () => <LegacyPage html={html} title="New Hope Orphanage" />,
});
