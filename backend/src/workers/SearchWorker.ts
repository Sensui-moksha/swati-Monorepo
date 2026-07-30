import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { IndexerService } from '../services/IndexerService';
import { logger } from '../utils/logger';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

export interface SearchIndexJobData {
  action: 'index' | 'reindex' | 'cleanup';
  publicationId: string;
  issueId?: string;
}

export const searchWorker = new Worker<SearchIndexJobData>(
  'search-indexing',
  async (job: Job) => {
    logger.info(`Processing search indexing job ${job.id} for action ${job.data.action}`);
    
    switch (job.data.action) {
      case 'index':
      case 'reindex':
        await IndexerService.indexPublication(job.data.publicationId, job.data.issueId);
        break;
      case 'cleanup':
        // Handle index cleanup for deleted publications
        break;
      default:
        throw new Error(`Unknown action ${job.data.action}`);
    }
  },
  {
    connection,
    concurrency: 5, // Process up to 5 PDFs concurrently
  }
);

searchWorker.on('completed', (job) => {
  logger.info(`Search indexing job ${job.id} has completed!`);
});

searchWorker.on('failed', (job, err) => {
  logger.error(`Search indexing job ${job?.id} has failed with ${err.message}`);
});
