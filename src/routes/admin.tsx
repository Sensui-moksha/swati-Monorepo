import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Search, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { ADMIN_GROUPS } from "@/components/shells";
import { BackButton } from "@/components/ui-primitives";
import { cn } from "@/lib/utils";
import { useAdminNotifications } from "@/lib/api/hooks";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Swathi Publications" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminHeaderSearch() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate({ to: "/admin/search", search: { q: searchTerm.trim() } as any });
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users, articles, books, publications..."
        className="w-full border border-input pl-9 pr-3 py-1.5 text-sm rounded-md bg-secondary/30 focus:bg-paper focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </form>
  );
}

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { data: notifData } = useAdminNotifications();
  const notifications = notifData?.data ?? [];
  const unreadCount = notifications.filter((n: any) => !n.isRead && n.status !== "Read" && n.read !== true).length;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ADMIN_GROUPS.map((g) => [g.label, g.links.some((l) => path === l.to || path.startsWith(l.to + "/"))]))
  );
  return (
    <div className="min-h-screen flex bg-secondary/30">
      <aside className="w-64 shrink-0 bg-paper border-r border-rule flex flex-col h-screen sticky top-0">
        <Link to="/admin" className="p-5 border-b border-rule shrink-0">
          <div className="font-serif text-xl"><span className="text-primary">Swathi</span> Admin</div>
          <div className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">Control Center</div>
        </Link>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {ADMIN_GROUPS.map((g) => (
            <div key={g.label}>
              <button onClick={() => setOpenGroups((o) => ({ ...o, [g.label]: !o[g.label] }))}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                <span>{g.label}</span><ChevronDown className={cn("h-3 w-3 transition-transform", openGroups[g.label] && "rotate-180")} />
              </button>
              {openGroups[g.label] && (
                <div className="pb-2">
                  {g.links.map((l) => {
                    const active = path === l.to;
                    return (
                      <Link key={l.to} to={l.to} className={cn("block px-3 py-1.5 text-xs rounded transition-colors", active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground/80")}>
                        {l.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-rule shrink-0">
          <Link to="/" className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-md hover:bg-secondary"><LogOut className="h-4 w-4" /> Exit admin</Link>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-rule bg-paper flex items-center gap-4 px-6 sticky top-0 z-30">
          <AdminHeaderSearch />
          <Link to="/admin/notifications" className="relative text-muted-foreground hover:text-primary" title="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold grid place-items-center animate-in zoom-in-50">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-semibold">R</div>
        </header>
        <main className="flex-1 p-8 overflow-x-hidden">
          {path !== "/admin" && <BackButton to="/admin" label="Back to Admin Dashboard" />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
