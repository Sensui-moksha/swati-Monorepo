import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ARTICLES, formatDate } from "@/lib/mock-data";
import { Crumbs } from "./articles";
import { Bookmark, Share2, MessageSquare, Heart, Lock } from "lucide-react";

export const Route = createFileRoute("/articles/$slug")({
  loader: ({ params }) => {
    const article = ARTICLES.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.article.title} — Swathi Publications` },
      { name: "description", content: loaderData.article.summary },
      { property: "og:title", content: loaderData.article.title },
      { property: "og:description", content: loaderData.article.summary },
      { property: "og:image", content: loaderData.article.image },
    ] : [{ title: "Article not found" }, { name: "robots", content: "noindex" }],
  }),
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
  const { article } = Route.useLoaderData();
  const related = ARTICLES.filter((a) => a.category === article.category && a.id !== article.id).slice(0, 3);

  return (
    <SiteLayout>
      <article className="container-edit py-10">
        <Crumbs items={[["Home", "/"], ["Publications", "/articles"], [article.categoryName, "/articles"]]} />

        <header className="mt-6 max-w-3xl">
          <div className="eyebrow">{article.categoryName}</div>
          <h1 className="mt-3 font-serif text-4xl md:text-6xl font-bold leading-[1.05]">{article.title}</h1>
          <p className="mt-5 text-xl text-muted-foreground leading-relaxed">{article.subtitle}</p>

          <div className="mt-8 rule-top rule-bottom py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center font-serif">
                {article.author.split(" ").map((s: string) => s[0]).join("")}
              </div>
              <div className="text-sm">
                <div className="font-semibold">{article.author}</div>
                <div className="text-muted-foreground text-xs">{article.authorRole} · {formatDate(article.date)} · {article.readTime}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <button className="inline-flex items-center gap-1 hover:text-primary"><Bookmark className="h-4 w-4" /> Save</button>
              <button className="inline-flex items-center gap-1 hover:text-primary"><Share2 className="h-4 w-4" /> Share</button>
              <button className="inline-flex items-center gap-1 hover:text-primary"><Heart className="h-4 w-4" /> {article.views}</button>
            </div>
          </div>
        </header>

        <figure className="mt-8">
          <img src={article.image} alt={article.title} className="w-full aspect-[16/9] object-cover bg-secondary" />
          <figcaption className="mt-2 text-xs text-muted-foreground">Photograph · Swathi Publications archive</figcaption>
        </figure>

        <div className="mt-10 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-8 md:col-start-3">
            <div className="prose prose-lg max-w-none font-serif text-lg leading-[1.85] text-foreground/90 space-y-6">
              {article.body.map((p: string, i: number) => (
                <p key={i} className={i === 0 ? "first-letter:font-serif first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85]" : ""}>{p}</p>
              ))}
            </div>

            {article.premium && (
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
        <section className="mt-20 rule-top pt-10">
          <div className="eyebrow">Related in {article.categoryName}</div>
          <div className="mt-6 grid md:grid-cols-3 gap-8">
            {related.map((a) => (
              <Link key={a.id} to="/articles/$slug" params={{ slug: a.slug }} className="group">
                <img src={a.image} alt={a.title} className="aspect-[4/3] w-full object-cover bg-secondary" />
                <h4 className="mt-3 font-serif text-lg group-hover:text-primary">{a.title}</h4>
                <div className="mt-1 text-xs text-muted-foreground">{formatDate(a.date)}</div>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </SiteLayout>
  );
}
