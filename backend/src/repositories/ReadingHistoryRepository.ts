import { Types } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { ReadingHistory, IReadingHistory } from "../models/ReadingHistory";

export class ReadingHistoryRepository extends BaseRepository<IReadingHistory> {
  constructor() {
    super(ReadingHistory);
  }

  async findByUser(
    userId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IReadingHistory>> {
    return this.findWithPagination(
      { user: userId },
      { ...options, sort: { readAt: -1 } },
    );
  }

  async findRecentlyViewed(
    userId: Types.ObjectId,
    limit = 10,
  ): Promise<IReadingHistory[]> {
    return this.model
      .find({ user: userId })
      .sort({ readAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<IReadingHistory | null> {
    return this.findOne({ user: userId, resourceId });
  }

  async getReadingTimeline(
    userId: Types.ObjectId,
    days = 30,
  ): Promise<IReadingHistory[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return this.model
      .find({
        user: userId,
        readAt: { $gte: startDate },
      })
      .sort({ readAt: -1 })
      .exec();
  }

  async addOrUpdate(data: Partial<IReadingHistory>): Promise<IReadingHistory> {
    if (!data.user || !data.resourceId) {
      throw new Error("User and resourceId are required");
    }

    const existing = await this.findOne({
      user: data.user,
      resourceId: data.resourceId,
    });

    if (existing) {
      return this.updateById(existing._id, {
        readAt: new Date(),
        ...data,
      }) as Promise<IReadingHistory>;
    }

    return this.create(data);
  }

  async deleteByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<any> {
    return this.model.deleteMany({ user: userId, resourceId }).exec();
  }

  async deleteOlderThan(userId: Types.ObjectId, days: number): Promise<any> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return this.model
      .deleteMany({ user: userId, readAt: { $lt: cutoffDate } })
      .exec();
  }
}

export const readingHistoryRepository = new ReadingHistoryRepository();
