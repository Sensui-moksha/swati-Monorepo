import fs from "fs";
import { Types } from "mongoose";
import { streamingRepository } from "../repositories/StreamingRepository";

const LINEARIZED_MARKER = Buffer.from("/Linearized");

export class LinearizationService {
  /**
   * Read first 1024 bytes of the PDF and check for /Linearized dictionary.
   * Linearized PDFs contain this marker near the start of the file.
   */
  async detectLinearization(pdfPath: string): Promise<{
    isLinearized: boolean;
    pdfVersion: string | null;
  }> {
    const CHUNK_SIZE = 1024;
    const fd = await fs.promises.open(pdfPath, "r");
    try {
      const buffer = Buffer.alloc(CHUNK_SIZE);
      const { bytesRead } = await fd.read(buffer, 0, CHUNK_SIZE, 0);
      const header = buffer.slice(0, bytesRead);

      const isLinearized = header.indexOf(LINEARIZED_MARKER) !== -1;

      // Extract PDF version from header (%PDF-X.Y)
      const versionMatch = header.toString("ascii", 0, 10).match(/%PDF-(\d+\.\d+)/);
      const pdfVersion = versionMatch ? versionMatch[1] ?? null : null;

      return { isLinearized, pdfVersion };
    } finally {
      await fd.close();
    }
  }

  /**
   * Detect and persist linearization status for a StoragePath record.
   * Silently skips if the file is not accessible.
   */
  async detectAndSave(
    storagePathId: string | Types.ObjectId,
    pdfPath: string,
  ): Promise<{ isLinearized: boolean; pdfVersion: string | null }> {
    try {
      await fs.promises.access(pdfPath, fs.constants.R_OK);
    } catch {
      return { isLinearized: false, pdfVersion: null };
    }

    const result = await this.detectLinearization(pdfPath);
    await streamingRepository.markLinearized(
      storagePathId,
      result.isLinearized,
      result.pdfVersion ?? undefined,
    );
    return result;
  }

  /**
   * Batch: process multiple PDFs needing linearization check.
   * Called by the linearization worker.
   */
  async processBatch(limit = 100): Promise<{
    processed: number;
    linearized: number;
    nonLinearized: number;
    errors: number;
  }> {
    const records = await streamingRepository.findPDFsNeedingLinearizationCheck(limit);
    let linearized = 0;
    let nonLinearized = 0;
    let errors = 0;

    for (const record of records) {
      const pdfPath = record.metadata?.pdfPath;
      if (!pdfPath) { errors++; continue; }

      try {
        const result = await this.detectAndSave(record._id, pdfPath);
        if (result.isLinearized) linearized++;
        else nonLinearized++;
      } catch (err) {
        errors++;
        console.error(`[LinearizationService] Error processing ${pdfPath}:`, err);
      }
    }

    return { processed: records.length, linearized, nonLinearized, errors };
  }
}

export const linearizationService = new LinearizationService();
