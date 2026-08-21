import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

interface BlogPostPageProps {
  category: string;
  title: string;
  heroImage: string;
  heroAlt: string;
  publishDate: string;
  children: React.ReactNode;
}

export function BlogPostPage({
  category,
  title,
  heroImage,
  heroAlt,
  publishDate,
  children,
}: BlogPostPageProps) {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={heroImage}
          alt={heroAlt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block bg-[#FF6D00] text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              {category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {title}
            </h1>
            <p className="text-white/80 text-sm">{publishDate}</p>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div
          className="prose prose-lg max-w-none
            prose-headings:text-[#222] prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5
            prose-strong:text-[#FF6D00]
            prose-a:text-[#FF6D00] prose-a:no-underline hover:prose-a:underline"
        >
          {children}
        </div>
      </article>

      {/* CTA Section */}
      <section className="bg-[#FFF3E0] py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#222] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            {t("blog.cta.title")}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("blog.cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/donation"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[#FF6D00] text-white font-semibold rounded-lg hover:bg-[#E65100] transition-colors"
            >
              {t("blog.cta.donate")}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-[#FF6D00] text-[#FF6D00] font-semibold rounded-lg hover:bg-[#FF6D00] hover:text-white transition-colors"
            >
              {t("blog.cta.contact")}
            </Link>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-8 text-center">
        <Link
          to="/"
          className="inline-flex items-center text-[#FF6D00] hover:underline font-medium"
        >
          ← {t("blog.back")}
        </Link>
      </section>
    </main>
  );
}
