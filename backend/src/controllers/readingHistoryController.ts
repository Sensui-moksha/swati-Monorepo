import { Response, NextFunction } from "express";
import { readingHistoryService } from "../services/ReadingHistoryService";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { Types } from "mongoose";

export class ReadingHistoryController {
  async recordReading(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const history = await readingHistoryService.recordReading(
        userId,
        req.body,
      );
      res.status(201).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 20 } = req.query;

      const result = await readingHistoryService.getHistory(
        userId,
        Number(page),
        Number(limit),
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getRecentlyViewed(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { limit = 10 } = req.query;

      const data = await readingHistoryService.getRecentlyViewed(
        userId,
        Number(limit),
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getResourceHistory(
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

      const history = await readingHistoryService.getResourceHistory(
        userId,
        new Types.ObjectId(resourceId),
      );
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async getReadingTimeline(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { days = 30 } = req.query;

      const timeline = await readingHistoryService.getReadingTimeline(
        userId,
        Number(days),
      );
      res.json({ success: true, data: timeline });
    } catch (error) {
      next(error);
    }
  }

  async deleteHistory(
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

      await readingHistoryService.deleteHistory(
        userId,
        new Types.ObjectId(resourceId),
      );
      res.json({ success: true, message: "History deleted" });
    } catch (error) {
      next(error);
    }
  }

  async clearHistory(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      await readingHistoryService.clearAllHistory(userId);
      res.json({ success: true, message: "All history cleared" });
    } catch (error) {
      next(error);
    }
  }
}

export const readingHistoryController = new ReadingHistoryController();
