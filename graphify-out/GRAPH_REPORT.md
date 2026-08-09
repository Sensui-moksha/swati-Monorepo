# Graph Report - swati-clientside (2026-07-30)

## Corpus Check

- 274 files · ~133,473 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 1639 nodes · 3416 edges · 135 communities (72 shown, 63 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `02ab351f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- routeTree.gen.ts
- shells.tsx
- FileRoutesByPath
- AdminShell
- AdminEntityPage.tsx
- devDependencies
- Core Query Hooks to Create in `src/lib/api/hooks.ts`
- sidebar.tsx
- hooks.ts
- types.ts
- cn
- admin.index.tsx
- StubPage
- client.ts
- compilerOptions
- reader.$bookId.tsx
- formatShortDate
- server.ts
- ApiClient
- site-layout.tsx
- components.json
- BookCard
- admin.subscriptions.tsx
- command.tsx
- menubar.tsx
- useArticles
- chart.tsx
- alert-dialog.tsx
- index.tsx
- form.tsx
- dependencies
- PublicPage
- carousel.tsx
- discover.index.tsx
- utils.ts
- PdfBookViewer.tsx
- auth.ts
- PageFlip
- context-menu.tsx
- dropdown-menu.tsx
- table.tsx
- breadcrumb.tsx
- navigation-menu.tsx
- select.tsx
- admin.articles.tsx
- publications.ts
- discover.recommendations.tsx
- discover.trending.tsx
- admin.tsx
- card.tsx
- toggle-group.tsx
- products.ts
- authors.$slug.tsx
- discover.new.tsx
- AGENTS.md
- alert.tsx
- input-otp.tsx
- publishers.$slug.tsx
- series.$slug.tsx
- patch_settings.js
- accordion.tsx
- avatar.tsx
- tabs.tsx
- authors.index.tsx
- library.favorites.tsx
- search.tsx
- publishers.index.tsx
- library.history.tsx
- discover.history.tsx
- series.index.tsx
- scroll-area.tsx
- sonner.tsx
- faq.tsx
- Routes
- clsx
- cmdk
- date-fns
- embla-carousel-react
- framer-motion
- lucide-react
- page-flip
- pdfjs-dist
- @radix-ui/react-accordion
- @radix-ui/react-alert-dialog
- @radix-ui/react-aspect-ratio
- @radix-ui/react-avatar
- @radix-ui/react-collapsible
- @radix-ui/react-context-menu
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-hover-card
- @radix-ui/react-label
- @radix-ui/react-menubar
- @radix-ui/react-navigation-menu
- @radix-ui/react-popover
- @radix-ui/react-progress
- @radix-ui/react-radio-group
- @radix-ui/react-scroll-area
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-slider
- @radix-ui/react-slot
- @radix-ui/react-switch
- @radix-ui/react-tabs
- @radix-ui/react-toggle
- @radix-ui/react-toggle-group
- @radix-ui/react-tooltip
- react-day-picker
- react-dom
- react-hook-form
- recharts
- sonner
- tailwind-merge
- tailwindcss
- @tailwindcss/vite
- @tanstack/react-query
- @tanstack/react-router
- @tanstack/router-plugin
- tw-animate-css
- vaul
- vite-tsconfig-paths
- zod
- Route
- Route
- Route
- Route
- Route
- Route
- Route
- Route
- vercel.json

## God Nodes (most connected - your core abstractions)

1. `FileRoutesByPath` - 178 edges
2. `cn()` - 83 edges
3. `Btn()` - 55 edges
4. `PageHeader()` - 47 edges
5. `PublicPage()` - 43 edges
6. `ApiClient` - 39 edges
7. `Card()` - 38 edges
8. `AdminShell()` - 33 edges
9. `formatShortDate()` - 29 edges
10. `AdminEntityPage()` - 23 edges

## Surprising Connections (you probably didn't know these)

- `CalendarDayButton()` --references--> `react` [EXTRACTED]
  src/components/ui/calendar.tsx → package.json
- `useCarousel()` --references--> `react` [EXTRACTED]
  src/components/ui/carousel.tsx → package.json
- `useChart()` --references--> `react` [EXTRACTED]
  src/components/ui/chart.tsx → package.json
- `useFormField()` --references--> `react` [EXTRACTED]
  src/components/ui/form.tsx → package.json
- `useSidebar()` --references--> `react` [EXTRACTED]
  src/components/ui/sidebar.tsx → package.json

## Import Cycles

- None detected.

## Communities (135 total, 63 thin omitted)

### Community 0 - "routeTree.gen.ts"

Cohesion: 0.01
Nodes (222): AboutRoute, AccountAddressesRoute, AccountBookmarksRoute, AccountDownloadsRoute, AccountFavoritesRoute, AccountHistoryRoute, AccountIndexRoute, AccountNotesRoute (+214 more)

### Community 1 - "shells.tsx"

Cohesion: 0.05
Nodes (58): AuthShell(), DASH_LINKS, DashboardShell(), Btn(), Card(), EmptyState(), Input(), KpiCard() (+50 more)

### Community 2 - "FileRoutesByPath"

Cohesion: 0.03
Nodes (59): Route, Route, Route, Route, Route, Route, Route, Route (+51 more)

### Community 3 - "AdminShell"

Cohesion: 0.06
Nodes (25): Field, SettingsCategoryForm(), SettingsCategoryFormProps, AdminShell(), SettingsShell(), useSettings(), useUpdateSettings(), Route (+17 more)

### Community 4 - "AdminEntityPage.tsx"

Cohesion: 0.04
Nodes (24): AdminEntityPage(), AdminEntityPageProps, ColumnDef, useCreateAdminEntity(), useDeleteAdminEntity(), useUpdateAdminEntity(), Route, Route (+16 more)

### Community 5 - "devDependencies"

Cohesion: 0.04
Nodes (46): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, nitro (+38 more)

### Community 6 - "Core Query Hooks to Create in `src/lib/api/hooks.ts`"

Cohesion: 0.04
Nodes (45): Articles Hooks, Auth Hooks (mutations), Books Hooks, Cart Hooks, Categories, Authors, Publishers, Series, Genres, Tags Hooks, Collections Hooks, Core Query Hooks to Create in `src/lib/api/hooks.ts`, Coupons Hooks (+37 more)

### Community 7 - "sidebar.tsx"

Cohesion: 0.05
Nodes (39): Input, Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+31 more)

### Community 8 - "hooks.ts"

Cohesion: 0.05
Nodes (5): analyticsApi, couponsApi, ordersApi, publicationsApi, settingsApi

### Community 9 - "types.ts"

Cohesion: 0.05
Nodes (41): AccessAssertion, AccessCheck, ActivityItem, Author, Book, Bookmark, Chapter, Collection (+33 more)

### Community 10 - "cn"

Cohesion: 0.06
Nodes (29): Badge(), BadgeProps, badgeVariants, Checkbox, DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader() (+21 more)

### Community 11 - "admin.index.tsx"

Cohesion: 0.10
Nodes (25): adminApi, useAdminComments(), useAdminPayments(), useAdminStats(), useAdminUsers(), usePlanBreakdown(), useRecentTransactions(), useRevenueAnalytics() (+17 more)

### Community 12 - "StubPage"

Cohesion: 0.06
Nodes (16): StubPage(), Route, Route, Route, Route, Route, Route, Route (+8 more)

### Community 13 - "client.ts"

Cohesion: 0.11
Nodes (21): api, ApiError, CreateOrderData, OrderFilters, ReadingStats, SubscriptionInfo, AddressData, CreateUserData (+13 more)

### Community 14 - "compilerOptions"

Cohesion: 0.07
Nodes (28): DOM, DOM.Iterable, ES2022, eslint.config.js, ./src/_, src/\**/_.ts, src/**/*.tsx, vite/client (+20 more)

### Community 15 - "reader.$bookId.tsx"

Cohesion: 0.08
Nodes (16): booksApi, useBookmarks(), useNotes(), BookmarksPage(), Route, Book, BookPage, ReaderBookmarks() (+8 more)

### Community 16 - "formatShortDate"

Cohesion: 0.14
Nodes (18): useNotifications(), usePublications(), formatShortDate(), DashboardIndex(), NotificationsPage(), Route, ArchivePage(), Route (+10 more)

### Community 17 - "server.ts"

Cohesion: 0.14
Nodes (13): PendingPage(), consumeLastCapturedError(), renderErrorPage(), getRouter(), Register, routeTree, fetch(), getServerEntry() (+5 more)

### Community 19 - "site-layout.tsx"

Cohesion: 0.13
Nodes (7): SiteFooter(), SiteLayout(), Route, Route, Route, Route, Route

### Community 20 - "components.json"

Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 21 - "BookCard"

Cohesion: 0.17
Nodes (14): BookGridPage(), BookCard(), useBookBySlug(), useBooks(), useGenreBySlug(), CollectionPage(), Route, GenreDetailPage() (+6 more)

### Community 22 - "admin.subscriptions.tsx"

Cohesion: 0.15
Nodes (10): prewarmAppCache(), CreateSubscriptionData, SubscriptionFilters, subscriptionsApi, UpdateSubscriptionData, queryKeys, Subscription, SubscriptionPlan (+2 more)

### Community 23 - "command.tsx"

Cohesion: 0.12
Nodes (14): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut() (+6 more)

### Community 24 - "menubar.tsx"

Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 25 - "useArticles"

Cohesion: 0.19
Nodes (13): useArticles(), useCategories(), useCategoryBySlug(), AnalyticsPage(), Route, AdminArticlesPage(), ArticlesPage(), Crumbs() (+5 more)

### Community 26 - "chart.tsx"

Cohesion: 0.12
Nodes (13): react, react, useCarousel(), ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent (+5 more)

### Community 27 - "alert-dialog.tsx"

Cohesion: 0.17
Nodes (13): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+5 more)

### Community 28 - "index.tsx"

Cohesion: 0.17
Nodes (12): useFeaturedArticles(), useSubscriptionPlans(), useTopStories(), useTrendingArticles(), HomePage(), Route, TESTIMONIALS, DEFAULT_PRICING_PLANS (+4 more)

### Community 29 - "form.tsx"

Cohesion: 0.15
Nodes (11): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+3 more)

### Community 30 - "dependencies"

Cohesion: 0.15
Nodes (13): class-variance-authority, @hookform/resolvers, input-otp, dependencies, class-variance-authority, @hookform/resolvers, input-otp, @radix-ui/react-checkbox (+5 more)

### Community 31 - "PublicPage"

Cohesion: 0.21
Nodes (10): PublicPage(), useContinueReading(), useLatestArticles(), ContinuePage(), LatestPage(), Route, ContinuePage(), Route (+2 more)

### Community 32 - "carousel.tsx"

Cohesion: 0.15
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 33 - "discover.index.tsx"

Cohesion: 0.23
Nodes (10): SectionTitle(), useCollections(), useGenres(), useTags(), DiscoverIndex(), Route, GenresIndex(), Route (+2 more)

### Community 34 - "utils.ts"

Cohesion: 0.24
Nodes (10): useArticleBySlug(), useIssues(), usePublicationBySlug(), formatDate(), ArticleDetail(), PdfBookViewer, Route, PdfBookViewer (+2 more)

### Community 35 - "PdfBookViewer.tsx"

Cohesion: 0.33
Nodes (10): getPdfDocument(), getTargetWidth(), getTrimBoxCrop(), PdfBookViewer(), PdfBookViewerProps, pdfDocCache, playPaperFlipSound(), renderPdfPageToCanvas() (+2 more)

### Community 36 - "auth.ts"

Cohesion: 0.18
Nodes (10): NAV, SiteHeader(), AuthResponse, ChangePasswordData, ForgotPasswordData, LoginCredentials, RegisterData, ResetPasswordData (+2 more)

### Community 38 - "context-menu.tsx"

Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 39 - "dropdown-menu.tsx"

Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 40 - "table.tsx"

Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 41 - "breadcrumb.tsx"

Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 42 - "navigation-menu.tsx"

Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 43 - "select.tsx"

Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 44 - "admin.articles.tsx"

Cohesion: 0.32
Nodes (6): articlesApi, Article, ArticleVersion, Category, Tag, PdfBookViewer

### Community 45 - "publications.ts"

Cohesion: 0.32
Nodes (5): Issue, Publication, getDocumentBySlug(), PUBLICATION_DOCUMENTS, PublicationDocument

### Community 46 - "discover.recommendations.tsx"

Cohesion: 0.32
Nodes (6): useRecommendedBooks(), DashboardRecommendedPage(), DiscoverRecommendationsPage(), Route, LibraryRecommendedPage(), Route

### Community 47 - "discover.trending.tsx"

Cohesion: 0.32
Nodes (6): useTrendingBooks(), DashboardTrendingPage(), DiscoverTrendingPage(), Route, LibraryTrendingPage(), Route

### Community 48 - "admin.tsx"

Cohesion: 0.33
Nodes (5): ADMIN_GROUPS, useAdminNotifications(), AdminLayout(), AdminNotificationsPage(), Route

### Community 49 - "card.tsx"

Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 50 - "toggle-group.tsx"

Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 51 - "products.ts"

Cohesion: 0.33
Nodes (6): CreateProductData, ProductFilters, productsApi, UpdateProductData, Product, ProductVariant

### Community 52 - "authors.$slug.tsx"

Cohesion: 0.38
Nodes (6): useAuthorBooks(), useAuthorBySlug(), AuthorDetailPage(), FEATURED_PROFILES, LazyPdfBookViewer, Route

### Community 53 - "discover.new.tsx"

Cohesion: 0.38
Nodes (5): useLatestBooks(), DiscoverNewPage(), Route, LibraryNewPage(), Route

### Community 54 - "AGENTS.md"

Cohesion: 0.40
Nodes (4): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution

### Community 55 - "alert.tsx"

Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 56 - "input-otp.tsx"

Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 57 - "publishers.$slug.tsx"

Cohesion: 0.60
Nodes (4): usePublisherBooks(), usePublisherBySlug(), PublisherDetailPage(), Route

### Community 58 - "series.$slug.tsx"

Cohesion: 0.60
Nodes (4): useSeriesBooks(), useSeriesBySlug(), Route, SeriesDetailPage()

### Community 59 - "patch_settings.js"

Cohesion: 0.50
Nodes (3): files, fs, path

### Community 60 - "accordion.tsx"

Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 61 - "avatar.tsx"

Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 62 - "tabs.tsx"

Cohesion: 0.50
Nodes (3): TabsContent, TabsList, TabsTrigger

### Community 63 - "authors.index.tsx"

Cohesion: 0.67
Nodes (3): useAuthors(), AuthorsIndex(), Route

### Community 64 - "library.favorites.tsx"

Cohesion: 0.67
Nodes (3): useFavorites(), FavoritesPage(), Route

### Community 65 - "search.tsx"

Cohesion: 0.67
Nodes (3): useGlobalSearch(), Route, SearchPage()

### Community 66 - "publishers.index.tsx"

Cohesion: 0.67
Nodes (3): usePublishers(), PublishersIndex(), Route

### Community 67 - "library.history.tsx"

Cohesion: 0.67
Nodes (3): useReadingHistory(), HistoryPage(), Route

### Community 68 - "discover.history.tsx"

Cohesion: 0.67
Nodes (3): useSearchHistory(), Page(), Route

### Community 69 - "series.index.tsx"

Cohesion: 0.67
Nodes (3): useSeries(), Route, SeriesIndex()

## Knowledge Gaps

- **645 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `css` (+640 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `shells.tsx`, `sidebar.tsx`, `reader.$bookId.tsx`, `BookCard`, `command.tsx`, `menubar.tsx`, `chart.tsx`, `alert-dialog.tsx`, `form.tsx`, `carousel.tsx`, `utils.ts`, `context-menu.tsx`, `dropdown-menu.tsx`, `table.tsx`, `breadcrumb.tsx`, `navigation-menu.tsx`, `select.tsx`, `admin.tsx`, `card.tsx`, `toggle-group.tsx`, `alert.tsx`, `input-otp.tsx`, `accordion.tsx`, `avatar.tsx`, `tabs.tsx`, `scroll-area.tsx`?**
  _High betweenness centrality (0.206) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`, `chart.tsx`, `clsx`, `cmdk`, `date-fns`, `embla-carousel-react`, `framer-motion`, `lucide-react`, `page-flip`, `pdfjs-dist`, `@radix-ui/react-accordion`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-aspect-ratio`, `@radix-ui/react-avatar`, `@radix-ui/react-collapsible`, `@radix-ui/react-context-menu`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-hover-card`, `@radix-ui/react-label`, `@radix-ui/react-menubar`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`, `@radix-ui/react-tooltip`, `react-day-picker`, `react-dom`, `react-hook-form`, `recharts`, `sonner`, `tailwind-merge`, `tailwindcss`, `@tailwindcss/vite`, `@tanstack/react-query`, `@tanstack/react-router`, `@tanstack/router-plugin`, `tw-animate-css`, `vaul`, `vite-tsconfig-paths`, `zod`?**
  _High betweenness centrality (0.172) - this node is a cross-community bridge._
- **Why does `react` connect `chart.tsx` to `alert-dialog.tsx`, `dependencies`, `sidebar.tsx`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _645 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `routeTree.gen.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.008968609865470852 - nodes in this community are weakly interconnected._
- **Should `shells.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05358126721763085 - nodes in this community are weakly interconnected._
- **Should `FileRoutesByPath` be split into smaller, more focused modules?**
  _Cohesion score 0.029411764705882353 - nodes in this community are weakly interconnected._
