import { apiClient } from '../client';
import type {
  Book,
  Chapter,
  Author,
  Publisher,
  Genre,
  Series,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from '../types';

export const booksApi = {
  // Books
  list: (params?: PaginationParams & { 
    authorId?: string; 
    genreId?: string; 
    seriesId?: string; 
    publisherId?: string;
    status?: string;
    format?: string;
  }) =>
    apiClient.get<PaginatedResponse<Book>>('/publishing/books', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Book>>(`/publishing/books/${id}`),

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Book>>(`/publishing/books/slug/${slug}`),

  create: (data: Partial<Book>) =>
    apiClient.post<ApiResponse<Book>>('/publishing/books', data),

  update: (id: string, data: Partial<Book>) =>
    apiClient.patch<ApiResponse<Book>>(`/publishing/books/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/publishing/books/${id}`),

  publish: (id: string) =>
    apiClient.post<ApiResponse<Book>>(`/publishing/books/${id}/publish`),

  unpublish: (id: string) =>
    apiClient.post<ApiResponse<Book>>(`/publishing/books/${id}/unpublish`),

  // Chapters
  listChapters: (bookId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Chapter>>(`/publishing/books/${bookId}/chapters`, { params }),

  getChapter: (bookId: string, chapterId: string) =>
    apiClient.get<ApiResponse<Chapter>>(`/publishing/books/${bookId}/chapters/${chapterId}`),

  createChapter: (bookId: string, data: Partial<Chapter>) =>
    apiClient.post<ApiResponse<Chapter>>(`/publishing/books/${bookId}/chapters`, data),

  updateChapter: (bookId: string, chapterId: string, data: Partial<Chapter>) =>
    apiClient.patch<ApiResponse<Chapter>>(`/publishing/books/${bookId}/chapters/${chapterId}`, data),

  deleteChapter: (bookId: string, chapterId: string) =>
    apiClient.delete<ApiResponse<void>>(`/publishing/books/${bookId}/chapters/${chapterId}`),

  publishChapter: (bookId: string, chapterId: string) =>
    apiClient.post<ApiResponse<Chapter>>(`/publishing/books/${bookId}/chapters/${chapterId}/publish`),

  reorderChapters: (bookId: string, chapterIds: string[]) =>
    apiClient.post<ApiResponse<void>>(`/publishing/books/${bookId}/chapters/reorder`, { chapterIds }),

  // Authors
  listAuthors: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Author>>('/publishing/authors', { params }),

  getAuthor: (id: string) =>
    apiClient.get<ApiResponse<Author>>(`/publishing/authors/${id}`),

  getAuthorBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Author>>(`/publishing/authors/slug/${slug}`),

  createAuthor: (data: Partial<Author>) =>
    apiClient.post<ApiResponse<Author>>('/publishing/authors', data),

  updateAuthor: (id: string, data: Partial<Author>) =>
    apiClient.patch<ApiResponse<Author>>(`/publishing/authors/${id}`, data),

  deleteAuthor: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/publishing/authors/${id}`),

  followAuthor: (authorId: string) =>
    apiClient.post<ApiResponse<{ followed: boolean; followerCount: number }>>(`/publishing/authors/${authorId}/follow`),

  getAuthorBooks: (authorId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>(`/publishing/authors/${authorId}/books`, { params }),

  // Publishers
  listPublishers: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Publisher>>('/publishing/publishers', { params }),

  getPublisher: (id: string) =>
    apiClient.get<ApiResponse<Publisher>>(`/publishing/publishers/${id}`),

  getPublisherBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Publisher>>(`/publishing/publishers/slug/${slug}`),

  createPublisher: (data: Partial<Publisher>) =>
    apiClient.post<ApiResponse<Publisher>>('/publishing/publishers', data),

  updatePublisher: (id: string, data: Partial<Publisher>) =>
    apiClient.patch<ApiResponse<Publisher>>(`/publishing/publishers/${id}`, data),

  deletePublisher: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/publishing/publishers/${id}`),

  getPublisherBooks: (publisherId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>(`/publishing/publishers/${publisherId}/books`, { params }),

  // Genres
  listGenres: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Genre>>('/publishing/genres', { params }),

  getGenre: (id: string) =>
    apiClient.get<ApiResponse<Genre>>(`/publishing/genres/${id}`),

  getGenreBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Genre>>(`/publishing/genres/slug/${slug}`),

  createGenre: (data: Partial<Genre>) =>
    apiClient.post<ApiResponse<Genre>>('/publishing/genres', data),

  updateGenre: (id: string, data: Partial<Genre>) =>
    apiClient.patch<ApiResponse<Genre>>(`/publishing/genres/${id}`, data),

  deleteGenre: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/publishing/genres/${id}`),

  // Series
  listSeries: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Series>>('/publishing/series', { params }),

  getSeries: (id: string) =>
    apiClient.get<ApiResponse<Series>>(`/publishing/series/${id}`),

  getSeriesBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Series>>(`/publishing/series/slug/${slug}`),

  createSeries: (data: Partial<Series>) =>
    apiClient.post<ApiResponse<Series>>('/publishing/series', data),

  updateSeries: (id: string, data: Partial<Series>) =>
    apiClient.patch<ApiResponse<Series>>(`/publishing/series/${id}`, data),

  deleteSeries: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/publishing/series/${id}`),

  followSeries: (seriesId: string) =>
    apiClient.post<ApiResponse<{ followed: boolean }>>(`/publishing/series/${seriesId}/follow`),

  getSeriesBooks: (seriesId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>(`/publishing/series/${seriesId}/books`, { params }),

  // Interactions
  bookmark: (bookId: string) =>
    apiClient.post<ApiResponse<{ bookmarked: boolean }>>(`/publishing/books/${bookId}/bookmark`),

  favorite: (bookId: string) =>
    apiClient.post<ApiResponse<{ favorited: boolean }>>(`/publishing/books/${bookId}/favorite`),

  rate: (bookId: string, rating: number, review?: string) =>
    apiClient.post<ApiResponse<{ rating: number; averageRating: number; reviewCount: number }>>(`/publishing/books/${bookId}/rate`, { rating, review }),

  getReadingProgress: (bookId: string) =>
    apiClient.get<ApiResponse<{ progress: number; currentChapterId?: string; lastReadAt: string }>>(`/publishing/books/${bookId}/progress`),

  updateReadingProgress: (bookId: string, progress: number, chapterId?: string) =>
    apiClient.post<ApiResponse<void>>(`/publishing/books/${bookId}/progress`, { progress, chapterId }),

  // Search & Discovery
  search: (query: string, params?: PaginationParams & { genreId?: string; authorId?: string; format?: string }) =>
    apiClient.get<PaginatedResponse<Book>>('/publishing/books/search', { params: { q: query, ...params } }),

  getRelated: (bookId: string, limit?: number) =>
    apiClient.get<ApiResponse<Book[]>>(`/publishing/books/${bookId}/related`, { params: { limit } }),

  getPopular: (params?: PaginationParams & { period?: 'day' | 'week' | 'month' | 'all' }) =>
    apiClient.get<PaginatedResponse<Book>>('/publishing/books/popular', { params }),

  getLatest: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>('/publishing/books/latest', { params }),

  getFeatured: (limit?: number) =>
    apiClient.get<ApiResponse<Book[]>>('/publishing/books/featured', { params: { limit } }),

  getOnSale: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>('/publishing/books/on-sale', { params }),

  getBestsellers: (params?: PaginationParams & { category?: string }) =>
    apiClient.get<PaginatedResponse<Book>>('/publishing/books/bestsellers', { params }),

  // Stats
  getStats: (bookId: string) =>
    apiClient.get<ApiResponse<{ views: number; purchases: number; rating: number; reviews: number }>>(`/publishing/books/${bookId}/stats`),
};