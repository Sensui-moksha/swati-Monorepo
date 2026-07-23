# Mock Data to API Migration Plan

## Overview
Migrate 50+ route files from static mock data imports to dynamic API calls using TanStack Query hooks.

## Mock Data Inventory (3 files, 50+ exports)

### `/src/lib/mock-data.ts` (12 exports + 3 formatters)
| Export | Type | Used In Routes | API Endpoint | Query Hook |
|--------|------|----------------|--------------|------------|
| `ARTICLES` | Article[] | articles.index, articles.$slug, admin.articles | `articlesApi.list()` | `useArticles` |
| `CATEGORIES` | Category[] | categories.index, categories.$slug, admin.categories | `categoriesApi.list()` | `useCategories` |
| `FEATURED` | Article[] | discover.index, dashboard.index | `articlesApi.getFeatured()` | `useFeaturedArticles` |
| `TOP_STORIES` | Article[] | discover.trending, dashboard.trending | `articlesApi.getTopStories()` | `useTopStories` |
| `LATEST` | Article[] | discover.latest, dashboard.latest | `articlesApi.getLatest()` | `useLatestArticles` |
| `TRENDING` | Article[] | discover.trending, dashboard.trending | `articlesApi.getTrending()` | `useTrendingArticles` |
| `TESTIMONIALS` | Testimonial[] | landing, about | N/A (static content) | N/A |
| `PLANS` | SubscriptionPlan[] | subscription.plans, admin.subscriptions | `subscriptionsApi.getPlans()` | `useSubscriptionPlans` |
| `ADMIN_STATS` | AdminStats | admin.index, admin.analytics | `adminApi.getStats()` | `useAdminStats` |
| `ADMIN_USERS` | User[] | admin.users.index, admin.users.$id | `usersApi.list()` | `useAdminUsers` |
| `ADMIN_PAYMENTS` | Payment[] | admin.payments | `ordersApi.getPayments()` | `useAdminPayments` |
| `ADMIN_COMMENTS` | Comment[] | admin.comments | `commentsApi.list()` | `useAdminComments` |
| `formatDate` | function | publications.index, many routes | N/A (utility) | N/A |
| `formatShortDate` | function | publications.index, many routes | N/A (utility) | N/A |
| `formatINR` | function | checkout, subscription, admin | N/A (utility) | N/A |

### `/src/lib/mock-books.ts` (3 exports)
| Export | Type | Used In Routes | API Endpoint | Query Hook |
|--------|------|----------------|--------------|------------|
| `BOOKS` | Book[] | library.index, library.book.$slug, reader.$bookId, admin.books | `booksApi.list()` | `useBooks` |
| `bookBySlug(slug)` | Book | library.book.$slug, reader.$bookId | `booksApi.getBySlug(slug)` | `useBookBySlug` |
| `bookById(id)` | Book | reader.$bookId, admin.books.$id | `booksApi.getById(id)` | `useBookById` |

### `/src/lib/mock-extended.ts` (18 exports)
| Export | Type | Used In Routes | API Endpoint | Query Hook |
|--------|------|----------------|--------------|------------|
| `ISSUES` | Issue[] | publications.index, publications.weekly, publications.monthly, publications.special, publications.digital, publications.archive, publications.$slug | `publicationsApi.listIssues()` | `useIssues` |
| `AUTHORS` | Author[] | authors.index, authors.$slug, admin.authors | `authorsApi.list()` | `useAuthors` |
| `PUBLISHERS` | Publisher[] | publishers.index, publishers.$slug, admin.publishers | `publishersApi.list()` | `usePublishers` |
| `ORDERS` | Order[] | account.orders, account.orders.$id, admin.orders | `ordersApi.list()` | `useOrders` |
| `NOTIFICATIONS` | Notification[] | account.notifications, dashboard.notifications | `usersApi.getNotifications()` | `useNotifications` |
| `READING_HISTORY` | ReadingHistory[] | account.history, library.continue | `readingHistoryApi.list()` | `useReadingHistory` |
| `BOOKMARKS` | Bookmark[] | account.bookmarks, library.bookmarks | `bookmarksApi.list()` | `useBookmarks` |
| `FAVORITES` | Favorite[] | account.favorites, library.favorites | `favoritesApi.list()` | `useFavorites` |
| `NOTES` | Note[] | account.notes, reader.$bookId | `notesApi.list()` | `useNotes` |
| `COLLECTIONS` | Collection[] | collections.index, collections.$slug, library.collections | `collectionsApi.list()` | `useCollections` |
| `GENRES` | Genre[] | genres.index, genres.$slug, admin.genres | `genresApi.list()` | `useGenres` |
| `SERIES` | Series[] | series.index, series.$slug, admin.series | `seriesApi.list()` | `useSeries` |
| `TAGS` | Tag[] | tags.index, tags.$slug, admin.tags | `tagsApi.list()` | `useTags` |
| `COUPONS` | Coupon[] | checkout.payment, subscription.checkout, admin.coupons | `couponsApi.list()` | `useCoupons` |
| `STAFF` | Staff[] | admin.staff | `usersApi.getStaff()` | `useStaff` |
| `ROLES` | Role[] | admin.roles | `usersApi.getRoles()` | `useRoles` |
| `AUDIT_LOG` | AuditLog[] | admin.audit | `adminApi.getAuditLog()` | `useAuditLog` |
| `REVENUE_TREND` | RevenuePoint[] | admin.analytics, admin.bi.revenue | `adminApi.getRevenueTrend()` | `useRevenueTrend` |
| `PLAN_BREAKDOWN` | PlanBreakdown[] | admin.bi.subscriptions | `adminApi.getPlanBreakdown()` | `usePlanBreakdown` |

## Route Migration Priority Order

### Phase 1: Publications (7 routes) - HIGH PRIORITY
Uses: `ISSUES` from mock-extended, `formatShortDate` from mock-data
| Route | Mock Imports | API Endpoints | Query Hooks Needed |
|-------|--------------|---------------|-------------------|
| `publications.index.tsx` | `ISSUES`, `formatShortDate` | `publicationsApi.listIssues()` | `useIssues` |
| `publications.weekly.tsx` | `ISSUES` (filtered) | `publicationsApi.listIssues({ type: 'weekly' })` | `useIssues` |
| `publications.monthly.tsx` | `ISSUES` (filtered) | `publicationsApi.listIssues({ type: 'monthly' })` | `useIssues` |
| `publications.special.tsx` | `ISSUES` (filtered) | `publicationsApi.listIssues({ type: 'special' })` | `useIssues` |
| `publications.digital.tsx` | `ISSUES` (filtered) | `publicationsApi.listIssues({ type: 'digital' })` | `useIssues` |
| `publications.archive.tsx` | `ISSUES` (filtered) | `publicationsApi.listIssues({ status: 'archived' })` | `useIssues` |
| `publications.$slug.tsx` | `ISSUES` (find by slug) | `publicationsApi.getIssueBySlug(slug)` | `useIssueBySlug` |

### Phase 2: Books & Reader (2 routes) - HIGH PRIORITY
Uses: `BOOKS`, `bookBySlug`, `bookById` from mock-books
| Route | Mock Imports | API Endpoints | Query Hooks Needed |
|-------|--------------|---------------|-------------------|
| `reader.$bookId.tsx` | `bookById`, `BOOKS` | `booksApi.getById(id)`, `booksApi.getChapters(id)` | `useBookById`, `useBookChapters` |
| `library.book.$slug.tsx` | `bookBySlug`, `BOOKS` | `booksApi.getBySlug(slug)` | `useBookBySlug` |

### Phase 3: Series & Publishers (4 routes) - MEDIUM PRIORITY
| Route | Mock Imports | API Endpoints | Query Hooks Needed |
|-------|--------------|---------------|-------------------|
| `series.index.tsx` | `SERIES` | `seriesApi.list()` | `useSeries` |
| `series.$slug.tsx` | `SERIES` (find by slug) | `seriesApi.getBySlug(slug)` | `useSeriesBySlug` |
| `publishers.index.tsx` | `PUBLISHERS` | `publishersApi.list()` | `usePublishers` |
| `publishers.$slug.tsx` | `PUBLISHERS` (find by slug) | `publishersApi.getBySlug(slug)` | `usePublisherBySlug` |

### Phase 4: Search & Trending (2 routes) - MEDIUM PRIORITY
| Route | Mock Imports | API Endpoints | Query Hooks Needed |
|-------|--------------|---------------|-------------------|
| `search.tsx` | `ARTICLES`, `BOOKS`, `ISSUES` | `searchApi.globalSearch(query)` | `useGlobalSearch` |
| `trending.tsx` | `TRENDING`, `TOP_STORIES` | `articlesApi.getTrending()`, `articlesApi.getTopStories()` | `useTrendingArticles`, `useTopStories` |

### Phase 5: Admin Routes (20+ routes) - HIGH PRIORITY (complex)
Uses: `ADMIN_STATS`, `ADMIN_USERS`, `ADMIN_PAYMENTS`, `ADMIN_COMMENTS`, `STAFF`, `ROLES`, `AUDIT_LOG`, `REVENUE_TREND`, `PLAN_BREAKDOWN`, `BOOKS`, `ARTICLES`, `ISSUES`, `PUBLISHERS`, `AUTHORS`, `SERIES`, `GENRES`, `TAGS`, `COUPONS`, `ORDERS`
| Route Group | Mock Imports | Key Query Hooks Needed |
|-------------|--------------|------------------------|
| `admin.index` | `ADMIN_STATS` | `useAdminStats` |
| `admin.analytics` | `ADMIN_STATS`, `REVENUE_TREND` | `useAdminStats`, `useRevenueTrend` |
| `admin.articles` | `ARTICLES` | `useArticles` (with admin params) |
| `admin.books` | `BOOKS` | `useBooks` (with admin params) |
| `admin.publications` | `ISSUES` | `useIssues` (with admin params) |
| `admin.users` | `ADMIN_USERS` | `useAdminUsers` |
| `admin.orders` | `ORDERS`, `ADMIN_PAYMENTS` | `useOrders`, `useAdminPayments` |
| `admin.subscriptions` | `PLANS`, `PLAN_BREAKDOWN` | `useSubscriptionPlans`, `usePlanBreakdown` |
| `admin.categories` | `CATEGORIES` | `useCategories` |
| `admin.authors` | `AUTHORS` | `useAuthors` |
| `admin.publishers` | `PUBLISHERS` | `usePublishers` |
| `admin.series` | `SERIES` | `useSeries` |
| `admin.genres` | `GENRES` | `useGenres` |
| `admin.coupons` | `COUPONS` | `useCoupons` |
| `admin.staff` | `STAFF`, `ROLES` | `useStaff`, `useRoles` |
| `admin.audit` | `AUDIT_LOG` | `useAuditLog` |
| `admin.bi.*` (7 routes) | `REVENUE_TREND`, `PLAN_BREAKDOWN`, `ADMIN_STATS` | `useRevenueTrend`, `usePlanBreakdown`, `useAdminStats` |

### Phase 6: Account Routes (10+ routes) - MEDIUM PRIORITY
| Route | Mock Imports | API Endpoints | Query Hooks Needed |
|-------|--------------|---------------|-------------------|
| `account.orders` | `ORDERS` | `ordersApi.list()` | `useOrders` |
| `account.orders.$id` | `ORDERS` (find by id) | `ordersApi.getById(id)` | `useOrderById` |
| `account.subscription` | `PLANS` (current) | `subscriptionsApi.getCurrent()` | `useCurrentSubscription` |
| `account.bookmarks` | `BOOKMARKS` | `bookmarksApi.list()` | `useBookmarks` |
| `account.favorites` | `FAVORITES` | `favoritesApi.list()` | `useFavorites` |
| `account.history` | `READING_HISTORY` | `readingHistoryApi.list()` | `useReadingHistory` |
| `account.notes` | `NOTES` | `notesApi.list()` | `useNotes` |
| `account.notifications` | `NOTIFICATIONS` | `usersApi.getNotifications()` | `useNotifications` |
| `account.addresses` | N/A (new) | `usersApi.getAddresses()` | `useAddresses` |
| `account.payment-methods` | N/A (new) | `subscriptionsApi.getPaymentMethods()` | `usePaymentMethods` |
| `account.preferences` | N/A (new) | `usersApi.getPreferences()` | `usePreferences` |
| `account.security` | N/A (new) | `authApi.getSessions()` | `useSessions` |

### Phase 7: Library Routes (8+ routes) - MEDIUM PRIORITY
| Route | Mock Imports | API Endpoints | Query Hooks Needed |
|-------|--------------|---------------|-------------------|
| `library.index` | `BOOKS` | `booksApi.list({ userLibrary: true })` | `useLibraryBooks` |
| `library.bookmarks` | `BOOKMARKS` | `bookmarksApi.list()` | `useBookmarks` |
| `library.favorites` | `FAVORITES` | `favoritesApi.list()` | `useFavorites` |
| `library.history` | `READING_HISTORY` | `readingHistoryApi.list()` | `useReadingHistory` |
| `library.continue` | `READING_HISTORY` (recent) | `readingHistoryApi.getRecent()` | `useContinueReading` |
| `library.recommended` | `BOOKS` (filtered) | `booksApi.getRecommended()` | `useRecommendedBooks` |
| `library.trending` | `TRENDING` | `booksApi.getTrending()` | `useTrendingBooks` |
| `library.collections` | `COLLECTIONS` | `collectionsApi.list()` | `useCollections` |

### Phase 8: Dashboard Routes (5+ routes) - MEDIUM PRIORITY
| Route | Mock Imports | API Endpoints | Query Hooks Needed |
|-------|--------------|---------------|-------------------|
| `dashboard.index` | `FEATURED`, `LATEST`, `TRENDING` | `articlesApi.getFeatured()`, `articlesApi.getLatest()`, `articlesApi.getTrending()` | `useFeaturedArticles`, `useLatestArticles`, `useTrendingArticles` |
| `dashboard.activity` | `READING_HISTORY` | `readingHistoryApi.list()` | `useReadingHistory` |
| `dashboard.continue` | `READING_HISTORY` (recent) | `readingHistoryApi.getRecent()` | `useContinueReading` |
| `dashboard.recommended` | `BOOKS` (filtered) | `booksApi.getRecommended()` | `useRecommendedBooks` |
| `dashboard.trending` | `TRENDING`, `TOP_STORIES` | `articlesApi.getTrending()`, `articlesApi.getTopStories()` | `useTrendingArticles`, `useTopStories` |
| `dashboard.stats` | `ADMIN_STATS` (user-specific) | `usersApi.getStats()` | `useUserStats` |

### Phase 9: Discover Routes (6+ routes) - LOWER PRIORITY
| Route | Mock Imports | API Endpoints | Query Hooks Needed |
|-------|--------------|---------------|-------------------|
| `discover.index` | `FEATURED`, `LATEST`, `TRENDING`, `CATEGORIES` | Multiple | Multiple hooks |
| `discover.filters` | `CATEGORIES`, `GENRES`, `AUTHORS`, `PUBLISHERS`, `SERIES` | Multiple list endpoints | Multiple hooks |
| `discover.history` | `READING_HISTORY` | `readingHistoryApi.list()` | `useReadingHistory` |
| `discover.recommendations` | `BOOKS` (filtered) | `booksApi.getRecommended()` | `useRecommendedBooks` |
| `discover.saved-searches` | N/A (new) | `searchApi.getSavedSearches()` | `useSavedSearches` |
| `discover.trending` | `TRENDING`, `TOP_STORIES` | `articlesApi.getTrending()`, `articlesApi.getTopStories()` | `useTrendingArticles`, `useTopStories` |

### Phase 10: Articles, Authors, Categories, Collections, Genres (10 routes) - LOWER PRIORITY
| Route Group | Mock Imports | Key Query Hooks Needed |
|-------------|--------------|------------------------|
| `articles.index` | `ARTICLES` | `useArticles` |
| `articles.$slug` | `ARTICLES` (find by slug) | `useArticleBySlug` |
| `authors.index` | `AUTHORS` | `useAuthors` |
| `authors.$slug` | `AUTHORS` (find by slug) | `useAuthorBySlug` |
| `categories.index` | `CATEGORIES` | `useCategories` |
| `categories.$slug` | `CATEGORIES` (find by slug) | `useCategoryBySlug` |
| `collections.index` | `COLLECTIONS` | `useCollections` |
| `collections.$slug` | `COLLECTIONS` (find by slug) | `useCollectionBySlug` |
| `genres.index` | `GENRES` | `useGenres` |
| `genres.$slug` | `GENRES` (find by slug) | `useGenreBySlug` |

### Phase 11: Checkout & Subscription (8 routes) - LOWER PRIORITY
| Route | Mock Imports | API Endpoints | Query Hooks Needed |
|-------|--------------|---------------|-------------------|
| `checkout.address` | N/A | `ordersApi.create()` | `useCreateOrder` |
| `checkout.payment` | `COUPONS` | `couponsApi.validate()`, `ordersApi.create()` | `useValidateCoupon`, `useCreateOrder` |
| `checkout.review` | `ORDERS` (pending) | `ordersApi.getPending()` | `usePendingOrder` |
| `checkout.success` | `ORDERS` (created) | `ordersApi.getById(id)` | `useOrderById` |
| `subscription.plans` | `PLANS` | `subscriptionsApi.getPlans()` | `useSubscriptionPlans` |
| `subscription.checkout` | `PLANS` (selected) | `subscriptionsApi.create()` | `useCreateSubscription` |
| `subscription.manage` | `PLANS` (current) | `subscriptionsApi.getCurrent()` | `useCurrentSubscription` |
| `subscription.success` | N/A | N/A | N/A |

### Phase 12: Auth Routes (6 routes) - LOW PRIORITY (mostly forms)
| Route | Mock Imports | API Endpoints | Query Hooks Needed |
|-------|--------------|---------------|-------------------|
| `auth.login` | N/A | `authApi.login()` | `useLogin` (mutation) |
| `auth.register` | N/A | `authApi.register()` | `useRegister` (mutation) |
| `auth.forgot-password` | N/A | `authApi.forgotPassword()` | `useForgotPassword` (mutation) |
| `auth.reset-password` | N/A | `authApi.resetPassword()` | `useResetPassword` (mutation) |
| `auth.verify-email` | N/A | `authApi.verifyEmail()` | `useVerifyEmail` (mutation) |
| `auth.verify-otp` | N/A | `authApi.verify2FA()` | `useVerify2FA` (mutation) |

## Query Hooks Implementation Plan

### Core Query Hooks to Create in `src/lib/api/hooks.ts`

#### Auth Hooks (mutations)
- `useLogin()` - mutation
- `useRegister()` - mutation
- `useLogout()` - mutation
- `useRefreshToken()` - mutation
- `useForgotPassword()` - mutation
- `useResetPassword()` - mutation
- `useChangePassword()` - mutation
- `useVerifyEmail()` - mutation
- `useSetup2FA()` - query + mutation
- `useVerify2FA()` - mutation
- `useDisable2FA()` - mutation
- `useSessions()` - query
- `useRevokeSession()` - mutation
- `useRevokeAllSessions()` - mutation

#### User Profile Hooks
- `useCurrentUser()` - query (auth/me)
- `useUpdateProfile()` - mutation
- `useUpdateAvatar()` - mutation
- `useDeleteAvatar()` - mutation
- `usePreferences()` - query
- `useUpdatePreferences()` - mutation
- `useNotifications(params?)` - query
- `useMarkNotificationRead()` - mutation
- `useMarkAllNotificationsRead()` - mutation
- `useDeleteNotification()` - mutation
- `useAddresses()` - query
- `useAddAddress()` - mutation
- `useUpdateAddress()` - mutation
- `useDeleteAddress()` - mutation

#### Articles Hooks
- `useArticles(params?)` - query (list with pagination, filters)
- `useArticleById(id)` - query
- `useArticleBySlug(slug)` - query
- `useFeaturedArticles()` - query
- `useLatestArticles()` - query
- `useTrendingArticles()` - query
- `useTopStories()` - query
- `useCreateArticle()` - mutation
- `useUpdateArticle()` - mutation
- `useDeleteArticle()` - mutation
- `useArticleCategories()` - query
- `useArticleTags()` - query

#### Books Hooks
- `useBooks(params?)` - query (list with pagination, filters)
- `useBookById(id)` - query
- `useBookBySlug(slug)` - query
- `useBookChapters(bookId)` - query
- `useChapterById(chapterId)` - query
- `useRecommendedBooks()` - query
- `useTrendingBooks()` - query
- `useLibraryBooks(params?)` - query
- `useCreateBook()` - mutation
- `useUpdateBook()` - mutation
- `useDeleteBook()` - mutation
- `useBookCategories()` - query (genres)
- `useBookAuthors()` - query
- `useBookPublishers()` - query
- `useBookSeries()` - query

#### Publications Hooks
- `usePublications(params?)` - query
- `usePublicationById(id)` - query
- `usePublicationBySlug(slug)` - query
- `useIssues(params?)` - query
- `useIssueById(id)` - query
- `useIssueBySlug(slug)` - query
- `useIssueArticles(issueId)` - query
- `useCreatePublication()` - mutation
- `useUpdatePublication()` - mutation
- `useDeletePublication()` - mutation
- `useCreateIssue()` - mutation
- `useUpdateIssue()` - mutation
- `useDeleteIssue()` - mutation

#### Search Hooks
- `useGlobalSearch(query, params?)` - query
- `useSearchSuggestions(query)` - query
- `usePopularSearches()` - query
- `useTrendingSearches()` - query
- `useSearchFilters()` - query
- `useAutocomplete(query)` - query
- `useSavedSearches()` - query
- `useSaveSearch()` - mutation
- `useDeleteSavedSearch()` - mutation

#### Subscriptions Hooks
- `useSubscriptionPlans()` - query
- `useCurrentSubscription()` - query
- `useUserSubscriptions()` - query
- `useCreateSubscription()` - mutation
- `useCancelSubscription()` - mutation
- `usePauseSubscription()` - mutation
- `useResumeSubscription()` - mutation
- `useChangePlan()` - mutation
- `usePaymentMethods()` - query
- `useAddPaymentMethod()` - mutation
- `useRemovePaymentMethod()` - mutation
- `useSubscriptionInvoices()` - query
- `useSubscriptionUsage()` - query

#### Users/Admin Hooks
- `useUsers(params?)` - query (admin)
- `useUserById(id)` - query (admin)
- `useCreateUser()` - mutation (admin)
- `useUpdateUser()` - mutation (admin)
- `useDeleteUser()` - mutation (admin)
- `useUserStats()` - query (admin)
- `useExportUsers()` - mutation (admin)
- `useImpersonateUser()` - mutation (admin)
- `useStaff()` - query (admin)
- `useRoles()` - query (admin)
- `useAuditLog(params?)` - query (admin)
- `useAdminStats()` - query (admin)
- `useRevenueTrend(params?)` - query (admin)
- `usePlanBreakdown()` - query (admin)

#### Products Hooks (E-commerce)
- `useProducts(params?)` - query
- `useProductById(id)` - query
- `useProductBySlug(slug)` - query
- `useProductVariants(productId)` - query
- `useProductImages(productId)` - query
- `useProductCategories()` - query
- `useCreateProduct()` - mutation
- `useUpdateProduct()` - mutation
- `useDeleteProduct()` - mutation
- `useProductInventory(productId)` - query
- `useProductStats()` - query (admin)
- `useExportProducts()` - mutation (admin)
- `useImportProducts()` - mutation (admin)

#### Cart Hooks
- `useCart()` - query
- `useAddToCart()` - mutation
- `useUpdateCartItem()` - mutation
- `useRemoveFromCart()` - mutation
- `useClearCart()` - mutation
- `useApplyCoupon()` - mutation
- `useRemoveCoupon()` - mutation
- `useValidateCoupon()` - mutation

#### Orders Hooks
- `useOrders(params?)` - query
- `useOrderById(id)` - query
- `useCreateOrder()` - mutation
- `useCancelOrder()` - mutation
- `useReturnOrder()` - mutation
- `useOrderTracking(orderId)` - query
- `useOrderInvoice(orderId)` - query
- `useOrderStats()` - query (admin)
- `useExportOrders()` - mutation (admin)

#### Categories, Authors, Publishers, Series, Genres, Tags Hooks
- `useCategories(params?)` - query
- `useCategoryById(id)` - query
- `useCategoryBySlug(slug)` - query
- `useAuthors(params?)` - query
- `useAuthorById(id)` - query
- `useAuthorBySlug(slug)` - query
- `usePublishers(params?)` - query
- `usePublisherById(id)` - query
- `usePublisherBySlug(slug)` - query
- `useSeries(params?)` - query
- `useSeriesById(id)` - query
- `useSeriesBySlug(slug)` - query
- `useGenres(params?)` - query
- `useGenreById(id)` - query
- `useGenreBySlug(slug)` - query
- `useTags(params?)` - query
- `useTagById(id)` - query
- `useTagBySlug(slug)` - query

#### Collections Hooks
- `useCollections(params?)` - query
- `useCollectionById(id)` - query
- `useCollectionBySlug(slug)` - query
- `useCreateCollection()` - mutation
- `useUpdateCollection()` - mutation
- `useDeleteCollection()` - mutation

#### User Interactions Hooks
- `useBookmarks(params?)` - query
- `useAddBookmark()` - mutation
- `useRemoveBookmark()` - mutation
- `useFavorites(params?)` - query
- `useAddFavorite()` - mutation
- `useRemoveFavorite()` - mutation
- `useNotes(params?)` - query
- `useCreateNote()` - mutation
- `useUpdateNote()` - mutation
- `useDeleteNote()` - mutation
- `useReadingHistory(params?)` - query
- `useAddReadingHistory()` - mutation
- `useContinueReading()` - query
- `useComments(params?)` - query
- `useCreateComment()` - mutation
- `useUpdateComment()` - mutation
- `useDeleteComment()` - mutation
- `useHighlights(params?)` - query
- `useCreateHighlight()` - mutation
- `useUpdateHighlight()` - mutation
- `useDeleteHighlight()` - mutation

#### Coupons Hooks
- `useCoupons(params?)` - query (admin)
- `useCouponById(id)` - query (admin)
- `useValidateCoupon(code)` - query
- `useCreateCoupon()` - mutation (admin)
- `useUpdateCoupon()` - mutation (admin)
- `useDeleteCoupon()` - mutation (admin)

## Implementation Steps

### Step 1: Create `src/lib/api/hooks.ts` with all query hooks
- Use TanStack Query v5 patterns
- Import types from `./types`
- Import API client from `../client` (the `api` helper object)
- Define query keys as constants
- Create all query hooks and mutations
- Export everything

### Step 2: Create migration utility functions
- Create `src/lib/api/queryKeys.ts` for consistent query key management
- Create `src/lib/api/mutations.ts` for shared mutation helpers

### Step 3: Migrate routes in priority order (Phases 1-12)
For each route:
1. Remove mock data imports
2. Import required query hooks from `src/lib/api/hooks`
3. Replace mock data usage with query hook calls
4. Update component to handle loading/error states
5. Test the route

### Step 4: Clean up mock data files
- After all routes migrated, remove unused mock exports
- Keep only formatters (`formatDate`, `formatShortDate`, `formatINR`) in mock-data.ts
- Remove mock-books.ts and mock-extended.ts entirely

### Step 5: Update components that directly import mock data
- Search for any components importing from mock files
- Migrate them to use query hooks

## Query Key Conventions

```typescript
// Entity lists
['articles', { page, limit, filters }]
['books', { page, limit, filters }]
['issues', { page, limit, filters }]

// Single entities
['articles', id]
['books', id]
['issues', id]

// By slug
['articles', 'slug', slug]
['books', 'slug', slug]
['issues', 'slug', slug]

// Special queries
['articles', 'featured']
['articles', 'trending']
['articles', 'latest']
['books', 'recommended']
['books', 'trending']
['search', 'global', query]
['search', 'suggestions', query]

// User-specific
['user', 'profile']
['user', 'notifications']
['user', 'bookmarks']
['user', 'favorites']
['user', 'reading-history']
['user', 'orders']
['user', 'subscriptions']

// Admin
['admin', 'stats']
['admin', 'users', { page, limit, filters }]
['admin', 'revenue-trend', { period }]
['admin', 'plan-breakdown']
```

## TanStack Query Configuration

```typescript
// Default query options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

## Mutation Patterns

```typescript
// Standard mutation with invalidation
const mutation = useMutation({
  mutationFn: api.articles.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['articles'] });
  },
});

// Optimistic update
const mutation = useMutation({
  mutationFn: api.bookmarks.add,
  onMutate: async (newBookmark) => {
    await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
    const previous = queryClient.getQueryData(['bookmarks']);
    queryClient.setQueryData(['bookmarks'], (old) => [...old, newBookmark]);
    return { previous };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['bookmarks'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
  },
});
```