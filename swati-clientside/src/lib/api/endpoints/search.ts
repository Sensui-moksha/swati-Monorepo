import { apiClient } from "../client";
import { PUBLICATION_DOCUMENTS } from "../../documents";

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
   * Execute a full-text hybrid search with fallback to static documents
   */
  async search(
    query: string,
    filters?: SearchFilters,
    searchAfter?: any[],
  ): Promise<SearchResponse> {
    try {
      const params: Record<string, any> = { q: query };
      if (filters?.publicationId) params.pub = filters.publicationId;
      if (filters?.issueId) params.issue = filters.issueId;
      if (filters?.category) params.cat = filters.category;
      if (filters?.year) params.year = filters.year;
      if (filters?.author) params.author = filters.author;
      if (searchAfter) params.searchAfter = JSON.stringify(searchAfter);

      const res = await apiClient.get<{ success: boolean; data: SearchResponse }>("/search", {
        params,
      });
      if (res?.data?.results && res.data.results.length > 0) {
        return res.data;
      }
    } catch (_) {}

    const q = query.toLowerCase().trim();
    const matchingDocs = PUBLICATION_DOCUMENTS.filter(
      (doc) =>
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.type.toLowerCase().includes(q) ||
        (doc.author && doc.author.toLowerCase().includes(q)),
    );

    const results: SearchResult[] = matchingDocs.map((doc, idx) => ({
      id: doc.id,
      score: 1 - idx * 0.05,
      sortCursor: [idx],
      source: {
        publicationId: doc.slug || doc.id,
        issueId: doc.title,
        pageNumber: 1,
        ocrText: doc.description,
        wordCount: doc.description.split(" ").length,
      },
      highlights: [doc.title + " — " + doc.description],
    }));

    return {
      total: results.length,
      results,
      nextCursor: null,
    };
  },

  /**
   * Fetch autocomplete suggestions
   */
  async suggest(query: string): Promise<any[]> {
    if (!query || query.length < 2) return [];
    try {
      const { data } = await apiClient.get<{ success: boolean; data: any[] }>(
        "/search/suggestions",
        { params: { q: query } },
      );
      return data;
    } catch (_) {
      return [];
    }
  },
};
