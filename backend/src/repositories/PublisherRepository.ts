import { Types, FilterQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Publisher, IPublisher } from "../models/Publisher";

export interface PublisherFilter extends FilterQuery<IPublisher> {
  search?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export class PublisherRepository extends BaseRepository<IPublisher> {
  constructor() {
    super(Publisher);
  }

  async findBySlug(slug: string): Promise<IPublisher | null> {
    return this.model.findOne({ slug, isDeleted: false }).exec();
  }

  async findWithPagination(
    filter: PublisherFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IPublisher>> {
    const { search, isFeatured, isActive, ...restFilter } = filter;
    const query: FilterQuery<IPublisher> = { ...restFilter, isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (typeof isFeatured === "boolean") {
      query.isFeatured = isFeatured;
    }

    if (typeof isActive === "boolean") {
      query.isActive = isActive;
    }

    return super.findWithPagination(query, {
      ...options,
      sort: options.sort || { name: 1 },
    });
  }

  async getFeatured(limit: number = 8): Promise<IPublisher[]> {
    return this.model
      .find({ isFeatured: true, isActive: true, isDeleted: false })
      .sort({ name: 1 })
      .limit(limit)
      .exec();
  }

  async restore(id: string | Types.ObjectId): Promise<IPublisher | null> {
    return this.updateById(id, {
      isDeleted: false,
      deletedAt: undefined,
    } as Partial<IPublisher>);
  }
}

export const publisherRepository = new PublisherRepository();
