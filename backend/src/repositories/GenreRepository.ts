import { Types, FilterQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Genre, IGenre } from "../models/Genre";

export interface GenreFilter extends FilterQuery<IGenre> {
  search?: string;
  isActive?: boolean;
}

export class GenreRepository extends BaseRepository<IGenre> {
  constructor() {
    super(Genre);
  }

  async findBySlug(slug: string): Promise<IGenre | null> {
    return this.model.findOne({ slug, isDeleted: false }).exec();
  }

  async findWithPagination(
    filter: GenreFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IGenre>> {
    const { search, isActive, ...restFilter } = filter;
    const query: FilterQuery<IGenre> = { ...restFilter, isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (typeof isActive === "boolean") {
      query.isActive = isActive;
    }

    return super.findWithPagination(query, {
      ...options,
      sort: options.sort || { sortOrder: 1, name: 1 },
    });
  }

  async restore(id: string | Types.ObjectId): Promise<IGenre | null> {
    return this.updateById(id, {
      isDeleted: false,
      deletedAt: undefined,
    } as Partial<IGenre>);
  }
}

export const genreRepository = new GenreRepository();
