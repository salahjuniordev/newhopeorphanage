import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import { pageHead } from "@/lib/page-head";
import html from "@/legacy-pages/faqs.html?raw";

export const Route = createFileRoute("/faqs")({
  head: () =>
    pageHead({
      path: "/faqs",
      title: "Questions fréquentes — New Hope Orphanage",
      description:
        "Réponses aux questions fréquentes sur New Hope Orphanage : utilisation des dons, parrainage d'un enfant, bénévolat et moyens de paiement mobile.",
    }),
  component: () => <LegacyPage html={html} title="FAQs — New Hope Orphanage" />,
});
