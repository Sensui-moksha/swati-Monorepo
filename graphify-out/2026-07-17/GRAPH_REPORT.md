# Graph Report - Prototype v0  (2026-07-17)

## Corpus Check
- 253 files · ~96,366 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2661 nodes · 5779 edges · 175 communities (80 shown, 95 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

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

## God Nodes (most connected - your core abstractions)
1. `AuthRequest` - 322 edges
2. `PaginationOptions` - 116 edges
3. `PaginatedResult` - 99 edges
4. `IUser` - 94 edges
5. `BaseRepository` - 93 edges
6. `CommerceController` - 78 edges
7. `ApiError` - 62 edges
8. `IStoragePath` - 58 edges
9. `UserRepository` - 51 edges
10. `IArticle` - 47 edges

## Surprising Connections (you probably didn't know these)
- `CategoryTreeNode` --inherits--> `ICategory`  [EXTRACTED]
  backend/src/services/CategoryService.ts → backend/src/models/Category.ts
- `ICommerceSubscription` --references--> `SubscriptionStatus`  [EXTRACTED]
  backend/src/models/CommerceSubscription.ts → backend/src/interfaces/commerce.ts
- `ICommerceInvoice` --references--> `CommerceHistoryEntry`  [EXTRACTED]
  backend/src/models/CommerceInvoice.ts → backend/src/interfaces/commerce.ts
- `ICommerceSubscription` --references--> `CommerceHistoryEntry`  [EXTRACTED]
  backend/src/models/CommerceSubscription.ts → backend/src/interfaces/commerce.ts
- `optionalAuth()` --references--> `User`  [EXTRACTED]
  backend/src/middleware/auth.ts → backend/src/models/User.ts

## Import Cycles
- None detected.

## Communities (175 total, 95 thin omitted)

### Community 0 - "ArticleRepository"
Cohesion: 0.08
Nodes (6): IWebhookLog, IWebhookLogModel, WebhookLog, webhookLogSchema, BaseRepository, WebhookLogRepository

### Community 1 - "index.ts"
Cohesion: 0.05
Nodes (3): CommerceController, requireParam(), requireUserId()

### Community 2 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, compression, cookie-parser, dotenv, express-rate-limit, morgan, swagger-jsdoc, xss-clean (+7 more)

### Community 3 - "app.ts"
Cohesion: 0.13
Nodes (16): app, limiter, startServer(), databaseConfig, connectDB(), emailConfig, env, EnvConfig (+8 more)

### Community 4 - "paths"
Cohesion: 0.10
Nodes (21): paths, @database/*, @interfaces/*, @jobs/*, @models/*, @repositories/*, @routes/*, @services/* (+13 more)

### Community 5 - "compilerOptions"
Cohesion: 0.09
Nodes (23): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, ignoreDeprecations (+15 more)

### Community 7 - "auth.ts"
Cohesion: 0.07
Nodes (3): PaginatedResult, PaginationOptions, MetadataRepository

### Community 9 - "TagRepository"
Cohesion: 0.08
Nodes (7): ITag, ITagModel, Tag, tagSchema, TagFilter, TagRepository, TagService

### Community 10 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:connect, dev, docs:generate, format, lint, lint:fix (+4 more)

### Community 11 - "MediaRepository"
Cohesion: 0.16
Nodes (6): CreateOTPData, OTPFilter, OTPService, VerifyOTPData, generateOTP(), hashOTP()

### Community 12 - "NewsletterRepository"
Cohesion: 0.07
Nodes (9): ICategory, INewsletter, INewsletterModel, ITag, Newsletter, newsletterSchema, NewsletterStatus, NewsletterFilter (+1 more)

### Community 14 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, eslint, eslint-plugin-prettier, @types/nodemailer, eslint, eslint-plugin-prettier, @types/nodemailer

### Community 16 - "eslint-plugin-prettier"
Cohesion: 0.08
Nodes (25): ICommerceInvoice, CommerceInvoiceRepository, CommerceOrderRepository, UserFilter, AccessControlService, AnalyticsWindow, InvoiceService, mockArticleRepository (+17 more)

### Community 20 - "tsx"
Cohesion: 0.19
Nodes (15): AuthTokens, ChangePasswordInput, EmailOptions, ForgotPasswordInput, LoginInput, RefreshTokenInput, RegisterInput, ResetPasswordInput (+7 more)

### Community 21 - "@types/bcryptjs"
Cohesion: 0.09
Nodes (7): IMedia, Media, mediaSchema, MediaType, MediaFilter, MediaRepository, MediaService

### Community 44 - "jwt.ts"
Cohesion: 0.07
Nodes (8): Book, bookSchema, BookStatus, IBook, IBookModel, BookFilter, BookRepository, BookService

### Community 45 - ".badRequest"
Cohesion: 0.13
Nodes (9): Category, categorySchema, ICategoryModel, CategoryFilter, CategoryStats, CategoryTreeNode, CategoryWithArticleCount, CreateCategoryInput (+1 more)

### Community 46 - "templates.ts"
Cohesion: 0.25
Nodes (18): accountDeactivatedTemplate(), accountDeletionTemplate(), baseLayout(), baseLayoutText(), emailChangedTemplate(), EmailTemplateData, EmailTemplateFunction, EmailTemplateKey (+10 more)

### Community 47 - "BaseRepository"
Cohesion: 0.05
Nodes (7): BookController, MagazineIssueController, PublisherController, ReadingHistoryController, ReadingProgressController, SeriesController, AuthRequest

### Community 50 - "validation.ts"
Cohesion: 0.14
Nodes (9): IReadingStats, ISubscription, userSchema, OTPData, OTPFilter, SessionFilter, CreateSessionData, SessionFilter (+1 more)

### Community 51 - "OTPService"
Cohesion: 0.06
Nodes (42): router, router, router, router, router, router, router, couponCodeSchema (+34 more)

### Community 53 - "password.ts"
Cohesion: 0.23
Nodes (9): checkPasswordStrength(), comparePassword(), hashPassword(), hasSequentialChars(), PasswordStrength, TODO: Integrate with HaveIBeenPwned API (k-anonymity model), rehashIfNeeded(), timingSafeComparePassword() (+1 more)

### Community 55 - "IUserModel"
Cohesion: 0.14
Nodes (5): IReadingProgress, ReadingProgress, readingProgressSchema, ReadingProgressService, mockReadingProgressRepository

### Community 57 - "NotificationRepository"
Cohesion: 0.08
Nodes (7): INotification, INotificationModel, Notification, notificationSchema, NotificationType, NotificationRepository, NotificationService

### Community 58 - "MagazineIssueRepository"
Cohesion: 0.19
Nodes (4): IMagazineIssue, MagazineIssueFilter, MagazineIssueRepository, MagazineIssueService

### Community 59 - "CLAUDE.md"
Cohesion: 0.33
Nodes (4): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution

### Community 60 - "CollectionRepository"
Cohesion: 0.14
Nodes (8): Collection, collectionSchema, CollectionType, ICollection, ICollectionModel, CollectionFilter, CollectionRepository, CollectionService

### Community 61 - "IUserModel"
Cohesion: 0.07
Nodes (39): authController, router, ChangePasswordInput, changePasswordSchema, Disable2FAInput, disable2FASchema, enable2FASchema, ForgotPasswordInput (+31 more)

### Community 63 - "FavoriteRepository"
Cohesion: 0.11
Nodes (7): Favorite, favoriteSchema, FavoriteType, IFavorite, IFavoriteModel, FavoriteRepository, FavoriteService

### Community 64 - "AuthorRepository"
Cohesion: 0.15
Nodes (7): Author, authorSchema, IAuthor, IAuthorModel, AuthorFilter, AuthorRepository, AuthorService

### Community 65 - "SeriesRepository"
Cohesion: 0.09
Nodes (25): protect, ISeries, ISeriesModel, Series, seriesSchema, SeriesFilter, SeriesRepository, router (+17 more)

### Community 66 - "Phase 4: User Module Implementation - Completion Summary"
Cohesion: 0.08
Nodes (23): 1. Reading Tracking System, 1. User Model Enhancement, 2. Content Organization, 2. Core Data Models (7 models), 3. Repositories (7 repositories), 3. User Personalization, 4. Analytics & Insights, 4. Services (9 services) (+15 more)

### Community 67 - "GenreRepository"
Cohesion: 0.18
Nodes (7): Genre, genreSchema, IGenre, IGenreModel, GenreFilter, GenreRepository, GenreService

### Community 68 - "UserProfileService"
Cohesion: 0.09
Nodes (3): IUserPreferences, IUserProfile, UserProfileService

### Community 69 - "IReadingHistory"
Cohesion: 0.12
Nodes (7): IReadingHistory, ReadingHistory, readingHistorySchema, ReadingHistoryRepository, ReadingHistoryService, RecommendedContent, TrendingRecommendations

### Community 71 - "errorHandler.ts"
Cohesion: 0.30
Nodes (10): AppError, errorHandler(), handleCastErrorDB(), handleDuplicateFieldsDB(), handleJWTError(), handleJWTExpiredError(), handleValidationErrorDB(), notFound() (+2 more)

### Community 73 - "otp.ts"
Cohesion: 0.13
Nodes (12): TwoFactorVerifyData, base32Decode(), generateQRCodeURL(), generateTOTP(), OTPConfig, OTPResult, timingSafeEqual(), TOTPVerificationResult (+4 more)

### Community 74 - "PublicationRepository"
Cohesion: 0.17
Nodes (7): IPublication, Publication, publicationSchema, PublicationStatus, PublicationFilter, PublicationRepository, PublicationService

### Community 76 - "PublisherRepository"
Cohesion: 0.16
Nodes (7): IPublisher, IPublisherModel, Publisher, publisherSchema, PublisherFilter, PublisherRepository, PublisherService

### Community 77 - "NoteService"
Cohesion: 0.10
Nodes (5): INote, Note, noteSchema, NoteRepository, NoteService

### Community 78 - "validation.ts"
Cohesion: 0.14
Nodes (13): authSchemas, fileSchemas, InferSchema, otpSchemas, responseSchemas, sanitize(), sanitizeInput(), sanitizeObject() (+5 more)

### Community 80 - "TwoFactorService.ts"
Cohesion: 0.14
Nodes (4): TwoFactorService, base32Encode(), generateBackupCodes(), generateTOTPSecret()

### Community 81 - "HighlightService"
Cohesion: 0.09
Nodes (5): Highlight, highlightSchema, IHighlight, HighlightRepository, HighlightService

### Community 82 - ".badRequest"
Cohesion: 0.11
Nodes (3): EditorialController, requireParam(), requireUserId()

### Community 83 - "BookmarkRepository"
Cohesion: 0.07
Nodes (10): createPaymentProvider(), NamedDummyPaymentProvider, PaymentProvider, PaymentProviderCreateResult, PaymentProviderRefundResult, PaymentProviderStatusResult, PaymentProviderWebhookResult, DummyPaymentProvider (+2 more)

### Community 84 - "NoteRepository"
Cohesion: 0.10
Nodes (19): AccessDecision, CommerceHistoryEntry, CommerceLineItem, CouponType, CreateOrderItemInput, CreatePaymentInput, OrderStatus, SubscriptionActionInput (+11 more)

### Community 85 - "MagazineIssueController"
Cohesion: 0.10
Nodes (12): CommerceAuditTrailEntry, PaymentStatus, attemptSchema, auditSchema, CommercePayment, ICommercePayment, ICommercePaymentModel, IPaymentAttempt (+4 more)

### Community 86 - "validate.ts"
Cohesion: 0.53
Nodes (4): router, historyQuerySchema, paramIdSchema, recordReadingSchema

### Community 87 - "Article.ts"
Cohesion: 0.22
Nodes (7): Article, articleSchema, ArticleStatus, ICategory, IMedia, ITag, IUser

### Community 89 - "ReadingProgressController"
Cohesion: 0.09
Nodes (6): SystemController, ISetting, Setting, SettingSchema, SettingRepository, SystemService

### Community 90 - "BookmarkService"
Cohesion: 0.10
Nodes (8): ApiError, Bookmark, bookmarkSchema, BookmarkType, IBookmark, IBookmarkModel, BookmarkRepository, BookmarkService

### Community 91 - "index.ts"
Cohesion: 0.22
Nodes (9): RecommendationController, authenticate(), optionalAuth(), refreshTokenAuth(), User, router, router, advancedSearchSchema (+1 more)

### Community 92 - "profile.ts"
Cohesion: 0.33
Nodes (9): router, changeSubscriptionSchema, updateAvatarSchema, updateBioSchema, updateLanguageSchema, updatePreferencesSchema, updateProfileSchema, updateSocialLinksSchema (+1 more)

### Community 98 - "publisherService.ts"
Cohesion: 0.15
Nodes (9): ICommerceSubscription, CommerceSubscriptionRepository, SubscriptionService, toId(), mockPlanRepository, mockSubscriptionRepository, mockUserRepository, appendHistory() (+1 more)

### Community 104 - "Highlight.ts"
Cohesion: 0.07
Nodes (15): SubscriptionStatus, ICommerceInvoiceModel, ICommerceOrderModel, CommerceSubscription, historySchema, ICommerceSubscriptionModel, subscriptionSchema, EditorialComment (+7 more)

### Community 107 - "highlights.ts"
Cohesion: 0.39
Nodes (6): router, createHighlightSchema, highlightIdSchema, highlightQuerySchema, resourceIdSchema, updateHighlightSchema

### Community 108 - "notes.ts"
Cohesion: 0.39
Nodes (6): router, createNoteSchema, noteIdSchema, noteQuerySchema, resourceIdSchema, updateNoteSchema

### Community 109 - "exclude"
Cohesion: 0.25
Nodes (7): exclude, include, dist, node_modules, **/*.spec.ts, src/**/*, **/*.test.ts

### Community 110 - "package.json"
Cohesion: 0.29
Nodes (6): description, engines, node, main, name, version

### Community 112 - "auth.ts"
Cohesion: 0.10
Nodes (32): authorize(), router, router, router, router, router, router, router (+24 more)

### Community 113 - "Bookmark.ts"
Cohesion: 0.12
Nodes (19): jwtConfig, DecodedToken, decodeToken(), DEFAULT_ACCESS_OPTIONS, DEFAULT_REFRESH_OPTIONS, DEFAULT_VERIFY_OPTIONS, generateAccessToken(), generateRefreshToken() (+11 more)

### Community 114 - "INotificationModel"
Cohesion: 0.19
Nodes (15): StoragePath, storagePathSchema, StorageStatus, StorageType, createStorageProvider(), SearchFilter, StoragePathFilter, FileChangeEvent (+7 more)

### Community 115 - "publicationService.ts"
Cohesion: 0.13
Nodes (7): PlanBillingCycle, IPlan, IPlanModel, Plan, planSchema, PlanRepository, PlanService

### Community 116 - "bookmarks.ts"
Cohesion: 0.48
Nodes (5): router, bookmarkQuerySchema, createBookmarkSchema, paramIdSchema, updateBookmarkSchema

### Community 117 - "notifications.ts"
Cohesion: 0.20
Nodes (11): validate(), validateBody(), validateParams(), validateQuery(), router, router, webhookSchema, markAsReadSchema (+3 more)

### Community 118 - "progress.ts"
Cohesion: 0.43
Nodes (6): router, paramIdSchema, progressQuerySchema, readerContentSchema, startReadingSchema, updateProgressSchema

### Community 119 - "favorites.ts"
Cohesion: 0.53
Nodes (4): router, createFavoriteSchema, favoriteQuerySchema, paramIdSchema

### Community 120 - "CategoryService.ts"
Cohesion: 0.13
Nodes (7): PromotionType, CommercePromotion, ICommercePromotion, ICommercePromotionModel, promotionSchema, CommercePromotionRepository, PromotionService

### Community 123 - "typeRoots"
Cohesion: 0.67
Nodes (3): typeRoots, ./node_modules/@types, ./src/types

### Community 140 - "@database/*"
Cohesion: 0.15
Nodes (6): CommerceCoupon, couponSchema, ICommerceCoupon, ICommerceCouponModel, CommerceCouponRepository, CouponService

### Community 143 - "@services/*"
Cohesion: 0.16
Nodes (11): router, router, router, router, commonSchemas, adminSchemas, userRoleEnum, analyticsExportSchema (+3 more)

### Community 144 - "@tests/*"
Cohesion: 0.32
Nodes (11): ChecksumOptions, CopyOptions, DeleteOptions, ExistsOptions, ListOptions, MoveOptions, StorageEvent, StorageProviderConfig (+3 more)

### Community 146 - "MediaController"
Cohesion: 0.22
Nodes (3): MediaController, requireParam(), requireUserId()

### Community 148 - "ArticleVersionRepository.ts"
Cohesion: 0.23
Nodes (5): ArticleVersion, articleVersionSchema, IArticleVersion, IArticleVersionModel, ArticleVersionRepository

### Community 149 - "recommendationService.test.ts"
Cohesion: 0.20
Nodes (8): RecommendationService, mockArticleRepository, mockBookRepository, mockMagazineIssueRepository, mockPublicationRepository, mockReadingHistoryRepository, mockReadingProgressRepository, mockUserRepository

### Community 150 - "MagazineIssueRepository.ts"
Cohesion: 0.20
Nodes (4): IMagazineIssueModel, IssueStatus, MagazineIssue, magazineIssueSchema

### Community 152 - "commentController.ts"
Cohesion: 0.36
Nodes (3): CommentController, requireParam(), requireUserId()

### Community 160 - "ArticleRepository.ts"
Cohesion: 0.29
Nodes (5): ArticleFilter, ArticleInput, mockArticleRepository, mockArticleVersionRepository, mockTagRepository

## Knowledge Gaps
- **315 isolated node(s):** `name`, `version`, `description`, `main`, `dev` (+310 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **95 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthRequest` connect `BaseRepository` to `index.ts`, `eslint-plugin-prettier`, `@utils/*`, `MediaController`, `adminController.ts`, `commentController.ts`, `NoteController`, `AuthorController`, `TagController`, `AnalyticsController`, `WebhookController`, `jwt.ts`, `IUserModel`, `MagazineIssueRepository`, `CollectionRepository`, `IUserModel`, `FavoriteRepository`, `AuthorRepository`, `SeriesRepository`, `UserProfileService`, `PublisherRepository`, `NoteService`, `ProfileController`, `.badRequest`, `BookmarkRepository`, `PublicationController`, `BookmarkService`, `index.ts`, `CollectionController`, `DashboardService`, `GenreController`, `NotificationController`, `DashboardController`, `favoriteController.ts`, `HighlightController`, `BookmarkController`, `SearchController`?**
  _High betweenness centrality (0.206) - this node is a cross-community bridge._
- **Why does `ApiError` connect `BookmarkService` to `TagRepository`, `MediaRepository`, `@database/*`, `eslint-plugin-prettier`, `tsx`, `@types/bcryptjs`, `ArticleRepository.ts`, `AuthService`, `jwt.ts`, `.badRequest`, `BaseRepository`, `.notFound`, `password.ts`, `IUserModel`, `NotificationRepository`, `MagazineIssueRepository`, `CollectionRepository`, `IUserModel`, `FavoriteRepository`, `AuthorRepository`, `SeriesRepository`, `GenreRepository`, `UserProfileService`, `IReadingHistory`, `errorHandler.ts`, `otp.ts`, `PublicationRepository`, `PublisherRepository`, `NoteService`, `validation.ts`, `TwoFactorService.ts`, `HighlightService`, `NoteRepository`, `ReadingProgressController`, `index.ts`, `DashboardService`, `NotificationController`, `publisherService.ts`, `HighlightController`, `Highlight.ts`, `Bookmark.ts`, `INotificationModel`, `publicationService.ts`, `notifications.ts`, `CategoryService.ts`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Why does `BaseRepository` connect `ArticleRepository` to `CategoryRepository`, `auth.ts`, `IUser`, `TagRepository`, `@database/*`, `NewsletterRepository`, `eslint-plugin-prettier`, `jest`, `ArticleVersionRepository.ts`, `@types/bcryptjs`, `MagazineIssueRepository.ts`, `ReadingProgressRepository`, `ArticleRepository.ts`, `eslint-config-prettier`, `jwt.ts`, `.badRequest`, `validation.ts`, `IUserModel`, `NotificationRepository`, `MagazineIssueRepository`, `CollectionRepository`, `FavoriteRepository`, `AuthorRepository`, `SeriesRepository`, `GenreRepository`, `IReadingHistory`, `PublicationRepository`, `ICategory`, `PublisherRepository`, `NoteService`, `HighlightService`, `MagazineIssueController`, `ReadingProgressController`, `BookmarkService`, `publisherService.ts`, `ReadingHistoryController`, `Highlight.ts`, `INotificationModel`, `publicationService.ts`, `CategoryService.ts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _315 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ArticleRepository` be split into smaller, more focused modules?**
  _Cohesion score 0.07881773399014778 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.047082494969818915 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._