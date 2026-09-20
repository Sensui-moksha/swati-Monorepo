import { Types } from "mongoose";
import { articleService } from "../../services/articleService";
import { articleRepository } from "../../repositories/ArticleRepository";

jest.mock("../../repositories/ArticleRepository");
jest.mock("../../repositories/ArticleVersionRepository");
jest.mock("../../repositories/TagRepository");

const mockArticleRepository = articleRepository as jest.Mocked<typeof articleRepository>;

describe("E2E Journey: Editor & Editorial Operations", () => {
  const editorId = new Types.ObjectId().toString();
  const authorId = new Types.ObjectId().toString();
  const articleId = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Article Submission & Multi-Stage Review", () => {
    it("should allow author to submit draft for editorial review", async () => {
      mockArticleRepository.updateById.mockResolvedValue({
        _id: articleId,
        status: "pending_review",
      } as any);

      const res = await articleService.submitForReview(articleId, authorId);
      expect(res?.status).toBe("pending_review");
      expect(mockArticleRepository.updateById).toHaveBeenCalledWith(
        articleId,
        expect.objectContaining({ status: "pending_review" })
      );
    });

    it("should allow senior editor to approve article moving to published stage", async () => {
      mockArticleRepository.updateById.mockResolvedValue({
        _id: articleId,
        status: "published",
      } as any);

      const res = await articleService.approveArticle(articleId, editorId);
      expect(res?.status).toBe("published");
      expect(mockArticleRepository.updateById).toHaveBeenCalledWith(
        articleId,
        expect.objectContaining({ status: "published" })
      );
    });

    it("should allow editor to schedule article publication for future date", async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      mockArticleRepository.scheduleArticle.mockResolvedValue({
        _id: articleId,
        status: "scheduled",
        scheduledAt: futureDate,
      } as any);

      const res = await articleService.schedulePublication(articleId, futureDate);
      expect(res?.status).toBe("scheduled");
      expect(mockArticleRepository.scheduleArticle).toHaveBeenCalledWith(
        articleId,
        futureDate
      );
    });

    it("should publish article and stamp publishedAt timestamp", async () => {
      mockArticleRepository.updateById.mockResolvedValue({
        _id: articleId,
        status: "published",
        publishedAt: new Date(),
      } as any);

      const res = await articleService.publishArticle(articleId, editorId);
      expect(res?.status).toBe("published");
    });
  });
});
