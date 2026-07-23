import { apiClient } from '../client';
import type {
  Article,
  ArticleVersion,
  Category,
  Tag,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export const articlesApi = {
  // Articles
  list: (params?: PaginationParams & { categoryId?: string; tagId?: string; authorId?: string; status?: string }) =>
    apiClient.get<PaginatedResponse<Article>>('/articles', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Article>>(`/articles/${id}`),

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Article>>(`/articles/slug/${slug}`),

  create: (data: Partial<Article>) =>
    apiClient.post<ApiResponse<Article>>('/articles', data),

  update: (id: string, data: Partial<Article>) =>
    apiClient.patch<ApiResponse<Article>>(`/articles/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/articles/${id}`),

  publish: (id: string) =>
    apiClient.post<ApiResponse<Article>>(`/articles/${id}/publish`),

  unpublish: (id: string) =>
    apiClient.post<ApiResponse<Article>>(`/articles/${id}/unpublish`),

  schedule: (id: string, scheduledAt: string) =>
    apiClient.post<ApiResponse<Article>>(`/articles/${id}/schedule`, { scheduledAt }),

  // Article versions
  getVersions: (articleId: string) =>
    apiClient.get<ApiResponse<ArticleVersion[]>>(`/articles/${articleId}/versions`),

  getVersion: (articleId: string, version: number) =>
    apiClient.get<ApiResponse<ArticleVersion>>(`/articles/${articleId}/versions/${version}`),

  restoreVersion: (articleId: string, version: number) =>
    apiClient.post<ApiResponse<Article>>(`/articles/${articleId}/versions/${version}/restore`),

  // Categories
  listCategories: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Category>>('/categories', { params }),

  getCategory: (id: string) =>
    apiClient.get<ApiResponse<Category>>(`/categories/${id}`),

  getCategoryBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Category>>(`/categories/slug/${slug}`),

  createCategory: (data: Partial<Category>) =>
    apiClient.post<ApiResponse<Category>>('/categories', data),

  updateCategory: (id: string, data: Partial<Category>) =>
    apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, data),

  deleteCategory: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/categories/${id}`),

  // Tags
  listTags: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Tag>>('/tags', { params }),

  getTag: (id: string) =>
    apiClient.get<ApiResponse<Tag>>(`/tags/${id}`),

  getTagBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Tag>>(`/tags/slug/${slug}`),

  createTag: (data: Partial<Tag>) =>
    apiClient.post<ApiResponse<Tag>>('/tags', data),

  updateTag: (id: string, data: Partial<Tag>) =>
    apiClient.patch<ApiResponse<Tag>>(`/tags/${id}`, data),

  deleteTag: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/tags/${id}`),

  // Interactions
  like: (articleId: string) =>
    apiClient.post<ApiResponse<{ liked: boolean; likeCount: number }>>(`/articles/${articleId}/like`),

  bookmark: (articleId: string) =>
    apiClient.post<ApiResponse<{ bookmarked: boolean }>>(`/articles/${articleId}/bookmark`),

  getReadingProgress: (articleId: string) =>
    apiClient.get<ApiResponse<{ progress: number; lastReadAt: string }>>(`/articles/${articleId}/progress`),

  updateReadingProgress: (articleId: string, progress: number) =>
    apiClient.post<ApiResponse<void>>(`/articles/${articleId}/progress`, { progress }),

  // Search & Discovery
  search: (query: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Article>>('/articles/search', { params: { q: query, ...params } }),

  getRelated: (articleId: string, limit?: number) =>
    apiClient.get<ApiResponse<Article[]>>(`/articles/${articleId}/related`, { params: { limit } }),

  getPopular: (params?: PaginationParams & { period?: 'day' | 'week' | 'month' | 'all' }) =>
    apiClient.get<PaginatedResponse<Article>>('/articles/popular', { params }),

  getLatest: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Article>>('/articles/latest', { params }),

  getFeatured: (limit?: number) =>
    apiClient.get<ApiResponse<Article[]>>('/articles/featured', { params: { limit } }),

  // Stats
  getStats: (articleId: string) =>
    apiClient.get<ApiResponse<{ views: number; likes: number; bookmarks: number; shares: number }>>(`/articles/${articleId}/stats`),

  incrementView: (articleId: string) =>
    apiClient.post<ApiResponse<void>>(`/articles/${articleId}/view`),
};