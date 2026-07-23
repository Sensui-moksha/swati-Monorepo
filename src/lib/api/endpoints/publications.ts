import { apiClient } from '../client';
import type {
  Publication,
  Issue,
  Article,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export const publicationsApi = {
  // Publications
  list: (params?: PaginationParams & { type?: string; status?: string }) =>
    apiClient.get<PaginatedResponse<Publication>>('/publications', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Publication>>(`/publications/${id}`),

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Publication>>(`/publications/slug/${slug}`),

  create: (data: Partial<Publication>) =>
    apiClient.post<ApiResponse<Publication>>('/publications', data),

  update: (id: string, data: Partial<Publication>) =>
    apiClient.patch<ApiResponse<Publication>>(`/publications/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/publications/${id}`),

  publish: (id: string) =>
    apiClient.post<ApiResponse<Publication>>(`/publications/${id}/publish`),

  unpublish: (id: string) =>
    apiClient.post<ApiResponse<Publication>>(`/publications/${id}/unpublish`),

  // Issues
  listIssues: (publicationId: string, params?: PaginationParams & { status?: string }) =>
    apiClient.get<PaginatedResponse<Issue>>(`/publications/${publicationId}/issues`, { params }),

  getIssue: (publicationId: string, issueId: string) =>
    apiClient.get<ApiResponse<Issue>>(`/publications/${publicationId}/issues/${issueId}`),

  getIssueBySlug: (publicationId: string, slug: string) =>
    apiClient.get<ApiResponse<Issue>>(`/publications/${publicationId}/issues/slug/${slug}`),

  createIssue: (publicationId: string, data: Partial<Issue>) =>
    apiClient.post<ApiResponse<Issue>>(`/publications/${publicationId}/issues`, data),

  updateIssue: (publicationId: string, issueId: string, data: Partial<Issue>) =>
    apiClient.patch<ApiResponse<Issue>>(`/publications/${publicationId}/issues/${issueId}`, data),

  deleteIssue: (publicationId: string, issueId: string) =>
    apiClient.delete<ApiResponse<void>>(`/publications/${publicationId}/issues/${issueId}`),

  publishIssue: (publicationId: string, issueId: string) =>
    apiClient.post<ApiResponse<Issue>>(`/publications/${publicationId}/issues/${issueId}/publish`),

  unpublishIssue: (publicationId: string, issueId: string) =>
    apiClient.post<ApiResponse<Issue>>(`/publications/${publicationId}/issues/${issueId}/unpublish`),

  // Issue articles
  getIssueArticles: (publicationId: string, issueId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Article>>(`/publications/${publicationId}/issues/${issueId}/articles`, { params }),

  addArticleToIssue: (publicationId: string, issueId: string, articleId: string, order?: number) =>
    apiClient.post<ApiResponse<void>>(`/publications/${publicationId}/issues/${issueId}/articles`, { articleId, order }),

  removeArticleFromIssue: (publicationId: string, issueId: string, articleId: string) =>
    apiClient.delete<ApiResponse<void>>(`/publications/${publicationId}/issues/${issueId}/articles/${articleId}`),

  reorderIssueArticles: (publicationId: string, issueId: string, articleIds: string[]) =>
    apiClient.post<ApiResponse<void>>(`/publications/${publicationId}/issues/${issueId}/articles/reorder`, { articleIds }),

  // Subscriptions
  subscribe: (publicationId: string) =>
    apiClient.post<ApiResponse<{ subscribed: boolean; subscriberCount: number }>>(`/publications/${publicationId}/subscribe`),

  unsubscribe: (publicationId: string) =>
    apiClient.delete<ApiResponse<{ subscribed: boolean; subscriberCount: number }>>(`/publications/${publicationId}/subscribe`),

  getSubscribers: (publicationId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<{ id: string; email: string; name: string; subscribedAt: string }>>(`/publications/${publicationId}/subscribers`, { params }),

  // Interactions
  bookmarkIssue: (issueId: string) =>
    apiClient.post<ApiResponse<{ bookmarked: boolean }>>(`/issues/${issueId}/bookmark`),

  // Search & Discovery
  search: (query: string, params?: PaginationParams & { type?: string }) =>
    apiClient.get<PaginatedResponse<Publication>>('/publications/search', { params: { q: query, ...params } }),

  getPopular: (params?: PaginationParams & { period?: 'day' | 'week' | 'month' | 'all' }) =>
    apiClient.get<PaginatedResponse<Publication>>('/publications/popular', { params }),

  getLatest: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Publication>>('/publications/latest', { params }),

  getFeatured: (limit?: number) =>
    apiClient.get<ApiResponse<Publication[]>>('/publications/featured', { params: { limit } }),

  // Stats
  getPublicationStats: (publicationId: string) =>
    apiClient.get<ApiResponse<{ issues: number; subscribers: number; articles: number }>>(`/publications/${publicationId}/stats`),

  getIssueStats: (publicationId: string, issueId: string) =>
    apiClient.get<ApiResponse<{ views: number; articles: number; reads: number }>>(`/publications/${publicationId}/issues/${issueId}/stats`),
};