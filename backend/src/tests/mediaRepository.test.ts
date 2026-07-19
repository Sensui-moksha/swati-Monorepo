describe("MediaRepository", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  // Helper to create a thenable mock for Mongoose queries
  const createQueryMock = (resolvedValue: any) => {
    const mockQuery = {
      exec: jest.fn().mockResolvedValue(resolvedValue),
      then: jest.fn((resolve) => Promise.resolve(resolvedValue).then(resolve)),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };
    return mockQuery;
  };

  // Valid ObjectId string for testing
  const validObjectId = "507f1f77bcf86cd799439011";

  test("findByUrl returns media when found", async () => {
    const Media = require("../models/Media");
    const fakeMedia = { _id: "1", url: "https://example.com/image.jpg" };
    Media.Media.findOne = jest.fn().mockReturnValue(createQueryMock(fakeMedia));
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.findByUrl(
      "https://example.com/image.jpg",
    );
    expect(res).toEqual(fakeMedia);
  });

  test("findByUrl returns null when not found", async () => {
    const Media = require("../models/Media");
    Media.Media.findOne = jest.fn().mockReturnValue(createQueryMock(null));
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.findByUrl(
      "https://example.com/missing.jpg",
    );
    expect(res).toBeNull();
  });

  test("findByFolder returns media in folder", async () => {
    const Media = require("../models/Media");
    const fakeMedia = [
      { _id: "1", folder: "uploads" },
      { _id: "2", folder: "uploads" },
    ];
    Media.Media.find = jest.fn().mockReturnValue(createQueryMock(fakeMedia));
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.findByFolder("uploads");
    expect(res).toEqual(fakeMedia);
  });

  test("findWithPagination returns paginated media", async () => {
    const Media = require("../models/Media");
    const fakeMedia = [{ _id: "1" }, { _id: "2" }];
    const mockQuery = createQueryMock(fakeMedia);
    Media.Media.find = jest.fn().mockReturnValue(mockQuery);
    Media.Media.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(2) });
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.findWithPagination(
      {},
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakeMedia);
    expect(res.pagination.total).toBe(2);
  });

  test("findByUploadedBy returns paginated media by user", async () => {
    const Media = require("../models/Media");
    const fakeMedia = [{ _id: "1", uploadedBy: validObjectId }];
    const mockQuery = createQueryMock(fakeMedia);
    Media.Media.find = jest.fn().mockReturnValue(mockQuery);
    Media.Media.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.findByUploadedBy(validObjectId, {
      page: 1,
      limit: 10,
    });
    expect(res.data).toEqual(fakeMedia);
  });

  test("findByMimeType returns paginated media by type", async () => {
    const Media = require("../models/Media");
    const fakeMedia = [{ _id: "1", mimeType: "image/jpeg" }];
    const mockQuery = createQueryMock(fakeMedia);
    Media.Media.find = jest.fn().mockReturnValue(mockQuery);
    Media.Media.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.findByMimeType("image", {
      page: 1,
      limit: 10,
    });
    expect(res.data).toEqual(fakeMedia);
  });

  test("findImages returns images", async () => {
    const Media = require("../models/Media");
    const fakeMedia = [{ _id: "1", mimeType: "image/jpeg" }];
    const mockQuery = createQueryMock(fakeMedia);
    Media.Media.find = jest.fn().mockReturnValue(mockQuery);
    Media.Media.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.findImages({ page: 1, limit: 10 });
    expect(res.data).toEqual(fakeMedia);
  });

  test("findVideos returns videos", async () => {
    const Media = require("../models/Media");
    const fakeMedia = [{ _id: "1", mimeType: "video/mp4" }];
    const mockQuery = createQueryMock(fakeMedia);
    Media.Media.find = jest.fn().mockReturnValue(mockQuery);
    Media.Media.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.findVideos({ page: 1, limit: 10 });
    expect(res.data).toEqual(fakeMedia);
  });

  test("findDocuments returns documents", async () => {
    const Media = require("../models/Media");
    const fakeMedia = [{ _id: "1", mimeType: "application/pdf" }];
    const mockQuery = createQueryMock(fakeMedia);
    Media.Media.find = jest.fn().mockReturnValue(mockQuery);
    Media.Media.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.findDocuments({ page: 1, limit: 10 });
    expect(res.data).toEqual(fakeMedia);
  });

  test("getTotalStorageUsed returns total size", async () => {
    const Media = require("../models/Media");
    Media.Media.aggregate = jest.fn().mockResolvedValue([{ total: 1024000 }]);
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.getTotalStorageUsed();
    expect(res).toBe(1024000);
  });

  test("getTotalStorageUsed returns 0 when no media", async () => {
    const Media = require("../models/Media");
    Media.Media.aggregate = jest.fn().mockResolvedValue([]);
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.getTotalStorageUsed();
    expect(res).toBe(0);
  });

  test("getStorageUsedByUser returns user storage", async () => {
    const Media = require("../models/Media");
    Media.Media.aggregate = jest.fn().mockResolvedValue([{ total: 512000 }]);
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.getStorageUsedByUser(validObjectId);
    expect(res).toBe(512000);
  });

  test("getStorageUsedByType returns storage by type", async () => {
    const Media = require("../models/Media");
    Media.Media.aggregate = jest
      .fn()
      .mockResolvedValue([
        { mimeType: "image", totalSize: 1024000, count: 10 },
      ]);
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.getStorageUsedByType();
    expect(res).toHaveLength(1);
    expect(res[0].mimeType).toBe("image");
  });

  test("getRecentUploads returns recent media", async () => {
    const Media = require("../models/Media");
    const fakeMedia = [{ _id: "1" }, { _id: "2" }];
    Media.Media.find = jest.fn().mockReturnValue(createQueryMock(fakeMedia));
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.getRecentUploads(2);
    expect(res).toEqual(fakeMedia);
  });

  test("getMediaStats returns stats", async () => {
    const Media = require("../models/Media");
    Media.Media.countDocuments = jest.fn().mockResolvedValue(100);
    Media.Media.aggregate = jest
      .fn()
      .mockResolvedValueOnce([{ total: 1024000 }])
      .mockResolvedValueOnce([
        { mimeType: "image", totalSize: 512000, count: 50 },
      ]);
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.getMediaStats();
    expect(res.totalFiles).toBe(100);
    expect(res.totalSize).toBe(1024000);
    expect(res.byType).toHaveLength(1);
  });

  test("updateAltText updates alt text", async () => {
    const Media = require("../models/Media");
    const fakeMedia = { _id: "1", altText: "Updated alt" };
    Media.Media.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeMedia) });
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.updateAltText("1", "Updated alt");
    expect(res).toEqual(fakeMedia);
  });

  test("updateThumbnail updates thumbnail", async () => {
    const Media = require("../models/Media");
    const fakeMedia = {
      _id: "1",
      thumbnailUrl: "https://example.com/thumb.jpg",
    };
    Media.Media.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeMedia) });
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.updateThumbnail(
      "1",
      "https://example.com/thumb.jpg",
    );
    expect(res).toEqual(fakeMedia);
  });

  test("deleteOldFiles deletes and returns count", async () => {
    const Media = require("../models/Media");
    Media.Media.deleteMany = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 5 }),
    });
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.deleteOldFiles(new Date("2024-01-01"));
    expect(res).toBe(5);
  });

  test("findOrphanedMedia returns orphaned media", async () => {
    const Media = require("../models/Media");
    const Article = require("../models/Article");
    Article.Article.distinct = jest
      .fn()
      .mockResolvedValueOnce(["img1.jpg"])
      .mockResolvedValueOnce(["thumb1.jpg"]);
    Media.Media.find = jest
      .fn()
      .mockReturnValue(createQueryMock([{ _id: "2", url: "img2.jpg" }]));
    const { mediaRepository } = require("../repositories/MediaRepository");
    const res = await mediaRepository.findOrphanedMedia();
    expect(res).toHaveLength(1);
    expect(res[0].url).toBe("img2.jpg");
  });
});
