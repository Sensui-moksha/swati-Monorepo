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

  // Authors
  listAuthors: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Author>>('/publishing/authors', { params }),

  getAuthor: (id: string) =>
    apiClient.get<ApiResponse<Author>>(`/publishing/authors/${id}`),

  getAuthorBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Author>>(`/publishing/authors/slug/${slug}`),

  getAuthorBooks: (authorId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>(`/publishing/authors/${authorId}/books`, { params }),

  // Publishers
  listPublishers: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Publisher>>('/publishing/publishers', { params }),

  getPublisher: (id: string) =>
    apiClient.get<ApiResponse<Publisher>>(`/publishing/publishers/${id}`),

  getPublisherBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Publisher>>(`/publishing/publishers/slug/${slug}`),

  getPublisherBooks: (publisherId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>(`/publishing/publishers/${publisherId}/books`, { params }),

  // Genres
  listGenres: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Genre>>('/publishing/genres', { params }),

  getGenre: (id: string) =>
    apiClient.get<ApiResponse<Genre>>(`/publishing/genres/${id}`),

  getGenreBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Genre>>(`/publishing/genres/slug/${slug}`),

  // Series
  listSeries: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Series>>('/publishing/series', { params }),

  getSeries: (id: string) =>
    apiClient.get<ApiResponse<Series>>(`/publishing/series/${id}`),

  getSeriesBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Series>>(`/publishing/series/slug/${slug}`),

  getSeriesBooks: (seriesId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>(`/publishing/series/${seriesId}/books`, { params }),

  // Discovery
  getPopular: (params?: PaginationParams & { period?: 'day' | 'week' | 'month' | 'all' }) =>
    apiClient.get<PaginatedResponse<Book>>('/publishing/books/popular', { params }),

  getLatest: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>('/publishing/books/new', { params }),

  getFeatured: (limit?: number) =>
    apiClient.get<ApiResponse<Book[]>>('/publishing/books/featured', { params: { limit } }),
};