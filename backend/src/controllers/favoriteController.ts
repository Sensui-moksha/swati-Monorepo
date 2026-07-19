import { Response, NextFunction } from "express";
import { favoriteService } from "../services/FavoriteService";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { Types } from "mongoose";

export class FavoriteController {
  async addFavorite(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const favorite = await favoriteService.addFavorite(userId, req.body);
      res.status(201).json({ success: true, data: favorite });
    } catch (error) {
      next(error);
    }
  }

  async removeFavorite(
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

      await favoriteService.removeFavorite(
        userId,
        new Types.ObjectId(resourceId),
      );
      res.json({ success: true, message: "Favorite removed" });
    } catch (error) {
      next(error);
    }
  }

  async getFavorites(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { type, page = 1, limit = 20 } = req.query;

      let result;
      if (type && typeof type === "string") {
        result = await favoriteService.getFavoritesByType(
          userId,
          type as any,
          Number(page),
          Number(limit),
        );
      } else {
        result = await favoriteService.getFavorites(
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

  async isFavorite(
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

      const isFavorite = await favoriteService.isFavorite(
        userId,
        new Types.ObjectId(resourceId),
      );
      res.json({ success: true, data: { isFavorite } });
    } catch (error) {
      next(error);
    }
  }

  async getFavoriteCount(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const count = await favoriteService.getFavoriteCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }

  async toggleFavorite(
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

      const isFavorite = await favoriteService.toggleFavorite(
        userId,
        new Types.ObjectId(resourceId),
        req.body,
      );
      res.json({ success: true, data: { isFavorite } });
    } catch (error) {
      next(error);
    }
  }
}

export const favoriteController = new FavoriteController();
