import { apiClient } from '../client';

export interface SearchFilters {
  publicationId?: string;
  issueId?: string;
  category?: string;
  year?: number;
  author?: string;
}

export interface SearchResult {
  id: string;
  score: number;
  sortCursor: any[];
  source: {
    publicationId: string;
    issueId?: string;
    pageNumber: number;
    ocrText: string;
    wordCount: number;
  };
  highlights: string[];
}

export interface SearchResponse {
  total: number;
  results: SearchResult[];
  nextCursor: any[] | null;
}

export const searchApi = {
  /**
   * Execute a full-text hybrid search
   */
  async search(query: string, filters?: SearchFilters, searchAfter?: any[]): Promise<SearchResponse> {
    const params: Record<string, any> = { q: query };
    if (filters?.publicationId) params.pub = filters.publicationId;
    if (filters?.issueId) params.issue = filters.issueId;
    if (filters?.category) params.cat = filters.category;
    if (filters?.year) params.year = filters.year;
    if (filters?.author) params.author = filters.author;
    if (searchAfter) params.searchAfter = JSON.stringify(searchAfter);

    const { data } = await apiClient.get<{ success: boolean; data: SearchResponse }>('/search', { params });
    return data;
  },

  /**
   * Fetch autocomplete suggestions
   */
  async suggest(query: string): Promise<any[]> {
    if (!query || query.length < 2) return [];
    const { data } = await apiClient.get<{ success: boolean; data: any[] }>('/search/suggestions', { params: { q: query } });
    return data;
  }
};
