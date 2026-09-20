# Graph Report - Prototype v0  (2026-07-23)

## Corpus Check
- 540 files · ~228,740 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4627 nodes · 9989 edges · 246 communities (136 shown, 110 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 86 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0dca424f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ArticleRepository
- index.ts
- dependencies
- app.ts
- paths
- compilerOptions
- CategoryRepository
- auth.ts
- IUser
- TagRepository
- scripts
- MediaRepository
- NewsletterRepository
- IArticleModel
- devDependencies
- Ponytail, lazy senior dev mode
- eslint-plugin-prettier
- jest
- prettier
- ts-jest
- tsx
- @types/bcryptjs
- @types/compression
- @types/cookie-parser
- @types/cors
- @types/express
- @types/express-mongo-sanitize
- @types/helmet
- @types/hpp
- @types/jest
- @types/jsonwebtoken
- @types/morgan
- @types/multer
- @types/node
- @types/swagger-jsdoc
- @types/swagger-ui-express
- typescript
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser
- express-mongo-sanitize.d.ts
- hpp.d.ts
- xss-clean.d.ts
- eslint-config-prettier
- AuthService
- jwt.ts
- .badRequest
- templates.ts
- BaseRepository
- CategoryService
- .notFound
- validation.ts
- OTPService
- ITagModel
- password.ts
- IMediaModel
- IUserModel
- @types/bcryptjs
- NotificationRepository
- MagazineIssueRepository
- CLAUDE.md
- CollectionRepository
- IUserModel
- jest
- FavoriteRepository
- AuthorRepository
- SeriesRepository
- Phase 4: User Module Implementation - Completion Summary
- GenreRepository
- UserProfileService
- IReadingHistory
- SessionService
- errorHandler.ts
- publishing.ts
- otp.ts
- PublicationRepository
- ICategory
- PublisherRepository
- NoteService
- validation.ts
- ProfileController
- TwoFactorService.ts
- HighlightService
- .badRequest
- BookmarkRepository
- NoteRepository
- MagazineIssueController
- validate.ts
- Article.ts
- PublicationController
- ReadingProgressController
- BookmarkService
- index.ts
- profile.ts
- CollectionController
- DashboardService
- GenreController
- NotificationController
- PublisherController
- publisherService.ts
- DashboardController
- favoriteController.ts
- HighlightController
- ReadingHistoryController
- SeriesController
- Highlight.ts
- Note.ts
- ReadingHistory.ts
- highlights.ts
- notes.ts
- exclude
- package.json
- BookmarkController
- auth.ts
- Bookmark.ts
- INotificationModel
- publicationService.ts
- bookmarks.ts
- notifications.ts
- progress.ts
- favorites.ts
- CategoryService.ts
- IPublicationModel
- SearchController
- typeRoots
- bcryptjs
- cors
- dotenv
- express
- helmet
- http-status-codes
- joi
- jsonwebtoken
- mongoose
- multer
- nodemailer
- swagger-ui-express
- winston
- zod
- tsx
- @controllers/*
- @database/*
- @jobs/*
- @middlewares/*
- @services/*
- @tests/*
- @utils/*
- MediaController
- adminController.ts
- ArticleVersionRepository.ts
- recommendationService.test.ts
- MagazineIssueRepository.ts
- StorageFolder
- commentController.ts
- NoteController
- IStoragePathModel
- AuthorController
- TagController
- ReadingProgressRepository
- AnalyticsController
- ReportingService
- ArticleRepository.ts
- CommentService
- IReadingProgressModel
- WebhookController
- copilot-instructions.md
- hpp
- eslint-config-prettier
- lib
- @config/*
- @docs/*
- @emails/*
- @types/*
- @validators/*
- IBookmarkModel
- ICommercePaymentModel
- ICommercePromotionModel
- dotenv
- eslint-plugin-prettier
- ReadingHistoryController
- admin.bi.publishing.tsx
- admin.bi.reading.tsx
- ReadingHistoryRepository
- InvoiceService
- accessControlService.ts
- WebhookController
- admin.bi.search.tsx
- admin.bi.subscriptions.tsx
- @azure/storage-blob
- bcryptjs
- chokidar
- compression
- cookie-parser
- express-rate-limit
- morgan
- xss-clean
- Routes
- express-mongo-sanitize
- swagger-jsdoc
- @jobs/*
- @storage/*
- @tests/*
- @utils/*
- class-variance-authority
- clsx
- cmdk
- date-fns
- embla-carousel-react
- framer-motion
- input-otp
- @radix-ui/react-accordion
- @radix-ui/react-aspect-ratio
- @radix-ui/react-avatar
- @radix-ui/react-checkbox
- @radix-ui/react-collapsible
- @radix-ui/react-context-menu
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-hover-card
- @radix-ui/react-label
- @radix-ui/react-menubar
- @radix-ui/react-popover
- @radix-ui/react-progress
- @radix-ui/react-radio-group
- @radix-ui/react-separator
- @radix-ui/react-slider
- @radix-ui/react-slot
- @radix-ui/react-switch
- react-dom
- react-hook-form
- react-resizable-panels
- sonner
- @tanstack/react-query
- @tanstack/react-start
- @tanstack/router-plugin
- tw-animate-css
- vaul
- vite-tsconfig-paths
- zod
- @tailwindcss/vite
- @tanstack/react-router
- class-variance-authority

## God Nodes (most connected - your core abstractions)
1. `AuthRequest` - 323 edges
2. `FileRoutesByPath` - 181 edges
3. `PaginationOptions` - 117 edges
4. `PaginatedResult` - 99 edges
5. `IUser` - 94 edges
6. `BaseRepository` - 93 edges
7. `Btn()` - 88 edges
8. `express` - 82 edges
9. `cn()` - 81 edges
10. `Card()` - 79 edges

## Surprising Connections (you probably didn't know these)
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  swati-clientside/src/components/ui/alert-dialog.tsx → swati-clientside/src/lib/utils.ts
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  swati-clientside/src/components/ui/alert-dialog.tsx → swati-clientside/src/lib/utils.ts
- `BreadcrumbSeparator()` --calls--> `cn()`  [EXTRACTED]
  swati-clientside/src/components/ui/breadcrumb.tsx → swati-clientside/src/lib/utils.ts
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  swati-clientside/src/components/ui/breadcrumb.tsx → swati-clientside/src/lib/utils.ts
- `CommandShortcut()` --calls--> `cn()`  [EXTRACTED]
  swati-clientside/src/components/ui/command.tsx → swati-clientside/src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (246 total, 110 thin omitted)

### Community 0 - "ArticleRepository"
Cohesion: 0.01
Nodes (242): Route, Route, Route, Route, Route, Route, Route, Route (+234 more)

### Community 1 - "index.ts"
Cohesion: 0.05
Nodes (3): CommerceController, requireParam(), requireUserId()

### Community 2 - "dependencies"
Cohesion: 0.05
Nodes (43): @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, @azure/storage-blob, dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, @azure/storage-blob, bcryptjs (+35 more)

### Community 3 - "app.ts"
Cohesion: 0.19
Nodes (9): databaseConfig, emailConfig, env, EnvConfig, envSchema, getConfig(), loadConfig(), jwtConfig (+1 more)

### Community 4 - "paths"
Cohesion: 0.10
Nodes (21): paths, @config/*, @database/*, @emails/*, @interfaces/*, @middlewares/*, @models/*, @repositories/* (+13 more)

### Community 5 - "compilerOptions"
Cohesion: 0.09
Nodes (23): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, ignoreDeprecations (+15 more)

### Community 7 - "auth.ts"
Cohesion: 0.10
Nodes (3): PaginatedResult, PaginationOptions, MetadataRepository

### Community 8 - "IUser"
Cohesion: 0.06
Nodes (3): IUser, UserRepository, UserProfileService

### Community 9 - "TagRepository"
Cohesion: 0.11
Nodes (6): ITag, Tag, tagSchema, TagFilter, TagRepository, TagService

### Community 10 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:connect, dev, docs:generate, format, lint, lint:fix (+4 more)

### Community 11 - "MediaRepository"
Cohesion: 0.03
Nodes (97): AdminShell(), DASH_LINKS, DashboardShell(), SettingsShell(), Btn(), Card(), EmptyState(), KpiCard() (+89 more)

### Community 12 - "NewsletterRepository"
Cohesion: 0.07
Nodes (9): ICategory, INewsletter, INewsletterModel, ITag, Newsletter, newsletterSchema, NewsletterStatus, NewsletterFilter (+1 more)

### Community 14 - "devDependencies"
Cohesion: 0.05
Nodes (43): devDependencies, eslint-config-prettier, eslint-plugin-prettier, jest, prettier, tsx, @types/bcryptjs, @types/compression (+35 more)

### Community 17 - "jest"
Cohesion: 0.05
Nodes (3): IUserSession, SessionRepository, SessionService

### Community 18 - "prettier"
Cohesion: 0.05
Nodes (58): SiteFooter(), NAV, SiteHeader(), SiteLayout(), useArticleBySlug(), useArticles(), useCategories(), useCategoryBySlug() (+50 more)

### Community 19 - "ts-jest"
Cohesion: 0.03
Nodes (77): BookGridPage(), PublicPage(), BookCard(), SectionTitle(), useAuthorBooks(), useAuthorBySlug(), useAuthors(), useBookBySlug() (+69 more)

### Community 20 - "tsx"
Cohesion: 0.20
Nodes (15): AuthTokens, ChangePasswordInput, EmailOptions, ForgotPasswordInput, LoginInput, RefreshTokenInput, RegisterInput, ResetPasswordInput (+7 more)

### Community 21 - "@types/bcryptjs"
Cohesion: 0.09
Nodes (7): IMedia, Media, mediaSchema, MediaType, MediaFilter, MediaRepository, MediaService

### Community 22 - "@types/compression"
Cohesion: 0.12
Nodes (13): SubscriptionStatus, CommerceSubscription, historySchema, ICommerceSubscription, subscriptionSchema, CommerceSubscriptionRepository, SubscriptionService, toId() (+5 more)

### Community 23 - "@types/cookie-parser"
Cohesion: 0.05
Nodes (47): booksApi, AccessAssertion, AccessCheck, ActivityItem, AdminSession, AdminStats, AdminUser, Author (+39 more)

### Community 25 - "@types/express"
Cohesion: 0.04
Nodes (45): mongodb, rest-api, author, dependencies, bcryptjs, cookie-parser, cors, dotenv (+37 more)

### Community 26 - "@types/express-mongo-sanitize"
Cohesion: 0.04
Nodes (45): Articles Hooks, Auth Hooks (mutations), Books Hooks, Cart Hooks, Categories, Authors, Publishers, Series, Genres, Tags Hooks, Collections Hooks, Core Query Hooks to Create in `src/lib/api/hooks.ts`, Coupons Hooks (+37 more)

### Community 27 - "@types/helmet"
Cohesion: 0.05
Nodes (39): Input, Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+31 more)

### Community 29 - "@types/jest"
Cohesion: 0.05
Nodes (38): Access, Admin, Analytics, Articles, Auth, Bookmarks, Comments, Coupons (+30 more)

### Community 30 - "@types/jsonwebtoken"
Cohesion: 0.08
Nodes (25): Button, ButtonProps, buttonVariants, Calendar(), CalendarDayButton(), Checkbox, HoverCardContent, Pagination() (+17 more)

### Community 31 - "@types/morgan"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 32 - "@types/multer"
Cohesion: 0.15
Nodes (8): Collection, collectionSchema, CollectionType, ICollection, ICollectionModel, CollectionFilter, CollectionRepository, CollectionService

### Community 33 - "@types/node"
Cohesion: 0.06
Nodes (33): @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, nitro, devDependencies, eslint, eslint-config-prettier (+25 more)

### Community 34 - "@types/swagger-jsdoc"
Cohesion: 0.06
Nodes (33): clsx, embla-carousel-react, @hookform/resolvers, @radix-ui/react-context-menu, @radix-ui/react-hover-card, @radix-ui/react-menubar, @radix-ui/react-progress, @radix-ui/react-separator (+25 more)

### Community 35 - "@types/swagger-ui-express"
Cohesion: 0.07
Nodes (28): DOM, DOM.Iterable, eslint.config.js, src/**/*.ts, src/**/*.tsx, vite/client, vite.config.ts, compilerOptions (+20 more)

### Community 37 - "@typescript-eslint/eslint-plugin"
Cohesion: 0.14
Nodes (6): CommerceCoupon, couponSchema, ICommerceCoupon, ICommerceCouponModel, CommerceCouponRepository, CouponService

### Community 38 - "@typescript-eslint/parser"
Cohesion: 0.10
Nodes (24): api, ApiError, articlesApi, CreateOrderData, OrderFilters, ordersApi, publicationsApi, AddressData (+16 more)

### Community 39 - "express-mongo-sanitize.d.ts"
Cohesion: 0.14
Nodes (13): PendingPage(), consumeLastCapturedError(), renderErrorPage(), getRouter(), Register, routeTree, fetch(), getServerEntry() (+5 more)

### Community 41 - "xss-clean.d.ts"
Cohesion: 0.11
Nodes (17): env, jest, node, extends, overrides, parser, plugins, root (+9 more)

### Community 44 - "jwt.ts"
Cohesion: 0.11
Nodes (7): Book, bookSchema, BookStatus, IBook, BookFilter, BookRepository, BookService

### Community 46 - "templates.ts"
Cohesion: 0.25
Nodes (18): accountDeactivatedTemplate(), accountDeletionTemplate(), baseLayout(), baseLayoutText(), emailChangedTemplate(), EmailTemplateData, EmailTemplateFunction, EmailTemplateKey (+10 more)

### Community 47 - "BaseRepository"
Cohesion: 0.05
Nodes (8): AnalyticsController, AuthorController, BookController, MagazineIssueController, NotificationController, PublicationController, ReadingProgressController, AuthRequest

### Community 49 - ".notFound"
Cohesion: 0.06
Nodes (12): Category, categorySchema, ICategory, ICategoryModel, CategoryFilter, CategoryRepository, CategoryService, CategoryStats (+4 more)

### Community 50 - "validation.ts"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 51 - "OTPService"
Cohesion: 0.06
Nodes (48): validate(), validateBody(), validateParams(), validateQuery(), router, router, router, router (+40 more)

### Community 52 - "ITagModel"
Cohesion: 0.11
Nodes (7): Book, BookPage, ReaderChrome(), ReadingMode, Route, ThemeName, THEMES

### Community 53 - "password.ts"
Cohesion: 0.23
Nodes (9): checkPasswordStrength(), comparePassword(), hashPassword(), hasSequentialChars(), PasswordStrength, TODO: Integrate with HaveIBeenPwned API (k-anonymity model), rehashIfNeeded(), timingSafeComparePassword() (+1 more)

### Community 55 - "IUserModel"
Cohesion: 0.10
Nodes (6): IReadingProgress, ReadingProgress, readingProgressSchema, ReadingProgressRepository, ReadingProgressService, mockReadingProgressRepository

### Community 56 - "@types/bcryptjs"
Cohesion: 0.12
Nodes (14): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut() (+6 more)

### Community 57 - "NotificationRepository"
Cohesion: 0.08
Nodes (7): INotification, INotificationModel, Notification, notificationSchema, NotificationType, NotificationRepository, NotificationService

### Community 58 - "MagazineIssueRepository"
Cohesion: 0.17
Nodes (7): IMagazineIssue, IssueStatus, MagazineIssue, magazineIssueSchema, MagazineIssueFilter, MagazineIssueRepository, MagazineIssueService

### Community 59 - "CLAUDE.md"
Cohesion: 0.33
Nodes (4): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution

### Community 60 - "CollectionRepository"
Cohesion: 0.15
Nodes (7): Author, authorSchema, IAuthor, IAuthorModel, AuthorFilter, AuthorRepository, AuthorService

### Community 61 - "IUserModel"
Cohesion: 0.07
Nodes (38): router, ChangePasswordInput, changePasswordSchema, Disable2FAInput, disable2FASchema, enable2FASchema, ForgotPasswordInput, forgotPasswordSchema (+30 more)

### Community 62 - "jest"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 63 - "FavoriteRepository"
Cohesion: 0.08
Nodes (8): Favorite, favoriteSchema, FavoriteType, IFavorite, IFavoriteModel, FavoriteRepository, DashboardService, FavoriteService

### Community 64 - "AuthorRepository"
Cohesion: 0.20
Nodes (7): CreateSubscriptionData, SubscriptionFilters, subscriptionsApi, UpdateSubscriptionData, queryKeys, Subscription, SubscriptionPlan

### Community 65 - "SeriesRepository"
Cohesion: 0.18
Nodes (7): ISeries, ISeriesModel, Series, seriesSchema, SeriesFilter, SeriesRepository, SeriesService

### Community 66 - "Phase 4: User Module Implementation - Completion Summary"
Cohesion: 0.08
Nodes (23): 1. Reading Tracking System, 1. User Model Enhancement, 2. Content Organization, 2. Core Data Models (7 models), 3. Repositories (7 repositories), 3. User Personalization, 4. Analytics & Insights, 4. Services (9 services) (+15 more)

### Community 67 - "GenreRepository"
Cohesion: 0.24
Nodes (10): StoragePath, storagePathSchema, StorageStatus, StorageType, SearchFilter, StoragePathFilter, CreateFolderInput, ImportFolderInput (+2 more)

### Community 69 - "IReadingHistory"
Cohesion: 0.09
Nodes (7): IReadingHistory, IReadingHistoryModel, ReadingHistory, readingHistorySchema, ReadingHistoryRepository, AnalyticsWindow, ReadingHistoryService

### Community 70 - "SessionService"
Cohesion: 0.18
Nodes (18): protect, router, createAuthorSchema, createBookSchema, createCollectionSchema, createGenreSchema, createMagazineIssueSchema, createPublicationSchema (+10 more)

### Community 71 - "errorHandler.ts"
Cohesion: 0.12
Nodes (13): react, react, useCarousel(), ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent (+5 more)

### Community 73 - "otp.ts"
Cohesion: 0.08
Nodes (21): CreateOTPData, OTPFilter, VerifyOTPData, TwoFactorService, TwoFactorVerifyData, base32Decode(), base32Encode(), generateBackupCodes() (+13 more)

### Community 74 - "PublicationRepository"
Cohesion: 0.15
Nodes (7): IPublication, Publication, publicationSchema, PublicationStatus, PublicationFilter, PublicationRepository, PublicationService

### Community 76 - "PublisherRepository"
Cohesion: 0.08
Nodes (14): Genre, genreSchema, IGenre, IGenreModel, IPublisher, IPublisherModel, Publisher, publisherSchema (+6 more)

### Community 77 - "NoteService"
Cohesion: 0.08
Nodes (6): INote, INoteModel, Note, noteSchema, NoteRepository, NoteService

### Community 78 - "validation.ts"
Cohesion: 0.15
Nodes (11): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+3 more)

### Community 79 - "ProfileController"
Cohesion: 0.21
Nodes (8): app, limiter, startServer(), connectDB(), swaggerConfig, swaggerSpec, requestLogger, router

### Community 80 - "TwoFactorService.ts"
Cohesion: 0.04
Nodes (38): ADMIN_GROUPS, AuthShell(), StubPage(), AdminLayout(), Route, Route, Route, Route (+30 more)

### Community 81 - "HighlightService"
Cohesion: 0.07
Nodes (6): Highlight, highlightSchema, IHighlight, IHighlightModel, HighlightRepository, HighlightService

### Community 82 - ".badRequest"
Cohesion: 0.12
Nodes (3): EditorialController, requireParam(), requireUserId()

### Community 83 - "BookmarkRepository"
Cohesion: 0.17
Nodes (4): createPaymentProvider(), NamedDummyPaymentProvider, DummyPaymentProvider, generatePaymentReference()

### Community 84 - "NoteRepository"
Cohesion: 0.12
Nodes (15): AccessDecision, CommerceLineItem, CouponType, CreateOrderItemInput, CreatePaymentInput, OrderStatus, SubscriptionActionInput, historySchema (+7 more)

### Community 85 - "MagazineIssueController"
Cohesion: 0.11
Nodes (12): CommerceAuditTrailEntry, PaymentStatus, attemptSchema, auditSchema, CommercePayment, ICommercePayment, IPaymentAttempt, paymentSchema (+4 more)

### Community 86 - "validate.ts"
Cohesion: 0.15
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 87 - "Article.ts"
Cohesion: 0.15
Nodes (12): API Endpoints, Architecture Notes, Environment Setup, Features, Getting Started, Installation, License, Prerequisites (+4 more)

### Community 88 - "PublicationController"
Cohesion: 0.14
Nodes (12): Article, articleSchema, ArticleStatus, ICategory, IMedia, ITag, IUser, ArticleFilter (+4 more)

### Community 89 - "ReadingProgressController"
Cohesion: 0.09
Nodes (6): SystemController, ISetting, Setting, SettingSchema, SettingRepository, SystemService

### Community 90 - "BookmarkService"
Cohesion: 0.10
Nodes (7): Bookmark, bookmarkSchema, BookmarkType, IBookmark, IBookmarkModel, BookmarkRepository, BookmarkService

### Community 91 - "index.ts"
Cohesion: 0.14
Nodes (13): allowScripts, fsevents@2.3.3, name, private, scripts, build, build:dev, dev (+5 more)

### Community 92 - "profile.ts"
Cohesion: 0.29
Nodes (9): router, changeSubscriptionSchema, updateAvatarSchema, updateBioSchema, updateLanguageSchema, updatePreferencesSchema, updateProfileSchema, updateSocialLinksSchema (+1 more)

### Community 94 - "DashboardService"
Cohesion: 0.16
Nodes (9): CommerceOrder, CommerceOrderRepository, AccessControlService, mockOrderRepository, mockPlanRepository, mockSubscriptionRepository, mockUserRepository, mockWebhookLogRepository (+1 more)

### Community 95 - "GenreController"
Cohesion: 0.09
Nodes (16): RecommendationController, router, router, router, router, express-mongo-sanitize, hpp, xss-clean (+8 more)

### Community 96 - "NotificationController"
Cohesion: 0.16
Nodes (10): adminMiddleware(), authMiddleware, handleMulterError(), storage, upload, uploadSingle(), router, router (+2 more)

### Community 100 - "favoriteController.ts"
Cohesion: 0.20
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 101 - "HighlightController"
Cohesion: 0.17
Nodes (11): mockArticleRepository, mockBookRepository, mockCommerceCouponRepository, mockCommerceInvoiceRepository, mockCommerceOrderRepository, mockCommercePaymentRepository, mockCommerceSubscriptionRepository, mockMagazineIssueRepository (+3 more)

### Community 105 - "Note.ts"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 107 - "highlights.ts"
Cohesion: 0.33
Nodes (6): router, createHighlightSchema, highlightIdSchema, highlightQuerySchema, resourceIdSchema, updateHighlightSchema

### Community 108 - "notes.ts"
Cohesion: 0.09
Nodes (18): authController, ApiError, AppError, errorHandler(), handleCastErrorDB(), handleDuplicateFieldsDB(), handleJWTError(), handleJWTExpiredError() (+10 more)

### Community 109 - "exclude"
Cohesion: 0.25
Nodes (7): exclude, include, src/**/*, dist, node_modules, **/*.spec.ts, **/*.test.ts

### Community 110 - "package.json"
Cohesion: 0.15
Nodes (12): allowScripts, esbuild@0.28.1, fsevents@2.3.3, @scarf/scarf@1.4.0, description, engines, node, main (+4 more)

### Community 111 - "BookmarkController"
Cohesion: 0.21
Nodes (3): FilesystemWatcherController, FileChangeEvent, WatcherConfig

### Community 112 - "auth.ts"
Cohesion: 0.09
Nodes (31): authenticate(), router, router, router, router, router, router, router (+23 more)

### Community 113 - "Bookmark.ts"
Cohesion: 0.13
Nodes (18): DecodedToken, decodeToken(), DEFAULT_ACCESS_OPTIONS, DEFAULT_REFRESH_OPTIONS, DEFAULT_VERIFY_OPTIONS, generateAccessToken(), generateRefreshToken(), generateTokenPair() (+10 more)

### Community 114 - "INotificationModel"
Cohesion: 0.18
Nodes (6): getStorageProvider(), ScanJob, ScanOptions, ScanSchedule, SyncJob, SyncSchedule

### Community 115 - "publicationService.ts"
Cohesion: 0.13
Nodes (7): PlanBillingCycle, IPlan, IPlanModel, Plan, planSchema, PlanRepository, PlanService

### Community 116 - "bookmarks.ts"
Cohesion: 0.39
Nodes (5): router, bookmarkQuerySchema, createBookmarkSchema, paramIdSchema, updateBookmarkSchema

### Community 118 - "progress.ts"
Cohesion: 0.43
Nodes (6): router, paramIdSchema, progressQuerySchema, readerContentSchema, startReadingSchema, updateProgressSchema

### Community 119 - "favorites.ts"
Cohesion: 0.43
Nodes (4): router, createFavoriteSchema, favoriteQuerySchema, paramIdSchema

### Community 120 - "CategoryService.ts"
Cohesion: 0.13
Nodes (7): PromotionType, CommercePromotion, ICommercePromotion, ICommercePromotionModel, promotionSchema, CommercePromotionRepository, PromotionService

### Community 121 - "IPublicationModel"
Cohesion: 0.22
Nodes (9): authApi, AuthResponse, ChangePasswordData, ForgotPasswordData, LoginCredentials, RegisterData, ResetPasswordData, VerifyEmailData (+1 more)

### Community 123 - "typeRoots"
Cohesion: 0.67
Nodes (3): typeRoots, ./node_modules/@types, ./src/types

### Community 125 - "cors"
Cohesion: 0.22
Nodes (9): Administration, Authentication & Account Management, Commerce Infrastructure (`/api/v1/...`), Editorial & Content Workflow, Features, Publishing Catalog, Reader Engagement, Storage & File Management (+1 more)

### Community 126 - "dotenv"
Cohesion: 0.13
Nodes (3): LocalStorageProvider, StorageFile, StorageFolder

### Community 127 - "express"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 129 - "http-status-codes"
Cohesion: 0.16
Nodes (10): RecommendationService, RecommendedContent, TrendingRecommendations, mockArticleRepository, mockBookRepository, mockMagazineIssueRepository, mockPublicationRepository, mockReadingHistoryRepository (+2 more)

### Community 130 - "joi"
Cohesion: 0.27
Nodes (5): PaymentProviderCreateResult, PaymentProviderRefundResult, PaymentProviderStatusResult, PaymentProviderWebhookResult, WebhookService

### Community 132 - "mongoose"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 133 - "multer"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 138 - "tsx"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 140 - "@database/*"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 142 - "@middlewares/*"
Cohesion: 0.22
Nodes (8): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle

### Community 143 - "@services/*"
Cohesion: 0.08
Nodes (20): authorize(), router, router, router, authSchemas, commonSchemas, fileSchemas, InferSchema (+12 more)

### Community 144 - "@tests/*"
Cohesion: 0.22
Nodes (32): createStorageProvider(), resetStorageProvider(), ChecksumOptions, CopyFileOptions, CopyFolderOptions, CopyOptions, CreateFolderOptions, DeleteFileOptions (+24 more)

### Community 146 - "MediaController"
Cohesion: 0.22
Nodes (3): MediaController, requireParam(), requireUserId()

### Community 148 - "ArticleVersionRepository.ts"
Cohesion: 0.04
Nodes (20): ArticleVersion, articleVersionSchema, IArticleVersion, IArticleVersionModel, EditorialComment, editorialCommentSchema, EditorialCommentStatus, IEditorialComment (+12 more)

### Community 149 - "recommendationService.test.ts"
Cohesion: 0.29
Nodes (7): Default URLs, Environment Setup, Getting Started, Installation, Other Scripts, Prerequisites, Run

### Community 150 - "MagazineIssueRepository.ts"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 151 - "StorageFolder"
Cohesion: 0.10
Nodes (13): IReadingStats, ISubscription, IUserPreferences, IUserProfile, User, userSchema, OTPData, OTPFilter (+5 more)

### Community 152 - "commentController.ts"
Cohesion: 0.36
Nodes (3): CommentController, requireParam(), requireUserId()

### Community 158 - "AnalyticsController"
Cohesion: 0.47
Nodes (3): router, advancedSearchSchema, searchSchema

### Community 160 - "ArticleRepository.ts"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 162 - "IReadingProgressModel"
Cohesion: 0.33
Nodes (6): API Reference, Architecture, Environment Variables, Project Structure, Swathi Publications Backend, Tech Stack

### Community 163 - "WebhookController"
Cohesion: 0.33
Nodes (6): CreateProductData, ProductFilters, productsApi, UpdateProductData, Product, ProductVariant

### Community 165 - "hpp"
Cohesion: 0.33
Nodes (4): DIMENSIONS, METRICS, Route, SOURCES

### Community 166 - "eslint-config-prettier"
Cohesion: 0.40
Nodes (3): Backend API Routes Reference, Base URL and entry points, Module summary

### Community 168 - "@config/*"
Cohesion: 0.40
Nodes (4): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution

### Community 170 - "@emails/*"
Cohesion: 0.40
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 175 - "IBookmarkModel"
Cohesion: 0.11
Nodes (22): useAdminComments(), useAdminPayments(), useAdminStats(), useAdminUsers(), useSubscriptionPlans(), formatINR(), AnalyticsPage(), Route (+14 more)

### Community 180 - "ReadingHistoryController"
Cohesion: 0.50
Nodes (3): AccordionContent, AccordionItem, AccordionTrigger

### Community 181 - "admin.bi.publishing.tsx"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

### Community 182 - "admin.bi.reading.tsx"
Cohesion: 0.50
Nodes (3): TabsContent, TabsList, TabsTrigger

### Community 184 - "InvoiceService"
Cohesion: 0.13
Nodes (8): CommerceHistoryEntry, CommerceInvoice, historySchema, ICommerceInvoice, ICommerceInvoiceModel, invoiceSchema, CommerceInvoiceRepository, InvoiceService

### Community 186 - "WebhookController"
Cohesion: 0.29
Nodes (3): WebhookController, router, webhookSchema

### Community 195 - "morgan"
Cohesion: 0.50
Nodes (3): Avatar, AvatarFallback, AvatarImage

## Knowledge Gaps
- **1060 isolated node(s):** `root`, `parser`, `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `prettier/prettier` (+1055 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **110 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthRequest` connect `BaseRepository` to `helmet`, `index.ts`, `jsonwebtoken`, `@services/*`, `eslint-plugin-prettier`, `@utils/*`, `MediaController`, `commentController.ts`, `NoteController`, `AuthorController`, `TagController`, `ReadingProgressRepository`, `AnalyticsController`, `OTPService`, `eslint-plugin-prettier`, `WebhookController`, `PublicationRepository`, `.badRequest`, `profile.ts`, `CollectionController`, `GenreController`, `NotificationController`, `publisherService.ts`, `DashboardController`, `ReadingHistory.ts`, `highlights.ts`, `notes.ts`, `auth.ts`, `bookmarks.ts`, `notifications.ts`, `favorites.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `express` connect `GenreController` to `@services/*`, `commentController.ts`, `@types/express`, `AnalyticsController`, `OTPService`, `WebhookController`, `IUserModel`, `GenreRepository`, `SessionService`, `PublicationRepository`, `ProfileController`, `ReadingProgressController`, `profile.ts`, `NotificationController`, `highlights.ts`, `notes.ts`, `BookmarkController`, `auth.ts`, `INotificationModel`, `bookmarks.ts`, `progress.ts`, `favorites.ts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `ApiError` connect `notes.ts` to `http-status-codes`, `TagRepository`, `@services/*`, `tsx`, `ArticleVersionRepository.ts`, `@types/bcryptjs`, `@types/compression`, `StorageFolder`, `AnalyticsController`, `@types/multer`, `@typescript-eslint/eslint-plugin`, `jwt.ts`, `.notFound`, `OTPService`, `password.ts`, `IUserModel`, `InvoiceService`, `NotificationRepository`, `MagazineIssueRepository`, `CollectionRepository`, `FavoriteRepository`, `SeriesRepository`, `GenreRepository`, `IReadingHistory`, `otp.ts`, `PublicationRepository`, `PublisherRepository`, `NoteService`, `HighlightService`, `NoteRepository`, `MagazineIssueController`, `PublicationController`, `ReadingProgressController`, `BookmarkService`, `DashboardService`, `GenreController`, `NotificationController`, `highlights.ts`, `BookmarkController`, `Bookmark.ts`, `INotificationModel`, `publicationService.ts`, `bookmarks.ts`, `favorites.ts`, `CategoryService.ts`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **What connects `root`, `parser`, `eslint:recommended` to the rest of the system?**
  _1060 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ArticleRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.008197208197208197 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.047082494969818915 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._