import { Response, NextFunction } from "express";
import { readingProgressService } from "../services/ReadingProgressService";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { Types } from "mongoose";

export class ReadingProgressController {
  async startReading(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const progress = await readingProgressService.startReading(
        userId,
        req.body,
      );
      res.status(201).json({ success: true, data: progress });
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { resourceId } = req.params;
      const { currentPage, timeSpent } = req.body;

      if (!resourceId) {
        throw new ApiError(400, "resourceId is required");
      }

      const progress = await readingProgressService.updateProgress(
        userId,
        new Types.ObjectId(resourceId),
        currentPage,
        timeSpent,
      );
      res.json({ success: true, data: progress });
    } catch (error) {
      next(error);
    }
  }

  async completeReading(
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

      const progress = await readingProgressService.completeReading(
        userId,
        new Types.ObjectId(resourceId),
      );
      res.json({ success: true, data: progress });
    } catch (error) {
      next(error);
    }
  }

  async getActiveReadings(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 20 } = req.query;

      const result = await readingProgressService.getActiveReadings(
        userId,
        Number(page),
        Number(limit),
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getCompletedReadings(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 20 } = req.query;

      const result = await readingProgressService.getCompletedReadings(
        userId,
        Number(page),
        Number(limit),
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getContinueReading(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { limit = 10 } = req.query;

      const data = await readingProgressService.getContinueReading(
        userId,
        Number(limit),
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProgress(
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

      const progress = await readingProgressService.getProgress(
        userId,
        new Types.ObjectId(resourceId),
      );
      res.json({ success: true, data: progress });
    } catch (error) {
      next(error);
    }
  }

  async deleteProgress(
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

      await readingProgressService.deleteProgress(
        userId,
        new Types.ObjectId(resourceId),
      );
      res.json({ success: true, message: "Progress deleted" });
    } catch (error) {
      next(error);
    }
  }

  async getStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const stats = await readingProgressService.getStats(userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getReaderContent(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { resourceId, resourceType } = req.params;

      if (!resourceId || !resourceType) {
        throw new ApiError(400, "resourceId and resourceType are required");
      }

      const content = await readingProgressService.getReaderContent(
        new Types.ObjectId(resourceId),
        resourceType,
      );
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  async getRelatedContent(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { resourceId, resourceType } = req.params;
      const { limit = 6 } = req.query;

      if (!resourceId || !resourceType) {
        throw new ApiError(400, "resourceId and resourceType are required");
      }

      const related = await readingProgressService.getRelatedContent(
        new Types.ObjectId(resourceId),
        resourceType,
        Number(limit),
      );
      res.json({ success: true, data: related });
    } catch (error) {
      next(error);
    }
  }

  async updateReadingPreferences(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const preferences = req.body;

      const updated = await readingProgressService.updateReadingPreferences(
        userId,
        preferences,
      );
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
}

export const readingProgressController = new ReadingProgressController();
