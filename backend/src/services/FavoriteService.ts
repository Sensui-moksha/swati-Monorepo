import { Types } from "mongoose";
import { ApiError } from "../middleware/errorHandler";
import { favoriteRepository } from "../repositories/FavoriteRepository";
import { IFavorite, FavoriteType } from "../models/Favorite";

export class FavoriteService {
  async addFavorite(
    userId: Types.ObjectId,
    data: Partial<IFavorite>,
  ): Promise<IFavorite> {
    if (!data.resourceId || !data.type) {
      throw new ApiError(400, "resourceId and type are required");
    }

    // Check if already favorited
    const exists = await favoriteRepository.findByUserAndResource(
      userId,
      data.resourceId,
    );
    if (exists) {
      throw new ApiError(409, "Resource already in favorites");
    }

    return favoriteRepository.create({ ...data, user: userId });
  }

  async removeFavorite(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<void> {
    const favorite = await favoriteRepository.findByUserAndResource(
      userId,
      resourceId,
    );
    if (!favorite) {
      throw new ApiError(404, "Favorite not found");
    }

    await favoriteRepository.deleteByUserAndResource(userId, resourceId);
  }

  async getFavorites(userId: Types.ObjectId, page = 1, limit = 20) {
    return favoriteRepository.findByUser(userId, { page, limit });
  }

  async getFavoritesByType(
    userId: Types.ObjectId,
    type: FavoriteType,
    page = 1,
    limit = 20,
  ) {
    return favoriteRepository.findByUserAndType(userId, type, { page, limit });
  }

  async isFavorite(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<boolean> {
    return favoriteRepository.exists({ user: userId, resourceId });
  }

  async getFavoriteCount(userId: Types.ObjectId): Promise<number> {
    return favoriteRepository.countByUser(userId);
  }

  async getFavoriteCountByType(
    userId: Types.ObjectId,
    type: FavoriteType,
  ): Promise<number> {
    return favoriteRepository.countByUserAndType(userId, type);
  }

  async toggleFavorite(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
    data: Partial<IFavorite>,
  ): Promise<boolean> {
    const exists = await favoriteRepository.exists({
      user: userId,
      resourceId,
    });
    if (exists) {
      await favoriteRepository.deleteByUserAndResource(userId, resourceId);
      return false;
    } else {
      await this.addFavorite(userId, { ...data, resourceId });
      return true;
    }
  }
}

export const favoriteService = new FavoriteService();
