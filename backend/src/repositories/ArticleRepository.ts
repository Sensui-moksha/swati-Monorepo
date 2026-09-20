import { Types, FilterQuery, UpdateQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Article, IArticle, IArticleModel } from "../models/Article";

export interface ArticleFilter extends FilterQuery<IArticle> {
  search?: string;
  status?: string;
  category?: string | Types.ObjectId;
  tag?: string | Types.ObjectId;
  author?: string | Types.ObjectId;
  isFeatured?: boolean;
  isBreaking?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export class ArticleRepository extends BaseRepository<IArticle> {
  constructor() {
    super(Article);
  }

  async findBySlug(slug: string): Promise<IArticle | null> {
    const q = this.model.findOne({ slug });
    return typeof (q as any)?.populate === "function"
      ? (q as any).populate("author category tags").exec()
      : q.exec();
  }

  async findPublishedBySlug(slug: string): Promise<IArticle | null> {
    const q = this.model.findOne({ slug, status: "published" });
    return typeof (q as any)?.populate === "function"
      ? (q as any).populate("author category tags").exec()
      : q.exec();
  }

  async findWithPagination(
    filter: ArticleFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IArticle>> {
    const {
      search,
      status,
      category,
      tag,
      author,
      isFeatured,
      isBreaking,
      startDate,
      endDate,
      ...restFilter
    } = filter;
    const query: FilterQuery<IArticle> = { isDeleted: { $ne: true }, ...restFilter };

    if (search) {
      query.$text = { $search: search };
    }

    if (status) {
      query.status = status as any;
    }

    if (category) {
      query.category =
        category instanceof Types.ObjectId
          ? category
          : new Types.ObjectId(category);
    }

    if (tag) {
      query.tags =
        tag instanceof Types.ObjectId ? tag : new Types.ObjectId(tag);
    }

    if (author) {
      query.author =
        author instanceof Types.ObjectId ? author : new Types.ObjectId(author);
    }

    if (typeof isFeatured === "boolean") {
      query.isFeatured = isFeatured;
    }

    if (typeof isBreaking === "boolean") {
      query.isBreaking = isBreaking;
    }

    if (startDate || endDate) {
      query.publishedAt = {};
      if (startDate) query.publishedAt.$gte = startDate;
      if (endDate) query.publishedAt.$lte = endDate;
    }

    const sort = options.sort || { publishedAt: -1 };
    return super.findWithPagination(query, { ...options, sort });
  }

  async findByAuthor(
    authorId: string | Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IArticle>> {
    return this.findWithPagination(
      { author: authorId },
      { ...options, sort: options.sort || { createdAt: -1 } },
    );
  }

  async findByCategory(
    categoryId: string | Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IArticle>> {
    return this.findWithPagination(
      { category: categoryId, status: "published" },
      { ...options, sort: options.sort || { publishedAt: -1 } },
    );
  }

  async findByTag(
    tagId: string | Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IArticle>> {
    return this.findWithPagination(
      { tags: tagId, status: "published" },
      { ...options, sort: options.sort || { publishedAt: -1 } },
    );
  }

  async findFeatured(limit: number = 10): Promise<IArticle[]> {
    const articles = await (this.model as IArticleModel).findFeatured();
    return articles.slice(0, limit);
  }

  async findBreaking(limit: number = 5): Promise<IArticle[]> {
    const articles = await (this.model as IArticleModel).findBreaking();
    return articles.slice(0, limit);
  }

  async findScheduled(): Promise<IArticle[]> {
    return (this.model as IArticleModel).findScheduled();
  }

  async search(
    query: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IArticle>> {
    const articles = await (this.model as IArticleModel).search(query);
    const total = await this.model.countDocuments({
      $text: { $search: query },
      status: "published",
    });

    const page = options.page || 1;
    const limit = Math.min(options.limit || 10, 100);
    const totalPages = Math.ceil(total / limit);

    return {
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async incrementViewCount(
    articleId: string | Types.ObjectId,
  ): Promise<IArticle | null> {
    const id =
      articleId instanceof Types.ObjectId
        ? articleId
        : new Types.ObjectId(articleId);
    return (this.model as IArticleModel).incrementViewCount(id);
  }

  async incrementLikeCount(
    articleId: string | Types.ObjectId,
  ): Promise<IArticle | null> {
    const id =
      articleId instanceof Types.ObjectId
        ? articleId
        : new Types.ObjectId(articleId);
    return (this.model as IArticleModel).incrementLikeCount(id);
  }

  async incrementCommentCount(
    articleId: string | Types.ObjectId,
  ): Promise<IArticle | null> {
    const id =
      articleId instanceof Types.ObjectId
        ? articleId
        : new Types.ObjectId(articleId);
    return (this.model as IArticleModel).incrementCommentCount(id);
  }

  async incrementShareCount(
    articleId: string | Types.ObjectId,
  ): Promise<IArticle | null> {
    const id =
      articleId instanceof Types.ObjectId
        ? articleId
        : new Types.ObjectId(articleId);
    return (this.model as IArticleModel).incrementShareCount(id);
  }

  async getRelatedArticles(
    articleId: string | Types.ObjectId,
    categoryId?: string | Types.ObjectId,
    tags: (string | Types.ObjectId)[] = [],
    limit: number = 5,
  ): Promise<IArticle[]> {
    const artId =
      articleId instanceof Types.ObjectId
        ? articleId
        : new Types.ObjectId(articleId);
    const conditions: Record<string, unknown>[] = [];

    if (categoryId) {
      const catId =
        categoryId instanceof Types.ObjectId
          ? categoryId
          : new Types.ObjectId(categoryId);
      conditions.push({ category: catId });
    }

    if (tags.length > 0) {
      const tagIds = tags.map((t) =>
        t instanceof Types.ObjectId ? t : new Types.ObjectId(t),
      );
      conditions.push({ tags: { $in: tagIds } });
    }

    const query: Record<string, unknown> = {
      _id: { $ne: artId },
      status: "published",
    };

    if (conditions.length === 1) {
      Object.assign(query, conditions[0]);
    } else if (conditions.length > 1) {
      Object.assign(query, { $or: conditions });
    }

    return this.model.find(query).sort({ publishedAt: -1 }).limit(limit).exec();
  }

  async getArticlesByDateRange(
    startDate: Date,
    endDate: Date,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IArticle>> {
    return this.findWithPagination(
      {
        status: "published",
        publishedAt: { $gte: startDate, $lte: endDate },
      },
      { ...options, sort: options.sort || { publishedAt: -1 } },
    );
  }

  async getPublishedCount(): Promise<number> {
    return this.model.countDocuments({ status: "published" }).exec();
  }

  async getDraftCount(): Promise<number> {
    return this.model.countDocuments({ status: "draft" }).exec();
  }

  async getScheduledCount(): Promise<number> {
    return this.model
      .countDocuments({
        status: "published",
        scheduledAt: { $gt: new Date() },
      })
      .exec();
  }

  async getTotalViews(): Promise<number> {
    const result = await this.model
      .aggregate([
        { $match: { status: "published" } },
        { $group: { _id: null, total: { $sum: "$viewCount" } } },
      ])
      .exec();
    return result[0]?.total || 0;
  }

  async getTopViewed(limit: number = 10): Promise<IArticle[]> {
    return this.model
      .find({ status: "published" })
      .sort({ viewCount: -1 })
      .limit(limit)
      .exec();
  }

  async getTopLiked(limit: number = 10): Promise<IArticle[]> {
    return this.model
      .find({ status: "published" })
      .sort({ likeCount: -1 })
      .limit(limit)
      .exec();
  }

  async publishArticle(
    articleId: string | Types.ObjectId,
  ): Promise<IArticle | null> {
    return this.updateById(articleId, {
      status: "published",
      publishedAt: new Date(),
    } as UpdateQuery<IArticle>);
  }

  async unpublishArticle(
    articleId: string | Types.ObjectId,
  ): Promise<IArticle | null> {
    return this.updateById(articleId, {
      status: "draft",
      publishedAt: null,
    } as UpdateQuery<IArticle>);
  }

  async scheduleArticle(
    articleId: string | Types.ObjectId,
    scheduledAt: Date,
  ): Promise<IArticle | null> {
    return this.updateById(articleId, {
      status: "published",
      scheduledAt,
    } as UpdateQuery<IArticle>);
  }

  async addTag(
    articleId: string | Types.ObjectId,
    tagId: string | Types.ObjectId,
  ): Promise<IArticle | null> {
    return this.updateById(articleId, {
      $addToSet: { tags: tagId },
    } as UpdateQuery<IArticle>);
  }

  async removeTag(
    articleId: string | Types.ObjectId,
    tagId: string | Types.ObjectId,
  ): Promise<IArticle | null> {
    return this.updateById(articleId, {
      $pull: { tags: tagId },
    } as UpdateQuery<IArticle>);
  }
}

export const articleRepository = new ArticleRepository();
