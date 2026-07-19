import { Types } from "mongoose";
import { articleService } from "../services/articleService";
import { articleRepository } from "../repositories/ArticleRepository";
import { articleVersionRepository } from "../repositories/ArticleVersionRepository";
import { tagRepository } from "../repositories/TagRepository";

jest.mock("../repositories/ArticleRepository");
jest.mock("../repositories/ArticleVersionRepository");
jest.mock("../repositories/TagRepository");

const mockArticleRepository = articleRepository as jest.Mocked<
  typeof articleRepository
>;
const mockArticleVersionRepository = articleVersionRepository as jest.Mocked<
  typeof articleVersionRepository
>;
const mockTagRepository = tagRepository as jest.Mocked<typeof tagRepository>;

describe("ArticleService editorial workflow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates an article, attaches tags, and snapshots version 1", async () => {
    const articleId = new Types.ObjectId();
    const authorId = new Types.ObjectId();

    mockArticleRepository.create.mockResolvedValue({
      _id: articleId,
      title: "Draft Story",
      slug: "draft-story",
      content: "Body",
      version: 1,
    } as any);
    mockTagRepository.findOrCreateMany.mockResolvedValue([
      { _id: new Types.ObjectId(), name: "Politics", slug: "politics" } as any,
      { _id: new Types.ObjectId(), name: "Breaking", slug: "breaking" } as any,
    ]);
    mockArticleRepository.updateById.mockResolvedValue({
      _id: articleId,
    } as any);
    mockArticleVersionRepository.create.mockResolvedValue({} as any);

    const created = await articleService.createArticle(
      {
        title: "Draft Story",
        slug: "draft-story",
        content: "Body",
        author: authorId,
        tagNames: ["Politics", "Breaking"],
      } as any,
      authorId.toString(),
    );

    expect(created._id).toEqual(articleId);
    expect(mockTagRepository.findOrCreateMany).toHaveBeenCalledWith([
      "Politics",
      "Breaking",
    ]);
    expect(mockArticleRepository.updateById).toHaveBeenCalledWith(
      articleId,
      expect.objectContaining({ tags: expect.any(Array) }),
    );
    expect(mockArticleVersionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ article: articleId, version: 1 }),
    );
  });

  it("publishes an article with reviewer metadata", async () => {
    const articleId = new Types.ObjectId().toString();
    const reviewerId = new Types.ObjectId().toString();

    mockArticleRepository.updateById.mockResolvedValue({
      _id: new Types.ObjectId(articleId),
      status: "published",
    } as any);

    const updated = await articleService.publishArticle(articleId, reviewerId);

    expect(updated?.status).toBe("published");
    expect(mockArticleRepository.updateById).toHaveBeenCalledWith(
      articleId,
      expect.objectContaining({
        status: "published",
        publishedBy: expect.any(Types.ObjectId),
      }),
    );
  });

  it("restores a previous article version", async () => {
    const articleId = new Types.ObjectId().toString();

    mockArticleVersionRepository.findByArticleAndVersion.mockResolvedValue({
      title: "Restored title",
      slug: "restored-title",
      content: "Restored body",
    } as any);
    mockArticleRepository.updateById.mockResolvedValue({
      _id: new Types.ObjectId(articleId),
      title: "Restored title",
    } as any);

    const restored = await articleService.restoreVersion(
      articleId,
      2,
      "507f1f77bcf86cd799439011",
    );

    expect(restored.title).toBe("Restored title");
    expect(
      mockArticleVersionRepository.findByArticleAndVersion,
    ).toHaveBeenCalled();
    expect(mockArticleRepository.updateById).toHaveBeenCalledWith(
      articleId,
      expect.objectContaining({
        title: "Restored title",
        updatedBy: expect.any(Types.ObjectId),
      }),
    );
  });
});
