import { Types } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { ReadingProgress, IReadingProgress } from "../models/ReadingProgress";

export class ReadingProgressRepository extends BaseRepository<IReadingProgress> {
  constructor() {
    super(ReadingProgress);
  }

  async findByUser(
    userId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IReadingProgress>> {
    return this.findWithPagination(
      { user: userId },
      { ...options, sort: { lastReadAt: -1 } },
    );
  }

  async findByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<IReadingProgress | null> {
    return this.findOne({ user: userId, resourceId });
  }

  async findActiveByUser(
    userId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IReadingProgress>> {
    return this.findWithPagination(
      { user: userId, isCompleted: false },
      { ...options, sort: { lastReadAt: -1 } },
    );
  }

  async findCompletedByUser(
    userId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IReadingProgress>> {
    return this.findWithPagination(
      { user: userId, isCompleted: true },
      { ...options, sort: { completedAt: -1 } },
    );
  }

  async findForContinueReading(
    userId: Types.ObjectId,
    limit = 10,
  ): Promise<IReadingProgress[]> {
    return this.model
      .find({
        user: userId,
        isCompleted: false,
        percentageRead: { $gt: 0, $lt: 100 },
      })
      .sort({ lastReadAt: -1 })
      .limit(limit)
      .exec();
  }

  async countActiveByUser(userId: Types.ObjectId): Promise<number> {
    return this.model.countDocuments({ user: userId, isCompleted: false });
  }

  async countCompletedByUser(userId: Types.ObjectId): Promise<number> {
    return this.model.countDocuments({ user: userId, isCompleted: true });
  }

  async updateProgress(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
    data: Partial<IReadingProgress>,
  ): Promise<IReadingProgress | null> {
    return this.model
      .findOneAndUpdate(
        { user: userId, resourceId },
        {
          ...data,
          lastReadAt: new Date(),
          $inc: { sessionCount: 1 },
        },
        { new: true },
      )
      .exec();
  }

  async deleteByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<any> {
    return this.model.deleteOne({ user: userId, resourceId }).exec();
  }

  async deleteCompleted(userId: Types.ObjectId): Promise<any> {
    return this.model.deleteMany({ user: userId, isCompleted: true }).exec();
  }
}

export const readingProgressRepository = new ReadingProgressRepository();
