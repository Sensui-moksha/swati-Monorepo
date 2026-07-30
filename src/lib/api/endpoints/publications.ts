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

};