import { createFileRoute } from "@tanstack/react-router";
import { LegacyPage } from "@/components/LegacyPage";
import { pageHead, SITE_URL } from "@/lib/page-head";
import html from "@/legacy-pages/faqs.html?raw";

// FAQPage structured data — real questions/answers from the legacy FAQs page.
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the mission of your organization?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can volunteer, donate, or partner with us to support our initiatives. Visit our Get Involved page for more details.",
      },
    },
    {
      "@type": "Question",
      name: "How can I get involved?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can volunteer, donate, or partner with us to support our initiatives. Visit our Get Involved page for more details.",
      },
    },
    {
      "@type": "Question",
      name: "How can I make a donation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can volunteer, donate, or partner with us to support our initiatives. Visit our Get Involved page for more details.",
      },
    },
    {
      "@type": "Question",
      name: "Are my donations tax-deductible?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can volunteer, donate, or partner with us to support our initiatives. Visit our Get Involved page for more details.",
      },
    },
    {
      "@type": "Question",
      name: "How can I volunteer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can volunteer, donate, or partner with us to support our initiatives. Visit our Get Involved page for more details.",
      },
    },
    {
      "@type": "Question",
      name: "What are the requirements for volunteering?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can volunteer, donate, or partner with us to support our initiatives. Visit our Get Involved page for more details.",
      },
    },
    {
      "@type": "Question",
      name: "What programs do you offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can volunteer, donate, or partner with us to support our initiatives. Visit our Get Involved page for more details.",
      },
    },
    {
      "@type": "Question",
      name: "How can I apply for a program?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can volunteer, donate, or partner with us to support our initiatives. Visit our Get Involved page for more details.",
      },
    },
  ],
};

export const Route = createFileRoute("/faqs")({
  head: () => ({
    ...pageHead({
      path: "/faqs",
      title: "Questions fréquentes — New Hope Orphanage",
      description:
        "Trouvez les réponses aux questions fréquentes sur New Hope Orphanage, notre mission, les enfants, les dons et nos actions à Yaoundé et Douala.",
      ogDescription:
        "Toutes les réponses aux questions fréquentes sur New Hope Orphanage, notre mission et les moyens de soutenir les enfants.",
    }),
    scripts: [{ type: "application/ld+json", children: JSON.stringify(FAQ_SCHEMA) }],
  }),
  component: () => <LegacyPage html={html} title="FAQs — New Hope Orphanage" />,
});
