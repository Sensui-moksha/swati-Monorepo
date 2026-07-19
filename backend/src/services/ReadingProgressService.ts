import { Types } from "mongoose";
import { ApiError } from "../middleware/errorHandler";
import { readingProgressRepository } from "../repositories/ReadingProgressRepository";
import { IReadingProgress } from "../models/ReadingProgress";
import { bookRepository } from "../repositories/BookRepository";
import { publicationRepository } from "../repositories/PublicationRepository";
import { magazineIssueRepository } from "../repositories/MagazineIssueRepository";
import { articleRepository } from "../repositories/ArticleRepository";
import { userProfileService } from "./UserProfileService";

export class ReadingProgressService {
  async startReading(
    userId: Types.ObjectId,
    data: Partial<IReadingProgress>,
  ): Promise<IReadingProgress> {
    if (!data.resourceId || !data.totalPages) {
      throw new ApiError(400, "resourceId and totalPages are required");
    }

    const existing = await readingProgressRepository.findByUserAndResource(
      userId,
      data.resourceId,
    );
    if (existing && !existing.isCompleted) {
      throw new ApiError(409, "Already reading this resource");
    }

    return readingProgressRepository.create({ ...data, user: userId });
  }

  async updateProgress(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
    currentPage: number,
    timeSpent = 0,
  ): Promise<IReadingProgress | null> {
    const progress = await readingProgressRepository.findByUserAndResource(
      userId,
      resourceId,
    );
    if (!progress) {
      throw new ApiError(404, "Reading progress not found");
    }

    const totalPages = progress.totalPages || 1;
    const safeCurrentPage = Math.max(0, Math.min(currentPage, totalPages));
    const percentageRead =
      totalPages > 0 ? Math.round((safeCurrentPage / totalPages) * 100) : 0;

    return readingProgressRepository.updateProgress(userId, resourceId, {
      currentPage: safeCurrentPage,
      percentageRead,
      timeSpent: (progress.timeSpent || 0) + timeSpent,
    });
  }

  async completeReading(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<IReadingProgress | null> {
    const progress = await readingProgressRepository.findByUserAndResource(
      userId,
      resourceId,
    );
    if (!progress) {
      throw new ApiError(404, "Reading progress not found");
    }

    return readingProgressRepository.updateById(progress._id, {
      isCompleted: true,
      percentageRead: 100,
      currentPage: progress.totalPages,
      completedAt: new Date(),
    }) as Promise<IReadingProgress>;
  }

  async getActiveReadings(userId: Types.ObjectId, page = 1, limit = 20) {
    return readingProgressRepository.findActiveByUser(userId, { page, limit });
  }

  async getCompletedReadings(userId: Types.ObjectId, page = 1, limit = 20) {
    return readingProgressRepository.findCompletedByUser(userId, {
      page,
      limit,
    });
  }

  async getContinueReading(
    userId: Types.ObjectId,
    limit = 10,
  ): Promise<IReadingProgress[]> {
    return readingProgressRepository.findForContinueReading(userId, limit);
  }

  async getProgress(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<IReadingProgress | null> {
    return readingProgressRepository.findByUserAndResource(userId, resourceId);
  }

  async deleteProgress(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<void> {
    await readingProgressRepository.deleteByUserAndResource(userId, resourceId);
  }

  async deleteCompleted(userId: Types.ObjectId): Promise<void> {
    await readingProgressRepository.deleteCompleted(userId);
  }

  async getStats(userId: Types.ObjectId) {
    const activeCount =
      await readingProgressRepository.countActiveByUser(userId);
    const completedCount =
      await readingProgressRepository.countCompletedByUser(userId);

    return {
      activeCount,
      completedCount,
      totalBooks: activeCount + completedCount,
    };
  }

  async getReaderContent(resourceId: Types.ObjectId, resourceType: string) {
    switch (resourceType) {
      case "book":
        return bookRepository.findById(resourceId);
      case "publication":
        return publicationRepository.findById(resourceId);
      case "magazine_issue":
        return magazineIssueRepository.findById(resourceId);
      case "article":
        return articleRepository.findById(resourceId);
      default:
        return null;
    }
  }

  async getRelatedContent(
    resourceId: Types.ObjectId,
    resourceType: string,
    limit = 6,
  ) {
    switch (resourceType) {
      case "book": {
        const book = await bookRepository.findById(resourceId);
        return bookRepository.getRelated(resourceId, book?.category, limit);
      }
      case "publication":
        return publicationRepository.getLatest(limit);
      case "magazine_issue":
        return magazineIssueRepository.getCurrent(limit);
      case "article": {
        const article = await articleRepository.findById(resourceId);
        const categoryId = article?.category
          ? typeof article.category === "object"
            ? article.category._id
            : article.category
          : "";
        const tagIds = (article?.tags || []).map((t) =>
          typeof t === "object" ? t._id : t,
        );
        return articleRepository.getRelatedArticles(
          resourceId,
          categoryId,
          tagIds,
          limit,
        );
      }
      default:
        return [];
    }
  }

  async updateReadingPreferences(
    userId: Types.ObjectId,
    preferences: Record<string, unknown>,
  ) {
    return userProfileService.updateReadingPreferences(userId, preferences);
  }
}

export const readingProgressService = new ReadingProgressService();
