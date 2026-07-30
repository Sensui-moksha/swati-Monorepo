import { nlpService } from '../services/nlp/NlpService';
import { textRankService } from '../services/nlp/TextRankService';
import { publicationRepository } from '../repositories/PublicationRepository';
import { logger } from '../utils/logger';

export class MetadataWorker {
  /**
   * Processes a publication document to auto-generate keywords, tags, and summaries using NLP algorithms.
   */
  async processPublicationMetadata(publicationId: string, rawText: string) {
    try {
      logger.info(`Starting NLP Metadata Generation for publication ${publicationId}`);

      // 1. Language Detection
      const language = nlpService.detectLanguage(rawText);

      // 2. Keyword Extraction (TF-IDF)
      const topKeywords = nlpService.extractKeywords(rawText, 10);
      
      // 3. Extractive Summarization (TextRank)
      // Extract top 3 sentences for a short summary
      const shortSummary = textRankService.summarize(rawText, 3);
      
      // Extract top 7 sentences for a detailed summary
      const detailedSummary = textRankService.summarize(rawText, 7);

      // 4. Update the publication record
      await publicationRepository.updateById(publicationId, {
        language,
        tags: topKeywords,
        shortSummary,
        detailedSummary,
        nlpProcessedAt: new Date()
      });

      logger.info(`Completed NLP Metadata Generation for publication ${publicationId}`);
    } catch (error) {
      logger.error(`Failed to process metadata for ${publicationId}`, { error });
    }
  }
}

export const metadataWorker = new MetadataWorker();
