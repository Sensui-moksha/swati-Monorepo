import { RecommendationService } from "../services/RecommendationService";
import { recommendationService } from "../services/RecommendationService";
import { userRepository } from "../repositories/UserRepository";
import { readingProgressRepository } from "../repositories/ReadingProgressRepository";
import { readingHistoryRepository } from "../repositories/ReadingHistoryRepository";
import { bookRepository } from "../repositories/BookRepository";
import { articleRepository } from "../repositories/ArticleRepository";
import { publicationRepository } from "../repositories/PublicationRepository";
import { magazineIssueRepository } from "../repositories/MagazineIssueRepository";
import { Types } from "mongoose";

jest.mock("../repositories/UserRepository");
jest.mock("../repositories/ReadingProgressRepository");
jest.mock("../repositories/ReadingHistoryRepository");
jest.mock("../repositories/BookRepository");
jest.mock("../repositories/ArticleRepository");
jest.mock("../repositories/PublicationRepository");
jest.mock("../repositories/MagazineIssueRepository");

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockReadingProgressRepository = readingProgressRepository as jest.Mocked<
  typeof readingProgressRepository
>;
const mockReadingHistoryRepository = readingHistoryRepository as jest.Mocked<
  typeof readingHistoryRepository
>;
const mockBookRepository = bookRepository as jest.Mocked<typeof bookRepository>;
const mockArticleRepository = articleRepository as jest.Mocked<
  typeof articleRepository
>;
const mockPublicationRepository = publicationRepository as jest.Mocked<
  typeof publicationRepository
>;
const mockMagazineIssueRepository = magazineIssueRepository as jest.Mocked<
  typeof magazineIssueRepository
>;

describe("RecommendationService", () => {
  const userId = new Types.ObjectId();
  const user = {
    _id: userId,
    preferences: {
      privacy: { allowRecommendations: true },
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns empty recommendations when allowRecommendations is false", async () => {
    mockUserRepository.findById.mockResolvedValue({
      ...user,
      preferences: { privacy: { allowRecommendations: false } },
    } as any);

    const recommendations =
      await recommendationService.getPersonalizedRecommendations(userId);

    expect(recommendations.continueReading).toEqual([]);
    expect(recommendations.similarToRecent).toEqual([]);
    expect(recommendations.trending).toEqual({ books: [], articles: [] });
  });

  it("fetches continueReading, recentReadings, and trending recommendations", async () => {
    const recentHistory = [
      { resourceId: new Types.ObjectId(), resourceType: "book" } as any,
    ];

    mockUserRepository.findById.mockResolvedValue(user as any);
    mockReadingProgressRepository.findForContinueReading.mockResolvedValue([
      { _id: new Types.ObjectId(), user: userId } as any,
    ]);
    mockReadingHistoryRepository.findRecentlyViewed.mockResolvedValue(
      recentHistory as any,
    );
    mockBookRepository.getTrending.mockResolvedValue([
      { _id: new Types.ObjectId() } as any,
    ]);
    mockArticleRepository.getTopViewed.mockResolvedValue([
      { _id: new Types.ObjectId() } as any,
    ]);
    mockBookRepository.getRelated.mockResolvedValue([
      { _id: new Types.ObjectId() } as any,
    ]);

    const recommendations =
      await recommendationService.getPersonalizedRecommendations(userId);

    expect(recommendations.continueReading).toHaveLength(1);
    expect(recommendations.trending.books).toHaveLength(1);
    expect(recommendations.trending.articles).toHaveLength(1);
    expect(recommendations.similarToRecent).toHaveLength(1);
  });

  it("deduplicates similarToRecent items across related content", async () => {
    const resourceId = new Types.ObjectId();
    const recentHistory = [{ resourceId, resourceType: "article" } as any];

    mockUserRepository.findById.mockResolvedValue(user as any);
    mockReadingProgressRepository.findForContinueReading.mockResolvedValue([]);
    mockReadingHistoryRepository.findRecentlyViewed.mockResolvedValue(
      recentHistory as any,
    );
    mockArticleRepository.findById.mockResolvedValue({
      _id: resourceId,
      tags: [new Types.ObjectId()],
      category: new Types.ObjectId(),
    } as any);
    mockArticleRepository.getRelatedArticles.mockResolvedValue([
      { _id: new Types.ObjectId() } as any,
      { _id: new Types.ObjectId() } as any,
    ]);
    mockBookRepository.getTrending.mockResolvedValue([]);
    mockArticleRepository.getTopViewed.mockResolvedValue([]);

    const recommendations =
      await recommendationService.getPersonalizedRecommendations(userId);

    expect(recommendations.similarToRecent.length).toBeGreaterThan(0);
  });
});
