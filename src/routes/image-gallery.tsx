import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Camera, ZoomIn } from "lucide-react";
import { pageHead } from "@/lib/page-head";

// Gallery data with accurate descriptions based on filenames
const GALLERY_ITEMS = [
  {
    id: 1,
    src: "/legacy/images/gallery-children-learning.webp",
    alt: "Children engaged in learning activities at New Hope Orphanage",
    title: "Learning Together",
    category: "education",
  },
  {
    id: 2,
    src: "/legacy/images/gallery-activities.webp",
    alt: "Children participating in activities at New Hope Orphanage",
    title: "Daily Activities",
    category: "activities",
  },
  {
    id: 3,
    src: "/legacy/images/gallery-children.webp",
    alt: "Children at New Hope Orphanage in Cameroon",
    title: "Our Children",
    category: "community",
  },
  {
    id: 4,
    src: "/legacy/images/gallery-community.webp",
    alt: "Community support and engagement at New Hope Orphanage",
    title: "Community Support",
    category: "community",
  },
  {
    id: 5,
    src: "/legacy/images/gallery-education.webp",
    alt: "Educational programs and resources at New Hope Orphanage",
    title: "Education Programs",
    category: "education",
  },
  {
    id: 6,
    src: "/legacy/images/gallery-group.webp",
    alt: "Group activities and teamwork at New Hope Orphanage",
    title: "Group Activities",
    category: "activities",
  },
  {
    id: 7,
    src: "/legacy/images/gallery-outdoor.webp",
    alt: "Outdoor activities and recreation at New Hope Orphanage",
    title: "Outdoor Fun",
    category: "activities",
  },
  {
    id: 8,
    src: "/legacy/images/gallery-program.webp",
    alt: "Programs and initiatives at New Hope Orphanage",
    title: "Our Programs",
    category: "programs",
  },
  {
    id: 9,
    src: "/legacy/images/gallery-scene-1.webp",
    alt: "Scenes from daily life at New Hope Orphanage",
    title: "Daily Scenes",
    category: "daily",
  },
  {
    id: 10,
    src: "/legacy/images/gallery-scene-2.webp",
    alt: "More moments from New Hope Orphanage",
    title: "Special Moments",
    category: "daily",
  },
  {
    id: 11,
    src: "/legacy/images/gallery-scene-3.webp",
    alt: "Activities and events at New Hope Orphanage",
    title: "Events & Activities",
    category: "events",
  },
  {
    id: 12,
    src: "/legacy/images/gallery-scene-4.webp",
    alt: "Life at New Hope Orphanage in Cameroon",
    title: "Life in Cameroon",
    category: "daily",
  },
  {
    id: 13,
    src: "/legacy/images/gallery-scene-5.webp",
    alt: "Children enjoying their time at New Hope",
    title: "Joy & Happiness",
    category: "emotional",
  },
  {
    id: 14,
    src: "/legacy/images/gallery-scene-6.webp",
    alt: "Gatherings and celebrations at New Hope Orphanage",
    title: "Celebrations",
    category: "events",
  },
  {
    id: 15,
    src: "/legacy/images/gallery-scene-7.webp",
    alt: "Behind the scenes at New Hope Orphanage",
    title: "Behind the Scenes",
    category: "daily",
  },
];

// Image Gallery JSON-LD structured data
const IMAGE_GALLERY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  name: "New Hope Orphanage Image Gallery",
  description:
    "Photos showcasing life, activities, and moments at New Hope Orphanage in Yaoundé and Douala, Cameroon.",
  url: "https://newhopeorphanage.org/image-gallery",
  image: GALLERY_ITEMS.map((item) => ({
    "@type": "ImageObject",
    contentUrl: `https://newhopeorphanage.org${item.src}`,
    name: item.title,
    description: item.alt,
  })),
};

// Route
export const Route = createFileRoute("/image-gallery")({
  head: () => ({
    ...pageHead({
      path: "/image-gallery",
      title: "Image Gallery — New Hope Orphanage",
      description:
        "Browse photos of life, activities, and moments at New Hope Orphanage in Yaoundé and Douala, Cameroon.",
      ogDescription:
        "Discover the life of New Hope Orphanage through our image gallery featuring activities, community, and daily moments.",
      lang: "en",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(IMAGE_GALLERY_SCHEMA),
      },
    ],
  }),
  component: ImageGalleryPage,
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

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
          <img
            src={item.src}
            alt={item.alt}
            className="nho-lightbox-image"
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
function ImageGalleryPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const categories = ["all", "community", "education", "activities", "events", "daily"];

  const filteredItems = filter === "all"
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === filter);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevItem = useCallback(() =>
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null)),
    [filteredItems.length]
  );
  const nextItem = useCallback(() =>
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : null)),
    [filteredItems.length]
  );

  return (
    <div className="nho-igallery-wrap">
      <style>{IGALLERY_CSS}</style>

      {/* Hero */}
      <header className="nho-igallery-hero">
        <span className="nho-igallery-eyebrow">
          <Camera size={14} /> Image Gallery
        </span>
        <h1>Life at New Hope Orphanage</h1>
        <p>
          Browse photos showcasing the daily activities, community, and moments
          shared at New Hope Orphanage in Yaoundé and Douala, Cameroon.
        </p>
      </header>

      {/* Filter Tabs */}
      <div className="nho-igallery-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`nho-igallery-filter ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <section className="nho-igallery-grid">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            className="nho-igallery-item"
            onClick={() => openLightbox(index)}
          >
            <div className="nho-igallery-image">
              <img
                src={item.src}
                alt={item.alt}
                loading={index < 6 ? "eager" : "lazy"}
                decoding="async"
              />
              <div className="nho-igallery-overlay">
                <div className="nho-igallery-zoom">
                  <ZoomIn size={24} />
                </div>
                <div className="nho-igallery-info">
                  <h3>{item.title}</h3>
                  <p>{item.alt}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Stats */}
      <section className="nho-igallery-stats">
        <div className="nho-igallery-stat">
          <Camera size={24} />
          <div>
            <span className="nho-igallery-stat-num">{GALLERY_ITEMS.length}</span>
            <span className="nho-igallery-stat-label">Photos</span>
          </div>
        </div>
        <div className="nho-igallery-stat">
          <ZoomIn size={24} />
          <div>
            <span className="nho-igallery-stat-num">{categories.length - 1}</span>
            <span className="nho-igallery-stat-label">Categories</span>
          </div>
        </div>
        <div className="nho-igallery-stat">
          <Camera size={24} />
          <div>
            <span className="nho-igallery-stat-num">2</span>
            <span className="nho-igallery-stat-label">Locations</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="nho-igallery-cta">
        <div className="nho-igallery-cta-card">
          <h2>Want to see more?</h2>
          <p>
            Follow us on social media for the latest photos and updates from
            New Hope Orphanage.
          </p>
          <div className="nho-igallery-cta-btns">
            <Link to="/contact" className="nho-igallery-btn-primary">
              Contact Us
            </Link>
            <Link to="/donation" className="nho-igallery-btn-secondary">
              Donate Now
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          items={filteredItems}
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
const IGALLERY_CSS = `
.nho-igallery-wrap{max-width:1200px;margin:0 auto;padding:48px 22px 72px;font-family:'Onest','Inter',system-ui,sans-serif;color:#020D19}

/* Hero */
.nho-igallery-hero{text-align:center;margin-bottom:36px}
.nho-igallery-eyebrow{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:999px;background:rgba(255,109,0,.1);color:#E55F00;font-size:.78rem;font-weight:700;letter-spacing:.8px;text-transform:uppercase}
.nho-igallery-hero h1{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,2.6rem);margin:16px 0 10px;line-height:1.2;color:#020D19}
.nho-igallery-hero p{color:#6B6B6B;max-width:560px;margin:0 auto;font-size:1rem;line-height:1.6}

/* Filters */
.nho-igallery-filters{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:36px}
.nho-igallery-filter{padding:8px 18px;border-radius:999px;border:1.5px solid #EFEFEF;background:#fff;color:#4A4A4A;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .2s}
.nho-igallery-filter:hover{border-color:#FF6D00;color:#FF6D00}
.nho-igallery-filter.active{background:linear-gradient(135deg,#FF6D00,#FF9A3D);color:#fff;border-color:transparent;box-shadow:0 4px 12px rgba(255,109,0,.3)}

/* Grid */
.nho-igallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:48px}
@media (max-width:600px){.nho-igallery-grid{grid-template-columns:repeat(2,1fr);gap:10px}}

/* Item */
.nho-igallery-item{position:relative;border-radius:16px;overflow:hidden;cursor:pointer;aspect-ratio:1;background:#f5f5f5;box-shadow:0 4px 20px rgba(0,0,0,.06);transition:transform .3s,box-shadow .3s}
.nho-igallery-item:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(255,109,0,.12)}

/* Image */
.nho-igallery-image{position:relative;width:100%;height:100%}
.nho-igallery-image img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
.nho-igallery-item:hover .nho-igallery-image img{transform:scale(1.08)}

/* Overlay */
.nho-igallery-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 50%);display:flex;flex-direction:column;justify-content:flex-end;padding:16px;opacity:0;transition:opacity .3s}
.nho-igallery-item:hover .nho-igallery-overlay{opacity:1}

/* Zoom icon */
.nho-igallery-zoom{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:50%;background:rgba(255,109,0,.9);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 16px rgba(255,109,0,.4);transition:transform .3s}
.nho-igallery-item:hover .nho-igallery-zoom{transform:translate(-50%,-50%) scale(1.1)}

/* Info */
.nho-igallery-info h3{color:#fff;font-family:'Playfair Display',serif;font-size:1rem;margin:0 0 2px}
.nho-igallery-info p{color:rgba(255,255,255,.8);font-size:.78rem;margin:0;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

/* Stats */
.nho-igallery-stats{display:flex;justify-content:center;gap:48px;padding:40px 0;margin-bottom:48px;border-top:1px solid #EFEFEF;border-bottom:1px solid #EFEFEF}
@media (max-width:600px){.nho-igallery-stats{gap:24px;flex-wrap:wrap}}
.nho-igallery-stat{display:flex;align-items:center;gap:12px;color:#FF6D00}
.nho-igallery-stat-num{display:block;font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:#020D19}
.nho-igallery-stat-label{display:block;font-size:.8rem;color:#828282;text-transform:uppercase;letter-spacing:.5px}

/* CTA */
.nho-igallery-cta{text-align:center}
.nho-igallery-cta-card{background:linear-gradient(160deg,#FFF1E6,#FFE0CC);border-radius:24px;padding:44px 32px;max-width:560px;margin:0 auto}
.nho-igallery-cta-card h2{font-family:'Playfair Display',serif;font-size:1.5rem;margin:0 0 8px;color:#020D19}
.nho-igallery-cta-card p{color:#6B6B6B;font-size:.95rem;margin:0 0 22px;line-height:1.6}
.nho-igallery-cta-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.nho-igallery-btn-primary{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:999px;background:linear-gradient(135deg,#FF6D00,#FF9A3D);color:#fff;font-weight:700;font-size:.92rem;text-decoration:none;border:0;cursor:pointer;box-shadow:0 10px 24px rgba(255,109,0,.35);transition:.2s}
.nho-igallery-btn-primary:hover{transform:translateY(-1px);box-shadow:0 14px 32px rgba(255,109,0,.45)}
.nho-igallery-btn-secondary{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:999px;background:#fff;border:1.5px solid #FF6D00;color:#E55F00;font-weight:700;font-size:.92rem;text-decoration:none;cursor:pointer;transition:.2s}
.nho-igallery-btn-secondary:hover{background:#FFF6EF}

/* Lightbox */
.nho-lightbox{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px)}
.nho-lightbox-content{position:relative;width:90vw;max-width:1000px;max-height:90vh;display:flex;flex-direction:column;align-items:center}
.nho-lightbox-close{position:absolute;top:-40px;right:0;background:none;border:none;color:#fff;cursor:pointer;padding:8px;opacity:.7;transition:opacity .2s;z-index:10}
.nho-lightbox-close:hover{opacity:1}
.nho-lightbox-media{width:100%;border-radius:16px;overflow:hidden;background:#000;display:flex;align-items:center;justify-content:center}
.nho-lightbox-image{width:100%;max-height:75vh;display:block;object-fit:contain}
.nho-lightbox-caption{text-align:center;padding:16px;color:#fff;width:100%}
.nho-lightbox-caption h3{font-family:'Playfair Display',serif;font-size:1.2rem;margin:0 0 4px}
.nho-lightbox-caption p{color:rgba(255,255,255,.7);font-size:.9rem;margin:0}
.nho-lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.15);border:none;color:#fff;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(4px);transition:background .2s;z-index:10}
.nho-lightbox-nav:hover{background:rgba(255,109,0,.8)}
.nho-lightbox-prev{left:-60px}
.nho-lightbox-next{right:-60px}
@media (max-width:768px){.nho-lightbox-prev{left:8px}.nho-lightbox-next{right:8px}}
.nho-lightbox-counter{position:absolute;bottom:-32px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.6);font-size:.85rem}
`;
