// Centralized query key factories for consistent cache management

export const queryKeys = {
  // Articles
  articles: {
    all: ["articles"] as const,
    lists: () => [...queryKeys.articles.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.articles.lists(), params] as const,
    details: () => [...queryKeys.articles.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.articles.details(), id] as const,
    slug: (slug: string) => [...queryKeys.articles.all, "slug", slug] as const,
    featured: () => [...queryKeys.articles.all, "featured"] as const,
    latest: (params?: Record<string, unknown>) =>
      [...queryKeys.articles.all, "latest", params] as const,
    trending: (params?: Record<string, unknown>) =>
      [...queryKeys.articles.all, "trending", params] as const,
    popular: (params?: Record<string, unknown>) =>
      [...queryKeys.articles.all, "popular", params] as const,
    topStories: () => [...queryKeys.articles.all, "top-stories"] as const,
  },

  // Books
  books: {
    all: ["books"] as const,
    lists: () => [...queryKeys.books.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.books.lists(), params] as const,
    details: () => [...queryKeys.books.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.books.details(), id] as const,
    slug: (slug: string) => [...queryKeys.books.all, "slug", slug] as const,
    chapters: (bookId: string) => [...queryKeys.books.all, bookId, "chapters"] as const,
    featured: () => [...queryKeys.books.all, "featured"] as const,
    latest: (params?: Record<string, unknown>) =>
      [...queryKeys.books.all, "latest", params] as const,
    trending: (params?: Record<string, unknown>) =>
      [...queryKeys.books.all, "trending", params] as const,
    popular: (params?: Record<string, unknown>) =>
      [...queryKeys.books.all, "popular", params] as const,
    recommended: () => [...queryKeys.books.all, "recommended"] as const,
  },

  // Publications & Issues
  publications: {
    all: ["publications"] as const,
    lists: () => [...queryKeys.publications.all, "list"] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.publications.lists(), params] as const,
    detail: (id: string) => [...queryKeys.publications.all, "detail", id] as const,
    slug: (slug: string) => [...queryKeys.publications.all, "slug", slug] as const,
  },
  issues: {
    all: ["issues"] as const,
    lists: () => [...queryKeys.issues.all, "list"] as const,
    list: (pubId: string, params?: Record<string, unknown>) =>
      [...queryKeys.issues.lists(), pubId, params] as const,
    detail: (pubId: string, issueId: string) =>
      [...queryKeys.issues.all, "detail", pubId, issueId] as const,
    slug: (pubId: string, slug: string) => [...queryKeys.issues.all, "slug", pubId, slug] as const,
  },

  // Categories
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.categories.lists(), params] as const,
    detail: (id: string) => [...queryKeys.categories.all, "detail", id] as const,
    slug: (slug: string) => [...queryKeys.categories.all, "slug", slug] as const,
  },

  // Tags
  tags: {
    all: ["tags"] as const,
    lists: () => [...queryKeys.tags.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.tags.lists(), params] as const,
    detail: (id: string) => [...queryKeys.tags.all, "detail", id] as const,
    slug: (slug: string) => [...queryKeys.tags.all, "slug", slug] as const,
  },

  // Authors
  authors: {
    all: ["authors"] as const,
    lists: () => [...queryKeys.authors.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.authors.lists(), params] as const,
    detail: (id: string) => [...queryKeys.authors.all, "detail", id] as const,
    slug: (slug: string) => [...queryKeys.authors.all, "slug", slug] as const,
  },

  // Publishers
  publishers: {
    all: ["publishers"] as const,
    lists: () => [...queryKeys.publishers.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.publishers.lists(), params] as const,
    detail: (id: string) => [...queryKeys.publishers.all, "detail", id] as const,
    slug: (slug: string) => [...queryKeys.publishers.all, "slug", slug] as const,
  },

  // Genres
  genres: {
    all: ["genres"] as const,
    lists: () => [...queryKeys.genres.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.genres.lists(), params] as const,
    detail: (id: string) => [...queryKeys.genres.all, "detail", id] as const,
    slug: (slug: string) => [...queryKeys.genres.all, "slug", slug] as const,
  },

  // Series
  series: {
    all: ["series"] as const,
    lists: () => [...queryKeys.series.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.series.lists(), params] as const,
    detail: (id: string) => [...queryKeys.series.all, "detail", id] as const,
    slug: (slug: string) => [...queryKeys.series.all, "slug", slug] as const,
  },

  // Collections
  collections: {
    all: ["collections"] as const,
    lists: () => [...queryKeys.collections.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.collections.lists(), params] as const,
    detail: (id: string) => [...queryKeys.collections.all, "detail", id] as const,
    slug: (slug: string) => [...queryKeys.collections.all, "slug", slug] as const,
  },

  // Search
  search: {
    all: ["search"] as const,
    global: (query: string, params?: Record<string, unknown>) =>
      [...queryKeys.search.all, "global", query, params] as const,
    suggestions: (query: string) => [...queryKeys.search.all, "suggestions", query] as const,
  },

  // User interactions
  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    notifications: (params?: Record<string, unknown>) =>
      [...queryKeys.user.all, "notifications", params] as const,
    bookmarks: (params?: Record<string, unknown>) =>
      [...queryKeys.user.all, "bookmarks", params] as const,
    favorites: (params?: Record<string, unknown>) =>
      [...queryKeys.user.all, "favorites", params] as const,
    notes: (params?: Record<string, unknown>) => [...queryKeys.user.all, "notes", params] as const,
    readingHistory: (params?: Record<string, unknown>) =>
      [...queryKeys.user.all, "reading-history", params] as const,
    continueReading: () => [...queryKeys.user.all, "continue-reading"] as const,
    addresses: () => [...queryKeys.user.all, "addresses"] as const,
    preferences: () => [...queryKeys.user.all, "preferences"] as const,
    sessions: () => [...queryKeys.user.all, "sessions"] as const,
    searchHistory: () => [...queryKeys.user.all, "search-history"] as const,
  },

  // Orders
  orders: {
    all: ["orders"] as const,
    lists: () => [...queryKeys.orders.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.orders.lists(), params] as const,
    detail: (id: string) => [...queryKeys.orders.all, "detail", id] as const,
  },

  // Subscriptions
  subscriptions: {
    all: ["subscriptions"] as const,
    plans: () => [...queryKeys.subscriptions.all, "plans"] as const,
    current: () => [...queryKeys.subscriptions.all, "current"] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.subscriptions.all, "list", params] as const,
    paymentMethods: () => [...queryKeys.subscriptions.all, "payment-methods"] as const,
    invoices: (params?: Record<string, unknown>) =>
      [...queryKeys.subscriptions.all, "invoices", params] as const,
  },

  // Coupons
  coupons: {
    all: ["coupons"] as const,
    lists: () => [...queryKeys.coupons.all, "list"] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.coupons.lists(), params] as const,
  },

  // Admin
  admin: {
    all: ["admin"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    users: (params?: Record<string, unknown>) => [...queryKeys.admin.all, "users", params] as const,
    userDetail: (id: string) => [...queryKeys.admin.all, "users", "detail", id] as const,
    payments: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "payments", params] as const,
    comments: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "comments", params] as const,
    staff: (params?: Record<string, unknown>) => [...queryKeys.admin.all, "staff", params] as const,
    roles: () => [...queryKeys.admin.all, "roles"] as const,
    workspace: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "workspace", params] as const,
    auditLog: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "audit-log", params] as const,
    revenueAnalytics: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "revenue", params] as const,
    userAnalytics: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "users", params] as const,
    contentAnalytics: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "content", params] as const,
    systemHealth: () => [...queryKeys.admin.all, "health"] as const,
    subscriptionMetrics: () => [...queryKeys.admin.all, "subscriptions"] as const,
    transactions: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "transactions", params] as const,
    revenueTrend: (params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "revenue-trend", params] as const,
    planBreakdown: () => [...queryKeys.admin.all, "plan-breakdown"] as const,
    publishingAnalytics: () => [...queryKeys.admin.all, "publishing"] as const,
    readingAnalytics: () => [...queryKeys.admin.all, "reading"] as const,
    recommendationsAnalytics: () => [...queryKeys.admin.all, "recommendations-analytics"] as const,
    executiveAnalytics: () => [...queryKeys.admin.all, "executive-analytics"] as const,
    settings: (category: string) => [...queryKeys.admin.all, "settings", category] as const,
    generic: (entity: string, params?: Record<string, unknown>) =>
      [...queryKeys.admin.all, "generic", entity, params] as const,
    reportPreview: (params: any) => [...queryKeys.admin.all, "report-preview", params] as const,
  },
};
