import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import { pageHead } from "@/lib/page-head";
import html from "@/legacy-pages/contact.html?raw";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      path: "/contact",
      title: "Contact — New Hope Orphanage, Yaoundé",
      description:
        "Contactez New Hope Orphanage à Yaoundé : téléphone, e-mail et formulaire de contact pour les dons, le bénévolat et les partenariats.",
    }),
  component: () => <LegacyPage html={html} title="Contact — New Hope Orphanage" />,
});
