import { Types } from "mongoose";
import { ApiError } from "../middleware/errorHandler";
import { userRepository } from "../repositories/UserRepository";
import { readingProgressRepository } from "../repositories/ReadingProgressRepository";
import { readingHistoryRepository } from "../repositories/ReadingHistoryRepository";
import { bookRepository } from "../repositories/BookRepository";
import { articleRepository } from "../repositories/ArticleRepository";
import { publicationRepository } from "../repositories/PublicationRepository";
import { magazineIssueRepository } from "../repositories/MagazineIssueRepository";
import { IBook } from "../models/Book";
import { IArticle } from "../models/Article";
import { IPublication } from "../models/Publication";
import { IMagazineIssue } from "../models/MagazineIssue";
import { IReadingHistory } from "../models/ReadingHistory";

type RecommendedContent = IBook | IArticle | IPublication | IMagazineIssue;

type TrendingRecommendations = {
  books: IBook[];
  articles: IArticle[];
};

export class RecommendationService {
  async getPersonalizedRecommendations(userId: Types.ObjectId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const allowRecommendations =
      user.preferences?.privacy?.allowRecommendations;
    if (allowRecommendations === false) {
      return {
        continueReading: [],
        similarToRecent: [],
        trending: { books: [], articles: [] },
      };
    }

    const [continueReading, recentReadings, trending] = await Promise.all([
      readingProgressRepository.findForContinueReading(userId, 3),
      readingHistoryRepository.findRecentlyViewed(userId, 5),
      this.getTrendingRecommendations(),
    ]);

    const similarToRecent = await this.getSimilarToRecent(recentReadings);

    return {
      continueReading,
      similarToRecent,
      trending,
    };
  }

  private async getSimilarToRecent(recentReadings: IReadingHistory[]) {
    const relatedItems: RecommendedContent[] = [];

    for (const reading of recentReadings.slice(0, 3)) {
      switch (reading.resourceType) {
        case "book": {
          const books = await bookRepository.getRelated(
            reading.resourceId,
            undefined,
            2,
          );
          relatedItems.push(...books);
          break;
        }
        case "article": {
          const article = await articleRepository.findById(reading.resourceId);
          if (!article) break;

          const categoryId =
            article.category && typeof article.category !== "object"
              ? article.category
              : (article.category as Types.ObjectId | undefined);

          const tagIds = (article.tags || []).map((tag) =>
            typeof tag === "object" ? tag._id : tag,
          );

          const articles = await articleRepository.getRelatedArticles(
            reading.resourceId,
            categoryId,
            tagIds,
            2,
          );
          relatedItems.push(...articles);
          break;
        }
        case "publication": {
          const publications = await publicationRepository.getLatest(2);
          relatedItems.push(...publications);
          break;
        }
        case "magazine_issue": {
          const issues = await magazineIssueRepository.getCurrent(2);
          relatedItems.push(...issues);
          break;
        }
        default:
          break;
      }
    }

    const uniqueItems: Record<string, RecommendedContent> = {};
    for (const item of relatedItems) {
      uniqueItems[item._id.toString()] = item;
    }

    return Object.values(uniqueItems).slice(0, 6);
  }

  private async getTrendingRecommendations(): Promise<TrendingRecommendations> {
    const [books, articles] = await Promise.all([
      bookRepository.getTrending(5),
      articleRepository.getTopViewed(5),
    ]);

    return { books, articles };
  }
}

export const recommendationService = new RecommendationService();
