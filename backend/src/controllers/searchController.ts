import { Request, Response } from 'express';
import { SearchService } from '../services/SearchService';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { logger } from '../utils/logger';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const searchQueue = new Queue('search-indexing', { connection });

export class SearchController {
  
  /**
   * Main search endpoint for full text and semantic search
   */
  static async search(req: Request, res: Response) {
    try {
      const { q, pub, issue, cat, year, author, searchAfter, size } = req.query;
      
      if (!q) {
        return res.status(400).json({ success: false, message: 'Query parameter q is required' });
      }

      const results = await SearchService.search({
        query: q as string,
        filters: {
          publicationId: pub as string,
          issueId: issue as string,
          category: cat as string,
          year: year ? parseInt(year as string, 10) : undefined,
          author: author as string
        },
        pagination: {
          searchAfter: searchAfter ? JSON.parse(searchAfter as string) : undefined,
          size: size ? parseInt(size as string, 10) : 20
        }
      });

      return res.status(200).json({ success: true, data: results });
    } catch (error: any) {
      logger.error('Search query failed', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Autocomplete suggestions endpoint
   */
  static async suggest(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string' || q.length < 2) {
        return res.status(200).json({ success: true, data: [] });
      }

      const suggestions = await SearchService.suggest(q);
      return res.status(200).json({ success: true, data: suggestions });
    } catch (error: any) {
      logger.error('Suggestion query failed', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Enqueue a reindex job for a publication
   */
  static async reindex(req: Request, res: Response) {
    try {
      const { publicationId, issueId } = req.body;
      
      if (!publicationId) {
        return res.status(400).json({ success: false, message: 'publicationId is required' });
      }

      await searchQueue.add('index', { action: 'reindex', publicationId, issueId });
      
      return res.status(202).json({ success: true, message: 'Reindex job queued successfully' });
    } catch (error: any) {
      logger.error('Failed to queue reindex job', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
