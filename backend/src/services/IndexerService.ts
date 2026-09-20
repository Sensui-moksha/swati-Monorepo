import { publicationService } from './publicationService';
import { logger } from '../utils/logger';
import { Client } from '@elastic/elasticsearch';
import fs from 'fs';
const pdfParse = require('pdf-parse');
import crypto from 'crypto';

const esClient = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });
const indexName = 'swathi_archive_pages';

export class IndexerService {
  /**
   * One-time production setup: ILM policy + index template.
   * Call at application startup. Idempotent.
   */
  static async ensureProductionSetup(): Promise<void> {
    try {
      // Create ILM policy for index lifecycle management
      await esClient.ilm.putLifecycle({
        name: 'swathi-ilm-policy',
        body: {
          policy: {
            phases: {
              hot: { min_age: '0ms', actions: { rollover: { max_size: '10gb', max_age: '30d' } } },
              warm: { min_age: '30d', actions: { shrink: { number_of_shards: 1 }, forcemerge: { max_num_segments: 1 } } },
              cold: { min_age: '90d', actions: { freeze: {} } },
              delete: { min_age: '365d', actions: { delete: {} } },
            },
          },
        },
      } as any);

      // Create index template
      await esClient.indices.putIndexTemplate({
        name: 'swathi-pages-template',
        body: {
          index_patterns: ['swathi_archive_pages*'],
          template: {
            settings: {
              number_of_shards: 2,
              number_of_replicas: 1,
              'index.lifecycle.name': 'swathi-ilm-policy',
              'index.refresh_interval': '5s', // production: 5s instead of 1s default
            },
          },
        },
      } as any);

      logger.info('[IndexerService] Production ILM policy and index template configured');
    } catch (err: any) {
      // Non-fatal — index will still work without ILM
      logger.warn(`[IndexerService] ILM setup skipped (ES may not support ILM): ${err.message}`);
    }
  }

  /**
   * Main entry point to index a publication. Called by the BullMQ worker.
   */
  static async indexPublication(publicationId: string, issueId?: string) {
    try {
      logger.info(`Starting indexing for publication ${publicationId}${issueId ? ` issue ${issueId}` : ''}`);
      
      const publication = await publicationService.getPublicationById(publicationId) as any;
      if (!publication) throw new Error('Publication not found');

      let fileUri = '';
      if (issueId && publication.issues) {
        const issue = publication.issues.find((i: any) => i._id.toString() === issueId);
        if (issue) fileUri = issue.fileUri;
      } else {
        fileUri = publication.fileUri;
      }

      if (!fileUri) throw new Error('File URI not found for indexing');

      // 1. Download/Access the file from Storage
      const resolvedPath = fileUri.startsWith('/') ? fileUri : `${process.env.STORAGE_ROOT || '/var/data/swathi'}/${fileUri}`;
      const fileBuffer = fs.readFileSync(resolvedPath);
      
      // 2. Parse PDF and extract OCR text per page
      const pageTexts = await this.extractTextPerPage(fileBuffer);
      
      // 3. Bulk insert to Elasticsearch (non-blocking refresh for production throughput)
      const bulkOps: any[] = [];
      const timestamp = new Date().toISOString();

      pageTexts.forEach((pageText, idx) => {
        const pageNum = idx + 1;
        const checksum = crypto.createHash('md5').update(pageText).digest('hex');
        
        bulkOps.push({ index: { _index: indexName, _id: `${publicationId}_${issueId || 'main'}_p${pageNum}` } });
        bulkOps.push({
          publicationId,
          issueId: issueId || null,
          bookId: publication.type === 'book' ? publicationId : null,
          pageNumber: pageNum,
          ocrText: pageText,
          language: publication.language || 'telugu',
          category: publication.category || null,
          year: publication.publishDate ? new Date(publication.publishDate).getFullYear() : null,
          author: publication.author || null,
          wordCount: pageText.split(/\s+/).length,
          checksum,
          lastIndexedDate: timestamp
        });
      });

      if (bulkOps.length > 0) {
        const bulkResponse = await esClient.bulk({ refresh: false, operations: bulkOps } as any);
        if (bulkResponse.errors) {
          logger.error('Bulk indexing errors encountered', bulkResponse.items);
        }
      }
      
      logger.info(`Successfully indexed ${pageTexts.length} pages for publication ${publicationId}`);
    } catch (error) {
      logger.error(`Error indexing publication ${publicationId}`, error);
      throw error;
    }
  }

  /**
   * Helper to extract text per page using pdf-parse.
   * This uses the custom pagerender callback to split pages.
   */
  private static async extractTextPerPage(dataBuffer: Buffer): Promise<string[]> {
    const pages: string[] = [];
    
    const render_page = function(pageData: any) {
      const render_options = { normalizeWhitespace: false, disableCombineTextItems: false };
      return pageData.getTextContent(render_options).then(function(textContent: any) {
        let lastY, text = '';
        for (const item of textContent.items) {
          if (lastY == item.transform[5] || !lastY){
            text += item.str;
          } else {
            text += '\n' + item.str;
          }
          lastY = item.transform[5];
        }
        pages.push(text);
        return text;
      });
    };

    await pdfParse(dataBuffer, { pagerender: render_page });
    return pages;
  }
}
