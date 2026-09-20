import fs from "fs";
import crypto from "crypto";
import { StoragePath, IStoragePath } from "../models/StoragePath";
import { LinearizationService } from "../services/LinearizationService";
import { RangeRequestService } from "../services/RangeRequestService";
import { logger } from "../utils/logger";

export interface PDFHealthReportItem {
  id: string;
  path: string;
  fileSize: number;
  httpRangeSupported: boolean;
  isLinearized: boolean;
  pdfVersion: string | null;
  checksumMatches: boolean;
  computedChecksum: string;
  integrityValid: boolean;
  errors: string[];
}

export interface StreamingHealthSummary {
  scannedCount: number;
  validCount: number;
  issueCount: number;
  linearizedCount: number;
  rangeCompliantCount: number;
  items: PDFHealthReportItem[];
}

export class StreamingValidationWorker {
  private linearizationService: LinearizationService;
  private rangeService: RangeRequestService;

  constructor() {
    this.linearizationService = new LinearizationService();
    this.rangeService = new RangeRequestService();
  }

  /**
   * Validates an individual PDF document across all streaming criteria
   */
  public async validatePDF(storageRecord: IStoragePath): Promise<PDFHealthReportItem> {
    const reportItem: PDFHealthReportItem = {
      id: storageRecord._id.toString(),
      path: storageRecord.path,
      fileSize: 0,
      httpRangeSupported: false,
      isLinearized: false,
      pdfVersion: null,
      checksumMatches: false,
      computedChecksum: "",
      integrityValid: false,
      errors: [],
    };

    try {
      if (!fs.existsSync(storageRecord.path)) {
        reportItem.errors.push("File not found on storage mount");
        return reportItem;
      }

      const stat = await fs.promises.stat(storageRecord.path);
      reportItem.fileSize = stat.size;

      // 1. HTTP Range Request Simulation (read first 1024 bytes and tail bytes)
      try {
        const testRange = this.rangeService.parseRangeHeader("bytes=0-1023", stat.size);
        if (testRange && testRange.length === 1024) {
          reportItem.httpRangeSupported = true;
        }
      } catch (rangeErr: any) {
        reportItem.errors.push(`HTTP Range calculation failed: ${rangeErr.message}`);
      }

      // 2. Linearization Status
      try {
        const linResult = await this.linearizationService.detectLinearization(storageRecord.path);
        reportItem.isLinearized = linResult.isLinearized;
        reportItem.pdfVersion = linResult.pdfVersion;
      } catch (linErr: any) {
        reportItem.errors.push(`Linearization inspection failed: ${linErr.message}`);
      }

      // 3. Checksum & File Integrity Verification
      try {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(storageRecord.path);
        let firstChunk: Buffer | null = null;
        let lastChunk: Buffer | null = null;

        await new Promise<void>((resolve, reject) => {
          stream.on("data", (chunk: any) => {
            if (!firstChunk) firstChunk = chunk;
            lastChunk = chunk;
            hash.update(chunk);
          });
          stream.on("end", resolve);
          stream.on("error", reject);
        });

        reportItem.computedChecksum = hash.digest("hex");

        // Magic bytes check: Must start with %PDF- and end with %%EOF
        const headerMagic = firstChunk ? (firstChunk as Buffer).toString("ascii", 0, 5) : "";
        const tailString = lastChunk ? (lastChunk as Buffer).toString("ascii") : "";
        const hasPdfMagic = headerMagic.startsWith("%PDF");
        const hasEof = tailString.includes("%%EOF");

        reportItem.integrityValid = hasPdfMagic && hasEof;
        if (!hasPdfMagic) reportItem.errors.push("Missing valid %PDF magic header");
        if (!hasEof) reportItem.errors.push("Missing %%EOF trailer marker");

        // Checksum matching
        const storedChecksum = storageRecord.metadata?.checksumSha256 || storageRecord.checksum;
        if (storedChecksum) {
          reportItem.checksumMatches = storedChecksum.toLowerCase() === reportItem.computedChecksum.toLowerCase();
          if (!reportItem.checksumMatches) {
            reportItem.errors.push("Checksum mismatch against stored metadata");
          }
        } else {
          // If unpopulated, set matching to true and update record
          reportItem.checksumMatches = true;
        }

        // 4. Update metadata in database
        await StoragePath.updateOne(
          { _id: storageRecord._id },
          {
            $set: {
              "metadata.isLinearized": reportItem.isLinearized,
              "metadata.checksumSha256": reportItem.computedChecksum,
              "metadata.streamingEnabled": reportItem.httpRangeSupported && reportItem.integrityValid,
              "metadata.pdfVersion": reportItem.pdfVersion || undefined,
            },
          }
        );
      } catch (hashErr: any) {
        reportItem.errors.push(`Checksum verification error: ${hashErr.message}`);
      }
    } catch (err: any) {
      reportItem.errors.push(`Unexpected error: ${err.message}`);
    }

    return reportItem;
  }

  /**
   * Run batch validation across all active documents
   */
  public async runValidation(): Promise<StreamingHealthSummary> {
    logger.info("[StreamingValidationWorker] Starting streaming verification audit...");

    const query = {
      isDeleted: false,
      $or: [{ path: /\.pdf$/i }, { type: { $in: ["weekly", "monthly", "books"] } }],
    };

    const documents = await StoragePath.find(query).limit(100);
    const summary: StreamingHealthSummary = {
      scannedCount: documents.length,
      validCount: 0,
      issueCount: 0,
      linearizedCount: 0,
      rangeCompliantCount: 0,
      items: [],
    };

    for (const doc of documents) {
      const item = await this.validatePDF(doc);
      summary.items.push(item);

      if (item.isLinearized) summary.linearizedCount++;
      if (item.httpRangeSupported) summary.rangeCompliantCount++;

      if (item.integrityValid && item.httpRangeSupported && item.errors.length === 0) {
        summary.validCount++;
      } else {
        summary.issueCount++;
      }
    }

    logger.info(
      `[StreamingValidationWorker] Audit complete: ${summary.scannedCount} PDFs scanned, ` +
        `${summary.validCount} fully healthy, ${summary.linearizedCount} linearized, ${summary.issueCount} flagged.`
    );

    return summary;
  }
}

export const streamingValidationWorker = new StreamingValidationWorker();
