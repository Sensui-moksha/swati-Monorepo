import cron from 'node-cron';
import { readingHistoryRepository } from '../repositories/ReadingHistoryRepository';
import { logger } from '../utils/logger';

export class RecommendationWorker {
  
  /**
   * Initializes the nightly cron job to recalculate the Collaborative Filtering Matrix.
   */
  public startJobs() {
    // Run at 3:00 AM every day
    cron.schedule('0 3 * * *', () => this.calculateCollaborativeFiltering());
    logger.info('Recommendation Worker initialized and scheduled CRON jobs.');
  }

  /**
   * Generates a basic item-item collaborative filtering matrix based on User reading histories.
   * "Users who read X also read Y".
   * Results would normally be cached in Redis. For this prototype, we just calculate the co-occurrences.
   */
  private async calculateCollaborativeFiltering() {
    try {
      logger.info('Starting nightly collaborative filtering matrix calculation...');
      
      // 1. Fetch all reading histories (in a real system, you'd batch this or use a graph database / Spark job)
      const histories = await readingHistoryRepository.findWithPagination({}, { page: 1, limit: 10000 });
      
      // 2. Group by user to find co-occurrences
      const userReads: Record<string, Set<string>> = {};
      histories.data.forEach(history => {
        const userId = String(history.user);
        const resourceId = String(history.resourceId);
        
        if (!userReads[userId]) {
          userReads[userId] = new Set();
        }
        userReads[userId].add(resourceId);
      });

      // 3. Build co-occurrence matrix
      const matrix: Record<string, Record<string, number>> = {};
      
      Object.values(userReads).forEach(resourceSet => {
        const resources = Array.from(resourceSet);
        for (let i = 0; i < resources.length; i++) {
          for (let j = 0; j < resources.length; j++) {
            if (i === j) continue;
            const resA = resources[i];
            const resB = resources[j];
            if (!resA || !resB) continue;
            
            let row = matrix[resA];
            if (!row) {
              row = {};
              matrix[resA] = row;
            }
            if (!row[resB]) row[resB] = 0;
            
            row[resB] += 1;
          }
        }
      });

      // 4. In production, serialize `matrix` and save it to Redis under `recommendations:item_matrix`
      // await redisClient.set('recommendations:item_matrix', JSON.stringify(matrix));

      logger.info('Nightly collaborative filtering calculation complete.');
    } catch (error) {
      logger.error('Failed to calculate collaborative filtering matrix', { error });
    }
  }
}

export const recommendationWorker = new RecommendationWorker();
