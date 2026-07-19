import { Types, FilterQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Collection, ICollection } from "../models/Collection";

export interface CollectionFilter extends FilterQuery<ICollection> {
  search?: string;
  type?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export class CollectionRepository extends BaseRepository<ICollection> {
  constructor() {
    super(Collection);
  }

  async findBySlug(slug: string): Promise<ICollection | null> {
    return this.model.findOne({ slug, isDeleted: false }).exec();
  }

  async findWithPagination(
    filter: CollectionFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<ICollection>> {
    const { search, type, isFeatured, isActive, ...restFilter } = filter;
    const query: FilterQuery<ICollection> = { ...restFilter, isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (type) {
      query.type = type as any;
    }

    if (typeof isFeatured === "boolean") {
      query.isFeatured = isFeatured;
    }

    if (typeof isActive === "boolean") {
      query.isActive = isActive;
    }

    return super.findWithPagination(query, {
      ...options,
      sort: options.sort || { sortOrder: 1, name: 1 },
    });
  }

  async getFeatured(limit: number = 6): Promise<ICollection[]> {
    return this.model
      .find({ isFeatured: true, isActive: true, isDeleted: false })
      .sort({ sortOrder: 1, name: 1 })
      .limit(limit)
      .exec();
  }

  async restore(id: string | Types.ObjectId): Promise<ICollection | null> {
    return this.updateById(id, {
      isDeleted: false,
      deletedAt: undefined,
    } as Partial<ICollection>);
  }
}

export const collectionRepository = new CollectionRepository();
