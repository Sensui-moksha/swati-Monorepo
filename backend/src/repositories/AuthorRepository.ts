import { Types, FilterQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Author, IAuthor } from "../models/Author";

export interface AuthorFilter extends FilterQuery<IAuthor> {
  search?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export class AuthorRepository extends BaseRepository<IAuthor> {
  constructor() {
    super(Author);
  }

  async findBySlug(slug: string): Promise<IAuthor | null> {
    return this.model.findOne({ slug, isDeleted: false }).exec();
  }

  async findWithPagination(
    filter: AuthorFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IAuthor>> {
    const { search, isFeatured, isActive, ...restFilter } = filter;
    const query: FilterQuery<IAuthor> = { ...restFilter, isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
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
      sort: options.sort || { sortOrder: 1, name: 1 },
    });
  }

  async getFeatured(limit: number = 8): Promise<IAuthor[]> {
    return this.model
      .find({ isFeatured: true, isActive: true, isDeleted: false })
      .sort({ sortOrder: 1, name: 1 })
      .limit(limit)
      .exec();
  }

  async restore(id: string | Types.ObjectId): Promise<IAuthor | null> {
    return this.updateById(id, {
      isDeleted: false,
      deletedAt: undefined,
    } as Partial<IAuthor>);
  }
}

export const authorRepository = new AuthorRepository();
