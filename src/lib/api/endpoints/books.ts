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
    apiClient.get<PaginatedResponse<Book>>('/books', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<Book>>(`/books/${id}`),

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Book>>(`/books/slug/${slug}`),

  create: (data: Partial<Book>) =>
    apiClient.post<ApiResponse<Book>>('/books', data),

  update: (id: string, data: Partial<Book>) =>
    apiClient.patch<ApiResponse<Book>>(`/books/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/books/${id}`),

  publish: (id: string) =>
    apiClient.post<ApiResponse<Book>>(`/books/${id}/publish`),

  unpublish: (id: string) =>
    apiClient.post<ApiResponse<Book>>(`/books/${id}/unpublish`),

  // Chapters
  listChapters: (bookId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Chapter>>(`/books/${bookId}/chapters`, { params }),

  getChapter: (bookId: string, chapterId: string) =>
    apiClient.get<ApiResponse<Chapter>>(`/books/${bookId}/chapters/${chapterId}`),

  createChapter: (bookId: string, data: Partial<Chapter>) =>
    apiClient.post<ApiResponse<Chapter>>(`/books/${bookId}/chapters`, data),

  updateChapter: (bookId: string, chapterId: string, data: Partial<Chapter>) =>
    apiClient.patch<ApiResponse<Chapter>>(`/books/${bookId}/chapters/${chapterId}`, data),

  deleteChapter: (bookId: string, chapterId: string) =>
    apiClient.delete<ApiResponse<void>>(`/books/${bookId}/chapters/${chapterId}`),

  publishChapter: (bookId: string, chapterId: string) =>
    apiClient.post<ApiResponse<Chapter>>(`/books/${bookId}/chapters/${chapterId}/publish`),

  reorderChapters: (bookId: string, chapterIds: string[]) =>
    apiClient.post<ApiResponse<void>>(`/books/${bookId}/chapters/reorder`, { chapterIds }),

  // Authors
  listAuthors: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Author>>('/authors', { params }),

  getAuthor: (id: string) =>
    apiClient.get<ApiResponse<Author>>(`/authors/${id}`),

  getAuthorBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Author>>(`/authors/slug/${slug}`),

  createAuthor: (data: Partial<Author>) =>
    apiClient.post<ApiResponse<Author>>('/authors', data),

  updateAuthor: (id: string, data: Partial<Author>) =>
    apiClient.patch<ApiResponse<Author>>(`/authors/${id}`, data),

  deleteAuthor: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/authors/${id}`),

  followAuthor: (authorId: string) =>
    apiClient.post<ApiResponse<{ followed: boolean; followerCount: number }>>(`/authors/${authorId}/follow`),

  getAuthorBooks: (authorId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>(`/authors/${authorId}/books`, { params }),

  // Publishers
  listPublishers: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Publisher>>('/publishers', { params }),

  getPublisher: (id: string) =>
    apiClient.get<ApiResponse<Publisher>>(`/publishers/${id}`),

  getPublisherBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Publisher>>(`/publishers/slug/${slug}`),

  createPublisher: (data: Partial<Publisher>) =>
    apiClient.post<ApiResponse<Publisher>>('/publishers', data),

  updatePublisher: (id: string, data: Partial<Publisher>) =>
    apiClient.patch<ApiResponse<Publisher>>(`/publishers/${id}`, data),

  deletePublisher: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/publishers/${id}`),

  getPublisherBooks: (publisherId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>(`/publishers/${publisherId}/books`, { params }),

  // Genres
  listGenres: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Genre>>('/genres', { params }),

  getGenre: (id: string) =>
    apiClient.get<ApiResponse<Genre>>(`/genres/${id}`),

  getGenreBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Genre>>(`/genres/slug/${slug}`),

  createGenre: (data: Partial<Genre>) =>
    apiClient.post<ApiResponse<Genre>>('/genres', data),

  updateGenre: (id: string, data: Partial<Genre>) =>
    apiClient.patch<ApiResponse<Genre>>(`/genres/${id}`, data),

  deleteGenre: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/genres/${id}`),

  // Series
  listSeries: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Series>>('/series', { params }),

  getSeries: (id: string) =>
    apiClient.get<ApiResponse<Series>>(`/series/${id}`),

  getSeriesBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Series>>(`/series/slug/${slug}`),

  createSeries: (data: Partial<Series>) =>
    apiClient.post<ApiResponse<Series>>('/series', data),

  updateSeries: (id: string, data: Partial<Series>) =>
    apiClient.patch<ApiResponse<Series>>(`/series/${id}`, data),

  deleteSeries: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/series/${id}`),

  followSeries: (seriesId: string) =>
    apiClient.post<ApiResponse<{ followed: boolean }>>(`/series/${seriesId}/follow`),

  getSeriesBooks: (seriesId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>(`/series/${seriesId}/books`, { params }),

  // Interactions
  bookmark: (bookId: string) =>
    apiClient.post<ApiResponse<{ bookmarked: boolean }>>(`/books/${bookId}/bookmark`),

  favorite: (bookId: string) =>
    apiClient.post<ApiResponse<{ favorited: boolean }>>(`/books/${bookId}/favorite`),

  rate: (bookId: string, rating: number, review?: string) =>
    apiClient.post<ApiResponse<{ rating: number; averageRating: number; reviewCount: number }>>(`/books/${bookId}/rate`, { rating, review }),

  getReadingProgress: (bookId: string) =>
    apiClient.get<ApiResponse<{ progress: number; currentChapterId?: string; lastReadAt: string }>>(`/books/${bookId}/progress`),

  updateReadingProgress: (bookId: string, progress: number, chapterId?: string) =>
    apiClient.post<ApiResponse<void>>(`/books/${bookId}/progress`, { progress, chapterId }),

  // Search & Discovery
  search: (query: string, params?: PaginationParams & { genreId?: string; authorId?: string; format?: string }) =>
    apiClient.get<PaginatedResponse<Book>>('/books/search', { params: { q: query, ...params } }),

  getRelated: (bookId: string, limit?: number) =>
    apiClient.get<ApiResponse<Book[]>>(`/books/${bookId}/related`, { params: { limit } }),

  getPopular: (params?: PaginationParams & { period?: 'day' | 'week' | 'month' | 'all' }) =>
    apiClient.get<PaginatedResponse<Book>>('/books/popular', { params }),

  getLatest: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>('/books/latest', { params }),

  getFeatured: (limit?: number) =>
    apiClient.get<ApiResponse<Book[]>>('/books/featured', { params: { limit } }),

  getOnSale: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>('/books/on-sale', { params }),

  getBestsellers: (params?: PaginationParams & { category?: string }) =>
    apiClient.get<PaginatedResponse<Book>>('/books/bestsellers', { params }),

  // Stats
  getStats: (bookId: string) =>
    apiClient.get<ApiResponse<{ views: number; purchases: number; rating: number; reviews: number }>>(`/books/${bookId}/stats`),
};