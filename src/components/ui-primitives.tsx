import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-rule pb-6 mb-8 flex flex-wrap items-end justify-between gap-4"
    >
      <div className="min-w-0">
        {eyebrow && <div className="text-xs uppercase tracking-[0.2em] text-primary mb-2">{eyebrow}</div>}
        <h1 className="font-serif text-3xl md:text-4xl leading-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
    </motion.div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-rule rounded-md py-16 text-center">
      <div className="font-serif text-2xl mb-2">{title}</div>
      <p className="text-muted-foreground max-w-md mx-auto text-sm">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-800",
    Suspended: "bg-red-100 text-red-800",
    Succeeded: "bg-emerald-100 text-emerald-800",
    Failed: "bg-red-100 text-red-800",
    Refunded: "bg-amber-100 text-amber-800",
    Approved: "bg-emerald-100 text-emerald-800",
    Flagged: "bg-amber-100 text-amber-800",
    Delivered: "bg-emerald-100 text-emerald-800",
    Shipped: "bg-blue-100 text-blue-800",
    Processing: "bg-amber-100 text-amber-800",
    Cancelled: "bg-neutral-200 text-neutral-700",
    Expired: "bg-neutral-200 text-neutral-700",
    Free: "bg-neutral-200 text-neutral-700",
    Digital: "bg-blue-100 text-blue-800",
    "Digital + Print": "bg-primary/15 text-primary",
    Institutional: "bg-purple-100 text-purple-800",
    "On leave": "bg-amber-100 text-amber-800",
  };
  return <span className={cn("inline-block text-xs px-2 py-0.5 rounded-full font-medium", map[status] ?? "bg-neutral-200 text-neutral-700")}>{status}</span>;
}

export function KpiCard({ label, value, delta, hint }: { label: string; value: string; delta?: number; hint?: string }) {
  return (
    <div className="bg-paper border border-rule rounded-md p-5">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-serif text-3xl">{value}</div>
      {delta !== undefined && (
        <div className={cn("text-xs mt-2", delta >= 0 ? "text-emerald-700" : "text-red-700")}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last period
        </div>
      )}
      {hint && <div className="text-xs text-muted-foreground mt-2">{hint}</div>}
    </div>
  );
}

export function Card({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-paper border border-rule rounded-md p-6", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="font-serif text-xl">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function BookCard({ book, size = "md", index = 0 }: { book: { slug: string; title: string; author?: string | { name?: string } | null; cover?: string; coverImage?: string | null; category?: string; format?: string }; size?: "sm" | "md" | "lg"; index?: number }) {
  const h = size === "sm" ? "h-48" : size === "lg" ? "h-80" : "h-64";
  const coverSrc = book.coverImage ?? book.cover ?? '';
  const authorName = typeof book.author === 'string' ? book.author : book.author?.name ?? '';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to="/library/book/$slug" params={{ slug: book.slug }} className="group block">
        <motion.div
          className={cn("relative overflow-hidden bg-secondary rounded-sm shadow-md", h)}
          whileHover={{ y: -6, rotateX: 4, rotateY: -4, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.4)" }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          style={{ transformStyle: "preserve-3d", perspective: 800 }}
        >
          <div className="skeleton absolute inset-0" aria-hidden />
          <img
            src={coverSrc}
            alt={book.title}
            loading="lazy"
            decoding="async"
            draggable={false}
            onLoad={(e) => { (e.currentTarget.previousSibling as HTMLElement | null)?.remove(); }}
            className="relative w-full h-full object-cover transition duration-500 group-hover:scale-[1.05]"
          />
          <div className="absolute inset-y-0 left-0 w-2 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
        </motion.div>
        <div className="mt-3">
          {book.category && <div className="text-xs uppercase tracking-widest text-primary mb-1">{book.category}</div>}
          <div className="font-serif text-base leading-snug group-hover:text-primary transition">{book.title}</div>
          <div className="text-xs text-muted-foreground mt-1">{authorName}</div>
        </div>
      </Link>
    </motion.div>
  );
}

export function SectionTitle({ eyebrow, title, href, hrefLabel }: { eyebrow?: string; title: string; href?: string; hrefLabel?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex items-end justify-between border-b border-rule pb-3 mb-6"
    >
      <div>
        {eyebrow && <div className="text-[10px] uppercase tracking-[0.2em] text-primary mb-1">{eyebrow}</div>}
        <h2 className="font-serif text-2xl">{title}</h2>
      </div>
      {href && <a href={href} className="text-xs uppercase tracking-widest text-primary hover:underline story-link">{hrefLabel ?? "See all"} →</a>}
    </motion.div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Btn({ children, variant = "primary", size = "md", className, ...rest }: { children: ReactNode; variant?: "primary" | "outline" | "ghost"; size?: "sm" | "md" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-rule hover:bg-secondary",
    ghost: "hover:bg-secondary",
  }[variant];
  const sizing = size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm";
  return <button {...rest} className={cn("inline-flex items-center justify-center font-medium rounded-md transition", sizing, styles, className)}>{children}</button>;
}

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-rule bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...rest}
    />
  );
}

export function Label({ className, children, ...rest }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...rest}
    >
      {children}
    </label>
  );
}
