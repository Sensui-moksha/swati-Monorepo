import { Types } from "mongoose";
import { ApiError } from "../middleware/errorHandler";
import { readingHistoryRepository } from "../repositories/ReadingHistoryRepository";
import { IReadingHistory } from "../models/ReadingHistory";

export class ReadingHistoryService {
  async recordReading(
    userId: Types.ObjectId,
    data: Partial<IReadingHistory>,
  ): Promise<IReadingHistory> {
    if (!data.resourceId) {
      throw new ApiError(400, "resourceId is required");
    }

    return readingHistoryRepository.addOrUpdate({ ...data, user: userId });
  }

  async getHistory(userId: Types.ObjectId, page = 1, limit = 20) {
    return readingHistoryRepository.findByUser(userId, { page, limit });
  }

  async getRecentlyViewed(
    userId: Types.ObjectId,
    limit = 10,
  ): Promise<IReadingHistory[]> {
    return readingHistoryRepository.findRecentlyViewed(userId, limit);
  }

  async getResourceHistory(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<IReadingHistory | null> {
    return readingHistoryRepository.findByUserAndResource(userId, resourceId);
  }

  async getReadingTimeline(
    userId: Types.ObjectId,
    days = 30,
  ): Promise<IReadingHistory[]> {
    return readingHistoryRepository.getReadingTimeline(userId, days);
  }

  async deleteHistory(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<void> {
    await readingHistoryRepository.deleteByUserAndResource(userId, resourceId);
  }

  async deleteOldHistory(userId: Types.ObjectId, days: number): Promise<void> {
    await readingHistoryRepository.deleteOlderThan(userId, days);
  }

  async clearAllHistory(userId: Types.ObjectId): Promise<void> {
    await readingHistoryRepository.deleteMany({ user: userId });
  }

  async getHistoryCount(userId: Types.ObjectId): Promise<number> {
    return readingHistoryRepository.model.countDocuments({ user: userId });
  }
}

export const readingHistoryService = new ReadingHistoryService();
