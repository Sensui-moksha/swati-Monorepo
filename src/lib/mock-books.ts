import polityImg from "@/assets/book-polity.jpg";
import physicsImg from "@/assets/book-physics.jpg";
import englishImg from "@/assets/book-english.jpg";
import historyImg from "@/assets/book-history.jpg";
import anatomyImg from "@/assets/book-anatomy.jpg";
import heroImg from "@/assets/hero-book.jpg";

export type BookPage = { heading?: string; paragraphs: string[]; chapter?: string };
export type Book = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  publisher: string;
  year: number;
  category: string;
  cover: string;
  spineColor: string;
  coverMaterial: "hardcover" | "softcover" | "leather" | "magazine" | "minimal";
  pages: BookPage[];
  chapters: { title: string; page: number }[];
  description: string;
  isbn: string;
  pageCount: number;
  language: string;
  rating: number;
  reviews: number;
  price: number;
};

const lorem = [
  "In the quiet hours before dawn, when the city itself seems to hold its breath, the reader arrives at the threshold of a new page. It is here, between the certainty of what came before and the promise of what follows, that the true act of reading begins.",
  "There is a discipline to attention that our age has all but forgotten. To sit with a paragraph until it yields its secrets. To let a sentence unfold at its own pace. To resist the urge to turn the page before the current one has been fully inhabited.",
  "The publishing house was founded on a simple premise: that books, properly made and honestly written, remain among the most durable technologies humans have devised. Nothing that has come since has replaced them, and nothing likely will.",
  "Consider, for a moment, the paper itself. The way it holds ink. The way it yields to the pressure of a finger at the corner. The way it carries, faintly, the smell of the mill where it was pressed. These are not incidental details. They are the medium.",
  "Our editors work slowly. This is deliberate. A manuscript that arrives in spring may not appear in print until the following autumn, or the one after that. In between, it is read and re-read, questioned, defended, revised. The book you hold is what remained.",
  "Chapters are old technology, but useful. They give the reader permission to pause. They mark the passage from one movement of thought to the next. A book without chapters asks its reader for a kind of endurance that few of us, honestly, can offer.",
];

function makePages(chapterTitles: string[]): { pages: BookPage[]; chapters: { title: string; page: number }[] } {
  const pages: BookPage[] = [];
  const chapters: { title: string; page: number }[] = [];
  chapterTitles.forEach((ct, ci) => {
    chapters.push({ title: ct, page: pages.length + 1 });
    pages.push({ chapter: ct, heading: ct, paragraphs: [lorem[ci % lorem.length], lorem[(ci + 1) % lorem.length]] });
    for (let p = 0; p < 3; p++) {
      pages.push({
        paragraphs: [
          lorem[(ci + p) % lorem.length],
          lorem[(ci + p + 2) % lorem.length],
          lorem[(ci + p + 4) % lorem.length],
        ],
      });
    }
  });
  return { pages, chapters };
}

const b1 = makePages(["Preface", "The First Principle", "On Method", "The Practitioner's Craft", "Conclusion"]);
const b2 = makePages(["Introduction", "Foundations", "Applications", "Case Studies", "Afterword"]);
const b3 = makePages(["Opening Notes", "A Short History", "The Present Moment", "What Remains"]);

export const BOOKS: Book[] = [
  {
    id: "bk-1", slug: "advanced-mathematics", title: "Advanced Mathematics for Competitive Exams",
    subtitle: "A Rigorous Preparation for Aspirants",
    author: "Dr. R. K. Venkatesan", publisher: "Swathi Publications", year: 2025,
    category: "Competitive Exams", cover: heroImg, spineColor: "#7a2323", coverMaterial: "hardcover",
    pages: b1.pages, chapters: b1.chapters,
    description: "A comprehensive, exam-focused treatment of quantitative reasoning, algebra, and analytical mathematics, prepared for candidates of India's toughest examinations.",
    isbn: "978-81-947384-1-2", pageCount: b1.pages.length, language: "English", rating: 4.7, reviews: 348, price: 649,
  },
  {
    id: "bk-2", slug: "indian-polity", title: "Indian Polity", subtitle: "Constitutional Foundations",
    author: "Prof. Meera Iyer", publisher: "Swathi Publications", year: 2024,
    category: "Civil Services", cover: polityImg, spineColor: "#2c3e50", coverMaterial: "leather",
    pages: b2.pages, chapters: b2.chapters,
    description: "The definitive text on the Indian constitutional order, updated to reflect the most recent amendments and jurisprudence.",
    isbn: "978-81-947384-2-9", pageCount: b2.pages.length, language: "English", rating: 4.8, reviews: 512, price: 549,
  },
  {
    id: "bk-3", slug: "modern-physics", title: "Modern Physics", subtitle: "From Classical Foundations to Quantum Frontiers",
    author: "Dr. A. Krishnan", publisher: "Swathi Publications", year: 2025,
    category: "Science", cover: physicsImg, spineColor: "#1e3a5f", coverMaterial: "hardcover",
    pages: b3.pages, chapters: b3.chapters,
    description: "An accessible, rigorous introduction to the modern physical picture of the world.",
    isbn: "978-81-947384-3-6", pageCount: b3.pages.length, language: "English", rating: 4.6, reviews: 221, price: 599,
  },
  {
    id: "bk-4", slug: "general-english", title: "General English Grammar", subtitle: "A Practical Handbook",
    author: "S. Nandakumar", publisher: "Swathi Publications", year: 2024,
    category: "Language", cover: englishImg, spineColor: "#4a3c2a", coverMaterial: "softcover",
    pages: b2.pages, chapters: b2.chapters,
    description: "Grammar, usage, and composition, presented with clarity and abundant examples.",
    isbn: "978-81-947384-4-3", pageCount: b2.pages.length, language: "English", rating: 4.4, reviews: 189, price: 349,
  },
  {
    id: "bk-5", slug: "indian-history-i", title: "Indian History, Volume I", subtitle: "Antiquity to the Medieval",
    author: "Dr. Kavita Rao", publisher: "Swathi Publications", year: 2023,
    category: "History", cover: historyImg, spineColor: "#5d2e1f", coverMaterial: "hardcover",
    pages: b1.pages, chapters: b1.chapters,
    description: "The first volume of a two-part historical survey, from the earliest civilizations of the subcontinent to the medieval sultanates.",
    isbn: "978-81-947384-5-0", pageCount: b1.pages.length, language: "English", rating: 4.9, reviews: 623, price: 699,
  },
  {
    id: "bk-6", slug: "human-anatomy", title: "Human Anatomy", subtitle: "An Illustrated Reference",
    author: "Dr. P. Anand", publisher: "Swathi Publications", year: 2025,
    category: "Medical", cover: anatomyImg, spineColor: "#3b3b3b", coverMaterial: "leather",
    pages: b3.pages, chapters: b3.chapters,
    description: "A working reference for students of medicine and allied health sciences.",
    isbn: "978-81-947384-6-7", pageCount: b3.pages.length, language: "English", rating: 4.7, reviews: 294, price: 899,
  },
];

export const bookBySlug = (slug: string) => BOOKS.find((b) => b.slug === slug);
export const bookById = (id: string) => BOOKS.find((b) => b.id === id);
