import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, HelpCircle, Heart, Phone } from "lucide-react";
import { pageHead } from "@/lib/page-head";

// ---------------------------------------------------------------------------
// FAQ data
// ---------------------------------------------------------------------------

const FAQS = [
  {
    q: "What is New Hope Orphanage?",
    a: "New Hope Orphanage is a child-support organization in Cameroon dedicated to providing children with a safe, caring environment and opportunities to learn, grow, and build a better future.",
  },
  {
    q: "Where is New Hope Orphanage located in Cameroon?",
    a: "New Hope Orphanage operates in Yaoundé and Douala, Cameroon. These locations enable the organization to support children while working with individuals, families, businesses, and partners who want to contribute to its mission.",
  },
  {
    q: "How does New Hope Orphanage support children in Cameroon?",
    a: "New Hope Orphanage supports children through care, education, guidance, daily assistance, and other essential support that helps them grow in a safe and supportive environment.",
  },
  {
    q: "How can I donate to New Hope Orphanage?",
    a: "You can support New Hope Orphanage through the Donate section of this website. Your contribution helps strengthen the organization\u2019s ability to provide care, education, essential resources, and opportunities for children.",
  },
  {
    q: "How can I help an orphanage in Cameroon?",
    a: "You can help by donating, volunteering, supporting children\u2019s educational and everyday needs, partnering with New Hope Orphanage, or sharing its mission with others. Every form of support can help create better opportunities for children in Cameroon.",
  },
  {
    q: "Can I volunteer at New Hope Orphanage in Yaoundé or Douala?",
    a: "Yes. People interested in volunteering can contact New Hope Orphanage to learn about current opportunities, requirements, and ways they can contribute their time, skills, and experience to supporting children.",
  },
  {
    q: "Can businesses or organizations partner with New Hope Orphanage?",
    a: "Yes. Businesses, associations, community groups, and other organizations interested in supporting children in Cameroon can contact New Hope Orphanage to discuss partnership opportunities and ways to contribute to its mission.",
  },
  {
    q: "How can I support children in Yaoundé and Douala?",
    a: "You can support children in Yaoundé and Douala by donating, volunteering, partnering with New Hope Orphanage, or helping raise awareness of its work. Your support can help provide children with care, education, stability, and opportunities for a brighter future.",
  },
] as const;

// ---------------------------------------------------------------------------
// FAQPage JSON-LD structured data
// ---------------------------------------------------------------------------

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/faqs")({
  head: () => ({
    ...pageHead({
      path: "/faqs",
      title: "Frequently Asked Questions — New Hope Orphanage",
      description:
        "Find answers to frequently asked questions about New Hope Orphanage, our mission, how to donate, volunteer, and support children in Yaoundé and Douala, Cameroon.",
      ogDescription:
        "Learn about New Hope Orphanage in Cameroon \u2014 our mission, how to donate, volunteer, and support children in Yaoundé and Douala.",
      lang: "en",
    }),
    scripts: [{ type: "application/ld+json", children: JSON.stringify(FAQ_SCHEMA) }],
  }),
  component: FAQsPage,
});

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="nho-faq-wrap">
      <style>{FAQ_CSS}</style>

      {/* Hero */}
      <header className="nho-faq-hero">
        <span className="nho-faq-eyebrow">
          <HelpCircle size={14} /> Help Center
        </span>
        <h1>Frequently Asked Questions</h1>
        <p>
          Everything you need to know about New Hope Orphanage, our mission, and
          how you can help children in Yaoundé and Douala, Cameroon.
        </p>
      </header>

      {/* FAQ accordion */}
      <section className="nho-faq-list" aria-label="Frequently asked questions">
        {FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className={`nho-faq-item ${isOpen ? "is-open" : ""}`}>
              <button
                type="button"
                className="nho-faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={18}
                  className="nho-faq-chevron"
                  aria-hidden="true"
                />
              </button>
              {isOpen && (
                <div className="nho-faq-a" role="region">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* CTA */}
      <section className="nho-faq-cta">
        <div className="nho-faq-cta-card">
          <Heart size={28} className="nho-faq-cta-icon" />
          <h2>Still have questions?</h2>
          <p>
            We&apos;d love to hear from you. Reach out and we&apos;ll get back
            to you as soon as possible.
          </p>
          <div className="nho-faq-cta-btns">
            <Link to="/contact" className="nho-faq-btn-primary">
              <Phone size={16} /> Contact Us
            </Link>
            <Link to="/donation" className="nho-faq-btn-secondary">
              Donate Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles — matches project design language (warm orange, Playfair headings)
// ---------------------------------------------------------------------------

const FAQ_CSS = `
.nho-faq-wrap{max-width:820px;margin:0 auto;padding:48px 22px 72px;font-family:'Onest','Inter',system-ui,sans-serif;color:#020D19}

/* Hero */
.nho-faq-hero{text-align:center;margin-bottom:42px}
.nho-faq-eyebrow{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:999px;background:rgba(255,109,0,.1);color:#E55F00;font-size:.78rem;font-weight:700;letter-spacing:.8px;text-transform:uppercase}
.nho-faq-hero h1{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,2.6rem);margin:16px 0 10px;line-height:1.2;color:#020D19}
.nho-faq-hero p{color:#6B6B6B;max-width:560px;margin:0 auto;font-size:1rem;line-height:1.6}

/* FAQ list */
.nho-faq-list{display:flex;flex-direction:column;gap:10px;margin-bottom:48px}
.nho-faq-item{background:#fff;border:1.5px solid #EFEFEF;border-radius:16px;overflow:hidden;transition:border-color .2s}
.nho-faq-item:hover{border-color:#f0dcc4}
.nho-faq-item.is-open{border-color:#FF6D00;box-shadow:0 4px 16px rgba(255,109,0,.08)}
.nho-faq-q{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 20px;border:0;background:transparent;cursor:pointer;text-align:left;font:inherit;font-size:1rem;font-weight:600;color:#020D19;line-height:1.4}
.nho-faq-q span{flex:1}
.nho-faq-chevron{flex-shrink:0;color:#828282;transition:transform .25s cubic-bezier(.4,0,.2,1)}
.nho-faq-item.is-open .nho-faq-chevron{transform:rotate(180deg);color:#FF6D00}
.nho-faq-a{padding:0 20px 18px}
.nho-faq-a p{margin:0;color:#4A4A4A;font-size:.95rem;line-height:1.7}

/* CTA */
.nho-faq-cta{text-align:center}
.nho-faq-cta-card{background:linear-gradient(160deg,#FFF1E6,#FFE0CC);border-radius:24px;padding:44px 32px;max-width:560px;margin:0 auto}
.nho-faq-cta-icon{color:#FF6D00;margin-bottom:14px}
.nho-faq-cta-card h2{font-family:'Playfair Display',serif;font-size:1.5rem;margin:0 0 8px;color:#020D19}
.nho-faq-cta-card p{color:#6B6B6B;font-size:.95rem;margin:0 0 22px;line-height:1.6}
.nho-faq-cta-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.nho-faq-btn-primary{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:999px;background:linear-gradient(135deg,#FF6D00,#FF9A3D);color:#fff;font-weight:700;font-size:.92rem;text-decoration:none;border:0;cursor:pointer;box-shadow:0 10px 24px rgba(255,109,0,.35);transition:.2s}
.nho-faq-btn-primary:hover{transform:translateY(-1px);box-shadow:0 14px 32px rgba(255,109,0,.45)}
.nho-faq-btn-secondary{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:999px;background:#fff;border:1.5px solid #FF6D00;color:#E55F00;font-weight:700;font-size:.92rem;text-decoration:none;cursor:pointer;transition:.2s}
.nho-faq-btn-secondary:hover{background:#FFF6EF}

@media (max-width:600px){
  .nho-faq-wrap{padding:32px 16px 56px}
  .nho-faq-q{padding:14px 16px;font-size:.94rem}
  .nho-faq-a{padding:0 16px 14px}
  .nho-faq-cta-card{padding:32px 20px}
}
`;
