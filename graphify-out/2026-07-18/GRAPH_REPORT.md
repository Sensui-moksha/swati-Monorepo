# Graph Report - Prototype v0  (2026-07-18)

## Corpus Check
- 272 files · ~111,334 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2908 nodes · 6351 edges · 198 communities (83 shown, 115 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.52)
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
- IBookmarkModel
- ICommercePaymentModel
- ICommercePromotionModel
- dotenv
- eslint-plugin-prettier
- ReadingHistoryController
- CommerceSubscription.ts
- StorageWatcher
- ReadingHistoryRepository
- InvoiceService
- accessControlService.ts
- WebhookController
- subscriptionService.test.ts
- @aws-sdk/s3-request-presigner
- @azure/storage-blob
- bcryptjs
- chokidar
- compression
- cookie-parser
- express-rate-limit
- morgan
- xss-clean
- eslint-config-prettier

## God Nodes (most connected - your core abstractions)
1. `AuthRequest` - 322 edges
2. `PaginationOptions` - 117 edges
3. `PaginatedResult` - 99 edges
4. `IUser` - 94 edges
5. `BaseRepository` - 93 edges
6. `CommerceController` - 78 edges
7. `ApiError` - 69 edges
8. `IStoragePath` - 58 edges
9. `UserRepository` - 51 edges
10. `IArticle` - 47 edges

## Surprising Connections (you probably didn't know these)
- `CategoryTreeNode` --inherits--> `ICategory`  [EXTRACTED]
  backend/src/services/CategoryService.ts → backend/src/models/Category.ts
- `IPlan` --references--> `PlanBillingCycle`  [EXTRACTED]
  backend/src/models/Plan.ts → backend/src/interfaces/commerce.ts
- `ICommerceSubscription` --references--> `SubscriptionStatus`  [EXTRACTED]
  backend/src/models/CommerceSubscription.ts → backend/src/interfaces/commerce.ts
- `ICommerceInvoice` --references--> `CommerceHistoryEntry`  [EXTRACTED]
  backend/src/models/CommerceInvoice.ts → backend/src/interfaces/commerce.ts
- `ICommerceOrder` --references--> `CommerceHistoryEntry`  [EXTRACTED]
  backend/src/models/CommerceOrder.ts → backend/src/interfaces/commerce.ts

## Import Cycles
- None detected.

## Communities (198 total, 115 thin omitted)

### Community 0 - "ArticleRepository"
Cohesion: 0.24
Nodes (4): getStorageProvider(), ScanJob, ScanOptions, ScanSchedule

### Community 1 - "index.ts"
Cohesion: 0.05
Nodes (3): CommerceController, requireParam(), requireUserId()

### Community 2 - "dependencies"
Cohesion: 0.13
Nodes (15): @aws-sdk/s3-request-presigner, dependencies, @aws-sdk/s3-request-presigner, express, @google-cloud/storage, nodemailer, swagger-jsdoc, swagger-ui-express (+7 more)

### Community 3 - "app.ts"
Cohesion: 0.15
Nodes (14): app, limiter, startServer(), databaseConfig, connectDB(), env, EnvConfig, envSchema (+6 more)

### Community 4 - "paths"
Cohesion: 0.10
Nodes (21): paths, @database/*, @interfaces/*, @jobs/*, @models/*, @repositories/*, @routes/*, @services/* (+13 more)

### Community 5 - "compilerOptions"
Cohesion: 0.09
Nodes (23): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, ignoreDeprecations (+15 more)

### Community 7 - "auth.ts"
Cohesion: 0.07
Nodes (4): PaginatedResult, PaginationOptions, MetadataRepository, NoteRepository

### Community 9 - "TagRepository"
Cohesion: 0.11
Nodes (6): ITag, Tag, tagSchema, TagFilter, TagRepository, TagService

### Community 10 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:connect, dev, docs:generate, format, lint, lint:fix (+4 more)

### Community 14 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, eslint, eslint-plugin-prettier, @types/nodemailer, eslint, eslint-plugin-prettier, @types/nodemailer

### Community 16 - "eslint-plugin-prettier"
Cohesion: 0.22
Nodes (5): CommerceHistoryEntry, CommerceInvoice, historySchema, ICommerceInvoiceModel, invoiceSchema

### Community 20 - "tsx"
Cohesion: 0.17
Nodes (16): emailConfig, AuthTokens, ChangePasswordInput, EmailOptions, ForgotPasswordInput, LoginInput, RefreshTokenInput, RegisterInput (+8 more)

### Community 21 - "@types/bcryptjs"
Cohesion: 0.06
Nodes (9): IMedia, IMediaModel, Media, mediaSchema, MediaType, MediaFilter, MediaRepository, AnalyticsService (+1 more)

### Community 44 - "jwt.ts"
Cohesion: 0.10
Nodes (7): Book, bookSchema, BookStatus, IBook, BookFilter, BookRepository, BookService

### Community 45 - ".badRequest"
Cohesion: 0.15
Nodes (8): Category, categorySchema, ICategoryModel, CategoryStats, CategoryTreeNode, CategoryWithArticleCount, CreateCategoryInput, UpdateCategoryInput

### Community 46 - "templates.ts"
Cohesion: 0.25
Nodes (18): accountDeactivatedTemplate(), accountDeletionTemplate(), baseLayout(), baseLayoutText(), emailChangedTemplate(), EmailTemplateData, EmailTemplateFunction, EmailTemplateKey (+10 more)

### Community 47 - "BaseRepository"
Cohesion: 0.04
Nodes (10): AnalyticsController, BookController, BookmarkController, FavoriteController, HighlightController, MagazineIssueController, NoteController, NotificationController (+2 more)

### Community 50 - "validation.ts"
Cohesion: 0.20
Nodes (7): IReadingStats, ISubscription, IUserModel, IUserPreferences, IUserProfile, userSchema, UserFilter

### Community 51 - "OTPService"
Cohesion: 0.06
Nodes (42): router, router, router, router, router, router, router, couponCodeSchema (+34 more)

### Community 53 - "password.ts"
Cohesion: 0.23
Nodes (9): checkPasswordStrength(), comparePassword(), hashPassword(), hasSequentialChars(), PasswordStrength, TODO: Integrate with HaveIBeenPwned API (k-anonymity model), rehashIfNeeded(), timingSafeComparePassword() (+1 more)

### Community 55 - "IUserModel"
Cohesion: 0.10
Nodes (6): IReadingProgress, ReadingProgress, readingProgressSchema, ReadingProgressRepository, ReadingProgressService, mockReadingProgressRepository

### Community 57 - "NotificationRepository"
Cohesion: 0.14
Nodes (5): INotification, Notification, notificationSchema, NotificationType, NotificationService

### Community 58 - "MagazineIssueRepository"
Cohesion: 0.12
Nodes (8): IMagazineIssue, IMagazineIssueModel, IssueStatus, MagazineIssue, magazineIssueSchema, MagazineIssueFilter, MagazineIssueRepository, MagazineIssueService

### Community 59 - "CLAUDE.md"
Cohesion: 0.33
Nodes (4): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution

### Community 60 - "CollectionRepository"
Cohesion: 0.15
Nodes (8): Collection, collectionSchema, CollectionType, ICollection, ICollectionModel, CollectionFilter, CollectionRepository, CollectionService

### Community 61 - "IUserModel"
Cohesion: 0.07
Nodes (38): authController, ChangePasswordInput, changePasswordSchema, Disable2FAInput, disable2FASchema, enable2FASchema, ForgotPasswordInput, forgotPasswordSchema (+30 more)

### Community 63 - "FavoriteRepository"
Cohesion: 0.18
Nodes (5): Favorite, favoriteSchema, FavoriteType, IFavorite, FavoriteService

### Community 64 - "AuthorRepository"
Cohesion: 0.15
Nodes (7): Author, authorSchema, IAuthor, IAuthorModel, AuthorFilter, AuthorRepository, AuthorService

### Community 65 - "SeriesRepository"
Cohesion: 0.18
Nodes (7): ISeries, ISeriesModel, Series, seriesSchema, SeriesFilter, SeriesRepository, SeriesService

### Community 66 - "Phase 4: User Module Implementation - Completion Summary"
Cohesion: 0.08
Nodes (23): 1. Reading Tracking System, 1. User Model Enhancement, 2. Content Organization, 2. Core Data Models (7 models), 3. Repositories (7 repositories), 3. User Personalization, 4. Analytics & Insights, 4. Services (9 services) (+15 more)

### Community 67 - "GenreRepository"
Cohesion: 0.18
Nodes (7): Genre, genreSchema, IGenre, IGenreModel, GenreFilter, GenreRepository, GenreService

### Community 70 - "SessionService"
Cohesion: 0.07
Nodes (5): IUserSession, CreateSessionData, SessionFilter, SessionService, UpdateSessionData

### Community 71 - "errorHandler.ts"
Cohesion: 0.19
Nodes (13): ApiError, AppError, errorHandler(), handleCastErrorDB(), handleDuplicateFieldsDB(), handleJWTError(), handleJWTExpiredError(), handleValidationErrorDB() (+5 more)

### Community 73 - "otp.ts"
Cohesion: 0.11
Nodes (15): CreateOTPData, OTPFilter, VerifyOTPData, base32Decode(), generateOTP(), generateTOTP(), hashOTP(), OTPConfig (+7 more)

### Community 74 - "PublicationRepository"
Cohesion: 0.17
Nodes (7): IPublication, Publication, publicationSchema, PublicationStatus, PublicationFilter, PublicationRepository, PublicationService

### Community 76 - "PublisherRepository"
Cohesion: 0.16
Nodes (7): IPublisher, IPublisherModel, Publisher, publisherSchema, PublisherFilter, PublisherRepository, PublisherService

### Community 77 - "NoteService"
Cohesion: 0.13
Nodes (4): INote, Note, noteSchema, NoteService

### Community 78 - "validation.ts"
Cohesion: 0.14
Nodes (13): authSchemas, fileSchemas, InferSchema, otpSchemas, responseSchemas, sanitize(), sanitizeInput(), sanitizeObject() (+5 more)

### Community 80 - "TwoFactorService.ts"
Cohesion: 0.13
Nodes (7): TwoFactorService, TwoFactorSetupData, TwoFactorVerifyData, base32Encode(), generateBackupCodes(), generateQRCodeURL(), generateTOTPSecret()

### Community 82 - ".badRequest"
Cohesion: 0.11
Nodes (3): EditorialController, requireParam(), requireUserId()

### Community 83 - "BookmarkRepository"
Cohesion: 0.06
Nodes (20): createPaymentProvider(), NamedDummyPaymentProvider, PaymentProvider, PaymentProviderCreateResult, PaymentProviderRefundResult, PaymentProviderStatusResult, PaymentProviderWebhookResult, IWebhookLog (+12 more)

### Community 84 - "NoteRepository"
Cohesion: 0.13
Nodes (9): CommerceLineItem, OrderStatus, CommerceOrder, historySchema, ICommerceOrder, ICommerceOrderModel, lineItemSchema, orderSchema (+1 more)

### Community 85 - "MagazineIssueController"
Cohesion: 0.12
Nodes (12): CommerceAuditTrailEntry, PaymentStatus, attemptSchema, auditSchema, CommercePayment, ICommercePayment, IPaymentAttempt, paymentSchema (+4 more)

### Community 86 - "validate.ts"
Cohesion: 0.53
Nodes (4): router, historyQuerySchema, paramIdSchema, recordReadingSchema

### Community 89 - "ReadingProgressController"
Cohesion: 0.09
Nodes (6): SystemController, ISetting, Setting, SettingSchema, SettingRepository, SystemService

### Community 91 - "index.ts"
Cohesion: 0.22
Nodes (8): RecommendationController, authenticate(), optionalAuth(), refreshTokenAuth(), User, router, router, router

### Community 92 - "profile.ts"
Cohesion: 0.33
Nodes (9): router, changeSubscriptionSchema, updateAvatarSchema, updateBioSchema, updateLanguageSchema, updatePreferencesSchema, updateProfileSchema, updateSocialLinksSchema (+1 more)

### Community 95 - "GenreController"
Cohesion: 0.08
Nodes (20): GenreController, SeriesController, protect, router, createAuthorSchema, createBookSchema, createCollectionSchema, createGenreSchema (+12 more)

### Community 96 - "NotificationController"
Cohesion: 0.18
Nodes (10): adminMiddleware(), router, router, router, router, router, router, webhookSchema (+2 more)

### Community 98 - "publisherService.ts"
Cohesion: 0.25
Nodes (5): ICommerceSubscription, SubscriptionService, toId(), appendHistory(), mapBillingCycleToUserTier()

### Community 99 - "DashboardController"
Cohesion: 0.27
Nodes (8): AccessDecision, CouponType, CreateOrderItemInput, CreatePaymentInput, PlanBillingCycle, SubscriptionActionInput, calculateLineItemTotal(), calculateOrderTotals()

### Community 104 - "Highlight.ts"
Cohesion: 0.21
Nodes (6): EditorialComment, editorialCommentSchema, EditorialCommentStatus, IEditorialComment, IEditorialCommentModel, EditorialCommentRepository

### Community 106 - "ReadingHistory.ts"
Cohesion: 0.09
Nodes (14): Bookmark, bookmarkSchema, IBookmarkModel, CommerceCoupon, couponSchema, ICommerceCouponModel, ICategory, ITag (+6 more)

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
Nodes (29): router, router, router, router, router, router, router, articleBase (+21 more)

### Community 113 - "Bookmark.ts"
Cohesion: 0.12
Nodes (19): jwtConfig, DecodedToken, decodeToken(), DEFAULT_ACCESS_OPTIONS, DEFAULT_REFRESH_OPTIONS, DEFAULT_VERIFY_OPTIONS, generateAccessToken(), generateRefreshToken() (+11 more)

### Community 114 - "INotificationModel"
Cohesion: 0.21
Nodes (12): StoragePath, storagePathSchema, StorageStatus, StorageType, SearchFilter, StoragePathFilter, FileChangeEvent, WatcherConfig (+4 more)

### Community 115 - "publicationService.ts"
Cohesion: 0.14
Nodes (6): IPlan, IPlanModel, Plan, planSchema, PlanRepository, PlanService

### Community 116 - "bookmarks.ts"
Cohesion: 0.48
Nodes (5): router, bookmarkQuerySchema, createBookmarkSchema, paramIdSchema, updateBookmarkSchema

### Community 117 - "notifications.ts"
Cohesion: 0.38
Nodes (5): router, markAsReadSchema, notificationIdSchema, notificationQuerySchema, notificationTypeSchema

### Community 118 - "progress.ts"
Cohesion: 0.36
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

### Community 124 - "bcryptjs"
Cohesion: 0.18
Nodes (4): Highlight, highlightSchema, IHighlight, HighlightRepository

### Community 143 - "@services/*"
Cohesion: 0.13
Nodes (17): authorize(), validate(), validateBody(), validateParams(), validateQuery(), router, router, router (+9 more)

### Community 144 - "@tests/*"
Cohesion: 0.24
Nodes (20): storageConfig, createStorageProvider(), resetStorageProvider(), ChecksumOptions, CopyOptions, DeleteOptions, ExistsOptions, ListOptions (+12 more)

### Community 146 - "MediaController"
Cohesion: 0.22
Nodes (3): MediaController, requireParam(), requireUserId()

### Community 148 - "ArticleVersionRepository.ts"
Cohesion: 0.16
Nodes (9): ArticleVersion, articleVersionSchema, IArticleVersion, IArticleVersionModel, ArticleVersionRepository, ArticleInput, mockArticleRepository, mockArticleVersionRepository (+1 more)

### Community 149 - "recommendationService.test.ts"
Cohesion: 0.16
Nodes (10): RecommendationService, RecommendedContent, TrendingRecommendations, mockArticleRepository, mockBookRepository, mockMagazineIssueRepository, mockPublicationRepository, mockReadingHistoryRepository (+2 more)

### Community 150 - "MagazineIssueRepository.ts"
Cohesion: 0.18
Nodes (7): Article, articleSchema, ArticleStatus, ICategory, IMedia, ITag, IUser

### Community 151 - "StorageFolder"
Cohesion: 0.07
Nodes (11): ArticleFilter, BaseRepository, CategoryFilter, CommerceCouponRepository, CommerceOrderRepository, CommerceSubscriptionRepository, NewsletterFilter, OTPData (+3 more)

### Community 152 - "commentController.ts"
Cohesion: 0.18
Nodes (4): CommentController, requireParam(), requireUserId(), CommentService

### Community 157 - "ReadingProgressRepository"
Cohesion: 0.24
Nodes (5): handleMulterError(), storage, upload, uploadSingle(), router

### Community 181 - "CommerceSubscription.ts"
Cohesion: 0.25
Nodes (5): SubscriptionStatus, CommerceSubscription, historySchema, ICommerceSubscriptionModel, subscriptionSchema

### Community 183 - "ReadingHistoryRepository"
Cohesion: 0.11
Nodes (12): ReadingHistoryRepository, mockArticleRepository, mockBookRepository, mockCommerceCouponRepository, mockCommerceInvoiceRepository, mockCommerceOrderRepository, mockCommercePaymentRepository, mockCommerceSubscriptionRepository (+4 more)

### Community 184 - "InvoiceService"
Cohesion: 0.22
Nodes (3): ICommerceInvoice, CommerceInvoiceRepository, InvoiceService

### Community 187 - "subscriptionService.test.ts"
Cohesion: 0.50
Nodes (3): mockPlanRepository, mockSubscriptionRepository, mockUserRepository

## Knowledge Gaps
- **319 isolated node(s):** `name`, `version`, `description`, `main`, `dev` (+314 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **115 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthRequest` connect `BaseRepository` to `index.ts`, `@utils/*`, `MediaController`, `@types/bcryptjs`, `commentController.ts`, `NoteController`, `TagController`, `AnalyticsController`, `jwt.ts`, `IBookmarkModel`, `eslint-plugin-prettier`, `ReadingHistoryController`, `WebhookController`, `CollectionRepository`, `IUserModel`, `FavoriteRepository`, `IReadingHistory`, `errorHandler.ts`, `NoteService`, `ProfileController`, `.badRequest`, `BookmarkRepository`, `PublicationController`, `index.ts`, `CollectionController`, `GenreController`, `progress.ts`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._
- **Why does `ApiError` connect `errorHandler.ts` to `ArticleRepository`, `TagRepository`, `@services/*`, `adminController.ts`, `ArticleVersionRepository.ts`, `tsx`, `@types/bcryptjs`, `StorageFolder`, `commentController.ts`, `recommendationService.test.ts`, `ReadingProgressRepository`, `AuthService`, `jwt.ts`, `.badRequest`, `BaseRepository`, `.notFound`, `validation.ts`, `password.ts`, `IUserModel`, `InvoiceService`, `accessControlService.ts`, `MagazineIssueRepository`, `NotificationRepository`, `CollectionRepository`, `IUserModel`, `FavoriteRepository`, `AuthorRepository`, `SeriesRepository`, `GenreRepository`, `IReadingHistory`, `otp.ts`, `PublicationRepository`, `PublisherRepository`, `NoteService`, `validation.ts`, `TwoFactorService.ts`, `MagazineIssueController`, `ReadingProgressController`, `index.ts`, `NotificationController`, `publisherService.ts`, `DashboardController`, `HighlightController`, `Bookmark.ts`, `INotificationModel`, `publicationService.ts`, `progress.ts`, `CategoryService.ts`, `bcryptjs`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Why does `StorageProvider` connect `SeriesController` to `ArticleRepository`, `PublisherController`, `nodemailer`, `swagger-ui-express`, `winston`, `publishing.ts`, `errorHandler.ts`, `@jobs/*`, `@tests/*`, `CategoryService`, `INotificationModel`, `SearchController`, `dotenv`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _319 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.046948356807511735 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `paths` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._