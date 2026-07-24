// API Types matching backend entities

// Base types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: string;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'editor' | 'author';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerify {
  token: string;
}

export interface Session {
  id: string;
  userAgent: string;
  ip: string;
  lastActive: string;
  current: boolean;
}

// Article types
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  publishedAt?: string;
  scheduledAt?: string;
  authorId: string;
  author?: User;
  categoryId?: string;
  category?: Category;
  tags: Tag[];
  readingTime: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleVersion {
  id: string;
  articleId: string;
  version: number;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  desc?: string;
  color?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

// Book types
export interface Book {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  isbn?: string;
  isbn13?: string;
  publisherId?: string;
  publisher?: Publisher;
  authorId?: string;
  author?: Author;
  genreIds: string[];
  genres?: Genre[];
  seriesId?: string;
  series?: Series;
  seriesNumber?: number;
  pageCount?: number;
  publishedAt?: string;
  language: string;
  format: 'ebook' | 'paperback' | 'hardcover' | 'audiobook';
  price: number;
  salePrice?: number;
  status: 'draft' | 'published' | 'archived';
  chapters?: Chapter[];
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  number: number;
  content: string;
  wordCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  bookCount: number;
  followerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Publisher {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Series {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  type: 'book' | 'magazine' | 'subscription' | 'digital' | 'bundle';
  categoryId: string;
  category?: Category;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  variants?: ProductVariant[];
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  isFeatured?: boolean;
  isDigital?: boolean;
  digitalFileUrl?: string;
  inventoryQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  status: 'draft' | 'published' | 'archived' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  product?: Product;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  inventoryQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  image?: string;
  options?: Record<string, string>;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Publication types
export interface Publication {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  type: 'magazine' | 'journal' | 'newsletter' | 'weekly' | 'monthly' | 'special';
  frequency: string;
  publisherId?: string;
  publisher?: Publisher;
  editorId?: string;
  editor?: User;
  status: 'draft' | 'published' | 'archived';
  issueCount: number;
  subscriberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  publicationId: string;
  publication?: Publication;
  title: string;
  slug: string;
  number: number;
  volume?: number;
  coverImage?: string;
  description?: string;
  publishedAt?: string;
  status: 'draft' | 'published' | 'archived';
  articleIds: string[];
  articles?: Article[];
  createdAt: string;
  updatedAt: string;
}

// User interaction types
export interface Bookmark {
  id: string;
  userId: string;
  resourceType: 'article' | 'book' | 'issue' | 'publication';
  resourceId: string;
  resource?: Article | Book | Issue | Publication;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  resourceType: 'article' | 'book' | 'author' | 'publisher' | 'series' | 'genre';
  resourceId: string;
  resource?: Article | Book | Author | Publisher | Series | Genre;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  user?: User;
  resourceType: 'article' | 'book' | 'issue';
  resourceId: string;
  parentId?: string;
  parent?: Comment;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  isPinned: boolean;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Highlight {
  id: string;
  userId: string;
  resourceType: 'article' | 'book' | 'issue';
  resourceId: string;
  text: string;
  location: string; // JSON string of location data
  color: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  resourceType: 'article' | 'book' | 'issue';
  resourceId: string;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingHistory {
  id: string;
  userId: string;
  resourceType: 'article' | 'book' | 'issue';
  resourceId: string;
  resource?: Article | Book | Issue;
  progress: number; // 0-100
  lastPosition?: string;
  readAt: string;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  resourceType: 'article' | 'book' | 'issue';
  resourceId: string;
  currentPosition: string;
  totalLength: number;
  progressPercent: number;
  lastReadAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  itemCount: number;
  items: CollectionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  resourceType: 'article' | 'book' | 'issue' | 'publication' | 'author' | 'series';
  resourceId: string;
  order: number;
  addedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Order & Payment types
export interface Order {
  id: string;
  userId: string;
  user?: User;
  orderNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  items: OrderItem[];
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  resourceType: 'book' | 'subscription' | 'issue';
  resourceId: string;
  resource?: Book | SubscriptionPlan | Issue;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Address {
  id: string;
  userId: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  provider: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  order?: Order;
  number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  dueDate: string;
  paidAt?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime';
  trialDays?: number;
  features: string[];
  publicationIds: string[];
  publications?: Publication[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  user?: User;
  planId: string;
  plan?: SubscriptionPlan;
  status: 'active' | 'past_due' | 'cancelled' | 'expired' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelledAt?: string;
  paymentMethodId?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  applicablePlans?: string[];
  applicableProducts?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'discount' | 'bogo' | 'free_shipping' | 'bundle';
  value: number;
  conditions?: Record<string, unknown>;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Dashboard & Analytics types
export interface DashboardStats {
  readingStats: {
    totalRead: number;
    totalTime: number;
    currentStreak: number;
    longestStreak: number;
    booksCompleted: number;
    articlesRead: number;
  };
  libraryStats: {
    totalBooks: number;
    totalArticles: number;
    totalPublications: number;
    favoritesCount: number;
    bookmarksCount: number;
  };
  subscriptionStats?: {
    currentPlan?: SubscriptionPlan;
    status: string;
    renewsAt?: string;
  };
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'read' | 'bookmark' | 'favorite' | 'highlight' | 'note' | 'purchase' | 'subscription';
  resourceType: string;
  resourceId: string;
  resourceTitle: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ReadingHeatmap {
  date: string;
  count: number;
  minutes: number;
}

export interface ReadingGoal {
  id: string;
  userId: string;
  type: 'books_per_year' | 'minutes_per_day' | 'articles_per_week';
  target: number;
  current: number;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  id: string;
  userId: string;
  resourceType: 'article' | 'book' | 'publication' | 'author';
  resourceId: string;
  resource?: Article | Book | Publication | Author;
  score: number;
  reason: string;
  createdAt: string;
}

// Search types
export interface SearchResult {
  articles: Article[];
  books: Book[];
  authors: Author[];
  publications: Publication[];
  issues: Issue[];
  total: number;
  query: string;
  took: number;
}

// Media types
export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  folderId?: string;
  folder?: MediaFolder;
  tags: string[];
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  parent?: MediaFolder;
  children?: MediaFolder[];
  assetCount: number;
  createdAt: string;
  updatedAt: string;
}

// Storage types
export interface StorageItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  checksum?: string;
  parentId?: string;
  children?: StorageItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ScanJob {
  id: string;
  type: 'full' | 'incremental' | 'targeted' | 'deep';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  path: string;
  progress: number;
  totalFiles: number;
  processedFiles: number;
  errors: string[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ScanSchedule {
  id: string;
  name: string;
  path: string;
  type: 'full' | 'incremental' | 'targeted' | 'deep';
  cronExpression: string;
  isEnabled: boolean;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSession {
  id: string;
  userId: string;
  user?: AdminUser;
  userAgent: string;
  ip: string;
  lastActive: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers?: number;
  activeUsers?: number;
  verifiedUsers?: number;
  newUsers?: number;
  totalRevenue?: number;
  users?: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  content?: {
    articles: number;
    books: number;
    publications: number;
  };
  commerce?: {
    orders: number;
    revenue: number;
    subscriptions: number;
  };
  engagement?: {
    comments: number;
    bookmarks: number;
    highlights: number;
  };
}

export interface SystemInfo {
  version: string;
  environment: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
  cpu: {
    usage: number;
  };
  disk: {
    used: number;
    total: number;
  };
  database: {
    connected: boolean;
    size: number;
  };
}

export interface SystemSettings {
  key: string;
  value: unknown;
  description?: string;
  isPublic: boolean;
}

// Reports types
export interface RevenueReport {
  period: string;
  totalRevenue: number;
  subscriptionRevenue: number;
  productRevenue: number;
  refundAmount: number;
  netRevenue: number;
  byPeriod: Array<{
    period: string;
    revenue: number;
  }>;
  byProduct: Array<{
    productId: string;
    productName: string;
    revenue: number;
  }>;
}

export interface UsageReport {
  period: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number;
  topContent: Array<{
    id: string;
    title: string;
    type: string;
    views: number;
  }>;
}

// Webhook types
export interface WebhookLog {
  id: string;
  event: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  lastAttemptAt?: string;
  responseStatus?: number;
  responseBody?: string;
  createdAt: string;
}

// Access control types
export interface AccessCheck {
  resource: string;
  action: string;
  allowed: boolean;
  reason?: string;
}

export interface AccessAssertion {
  resource: string;
  action: string;
  context?: Record<string, unknown>;
}