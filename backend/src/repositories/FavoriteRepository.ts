import { Types } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Favorite, IFavorite, FavoriteType } from "../models/Favorite";

export class FavoriteRepository extends BaseRepository<IFavorite> {
  constructor() {
    super(Favorite);
  }

  async findByUser(
    userId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IFavorite>> {
    return this.findWithPagination(
      { user: userId },
      { ...options, sort: { addedAt: -1 } },
    );
  }

  async findByUserAndType(
    userId: Types.ObjectId,
    type: FavoriteType,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IFavorite>> {
    return this.findWithPagination(
      { user: userId, type },
      { ...options, sort: { addedAt: -1 } },
    );
  }

  async findByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<IFavorite | null> {
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
    type: FavoriteType,
  ): Promise<number> {
    return this.model.countDocuments({ user: userId, type });
  }

  async deleteByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<any> {
    return this.model.deleteOne({ user: userId, resourceId }).exec();
  }
}

export const favoriteRepository = new FavoriteRepository();
