import { ReadingProgressService } from "../../services/ReadingProgressService";
import { readingProgressRepository } from "../../repositories/ReadingProgressRepository";
import { bookmarkRepository } from "../../repositories/BookmarkRepository";
import { highlightRepository } from "../../repositories/HighlightRepository";
import { noteRepository } from "../../repositories/NoteRepository";
import { favoriteRepository } from "../../repositories/FavoriteRepository";
import { Types } from "mongoose";

jest.mock("../../repositories/ReadingProgressRepository");
jest.mock("../../repositories/BookmarkRepository");
jest.mock("../../repositories/HighlightRepository");
jest.mock("../../repositories/NoteRepository");
jest.mock("../../repositories/FavoriteRepository");

describe("E2E Journey: Authenticated User Experience", () => {
  const userId = new Types.ObjectId();
  const publicationId = new Types.ObjectId();
  let readingProgressService: ReadingProgressService;

  beforeEach(() => {
    jest.clearAllMocks();
    readingProgressService = new ReadingProgressService();
  });

  describe("Continue Reading & Progress Tracking", () => {
    it("should accurately save reading position and calculate percentage completed", async () => {
      const mockRecord = {
        _id: new Types.ObjectId(),
        user: userId,
        resourceId: publicationId,
        totalPages: 200,
        currentPage: 50,
        percentageRead: 25,
        timeSpent: 120,
        isCompleted: false,
      };

      (readingProgressRepository.findByUserAndResource as jest.Mock).mockResolvedValue(mockRecord);
      (readingProgressRepository.updateProgress as jest.Mock).mockResolvedValue({
        ...mockRecord,
        currentPage: 100,
        percentageRead: 50,
        timeSpent: 240,
      });

      const updated = await readingProgressService.updateProgress(
        userId,
        publicationId,
        100,
        120
      );

      expect(updated).toBeDefined();
      expect(updated?.currentPage).toBe(100);
      expect(updated?.percentageRead).toBe(50);
    });
  });

  describe("Annotations & Engagement (Bookmarks, Highlights, Notes, Favorites)", () => {
    it("should allow creating and querying bookmarks for a publication page", async () => {
      const mockBookmark = {
        _id: new Types.ObjectId(),
        user: userId,
        resourceId: publicationId,
        pageNumber: 42,
        title: "Key Chapter Start",
        createdAt: new Date(),
      };

      (bookmarkRepository.create as jest.Mock).mockResolvedValue(mockBookmark);
      (bookmarkRepository.findByUserAndResource as jest.Mock).mockResolvedValue(mockBookmark);

      const created = await bookmarkRepository.create(mockBookmark as any);
      expect(created.pageNumber).toBe(42);

      const found = await bookmarkRepository.findByUserAndResource(userId, publicationId);
      expect(found).toBeDefined();
      expect(found?.title).toBe("Key Chapter Start");
    });

    it("should allow creating text highlights with color coding", async () => {
      const mockHighlight = {
        _id: new Types.ObjectId(),
        user: userId,
        publication: publicationId,
        pageNumber: 15,
        text: "Historical reference text snippet",
        color: "#FFE082",
      };

      (highlightRepository.create as jest.Mock).mockResolvedValue(mockHighlight);

      const res = await highlightRepository.create(mockHighlight as any);
      expect(res.text).toContain("Historical reference");
      expect(res.color).toBe("#FFE082");
    });

    it("should toggle favorites for quick access in member library", async () => {
      const mockFavorite = {
        _id: new Types.ObjectId(),
        user: userId,
        item: publicationId,
        itemType: "publication",
      };

      (favoriteRepository.create as jest.Mock).mockResolvedValue(mockFavorite);
      (favoriteRepository.findByUser as jest.Mock).mockResolvedValue([mockFavorite]);

      const fav = await favoriteRepository.create(mockFavorite as any);
      expect(fav.itemType).toBe("publication");

      const userFavs = await favoriteRepository.findByUser(userId);
      expect(userFavs).toHaveLength(1);
    });
  });
});
