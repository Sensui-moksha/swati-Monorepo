import { Response, NextFunction } from "express";
import { highlightService } from "../services/HighlightService";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { Types } from "mongoose";

export class HighlightController {
  async createHighlight(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const highlight = await highlightService.createHighlight(
        userId,
        req.body,
      );
      res.status(201).json({ success: true, data: highlight });
    } catch (error) {
      next(error);
    }
  }

  async getHighlights(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { resourceId, color, search, page = 1, limit = 20 } = req.query;

      let result;
      if (resourceId && typeof resourceId === "string") {
        result = await highlightService.getHighlightsByResource(
          userId,
          new Types.ObjectId(resourceId),
          Number(page),
          Number(limit),
        );
      } else if (color && typeof color === "string") {
        result = await highlightService.getHighlightsByColor(
          userId,
          color,
          Number(page),
          Number(limit),
        );
      } else if (search && typeof search === "string") {
        result = await highlightService.searchHighlights(
          userId,
          search,
          Number(page),
          Number(limit),
        );
      } else {
        result = await highlightService.getHighlights(
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

  async getHighlight(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { highlightId } = req.params;

      if (!highlightId) {
        throw new ApiError(400, "highlightId is required");
      }

      const highlight = await highlightService.getHighlight(
        new Types.ObjectId(highlightId),
        userId,
      );
      res.json({ success: true, data: highlight });
    } catch (error) {
      next(error);
    }
  }

  async updateHighlight(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { highlightId } = req.params;

      if (!highlightId) {
        throw new ApiError(400, "highlightId is required");
      }

      const highlight = await highlightService.updateHighlight(
        new Types.ObjectId(highlightId),
        userId,
        req.body,
      );
      res.json({ success: true, data: highlight });
    } catch (error) {
      next(error);
    }
  }

  async deleteHighlight(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { highlightId } = req.params;

      if (!highlightId) {
        throw new ApiError(400, "highlightId is required");
      }

      await highlightService.deleteHighlight(
        new Types.ObjectId(highlightId),
        userId,
      );
      res.json({ success: true, message: "Highlight deleted" });
    } catch (error) {
      next(error);
    }
  }

  async getColorDistribution(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const distribution = await highlightService.getColorDistribution(userId);
      res.json({ success: true, data: { distribution } });
    } catch (error) {
      next(error);
    }
  }

  async getHighlightCount(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const count = await highlightService.getHighlightCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }
}

export const highlightController = new HighlightController();
