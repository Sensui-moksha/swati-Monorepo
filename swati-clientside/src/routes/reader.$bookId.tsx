import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  List,
  Search,
  Bookmark,
  StickyNote,
  Palette,
  Type,
  Maximize2,
  Sun,
  Menu,
} from "lucide-react";
import { booksApi } from "@/lib/api/endpoints/books";
import { cn } from "@/lib/utils";

// Reader-specific types for page-based rendering (not from API)
type BookPage = { heading?: string; paragraphs: string[]; chapter?: string };
type Book = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author?: string;
  publisher?: string;
  year?: number;
  category?: string;
  cover?: string;
  spineColor?: string;
  coverMaterial?: "hardcover" | "softcover" | "leather" | "magazine" | "minimal";
  pages: BookPage[];
  chapters: { title: string; page: number }[];
  description?: string;
  isbn?: string;
  pageCount?: number;
  language?: string;
  rating?: number;
  reviews?: number;
  price?: number;
};

export const Route = createFileRoute("/reader/$bookId")({
  loader: async ({ params }) => {
    try {
      const res = await booksApi.get(params.bookId);
      const apiBook = res.data;
      if (!apiBook) throw notFound();
      // Map API Book to reader's Book shape
      const book: Book = {
        id: apiBook.id,
        slug: apiBook.slug,
        title: apiBook.title,
        subtitle: apiBook.description,
        author: apiBook.author?.name,
        publisher: apiBook.publisher?.name,
        year: apiBook.publishedAt ? new Date(apiBook.publishedAt).getFullYear() : undefined,
        category: apiBook.genres?.[0]?.name,
        cover: apiBook.coverImage,
        spineColor: "#7a2323",
        coverMaterial: "hardcover",
        pages: (apiBook.chapters ?? []).flatMap((ch) => [
          {
            chapter: ch.title,
            heading: ch.title,
            paragraphs: ch.content ? ch.content.split("\n\n") : ["Content loading..."],
          },
          ...Array.from({ length: 2 }, (_, i) => ({
            paragraphs: ch.content ? ch.content.split("\n\n").slice(i * 2, i * 2 + 3) : [""],
          })),
        ]),
        chapters: (apiBook.chapters ?? []).map((ch, i) => ({ title: ch.title, page: i * 3 + 1 })),
        description: apiBook.description,
        isbn: apiBook.isbn,
        pageCount: apiBook.pageCount,
        language: apiBook.language,
        price: apiBook.price,
      };
      return { book };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Reading — ${loaderData.book.title}` : "Reader" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReaderPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-neutral-950 text-neutral-100">
      <div className="text-center">
        <div className="font-serif text-4xl mb-2">Book not found</div>
        <Link to="/library" className="text-sm text-primary hover:underline">
          Return to library
        </Link>
      </div>
    </div>
  ),
});

type ReadingMode = "book" | "scroll" | "magazine" | "mobile";
type ThemeName = "hardcover" | "softcover" | "leather" | "magazine" | "minimal";

const THEMES: Record<
  ThemeName,
  { cover: string; spine: string; page: string; text: string; label: string }
> = {
  hardcover: {
    cover: "linear-gradient(135deg, #7a2323 0%, #5b1919 60%, #3d1010 100%)",
    spine: "#3d1010",
    page: "#f8f1e1",
    text: "#1a1a1a",
    label: "Hardcover",
  },
  softcover: {
    cover: "linear-gradient(135deg, #2c3e50 0%, #1f2c3a 100%)",
    spine: "#141c25",
    page: "#faf6ee",
    text: "#1a1a1a",
    label: "Softcover",
  },
  leather: {
    cover: "linear-gradient(135deg, #3b2418 0%, #2a1a10 60%, #1a0f08 100%)",
    spine: "#1a0f08",
    page: "#f2e8d5",
    text: "#1a1410",
    label: "Leather Bound",
  },
  magazine: {
    cover: "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)",
    spine: "#450a0a",
    page: "#ffffff",
    text: "#111111",
    label: "Magazine",
  },
  minimal: {
    cover: "linear-gradient(135deg, #e5e7eb 0%, #cbd5e1 100%)",
    spine: "#94a3b8",
    page: "#fdfdfd",
    text: "#111111",
    label: "Minimal",
  },
};

function ReaderPage() {
  const { book } = Route.useLoaderData();
  const [opened, setOpened] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [mode, setMode] = useState<ReadingMode>("book");
  const [theme, setTheme] = useState<ThemeName>((book.coverMaterial as ThemeName) ?? "hardcover");
  const [sidebar, setSidebar] = useState<
    null | "toc" | "thumbs" | "search" | "bookmarks" | "notes"
  >(null);
  const [fontSize, setFontSize] = useState(16);
  const [brightness, setBrightness] = useState(100);
  const [turning, setTurning] = useState<null | "next" | "prev">(null);
  const reduce = useReducedMotion();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const turnMs = reduce ? 0 : isMobile ? 420 : 700;

  const totalSpreads = Math.ceil(book.pages.length / 2);
  const themeCfg = THEMES[theme];

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) setMode("mobile");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!opened) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") next();
      if (e.key === "ArrowLeft" || e.key === "PageUp") prev();
      if (e.key === "Home") setCurrentSpread(0);
      if (e.key === "End") setCurrentSpread(totalSpreads - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, currentSpread, totalSpreads]);

  const next = () => {
    if (currentSpread >= totalSpreads - 1) return;
    setTurning("next");
    setTimeout(() => {
      setCurrentSpread((s) => s + 1);
      setTurning(null);
    }, turnMs);
  };
  const prev = () => {
    if (currentSpread <= 0) return;
    setTurning("prev");
    setTimeout(() => {
      setCurrentSpread((s) => s - 1);
      setTurning(null);
    }, turnMs);
  };

  return (
    <div
      className="min-h-screen text-neutral-100 overflow-hidden relative"
      style={{
        background: "radial-gradient(circle at center, #1a1410 0%, #0a0806 100%)",
        filter: `brightness(${brightness}%)`,
      }}
    >
      <ReaderChrome
        book={book}
        mode={mode}
        setMode={setMode}
        theme={theme}
        setTheme={setTheme}
        sidebar={sidebar}
        setSidebar={setSidebar}
        fontSize={fontSize}
        setFontSize={setFontSize}
        brightness={brightness}
        setBrightness={setBrightness}
      />

      <AnimatePresence mode="wait">
        {!opened ? (
          <ClosedBook key="closed" book={book} theme={themeCfg} onOpen={() => setOpened(true)} />
        ) : mode === "book" ? (
          <TwoPageSpread
            key="book"
            book={book}
            theme={themeCfg}
            currentSpread={currentSpread}
            turning={turning}
            fontSize={fontSize}
            onNext={next}
            onPrev={prev}
          />
        ) : mode === "scroll" ? (
          <ScrollMode key="scroll" book={book} theme={themeCfg} fontSize={fontSize} />
        ) : mode === "magazine" ? (
          <MagazineMode
            key="mag"
            book={book}
            theme={themeCfg}
            currentSpread={currentSpread}
            onNext={next}
            onPrev={prev}
          />
        ) : (
          <MobileMode
            key="mob"
            book={book}
            theme={themeCfg}
            currentSpread={currentSpread}
            onNext={next}
            onPrev={prev}
            fontSize={fontSize}
          />
        )}
      </AnimatePresence>

      {opened && (
        <ReaderBottomBar
          current={currentSpread * 2 + 1}
          total={book.pages.length}
          onNext={next}
          onPrev={prev}
          onJump={(p) => setCurrentSpread(Math.floor((p - 1) / 2))}
          chapters={book.chapters}
          totalPages={book.pages.length}
        />
      )}

      <ReaderSidebar
        book={book}
        sidebar={sidebar}
        onClose={() => setSidebar(null)}
        onGoto={(p) => {
          setCurrentSpread(Math.floor((p - 1) / 2));
          setSidebar(null);
        }}
      />
    </div>
  );
}

function ClosedBook({
  book,
  theme,
  onOpen,
}: {
  book: Book;
  theme: (typeof THEMES)[ThemeName];
  onOpen: () => void;
}) {
  return (
    <motion.div
      key="closed"
      className="min-h-screen grid place-items-center px-4 pt-24 pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div style={{ perspective: 2000 }}>
        <motion.button
          onClick={onOpen}
          className="relative cursor-pointer group"
          initial={{ y: 40, opacity: 0, rotateY: -20 }}
          animate={{ y: 0, opacity: 1, rotateY: -8 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ rotateY: -14, y: -4 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Book body */}
          <div
            className="relative w-[320px] h-[460px] md:w-[380px] md:h-[540px] rounded-r-sm shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]"
            style={{ background: theme.cover, transformStyle: "preserve-3d" }}
          >
            {/* Spine */}
            <div
              className="absolute left-0 top-0 bottom-0 w-6 rounded-l-sm"
              style={{
                background: theme.spine,
                transform: "translateX(-24px) rotateY(90deg)",
                transformOrigin: "right center",
                boxShadow: "inset -4px 0 8px rgba(0,0,0,0.4)",
              }}
            />
            {/* Front cover art */}
            <img
              src={book.cover}
              alt={book.title}
              className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-black/25" />
            {/* Emboss */}
            <div className="absolute inset-6 border border-white/20 rounded-sm" />
            <div className="absolute inset-x-0 top-14 text-center px-8">
              <div className="text-[10px] tracking-[0.4em] text-white/70 uppercase mb-4">
                {book.publisher}
              </div>
              <div className="font-serif text-2xl md:text-3xl text-white leading-tight">
                {book.title}
              </div>
              <div className="mt-3 h-px w-16 bg-white/40 mx-auto" />
              <div className="mt-3 text-xs text-white/70 italic">{book.subtitle}</div>
            </div>
            <div className="absolute inset-x-0 bottom-8 text-center">
              <div className="text-xs tracking-[0.3em] uppercase text-white/80">{book.author}</div>
            </div>
            {/* Page edges */}
            <div className="absolute -right-2 top-2 bottom-2 w-2 bg-gradient-to-b from-white/90 via-white/70 to-white/90 shadow-md" />
            {/* Paper texture */}
            <div
              className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
              }}
            />
          </div>
          <div className="mt-8 text-center text-neutral-400 text-sm uppercase tracking-[0.3em] group-hover:text-neutral-100 transition">
            Click to open
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}

function Page({
  page,
  side,
  theme,
  fontSize,
  num,
}: {
  page?: BookPage;
  side: "left" | "right";
  theme: (typeof THEMES)[ThemeName];
  fontSize: number;
  num: number;
}) {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: theme.page,
        color: theme.text,
        boxShadow:
          side === "left"
            ? "inset -12px 0 24px -12px rgba(0,0,0,0.3)"
            : "inset 12px 0 24px -12px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='2'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="px-10 md:px-14 py-10 md:py-14 h-full flex flex-col" style={{ fontSize }}>
        {page ? (
          <>
            {page.chapter && page.heading && (
              <div className="mb-6">
                <div className="text-[10px] uppercase tracking-[0.3em] opacity-60">Chapter</div>
                <div className="font-serif text-3xl mt-1">{page.heading}</div>
                <div className="mt-3 h-px w-12 bg-current opacity-30" />
              </div>
            )}
            <div className="flex-1 space-y-4 font-serif leading-relaxed" style={{ columnCount: 1 }}>
              {page.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0 && !page.heading
                      ? "first-letter:font-serif first-letter:text-5xl first-letter:float-left first-letter:mr-2 first-letter:leading-none"
                      : ""
                  }
                >
                  {p}
                </p>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1" />
        )}
        <div className="pt-4 flex items-center justify-between text-xs opacity-60">
          <span className="italic">{page?.chapter ?? ""}</span>
          <span>{num}</span>
        </div>
      </div>
    </div>
  );
}

function TwoPageSpread({
  book,
  theme,
  currentSpread,
  turning,
  fontSize,
  onNext,
  onPrev,
}: {
  book: Book;
  theme: (typeof THEMES)[ThemeName];
  currentSpread: number;
  turning: null | "next" | "prev";
  fontSize: number;
  onNext: () => void;
  onPrev: () => void;
}) {
  const leftIdx = currentSpread * 2;
  const rightIdx = leftIdx + 1;
  const leftPage = book.pages[leftIdx];
  const rightPage = book.pages[rightIdx];
  const nextRight = book.pages[rightIdx + 2];
  const prevLeft = book.pages[leftIdx - 2];

  const dragX = useMotionValue(0);
  const rotY = useTransform(dragX, [-300, 0], [-180, 0]);

  return (
    <motion.div
      key="book-mode"
      className="min-h-screen grid place-items-center px-4 pt-24 pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative" style={{ perspective: 2500 }}>
        {/* Book base with spine */}
        <div
          className="relative flex shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden"
          style={{
            width: "min(90vw, 1000px)",
            height: "min(70vh, 640px)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Left page */}
          <div className="relative w-1/2 h-full">
            <Page page={leftPage} side="left" theme={theme} fontSize={fontSize} num={leftIdx + 1} />
            {/* Prev edge click zone */}
            <button
              aria-label="Previous page"
              onClick={onPrev}
              className="absolute inset-y-0 left-0 w-10 cursor-w-resize hover:bg-white/5"
            />
          </div>
          {/* Spine */}
          <div
            className="w-1.5 h-full"
            style={{
              background: `linear-gradient(90deg, rgba(0,0,0,0.4), rgba(0,0,0,0.15), rgba(0,0,0,0.4))`,
            }}
          />
          {/* Right page */}
          <div className="relative w-1/2 h-full">
            <Page
              page={rightPage}
              side="right"
              theme={theme}
              fontSize={fontSize}
              num={rightIdx + 1}
            />
            <button
              aria-label="Next page"
              onClick={onNext}
              className="absolute inset-y-0 right-0 w-10 cursor-e-resize hover:bg-white/5"
            />
          </div>

          {/* Turning next page (right side flips left) */}
          <AnimatePresence>
            {turning === "next" && (
              <motion.div
                key="turn-next"
                className="absolute top-0 right-0 w-1/2 h-full origin-left"
                style={{ transformStyle: "preserve-3d" }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -180 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              >
                <div
                  className="absolute inset-0 backface-hidden"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <Page
                    page={rightPage}
                    side="right"
                    theme={theme}
                    fontSize={fontSize}
                    num={rightIdx + 1}
                  />
                </div>
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <Page
                    page={nextRight ? book.pages[rightIdx + 1] : undefined}
                    side="left"
                    theme={theme}
                    fontSize={fontSize}
                    num={rightIdx + 2}
                  />
                </div>
                {/* Shadow across fold */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, rgba(0,0,0,0.3), rgba(0,0,0,0.1))",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.7 }}
                />
              </motion.div>
            )}
            {turning === "prev" && (
              <motion.div
                key="turn-prev"
                className="absolute top-0 left-0 w-1/2 h-full origin-right"
                style={{ transformStyle: "preserve-3d" }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 180 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
                  <Page
                    page={leftPage}
                    side="left"
                    theme={theme}
                    fontSize={fontSize}
                    num={leftIdx + 1}
                  />
                </div>
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <Page
                    page={prevLeft ? book.pages[leftIdx - 1] : undefined}
                    side="right"
                    theme={theme}
                    fontSize={fontSize}
                    num={leftIdx}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner drag hint */}
          <motion.div
            className="absolute bottom-0 right-0 w-24 h-24 pointer-events-auto cursor-grab"
            drag="x"
            dragConstraints={{ left: -300, right: 0 }}
            dragElastic={0.2}
            style={{ x: dragX }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -120) onNext();
              dragX.set(0);
            }}
          >
            <motion.div
              className="absolute inset-0 origin-top-left"
              style={{ rotateY: rotY, transformStyle: "preserve-3d" }}
            >
              <div
                className="absolute bottom-0 right-0 w-0 h-0 border-b-[96px] border-l-[96px] border-b-transparent"
                style={{
                  borderLeftColor: theme.page,
                  filter: "drop-shadow(-4px 4px 6px rgba(0,0,0,0.3))",
                }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Page-edge thickness */}
        <div
          className="absolute -left-3 top-3 bottom-3 w-3 rounded-l-sm shadow-inner"
          style={{
            background: `repeating-linear-gradient(to bottom, ${theme.page}, ${theme.page} 1px, rgba(0,0,0,0.06) 2px)`,
          }}
        />
        <div
          className="absolute -right-3 top-3 bottom-3 w-3 rounded-r-sm shadow-inner"
          style={{
            background: `repeating-linear-gradient(to bottom, ${theme.page}, ${theme.page} 1px, rgba(0,0,0,0.06) 2px)`,
          }}
        />
      </div>

      <div className="fixed left-1/2 -translate-x-1/2 bottom-24 flex gap-2 z-40">
        <button
          onClick={onPrev}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onNext}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

function ScrollMode({
  book,
  theme,
  fontSize,
}: {
  book: Book;
  theme: (typeof THEMES)[ThemeName];
  fontSize: number;
}) {
  return (
    <motion.div
      key="scroll"
      className="pt-24 pb-32 min-h-screen px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {book.pages.map((p, i) => (
          <div
            key={i}
            className="rounded-sm shadow-2xl overflow-hidden"
            style={{ background: theme.page, color: theme.text }}
          >
            <div className="px-10 py-12" style={{ fontSize }}>
              {p.heading && <div className="font-serif text-2xl mb-4">{p.heading}</div>}
              <div className="space-y-4 font-serif leading-relaxed">
                {p.paragraphs.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
              <div className="text-xs opacity-50 text-right mt-6">— {i + 1} —</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MagazineMode({
  book,
  theme,
  currentSpread,
  onNext,
  onPrev,
}: {
  book: Book;
  theme: (typeof THEMES)[ThemeName];
  currentSpread: number;
  onNext: () => void;
  onPrev: () => void;
}) {
  const p = book.pages[currentSpread];
  return (
    <motion.div
      key="mag"
      className="min-h-screen grid place-items-center pt-24 pb-32 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        key={currentSpread}
        className="relative rounded-sm overflow-hidden shadow-2xl grid md:grid-cols-2"
        style={{
          background: theme.page,
          color: theme.text,
          width: "min(95vw, 1200px)",
          height: "min(75vh, 720px)",
        }}
        initial={{ rotateY: 15, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative h-full">
          <img src={book.cover} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="text-xs uppercase tracking-[0.3em] text-white/80">{book.category}</div>
            <div className="font-serif text-4xl text-white mt-2">{p?.heading ?? book.title}</div>
          </div>
        </div>
        <div className="p-10 md:p-14 flex flex-col">
          <div className="flex-1 font-serif text-lg leading-relaxed space-y-5">
            {p?.paragraphs.map((x, i) => (
              <p key={i}>{x}</p>
            ))}
          </div>
          <div className="flex justify-between text-xs opacity-60 pt-6">
            <span>{book.publisher}</span>
            <span>
              {currentSpread + 1} / {book.pages.length}
            </span>
          </div>
        </div>
      </motion.div>
      <div className="fixed inset-y-0 left-0 w-12 flex items-center">
        <button
          onClick={onPrev}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur rounded-r"
        >
          <ChevronLeft />
        </button>
      </div>
      <div className="fixed inset-y-0 right-0 w-12 flex items-center justify-end">
        <button
          onClick={onNext}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur rounded-l"
        >
          <ChevronRight />
        </button>
      </div>
    </motion.div>
  );
}

function MobileMode({
  book,
  theme,
  currentSpread,
  onNext,
  onPrev,
  fontSize,
}: {
  book: Book;
  theme: (typeof THEMES)[ThemeName];
  currentSpread: number;
  onNext: () => void;
  onPrev: () => void;
  fontSize: number;
}) {
  const p = book.pages[currentSpread];
  const prevP = book.pages[currentSpread - 1];
  const nextP = book.pages[currentSpread + 1];
  const x = useMotionValue(0);
  const rotateY = useTransform(x, [-320, 0, 320], [-160, 0, 160]);
  const shadowOpacity = useTransform(x, [-320, 0, 320], [0.5, 0, 0.5]);
  const origin = useTransform(x, (v) => (v < 0 ? "left center" : "right center"));

  return (
    <motion.div
      key="mob"
      className="min-h-screen grid place-items-center pt-24 pb-32 px-3 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative w-full max-w-md h-[70vh]" style={{ perspective: 1800 }}>
        <div
          className="absolute inset-0 rounded-sm shadow-2xl overflow-hidden"
          style={{ background: theme.page, color: theme.text }}
        >
          <Page
            page={nextP ?? prevP ?? p}
            side="right"
            theme={theme}
            fontSize={fontSize}
            num={currentSpread + 2}
          />
        </div>
        <motion.div
          key={currentSpread}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.9}
          style={{ x, rotateY, transformOrigin: origin, transformStyle: "preserve-3d" }}
          onDragEnd={(_, info) => {
            const swipe = Math.abs(info.offset.x) * 0.7 + Math.abs(info.velocity.x) * 0.3;
            if (swipe > 120) {
              if (info.offset.x < 0) onNext();
              else onPrev();
            }
          }}
          initial={{ x: 80, opacity: 0, rotateY: 20 }}
          animate={{ x: 0, opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="absolute inset-0 rounded-sm shadow-2xl overflow-hidden touch-pan-y"
          whileTap={{ cursor: "grabbing" }}
        >
          <div
            className="w-full h-full relative"
            style={{ background: theme.page, color: theme.text }}
          >
            <Page page={p} side="right" theme={theme} fontSize={fontSize} num={currentSpread + 1} />
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                opacity: shadowOpacity,
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.35), transparent 30%, transparent 70%, rgba(0,0,0,0.35))",
              }}
            />
            <button
              aria-label="prev"
              onClick={onPrev}
              className="absolute inset-y-0 left-0 w-1/4"
            />
            <button
              aria-label="next"
              onClick={onNext}
              className="absolute inset-y-0 right-0 w-1/4"
            />
          </div>
        </motion.div>
      </div>
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/40">
        Swipe to turn the page
      </div>
    </motion.div>
  );
}

function ReaderChrome(props: {
  book: Book;
  mode: ReadingMode;
  setMode: (m: ReadingMode) => void;
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  sidebar: null | "toc" | "thumbs" | "search" | "bookmarks" | "notes";
  setSidebar: (s: any) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  brightness: number;
  setBrightness: (n: number) => void;
}) {
  const {
    book,
    mode,
    setMode,
    theme,
    setTheme,
    sidebar,
    setSidebar,
    fontSize,
    setFontSize,
    brightness,
    setBrightness,
  } = props;
  return (
    <div className="fixed top-0 inset-x-0 z-40 backdrop-blur bg-black/40 border-b border-white/10">
      <div className="flex items-center gap-3 px-4 h-16">
        <Link to="/library" className="p-2 rounded hover:bg-white/10">
          <X className="w-4 h-4" />
        </Link>
        <div className="hidden md:block min-w-0">
          <div className="text-xs opacity-60">Now reading</div>
          <div className="font-serif text-sm truncate">{book.title}</div>
        </div>
        <div className="flex-1" />
        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1">
          {(["book", "scroll", "magazine", "mobile"] as ReadingMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "text-xs px-3 py-1 rounded-full capitalize",
                mode === m ? "bg-white text-neutral-900" : "hover:bg-white/10",
              )}
            >
              {m === "book"
                ? "Real Book"
                : m === "scroll"
                  ? "Scroll"
                  : m === "magazine"
                    ? "Magazine"
                    : "Mobile"}
            </button>
          ))}
        </div>
        <IconBtn label="Contents" onClick={() => setSidebar(sidebar === "toc" ? null : "toc")}>
          <List className="w-4 h-4" />
        </IconBtn>
        <IconBtn label="Thumbs" onClick={() => setSidebar(sidebar === "thumbs" ? null : "thumbs")}>
          <Menu className="w-4 h-4" />
        </IconBtn>
        <IconBtn label="Search" onClick={() => setSidebar(sidebar === "search" ? null : "search")}>
          <Search className="w-4 h-4" />
        </IconBtn>
        <IconBtn
          label="Bookmarks"
          onClick={() => setSidebar(sidebar === "bookmarks" ? null : "bookmarks")}
        >
          <Bookmark className="w-4 h-4" />
        </IconBtn>
        <IconBtn label="Notes" onClick={() => setSidebar(sidebar === "notes" ? null : "notes")}>
          <StickyNote className="w-4 h-4" />
        </IconBtn>
        <details className="relative">
          <summary className="list-none p-2 rounded hover:bg-white/10 cursor-pointer">
            <Palette className="w-4 h-4" />
          </summary>
          <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-white/10 rounded-md p-3 space-y-2 text-xs">
            <div className="opacity-60 uppercase tracking-widest">Theme</div>
            {(Object.keys(THEMES) as ThemeName[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "w-full flex items-center gap-2 p-1.5 rounded",
                  theme === t && "bg-white/10",
                )}
              >
                <span className="w-6 h-6 rounded-sm" style={{ background: THEMES[t].cover }} />
                <span>{THEMES[t].label}</span>
              </button>
            ))}
            <div className="opacity-60 uppercase tracking-widest pt-2">Font size {fontSize}</div>
            <input
              type="range"
              min={12}
              max={22}
              value={fontSize}
              onChange={(e) => setFontSize(+e.target.value)}
              className="w-full"
            />
            <div className="opacity-60 uppercase tracking-widest pt-2 flex items-center gap-1">
              <Sun className="w-3 h-3" /> Brightness {brightness}%
            </div>
            <input
              type="range"
              min={40}
              max={110}
              value={brightness}
              onChange={(e) => setBrightness(+e.target.value)}
              className="w-full"
            />
          </div>
        </details>
        <IconBtn label="Fullscreen" onClick={() => document.documentElement.requestFullscreen?.()}>
          <Maximize2 className="w-4 h-4" />
        </IconBtn>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button aria-label={label} onClick={onClick} className="p-2 rounded hover:bg-white/10">
      {children}
    </button>
  );
}

function ReaderBottomBar({
  current,
  total,
  onPrev,
  onNext,
  onJump,
  chapters,
  totalPages,
}: {
  current: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onJump: (p: number) => void;
  chapters: { title: string; page: number }[];
  totalPages: number;
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 backdrop-blur bg-black/50 border-t border-white/10 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center gap-4">
        <button onClick={onPrev} className="p-1.5 rounded hover:bg-white/10">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-xs opacity-70 tabular-nums whitespace-nowrap">
          Page {current} / {total}
        </div>
        <div className="relative flex-1">
          <input
            type="range"
            min={1}
            max={totalPages}
            value={current}
            onChange={(e) => onJump(+e.target.value)}
            className="w-full accent-primary"
          />
          <div className="absolute inset-x-0 -top-2 pointer-events-none">
            {chapters.map((c) => (
              <div
                key={c.page}
                className="absolute w-px h-2 bg-white/40"
                style={{ left: `${(c.page / totalPages) * 100}%` }}
                title={c.title}
              />
            ))}
          </div>
        </div>
        <input
          type="number"
          min={1}
          max={totalPages}
          placeholder="Go"
          onKeyDown={(e) => {
            if (e.key === "Enter") onJump(+(e.target as HTMLInputElement).value);
          }}
          className="w-16 text-xs px-2 py-1 rounded bg-white/10 border border-white/10 outline-none"
        />
        <button onClick={onNext} className="p-1.5 rounded hover:bg-white/10">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ReaderSidebar({
  book,
  sidebar,
  onClose,
  onGoto,
}: {
  book: Book;
  sidebar: null | "toc" | "thumbs" | "search" | "bookmarks" | "notes";
  onClose: () => void;
  onGoto: (page: number) => void;
}) {
  return (
    <AnimatePresence>
      {sidebar && (
        <motion.aside
          initial={{ x: -320 }}
          animate={{ x: 0 }}
          exit={{ x: -320 }}
          transition={{ duration: 0.25 }}
          className="fixed top-16 bottom-16 left-0 w-80 bg-neutral-950/95 backdrop-blur border-r border-white/10 z-30 overflow-y-auto"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-serif text-lg capitalize">
                {sidebar === "toc" ? "Contents" : sidebar}
              </div>
              <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            {sidebar === "toc" && (
              <ul className="space-y-1">
                {book.chapters.map((c) => (
                  <li key={c.page}>
                    <button
                      onClick={() => onGoto(c.page)}
                      className="w-full text-left px-2 py-2 rounded hover:bg-white/10 flex justify-between text-sm"
                    >
                      <span>{c.title}</span>
                      <span className="opacity-50 tabular-nums">{c.page}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {sidebar === "thumbs" && (
              <div className="grid grid-cols-3 gap-2">
                {book.pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onGoto(i + 1)}
                    className="aspect-[3/4] bg-neutral-800 rounded text-xs flex items-end justify-center p-1 hover:bg-neutral-700"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
            {sidebar === "search" && (
              <div>
                <input
                  placeholder="Search inside this book"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm outline-none"
                />
                <div className="mt-4 text-xs opacity-60">Type to search. Results appear here.</div>
              </div>
            )}
            {sidebar === "bookmarks" && <ReaderBookmarks onGoto={onGoto} />}
            {sidebar === "notes" && <ReaderNotes onGoto={onGoto} />}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

import { useBookmarks, useNotes } from "@/lib/api/hooks";

function ReaderBookmarks({ onGoto }: { onGoto: (page: number) => void }) {
  const { data: bookmarksData, isLoading } = useBookmarks();
  const bookmarks = bookmarksData?.data || [];

  if (isLoading) return <div className="text-sm opacity-60">Loading bookmarks...</div>;
  if (bookmarks.length === 0) return <div className="text-sm opacity-60">No bookmarks yet.</div>;

  return (
    <div className="space-y-2 text-sm">
      {bookmarks.map((p: number) => (
        <button
          key={p}
          onClick={() => onGoto(p)}
          className="w-full text-left p-2 rounded hover:bg-white/10 flex items-center gap-2"
        >
          <Bookmark className="w-4 h-4 text-primary" />
          <span>Page {p}</span>
        </button>
      ))}
    </div>
  );
}

function ReaderNotes({ onGoto }: { onGoto: (page: number) => void }) {
  const { data: notesData, isLoading } = useNotes();
  const notes = notesData?.data || [];

  if (isLoading) return <div className="text-sm opacity-60">Loading notes...</div>;
  if (notes.length === 0) return <div className="text-sm opacity-60">No notes yet.</div>;

  return (
    <div className="space-y-3 text-sm">
      {notes.map((n: { p: number; t: string }, i: number) => (
        <button
          key={i}
          onClick={() => onGoto(n.p)}
          className="w-full text-left p-3 rounded bg-white/5 hover:bg-white/10 block"
        >
          <div className="text-xs opacity-60">Page {n.p}</div>
          <div>{n.t}</div>
        </button>
      ))}
    </div>
  );
}
