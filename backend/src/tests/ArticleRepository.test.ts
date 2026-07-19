describe("ArticleRepository", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const validId = "507f1f77bcf86cd799439011";
  const validId2 = "507f1f77bcf86cd799439012";
  const validId3 = "507f1f77bcf86cd799439013";

  test("findBySlug returns article when found", async () => {
    const Article = require("../models/Article");
    const fakeArticle = {
      _id: validId,
      slug: "test-article",
      title: "Test Article",
    };
    Article.Article.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeArticle) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findBySlug("test-article");
    expect(res).toEqual(fakeArticle);
  });

  test("findBySlug returns null when not found", async () => {
    const Article = require("../models/Article");
    Article.Article.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findBySlug("missing-article");
    expect(res).toBeNull();
  });

  test("findPublishedBySlug returns published article when found", async () => {
    const Article = require("../models/Article");
    const fakeArticle = {
      _id: validId,
      slug: "published-article",
      status: "published",
    };
    Article.Article.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeArticle) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res =
      await articleRepository.findPublishedBySlug("published-article");
    expect(res).toEqual(fakeArticle);
  });

  test("findPublishedBySlug returns null when not published", async () => {
    const Article = require("../models/Article");
    Article.Article.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findPublishedBySlug("draft-article");
    expect(res).toBeNull();
  });

  test("findWithPagination returns paginated articles with search", async () => {
    const Article = require("../models/Article");
    const fakeArticles = [
      { _id: validId, title: "Test Article" },
      { _id: "507f1f77bcf86cd799439012", title: "Another Article" },
    ];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(2) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findWithPagination(
      { search: "test" },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeArticles);
    expect(res.pagination.total).toBe(2);
    expect(res.pagination.totalPages).toBe(1);
  });

  test("findWithPagination filters by category", async () => {
    const Article = require("../models/Article");
    const validCategoryId = "507f1f77bcf86cd799439014";
    const fakeArticles = [{ _id: validId, category: validCategoryId }];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findWithPagination(
      { category: validCategoryId },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeArticles);
  });

  test("findWithPagination filters by author", async () => {
    const Article = require("../models/Article");
    const validAuthorId = "507f1f77bcf86cd799439015";
    const fakeArticles = [{ _id: validId, author: validAuthorId }];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findWithPagination(
      { author: validAuthorId },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeArticles);
  });

  test("findWithPagination filters by tag", async () => {
    const Article = require("../models/Article");
    const validTagId = "507f1f77bcf86cd799439016";
    const fakeArticles = [{ _id: validId, tags: [validTagId] }];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findWithPagination(
      { tag: validTagId },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeArticles);
  });

  test("findWithPagination filters by status", async () => {
    const Article = require("../models/Article");
    const fakeArticles = [{ _id: validId, status: "published" }];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findWithPagination(
      { status: "published" },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeArticles);
  });

  test("findWithPagination filters by isPremium", async () => {
    const Article = require("../models/Article");
    const fakeArticles = [{ _id: validId, isPremium: true }];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findWithPagination(
      { isPremium: true },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeArticles);
  });

  test("findWithPagination filters by isFeatured", async () => {
    const Article = require("../models/Article");
    const fakeArticles = [{ _id: validId, isFeatured: true }];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findWithPagination(
      { isFeatured: true },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeArticles);
  });

  test("findWithPagination filters by isBreaking", async () => {
    const Article = require("../models/Article");
    const fakeArticles = [{ _id: validId, isBreaking: true }];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findWithPagination(
      { isBreaking: true },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeArticles);
  });

  test("findWithPagination filters by date range", async () => {
    const Article = require("../models/Article");
    const fakeArticles = [
      { _id: validId, publishedAt: new Date("2024-01-15") },
    ];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findWithPagination(
      {
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeArticles);
  });

  test("findWithPagination filters by series", async () => {
    const Article = require("../models/Article");
    const validSeriesId = "507f1f77bcf86cd799439030";
    const fakeArticles = [{ _id: validId, series: validSeriesId }];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findWithPagination(
      { series: validSeriesId },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeArticles);
  });

  test("findWithPagination filters by publication", async () => {
    const Article = require("../models/Article");
    const validPublicationId = "507f1f77bcf86cd799439031";
    const fakeArticles = [{ _id: validId, publication: validPublicationId }];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findWithPagination(
      { publication: validPublicationId },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeArticles);
  });

  test("findByAuthor returns articles by author", async () => {
    const Article = require("../models/Article");
    const validAuthorId = "507f1f77bcf86cd799439020";
    const fakeArticles = [
      { _id: validId, author: validAuthorId },
      { _id: validId2, author: validAuthorId },
    ];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(2) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findByAuthor(validAuthorId, {
      limit: 10,
    });
    expect(res.data).toEqual(fakeArticles);
  });

  test("findByCategory returns articles by category", async () => {
    const Article = require("../models/Article");
    const validCategoryId = "507f1f77bcf86cd799439021";
    const fakeArticles = [
      { _id: validId, category: validCategoryId },
      { _id: validId2, category: validCategoryId },
    ];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(2) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findByCategory(validCategoryId, {
      limit: 10,
    });
    expect(res.data).toEqual(fakeArticles);
  });

  test("findByTag returns articles by tag", async () => {
    const Article = require("../models/Article");
    const validTagId = "507f1f77bcf86cd799439022";
    const fakeArticles = [
      { _id: validId, tags: [validTagId] },
      { _id: validId2, tags: [validTagId] },
    ];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(fakeArticles),
          }),
        }),
      }),
    });
    Article.Article.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(2) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findByTag(validTagId, { limit: 10 });
    expect(res.data).toEqual(fakeArticles);
  });

  test("findFeatured returns featured articles", async () => {
    const Article = require("../models/Article");
    const fakeArticles = [
      { _id: validId, isFeatured: true },
      { _id: validId2, isFeatured: true },
    ];
    Article.Article.findFeatured = jest.fn().mockResolvedValue(fakeArticles);
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findFeatured(5);
    expect(res).toEqual(fakeArticles.slice(0, 5));
  });

  test("findBreaking returns breaking articles", async () => {
    const Article = require("../models/Article");
    const fakeArticles = [
      { _id: validId, isBreaking: true },
      { _id: validId2, isBreaking: true },
    ];
    Article.Article.findBreaking = jest.fn().mockResolvedValue(fakeArticles);
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findBreaking(3);
    expect(res).toEqual(fakeArticles.slice(0, 3));
  });

  test("findScheduled returns scheduled articles", async () => {
    const Article = require("../models/Article");
    const fakeArticles = [
      { _id: validId, status: "scheduled" },
      { _id: validId2, status: "scheduled" },
    ];
    Article.Article.findScheduled = jest.fn().mockResolvedValue(fakeArticles);
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findScheduled();
    expect(res).toEqual(fakeArticles);
  });

  test("search returns paginated search results", async () => {
    const Article = require("../models/Article");
    const fakeArticles = [{ _id: validId, title: "Test Article" }];
    Article.Article.search = jest.fn().mockResolvedValue(fakeArticles);
    Article.Article.countDocuments = jest.fn().mockResolvedValue(1);
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.search("test query", {
      page: 1,
      limit: 10,
    });
    expect(res.data).toEqual(fakeArticles);
    expect(res.pagination.total).toBe(1);
  });

  test("incrementViewCount increments view count", async () => {
    const Article = require("../models/Article");
    const fakeArticle = { _id: validId, viewCount: 10 };
    Article.Article.incrementViewCount = jest
      .fn()
      .mockResolvedValue(fakeArticle);
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.incrementViewCount(validId);
    expect(res).toEqual(fakeArticle);
  });

  test("incrementLikeCount increments like count", async () => {
    const Article = require("../models/Article");
    const fakeArticle = { _id: validId, likeCount: 5 };
    Article.Article.incrementLikeCount = jest
      .fn()
      .mockResolvedValue(fakeArticle);
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.incrementLikeCount(validId);
    expect(res).toEqual(fakeArticle);
  });

  test("incrementCommentCount increments comment count", async () => {
    const Article = require("../models/Article");
    const fakeArticle = { _id: validId, commentCount: 3 };
    Article.Article.incrementCommentCount = jest
      .fn()
      .mockResolvedValue(fakeArticle);
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.incrementCommentCount(validId);
    expect(res).toEqual(fakeArticle);
  });

  test("incrementShareCount increments share count", async () => {
    const Article = require("../models/Article");
    const fakeArticle = { _id: validId, shareCount: 2 };
    Article.Article.incrementShareCount = jest
      .fn()
      .mockResolvedValue(fakeArticle);
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.incrementShareCount(validId);
    expect(res).toEqual(fakeArticle);
  });

  test("getRelatedArticles returns related articles by category", async () => {
    const Article = require("../models/Article");
    const validId2 = "507f1f77bcf86cd799439012";
    const validId3 = "507f1f77bcf86cd799439013";
    const catId = "507f1f77bcf86cd799439014";
    const fakeArticles = [
      { _id: validId2, category: catId },
      { _id: validId3, category: catId },
    ];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeArticles) }),
      }),
    });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.getRelatedArticles(
      validId,
      catId,
      [],
      5,
    );
    expect(res).toEqual(fakeArticles);
  });

  test("getRelatedArticles returns related articles by tags", async () => {
    const Article = require("../models/Article");
    const validId2 = "507f1f77bcf86cd799439012";
    const validId3 = "507f1f77bcf86cd799439013";
    const tagId = "507f1f77bcf86cd799439015";
    const fakeArticles = [
      { _id: validId2, tags: [tagId] },
      { _id: validId3, tags: [tagId] },
    ];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeArticles) }),
      }),
    });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.getRelatedArticles(
      validId,
      undefined,
      [tagId],
      5,
    );
    expect(res).toEqual(fakeArticles);
  });

  test("getRelatedArticles returns related articles by category and tags", async () => {
    const Article = require("../models/Article");
    const validId2 = "507f1f77bcf86cd799439012";
    const catId = "507f1f77bcf86cd799439014";
    const tagId = "507f1f77bcf86cd799439015";
    const fakeArticles = [{ _id: validId2, category: catId, tags: [tagId] }];
    Article.Article.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeArticles) }),
      }),
    });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.getRelatedArticles(
      validId,
      catId,
      [tagId],
      5,
    );
    expect(res).toEqual(fakeArticles);
  });

  test("inherits base repository methods", async () => {
    const Article = require("../models/Article");
    const fakeArticle = { _id: validId, title: "Test Article" };
    Article.Article.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeArticle) });
    const { articleRepository } = require("../repositories/ArticleRepository");
    const res = await articleRepository.findById(validId);
    expect(res).toEqual(fakeArticle);
  });
});
