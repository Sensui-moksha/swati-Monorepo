import { Types } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Highlight, IHighlight } from "../models/Highlight";

export class HighlightRepository extends BaseRepository<IHighlight> {
  constructor() {
    super(Highlight);
  }

  async findByUser(
    userId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IHighlight>> {
    return this.findWithPagination(
      { user: userId },
      { ...options, sort: { createdAt: -1 } },
    );
  }

  async findByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IHighlight>> {
    return this.findWithPagination(
      { user: userId, resourceId },
      { ...options, sort: { page: 1, startOffset: 1 } },
    );
  }

  async findByUserAndColor(
    userId: Types.ObjectId,
    color: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IHighlight>> {
    return this.findWithPagination(
      { user: userId, color },
      { ...options, sort: { createdAt: -1 } },
    );
  }

  async countByUser(userId: Types.ObjectId): Promise<number> {
    return this.model.countDocuments({ user: userId });
  }

  async countByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<number> {
    return this.model.countDocuments({ user: userId, resourceId });
  }

  async countByUserAndColor(
    userId: Types.ObjectId,
    color: string,
  ): Promise<number> {
    return this.model.countDocuments({ user: userId, color });
  }

  async getColorDistribution(
    userId: Types.ObjectId,
  ): Promise<Record<string, number>> {
    const result = await this.model.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      { $group: { _id: "$color", count: { $sum: 1 } } },
    ]);

    const distribution: Record<string, number> = {};
    for (const item of result) {
      distribution[item._id] = item.count;
    }
    return distribution;
  }

  async search(
    userId: Types.ObjectId,
    query: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IHighlight>> {
    const searchRegex = new RegExp(query, "i");
    return this.findWithPagination(
      {
        user: userId,
        $or: [{ text: searchRegex }, { note: searchRegex }],
      },
      { ...options, sort: { createdAt: -1 } },
    );
  }

  async deleteByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<any> {
    return this.model.deleteMany({ user: userId, resourceId }).exec();
  }
}

export const highlightRepository = new HighlightRepository();
