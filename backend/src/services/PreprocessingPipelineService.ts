import crypto from "crypto";
import fs from "fs";
import { streamingRepository } from "../repositories/StreamingRepository";
import { linearizationService } from "./LinearizationService";
import { pdfOptimizationService } from "./PDFOptimizationService";
import { hotCacheService } from "./HotCacheService";


export interface PreprocessingReport {
  scanned: number;
  linearized: number;
  nonLinearized: number;
  optimizationQueued: number;
  cacheWarmed: number;
  checksumUpdated: number;
  errors: number;
  durationMs: number;
  timestamp: Date;
}

/**
 * Background preprocessing pipeline — the architect-mandated addition.
 *
 * Run on a schedule (default: daily at 2am).
 * Processes the archive incrementally — a batch at a time — so it never
 * blocks user requests and can be interrupted safely.
 *
 * By the time a user opens a popular issue, it is already:
 *   - Linearized (fast web view)
 *   - Optimized (smaller, streamed faster)
 *   - Cached on SSD (lowest latency)
 */
export class PreprocessingPipelineService {
  async runBatch(batchSize = 100): Promise<PreprocessingReport> {
    const start = Date.now();
    const report: PreprocessingReport = {
      scanned: 0,
      linearized: 0,
      nonLinearized: 0,
      optimizationQueued: 0,
      cacheWarmed: 0,
      checksumUpdated: 0,
      errors: 0,
      durationMs: 0,
      timestamp: new Date(),
    };

    const records = await streamingRepository.findUnprocessedPDFs(batchSize);
    report.scanned = records.length;

    for (const record of records) {
      const pdfPath = record.metadata?.pdfPath;
      if (!pdfPath) { report.errors++; continue; }

      // 1. Access check
      try {
        await fs.promises.access(pdfPath, fs.constants.R_OK);
      } catch {
        report.errors++;
        continue;
      }

      // 2. Linearization detection
      try {
        const result = await linearizationService.detectAndSave(record._id, pdfPath);
        if (result.isLinearized) {
          report.linearized++;
        } else {
          report.nonLinearized++;
          // 3. Queue optimization if not linearized and no optimized copy yet
          if (!record.metadata?.optimizedPath) {
            await pdfOptimizationService.queueOptimization(record._id, pdfPath);
            report.optimizationQueued++;
          }
        }
      } catch (err) {
        report.errors++;
        console.error(`[PreprocessingPipeline] Linearization error ${pdfPath}:`, err);
      }

      // 4. SHA-256 checksum (only if missing)
      if (!record.metadata?.checksumSha256) {
        try {
          const checksum = await this.computeSha256(pdfPath);
          await streamingRepository.updateChecksumSha256(record._id, checksum);
          report.checksumUpdated++;
        } catch (err) {
          report.errors++;
          console.error(`[PreprocessingPipeline] Checksum error ${pdfPath}:`, err);
        }
      }
    }

    // 5. Warm SSD cache for most-accessed files
    try {
      const { warmed } = await hotCacheService.warmTopFiles(20);
      report.cacheWarmed = warmed;
    } catch (err) {
      console.error("[PreprocessingPipeline] Cache warm error:", err);
    }

    report.durationMs = Date.now() - start;
    console.log("[PreprocessingPipeline] Batch complete:", report);
    return report;
  }

  private computeSha256(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha256");
      const stream = fs.createReadStream(filePath);
      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", reject);
    });
  }
}

export const preprocessingPipelineService = new PreprocessingPipelineService();
