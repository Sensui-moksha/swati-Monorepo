import { Types } from "mongoose";
import { ApiError } from "../middleware/errorHandler";
import { bookmarkRepository } from "../repositories/BookmarkRepository";
import { IBookmark, BookmarkType } from "../models/Bookmark";

export class BookmarkService {
  async addBookmark(
    userId: Types.ObjectId,
    data: Partial<IBookmark>,
  ): Promise<IBookmark> {
    if (!data.resourceId || !data.type) {
      throw new ApiError(400, "resourceId and type are required");
    }

    // Check if already bookmarked
    const exists = await bookmarkRepository.findByUserAndResource(
      userId,
      data.resourceId,
    );
    if (exists) {
      throw new ApiError(409, "Resource already bookmarked");
    }

    return bookmarkRepository.create({ ...data, user: userId });
  }

  async removeBookmark(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<void> {
    const bookmark = await bookmarkRepository.findByUserAndResource(
      userId,
      resourceId,
    );
    if (!bookmark) {
      throw new ApiError(404, "Bookmark not found");
    }

    await bookmarkRepository.deleteByUserAndResource(userId, resourceId);
  }

  async getBookmarks(userId: Types.ObjectId, page = 1, limit = 20) {
    return bookmarkRepository.findByUser(userId, { page, limit });
  }

  async getBookmarksByType(
    userId: Types.ObjectId,
    type: BookmarkType,
    page = 1,
    limit = 20,
  ) {
    return bookmarkRepository.findByUserAndType(userId, type, { page, limit });
  }

  async isBookmarked(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<boolean> {
    return bookmarkRepository.exists({ user: userId, resourceId });
  }

  async getBookmarkCount(userId: Types.ObjectId): Promise<number> {
    return bookmarkRepository.countByUser(userId);
  }

  async getBookmarkCountByType(
    userId: Types.ObjectId,
    type: BookmarkType,
  ): Promise<number> {
    return bookmarkRepository.countByUserAndType(userId, type);
  }

  async searchBookmarks(
    userId: Types.ObjectId,
    query: string,
    page = 1,
    limit = 20,
  ) {
    return bookmarkRepository.search(userId, query, { page, limit });
  }

  async updateBookmark(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
    data: Partial<IBookmark>,
  ): Promise<IBookmark> {
    const bookmark = await bookmarkRepository.findByUserAndResource(
      userId,
      resourceId,
    );
    if (!bookmark) {
      throw new ApiError(404, "Bookmark not found");
    }

    return bookmarkRepository.updateById(
      bookmark._id,
      data,
    ) as Promise<IBookmark>;
  }
}

export const bookmarkService = new BookmarkService();
