import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard, Btn, SectionTitle } from "@/components/ui-primitives";
import { useAuthorBySlug, useAuthorBooks } from "@/lib/api/hooks";
import { useState, lazy, Suspense } from "react";

const LazyPdfBookViewer = lazy(() => import("@/components/PdfBookViewer").then(m => ({ default: m.PdfBookViewer })));
import { BookOpen, FileText } from "lucide-react";

const FEATURED_PROFILES: Record<string, { name: string; role: string; bio: string; avatar: string; pdfUrl: string }> = {
  "vemuri-balaram": {
    name: "Vemuri Balaram",
    role: "Founder, Owner & Editor-in-Chief",
    bio: "Vemuri Balaram (popularly known as Swathi Balaram) is the founder, owner, and editor-in-chief of Swathi Publications, headquartered in Vijayawada, Andhra Pradesh. Born in 1947 in Ghantasala Palem, he worked at the Survey of India before founding Swathi Monthly in 1970 and Swathi Weekly in 1984. Under his vision, Swathi grew into one of the largest-circulated Telugu publications, shaping Telugu literature, journalism, and family reading culture for decades. He was honored with the AP Kala Ratna Award (2025) and the Lok Nayak Foundation Award.",
    avatar: "/images/vemuri-balaram.jpg",
    pdfUrl: "/documents/EDITOR GARI SANMANAPATRAM.pdf",
  },
};

export const Route = createFileRoute("/authors/$slug")({
  head: () => ({ meta: [{ title: "Author Profile — Swathi Publications" }] }),
  component: AuthorDetailPage,
  notFoundComponent: () => <PublicPage title="Author not found"><Link to="/authors" className="text-primary hover:underline">← All authors</Link></PublicPage>,
});

function AuthorDetailPage() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useAuthorBySlug(slug);
  const fetchedAuthor = data?.data;
  const featuredProfile = FEATURED_PROFILES[slug];
  const [isBookViewerOpen, setIsBookViewerOpen] = useState(false);

  const author = featuredProfile
    ? {
      id: slug,
      name: featuredProfile.name,
      role: featuredProfile.role,
      bio: featuredProfile.bio,
      avatar: featuredProfile.avatar,
      pdfUrl: featuredProfile.pdfUrl,
      bookCount: 12,
    }
    : fetchedAuthor
      ? {
        id: fetchedAuthor.id,
        name: fetchedAuthor.name,
        role: "Editorial Contributor",
        bio: fetchedAuthor.bio || "Staff writer and contributor at Swathi Publications.",
        avatar: undefined,
        pdfUrl: (fetchedAuthor as any).pdfUrl || "/documents/EDITOR GARI SANMANAPATRAM.pdf",
        bookCount: fetchedAuthor.bookCount || 0,
      }
      : null;

  const { data: booksData } = useAuthorBooks(fetchedAuthor?.id ?? '', { limit: 4 });
  const books = booksData?.data ?? [];

  if (isLoading && !featuredProfile) {
    return (
      <PublicPage eyebrow="Loading…" title="">
        <div className="animate-pulse space-y-4">
          <div className="h-40 w-40 bg-secondary rounded-full mx-auto" />
          <div className="h-8 bg-secondary rounded w-1/2 mx-auto" />
        </div>
      </PublicPage>
    );
  }

  if (!author) {
    return (
      <PublicPage title="Profile not found">
        <Link to="/about" className="text-primary hover:underline">← Back to About Us</Link>
      </PublicPage>
    );
  }

  return (
    <PublicPage eyebrow={author.role || "Profile"} title={author.name} description={author.bio?.slice(0, 100)}>
      {/* Profile Info Header */}
      <div className="grid md:grid-cols-[240px_1fr] gap-10 mb-12 items-center">
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            className="w-48 h-48 rounded-2xl object-cover shadow-lg mx-auto md:mx-0 border-2 border-rule"
          />
        ) : (
          <div className="w-48 h-48 rounded-2xl bg-primary/10 text-primary grid place-items-center font-serif text-7xl mx-auto md:mx-0 border-2 border-rule">
            {author.name[0]}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">{author.role}</div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold">{author.name}</h1>
          </div>

          <p className="font-serif text-lg text-muted-foreground leading-relaxed max-w-2xl">{author.bio}</p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Btn onClick={() => setIsBookViewerOpen(true)} className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Read Profile PDF in Book View
            </Btn>
          </div>
        </div>
      </div>

      {/* Inbuilt PDF Viewer Section */}
      <div className="mb-14">
        <SectionTitle eyebrow="Document Details" title={`Official Profile & Credentials — ${author.name}`} />

        <div className="bg-paper border border-rule rounded-2xl overflow-hidden shadow-lg">
          {/* Custom Viewer Control Header */}
          <div className="bg-stone-900 text-stone-100 px-6 py-3.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary grid place-items-center">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-sm text-stone-100">Inbuilt Document Reader</div>
                <div className="text-xs text-stone-400">Single-Page Interactive View</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Btn size="sm" onClick={() => setIsBookViewerOpen(true)} className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                <BookOpen className="h-3.5 w-3.5" /> Open Fullscreen View
              </Btn>
            </div>
          </div>

          {/* Inline Embedded PDF Viewer Container */}
          <div className="w-full h-[680px] bg-stone-950 p-2 md:p-6 flex items-center justify-center relative">
            <div className="w-full h-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-2xl border border-stone-800">
              <object
                data={`${author.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                type="application/pdf"
                className="w-full h-full border-0"
              >
                <embed
                  src={`${author.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  type="application/pdf"
                  className="w-full h-full border-0"
                />
              </object>
            </div>
          </div>
        </div>
      </div>

      {/* Books Written */}
      {books.length > 0 && (
        <div className="mb-12">
          <SectionTitle title="Authored Publications & Books" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{books.map((b) => <BookCard key={b.id} book={b} />)}</div>
        </div>
      )}

      {/* Interactive Book View Reader Modal */}
      {isBookViewerOpen && (
        <Suspense fallback={null}>
          <LazyPdfBookViewer
            isOpen={isBookViewerOpen}
            onClose={() => setIsBookViewerOpen(false)}
            title={`${author.name} — Profile & Credentials`}
            pdfUrl={author.pdfUrl}
          />
        </Suspense>
      )}
    </PublicPage>
  );
}
