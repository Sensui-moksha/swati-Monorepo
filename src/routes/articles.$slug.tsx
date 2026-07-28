import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useArticleBySlug, useArticles } from "@/lib/api/hooks";
import { formatDate } from "@/lib/utils";
import { Crumbs } from "./articles";
import { useState, lazy, Suspense } from "react";
import { Bookmark, Share2, MessageSquare, Heart, Lock, BookOpen, FileText } from "lucide-react";

const PdfBookViewer = lazy(() => import("@/components/PdfBookViewer").then(m => ({ default: m.PdfBookViewer })));

export const Route = createFileRoute("/articles/$slug")({
  head: () => ({ meta: [{ title: "Article — Swathi Publications" }] }),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-edit py-24 text-center">
        <h1 className="font-serif text-4xl">Article not found</h1>
        <Link to="/articles" className="mt-4 inline-block text-primary underline">Back to publications</Link>
      </div>
    </SiteLayout>
  ),
  component: ArticleDetail,
});

function ArticleDetail() {
  const { slug } = Route.useParams();
  const { data: articleData, isLoading, error } = useArticleBySlug(slug);
  const article = articleData?.data;
  const { data: relatedData } = useArticles({ categoryId: article?.category?.id, limit: 4 } as any);
  const related = (relatedData?.data ?? []).filter((a) => a.id !== article?.id).slice(0, 3);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-edit py-10 animate-pulse">
          <div className="h-4 bg-secondary rounded w-1/4 mb-6" />
          <div className="h-12 bg-secondary rounded w-3/4 mb-4" />
          <div className="h-6 bg-secondary rounded w-1/2 mb-8" />
          <div className="aspect-[16/9] bg-secondary mb-8" />
          <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-4 bg-secondary rounded" />)}</div>
        </div>
      </SiteLayout>
    );
  }

  if (error || !article) {
    return (
      <SiteLayout>
        <div className="container-edit py-24 text-center">
          <h1 className="font-serif text-4xl">Article not found</h1>
          <Link to="/articles" className="mt-4 inline-block text-primary underline">Back to publications</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="container-edit py-10">
        <Crumbs items={[["Home", "/"], ["Publications", "/articles"], [article.category?.name ?? "Article", "/articles"]]} />

        <header className="mt-6 max-w-3xl">
          <div className="eyebrow">{article.category?.name ?? 'Article'}</div>
          <h1 className="mt-3 font-serif text-4xl md:text-6xl font-bold leading-[1.05]">{article.title}</h1>
          <p className="mt-5 text-xl text-muted-foreground leading-relaxed">{article.excerpt}</p>

          <div className="mt-8 rule-top rule-bottom py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center font-serif">
                {(article.author?.name ?? 'S').split(" ").map((s: string) => s[0]).join("")}
              </div>
              <div className="text-sm">
                <div className="font-semibold">{article.author?.name ?? 'Staff Writer'}</div>
                <div className="text-muted-foreground text-xs">{formatDate(article.publishedAt ?? article.createdAt)} · {article.readingTime || 5} min read</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsViewerOpen(true)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded hover:bg-primary/90 transition-colors shadow-sm"
              >
                <BookOpen className="h-4 w-4" /> Read PDF in Book View
              </button>
              <div className="flex items-center gap-4 text-muted-foreground text-sm pl-2 border-l border-rule">
                <button className="inline-flex items-center gap-1 hover:text-primary"><Bookmark className="h-4 w-4" /> Save</button>
                <button className="inline-flex items-center gap-1 hover:text-primary"><Share2 className="h-4 w-4" /> Share</button>
                <button className="inline-flex items-center gap-1 hover:text-primary"><Heart className="h-4 w-4" /> {article.viewCount}</button>
              </div>
            </div>
          </div>
        </header>

        {/* Embedded Book View Reader Section */}
        <section className="mt-10 max-w-4xl mx-auto border border-rule rounded-xl bg-secondary/30 p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary font-medium text-sm">
            <FileText className="h-4 w-4" /> Swathi Digital Flipbook Edition
          </div>
          <h2 className="font-serif text-2xl font-bold">Read Full Publication in Book View</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Experience long-form reporting with seamless double-page book flipping, zooming, and print options right inside your browser.
          </p>
          <button
            onClick={() => setIsViewerOpen(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
          >
            <BookOpen className="h-5 w-5" /> Open Interactive Flipbook Reader
          </button>
        </section>

        {/* In-App Book View Flipbook Reader Modal */}
        {isViewerOpen && (
          <Suspense fallback={null}>
            <PdfBookViewer
              isOpen={isViewerOpen}
              title={article.title}
              pdfUrl={article.pdfUrl || "/documents/sample-issue.pdf"}
              onClose={() => setIsViewerOpen(false)}
            />
          </Suspense>
        )}

        <figure className="mt-8">
          <img src={article.coverImage ?? ''} alt={article.title} className="w-full aspect-[16/9] object-cover bg-secondary" />
          <figcaption className="mt-2 text-xs text-muted-foreground">Photograph · Swathi Publications archive</figcaption>
        </figure>

        <div className="mt-10 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-8 md:col-start-3">
            <div className="prose prose-lg max-w-none font-serif text-lg leading-[1.85] text-foreground/90 space-y-6">
              {article.content ? article.content.split('\n\n').map((p: string, i: number) => (
                <p key={i} className={i === 0 ? "first-letter:font-serif first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85]" : ""}>{p}</p>
              )) : <p>{article.excerpt}</p>}
            </div>

            {(article as any).isPremium && (
              <div className="mt-10 border border-primary/30 bg-primary/5 p-8 text-center">
                <Lock className="h-6 w-6 text-primary mx-auto" />
                <h3 className="mt-3 font-serif text-2xl">This is a premium article.</h3>
                <p className="mt-2 text-muted-foreground text-sm max-w-md mx-auto">Continue reading with a Swathi subscription. Support independent journalism from ₹199/month.</p>
                <Link to="/pricing" className="mt-5 inline-block bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90">Subscribe to continue</Link>
              </div>
            )}

            {/* Comments */}
            <section className="mt-16">
              <h3 className="font-serif text-2xl flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Discussion (4)</h3>
              <form className="mt-6 border border-input p-4" onSubmit={(e) => e.preventDefault()}>
                <textarea placeholder="Share your thoughts..." className="w-full min-h-24 bg-transparent focus:outline-none text-sm" />
                <div className="flex justify-end mt-2">
                  <button className="bg-primary text-primary-foreground px-4 py-2 text-sm hover:bg-primary/90">Post comment</button>
                </div>
              </form>
              <ul className="mt-8 space-y-8">
                {[
                  { name: "Ananya S.", time: "2 hours ago", text: "A rare piece that resists the temptation to editorialise. Thank you." },
                  { name: "Kishore R.", time: "5 hours ago", text: "Would love a follow-up on the state-level implications." },
                  { name: "Meera K.", time: "Yesterday", text: "The third paragraph deserves its own essay." },
                  { name: "Ravi P.", time: "Yesterday", text: "Sourcing is transparent. This is what journalism should look like." },
                ].map((c) => (
                  <li key={c.name} className="flex gap-4">
                    <div className="h-9 w-9 rounded-full bg-secondary text-foreground grid place-items-center text-xs font-semibold shrink-0">{c.name[0]}</div>
                    <div className="min-w-0">
                      <div className="text-sm"><span className="font-semibold">{c.name}</span> <span className="text-muted-foreground">· {c.time}</span></div>
                      <p className="mt-1 text-sm">{c.text}</p>
                      <div className="mt-1 text-xs text-muted-foreground flex gap-3">
                        <button className="hover:text-primary">Reply</button>
                        <button className="hover:text-primary">Like</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20 rule-top pt-10">
            <div className="eyebrow">Related in {article.category?.name ?? 'this section'}</div>
            <div className="mt-6 grid md:grid-cols-3 gap-8">
              {related.map((a) => (
                <Link key={a.id} to="/articles/$slug" params={{ slug: a.slug }} className="group">
                  <img src={a.coverImage ?? ''} alt={a.title} className="aspect-[4/3] w-full object-cover bg-secondary" />
                  <h4 className="mt-3 font-serif text-lg group-hover:text-primary">{a.title}</h4>
                  <div className="mt-1 text-xs text-muted-foreground">{a.publishedAt ? formatDate(a.publishedAt) : ''}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </SiteLayout>
  );
}
