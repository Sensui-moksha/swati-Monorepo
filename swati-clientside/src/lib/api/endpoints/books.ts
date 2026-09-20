import { apiClient } from "../client";
import { PUBLICATION_DOCUMENTS } from "../../documents";
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
} from "../types";

const FALLBACK_GENRES: Genre[] = [
  {
    id: "weekly",
    name: "Weekly Editions",
    slug: "weekly",
    bookCount: 12,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "monthly",
    name: "Monthly Specials",
    slug: "monthly",
    bookCount: 8,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "special",
    name: "Special Archives",
    slug: "special",
    bookCount: 5,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "digital",
    name: "Digital Originals",
    slug: "digital",
    bookCount: 10,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
];

const FALLBACK_BOOKS: Book[] = PUBLICATION_DOCUMENTS.map((doc) => ({
  id: doc.id,
  title: doc.title,
  slug: doc.slug,
  description: doc.description,
  coverImage: doc.coverImage || doc.pdfUrl,
  pdfUrl: doc.pdfUrl,
  language: "Telugu",
  format: doc.type === "special" ? "hardcover" : "ebook",
  price: 49,
  status: "published",
  pageCount: doc.type === "special" ? 120 : 32,
  publishedAt: doc.createdAt,
  createdAt: doc.createdAt,
  updatedAt: doc.createdAt,
  genreIds: [doc.type],
  author: {
    id: "auth-editorial",
    name: doc.author || "Editorial Board",
    slug: "editorial-board",
    bio: "Official Swathi Publications Editorial Team",
    bookCount: 20,
    followerCount: 100,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  publisher: {
    id: "pub-swathi",
    name: "Swathi Publications",
    slug: "swathi-publications",
    bookCount: 50,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  genres: [
    {
      id: doc.type,
      name: doc.type.toUpperCase(),
      slug: doc.type,
      bookCount: 10,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
  ],
}));

export const booksApi = {
  // Books
  list: async (
    params?: PaginationParams & {
      authorId?: string;
      genreId?: string;
      seriesId?: string;
      publisherId?: string;
      status?: string;
      format?: string;
    },
  ): Promise<PaginatedResponse<Book>> => {
    try {
      const res = await apiClient.get<PaginatedResponse<Book>>("/publishing/books", { params });
      if (res?.data && res.data.length > 0) return res;
    } catch (_) {}

    let filtered = [...FALLBACK_BOOKS];
    if (params?.genreId) {
      filtered = filtered.filter((b) => b.genreIds.includes(params.genreId!));
    }
    return {
      data: filtered,
      meta: {
        page: 1,
        limit: 10,
        total: filtered.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  },

  get: async (id: string): Promise<ApiResponse<Book>> => {
    try {
      const res = await apiClient.get<ApiResponse<Book>>(`/publishing/books/${id}`);
      if (res?.data) return res;
    } catch (_) {}

    const found = FALLBACK_BOOKS.find((b) => b.id === id || b.slug === id) || FALLBACK_BOOKS[0];
    return { success: true, data: found };
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Book>> => {
    try {
      const res = await apiClient.get<ApiResponse<Book>>(`/publishing/books/slug/${slug}`);
      if (res?.data) return res;
    } catch (_) {}

    const found = FALLBACK_BOOKS.find((b) => b.slug === slug || b.id === slug) || FALLBACK_BOOKS[0];
    return { success: true, data: found };
  },

  create: (data: Partial<Book>) => apiClient.post<ApiResponse<Book>>("/publishing/books", data),

  update: (id: string, data: Partial<Book>) =>
    apiClient.patch<ApiResponse<Book>>(`/publishing/books/${id}`, data),

  delete: (id: string) => apiClient.delete<ApiResponse<void>>(`/publishing/books/${id}`),

  // Authors
  listAuthors: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Author>>("/publishing/authors", { params }),

  getAuthor: (id: string) => apiClient.get<ApiResponse<Author>>(`/publishing/authors/${id}`),

  getAuthorBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Author>>(`/publishing/authors/slug/${slug}`),

  getAuthorBooks: (authorId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>(`/publishing/authors/${authorId}/books`, { params }),

  // Publishers
  listPublishers: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Publisher>>("/publishing/publishers", { params }),

  getPublisher: (id: string) =>
    apiClient.get<ApiResponse<Publisher>>(`/publishing/publishers/${id}`),

  getPublisherBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Publisher>>(`/publishing/publishers/slug/${slug}`),

  getPublisherBooks: (publisherId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>(`/publishing/publishers/${publisherId}/books`, {
      params,
    }),

  // Genres
  listGenres: async (params?: PaginationParams): Promise<PaginatedResponse<Genre>> => {
    try {
      const res = await apiClient.get<PaginatedResponse<Genre>>("/publishing/genres", { params });
      if (res?.data && res.data.length > 0) return res;
    } catch (_) {}

    return {
      data: FALLBACK_GENRES,
      meta: {
        page: 1,
        limit: 10,
        total: FALLBACK_GENRES.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  },

  getGenre: (id: string) => apiClient.get<ApiResponse<Genre>>(`/publishing/genres/${id}`),

  getGenreBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Genre>>(`/publishing/genres/slug/${slug}`),

  // Series
  listSeries: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Series>>("/publishing/series", { params }),

  getSeries: (id: string) => apiClient.get<ApiResponse<Series>>(`/publishing/series/${id}`),

  getSeriesBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Series>>(`/publishing/series/slug/${slug}`),

  getSeriesBooks: (seriesId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Book>>(`/publishing/series/${seriesId}/books`, { params }),

  // Discovery
  getPopular: async (
    params?: PaginationParams & { period?: "day" | "week" | "month" | "all" },
  ): Promise<PaginatedResponse<Book>> => {
    try {
      const res = await apiClient.get<PaginatedResponse<Book>>("/publishing/books/popular", {
        params,
      });
      if (res?.data && res.data.length > 0) return res;
    } catch (_) {}

    return {
      data: FALLBACK_BOOKS,
      meta: {
        page: 1,
        limit: 10,
        total: FALLBACK_BOOKS.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  },

  getLatest: async (params?: PaginationParams): Promise<PaginatedResponse<Book>> => {
    try {
      const res = await apiClient.get<PaginatedResponse<Book>>("/publishing/books/new", { params });
      if (res?.data && res.data.length > 0) return res;
    } catch (_) {}

    return {
      data: FALLBACK_BOOKS,
      meta: {
        page: 1,
        limit: 10,
        total: FALLBACK_BOOKS.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  },

  getFeatured: async (limit?: number): Promise<ApiResponse<Book[]>> => {
    try {
      const res = await apiClient.get<ApiResponse<Book[]>>("/publishing/books/featured", {
        params: { limit },
      });
      if (res?.data && res.data.length > 0) return res;
    } catch (_) {}

    return {
      success: true,
      data: FALLBACK_BOOKS.slice(0, limit || 6),
    };
  },
};
