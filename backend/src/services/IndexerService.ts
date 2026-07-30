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
      // Assuming fileUri is an absolute path or relative to a known storage root.
      // For this prototype, we'll assume it's accessible via fs.readFileSync
      const resolvedPath = fileUri.startsWith('/') ? fileUri : `${process.env.STORAGE_ROOT || '/var/data/swathi'}/${fileUri}`;
      const fileBuffer = fs.readFileSync(resolvedPath);
      
      // 2. Parse PDF and extract OCR text per page
      // In a production enterprise system, we would parse page by page.
      // pdf-parse provides the text, but mapping it exactly to pages requires custom pagerender.
      const pageTexts = await this.extractTextPerPage(fileBuffer);
      
      // 3. Bulk insert to Elasticsearch
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
        const bulkResponse = await esClient.bulk({ refresh: true, operations: bulkOps } as any);
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
