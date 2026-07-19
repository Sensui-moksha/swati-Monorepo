describe("BookRepository", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const validId = "507f1f77bcf86cd799439011";
  const validId2 = "507f1f77bcf86cd799439012";
  const validCategoryId = "507f1f77bcf86cd799439013";
  const validGenreId = "507f1f77bcf86cd799439014";
  const validAuthorId = "507f1f77bcf86cd799439015";
  const validPublisherId = "507f1f77bcf86cd799439016";
  const validSeriesId = "507f1f77bcf86cd799439017";
  const validPublicationId = "507f1f77bcf86cd799439018";

  test("findBySlug returns book when found", async () => {
    const Book = require("../models/Book");
    const fakeBook = { _id: validId, slug: "test-book", title: "Test Book" };
    Book.Book.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBook) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findBySlug("test-book");
    expect(res).toEqual(fakeBook);
  });

  test("findBySlug returns null when not found", async () => {
    const Book = require("../models/Book");
    Book.Book.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findBySlug("missing-book");
    expect(res).toBeNull();
  });

  test("findWithPagination returns paginated books with search", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [
      { _id: validId, title: "Test Book" },
      { _id: validId2, title: "Another Book" },
    ];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(2) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      { search: "test" },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
    expect(res.pagination.total).toBe(2);
    expect(res.pagination.totalPages).toBe(1);
  });

  test("findWithPagination filters by category", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [{ _id: validId, category: validCategoryId }];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      { category: validCategoryId },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
  });

  test("findWithPagination filters by genre", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [{ _id: validId, genre: validGenreId }];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      { genre: validGenreId },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
  });

  test("findWithPagination filters by author", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [{ _id: validId, author: validAuthorId }];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      { author: validAuthorId },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
  });

  test("findWithPagination filters by publisher", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [{ _id: validId, publisher: validPublisherId }];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      { publisher: validPublisherId },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
  });

  test("findWithPagination filters by language", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [{ _id: validId, language: "en" }];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      { language: "en" },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
  });

  test("findWithPagination filters by status", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [{ _id: validId, status: "published" }];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      { status: "published" },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
  });

  test("findWithPagination filters by isPremium", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [{ _id: validId, isPremium: true }];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      { isPremium: true },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
  });

  test("findWithPagination filters by isFeatured", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [{ _id: validId, isFeatured: true }];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      { isFeatured: true },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
  });

  test("findWithPagination filters by isTrending", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [{ _id: validId, isTrending: true }];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      { isTrending: true },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
  });

  test("findWithPagination filters by price range", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [{ _id: validId, price: 15 }];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      { minPrice: 10, maxPrice: 20 },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
  });

  test("findWithPagination filters by date range", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [{ _id: validId, publishedAt: new Date("2024-01-15") }];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      {
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
  });

  test("findWithPagination filters by series", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [{ _id: validId, series: validSeriesId }];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      { series: validSeriesId },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
  });

  test("findWithPagination filters by publication", async () => {
    const Book = require("../models/Book");
    const fakeBooks = [{ _id: validId, publication: validPublicationId }];
    Book.Book.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBooks) }),
        }),
      }),
    });
    Book.Book.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findWithPagination(
      { publication: validPublicationId },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeBooks);
  });

  test("inherits base repository methods", async () => {
    const Book = require("../models/Book");
    const fakeBook = { _id: validId, title: "Test Book" };
    Book.Book.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeBook) });
    const { bookRepository } = require("../repositories/BookRepository");
    const res = await bookRepository.findById(validId);
    expect(res).toEqual(fakeBook);
  });
});
