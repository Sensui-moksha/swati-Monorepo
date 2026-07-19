import { ReadingProgressService } from "../services/ReadingProgressService";
import { readingProgressRepository } from "../repositories/ReadingProgressRepository";
import { IReadingProgress } from "../models/ReadingProgress";
import { Types } from "mongoose";

jest.mock("../repositories/ReadingProgressRepository");

const mockReadingProgressRepository = readingProgressRepository as jest.Mocked<
  typeof readingProgressRepository
>;

describe("ReadingProgressService", () => {
  let service: ReadingProgressService;

  beforeEach(() => {
    service = new ReadingProgressService();
    jest.clearAllMocks();
  });

  it("calculates percentage safely when totalPages is missing", async () => {
    const mockProgress: Partial<IReadingProgress> = {
      _id: new Types.ObjectId(),
      user: new Types.ObjectId(),
      resourceId: new Types.ObjectId(),
      totalPages: undefined,
      currentPage: 0,
      timeSpent: 0,
      percentageRead: 0,
      isCompleted: false,
      sessionCount: 0,
    };

    mockReadingProgressRepository.findByUserAndResource.mockResolvedValue(
      mockProgress as IReadingProgress,
    );
    mockReadingProgressRepository.updateProgress.mockResolvedValue({
      ...mockProgress,
      currentPage: 1, // clamped to totalPages (default 1)
      percentageRead: 100, // 1/1 * 100
      timeSpent: 3,
    } as IReadingProgress);

    const progress = await service.updateProgress(
      new Types.ObjectId("507f1f77bcf86cd799439011"),
      new Types.ObjectId("507f1f77bcf86cd799439012"),
      4,
      3,
    );

    expect(progress).toBeDefined();
    expect(progress?.percentageRead).toBe(100); // totalPages defaults to 1, so 4 clamped to 1 = 100%
    expect(mockReadingProgressRepository.updateProgress).toHaveBeenCalledWith(
      expect.any(Types.ObjectId),
      expect.any(Types.ObjectId),
      expect.objectContaining({
        currentPage: 1,
        percentageRead: 100,
        timeSpent: 3,
      }),
    );
  });

  it("calculates percentage correctly when totalPages is provided", async () => {
    const mockProgress: Partial<IReadingProgress> = {
      _id: new Types.ObjectId(),
      user: new Types.ObjectId(),
      resourceId: new Types.ObjectId(),
      totalPages: 100,
      currentPage: 0,
      timeSpent: 0,
      percentageRead: 0,
      isCompleted: false,
      sessionCount: 0,
    };

    mockReadingProgressRepository.findByUserAndResource.mockResolvedValue(
      mockProgress as IReadingProgress,
    );
    mockReadingProgressRepository.updateProgress.mockResolvedValue({
      ...mockProgress,
      currentPage: 50,
      percentageRead: 50,
      timeSpent: 5,
    } as IReadingProgress);

    const progress = await service.updateProgress(
      new Types.ObjectId("507f1f77bcf86cd799439011"),
      new Types.ObjectId("507f1f77bcf86cd799439012"),
      50,
      5,
    );

    expect(progress).toBeDefined();
    expect(progress?.percentageRead).toBe(50);
  });

  it("clamps currentPage to valid range", async () => {
    const mockProgress: Partial<IReadingProgress> = {
      _id: new Types.ObjectId(),
      user: new Types.ObjectId(),
      resourceId: new Types.ObjectId(),
      totalPages: 100,
      currentPage: 0,
      timeSpent: 0,
      percentageRead: 0,
      isCompleted: false,
      sessionCount: 0,
    };

    mockReadingProgressRepository.findByUserAndResource.mockResolvedValue(
      mockProgress as IReadingProgress,
    );
    mockReadingProgressRepository.updateProgress.mockResolvedValue({
      ...mockProgress,
      currentPage: 100,
      percentageRead: 100,
      timeSpent: 5,
    } as IReadingProgress);

    // Test with currentPage > totalPages
    const progress = await service.updateProgress(
      new Types.ObjectId("507f1f77bcf86cd799439011"),
      new Types.ObjectId("507f1f77bcf86cd799439012"),
      150, // exceeds totalPages
      5,
    );

    expect(progress).toBeDefined();
    expect(progress?.currentPage).toBe(100); // Should be clamped to totalPages
    expect(progress?.percentageRead).toBe(100);
  });
});
