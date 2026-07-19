import { Types, FilterQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Book, IBook } from "../models/Book";

export interface BookFilter extends FilterQuery<IBook> {
  search?: string;
  category?: string | Types.ObjectId;
  genre?: string | Types.ObjectId;
  series?: string | Types.ObjectId;
  author?: string | Types.ObjectId;
  publisher?: string | Types.ObjectId;
  language?: string;
  publication?: string | Types.ObjectId;
  isPremium?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: Date;
  endDate?: Date;
}

export class BookRepository extends BaseRepository<IBook> {
  constructor() {
    super(Book);
  }

  async findBySlug(slug: string): Promise<IBook | null> {
    return this.model.findOne({ slug, isDeleted: false }).exec();
  }

  async findWithPagination(
    filter: BookFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IBook>> {
    const {
      search,
      category,
      genre,
      series,
      author,
      publisher,
      language,
      publication,
      isPremium,
      isFeatured,
      isTrending,
      status,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      ...restFilter
    } = filter;

    const query: FilterQuery<IBook> = { ...restFilter, isDeleted: false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category =
        category instanceof Types.ObjectId
          ? category
          : new Types.ObjectId(category);
    }

    if (genre) {
      query.genre =
        genre instanceof Types.ObjectId ? genre : new Types.ObjectId(genre);
    }

    if (series) {
      query.series =
        series instanceof Types.ObjectId ? series : new Types.ObjectId(series);
    }

    if (author) {
      query.author =
        author instanceof Types.ObjectId ? author : new Types.ObjectId(author);
    }

    if (publisher) {
      query.publisher =
        publisher instanceof Types.ObjectId
          ? publisher
          : new Types.ObjectId(publisher);
    }

    if (publication) {
      query.publication =
        publication instanceof Types.ObjectId
          ? publication
          : new Types.ObjectId(publication);
    }

    if (language) {
      query.language = language;
    }

    if (status) {
      query.status = status;
    }

    if (typeof isPremium === "boolean") {
      query.isPremium = isPremium;
    }

    if (typeof isFeatured === "boolean") {
      query.isFeatured = isFeatured;
    }

    if (typeof isTrending === "boolean") {
      query.isTrending = isTrending;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {} as FilterQuery<IBook>["price"];
      if (minPrice !== undefined) {
        (query.price as any).$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        (query.price as any).$lte = maxPrice;
      }
    }

    if (startDate || endDate) {
      query.publishedDate = {} as FilterQuery<IBook>["publishedDate"];
      if (startDate) {
        (query.publishedDate as any).$gte = startDate;
      }
      if (endDate) {
        (query.publishedDate as any).$lte = endDate;
      }
    }

    return super.findWithPagination(query, {
      ...options,
      sort: options.sort || { publishedDate: -1, createdAt: -1 },
    });
  }

  async getFeatured(limit: number = 8): Promise<IBook[]> {
    return this.model
      .find({ isFeatured: true, status: "published", isDeleted: false })
      .sort({ publishedDate: -1 })
      .limit(limit)
      .exec();
  }

  async getTrending(limit: number = 8): Promise<IBook[]> {
    return this.model
      .find({ isTrending: true, status: "published", isDeleted: false })
      .sort({ publishedDate: -1 })
      .limit(limit)
      .exec();
  }

  async getNewReleases(limit: number = 8): Promise<IBook[]> {
    return this.model
      .find({ status: "published", isDeleted: false })
      .sort({ publishedDate: -1 })
      .limit(limit)
      .exec();
  }

  async getPopular(limit: number = 8): Promise<IBook[]> {
    return this.model
      .find({ status: "published", isDeleted: false })
      .sort({ viewCount: -1, publishedDate: -1 })
      .limit(limit)
      .exec();
  }

  async getByCategory(
    categoryId: string | Types.ObjectId,
    limit: number = 8,
  ): Promise<IBook[]> {
    return this.model
      .find({ category: categoryId, status: "published", isDeleted: false })
      .sort({ publishedDate: -1 })
      .limit(limit)
      .exec();
  }

  async getByGenre(
    genreId: string | Types.ObjectId,
    limit: number = 8,
  ): Promise<IBook[]> {
    return this.model
      .find({ genre: genreId, status: "published", isDeleted: false })
      .sort({ publishedDate: -1 })
      .limit(limit)
      .exec();
  }

  async getByAuthor(
    authorId: string | Types.ObjectId,
    limit: number = 8,
  ): Promise<IBook[]> {
    return this.model
      .find({ author: authorId, status: "published", isDeleted: false })
      .sort({ publishedDate: -1 })
      .limit(limit)
      .exec();
  }

  async getByPublisher(
    publisherId: string | Types.ObjectId,
    limit: number = 8,
  ): Promise<IBook[]> {
    return this.model
      .find({ publisher: publisherId, status: "published", isDeleted: false })
      .sort({ publishedDate: -1 })
      .limit(limit)
      .exec();
  }

  async getRelated(
    currentBookId: string | Types.ObjectId,
    categoryId?: string | Types.ObjectId,
    limit: number = 6,
  ): Promise<IBook[]> {
    const query = {
      _id: { $ne: currentBookId },
      status: "published",
      isDeleted: false,
    } as FilterQuery<IBook>;
    if (categoryId) {
      (query as any).category = categoryId;
    }
    return this.model
      .find(query)
      .sort({ publishedDate: -1 })
      .limit(limit)
      .exec();
  }

  async restore(id: string | Types.ObjectId): Promise<IBook | null> {
    return this.updateById(id, {
      isDeleted: false,
      deletedAt: undefined,
    } as Partial<IBook>);
  }
}

export const bookRepository = new BookRepository();
