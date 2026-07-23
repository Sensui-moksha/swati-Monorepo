// TanStack Query hooks wrapping the existing API endpoint modules
// Only hooks actually used by routes are included (no speculative hooks)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PaginationParams } from './types';
import { articlesApi } from './endpoints/articles';
import { booksApi } from './endpoints/books';
import { publicationsApi } from './endpoints/publications';
import { ordersApi } from './endpoints/orders';
import { subscriptionsApi } from './endpoints/subscriptions';
import { usersApi } from './endpoints/users';
import { authApi } from './endpoints/auth';
import { queryKeys } from './queryKeys';

// ─── Articles ───────────────────────────────────────────────────────────────

export function useArticles(params?: PaginationParams & { categoryId?: string; tagId?: string; authorId?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.articles.list(params),
    queryFn: () => articlesApi.list(params),
  });
}

export function useArticleBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.articles.slug(slug),
    queryFn: () => articlesApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useFeaturedArticles(limit?: number) {
  return useQuery({
    queryKey: queryKeys.articles.featured(),
    queryFn: () => articlesApi.getFeatured(limit),
  });
}

export function useLatestArticles(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.articles.latest(params),
    queryFn: () => articlesApi.getLatest(params),
  });
}

export function useTrendingArticles(params?: PaginationParams & { period?: 'day' | 'week' | 'month' | 'all' }) {
  return useQuery({
    queryKey: queryKeys.articles.trending(params),
    queryFn: () => articlesApi.getPopular(params),
  });
}

export function useTopStories() {
  return useQuery({
    queryKey: queryKeys.articles.topStories(),
    queryFn: () => articlesApi.getPopular({ limit: 4 }),
  });
}

// ─── Categories ─────────────────────────────────────────────────────────────

export function useCategories(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => articlesApi.listCategories(params),
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.categories.slug(slug),
    queryFn: () => articlesApi.getCategoryBySlug(slug),
    enabled: !!slug,
  });
}

// ─── Tags ───────────────────────────────────────────────────────────────────

export function useTags(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.tags.list(params),
    queryFn: () => articlesApi.listTags(params),
  });
}

// ─── Books ──────────────────────────────────────────────────────────────────

export function useBooks(params?: PaginationParams & { authorId?: string; genreId?: string; seriesId?: string; publisherId?: string; status?: string; format?: string }) {
  return useQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: () => booksApi.list(params),
  });
}

export function useBookById(id: string) {
  return useQuery({
    queryKey: queryKeys.books.detail(id),
    queryFn: () => booksApi.get(id),
    enabled: !!id,
  });
}

export function useBookBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.books.slug(slug),
    queryFn: () => booksApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useBookChapters(bookId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.books.chapters(bookId),
    queryFn: () => booksApi.listChapters(bookId, params),
    enabled: !!bookId,
  });
}

export function useRecommendedBooks() {
  return useQuery({
    queryKey: queryKeys.books.recommended(),
    queryFn: () => booksApi.getFeatured(),
  });
}

export function useTrendingBooks(params?: PaginationParams & { period?: 'day' | 'week' | 'month' | 'all' }) {
  return useQuery({
    queryKey: queryKeys.books.trending(params),
    queryFn: () => booksApi.getPopular(params),
  });
}

export function useLatestBooks(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.books.latest(params),
    queryFn: () => booksApi.getLatest(params),
  });
}

export function useFeaturedBooks(limit?: number) {
  return useQuery({
    queryKey: queryKeys.books.featured(),
    queryFn: () => booksApi.getFeatured(limit),
  });
}

// ─── Authors ────────────────────────────────────────────────────────────────

export function useAuthors(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.authors.list(params),
    queryFn: () => booksApi.listAuthors(params),
  });
}

export function useAuthorBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.authors.slug(slug),
    queryFn: () => booksApi.getAuthorBySlug(slug),
    enabled: !!slug,
  });
}

export function useAuthorBooks(authorId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: [...queryKeys.authors.detail(authorId), 'books'] as const,
    queryFn: () => booksApi.getAuthorBooks(authorId, params),
    enabled: !!authorId,
  });
}

// ─── Publishers ─────────────────────────────────────────────────────────────

export function usePublishers(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.publishers.list(params),
    queryFn: () => booksApi.listPublishers(params),
  });
}

export function usePublisherBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.publishers.slug(slug),
    queryFn: () => booksApi.getPublisherBySlug(slug),
    enabled: !!slug,
  });
}

export function usePublisherBooks(publisherId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: [...queryKeys.publishers.detail(publisherId), 'books'] as const,
    queryFn: () => booksApi.getPublisherBooks(publisherId, params),
    enabled: !!publisherId,
  });
}

// ─── Genres ─────────────────────────────────────────────────────────────────

export function useGenres(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.genres.list(params),
    queryFn: () => booksApi.listGenres(params),
  });
}

export function useGenreBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.genres.slug(slug),
    queryFn: () => booksApi.getGenreBySlug(slug),
    enabled: !!slug,
  });
}

// ─── Series ─────────────────────────────────────────────────────────────────

export function useSeries(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.series.list(params),
    queryFn: () => booksApi.listSeries(params),
  });
}

export function useSeriesBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.series.slug(slug),
    queryFn: () => booksApi.getSeriesBySlug(slug),
    enabled: !!slug,
  });
}

export function useSeriesBooks(seriesId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: [...queryKeys.series.detail(seriesId), 'books'] as const,
    queryFn: () => booksApi.getSeriesBooks(seriesId, params),
    enabled: !!seriesId,
  });
}

// ─── Collections ────────────────────────────────────────────────────────────

export function useCollections(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.collections.list(params),
    // No collectionsApi in endpoints — use publications search as proxy
    queryFn: () => publicationsApi.list(params),
  });
}

// ─── Publications & Issues ──────────────────────────────────────────────────

export function usePublications(params?: PaginationParams & { type?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.publications.list(params),
    queryFn: () => publicationsApi.list(params),
  });
}

export function usePublicationBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.publications.slug(slug),
    queryFn: () => publicationsApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useIssues(publicationId: string, params?: PaginationParams & { status?: string }) {
  return useQuery({
    queryKey: queryKeys.issues.list(publicationId, params),
    queryFn: () => publicationsApi.listIssues(publicationId, params),
    enabled: !!publicationId,
  });
}

export function useIssueBySlug(publicationId: string, slug: string) {
  return useQuery({
    queryKey: queryKeys.issues.slug(publicationId, slug),
    queryFn: () => publicationsApi.getIssueBySlug(publicationId, slug),
    enabled: !!publicationId && !!slug,
  });
}

// ─── Search ─────────────────────────────────────────────────────────────────

export function useGlobalSearch(query: string, params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.search.global(query, params),
    queryFn: () => articlesApi.search(query, params),
    enabled: query.length > 1,
  });
}

// ─── User Interactions ──────────────────────────────────────────────────────

export function useNotifications(params?: PaginationParams & { unreadOnly?: boolean }) {
  return useQuery({
    queryKey: queryKeys.user.notifications(params),
    queryFn: () => usersApi.getNotifications(params),
  });
}

export function useReadingHistory() {
  return useQuery({
    queryKey: queryKeys.user.readingHistory(),
    queryFn: () => booksApi.getReadingProgress('__all__'), // placeholder
    enabled: false, // will be enabled when backend supports this
  });
}

export function useBookmarks() {
  return useQuery({
    queryKey: queryKeys.user.bookmarks(),
    queryFn: () => usersApi.getPreferences(), // placeholder
    enabled: false,
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: queryKeys.user.favorites(),
    queryFn: () => usersApi.getPreferences(), // placeholder
    enabled: false,
  });
}

export function useNotes() {
  return useQuery({
    queryKey: queryKeys.user.notes(),
    queryFn: () => usersApi.getPreferences(), // placeholder
    enabled: false,
  });
}

export function useContinueReading() {
  return useQuery({
    queryKey: queryKeys.user.continueReading(),
    queryFn: () => booksApi.getLatest({ limit: 4 }), // placeholder
  });
}

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.user.addresses(),
    queryFn: () => usersApi.listAddresses(),
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: queryKeys.user.preferences(),
    queryFn: () => usersApi.getPreferences(),
  });
}

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.user.sessions(),
    queryFn: () => authApi.listSessions(),
  });
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export function useOrders(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => ordersApi.list(params),
  });
}

export function useOrderById(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}

// ─── Subscriptions ──────────────────────────────────────────────────────────

export function useSubscriptionPlans(params?: PaginationParams & { active?: boolean; type?: string }) {
  return useQuery({
    queryKey: queryKeys.subscriptions.plans(),
    queryFn: () => subscriptionsApi.listPlans(params),
  });
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: queryKeys.subscriptions.current(),
    queryFn: () => subscriptionsApi.getCurrent(),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: queryKeys.subscriptions.paymentMethods(),
    queryFn: () => subscriptionsApi.listPaymentMethods(),
  });
}

// ─── Coupons ────────────────────────────────────────────────────────────────

export function useCoupons(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.coupons.list(params),
    // No couponsApi endpoint — route to orders stats as proxy
    queryFn: () => ordersApi.getStats(),
    enabled: false,
  });
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => usersApi.getStats(),
  });
}

export function useAdminUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => usersApi.list(params),
  });
}

export function useAdminPayments(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.admin.payments(params),
    queryFn: () => ordersApi.list(params),
  });
}

export function useAdminComments(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.admin.comments(params),
    // No commentsApi — placeholder
    queryFn: () => articlesApi.list(params),
    enabled: false,
  });
}

export function useStaff() {
  return useQuery({
    queryKey: queryKeys.admin.staff(),
    queryFn: () => usersApi.list({ role: 'admin' as any }),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.admin.roles(),
    queryFn: () => usersApi.list(), // placeholder — real roles endpoint TBD
    enabled: false,
  });
}

export function useAuditLog(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.admin.auditLog(params),
    // No auditApi — placeholder
    queryFn: () => usersApi.getStats(),
    enabled: false,
  });
}

export function useRevenueTrend(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.admin.revenueTrend(params),
    queryFn: () => ordersApi.getStats(params as any),
  });
}

export function usePlanBreakdown() {
  return useQuery({
    queryKey: queryKeys.admin.planBreakdown(),
    queryFn: () => subscriptionsApi.getStats(),
  });
}

// ─── Auth Mutations ─────────────────────────────────────────────────────────

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => qc.clear(),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: authApi.verifyEmail,
  });
}

export function useVerify2FA() {
  return useMutation({
    mutationFn: authApi.verify2FA,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
}

// ─── CRUD Mutations ─────────────────────────────────────────────────────────

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: articlesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.articles.all }),
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof articlesApi.update>[1] }) => articlesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.articles.all }),
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: articlesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.articles.all }),
  });
}

export function useCreateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: booksApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.books.all }),
  });
}

export function useUpdateBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof booksApi.update>[1] }) => booksApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.books.all }),
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: booksApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.books.all }),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders.all }),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => ordersApi.cancel(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders.all }),
  });
}

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: subscriptionsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.subscriptions.all }),
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, immediately, reason }: { id: string; immediately?: boolean; reason?: string }) =>
      subscriptionsApi.cancel(id, immediately, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.subscriptions.all }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.user.profile() }),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.user.notifications() }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.user.notifications() }),
  });
}
