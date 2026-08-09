import { useState, lazy, Suspense } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useArticles, useCategories } from "@/lib/api/hooks";
import { formatShortDate } from "@/lib/utils";
import {
  DateFilterControl,
  DateFilterValue,
  isItemInDateRange,
} from "@/components/DateFilterControl";
import { PdfThumbnail } from "@/components/PdfThumbnail";
import { BookOpen } from "lucide-react";
import type { Article } from "@/lib/api/types";

const LazyPdfBookViewer = lazy(() =>
  import("@/components/PdfBookViewer").then((m) => ({ default: m.PdfBookViewer })),
);

export const Route = createFileRoute("/articles")({
  head: () => ({
    meta: [
      { title: "Publications — Swathi Publications" },
      {
        name: "description",
        content: "All articles, essays, and reporting from Swathi Publications.",
      },
    ],
  }),
  component: ArticlesPage,
});

function ArticlesPage() {
  const { data: articlesData, isLoading } = useArticles();
  const { data: categoriesData } = useCategories();
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ preset: "all" });
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  const articles = articlesData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  const filteredArticles = articles.filter((a) =>
    isItemInDateRange(a, (art) => art.publishedAt, dateFilter),
  );

  return (
    <SiteLayout>
      <div className="container-edit py-12">
        <Crumbs
          items={[
            ["Home", "/"],
            ["Publications", "/articles"],
          ]}
        />
        <h1 className="mt-4 font-serif text-4xl md:text-5xl">All Publications</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Every article, essay, and dispatch — filter by section or search the archive.
        </p>

        {/* Section & Date Filter Container */}
        <div className="mt-8 flex flex-col gap-4 border-b border-rule pb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mr-1">
              Category:
            </span>
            <Link
              to="/articles"
              className="border border-primary text-primary px-3 py-1 text-xs uppercase tracking-wider font-semibold"
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className="border border-input px-3 py-1 text-xs uppercase tracking-wider hover:border-primary hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>

          <div className="p-4 bg-paper border border-rule rounded-xl shadow-xs">
            <DateFilterControl value={dateFilter} onChange={setDateFilter} />
          </div>
        </div>

        {isLoading ? (
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-secondary" />
                <div className="mt-3 h-4 bg-secondary rounded w-1/3" />
                <div className="mt-2 h-6 bg-secondary rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No publications found for the selected date filter.
          </div>
        ) : (
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredArticles.map((a) => (
              <article key={a.id} className="group flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary rounded-sm group">
                    <PdfThumbnail
                      src={a.coverImage ?? ""}
                      alt={a.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <button
                      onClick={() => setReadingArticle(a)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white font-medium text-sm gap-2 cursor-pointer backdrop-blur-[2px]"
                    >
                      <BookOpen className="w-5 h-5 text-amber-400" /> Read PDF Edition
                    </button>
                  </div>
                  <div className="mt-3 eyebrow">{a.category?.name ?? "Article"}</div>
                  <h3 className="mt-1 font-serif text-xl leading-snug group-hover:text-primary transition-colors">
                    <Link to="/articles/$slug" params={{ slug: a.slug }}>
                      {a.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-rule/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    By {a.author?.name ?? "Editorial Board"} ·{" "}
                    {a.publishedAt ? formatShortDate(a.publishedAt) : ""}
                  </span>
                  <button
                    onClick={() => setReadingArticle(a)}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Read
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-14 flex items-center justify-center gap-1 text-sm">
          <button className="border border-input px-3 py-2 hover:border-primary">‹ Prev</button>
          {[1, 2, 3, 4, 5].map((p) => (
            <button
              key={p}
              className={`w-9 h-9 border ${p === 1 ? "border-primary text-primary" : "border-input hover:border-primary"}`}
            >
              {p}
            </button>
          ))}
          <button className="border border-input px-3 py-2 hover:border-primary">Next ›</button>
        </div>
      </div>

      {readingArticle && (
        <Suspense fallback={null}>
          <LazyPdfBookViewer
            isOpen={!!readingArticle}
            title={readingArticle.title}
            pdfUrl={
              readingArticle.pdfUrl ||
              readingArticle.coverImage ||
              "/documents/weekly/32 Pages/10,11.pdf"
            }
            onClose={() => setReadingArticle(null)}
          />
        </Suspense>
      )}
    </SiteLayout>
  );
}

export function Crumbs({ items }: { items: [string, string][] }) {
  return (
    <nav className="text-xs uppercase tracking-widest text-muted-foreground">
      {items.map(([label, href], i) => (
        <span key={href}>
          {i > 0 && <span className="mx-2">/</span>}
          {i === items.length - 1 ? (
            <span className="text-foreground">{label}</span>
          ) : (
            <Link to={href} className="hover:text-primary">
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
