import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MapPin, BookOpen, Users, Sparkles, Target } from "lucide-react";
import { pageHead } from "@/lib/page-head";

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/about-us")({
  head: () =>
    pageHead({
      path: "/about-us",
      title: "About Us — New Hope Orphanage in Cameroon",
      description:
        "Learn about New Hope Orphanage \u2014 our story, mission, values, and work supporting children in Yaoundé and Douala, Cameroon.",
      ogDescription:
        "Discover New Hope Orphanage\u2019s mission, story, and commitment to supporting children in Yaoundé and Douala, Cameroon.",
      lang: "en",
    }),
  component: AboutUsPage,
});

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const VALUES = [
  {
    icon: Heart,
    title: "Compassion",
    desc: "Every child deserves to be treated with dignity, kindness, and respect.",
  },
  {
    icon: Users,
    title: "Care",
    desc: "We strive to create an environment where children can feel safe and supported.",
  },
  {
    icon: BookOpen,
    title: "Education",
    desc: "Learning is an important foundation for independence and future opportunity.",
  },
  {
    icon: Sparkles,
    title: "Community",
    desc: "Lasting impact happens when people work together.",
  },
  {
    icon: Target,
    title: "Hope",
    desc: "We believe a child\u2019s circumstances today should not define their possibilities tomorrow.",
  },
];

const LOCATIONS = [
  {
    city: "Yaound\u00e9",
    region: "Centre Region",
    desc: "Our home base where the majority of our care, education, and community programs operate daily.",
  },
  {
    city: "Douala",
    region: "Littoral Region",
    desc: "Extending our reach to children and families in Cameroon\u2019s largest economic hub.",
  },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

function AboutUsPage() {
  return (
    <div className="nho-about-wrap">
      <style>{ABOUT_CSS}</style>

      {/* Hero */}
      <header className="nho-about-hero">
        <span className="nho-about-eyebrow">About Us</span>
        <h1>About New Hope Orphanage</h1>
        <p className="nho-about-lead">
          New Hope Orphanage is dedicated to supporting children in Cameroon,
          with a presence in Yaound\u00e9 and Douala.
        </p>
        <p className="nho-about-sub">
          Our work is centered on creating a safe, caring environment where
          children can receive support, pursue education, develop their
          potential, and look toward the future with hope.
        </p>
      </header>

      {/* Our Story */}
      <section className="nho-about-section">
        <div className="nho-about-section-header">
          <span className="nho-about-label">Our Story</span>
          <h2>Why New Hope Exists</h2>
        </div>
        <div className="nho-about-prose">
          <p>
            Every child deserves care, stability, education, and the opportunity
            to become who they are capable of becoming.
          </p>
          <p>
            New Hope Orphanage exists to help make that opportunity possible. We
            work alongside supporters, volunteers, families, businesses, and
            organizations that share our commitment to improving the lives and
            futures of children.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="nho-about-section nho-about-mission">
        <div className="nho-about-section-header">
          <span className="nho-about-label">Mission</span>
          <h2>Our Mission</h2>
        </div>
        <div className="nho-about-mission-card">
          <p>
            To provide children with the care, support, education, and
            opportunities they need to grow, develop, and build a brighter
            future.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="nho-about-section">
        <div className="nho-about-section-header">
          <span className="nho-about-label">Values</span>
          <h2>What Guides Our Work</h2>
        </div>
        <div className="nho-about-values">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="nho-about-value">
                <div className="nho-about-value-icon">
                  <Icon size={22} />
                </div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Locations */}
      <section className="nho-about-section">
        <div className="nho-about-section-header">
          <span className="nho-about-label">Locations</span>
          <h2>Our Work in Cameroon</h2>
        </div>
        <p className="nho-about-prose-intro">
          New Hope Orphanage operates in Yaound\u00e9 and Douala, connecting
          local support with a wider community of people who want to help
          children in Cameroon.
        </p>
        <div className="nho-about-locations">
          {LOCATIONS.map((loc) => (
            <div key={loc.city} className="nho-about-location">
              <div className="nho-about-location-icon">
                <MapPin size={20} />
              </div>
              <div>
                <h3>
                  {loc.city}
                  <span className="nho-about-region">{loc.region}</span>
                </h3>
                <p>{loc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="nho-about-cta">
        <h2>Be Part of the Story</h2>
        <p>
          Your support can help provide children with care, education, and a
          brighter future.
        </p>
        <div className="nho-about-cta-btns">
          <Link to="/donation" className="nho-about-btn-primary">
            <Heart size={16} /> Donate Now
          </Link>
          <Link to="/contact" className="nho-about-btn-secondary">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const ABOUT_CSS = `
.nho-about-wrap{max-width:860px;margin:0 auto;padding:48px 22px 72px;font-family:'Onest','Inter',system-ui,sans-serif;color:#020D19}

/* Hero */
.nho-about-hero{text-align:center;margin-bottom:52px}
.nho-about-eyebrow{display:inline-block;padding:6px 16px;border-radius:999px;background:rgba(255,109,0,.1);color:#E55F00;font-size:.78rem;font-weight:700;letter-spacing:.8px;text-transform:uppercase}
.nho-about-hero h1{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,2.6rem);margin:16px 0 14px;line-height:1.2;color:#020D19}
.nho-about-lead{color:#4A4A4A;font-size:1.1rem;line-height:1.7;max-width:640px;margin:0 auto 10px}
.nho-about-sub{color:#6B6B6B;font-size:.98rem;line-height:1.7;max-width:600px;margin:0 auto}

/* Sections */
.nho-about-section{margin-bottom:48px}
.nho-about-section-header{margin-bottom:20px}
.nho-about-label{display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(255,109,0,.08);color:#E55F00;font-size:.72rem;font-weight:700;letter-spacing:.8px;text-transform:uppercase;margin-bottom:8px}
.nho-about-section-header h2{font-family:'Playfair Display',serif;font-size:1.6rem;margin:0;color:#020D19}
.nho-about-prose{display:flex;flex-direction:column;gap:14px}
.nho-about-prose p,.nho-about-prose-intro{color:#4A4A4A;font-size:1rem;line-height:1.75;margin:0}

/* Mission card */
.nho-about-mission-card{background:linear-gradient(160deg,#FFF1E6,#FFE0CC);border-radius:20px;padding:32px;border-left:4px solid #FF6D00}
.nho-about-mission-card p{font-family:'Playfair Display',serif;font-size:1.15rem;line-height:1.65;color:#020D19;margin:0;font-style:italic}

/* Values grid */
.nho-about-values{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.nho-about-value{background:#fff;border:1.5px solid #EFEFEF;border-radius:18px;padding:24px 20px;transition:border-color .2s,box-shadow .2s}
.nho-about-value:hover{border-color:#f0dcc4;box-shadow:0 4px 16px rgba(255,109,0,.06)}
.nho-about-value-icon{width:44px;height:44px;border-radius:12px;background:rgba(255,109,0,.1);color:#FF6D00;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px}
.nho-about-value h3{font-family:'Playfair Display',serif;font-size:1.05rem;margin:0 0 6px;color:#020D19}
.nho-about-value p{color:#6B6B6B;font-size:.9rem;line-height:1.6;margin:0}

/* Locations */
.nho-about-locations{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:18px}
.nho-about-location{display:flex;gap:16px;background:#fff;border:1.5px solid #EFEFEF;border-radius:18px;padding:22px 20px}
.nho-about-location-icon{width:42px;height:42px;border-radius:12px;background:rgba(255,109,0,.1);color:#FF6D00;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.nho-about-location h3{font-family:'Playfair Display',serif;font-size:1.05rem;margin:0 0 4px;color:#020D19;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.nho-about-region{font-family:'Onest',system-ui,sans-serif;font-size:.72rem;font-weight:600;color:#828282;letter-spacing:.5px;text-transform:uppercase;background:#f7f1e4;padding:3px 10px;border-radius:999px}
.nho-about-location p{color:#6B6B6B;font-size:.9rem;line-height:1.6;margin:0}

/* CTA */
.nho-about-cta{text-align:center;background:linear-gradient(160deg,#FFF1E6,#FFE0CC);border-radius:24px;padding:44px 32px;margin-top:12px}
.nho-about-cta h2{font-family:'Playfair Display',serif;font-size:1.5rem;margin:0 0 8px;color:#020D19}
.nho-about-cta p{color:#6B6B6B;font-size:.95rem;margin:0 0 22px;line-height:1.6}
.nho-about-cta-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.nho-about-btn-primary{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:999px;background:linear-gradient(135deg,#FF6D00,#FF9A3D);color:#fff;font-weight:700;font-size:.92rem;text-decoration:none;border:0;cursor:pointer;box-shadow:0 10px 24px rgba(255,109,0,.35);transition:.2s}
.nho-about-btn-primary:hover{transform:translateY(-1px);box-shadow:0 14px 32px rgba(255,109,0,.45)}
.nho-about-btn-secondary{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:999px;background:#fff;border:1.5px solid #FF6D00;color:#E55F00;font-weight:700;font-size:.92rem;text-decoration:none;cursor:pointer;transition:.2s}
.nho-about-btn-secondary:hover{background:#FFF6EF}

@media (max-width:600px){
  .nho-about-wrap{padding:32px 16px 56px}
  .nho-about-values{grid-template-columns:1fr}
  .nho-about-locations{grid-template-columns:1fr}
  .nho-about-cta{padding:32px 20px}
}
`;
