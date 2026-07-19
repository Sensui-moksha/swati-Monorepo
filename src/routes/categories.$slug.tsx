import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { ARTICLES, CATEGORIES, formatShortDate, type Article } from "@/lib/mock-data";
import { Crumbs } from "./articles";

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    const items = ARTICLES.filter((a) => a.category === params.slug);
    return { cat, items };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.cat.name} — Swathi Publications` }, { name: "description", content: loaderData.cat.desc }]
      : [{ title: "Category not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <SiteLayout><div className="container-edit py-24 text-center"><h1 className="font-serif text-4xl">Category not found</h1></div></SiteLayout>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat, items } = Route.useLoaderData();
  return (
    <SiteLayout>
      <div className="container-edit py-12">
        <Crumbs items={[["Home","/"],["Categories","/categories"],[cat.name, `/categories/${cat.slug}`]]} />
        <div className="mt-4 eyebrow">Section</div>
        <h1 className="mt-2 font-serif text-5xl">{cat.name}</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">{cat.desc}</p>

        <div className="mt-10 space-y-10">
          {(items as Article[]).map((a) => (
            <Link key={a.id} to="/articles/$slug" params={{ slug: a.slug }} className="group grid md:grid-cols-12 gap-6 rule-bottom pb-10 last:border-0">
              <div className="md:col-span-4">
                <img src={a.image} alt={a.title} className="aspect-[4/3] w-full object-cover bg-secondary" />
              </div>
              <div className="md:col-span-8">
                <div className="eyebrow">{a.categoryName} {a.premium && <span className="ml-2 text-primary">· Premium</span>}</div>
                <h3 className="mt-1 font-serif text-2xl md:text-3xl group-hover:text-primary">{a.title}</h3>
                <p className="mt-3 text-muted-foreground">{a.summary}</p>
                <div className="mt-3 text-xs text-muted-foreground">By {a.author} · {formatShortDate(a.date)} · {a.readTime}</div>
              </div>
            </Link>
          ))}
          {items.length === 0 && <p className="text-muted-foreground">No articles yet in this section.</p>}
        </div>
      </div>
    </SiteLayout>
  );
}
