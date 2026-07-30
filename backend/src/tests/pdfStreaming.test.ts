import { Types } from "mongoose";

jest.mock("../config/index", () => ({
  env: {
    PDF_SSD_CACHE_DIR: "/tmp/pdf-stream-test-cache",
    PDF_CACHE_MAX_SIZE_GB: 1,
    PDF_CACHE_TTL_HOURS: 1,
    PDF_HOT_FILE_THRESHOLD: 10,
    PDF_OPTIMIZATION_PROVIDER: "auto",
    PDF_OPTIMIZATION_CONCURRENCY: 1,
    PDF_OPTIMIZED_DIR: "/tmp/pdf-stream-test-optimized",
  },
}));

jest.mock("../repositories/StreamingRepository", () => ({
  streamingRepository: {
    findPDFById: jest.fn(),
    incrementStreamCount: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../repositories/CacheRepository", () => ({
  cacheRepository: {
    recordStreamEvent: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../services/HotCacheService", () => ({
  hotCacheService: {
    isCached: jest.fn().mockResolvedValue({ cached: false, cachePath: null }),
  },
}));

jest.mock("../services/StorageService", () => ({
  storageService: {
    streamFile: jest.fn(),
  },
}));

import { PDFStreamingService } from "../services/PDFStreamingService";
import { streamingRepository } from "../repositories/StreamingRepository";
import { Response } from "express";


function mockResponse(): Partial<Response> {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    on: jest.fn((event: string, cb: Function) => {
      if (event === "finish") setTimeout(() => cb(), 0);
      return res;
    }),
    emit: jest.fn(),
  };
  res.pipe = jest.fn();
  return res;
}

describe("PDFStreamingService", () => {
  let svc: PDFStreamingService;
  const FAKE_ID = new Types.ObjectId().toString();
  const FAKE_PDF_PATH = "/storage/weekly/issue.pdf";
  const FILE_SIZE = 30 * 1024 * 1024; // 30MB

  beforeEach(() => {
    svc = new PDFStreamingService();
    jest.clearAllMocks();
  });

  it("throws 404 when PDF record not found", async () => {
    (streamingRepository.findPDFById as jest.Mock).mockResolvedValue(null);
    const res = mockResponse() as Response;
    await expect(svc.streamPDF(FAKE_ID, undefined, res)).rejects.toThrow("PDF not found");
  });

  it("throws 404 when PDF has no pdfPath", async () => {
    (streamingRepository.findPDFById as jest.Mock).mockResolvedValue({
      _id: new Types.ObjectId(FAKE_ID),
      metadata: {},
    });
    const res = mockResponse() as Response;
    await expect(svc.streamPDF(FAKE_ID, undefined, res)).rejects.toThrow(
      "PDF path not configured",
    );
  });

  it("throws 403 when streaming is disabled", async () => {
    (streamingRepository.findPDFById as jest.Mock).mockResolvedValue({
      _id: new Types.ObjectId(FAKE_ID),
      metadata: { pdfPath: FAKE_PDF_PATH, streamingEnabled: false, fileSize: FILE_SIZE },
    });
    const res = mockResponse() as Response;
    await expect(svc.streamPDF(FAKE_ID, undefined, res)).rejects.toThrow(
      "Streaming disabled",
    );
  });

  it("throws 416 on invalid range header", async () => {
    (streamingRepository.findPDFById as jest.Mock).mockResolvedValue({
      _id: new Types.ObjectId(FAKE_ID),
      metadata: { pdfPath: FAKE_PDF_PATH, fileSize: FILE_SIZE, streamingEnabled: true },
    });
    const res = mockResponse() as Response;
    await expect(
      svc.streamPDF(FAKE_ID, "bytes=invalid", res),
    ).rejects.toThrow();
  });

  it("blocks directory traversal in pdfPath", async () => {
    (streamingRepository.findPDFById as jest.Mock).mockResolvedValue({
      _id: new Types.ObjectId(FAKE_ID),
      metadata: { pdfPath: "../../../etc/passwd", fileSize: FILE_SIZE, streamingEnabled: true },
    });
    const res = mockResponse() as Response;
    await expect(svc.streamPDF(FAKE_ID, undefined, res)).rejects.toThrow();
  });
});
