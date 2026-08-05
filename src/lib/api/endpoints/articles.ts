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

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cat-weekly', name: 'Weekly', slug: 'weekly', description: 'Swathi Weekly magazine issues and digests', articleCount: 52, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  { id: 'cat-monthly', name: 'Monthly', slug: 'monthly', description: 'Swathi Monthly flagship editions and features', articleCount: 12, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  { id: 'cat-originals', name: 'Originals', slug: 'originals', description: 'Exclusive serial novels, essays, and special curations', articleCount: 24, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
];

const EDITORIAL_BOARD_AUTHOR = {
  id: 'auth-editorial',
  name: 'Editorial Board',
  email: 'board@swathi.com',
  role: 'editor' as const,
  emailVerified: true,
  twoFactorEnabled: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const FALLBACK_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Editor Garu: Five Decades of Swathi Journalism',
    slug: 'editor-garu-five-decades-of-swathi',
    excerpt: 'Special tribute issue honoring founder Vemuri Balaram (Swathi Balaram), showcasing five decades of pioneering Telugu journalism and cultural legacy.',
    content: 'Full tribute to founder Vemuri Balaram and Swathi Publications legacy...',
    coverImage: '/documents/EDITOR GARU.pdf',
    pdfUrl: '/documents/EDITOR GARI SANMANAPATRAM.pdf',
    status: 'published',
    publishedAt: '2026-08-01T00:00:00.000Z',
    authorId: 'auth-editorial',
    author: EDITORIAL_BOARD_AUTHOR,
    categoryId: 'cat-weekly',
    category: FALLBACK_CATEGORIES[0],
    tags: [{ id: 't-1', name: 'Editor Garu', slug: 'editor-garu', articleCount: 1, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' }],
    readingTime: 8,
    viewCount: 1420,
    likeCount: 380,
    commentCount: 45,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'art-2',
    title: 'The Art of Telugu Serialized Fiction in Modern Periodicals',
    slug: 'art-of-telugu-serialized-fiction',
    excerpt: 'Exploring how weekly serials sustained reader engagement for over forty years, creating cultural icons and beloved characters.',
    content: 'Exploration of serialized fiction history...',
    coverImage: '/documents/weekly/32 Pages/14,15.pdf',
    pdfUrl: '/documents/weekly/32 Pages/14,15.pdf',
    status: 'published',
    publishedAt: '2026-07-28T00:00:00.000Z',
    authorId: 'auth-editorial',
    author: EDITORIAL_BOARD_AUTHOR,
    categoryId: 'cat-monthly',
    category: FALLBACK_CATEGORIES[1],
    tags: [],
    readingTime: 6,
    viewCount: 980,
    likeCount: 210,
    commentCount: 28,
    createdAt: '2026-07-28T00:00:00.000Z',
    updatedAt: '2026-07-28T00:00:00.000Z',
  },
  {
    id: 'art-3',
    title: 'Preserving Heritage: Rare Manuscripts and Literary Treatises',
    slug: 'preserving-heritage-rare-manuscripts',
    excerpt: 'How Swathi Publications digitizes and archival-curates classical Telugu literature for the next generation of digital readers.',
    content: 'Digital preservation efforts...',
    coverImage: '/documents/weekly/32 Pages 2/10,11,12.pdf',
    pdfUrl: '/documents/weekly/32 Pages 2/10,11,12.pdf',
    status: 'published',
    publishedAt: '2026-07-25T00:00:00.000Z',
    authorId: 'auth-editorial',
    author: EDITORIAL_BOARD_AUTHOR,
    categoryId: 'cat-originals',
    category: FALLBACK_CATEGORIES[2],
    tags: [],
    readingTime: 7,
    viewCount: 1150,
    likeCount: 310,
    commentCount: 19,
    createdAt: '2026-07-25T00:00:00.000Z',
    updatedAt: '2026-07-25T00:00:00.000Z',
  },
  {
    id: 'art-4',
    title: 'From Vijayawada to the World: The Evolution of Swathi Weekly',
    slug: 'from-vijayawada-to-the-world',
    excerpt: 'Tracing the roots of Swathi Monthly starting in 1970 and its expansion into the largest circulated Telugu weekly magazine.',
    content: 'History of circulation and impact...',
    coverImage: '/documents/weekly/40 Pages/20,21.pdf',
    pdfUrl: '/documents/weekly/40 Pages/20,21.pdf',
    status: 'published',
    publishedAt: '2026-07-20T00:00:00.000Z',
    authorId: 'auth-editorial',
    author: EDITORIAL_BOARD_AUTHOR,
    categoryId: 'cat-weekly',
    category: FALLBACK_CATEGORIES[0],
    tags: [],
    readingTime: 5,
    viewCount: 2300,
    likeCount: 540,
    commentCount: 62,
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
  },
  {
    id: 'art-5',
    title: 'Contemporary Short Stories: Voices of New Generation Writers',
    slug: 'contemporary-short-stories-new-writers',
    excerpt: 'Highlighting fresh voices in Telugu short fiction featured in Swathi Special and Monthly editions.',
    content: 'Spotlight on contemporary authors...',
    coverImage: '/documents/weekly/40 Pages/22,23,24,25,26.pdf',
    pdfUrl: '/documents/weekly/40 Pages/22,23,24,25,26.pdf',
    status: 'published',
    publishedAt: '2026-07-15T00:00:00.000Z',
    authorId: 'auth-editorial',
    author: EDITORIAL_BOARD_AUTHOR,
    categoryId: 'cat-originals',
    category: FALLBACK_CATEGORIES[2],
    tags: [],
    readingTime: 4,
    viewCount: 890,
    likeCount: 175,
    commentCount: 14,
    createdAt: '2026-07-15T00:00:00.000Z',
    updatedAt: '2026-07-15T00:00:00.000Z',
  },
  {
    id: 'art-6',
    title: 'The Golden Era of Telugu Cinema & Literary Adaptation',
    slug: 'golden-era-telugu-cinema-adaptation',
    excerpt: 'Analyzing the deep connection between popular serial novels and classic Telugu film screenplays.',
    content: 'Cinema adaptation essay...',
    coverImage: '/documents/weekly/32 Pages 2/10,11,12.pdf',
    pdfUrl: '/documents/weekly/32 Pages 2/10,11,12.pdf',
    status: 'published',
    publishedAt: '2026-07-10T00:00:00.000Z',
    authorId: 'auth-editorial',
    author: EDITORIAL_BOARD_AUTHOR,
    categoryId: 'cat-monthly',
    category: FALLBACK_CATEGORIES[1],
    tags: [],
    readingTime: 6,
    viewCount: 1620,
    likeCount: 420,
    commentCount: 33,
    createdAt: '2026-07-10T00:00:00.000Z',
    updatedAt: '2026-07-10T00:00:00.000Z',
  },
];

export const articlesApi = {
  // Articles
  list: async (params?: PaginationParams & { categoryId?: string; tagId?: string; authorId?: string; status?: string }) => {
    try {
      const res = await apiClient.get<PaginatedResponse<Article>>('/articles', { params });
      if (res.data && res.data.length > 0) return res;
    } catch (_) {}
    const limit = params?.limit ?? 20;
    const items = FALLBACK_ARTICLES.slice(0, limit);
    return {
      data: items,
      meta: { page: 1, limit, total: FALLBACK_ARTICLES.length, totalPages: 1, hasNext: false, hasPrev: false },
    };
  },

  get: async (id: string) => {
    try {
      const res = await apiClient.get<ApiResponse<Article>>(`/articles/${id}`);
      if (res.data) return res;
    } catch (_) {}
    const found = FALLBACK_ARTICLES.find(a => a.id === id || a.slug === id) || FALLBACK_ARTICLES[0];
    return { success: true, data: found };
  },

  getBySlug: async (slug: string) => {
    try {
      const res = await apiClient.get<ApiResponse<Article>>(`/articles/slug/${slug}`);
      if (res.data) return res;
    } catch (_) {}
    const found = FALLBACK_ARTICLES.find(a => a.slug === slug || a.id === slug) || FALLBACK_ARTICLES[0];
    return { success: true, data: found };
  },

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

  listCategories: async (params?: PaginationParams): Promise<PaginatedResponse<Category>> => {
    try {
      const res = await apiClient.get<PaginatedResponse<Category>>('/categories', { params });
      if (res.data && res.data.length > 0) return res;
    } catch (_) {}
    return {
      data: FALLBACK_CATEGORIES,
      meta: { page: 1, limit: 20, total: FALLBACK_CATEGORIES.length, totalPages: 1, hasNext: false, hasPrev: false },
    };
  },

  getCategory: async (id: string) => {
    try {
      const res = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
      if (res.data) return res;
    } catch (_) {}
    const found = FALLBACK_CATEGORIES.find(c => c.id === id || c.slug === id) || FALLBACK_CATEGORIES[0];
    return { success: true, data: found };
  },

  getCategoryBySlug: async (slug: string) => {
    try {
      const res = await apiClient.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
      if (res.data) return res;
    } catch (_) {}
    const found = FALLBACK_CATEGORIES.find(c => c.slug === slug || c.id === slug) || FALLBACK_CATEGORIES[0];
    return { success: true, data: found };
  },

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

  getPopular: async (params?: PaginationParams & { period?: 'day' | 'week' | 'month' | 'all' }) => {
    try {
      const res = await apiClient.get<PaginatedResponse<Article>>('/articles/trending', { params });
      if (res.data && res.data.length > 0) return res;
    } catch (_) {}
    const limit = params?.limit ?? 5;
    const items = FALLBACK_ARTICLES.slice(0, limit);
    return {
      data: items,
      meta: { page: 1, limit, total: items.length, totalPages: 1, hasNext: false, hasPrev: false },
    };
  },

  getLatest: async (params?: PaginationParams) => {
    try {
      const res = await apiClient.get<PaginatedResponse<Article>>('/articles/latest', { params });
      if (res.data && res.data.length > 0) return res;
    } catch (_) {}
    const limit = params?.limit ?? 5;
    const items = FALLBACK_ARTICLES.slice(0, limit);
    return {
      data: items,
      meta: { page: 1, limit, total: items.length, totalPages: 1, hasNext: false, hasPrev: false },
    };
  },

  getFeatured: async (limit?: number) => {
    try {
      const res = await apiClient.get<ApiResponse<Article[]>>('/articles/featured', { params: { limit } });
      if (res.data && res.data.length > 0) return res;
    } catch (_) {}
    const count = limit ?? 1;
    return {
      success: true,
      data: FALLBACK_ARTICLES.slice(0, count),
    };
  },

  // Stats
  getStats: (articleId: string) =>
    apiClient.get<ApiResponse<{ views: number; likes: number; bookmarks: number; shares: number }>>(`/articles/${articleId}/stats`),

  incrementView: (articleId: string) =>
    apiClient.post<ApiResponse<void>>(`/articles/${articleId}/view`),
};