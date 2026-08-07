export interface PublicationDocument {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  type: 'weekly' | 'monthly' | 'special' | 'digital';
  pdfUrl: string;
  coverImage: string;
  createdAt: string;
  description: string;
  author?: string;
  issueCount?: number;
}

// Cover helper: for non-special types, use the PDF URL itself
// The publication cards will render a canvas thumbnail from page 1
const pdfCover = (pdfPath: string) => pdfPath;

export const PUBLICATION_DOCUMENTS: PublicationDocument[] = [
  {
    id: "pub-editor-honor",
    slug: "swathi-editor-garu",
    title: "Editor Garu: Five Decades of Swathi Journalism",
    subtitle: "Special Tribute Issue Honoring Founder Vemuri Balaram",
    type: "special",
    pdfUrl: "/documents/EDITOR GARI SANMANAPATRAM.pdf",
    coverImage: pdfCover("/documents/EDITOR GARU.pdf"),
    createdAt: "2025-01-01T00:00:00.000Z",
    description: "Official tribute issue and profile of Swathi Publications founder Vemuri Balaram.",
    author: "Vemuri Balaram",
  },
  {
    id: "pub-weekly-32-1",
    slug: "swathi-weekly-32-pages-issue-1",
    title: "Swathi Weekly (32 Pages - Issue 1)",
    subtitle: "Pages 10, 11",
    type: "weekly",
    pdfUrl: "/documents/weekly/32 Pages/10,11.pdf",
    coverImage: pdfCover("/documents/weekly/32 Pages/10,11.pdf"),
    createdAt: "2026-07-20T00:00:00.000Z",
    description: "Swathi Weekly 32 Pages Edition — contemporary commentary and short stories.",
    author: "Swathi Publications",
  },
  {
    id: "pub-weekly-32-2",
    slug: "swathi-weekly-32-pages-issue-2",
    title: "Swathi Weekly (32 Pages - Issue 2)",
    subtitle: "Pages 14, 15",
    type: "weekly",
    pdfUrl: "/documents/weekly/32 Pages/14,15.pdf",
    coverImage: pdfCover("/documents/weekly/32 Pages/14,15.pdf"),
    createdAt: "2026-07-13T00:00:00.000Z",
    description: "Swathi Weekly 32 Pages Edition — literary serialization.",
    author: "Swathi Publications",
  },
  {
    id: "pub-weekly-32-3",
    slug: "swathi-weekly-32-pages-issue-3",
    title: "Swathi Weekly (32 Pages - Issue 3)",
    subtitle: "Pages 16, 17",
    type: "weekly",
    pdfUrl: "/documents/weekly/32 Pages/16,17.pdf",
    coverImage: pdfCover("/documents/weekly/32 Pages/16,17.pdf"),
    createdAt: "2026-07-06T00:00:00.000Z",
    description: "Swathi Weekly 32 Pages Edition — cultural analysis.",
    author: "Swathi Publications",
  },
  {
    id: "pub-weekly-32-4",
    slug: "swathi-weekly-32-pages-issue-4",
    title: "Swathi Weekly (32 Pages - Issue 4)",
    subtitle: "Pages 60, 61",
    type: "weekly",
    pdfUrl: "/documents/weekly/32 Pages/60,61.pdf",
    coverImage: pdfCover("/documents/weekly/32 Pages/60,61.pdf"),
    createdAt: "2026-06-29T00:00:00.000Z",
    description: "Swathi Weekly 32 Pages Edition — serial novels and humor columns.",
    author: "Swathi Publications",
  },
  {
    id: "pub-weekly-32v2-1",
    slug: "swathi-weekly-32-pages-vol2-issue-1",
    title: "Swathi Weekly Vol. 2 (32 Pages)",
    subtitle: "Pages 10, 11, 12",
    type: "weekly",
    pdfUrl: "/documents/weekly/32 Pages 2/10,11,12.pdf",
    coverImage: pdfCover("/documents/weekly/32 Pages 2/10,11,12.pdf"),
    createdAt: "2026-06-22T00:00:00.000Z",
    description: "Swathi Weekly Vol. 2 — expanded features edition.",
    author: "Swathi Publications",
  },
  {
    id: "pub-weekly-40-1",
    slug: "swathi-weekly-40-pages-issue-1",
    title: "Swathi Weekly (40 Pages - Bumper 1)",
    subtitle: "Pages 20, 21",
    type: "weekly",
    pdfUrl: "/documents/weekly/40 Pages/20,21.pdf",
    coverImage: pdfCover("/documents/weekly/40 Pages/20,21.pdf"),
    createdAt: "2026-06-15T00:00:00.000Z",
    description: "Swathi Weekly 40 Pages Bumper Issue — full-length stories.",
    author: "Swathi Publications",
  },
  {
    id: "pub-weekly-40-2",
    slug: "swathi-weekly-40-pages-issue-2",
    title: "Swathi Weekly (40 Pages - Bumper 2)",
    subtitle: "Pages 22-26 Story Collection",
    type: "weekly",
    pdfUrl: "/documents/weekly/40 Pages/22,23,24,25,26.pdf",
    coverImage: pdfCover("/documents/weekly/40 Pages/22,23,24,25,26.pdf"),
    createdAt: "2026-06-08T00:00:00.000Z",
    description: "Swathi Weekly 40 Pages — special story collection.",
    author: "Swathi Publications",
  },
  {
    id: "pub-weekly-40-3",
    slug: "swathi-weekly-40-pages-issue-3",
    title: "Swathi Weekly (40 Pages - Bumper 3)",
    subtitle: "Pages 38-42 Family Digest",
    type: "weekly",
    pdfUrl: "/documents/weekly/40 Pages/38,39,40,41,42.pdf",
    coverImage: pdfCover("/documents/weekly/40 Pages/38,39,40,41,42.pdf"),
    createdAt: "2026-06-01T00:00:00.000Z",
    description: "Swathi Weekly 40 Pages Family Digest edition.",
    author: "Swathi Publications",
  },
  {
    id: "pub-weekly-40-4",
    slug: "swathi-weekly-40-pages-issue-4",
    title: "Swathi Weekly (40 Pages - Bumper 4)",
    subtitle: "Pages 48-53 Literary Omnibus",
    type: "weekly",
    pdfUrl: "/documents/weekly/40 Pages/48,49,50,51,52,53.pdf",
    coverImage: pdfCover("/documents/weekly/40 Pages/48,49,50,51,52,53.pdf"),
    createdAt: "2026-05-25T00:00:00.000Z",
    description: "Swathi Weekly 40 Pages Literary Omnibus.",
    author: "Swathi Publications",
  },
  {
    id: "pub-monthly-1",
    slug: "swathi-monthly-literary-edition",
    title: "Swathi Monthly Literary Edition",
    subtitle: "Essays, Features & Fiction",
    type: "monthly",
    pdfUrl: "/documents/weekly/40 Pages 2/24,25,26,27,28.pdf",
    coverImage: pdfCover("/documents/weekly/40 Pages 2/24,25,26,27,28.pdf"),
    createdAt: "2026-07-01T00:00:00.000Z",
    description: "Monthly flagship — long-form literature, essays, and cultural commentary.",
    author: "Swathi Publications",
  },
  {
    id: "pub-monthly-2",
    slug: "swathi-monthly-founders-issue",
    title: "Swathi Monthly Founder's Issue",
    subtitle: "Curated by Vemuri Balaram",
    type: "monthly",
    pdfUrl: "/documents/weekly/32 Pages/60,61.pdf",
    coverImage: pdfCover("/documents/weekly/32 Pages/60,61.pdf"),
    createdAt: "2026-06-01T00:00:00.000Z",
    description: "Special monthly compilation curated by founder Vemuri Balaram.",
    author: "Vemuri Balaram",
  },
  {
    id: "pub-digital-1",
    slug: "swathi-digital-interactive-edition",
    title: "Swathi Digital Interactive Edition",
    subtitle: "Full PDF Flipbook",
    type: "digital",
    pdfUrl: "/documents/weekly/32 Pages/62,63,64,65,66.pdf",
    coverImage: pdfCover("/documents/weekly/32 Pages/62,63,64,65,66.pdf"),
    createdAt: "2026-07-15T00:00:00.000Z",
    description: "Interactive digital edition optimized for reading across any screen size.",
    author: "Swathi Publications",
  },
  {
    id: "pub-ds-algo-python",
    slug: "data-structures-and-algorithms-python",
    title: "Data Structures and Algorithms in Python",
    subtitle: "Test Doc 720 Pages",
    type: "weekly",
    pdfUrl: "/documents/weekly/test doc 720 pages/Data Structures and Algorithms in Python.pdf",
    coverImage: pdfCover("/documents/weekly/test doc 720 pages/Data Structures and Algorithms in Python.pdf"),
    createdAt: "2026-08-07T00:00:00.000Z",
    description: "Data Structures and Algorithms in Python.",
    author: "Swathi Publications",
  }
];

export function getDocumentBySlug(slug: string): PublicationDocument | undefined {
  return PUBLICATION_DOCUMENTS.find((d) => d.slug === slug || d.id === slug);
}
