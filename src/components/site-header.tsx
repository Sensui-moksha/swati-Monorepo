import { Link, useRouter } from "@tanstack/react-router";
import { Search, User, ShoppingCart, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { authApi } from "@/lib/api/endpoints/auth";
import logoImg from "../assets/logo.png";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/library", label: "Library" },
  { to: "/publications", label: "Publications" },
  { to: "/articles", label: "Articles" },
  { to: "/discover", label: "Discover" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];


export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check if user is authenticated by querying /auth/me
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authApi.me().then((r: any) => r?.data?.user || r?.data || null),
    enabled: apiClient.isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isLoggedIn = apiClient.isAuthenticated() && !!currentUser;

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      apiClient.clearTokens();
      queryClient.clear();
      router.navigate({ to: "/" });
    },
    onError: () => {
      apiClient.clearTokens();
      queryClient.clear();
      router.navigate({ to: "/" });
    },
  });

  return (
    <header className="sticky top-0 z-40 bg-paper">
      {/* ROW 1: Logo & Account / Meta Actions */}
      <div className="border-b border-border py-4 bg-paper">
        <div className="container-edit grid grid-cols-2 md:grid-cols-3 items-center gap-4">
          {/* Left Column (Desktop Spacer) */}
          <div className="hidden md:block" />

          {/* Center Logo */}
          <div className="flex justify-start md:justify-center">
            <Link to="/" className="block">
              <img
                src={logoImg}
                alt="Swathi Publications"
                className="h-auto max-h-14 sm:max-h-16 object-contain"
              />
            </Link>
          </div>

          {/* Right Account & Cart Controls */}
          <div className="flex items-center justify-end gap-3 text-[11px] tracking-widest uppercase text-muted-foreground">
            {isLoggedIn ? (
              <>
                <span className="text-foreground/90 font-medium truncate max-w-[120px]">
                  {currentUser?.fullName || currentUser?.username || "Account"}
                </span>
                <span className="text-border">|</span>
                <Link to="/account" className="hover:text-primary transition-colors hidden lg:inline">
                  Account
                </Link>
                {currentUser?.role === "admin" && (
                  <>
                    <span className="text-border hidden lg:inline">|</span>
                    <Link to="/admin" className="hover:text-primary transition-colors hidden lg:inline">
                      Admin
                    </Link>
                  </>
                )}
                <span className="text-border">|</span>
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <LogOut className="h-3 w-3" /> <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary transition-colors font-medium">
                  Login
                </Link>
                <span className="text-border">|</span>
                <Link to="/register" className="hover:text-primary transition-colors font-medium">
                  Register
                </Link>
              </>
            )}
            <span className="text-border">|</span>
            <Link to="/cart" className="hover:text-primary transition-colors inline-flex items-center gap-1 font-medium text-foreground">
              <ShoppingCart className="h-3.5 w-3.5 text-primary" /> <span className="hidden sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ROW 2: Navigation & Search */}
      <div className="border-b border-border bg-background/50">
        <div className="container-edit flex items-center justify-between gap-4 py-2.5">
          {/* Main Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1 gap-6">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-primary font-semibold" }}
                inactiveProps={{ className: "text-foreground/70 hover:text-primary" }}
                className="text-xs uppercase tracking-widest font-medium transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions: Search & Mobile Toggle */}
          <div className="flex items-center justify-end gap-4 w-full md:w-auto">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest font-medium">Search</span>
            </Link>
            <Link
              to="/account"
              aria-label="Account"
              className="text-foreground/70 hover:text-primary transition-colors hidden sm:inline-block"
            >
              <User className="h-4 w-4" />
            </Link>
            <button
              className="md:hidden text-foreground/70 hover:text-primary transition-colors"
              aria-label="Menu"
              onClick={() => setOpen((o) => !o)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="md:hidden border-b border-border bg-paper">
          <nav className="container-edit flex flex-col gap-1 py-3">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="py-2 px-2 text-xs uppercase tracking-widest font-medium rounded hover:bg-secondary transition-colors"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
