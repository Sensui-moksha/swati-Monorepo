import { BOOKS } from "./mock-books";

export type Author = { slug: string; name: string; role: string; bio: string; books: number; followers: number };
export const AUTHORS: Author[] = [
  { slug: "r-k-venkatesan", name: "Dr. R. K. Venkatesan", role: "Mathematician", bio: "Former professor of mathematics at IIT Madras with four decades of teaching and research.", books: 12, followers: 4820 },
  { slug: "meera-iyer", name: "Prof. Meera Iyer", role: "Constitutional Scholar", bio: "Author of the definitive text on Indian polity used in civil services preparation across the country.", books: 8, followers: 6210 },
  { slug: "a-krishnan", name: "Dr. A. Krishnan", role: "Physicist", bio: "Theoretical physicist and public science writer.", books: 6, followers: 3110 },
  { slug: "s-nandakumar", name: "S. Nandakumar", role: "Educator", bio: "Language teacher and author of practical grammar handbooks for two generations of students.", books: 15, followers: 2870 },
  { slug: "kavita-rao", name: "Dr. Kavita Rao", role: "Historian", bio: "Historian of the medieval Deccan; senior fellow at the Indian Historical Research Council.", books: 9, followers: 5390 },
  { slug: "p-anand", name: "Dr. P. Anand", role: "Anatomist", bio: "Clinician and educator; head of anatomical sciences at a leading medical college.", books: 5, followers: 1980 },
];

export type Publisher = { slug: string; name: string; founded: number; location: string; titles: number };
export const PUBLISHERS: Publisher[] = [
  { slug: "swathi-publications", name: "Swathi Publications", founded: 1982, location: "Vijayawada", titles: 348 },
  { slug: "swathi-academic-press", name: "Swathi Academic Press", founded: 1996, location: "Hyderabad", titles: 127 },
  { slug: "swathi-heritage", name: "Swathi Heritage Editions", founded: 2011, location: "Chennai", titles: 62 },
];

export type Issue = {
  id: string; slug: string; series: "weekly" | "monthly" | "special";
  title: string; number: number; date: string; cover: string; premium: boolean;
};
export const ISSUES: Issue[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `iss-${i + 1}`,
  slug: `issue-${i + 1}`,
  series: i % 6 === 0 ? "special" : i % 2 === 0 ? "monthly" : "weekly",
  title: [
    "The State of the Book", "New Voices, Fresh Pages", "The Digital Reading Report",
    "Heritage Editions", "The Author's Room", "Publishing After Print",
  ][i % 6],
  number: 100 - i,
  date: new Date(2026, 6 - Math.floor(i / 4), 28 - (i % 4) * 7).toISOString(),
  cover: BOOKS[i % BOOKS.length].cover,
  premium: i % 3 === 0,
}));

export type Order = { id: string; date: string; items: number; total: number; status: "Delivered" | "Processing" | "Shipped" | "Cancelled" };
export const ORDERS: Order[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `ORD-${90210 + i}`,
  date: new Date(2026, 5, 28 - i * 3).toISOString(),
  items: (i % 3) + 1,
  total: 349 + i * 220,
  status: (["Delivered", "Delivered", "Shipped", "Processing", "Delivered", "Cancelled", "Delivered", "Shipped"] as const)[i],
}));

export type Notification = { id: string; title: string; body: string; time: string; unread: boolean; type: "book" | "issue" | "system" | "billing" };
export const NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "New issue of Swathi Weekly", body: "Issue #100 is now available in your library.", time: "2h ago", unread: true, type: "issue" },
  { id: "n2", title: "Continue reading", body: "You left off at page 42 of Indian Polity.", time: "1d ago", unread: true, type: "book" },
  { id: "n3", title: "Payment successful", body: "Your Digital + Print renewal for July was processed.", time: "3d ago", unread: false, type: "billing" },
  { id: "n4", title: "New author you follow", body: "Prof. Meera Iyer published a new essay.", time: "4d ago", unread: false, type: "book" },
  { id: "n5", title: "System maintenance complete", body: "The reader has been updated with new themes.", time: "1w ago", unread: false, type: "system" },
];

export const READING_HISTORY = BOOKS.slice(0, 4).map((b, i) => ({
  book: b, page: 12 + i * 18, lastRead: `${i + 1}d ago`, progress: 20 + i * 18,
}));

export const BOOKMARKS = BOOKS.slice(1, 5).map((b) => ({ book: b, page: 24, note: "" }));

export const FAVORITES = BOOKS.slice(0, 3);

export const NOTES = BOOKS.slice(0, 3).map((b, i) => ({
  id: `note-${i}`, book: b, page: 12 + i * 4,
  excerpt: "The publishing house was founded on a simple premise: that books, properly made and honestly written, remain among the most durable technologies humans have devised.",
  note: ["Reference this in the essay.", "Compare to chapter 4 argument.", "Beautifully put."][i],
  color: ["#f5d76e", "#a8e6cf", "#ffb6b9"][i],
  date: "2026-07-08",
}));

export type CollectionT = { slug: string; name: string; desc: string; count: number; cover: string };
export const COLLECTIONS: CollectionT[] = [
  { slug: "civil-services", name: "Civil Services Essentials", desc: "The core reading list for UPSC aspirants.", count: 24, cover: BOOKS[1].cover },
  { slug: "science-foundations", name: "Science Foundations", desc: "Undergraduate and pre-degree science.", count: 18, cover: BOOKS[2].cover },
  { slug: "language-mastery", name: "Language Mastery", desc: "Grammar, composition, and comprehension.", count: 12, cover: BOOKS[3].cover },
  { slug: "history-shelves", name: "The History Shelves", desc: "From antiquity to the modern.", count: 20, cover: BOOKS[4].cover },
  { slug: "medical-reference", name: "Medical Reference", desc: "Working references for students of medicine.", count: 15, cover: BOOKS[5].cover },
];

export type Genre = { slug: string; name: string; count: number };
export const GENRES: Genre[] = [
  { slug: "reference", name: "Reference", count: 84 },
  { slug: "textbook", name: "Textbook", count: 132 },
  { slug: "handbook", name: "Handbook", count: 41 },
  { slug: "monograph", name: "Monograph", count: 27 },
  { slug: "anthology", name: "Anthology", count: 18 },
  { slug: "essay", name: "Essay Collection", count: 22 },
];

export type SeriesT = { slug: string; name: string; volumes: number; cover: string };
export const SERIES: SeriesT[] = [
  { slug: "indian-history", name: "Indian History", volumes: 4, cover: BOOKS[4].cover },
  { slug: "medical-atlas", name: "Medical Atlas", volumes: 6, cover: BOOKS[5].cover },
  { slug: "language-primers", name: "Language Primers", volumes: 3, cover: BOOKS[3].cover },
  { slug: "physics-frontiers", name: "Physics Frontiers", volumes: 5, cover: BOOKS[2].cover },
];

export const TAGS = ["Constitution", "Elections", "Economy", "Chemistry", "Biology", "Ancient India", "Medieval", "Grammar", "Reading Habits", "Digital Publishing", "Print"];

export const COUPONS = [
  { code: "SWATHI10", desc: "10% off first order", uses: 214, expires: "2026-12-31", status: "Active" },
  { code: "STUDENT25", desc: "25% off for verified students", uses: 892, expires: "2026-08-31", status: "Active" },
  { code: "WELCOME", desc: "Free shipping on first order", uses: 1204, expires: "2026-09-30", status: "Active" },
  { code: "MONSOON", desc: "15% off monsoon reading list", uses: 87, expires: "2026-07-15", status: "Expired" },
];

export const STAFF = [
  { name: "Aditi Menon", role: "Editor-in-Chief", email: "aditi@swathi.in", status: "Active" },
  { name: "Ravi Prasad", role: "Managing Editor", email: "ravi@swathi.in", status: "Active" },
  { name: "Neha Kulkarni", role: "Design Director", email: "neha@swathi.in", status: "Active" },
  { name: "Vikram Iyer", role: "Head of Digital", email: "vikram@swathi.in", status: "Active" },
  { name: "Priya Rao", role: "Production Manager", email: "priya@swathi.in", status: "On leave" },
];

export const ROLES = [
  { name: "Super Admin", desc: "Full access to all systems and data.", members: 2 },
  { name: "Editor", desc: "Manage content, publications, and articles.", members: 8 },
  { name: "Analyst", desc: "Read-only access to analytics and reports.", members: 5 },
  { name: "Support", desc: "Manage user accounts and customer tickets.", members: 4 },
  { name: "Contributor", desc: "Submit and edit their own drafts.", members: 34 },
];

export const AUDIT_LOG = Array.from({ length: 10 }).map((_, i) => ({
  id: `log-${i + 1}`,
  actor: ["aditi@swathi.in", "ravi@swathi.in", "system", "vikram@swathi.in", "neha@swathi.in"][i % 5],
  action: ["Updated book metadata", "Published article", "Refunded payment", "Suspended user", "Created coupon", "Edited role permissions", "Deleted draft", "Approved comment", "Renewed subscription", "Rotated API key"][i],
  target: ["bk-2", "a-4", "pay_20003", "u-1004", "STUDENT25", "Editor", "draft-88", "c-3", "u-1002", "webhook_v2"][i],
  ip: `192.168.1.${100 + i}`,
  time: `${i + 1}h ago`,
}));

export const REVENUE_TREND = [
  { month: "Feb", value: 820000 }, { month: "Mar", value: 910000 },
  { month: "Apr", value: 1_040_000 }, { month: "May", value: 1_120_000 },
  { month: "Jun", value: 1_210_000 }, { month: "Jul", value: 1_284_500 },
];

export const PLAN_BREAKDOWN = [
  { plan: "Digital", subs: 28430, share: 58.8 },
  { plan: "Digital + Print", subs: 14200, share: 29.4 },
  { plan: "Institutional", subs: 5690, share: 11.8 },
];
