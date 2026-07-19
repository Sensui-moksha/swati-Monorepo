import { Response, NextFunction } from "express";
import { bookmarkService } from "../services/BookmarkService";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { Types } from "mongoose";

export class BookmarkController {
  async addBookmark(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const bookmark = await bookmarkService.addBookmark(userId, req.body);
      res.status(201).json({ success: true, data: bookmark });
    } catch (error) {
      next(error);
    }
  }

  async removeBookmark(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { resourceId } = req.params;

      if (!resourceId) {
        throw new ApiError(400, "resourceId is required");
      }

      await bookmarkService.removeBookmark(
        userId,
        new Types.ObjectId(resourceId),
      );
      res.json({ success: true, message: "Bookmark removed" });
    } catch (error) {
      next(error);
    }
  }

  async getBookmarks(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { type, page = 1, limit = 20, search } = req.query;

      let result;
      if (type && typeof type === "string") {
        result = await bookmarkService.getBookmarksByType(
          userId,
          type as any,
          Number(page),
          Number(limit),
        );
      } else if (search && typeof search === "string") {
        result = await bookmarkService.searchBookmarks(
          userId,
          search,
          Number(page),
          Number(limit),
        );
      } else {
        result = await bookmarkService.getBookmarks(
          userId,
          Number(page),
          Number(limit),
        );
      }

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async isBookmarked(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { resourceId } = req.params;

      if (!resourceId) {
        throw new ApiError(400, "resourceId is required");
      }

      const isBookmarked = await bookmarkService.isBookmarked(
        userId,
        new Types.ObjectId(resourceId),
      );
      res.json({ success: true, data: { isBookmarked } });
    } catch (error) {
      next(error);
    }
  }

  async getBookmarkCount(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const count = await bookmarkService.getBookmarkCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }

  async updateBookmark(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { resourceId } = req.params;

      if (!resourceId) {
        throw new ApiError(400, "resourceId is required");
      }

      const bookmark = await bookmarkService.updateBookmark(
        userId,
        new Types.ObjectId(resourceId),
        req.body,
      );
      res.json({ success: true, data: bookmark });
    } catch (error) {
      next(error);
    }
  }
}

export const bookmarkController = new BookmarkController();
