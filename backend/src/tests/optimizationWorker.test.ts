import { Types } from "mongoose";

// Mock all external dependencies before imports
jest.mock("../config/index", () => ({
  env: {
    PDF_OPTIMIZED_DIR: "/tmp/pdf-optimized-test",
    PDF_OPTIMIZATION_PROVIDER: "auto",
    PDF_OPTIMIZATION_CONCURRENCY: 1,
  },
}));

jest.mock("../repositories/OptimizationRepository", () => ({
  optimizationRepository: {
    findByStoragePath: jest.fn(),
    findById: jest.fn(),
    createJob: jest.fn(),
    markProcessing: jest.fn(),
    markDone: jest.fn(),
    markFailed: jest.fn(),
  },
}));

jest.mock("../repositories/StreamingRepository", () => ({
  streamingRepository: {
    markOptimized: jest.fn(),
    updateOptimizationStatus: jest.fn(),
  },
}));

import { PDFOptimizationService } from "../services/PDFOptimizationService";
import { optimizationRepository } from "../repositories/OptimizationRepository";

describe("PDFOptimizationService", () => {
  let svc: PDFOptimizationService;

  beforeEach(() => {
    svc = new PDFOptimizationService();
    jest.clearAllMocks();
  });

  describe("queueOptimization", () => {
    it("creates a new job when none exists", async () => {
      (optimizationRepository.findByStoragePath as jest.Mock).mockResolvedValue(null);
      (optimizationRepository.createJob as jest.Mock).mockResolvedValue({
        _id: new Types.ObjectId("507f1f77bcf86cd799439011"),
      });

      const result = await svc.queueOptimization(
        "507f1f77bcf86cd799439011",
        "/storage/test.pdf",
      );

      expect(result.skipped).toBe(false);
      expect(optimizationRepository.createJob).toHaveBeenCalledTimes(1);
    });

    it("skips if job already pending", async () => {
      (optimizationRepository.findByStoragePath as jest.Mock).mockResolvedValue({
        _id: new Types.ObjectId(),
        status: "pending",
      });

      const result = await svc.queueOptimization(
        "507f1f77bcf86cd799439011",
        "/storage/test.pdf",
      );

      expect(result.skipped).toBe(true);
      expect(optimizationRepository.createJob).not.toHaveBeenCalled();
    });

    it("skips if job already done", async () => {
      (optimizationRepository.findByStoragePath as jest.Mock).mockResolvedValue({
        _id: new Types.ObjectId(),
        status: "done",
      });

      const result = await svc.queueOptimization(
        "507f1f77bcf86cd799439011",
        "/storage/test.pdf",
      );

      expect(result.skipped).toBe(true);
    });
  });

  describe("processJob", () => {
    it("marks job failed when max attempts exceeded", async () => {
      const jobId = new Types.ObjectId().toString();
      (optimizationRepository.findById as jest.Mock).mockResolvedValue({
        _id: jobId,
        attempt: 3,
        maxAttempts: 3,
        storagePathId: new Types.ObjectId(),
        originalPath: "/storage/test.pdf",
      });

      await svc.processJob(jobId);

      expect(optimizationRepository.markFailed).toHaveBeenCalledWith(
        jobId,
        "Max attempts exceeded",
      );
    });

    it("marks job failed when no provider available", async () => {
      const jobId = new Types.ObjectId().toString();
      (optimizationRepository.findById as jest.Mock).mockResolvedValue({
        _id: jobId,
        attempt: 0,
        maxAttempts: 3,
        storagePathId: new Types.ObjectId(),
        originalPath: "/storage/test.pdf",
      });

      // Force no provider available
      jest.spyOn(svc, "detectAvailableProvider" as any).mockResolvedValue(null);

      await svc.processJob(jobId);

      expect(optimizationRepository.markFailed).toHaveBeenCalledWith(
        jobId,
        "No optimization provider available",
      );
    });
  });
});
