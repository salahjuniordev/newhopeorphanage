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
        "Trouvez les réponses aux questions fréquentes sur New Hope Orphanage, notre mission, les enfants, les dons et nos actions à Yaoundé et Douala.",
      ogDescription:
        "Toutes les réponses aux questions fréquentes sur New Hope Orphanage, notre mission et les moyens de soutenir les enfants.",
    }),
  component: () => <LegacyPage html={html} title="FAQs — New Hope Orphanage" />,
});
