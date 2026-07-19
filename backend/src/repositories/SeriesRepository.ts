import { Types, FilterQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Series, ISeries } from "../models/Series";

export interface SeriesFilter extends FilterQuery<ISeries> {
  search?: string;
  publisher?: string | Types.ObjectId;
  isActive?: boolean;
}

export class SeriesRepository extends BaseRepository<ISeries> {
  constructor() {
    super(Series);
  }

  async findBySlug(slug: string): Promise<ISeries | null> {
    return this.model.findOne({ slug, isDeleted: false }).exec();
  }

  async findWithPagination(
    filter: SeriesFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<ISeries>> {
    const { search, publisher, isActive, ...restFilter } = filter;
    const query: FilterQuery<ISeries> = { ...restFilter, isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (publisher) {
      query.publisher =
        publisher instanceof Types.ObjectId
          ? publisher
          : new Types.ObjectId(publisher);
    }

    if (typeof isActive === "boolean") {
      query.isActive = isActive;
    }

    return super.findWithPagination(query, {
      ...options,
      sort: options.sort || { sortOrder: 1, name: 1 },
    });
  }

  async restore(id: string | Types.ObjectId): Promise<ISeries | null> {
    return this.updateById(id, {
      isDeleted: false,
      deletedAt: undefined,
    } as Partial<ISeries>);
  }
}

export const seriesRepository = new SeriesRepository();
