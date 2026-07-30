import { Client } from '@elastic/elasticsearch';
import { logger } from '../utils/logger';

// Optional: you can point this to your actual ES host or use an env var.
const esClient = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });

export interface SearchQuery {
  query: string;
  filters?: {
    publicationId?: string;
    issueId?: string;
    category?: string;
    year?: number;
    author?: string;
  };
  pagination?: {
    searchAfter?: any[]; // Cursor for pagination
    size?: number;
  };
}

export class SearchService {
  private static indexName = 'swathi_archive_pages';

  /**
   * Initializes the Elasticsearch index with appropriate mappings.
   */
  static async initializeIndex() {
    try {
      const indexExists = await esClient.indices.exists({ index: this.indexName });
      if (!indexExists) {
        await esClient.indices.create({
          index: this.indexName,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  edge_ngram_analyzer: {
                    tokenizer: 'edge_ngram_tokenizer',
                    filter: ['lowercase']
                  }
                },
                tokenizer: {
                  edge_ngram_tokenizer: {
                    type: 'edge_ngram',
                    min_gram: 2,
                    max_gram: 20,
                    token_chars: ['letter', 'digit']
                  }
                }
              }
            },
            mappings: {
              properties: {
                publicationId: { type: 'keyword' },
                issueId: { type: 'keyword' },
                bookId: { type: 'keyword' },
                pageNumber: { type: 'integer' },
                ocrText: {
                  type: 'text',
                  analyzer: 'edge_ngram_analyzer',
                  search_analyzer: 'standard',
                  term_vector: 'with_positions_offsets'
                },
                vectorEmbedding: {
                  type: 'dense_vector',
                  dims: 384, // Example for all-MiniLM-L6-v2
                  index: true,
                  similarity: 'cosine'
                },
                language: { type: 'keyword' },
                category: { type: 'keyword' },
                year: { type: 'integer' },
                author: { type: 'keyword' },
                wordCount: { type: 'integer' },
                checksum: { type: 'keyword' },
                lastIndexedDate: { type: 'date' }
              }
            }
          }
        } as any);
        logger.info(`Initialized Elasticsearch index: ${this.indexName}`);
      }
    } catch (error) {
      logger.error('Failed to initialize Elasticsearch index', error);
      throw error;
    }
  }

  /**
   * Executes a Full Text Search with optional filters and cursor pagination.
   */
  static async search(params: SearchQuery) {
    const { query, filters, pagination } = params;
    const size = pagination?.size || 20;

    const mustClauses: any[] = [];
    if (query) {
      mustClauses.push({
        multi_match: {
          query,
          fields: ['ocrText'],
          fuzziness: 'AUTO',
          operator: 'and'
        }
      });
    }

    const filterClauses: any[] = [];
    if (filters) {
      if (filters.publicationId) filterClauses.push({ term: { publicationId: filters.publicationId } });
      if (filters.issueId) filterClauses.push({ term: { issueId: filters.issueId } });
      if (filters.category) filterClauses.push({ term: { category: filters.category } });
      if (filters.year) filterClauses.push({ term: { year: filters.year } });
      if (filters.author) filterClauses.push({ term: { author: filters.author } });
    }

    const searchParams: any = {
      index: this.indexName,
      body: {
        query: {
          bool: {
            must: mustClauses,
            filter: filterClauses
          }
        },
        highlight: {
          fields: {
            ocrText: {
              fragment_size: 150,
              number_of_fragments: 3,
              pre_tags: ['<mark>'],
              post_tags: ['</mark>']
            }
          }
        },
        size,
        sort: [
          { _score: 'desc' },
          { pageNumber: 'asc' },
          { _id: 'asc' } // Tie-breaker for cursor pagination
        ]
      }
    };

    if (pagination?.searchAfter && pagination.searchAfter.length > 0) {
      searchParams.body.search_after = pagination.searchAfter;
    }

    try {
      const response = await esClient.search(searchParams as any);
      const hits = response.hits.hits;
      const total = typeof (response as any).hits.total === 'number' ? (response as any).hits.total : (response as any).hits.total?.value || 0;

      const results = hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        sortCursor: hit.sort,
        source: hit._source,
        highlights: hit.highlight?.ocrText || []
      }));

      return {
        total,
        results,
        nextCursor: results.length > 0 ? results[results.length - 1]?.sortCursor : null
      };
    } catch (error) {
      logger.error('Elasticsearch search failed', error);
      throw error;
    }
  }

  /**
   * Executes an autocomplete suggestion search.
   */
  static async suggest(prefix: string) {
    try {
      const response = await esClient.search({
        index: this.indexName,
        body: {
          query: {
            match_phrase_prefix: {
              ocrText: {
                query: prefix,
                max_expansions: 10
              }
            }
          },
          size: 5,
          _source: ['publicationId', 'issueId', 'pageNumber', 'ocrText']
        }
      } as any);
      return response.hits.hits.map((hit: any) => hit._source);
    } catch (error) {
      logger.error('Suggestion search failed', error);
      throw error;
    }
  }
}
