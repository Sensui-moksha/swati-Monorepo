import { Types } from "mongoose";
import { ApiError } from "../middleware/errorHandler";
import { articleRepository } from "../repositories/ArticleRepository";
import { articleVersionRepository } from "../repositories/ArticleVersionRepository";
import { tagRepository } from "../repositories/TagRepository";
import { mediaRepository } from "../repositories/MediaRepository";
import { IArticle } from "../models/Article";

export interface ArticleInput extends Partial<IArticle> {
  tagNames?: string[];
}

const toObjectId = (value: string | Types.ObjectId) =>
  value instanceof Types.ObjectId ? value : new Types.ObjectId(value);

export class ArticleService {
  async createArticle(input: ArticleInput, userId?: string): Promise<IArticle> {
    const article = await articleRepository.create({
      ...input,
      author: input.author || (userId ? new Types.ObjectId(userId) : undefined),
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
      contentType: input.contentType || "article",
    } as Partial<IArticle>);

    if (input.tagNames?.length) {
      const tags = await tagRepository.findOrCreateMany(input.tagNames);
      await articleRepository.updateById(article._id, {
        tags: tags.map((tag) => tag._id),
      } as any);
    }

    await this.createVersion(article._id.toString(), article);
    return article;
  }

  async createNews(input: ArticleInput, userId?: string): Promise<IArticle> {
    return this.createArticle({ ...input, contentType: "news" }, userId);
  }

  async updateArticle(
    id: string,
    input: ArticleInput,
    userId?: string,
  ): Promise<IArticle> {
    const existing = await this.getArticleById(id);
    await this.createVersion(existing._id.toString(), existing);

    const updated = await articleRepository.updateById(existing._id, {
      ...input,
      updatedBy: userId ? new Types.ObjectId(userId) : existing.updatedBy,
    } as any);

    if (!updated) throw new ApiError(500, "Failed to update article");
    return updated;
  }

  async updateNews(
    id: string,
    input: ArticleInput,
    userId?: string,
  ): Promise<IArticle> {
    return this.updateArticle(id, { ...input, contentType: "news" }, userId);
  }

  async getArticleById(id: string): Promise<IArticle> {
    const article = await articleRepository.findById(id);
    if (!article) throw new ApiError(404, "Article not found");
    return article;
  }

  async getArticleBySlug(slug: string): Promise<IArticle> {
    const article =
      (await articleRepository.findPublishedBySlug(slug)) ||
      (await articleRepository.findBySlug(slug));
    if (!article) throw new ApiError(404, `Article with slug '${slug}' not found`);
    return article;
  }

  async listArticles(
    filter: Record<string, unknown> = {},
    page = 1,
    limit = 20,
  ) {
    return articleRepository.findWithPagination(filter as any, {
      page,
      limit,
      sort: { publishedAt: -1 },
    });
  }

  async listNews(filter: Record<string, unknown> = {}, page = 1, limit = 20) {
    return articleRepository.findWithPagination(
      { ...filter, contentType: "news" } as any,
      { page, limit, sort: { publishedAt: -1 } },
    );
  }

  async deleteArticle(id: string): Promise<void> {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      await articleRepository.deleteById(id);
    }
    await articleRepository.model.deleteMany({
      $or: [
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: new Types.ObjectId(id) }] : []),
        { slug: id },
      ],
    });
  }

  async restoreArticle(id: string): Promise<IArticle> {
    const restored = await articleRepository.updateById(id, {
      isDeleted: false,
      deletedAt: undefined,
    } as any);
    if (!restored) throw new ApiError(404, "Article not found");
    return restored;
  }

  async publishArticle(id: string, userId?: string): Promise<IArticle | null> {
    return articleRepository.updateById(id, {
      status: "published",
      publishedAt: new Date(),
      publishedBy: userId ? new Types.ObjectId(userId) : undefined,
    } as any);
  }

  async unpublishArticle(id: string): Promise<IArticle | null> {
    return articleRepository.updateById(id, {
      status: "draft",
      publishedAt: undefined,
    } as any);
  }

  async schedulePublication(
    id: string,
    scheduledAt: Date,
  ): Promise<IArticle | null> {
    return articleRepository.scheduleArticle(id, scheduledAt);
  }

  async archiveArticle(id: string): Promise<IArticle | null> {
    return articleRepository.updateById(id, { status: "archived" } as any);
  }

  async duplicateArticle(id: string, userId?: string): Promise<IArticle> {
    const source = await this.getArticleById(id);
    const copy = await articleRepository.create({
      ...source.toObject(),
      _id: undefined,
      title: `${source.title} (Copy)`,
      slug: `${source.slug}-copy-${Date.now()}`,
      status: "draft",
      publishedAt: undefined,
      scheduledAt: undefined,
      createdBy: userId ? new Types.ObjectId(userId) : source.createdBy,
      updatedBy: userId ? new Types.ObjectId(userId) : source.updatedBy,
    } as Partial<IArticle>);
    await this.createVersion(copy._id.toString(), copy);
    return copy;
  }

  async previewArticle(id: string): Promise<IArticle> {
    return this.getArticleById(id);
  }

  async submitForReview(id: string, userId?: string): Promise<IArticle | null> {
    return articleRepository.updateById(id, {
      status: "pending_review",
      reviewedBy: userId ? new Types.ObjectId(userId) : undefined,
      reviewedAt: new Date(),
    } as any);
  }

  async approveArticle(
    id: string,
    reviewerId?: string,
  ): Promise<IArticle | null> {
    return articleRepository.updateById(id, {
      status: "published",
      reviewedBy: reviewerId ? new Types.ObjectId(reviewerId) : undefined,
      reviewedAt: new Date(),
      publishedAt: new Date(),
    } as any);
  }

  async rejectArticle(
    id: string,
    reviewerId: string | undefined,
    reason: string,
  ): Promise<IArticle | null> {
    return articleRepository.updateById(id, {
      status: "rejected",
      reviewedBy: reviewerId ? new Types.ObjectId(reviewerId) : undefined,
      reviewedAt: new Date(),
      rejectedAt: new Date(),
      rejectionReason: reason,
    } as any);
  }

  async requestChanges(
    id: string,
    reviewerId: string | undefined,
    notes: string,
  ): Promise<IArticle | null> {
    return articleRepository.updateById(id, {
      status: "draft",
      reviewedBy: reviewerId ? new Types.ObjectId(reviewerId) : undefined,
      reviewedAt: new Date(),
      rejectionReason: notes,
    } as any);
  }

  async createVersion(articleId: string, snapshot: IArticle): Promise<void> {
    await articleVersionRepository.create({
      article: new Types.ObjectId(articleId),
      version: snapshot.version,
      title: snapshot.title,
      slug: snapshot.slug,
      subtitle: snapshot.subtitle,
      summary: snapshot.summary,
      content: snapshot.content,
      contentHtml: snapshot.contentHtml,
      excerpt: snapshot.excerpt,
      seoTitle: snapshot.seoTitle,
      seoDescription: snapshot.seoDescription,
      seoKeywords: snapshot.seoKeywords || [],
      canonicalUrl: snapshot.canonicalUrl,
      createdBy:
        snapshot.updatedBy instanceof Types.ObjectId
          ? snapshot.updatedBy
          : undefined,
    } as any);
  }

  async getVersions(articleId: string) {
    return articleVersionRepository.findByArticle(toObjectId(articleId));
  }

  async restoreVersion(
    articleId: string,
    version: number,
    userId?: string,
  ): Promise<IArticle> {
    const snapshot = await articleVersionRepository.findByArticleAndVersion(
      toObjectId(articleId),
      version,
    );
    if (!snapshot) throw new ApiError(404, "Version not found");
    const updated = await articleRepository.updateById(articleId, {
      title: snapshot.title,
      slug: snapshot.slug,
      subtitle: snapshot.subtitle,
      summary: snapshot.summary,
      content: snapshot.content,
      contentHtml: snapshot.contentHtml,
      excerpt: snapshot.excerpt,
      seoTitle: snapshot.seoTitle,
      seoDescription: snapshot.seoDescription,
      seoKeywords: snapshot.seoKeywords,
      canonicalUrl: snapshot.canonicalUrl,
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
    } as any);
    if (!updated) throw new ApiError(500, "Failed to restore version");
    return updated;
  }

  async compareVersions(
    articleId: string,
    fromVersion: number,
    toVersion: number,
  ) {
    const [from, to] = await Promise.all([
      articleVersionRepository.findByArticleAndVersion(
        toObjectId(articleId),
        fromVersion,
      ),
      articleVersionRepository.findByArticleAndVersion(
        toObjectId(articleId),
        toVersion,
      ),
    ]);
    if (!from || !to) throw new ApiError(404, "Version not found");
    return { from, to };
  }

  async getLatestArticles(limit = 10) {
    return articleRepository.findFeatured(limit);
  }
  async getFeaturedArticles(limit = 10) {
    return articleRepository.findFeatured(limit);
  }
  async getEditorsPicks(limit = 10) {
    return articleRepository.findFeatured(limit);
  }
  async getTrendingArticles(limit = 10) {
    return articleRepository.findBreaking(limit);
  }
  async getRelatedArticles(
    articleId: string,
    categoryId: string,
    tags: string[],
    limit = 5,
  ) {
    return articleRepository.getRelatedArticles(
      articleId,
      categoryId,
      tags,
      limit,
    );
  }

  async searchArticles(query: string, page = 1, limit = 20) {
    return articleRepository.search(query, { page, limit });
  }
  async searchNews(query: string, page = 1, limit = 20) {
    return articleRepository.search(query, { page, limit });
  }

  async getTags() {
    return tagRepository.getAllTagsSorted();
  }
  async getPopularTags(limit = 20) {
    return tagRepository.getPopularTags(limit);
  }
  async mergeTags(sourceTagId: string, targetTagId: string) {
    return tagRepository.mergeTags(sourceTagId, targetTagId);
  }

  async getMedia(filter: Record<string, unknown> = {}, page = 1, limit = 20) {
    return mediaRepository.findWithPagination(filter as any, { page, limit });
  }
  async getMediaByFolder(folder: string) {
    return mediaRepository.findByFolder(folder);
  }
  async getMediaPreview(mediaId: string) {
    return mediaRepository.findById(mediaId);
  }
  async getMediaUsage(userId?: string) {
    return userId
      ? mediaRepository.getStorageUsedByUser(userId)
      : mediaRepository.getTotalStorageUsed();
  }
}

export const articleService = new ArticleService();
