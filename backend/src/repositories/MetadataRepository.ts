import { Types, FilterQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import {
  StoragePath,
  IStoragePath,
  StorageType,
  StorageStatus,
} from "../models/StoragePath";

export interface SearchFilter extends FilterQuery<IStoragePath> {
  query?: string;
  type?: StorageType;
  status?: StorageStatus;
  language?: string;
  author?: string | Types.ObjectId;
  publisher?: string | Types.ObjectId;
  category?: string | Types.ObjectId;
  genre?: string | Types.ObjectId;
  series?: string | Types.ObjectId;
  collection?: string | Types.ObjectId;
  publication?: string | Types.ObjectId;
  issue?: string | Types.ObjectId;
  book?: string | Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  keywords?: string[];
  hasCover?: boolean;
  hasPdf?: boolean;
  hasThumbnail?: boolean;
  minPages?: number;
  maxPages?: number;
  minSize?: number;
  maxSize?: number;
}

export class MetadataRepository extends BaseRepository<IStoragePath> {
  constructor() {
    super(StoragePath);
  }

  async search(
    filter: SearchFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    const {
      query,
      type,
      status,
      language,
      author,
      publisher,
      category,
      genre,
      series,
      collection,
      publication,
      issue,
      book,
      startDate,
      endDate,
      tags,
      keywords,
      hasCover,
      hasPdf,
      hasThumbnail,
      minPages,
      maxPages,
      minSize,
      maxSize,
      ...restFilter
    } = filter;

    const queryFilter: FilterQuery<IStoragePath> = {
      ...restFilter,
      isDeleted: false,
    };

    if (query) {
      queryFilter.$text = { $search: query };
    }

    if (type) queryFilter.type = type;
    if (status) queryFilter.status = status;
    if (language) queryFilter["metadata.language"] = language;
    if (author)
      queryFilter["metadata.author"] =
        author instanceof Types.ObjectId ? author : new Types.ObjectId(author);
    if (publisher)
      queryFilter["metadata.publisher"] =
        publisher instanceof Types.ObjectId
          ? publisher
          : new Types.ObjectId(publisher);
    if (category)
      queryFilter["metadata.category"] =
        category instanceof Types.ObjectId
          ? category
          : new Types.ObjectId(category);
    if (genre)
      queryFilter["metadata.genre"] =
        genre instanceof Types.ObjectId ? genre : new Types.ObjectId(genre);
    if (series)
      queryFilter["metadata.series"] =
        series instanceof Types.ObjectId ? series : new Types.ObjectId(series);
    if (collection)
      queryFilter["metadata.collection"] =
        collection instanceof Types.ObjectId
          ? collection
          : new Types.ObjectId(collection);
    if (publication)
      queryFilter["metadata.publication"] =
        publication instanceof Types.ObjectId
          ? publication
          : new Types.ObjectId(publication);
    if (issue)
      queryFilter["metadata.issue"] =
        issue instanceof Types.ObjectId ? issue : new Types.ObjectId(issue);
    if (book)
      queryFilter["metadata.book"] =
        book instanceof Types.ObjectId ? book : new Types.ObjectId(book);

    if (startDate || endDate) {
      queryFilter["metadata.issueDate"] = {};
      if (startDate) queryFilter["metadata.issueDate"].$gte = startDate;
      if (endDate) queryFilter["metadata.issueDate"].$lte = endDate;
    }

    if (tags && tags.length > 0) {
      queryFilter["metadata.tags"] = { $in: tags };
    }

    if (keywords && keywords.length > 0) {
      queryFilter["metadata.keywords"] = { $in: keywords };
    }

    if (hasCover !== undefined) {
      if (hasCover) {
        queryFilter["metadata.coverPath"] = { $exists: true, $ne: null };
      } else {
        queryFilter.$or = [
          { "metadata.coverPath": { $exists: false } },
          { "metadata.coverPath": null },
        ];
      }
    }

    if (hasPdf !== undefined) {
      if (hasPdf) {
        queryFilter["metadata.pdfPath"] = { $exists: true, $ne: null };
      } else {
        queryFilter.$or = [
          { "metadata.pdfPath": { $exists: false } },
          { "metadata.pdfPath": null },
        ];
      }
    }

    if (hasThumbnail !== undefined) {
      if (hasThumbnail) {
        queryFilter["metadata.thumbnailPath"] = { $exists: true, $ne: null };
      } else {
        queryFilter.$or = [
          { "metadata.thumbnailPath": { $exists: false } },
          { "metadata.thumbnailPath": null },
        ];
      }
    }

    if (minPages !== undefined || maxPages !== undefined) {
      queryFilter["metadata.pageCount"] = {};
      if (minPages !== undefined)
        queryFilter["metadata.pageCount"].$gte = minPages;
      if (maxPages !== undefined)
        queryFilter["metadata.pageCount"].$lte = maxPages;
    }

    if (minSize !== undefined || maxSize !== undefined) {
      queryFilter.size = {};
      if (minSize !== undefined) queryFilter.size.$gte = minSize;
      if (maxSize !== undefined) queryFilter.size.$lte = maxSize;
    }

    const sort = options.sort || { "metadata.issueDate": -1, createdAt: -1 };

    return super.findWithPagination(queryFilter, { ...options, sort });
  }

  async getFacets(): Promise<{
    types: Array<{ type: StorageType; count: number }>;
    statuses: Array<{ status: StorageStatus; count: number }>;
    languages: Array<{ language: string; count: number }>;
    authors: Array<{ author: Types.ObjectId; count: number }>;
    publishers: Array<{ publisher: Types.ObjectId; count: number }>;
    categories: Array<{ category: Types.ObjectId; count: number }>;
    genres: Array<{ genre: Types.ObjectId; count: number }>;
    series: Array<{ series: Types.ObjectId; count: number }>;
    collections: Array<{ collection: Types.ObjectId; count: number }>;
    tags: Array<{ tag: string; count: number }>;
    keywords: Array<{ keyword: string; count: number }>;
    yearRange: { min: number; max: number };
    pageRange: { min: number; max: number };
    sizeRange: { min: number; max: number };
  }> {
    const [
      types,
      statuses,
      languages,
      authors,
      publishers,
      categories,
      genres,
      series,
      collections,
      tags,
      keywords,
      yearRange,
      pageRange,
      sizeRange,
    ] = await Promise.all([
      this.model.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $project: { _id: 0, type: "$_id", count: 1 } },
        { $sort: { count: -1 } },
      ]),
      this.model.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
        { $sort: { count: -1 } },
      ]),
      this.model.aggregate([
        {
          $match: {
            isDeleted: false,
            "metadata.language": { $exists: true, $ne: null },
          },
        },
        { $group: { _id: "$metadata.language", count: { $sum: 1 } } },
        { $project: { _id: 0, language: "$_id", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]),
      this.model.aggregate([
        {
          $match: {
            isDeleted: false,
            "metadata.author": { $exists: true, $ne: null },
          },
        },
        { $group: { _id: "$metadata.author", count: { $sum: 1 } } },
        { $project: { _id: 0, author: "$_id", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]),
      this.model.aggregate([
        {
          $match: {
            isDeleted: false,
            "metadata.publisher": { $exists: true, $ne: null },
          },
        },
        { $group: { _id: "$metadata.publisher", count: { $sum: 1 } } },
        { $project: { _id: 0, publisher: "$_id", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]),
      this.model.aggregate([
        {
          $match: {
            isDeleted: false,
            "metadata.category": { $exists: true, $ne: null },
          },
        },
        { $group: { _id: "$metadata.category", count: { $sum: 1 } } },
        { $project: { _id: 0, category: "$_id", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]),
      this.model.aggregate([
        {
          $match: {
            isDeleted: false,
            "metadata.genre": { $exists: true, $ne: null },
          },
        },
        { $group: { _id: "$metadata.genre", count: { $sum: 1 } } },
        { $project: { _id: 0, genre: "$_id", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]),
      this.model.aggregate([
        {
          $match: {
            isDeleted: false,
            "metadata.series": { $exists: true, $ne: null },
          },
        },
        { $group: { _id: "$metadata.series", count: { $sum: 1 } } },
        { $project: { _id: 0, series: "$_id", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]),
      this.model.aggregate([
        {
          $match: {
            isDeleted: false,
            "metadata.collection": { $exists: true, $ne: null },
          },
        },
        { $group: { _id: "$metadata.collection", count: { $sum: 1 } } },
        { $project: { _id: 0, collection: "$_id", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ]),
      this.model.aggregate([
        {
          $match: {
            isDeleted: false,
            "metadata.tags": { $exists: true, $ne: [] },
          },
        },
        { $unwind: "$metadata.tags" },
        { $group: { _id: "$metadata.tags", count: { $sum: 1 } } },
        { $project: { _id: 0, tag: "$_id", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 100 },
      ]),
      this.model.aggregate([
        {
          $match: {
            isDeleted: false,
            "metadata.keywords": { $exists: true, $ne: [] },
          },
        },
        { $unwind: "$metadata.keywords" },
        { $group: { _id: "$metadata.keywords", count: { $sum: 1 } } },
        { $project: { _id: 0, keyword: "$_id", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 100 },
      ]),
      this.model.aggregate([
        {
          $match: {
            isDeleted: false,
            "metadata.issueDate": { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            min: { $min: { $year: "$metadata.issueDate" } },
            max: { $max: { $year: "$metadata.issueDate" } },
          },
        },
        { $project: { _id: 0, min: 1, max: 1 } },
      ]),
      this.model.aggregate([
        {
          $match: {
            isDeleted: false,
            "metadata.pageCount": { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            min: { $min: "$metadata.pageCount" },
            max: { $max: "$metadata.pageCount" },
          },
        },
        { $project: { _id: 0, min: 1, max: 1 } },
      ]),
      this.model.aggregate([
        { $match: { isDeleted: false, size: { $exists: true, $ne: null } } },
        {
          $group: { _id: null, min: { $min: "$size" }, max: { $max: "$size" } },
        },
        { $project: { _id: 0, min: 1, max: 1 } },
      ]),
    ]);

    return {
      types: types as any,
      statuses: statuses as any,
      languages: languages as any,
      authors: authors as any,
      publishers: publishers as any,
      categories: categories as any,
      genres: genres as any,
      series: series as any,
      collections: collections as any,
      tags: tags as any,
      keywords: keywords as any,
      yearRange: yearRange[0] || {
        min: new Date().getFullYear(),
        max: new Date().getFullYear(),
      },
      pageRange: pageRange[0] || { min: 0, max: 0 },
      sizeRange: sizeRange[0] || { min: 0, max: 0 },
    };
  }

  async getSuggestions(
    field: string,
    prefix: string,
    limit: number = 10,
  ): Promise<string[]> {
    const results = await this.model
      .aggregate([
        {
          $match: {
            isDeleted: false,
            [`metadata.${field}`]: { $regex: `^${prefix}`, $options: "i" },
          },
        },
        { $group: { _id: `$metadata.${field}`, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 0, value: "$_id" } },
      ])
      .exec();

    return results.map((r) => r.value).filter(Boolean);
  }

  async getPopularTags(
    limit: number = 50,
  ): Promise<Array<{ tag: string; count: number }>> {
    return this.model
      .aggregate([
        {
          $match: {
            isDeleted: false,
            "metadata.tags": { $exists: true, $ne: [] },
          },
        },
        { $unwind: "$metadata.tags" },
        { $group: { _id: "$metadata.tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 0, tag: "$_id", count: 1 } },
      ])
      .exec();
  }

  async getPopularKeywords(
    limit: number = 50,
  ): Promise<Array<{ keyword: string; count: number }>> {
    return this.model
      .aggregate([
        {
          $match: {
            isDeleted: false,
            "metadata.keywords": { $exists: true, $ne: [] },
          },
        },
        { $unwind: "$metadata.keywords" },
        { $group: { _id: "$metadata.keywords", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
        { $project: { _id: 0, keyword: "$_id", count: 1 } },
      ])
      .exec();
  }

  async getRecentAdditions(limit: number = 20): Promise<IStoragePath[]> {
    return this.model
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getRecentlyModified(limit: number = 20): Promise<IStoragePath[]> {
    return this.model
      .find({ isDeleted: false })
      .sort({ lastModified: -1 })
      .limit(limit)
      .exec();
  }

  async getByDateRange(
    startDate: Date,
    endDate: Date,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    return this.findWithPagination(
      {
        "metadata.issueDate": { $gte: startDate, $lte: endDate },
        isDeleted: false,
      },
      { ...options, sort: { "metadata.issueDate": -1 } },
    );
  }

  async getByLanguage(
    language: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    return this.findWithPagination(
      { "metadata.language": language, isDeleted: false },
      { ...options, sort: { "metadata.issueDate": -1 } },
    );
  }

  async getByAuthor(
    authorId: string | Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    return this.findWithPagination(
      {
        "metadata.author":
          authorId instanceof Types.ObjectId
            ? authorId
            : new Types.ObjectId(authorId),
        isDeleted: false,
      },
      { ...options, sort: { "metadata.issueDate": -1 } },
    );
  }

  async getByPublisher(
    publisherId: string | Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    return this.findWithPagination(
      {
        "metadata.publisher":
          publisherId instanceof Types.ObjectId
            ? publisherId
            : new Types.ObjectId(publisherId),
        isDeleted: false,
      },
      { ...options, sort: { "metadata.issueDate": -1 } },
    );
  }

  async getByCategory(
    categoryId: string | Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    return this.findWithPagination(
      {
        "metadata.category":
          categoryId instanceof Types.ObjectId
            ? categoryId
            : new Types.ObjectId(categoryId),
        isDeleted: false,
      },
      { ...options, sort: { "metadata.issueDate": -1 } },
    );
  }

  async getByGenre(
    genreId: string | Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    return this.findWithPagination(
      {
        "metadata.genre":
          genreId instanceof Types.ObjectId
            ? genreId
            : new Types.ObjectId(genreId),
        isDeleted: false,
      },
      { ...options, sort: { "metadata.issueDate": -1 } },
    );
  }

  async getBySeries(
    seriesId: string | Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    return this.findWithPagination(
      {
        "metadata.series":
          seriesId instanceof Types.ObjectId
            ? seriesId
            : new Types.ObjectId(seriesId),
        isDeleted: false,
      },
      { ...options, sort: { "metadata.issueDate": -1 } },
    );
  }

  async getByCollection(
    collectionId: string | Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    return this.findWithPagination(
      {
        "metadata.collection":
          collectionId instanceof Types.ObjectId
            ? collectionId
            : new Types.ObjectId(collectionId),
        isDeleted: false,
      },
      { ...options, sort: { "metadata.issueDate": -1 } },
    );
  }

  async getByPublication(
    publicationId: string | Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    return this.findWithPagination(
      {
        "metadata.publication":
          publicationId instanceof Types.ObjectId
            ? publicationId
            : new Types.ObjectId(publicationId),
        isDeleted: false,
      },
      { ...options, sort: { "metadata.issueDate": -1 } },
    );
  }

  async getByIssue(
    issueId: string | Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    return this.findWithPagination(
      {
        "metadata.issue":
          issueId instanceof Types.ObjectId
            ? issueId
            : new Types.ObjectId(issueId),
        isDeleted: false,
      },
      { ...options, sort: { "metadata.issueDate": -1 } },
    );
  }

  async getByBook(
    bookId: string | Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    return this.findWithPagination(
      {
        "metadata.book":
          bookId instanceof Types.ObjectId
            ? bookId
            : new Types.ObjectId(bookId),
        isDeleted: false,
      },
      { ...options, sort: { "metadata.issueDate": -1 } },
    );
  }
}

export const metadataRepository = new MetadataRepository();
