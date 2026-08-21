import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Play, X, ChevronLeft, ChevronRight, Camera, Video } from "lucide-react";
import { pageHead } from "@/lib/page-head";

// Gallery data
const GALLERY_ITEMS = [
  {
    id: 1,
    type: "video" as const,
    src: "/legacy/videos/1.mp4",
    poster: "/legacy/images/gallery-scene-1.webp",
    alt: "Daily life and activities at New Hope Orphanage",
    title: "Daily Life at New Hope",
  },
  {
    id: 2,
    type: "video" as const,
    src: "/legacy/videos/2.mp4",
    poster: "/legacy/images/gallery-scene-2.webp",
    alt: "Children and staff at New Hope Orphanage",
    title: "Our Community",
  },
  {
    id: 3,
    type: "video" as const,
    src: "/legacy/videos/3.mp4",
    poster: "/legacy/images/gallery-scene-3.webp",
    alt: "Activities and programs at New Hope Orphanage",
    title: "Programs & Activities",
  },
  {
    id: 4,
    type: "video" as const,
    src: "/legacy/videos/4.mp4",
    poster: "/legacy/images/gallery-scene-4.webp",
    alt: "Moments captured at New Hope Orphanage",
    title: "Special Moments",
  },
  {
    id: 5,
    type: "video" as const,
    src: "/legacy/videos/5.mp4",
    poster: "/legacy/images/gallery-scene-5.webp",
    alt: "Life at New Hope Orphanage in Cameroon",
    title: "Life in Cameroon",
  },
  {
    id: 6,
    type: "video" as const,
    src: "/legacy/videos/6.mp4",
    poster: "/legacy/images/gallery-scene-6.webp",
    alt: "Children enjoying their time at New Hope",
    title: "Joy & Happiness",
  },
  {
    id: 7,
    type: "video" as const,
    src: "/legacy/videos/7.mp4",
    poster: "/legacy/images/gallery-scene-7.webp",
    alt: "Events and gatherings at New Hope Orphanage",
    title: "Events & Gatherings",
  },
  {
    id: 8,
    type: "video" as const,
    src: "/legacy/videos/8.mp4",
    poster: "/legacy/images/gallery-scene-8.webp",
    alt: "Behind the scenes at New Hope Orphanage",
    title: "Behind the Scenes",
  },
  {
    id: 9,
    type: "video" as const,
    src: "/legacy/videos/9.mp4",
    poster: "/legacy/images/gallery-scene-9.webp",
    alt: "More moments from New Hope Orphanage",
    title: "More Moments",
  },
];

// Video Gallery JSON-LD structured data
const VIDEO_GALLERY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "New Hope Orphanage Video Gallery",
  description:
    "Videos showcasing life, activities, and moments at New Hope Orphanage in Yaoundé and Douala, Cameroon.",
  url: "https://newhopeorphanage.org/video-gallery",
  itemListElement: GALLERY_ITEMS.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "VideoObject",
      name: item.title,
      description: item.alt,
      thumbnailUrl: [`https://newhopeorphanage.org${item.poster}`],
      uploadDate: "2026-01-01",
      duration: "PT30S",
      inLanguage: "en",
      isFamilyFriendly: true,
    },
  })),
};

// Route
export const Route = createFileRoute("/video-gallery")({
  head: () => ({
    ...pageHead({
      path: "/video-gallery",
      title: "Video Gallery — New Hope Orphanage",
      description:
        "Watch videos of life, activities, and moments at New Hope Orphanage in Yaoundé and Douala, Cameroon.",
      ogDescription:
        "Discover the life of New Hope Orphanage through our videos, activities, and moments with the children.",
      lang: "en",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(VIDEO_GALLERY_SCHEMA),
      },
    ],
  }),
  component: VideoGalleryPage,
});

// Lightbox component
function Lightbox({
  items,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  items: typeof GALLERY_ITEMS;
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[currentIndex];

  return (
    <div className="nho-lightbox" onClick={onClose}>
      <div className="nho-lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="nho-lightbox-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        <button className="nho-lightbox-nav nho-lightbox-prev" onClick={onPrev} aria-label="Previous">
          <ChevronLeft size={24} />
        </button>

        <div className="nho-lightbox-media">
          <video
            src={item.src}
            poster={item.poster}
            controls
            autoPlay
            className="nho-lightbox-video"
          />
          <div className="nho-lightbox-caption">
            <h3>{item.title}</h3>
            <p>{item.alt}</p>
          </div>
        </div>

        <button className="nho-lightbox-nav nho-lightbox-next" onClick={onNext} aria-label="Next">
          <ChevronRight size={24} />
        </button>

        <div className="nho-lightbox-counter">
          {currentIndex + 1} / {items.length}
        </div>
      </div>
    </div>
  );
}

// Main gallery page
function VideoGalleryPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevItem = () =>
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length : null));
  const nextItem = () =>
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % GALLERY_ITEMS.length : null));

  return (
    <div className="nho-gallery-wrap">
      <style>{GALLERY_CSS}</style>

      {/* Hero */}
      <header className="nho-gallery-hero">
        <span className="nho-gallery-eyebrow">
          <Video size={14} /> Video Gallery
        </span>
        <h1>Life at New Hope Orphanage</h1>
        <p>
          Watch videos showcasing the daily activities, programs, and moments
          shared at New Hope Orphanage in Yaoundé and Douala, Cameroon.
        </p>
      </header>

      {/* Gallery Grid */}
      <section className="nho-gallery-grid">
        {GALLERY_ITEMS.map((item, index) => (
          <div
            key={item.id}
            className="nho-gallery-item"
            onClick={() => openLightbox(index)}
          >
            <div className="nho-gallery-image">
              <img
                src={item.poster}
                alt={item.alt}
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
              />
              <div className="nho-gallery-overlay">
                <div className="nho-gallery-play">
                  <Play size={32} fill="white" />
                </div>
                <div className="nho-gallery-info">
                  <h3>{item.title}</h3>
                  <p>{item.alt}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Stats */}
      <section className="nho-gallery-stats">
        <div className="nho-gallery-stat">
          <Camera size={24} />
          <div>
            <span className="nho-gallery-stat-num">9</span>
            <span className="nho-gallery-stat-label">Videos</span>
          </div>
        </div>
        <div className="nho-gallery-stat">
          <Video size={24} />
          <div>
            <span className="nho-gallery-stat-num">2</span>
            <span className="nho-gallery-stat-label">Locations</span>
          </div>
        </div>
        <div className="nho-gallery-stat">
          <Play size={24} />
          <div>
            <span className="nho-gallery-stat-num">50+</span>
            <span className="nho-gallery-stat-label">Activities</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="nho-gallery-cta">
        <div className="nho-gallery-cta-card">
          <h2>Want to see more?</h2>
          <p>
            Follow us on social media for the latest updates and behind-the-scenes
            content from New Hope Orphanage.
          </p>
          <div className="nho-gallery-cta-btns">
            <Link to="/contact" className="nho-gallery-btn-primary">
              Contact Us
            </Link>
            <Link to="/donation" className="nho-gallery-btn-secondary">
              Donate Now
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          items={GALLERY_ITEMS}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevItem}
          onNext={nextItem}
        />
      )}
    </div>
  );
}

// Styles
const GALLERY_CSS = `
.nho-gallery-wrap{max-width:1200px;margin:0 auto;padding:48px 22px 72px;font-family:'Onest','Inter',system-ui,sans-serif;color:#020D19}

/* Hero */
.nho-gallery-hero{text-align:center;margin-bottom:48px}
.nho-gallery-eyebrow{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:999px;background:rgba(255,109,0,.1);color:#E55F00;font-size:.78rem;font-weight:700;letter-spacing:.8px;text-transform:uppercase}
.nho-gallery-hero h1{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,2.6rem);margin:16px 0 10px;line-height:1.2;color:#020D19}
.nho-gallery-hero p{color:#6B6B6B;max-width:560px;margin:0 auto;font-size:1rem;line-height:1.6}

/* Grid */
.nho-gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;margin-bottom:48px}
@media (max-width:700px){.nho-gallery-grid{grid-template-columns:1fr}}

/* Item */
.nho-gallery-item{position:relative;border-radius:20px;overflow:hidden;cursor:pointer;aspect-ratio:16/10;background:#f5f5f5;box-shadow:0 8px 30px rgba(0,0,0,.08);transition:transform .3s,box-shadow .3s}
.nho-gallery-item:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(255,109,0,.15)}

/* Image */
.nho-gallery-image{position:relative;width:100%;height:100%}
.nho-gallery-image img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.nho-gallery-item:hover .nho-gallery-image img{transform:scale(1.08)}

/* Overlay */
.nho-gallery-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 50%);display:flex;flex-direction:column;justify-content:flex-end;padding:20px;opacity:0;transition:opacity .3s}
.nho-gallery-item:hover .nho-gallery-overlay{opacity:1}

/* Play button */
.nho-gallery-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;background:rgba(255,109,0,.9);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(255,109,0,.4);transition:transform .3s}
.nho-gallery-item:hover .nho-gallery-play{transform:translate(-50%,-50%) scale(1.1)}

/* Info */
.nho-gallery-info h3{color:#fff;font-family:'Playfair Display',serif;font-size:1.1rem;margin:0 0 4px}
.nho-gallery-info p{color:rgba(255,255,255,.8);font-size:.85rem;margin:0;line-height:1.4}

/* Stats */
.nho-gallery-stats{display:flex;justify-content:center;gap:48px;padding:40px 0;margin-bottom:48px;border-top:1px solid #EFEFEF;border-bottom:1px solid #EFEFEF}
@media (max-width:600px){.nho-gallery-stats{gap:24px;flex-wrap:wrap}}
.nho-gallery-stat{display:flex;align-items:center;gap:12px;color:#FF6D00}
.nho-gallery-stat-num{display:block;font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:#020D19}
.nho-gallery-stat-label{display:block;font-size:.8rem;color:#828282;text-transform:uppercase;letter-spacing:.5px}

/* CTA */
.nho-gallery-cta{text-align:center}
.nho-gallery-cta-card{background:linear-gradient(160deg,#FFF1E6,#FFE0CC);border-radius:24px;padding:44px 32px;max-width:560px;margin:0 auto}
.nho-gallery-cta-card h2{font-family:'Playfair Display',serif;font-size:1.5rem;margin:0 0 8px;color:#020D19}
.nho-gallery-cta-card p{color:#6B6B6B;font-size:.95rem;margin:0 0 22px;line-height:1.6}
.nho-gallery-cta-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.nho-gallery-btn-primary{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:999px;background:linear-gradient(135deg,#FF6D00,#FF9A3D);color:#fff;font-weight:700;font-size:.92rem;text-decoration:none;border:0;cursor:pointer;box-shadow:0 10px 24px rgba(255,109,0,.35);transition:.2s}
.nho-gallery-btn-primary:hover{transform:translateY(-1px);box-shadow:0 14px 32px rgba(255,109,0,.45)}
.nho-gallery-btn-secondary{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:999px;background:#fff;border:1.5px solid #FF6D00;color:#E55F00;font-weight:700;font-size:.92rem;text-decoration:none;cursor:pointer;transition:.2s}
.nho-gallery-btn-secondary:hover{background:#FFF6EF}

/* Lightbox */
.nho-lightbox{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px)}
.nho-lightbox-content{position:relative;width:90vw;max-width:1000px;max-height:90vh;display:flex;flex-direction:column;align-items:center}
.nho-lightbox-close{position:absolute;top:-40px;right:0;background:none;border:none;color:#fff;cursor:pointer;padding:8px;opacity:.7;transition:opacity .2s}
.nho-lightbox-close:hover{opacity:1}
.nho-lightbox-media{width:100%;border-radius:16px;overflow:hidden;background:#000}
.nho-lightbox-video{width:100%;max-height:70vh;display:block}
.nho-lightbox-caption{text-align:center;padding:16px;color:#fff}
.nho-lightbox-caption h3{font-family:'Playfair Display',serif;font-size:1.2rem;margin:0 0 4px}
.nho-lightbox-caption p{color:rgba(255,255,255,.7);font-size:.9rem;margin:0}
.nho-lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.15);border:none;color:#fff;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(4px);transition:background .2s}
.nho-lightbox-nav:hover{background:rgba(255,109,0,.8)}
.nho-lightbox-prev{left:-60px}
.nho-lightbox-next{right:-60px}
@media (max-width:768px){.nho-lightbox-prev{left:8px}.nho-lightbox-next{right:8px}}
.nho-lightbox-counter{position:absolute;bottom:-32px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.6);font-size:.85rem}
`;
