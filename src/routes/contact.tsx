import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import { pageHead } from "@/lib/page-head";
import html from "@/legacy-pages/contact.html?raw";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      path: "/contact",
      title: "Contact — New Hope Orphanage au Cameroun",
      description:
        "Contactez New Hope Orphanage à Yaoundé ou Douala pour obtenir des informations, soutenir notre mission ou en savoir plus sur nos actions.",
      ogDescription:
        "Contactez New Hope Orphanage à Yaoundé ou Douala pour découvrir comment soutenir notre mission.",
    }),
  component: () => <LegacyPage html={html} title="Contact — New Hope Orphanage" />,
});
