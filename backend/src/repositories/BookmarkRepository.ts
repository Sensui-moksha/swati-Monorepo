import { Types } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Bookmark, IBookmark, BookmarkType } from "../models/Bookmark";

export class BookmarkRepository extends BaseRepository<IBookmark> {
  constructor() {
    super(Bookmark);
  }

  async findByUser(
    userId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IBookmark>> {
    return this.findWithPagination(
      { user: userId },
      { ...options, sort: { createdAt: -1 } },
    );
  }

  async findByUserAndType(
    userId: Types.ObjectId,
    type: BookmarkType,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IBookmark>> {
    return this.findWithPagination(
      { user: userId, type },
      { ...options, sort: { createdAt: -1 } },
    );
  }

  async findByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<IBookmark | null> {
    return this.findOne({ user: userId, resourceId });
  }

  async exists(filter: any): Promise<boolean> {
    const count = await this.model.countDocuments(filter);
    return count > 0;
  }

  async countByUser(userId: Types.ObjectId): Promise<number> {
    return this.model.countDocuments({ user: userId });
  }

  async countByUserAndType(
    userId: Types.ObjectId,
    type: BookmarkType,
  ): Promise<number> {
    return this.model.countDocuments({ user: userId, type });
  }

  async search(
    userId: Types.ObjectId,
    query: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IBookmark>> {
    const searchRegex = new RegExp(query, "i");
    return this.findWithPagination(
      {
        user: userId,
        $or: [{ resourceTitle: searchRegex }, { notes: searchRegex }],
      },
      { ...options, sort: { createdAt: -1 } },
    );
  }

  async deleteByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<any> {
    return this.model.deleteOne({ user: userId, resourceId }).exec();
  }
}

export const bookmarkRepository = new BookmarkRepository();
