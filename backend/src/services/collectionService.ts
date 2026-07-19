import { Types } from "mongoose";
import {
  CollectionRepository,
  collectionRepository,
  CollectionFilter,
} from "../repositories/CollectionRepository";
import { ICollection } from "../models/Collection";
import { ApiError } from "../middleware/errorHandler";
import { PaginationOptions } from "../repositories/BaseRepository";

export class CollectionService {
  constructor(
    private readonly repository: CollectionRepository = collectionRepository,
  ) {}

  async createCollection(
    input: Partial<ICollection>,
    userId?: string,
  ): Promise<ICollection> {
    const data: Partial<ICollection> = {
      ...input,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
    } as Partial<ICollection>;

    return this.repository.create(data);
  }

  async getCollectionById(id: string): Promise<ICollection> {
    const collection = await this.repository.findById(id);
    if (!collection || collection.isDeleted) {
      throw new ApiError(404, "Collection not found");
    }
    return collection;
  }

  async getCollectionBySlug(slug: string): Promise<ICollection> {
    const collection = await this.repository.findBySlug(slug);
    if (!collection || collection.isDeleted) {
      throw new ApiError(404, "Collection not found");
    }
    return collection;
  }

  async listCollections(
    filter: CollectionFilter = {},
    options: PaginationOptions = {},
  ) {
    return this.repository.findWithPagination(filter, options);
  }

  async updateCollection(
    id: string,
    input: Partial<ICollection>,
  ): Promise<ICollection> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Collection not found");
    }

    const updated = await this.repository.updateById(id, input);
    if (!updated) {
      throw new ApiError(500, "Failed to update collection");
    }
    return updated;
  }

  async deleteCollection(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Collection not found");
    }

    await this.repository.softDelete(id);
  }

  async restoreCollection(id: string): Promise<ICollection> {
    const restored = await this.repository.restore(id);
    if (!restored) {
      throw new ApiError(404, "Collection not found");
    }
    return restored;
  }

  async getFeaturedCollections(limit = 6) {
    return this.repository.getFeatured(limit);
  }
}

export const collectionService = new CollectionService();
