import heroImg from "@/assets/hero-book.jpg";
import polityImg from "@/assets/book-polity.jpg";
import physicsImg from "@/assets/book-physics.jpg";
import englishImg from "@/assets/book-english.jpg";
import historyImg from "@/assets/book-history.jpg";
import anatomyImg from "@/assets/book-anatomy.jpg";

export const CATEGORIES = [
  { slug: "WEEKLY", name: "Politics", desc: "Breaking news and political analysis" },
  { slug: "MONTHLY", name: "Business", desc: "Market trends and business insights" },
  { slug: "BOOKS", name: "Technology", desc: "Latest in tech and innovation" },
];

export type Article = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  body: string[];
  author: string;
  authorRole: string;
  category: string;
  categoryName: string;
  image: string;
  date: string;
  readTime: string;
  premium: boolean;
  views: number;
  featured?: boolean;
};

const images = [heroImg, polityImg, physicsImg, englishImg, historyImg, anatomyImg];

const seed = [
  ["Union Budget Signals a Cautious Return to Growth", "A closer look at fiscal priorities, capex outlays, and the political calculus behind the numbers.", "politics"],
  ["Silicon Valley's Quiet Retreat From Consumer AI", "Investors are shifting focus from consumer chatbots to enterprise applications with clearer revenue paths.", "technology"],
  ["Rupee Steadies as RBI Signals Measured Intervention", "The central bank's dollar sales this week point to a new comfort band for the currency.", "business"],
  ["What the Latest Climate Report Really Says", "Beyond the headlines, scientists are documenting subtler shifts in monsoon patterns.", "science"],
  ["A Test Series That Redefined the New India", "Grit, generational change, and a captain who reads the room.", "sports"],
  ["The Return of the Regional Bookshop", "Independent stores across small-town India are quietly outperforming chains.", "culture"],
  ["Why the Coalition Math Suddenly Matters Again", "Regional allies are recalculating leverage ahead of the winter session.", "opinion"],
  ["Diplomacy in the Shadow of Elections", "How three capitals are managing pre-poll signalling without breaking channels.", "world"],
  ["Housing Finance Firms Under a New Rulebook", "Regulator's tighter lens on wholesale funding could reshape mid-tier lenders.", "business"],
  ["Chipmakers Chart a Post-Subsidy Landscape", "The next phase of India's semiconductor push depends on packaging, not fabs.", "technology"],
  ["The Long Road to Cleaner Urban Air", "Air-quality data reveals which interventions have actually moved the needle.", "science"],
  ["An Editor's Note on Truth in Slow Journalism", "Why we chose to hold this story for another week.", "opinion"],
];

export const ARTICLES: Article[] = seed.map((s, i) => ({
  id: `a-${i + 1}`,
  slug: s[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  title: s[0],
  subtitle: s[1],
  summary: s[1],
  body: [
    "In the opening weeks of the season, a familiar pattern re-emerged. Analysts, policymakers, and readers alike returned to the same question — what does the current moment actually demand of us?",
    "The evidence is not straightforward. Data points cut both ways, and the temptation to reach for a tidy narrative is strong. This story attempts something quieter: to lay out what is verifiable, what is contested, and what remains genuinely unknown.",
    "Interviews with more than a dozen practitioners over the past month reveal a consensus that is less about outcome than about process. The institutions involved appear to be relearning how to move deliberately.",
    "That deliberation, several observers noted, has costs. But its absence, they argued, would have been costlier still.",
  ],
  author: ["Aditi Menon", "Ravi Prasad", "Neha Kulkarni", "Vikram Iyer", "Priya Rao"][i % 5],
  authorRole: ["Senior Correspondent", "Political Editor", "Business Editor", "Science Writer", "Columnist"][i % 5],
  category: s[2],
  categoryName: CATEGORIES.find((c) => c.slug === s[2])?.name ?? s[2],
  image: images[i % images.length],
  date: new Date(2026, 6, 11 - i).toISOString(),
  readTime: `${4 + (i % 6)} min read`,
  premium: i % 3 === 0,
  views: 1000 + i * 347,
  featured: i === 0,
}));

export const FEATURED = ARTICLES[0];
export const TOP_STORIES = ARTICLES.slice(1, 5);
export const LATEST = ARTICLES.slice(5, 11);
export const TRENDING = [...ARTICLES].sort((a, b) => b.views - a.views).slice(0, 6);

export const TESTIMONIALS = [
  { name: "Dr. Meera Sundaram", role: "Professor, JNU", quote: "The kind of reporting that assumes its reader is intelligent. A rare thing." },
  { name: "Arjun Kapoor", role: "Founder, LedgerLabs", quote: "My morning read. Long-form when it earns it, brisk when it doesn't." },
  { name: "Shreya Nair", role: "Public Policy Analyst", quote: "Sober analysis without the theatrics of the news cycle." },
];

export const PLANS = [
  { name: "Digital", price: 199, period: "/month", features: ["Unlimited articles", "Daily newsletter", "Mobile app access"], cta: "Subscribe", featured: false },
  { name: "Digital + Print", price: 449, period: "/month", features: ["Everything in Digital", "Weekly print edition", "Home delivery", "Archive access"], cta: "Subscribe", featured: true },
  { name: "Institutional", price: 1999, period: "/month", features: ["Up to 25 seats", "SSO & admin console", "Priority support", "API access"], cta: "Contact sales", featured: false },
];

// Admin mock data
export const ADMIN_STATS = {
  revenue: 1_284_500,
  revenueDelta: 12.4,
  subscribers: 48_320,
  subscribersDelta: 5.1,
  activeUsers: 214_887,
  activeUsersDelta: 8.2,
  articlesPublished: 1_842,
  articlesDelta: 3.4,
};

export const ADMIN_USERS = Array.from({ length: 12 }).map((_, i) => ({
  id: `u-${1000 + i}`,
  name: ["Aarav Sharma","Diya Patel","Ishaan Reddy","Kavya Menon","Rohan Gupta","Saanvi Iyer","Vihaan Rao","Anaya Nair","Aryan Das","Myra Bose","Kabir Khan","Zara Ali"][i],
  email: `user${i + 1}@example.com`,
  plan: ["Free","Digital","Digital + Print","Digital","Free","Institutional","Digital","Digital + Print","Free","Digital","Digital","Free"][i],
  joined: `2026-0${(i % 9) + 1}-1${i % 9}`,
  status: i % 7 === 0 ? "Suspended" : "Active",
}));

export const ADMIN_PAYMENTS = Array.from({ length: 10 }).map((_, i) => ({
  id: `pay_${20000 + i}`,
  user: ADMIN_USERS[i % ADMIN_USERS.length].name,
  amount: [199, 449, 199, 1999, 449, 199, 199, 449, 199, 1999][i],
  method: ["UPI","Card","UPI","Bank","Card","UPI","Card","UPI","Card","Bank"][i],
  status: i === 3 ? "Refunded" : i === 7 ? "Failed" : "Succeeded",
  date: `2026-07-${10 - i}`,
}));

export const ADMIN_COMMENTS = Array.from({ length: 8 }).map((_, i) => ({
  id: `c-${i + 1}`,
  user: ADMIN_USERS[i].name,
  article: ARTICLES[i % ARTICLES.length].title,
  text: ["Well argued.","I disagree with paragraph three.","Where can I read more on this?","Excellent piece.","Please cover the state-level angle.","Sourcing feels thin here.","Bookmarked.","Been waiting for this analysis."][i],
  status: i % 5 === 0 ? "Flagged" : "Approved",
  date: `2026-07-${11 - i}`,
}));

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
