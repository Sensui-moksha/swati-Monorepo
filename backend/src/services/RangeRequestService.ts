import { ApiError } from "../middleware/errorHandler";

export interface ParsedRange {
  start: number;
  end: number;
  length: number;
}

/**
 * Parses HTTP Range header per RFC 7233.
 * Only the first range is used (multi-range simplified to single).
 * Returns null if no Range header present (caller sends 200).
 * Throws ApiError(416) on invalid range.
 */
export class RangeRequestService {
  parseRangeHeader(rangeHeader: string | undefined, fileSize: number): ParsedRange | null {
    if (!rangeHeader) return null;

    const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
    if (!match) {
      throw new ApiError("Invalid Range header format", 416);
    }

    const rawStart = match[1]!;
    const rawEnd = match[2]!;
    let start: number;
    let end: number;

    if (rawStart === "" && rawEnd !== "") {
      // Suffix range: bytes=-500 → last 500 bytes
      const suffixLength = parseInt(rawEnd, 10);
      if (suffixLength <= 0) throw new ApiError("Invalid suffix-length in Range header", 416);
      start = Math.max(0, fileSize - suffixLength);
      end = fileSize - 1;
    } else if (rawStart !== "" && rawEnd === "") {
      // Open-ended: bytes=1000-
      start = parseInt(rawStart, 10);
      end = fileSize - 1;
    } else {
      start = parseInt(rawStart, 10);
      end = parseInt(rawEnd, 10);
    }

    if (isNaN(start) || isNaN(end) || start < 0 || end < start || start >= fileSize) {
      throw new ApiError(
        `Range Not Satisfiable: requested ${start}-${end}, file size ${fileSize}`,
        416,
      );
    }

    // Clamp end to file boundary
    end = Math.min(end, fileSize - 1);

    return { start, end, length: end - start + 1 };
  }

  /**
   * Build response headers for a 206 Partial Content response.
   */
  buildPartialHeaders(
    range: ParsedRange,
    fileSize: number,
    mimeType = "application/pdf",
  ): Record<string, string | number> {
    return {
      "Content-Type": mimeType,
      "Content-Range": `bytes ${range.start}-${range.end}/${fileSize}`,
      "Content-Length": range.length,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache",
    };
  }

  /**
   * Build response headers for a full 200 response.
   */
  buildFullHeaders(
    fileSize: number,
    mimeType = "application/pdf",
  ): Record<string, string | number> {
    return {
      "Content-Type": mimeType,
      "Content-Length": fileSize,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-cache",
    };
  }

  /** Validate path — prevent directory traversal. */
  sanitizePath(inputPath: string): string {
    const normalized = inputPath.replace(/\\/g, "/");
    if (
      normalized.includes("../") ||
      normalized.includes("..\\") ||
      normalized.startsWith("/etc/") ||
      normalized.startsWith("/proc/") ||
      normalized.includes("\0")
    ) {
      throw new ApiError("Invalid file path", 400);
    }
    return normalized;
  }
}

export const rangeRequestService = new RangeRequestService();
