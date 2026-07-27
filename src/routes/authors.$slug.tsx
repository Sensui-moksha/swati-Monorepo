import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage } from "@/components/shells";
import { BookCard, Btn, SectionTitle } from "@/components/ui-primitives";
import { useAuthorBySlug, useAuthorBooks } from "@/lib/api/hooks";
import { PdfBookViewer } from "@/components/PdfBookViewer";
import { useState } from "react";
import { BookOpen, FileText, Download } from "lucide-react";

const FEATURED_PROFILES: Record<string, { name: string; role: string; bio: string; avatar: string; pdfUrl: string }> = {
  "dr-swathi-ramachandran": {
    name: "Dr. Swathi Ramachandran",
    role: "Editor-in-Chief & Founder",
    bio: "Ph.D. in Constitutional Law & Public Policy from Harvard University. Lead editor at Swathi Publications since 1998, specializing in constitutional analysis and editorial direction.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
    pdfUrl: "/documents/sample-issue.pdf",
  },
  "prof-kv-narayana": {
    name: "Prof. K. V. Narayana",
    role: "Senior Political Analyst & Academic Chair",
    bio: "Former Chair of Humanities at JNU. Author of 14 acclaimed treatises on South Asian Governance, public policy, and institutional frameworks.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
    pdfUrl: "/documents/sample-issue.pdf",
  },
  "ananya-deshmukh": {
    name: "Ananya Deshmukh",
    role: "Chief Foreign Correspondent",
    bio: "Award-winning journalist specializing in international relations, geopolitics, and environmental policy reporting across South Asia.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop",
    pdfUrl: "/documents/sample-issue.pdf",
  },
  "vikramaditya-sharma": {
    name: "Vikramaditya Sharma",
    role: "Senior Economic Editor",
    bio: "Former Financial Express columnist. Focuses on macroeconomic trends, trade policies, and monetary policy analysis.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    pdfUrl: "/documents/sample-issue.pdf",
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
        pdfUrl: (fetchedAuthor as any).pdfUrl || "/documents/sample-issue.pdf",
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
            <a
              href={author.pdfUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-rule rounded-md hover:bg-secondary transition-colors"
            >
              <Download className="h-4 w-4" /> Download PDF
            </a>
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
      <PdfBookViewer
        isOpen={isBookViewerOpen}
        onClose={() => setIsBookViewerOpen(false)}
        title={`${author.name} — Profile & Credentials`}
        pdfUrl={author.pdfUrl}
      />
    </PublicPage>
  );
}
