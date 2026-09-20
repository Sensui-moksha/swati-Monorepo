import { RangeRequestService } from "../services/RangeRequestService";
import { LinearizationService } from "../services/LinearizationService";
import { HotCacheService } from "../services/HotCacheService";
import fs from "fs";
import path from "path";
import os from "os";

describe("Phase 5: PDF Reader Streaming, Byte-Range & Linearization Testing", () => {
  const rangeService = new RangeRequestService();
  const linearizationService = new LinearizationService();
  let tempDir: string;
  let samplePdfPath: string;

  beforeAll(async () => {
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "pdf-test-"));
    samplePdfPath = path.join(tempDir, "sample-linearized.pdf");

    // Construct a synthetic PDF with /Linearized dictionary
    const pdfHeader = Buffer.from(
      "%PDF-1.7\n%\n1 0 obj\n<< /Linearized 1 /L 256000 /H [ 800 200 ] /O 4 /E 250000 /N 12 /T 255500 >>\nendobj\n"
    );
    const pdfBody = Buffer.alloc(2048, 65); // dummy padding
    const pdfTrailer = Buffer.from("\nstartxref\n1234\n%%EOF\n");
    await fs.promises.writeFile(samplePdfPath, Buffer.concat([pdfHeader, pdfBody, pdfTrailer]));
  });

  afterAll(async () => {
    await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  });

  describe("Byte-Range Streaming Protocol", () => {
    const FILE_SIZE = 50 * 1024 * 1024; // 50MB PDF

    it("should parse initial 64KB chunk request for fast PDF.js page 1 render", () => {
      const parsed = rangeService.parseRangeHeader("bytes=0-65535", FILE_SIZE);
      expect(parsed).toEqual({
        start: 0,
        end: 65535,
        length: 65536,
      });
    });

    it("should construct compliant HTTP 206 Partial Content headers", () => {
      const range = { start: 0, end: 65535, length: 65536 };
      const headers = rangeService.buildPartialHeaders(range, FILE_SIZE);

      expect(headers["Content-Range"]).toBe(`bytes 0-65535/${FILE_SIZE}`);
      expect(headers["Content-Length"]).toBe(65536);
      expect(headers["Accept-Ranges"]).toBe("bytes");
    });

    it("should reject unsatisfiable ranges (start >= fileSize) with 416 error", () => {
      expect(() => {
        rangeService.parseRangeHeader(`bytes=${FILE_SIZE + 100}-${FILE_SIZE + 200}`, FILE_SIZE);
      }).toThrow();
    });
  });

  describe("PDF Linearization (Fast Web View) Detection", () => {
    it("should detect linearized status and extract PDF version from file header", async () => {
      const result = await linearizationService.detectLinearization(samplePdfPath);
      expect(result.isLinearized).toBe(true);
      expect(result.pdfVersion).toBe("1.7");
    });

    it("should identify non-linearized standard PDFs accurately", async () => {
      const standardPdfPath = path.join(tempDir, "standard.pdf");
      await fs.promises.writeFile(
        standardPdfPath,
        Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF")
      );

      const result = await linearizationService.detectLinearization(standardPdfPath);
      expect(result.isLinearized).toBe(false);
      expect(result.pdfVersion).toBe("1.4");
    });
  });
});
