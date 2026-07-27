import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { PageHeader, EmptyState, Btn } from "./ui-primitives";

/** Wrap any public route in the full site chrome with an editorial page header. */
export function PublicPage({
  eyebrow, title, description, children,
}: { eyebrow?: string; title: string; description?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-10 md:py-14">
        <PageHeader eyebrow={eyebrow} title={title} description={description} />
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

/** Bare template for stub/mock pages that still look intentional. */
export function StubPage({ title, description, sections }:
  { title: string; description?: string; sections?: { title: string; items: string[] }[] }) {
  return (
    <PublicPage title={title} description={description ?? "This page is part of the Swathi Publications prototype. Content shown here is illustrative."}>
      {sections ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((s) => (
            <div key={s.title} className="border border-rule rounded-md p-6 bg-paper">
              <div className="font-serif text-xl mb-3">{s.title}</div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {s.items.map((i) => <li key={i} className="flex gap-2"><span className="text-primary">›</span>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Nothing here yet" body="Content for this section is being prepared." action={<Btn>Explore the archive</Btn>} />
      )}
    </PublicPage>
  );
}

/** Dashboard chrome with sidebar for the reader account area. */
const DASH_LINKS = [
  { to: "/dashboard", label: "Overview" },
  { to: "/dashboard/continue", label: "Continue Reading" },
  { to: "/dashboard/recommended", label: "Recommended" },
  { to: "/dashboard/trending", label: "Trending" },
  { to: "/dashboard/activity", label: "Activity" },
  { to: "/dashboard/notifications", label: "Notifications" },
  { to: "/dashboard/stats", label: "Reading Stats" },
  { to: "/account", label: "Profile" },
  { to: "/account/bookmarks", label: "Bookmarks" },
  { to: "/account/favorites", label: "Favorites" },
  { to: "/account/notes", label: "Notes" },
  { to: "/account/history", label: "History" },
  { to: "/account/subscription", label: "Subscription" },
  { to: "/account/security", label: "Security" },
  { to: "/account/preferences", label: "Preferences" },
];
export function DashboardShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="hidden md:block">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">My library</div>
          <nav className="space-y-0.5">
            {DASH_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={cn("block px-3 py-2 rounded text-sm hover:bg-secondary", path === l.to && "bg-secondary font-medium text-primary")}>{l.label}</Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
      <SiteFooter />
    </div>
  );
}

/** Admin chrome with grouped sidebar. */
const ADMIN_GROUPS = [
  {
    label: "Dashboard",
    links: [
      { to: "/admin", label: "Overview" },
      { to: "/admin/workspace", label: "Workspace" },
      { to: "/admin/tasks", label: "Task Center" },
      { to: "/admin/notifications", label: "Notifications" },
      { to: "/admin/search", label: "Global Search" },
    ],
  },
  {
    label: "Content",
    links: [
      { to: "/admin/books", label: "Books" },
      { to: "/admin/publications", label: "Publications" },
      { to: "/admin/issues", label: "Magazine Issues" },
      { to: "/admin/articles", label: "Articles" },
      { to: "/admin/news", label: "News" },
      { to: "/admin/categories", label: "Categories" },
      { to: "/admin/series", label: "Series" },
      { to: "/admin/collections", label: "Collections" },
      { to: "/admin/media", label: "Media Library" },
      { to: "/admin/pdfs", label: "PDF Manager" },
      { to: "/admin/drafts", label: "Drafts" },
      { to: "/admin/scheduled", label: "Scheduled" },
      { to: "/admin/archive", label: "Archive" },
    ],
  },
  {
    label: "Operations",
    links: [
      { to: "/admin/users", label: "Users" },
      { to: "/admin/staff", label: "Staff" },
      { to: "/admin/roles", label: "Roles & Permissions" },
      { to: "/admin/subscriptions", label: "Subscriptions" },
      { to: "/admin/payments", label: "Payments" },
      { to: "/admin/orders", label: "Orders" },
      { to: "/admin/coupons", label: "Coupons" },
      { to: "/admin/support", label: "Support" },
      { to: "/admin/comments", label: "Comments" },
    ],
  },
  {
    label: "Recommendations",
    links: [
      { to: "/admin/recommendations", label: "Overview" },
      { to: "/admin/recommendations/rules", label: "Rules" },
      { to: "/admin/featured", label: "Featured" },
      { to: "/admin/editors-picks", label: "Editor's Picks" },
      { to: "/admin/trending-mgmt", label: "Trending" },
      { to: "/admin/campaigns", label: "Campaigns" },
      { to: "/admin/rec-analytics", label: "Rec Analytics" },
    ],
  },
  {
    label: "Business Intelligence",
    links: [
      { to: "/admin/bi/executive", label: "Executive" },
      { to: "/admin/bi/revenue", label: "Revenue" },
      { to: "/admin/bi/subscriptions", label: "Subscription Analytics" },
      { to: "/admin/bi/users", label: "User Analytics" },
      { to: "/admin/bi/reading", label: "Reading" },
      { to: "/admin/bi/content", label: "Content" },
      { to: "/admin/bi/publications", label: "Publications" },
      { to: "/admin/bi/search", label: "Search" },
      { to: "/admin/bi/payments", label: "Payments" },
      { to: "/admin/bi/publishing", label: "Publishing" },
      { to: "/admin/reports/library", label: "Reports Library" },
      { to: "/admin/reports/builder", label: "Report Builder" },
      { to: "/admin/reports/exports", label: "Exports" },
      { to: "/admin/reports/scheduled", label: "Scheduled" },
      { to: "/admin/analytics", label: "Analytics (Legacy)" },
    ],
  },
  {
    label: "Settings",
    links: [
      { to: "/admin/settings/general", label: "General" },
      { to: "/admin/settings/branding", label: "Branding" },
      { to: "/admin/settings/auth", label: "Authentication" },
      { to: "/admin/settings/security", label: "Security" },
      { to: "/admin/settings/payments", label: "Payments" },
      { to: "/admin/settings/email", label: "Email & SMTP" },
      { to: "/admin/settings/notifications", label: "Notifications" },
      { to: "/admin/settings/storage", label: "Storage" },
      { to: "/admin/settings/localization", label: "Localization" },
      { to: "/admin/settings/api", label: "API & Webhooks" },
      { to: "/admin/settings/integrations", label: "Integrations" },
      { to: "/admin/settings/monitoring", label: "Monitoring" },
      { to: "/admin/settings/audit", label: "Audit & Logs" },
      { to: "/admin/settings/database", label: "Database" },
      { to: "/admin/settings/backup", label: "Backup & Restore" },
      { to: "/admin/settings/maintenance", label: "Maintenance" },
      { to: "/admin/settings/developer", label: "Developer" },
      { to: "/admin/settings/system-info", label: "System Info" },
    ],
  },
];
export { ADMIN_GROUPS };

/** Reusable settings shell with tabs sidebar. */
export function SettingsShell({ children, title, description }: { children: ReactNode; title: string; description?: string }) {
  return (
    <div>
      <PageHeader eyebrow="Settings" title={title} description={description} />
      {children}
    </div>
  );
}

/** Auth screen chrome — split-hero layout. */
export function AuthShell({ title, subtitle, children, footer }:
  { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hidden md:flex flex-col justify-between p-12 bg-neutral-900 text-neutral-100 relative overflow-hidden">
        <Link to="/" className="font-serif text-2xl">Swathi Publications</Link>
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Editorial · Since 1982</div>
          <blockquote className="font-serif text-3xl leading-tight max-w-md">
            "The kind of publishing house that assumes its reader is intelligent — a rare thing today."
          </blockquote>
          <div className="text-sm text-neutral-400 mt-4">— Dr. Meera Sundaram, JNU</div>
        </div>
        <div className="text-xs text-neutral-500">© 2026 Swathi Publications</div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-primary/20 blur-3xl" />
      </div>
      <div className="flex flex-col justify-center p-8 md:p-12">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8 md:hidden">
            <Link to="/" className="font-serif text-xl">Swathi Publications</Link>
          </div>
          <h1 className="font-serif text-3xl mb-2">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm mb-8">{subtitle}</p>}
          {children}
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/** Admin content wrapper — the /admin route file provides the chrome + sidebar. */
export function AdminShell({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
