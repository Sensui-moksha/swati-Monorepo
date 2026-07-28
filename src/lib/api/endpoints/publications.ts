import { apiClient } from '../client';
import type {
  Publication,
  Issue,
  Article,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from '../types';

import { PUBLICATION_DOCUMENTS } from '../../documents';

export const publicationsApi = {
  // Publications
  list: async (params?: PaginationParams & { type?: string; status?: string }) => {
    try {
      const res = await apiClient.get<PaginatedResponse<Publication>>('/publishing/publications', { params });
      if (res.data && res.data.length > 0) return res;
    } catch (_) {}
    
    let docs = PUBLICATION_DOCUMENTS;
    if (params?.type) {
      docs = docs.filter((d) => d.type === params.type);
    }
    const formatted = docs.map((d) => ({
      id: d.id,
      title: d.title,
      slug: d.slug,
      type: d.type as any,
      description: d.description,
      coverImage: d.coverImage,
      pdfUrl: d.pdfUrl,
      issueCount: d.issueCount ?? 1,
      createdAt: d.createdAt,
      updatedAt: d.createdAt,
    }));
    return {
      data: formatted as any,
      meta: { page: 1, limit: 20, total: formatted.length, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    };
  },

  get: async (id: string) => {
    try {
      const res = await apiClient.get<ApiResponse<Publication>>(`/publishing/publications/${id}`);
      if (res.data) return res;
    } catch (_) {}
    const found = PUBLICATION_DOCUMENTS.find((d) => d.id === id || d.slug === id) || PUBLICATION_DOCUMENTS[0];
    return {
      data: {
        id: found.id,
        title: found.title,
        slug: found.slug,
        type: found.type as any,
        description: found.description,
        coverImage: found.coverImage,
        pdfUrl: found.pdfUrl,
        issueCount: found.issueCount ?? 1,
        createdAt: found.createdAt,
        updatedAt: found.createdAt,
      } as any,
    };
  },

  getBySlug: async (slug: string) => {
    try {
      const res = await apiClient.get<ApiResponse<Publication>>(`/publishing/publications/slug/${slug}`);
      if (res.data) return res;
    } catch (_) {}
    const found = PUBLICATION_DOCUMENTS.find((d) => d.slug === slug || d.id === slug) || PUBLICATION_DOCUMENTS[0];
    return {
      data: {
        id: found.id,
        title: found.title,
        slug: found.slug,
        type: found.type as any,
        description: found.description,
        coverImage: found.coverImage,
        pdfUrl: found.pdfUrl,
        issueCount: found.issueCount ?? 1,
        createdAt: found.createdAt,
        updatedAt: found.createdAt,
      } as any,
    };
  },

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