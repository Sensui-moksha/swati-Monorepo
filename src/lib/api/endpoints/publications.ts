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
    apiClient.get<PaginatedResponse<Publication>>('/publishing/publications', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Publication>>(`/publishing/publications/${id}`),

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Publication>>(`/publishing/publications/slug/${slug}`),

  create: (data: Partial<Publication>) =>
    apiClient.post<ApiResponse<Publication>>('/publishing/publications', data),

  update: (id: string, data: Partial<Publication>) =>
    apiClient.patch<ApiResponse<Publication>>(`/publishing/publications/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/publishing/publications/${id}`),

  publish: (id: string) =>
    apiClient.post<ApiResponse<Publication>>(`/publishing/publications/${id}/publish`),

  unpublish: (id: string) =>
    apiClient.post<ApiResponse<Publication>>(`/publishing/publications/${id}/unpublish`),

  // Issues
  listIssues: (publicationId: string, params?: PaginationParams & { status?: string }) =>
    apiClient.get<PaginatedResponse<Issue>>(`/publishing/publications/${publicationId}/issues`, { params }),

  getIssue: (publicationId: string, issueId: string) =>
    apiClient.get<ApiResponse<Issue>>(`/publishing/publications/${publicationId}/issues/${issueId}`),

  getIssueBySlug: (publicationId: string, slug: string) =>
    apiClient.get<ApiResponse<Issue>>(`/publishing/publications/${publicationId}/issues/slug/${slug}`),

  createIssue: (publicationId: string, data: Partial<Issue>) =>
    apiClient.post<ApiResponse<Issue>>(`/publishing/publications/${publicationId}/issues`, data),

  updateIssue: (publicationId: string, issueId: string, data: Partial<Issue>) =>
    apiClient.patch<ApiResponse<Issue>>(`/publishing/publications/${publicationId}/issues/${issueId}`, data),

  deleteIssue: (publicationId: string, issueId: string) =>
    apiClient.delete<ApiResponse<void>>(`/publishing/publications/${publicationId}/issues/${issueId}`),

  publishIssue: (publicationId: string, issueId: string) =>
    apiClient.post<ApiResponse<Issue>>(`/publishing/publications/${publicationId}/issues/${issueId}/publish`),

  unpublishIssue: (publicationId: string, issueId: string) =>
    apiClient.post<ApiResponse<Issue>>(`/publishing/publications/${publicationId}/issues/${issueId}/unpublish`),

  // Issue articles
  getIssueArticles: (publicationId: string, issueId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Article>>(`/publishing/publications/${publicationId}/issues/${issueId}/articles`, { params }),

  addArticleToIssue: (publicationId: string, issueId: string, articleId: string, order?: number) =>
    apiClient.post<ApiResponse<void>>(`/publishing/publications/${publicationId}/issues/${issueId}/articles`, { articleId, order }),

  removeArticleFromIssue: (publicationId: string, issueId: string, articleId: string) =>
    apiClient.delete<ApiResponse<void>>(`/publishing/publications/${publicationId}/issues/${issueId}/articles/${articleId}`),

  reorderIssueArticles: (publicationId: string, issueId: string, articleIds: string[]) =>
    apiClient.post<ApiResponse<void>>(`/publishing/publications/${publicationId}/issues/${issueId}/articles/reorder`, { articleIds }),

  // Subscriptions
  subscribe: (publicationId: string) =>
    apiClient.post<ApiResponse<{ subscribed: boolean; subscriberCount: number }>>(`/publishing/publications/${publicationId}/subscribe`),

  unsubscribe: (publicationId: string) =>
    apiClient.delete<ApiResponse<{ subscribed: boolean; subscriberCount: number }>>(`/publishing/publications/${publicationId}/subscribe`),

  getSubscribers: (publicationId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<{ id: string; email: string; name: string; subscribedAt: string }>>(`/publishing/publications/${publicationId}/subscribers`, { params }),

  // Interactions
  bookmarkIssue: (issueId: string) =>
    apiClient.post<ApiResponse<{ bookmarked: boolean }>>(`/publishing/issues/${issueId}/bookmark`),

  // Search & Discovery
  search: (query: string, params?: PaginationParams & { type?: string }) =>
    apiClient.get<PaginatedResponse<Publication>>('/publishing/publications/search', { params: { q: query, ...params } }),

  getPopular: (params?: PaginationParams & { period?: 'day' | 'week' | 'month' | 'all' }) =>
    apiClient.get<PaginatedResponse<Publication>>('/publishing/publications/popular', { params }),

  getLatest: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Publication>>('/publishing/publications/latest', { params }),

  getFeatured: (limit?: number) =>
    apiClient.get<ApiResponse<Publication[]>>('/publishing/publications/featured', { params: { limit } }),

  // Stats
  getPublicationStats: (publicationId: string) =>
    apiClient.get<ApiResponse<{ issues: number; subscribers: number; articles: number }>>(`/publishing/publications/${publicationId}/stats`),

  getIssueStats: (publicationId: string, issueId: string) =>
    apiClient.get<ApiResponse<{ views: number; articles: number; reads: number }>>(`/publishing/publications/${publicationId}/issues/${issueId}/stats`),
};