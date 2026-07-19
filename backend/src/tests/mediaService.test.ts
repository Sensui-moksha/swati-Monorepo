describe("MediaService", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("listMedia returns paginated media", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    const fakeResult = {
      data: [{ _id: "1" }],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
    MediaRepository.mediaRepository.findWithPagination = jest
      .fn()
      .mockResolvedValue(fakeResult);
    const { mediaService } = require("../services/mediaService");
    const res = await mediaService.listMedia({}, 1, 20);
    expect(res).toEqual(fakeResult);
  });

  test("getMedia returns media when found", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    const fakeMedia = { _id: "1", url: "https://example.com/image.jpg" };
    MediaRepository.mediaRepository.findById = jest
      .fn()
      .mockResolvedValue(fakeMedia);
    const { mediaService } = require("../services/mediaService");
    const res = await mediaService.getMedia("1");
    expect(res).toEqual(fakeMedia);
  });

  test("getMedia throws when not found", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    MediaRepository.mediaRepository.findById = jest
      .fn()
      .mockResolvedValue(null);
    const { mediaService } = require("../services/mediaService");
    await expect(mediaService.getMedia("1")).rejects.toThrow("Media not found");
  });

  test("getByFolder returns media by folder", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    const fakeMedia = [{ _id: "1", folder: "uploads" }];
    MediaRepository.mediaRepository.findByFolder = jest
      .fn()
      .mockResolvedValue(fakeMedia);
    const { mediaService } = require("../services/mediaService");
    const res = await mediaService.getByFolder("uploads");
    expect(res).toEqual(fakeMedia);
  });

  test("getRecent returns recent uploads", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    const fakeMedia = [{ _id: "1" }, { _id: "2" }];
    MediaRepository.mediaRepository.getRecentUploads = jest
      .fn()
      .mockResolvedValue(fakeMedia);
    const { mediaService } = require("../services/mediaService");
    const res = await mediaService.getRecent(10);
    expect(res).toEqual(fakeMedia);
  });

  test("getStats returns media stats", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    const fakeStats = { totalFiles: 100, totalSize: 1024000, byType: [] };
    MediaRepository.mediaRepository.getMediaStats = jest
      .fn()
      .mockResolvedValue(fakeStats);
    const { mediaService } = require("../services/mediaService");
    const res = await mediaService.getStats();
    expect(res).toEqual(fakeStats);
  });

  test("getUsage returns total storage when no userId", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    MediaRepository.mediaRepository.getTotalStorageUsed = jest
      .fn()
      .mockResolvedValue(1024000);
    const { mediaService } = require("../services/mediaService");
    const res = await mediaService.getUsage();
    expect(res).toBe(1024000);
  });

  test("getUsage returns user storage when userId provided", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    MediaRepository.mediaRepository.getStorageUsedByUser = jest
      .fn()
      .mockResolvedValue(512000);
    const { mediaService } = require("../services/mediaService");
    const res = await mediaService.getUsage("507f1f77bcf86cd799439011");
    expect(res).toBe(512000);
  });

  test("updateMetadata updates and returns media", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    const fakeMedia = { _id: "1", altText: "Updated" };
    MediaRepository.mediaRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeMedia);
    const { mediaService } = require("../services/mediaService");
    const res = await mediaService.updateMetadata("1", { altText: "Updated" });
    expect(res).toEqual(fakeMedia);
  });

  test("updateMetadata throws when not found", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    MediaRepository.mediaRepository.updateById = jest
      .fn()
      .mockResolvedValue(null);
    const { mediaService } = require("../services/mediaService");
    await expect(
      mediaService.updateMetadata("1", { altText: "Updated" }),
    ).rejects.toThrow("Media not found");
  });

  test("deleteMedia deletes media", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    const fakeMedia = { _id: "1" };
    MediaRepository.mediaRepository.deleteById = jest
      .fn()
      .mockResolvedValue(fakeMedia);
    const { mediaService } = require("../services/mediaService");
    await mediaService.deleteMedia("1");
    expect(MediaRepository.mediaRepository.deleteById).toHaveBeenCalledWith(
      "1",
    );
  });

  test("deleteMedia throws when not found", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    MediaRepository.mediaRepository.deleteById = jest
      .fn()
      .mockResolvedValue(null);
    const { mediaService } = require("../services/mediaService");
    await expect(mediaService.deleteMedia("1")).rejects.toThrow(
      "Media not found",
    );
  });

  test("replaceMedia calls updateMetadata", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    const fakeMedia = { _id: "1", altText: "Replaced" };
    MediaRepository.mediaRepository.updateById = jest
      .fn()
      .mockResolvedValue(fakeMedia);
    const { mediaService } = require("../services/mediaService");
    const res = await mediaService.replaceMedia("1", { altText: "Replaced" });
    expect(res).toEqual(fakeMedia);
  });

  test("findByType returns paginated media by type", async () => {
    const MediaRepository = require("../repositories/MediaRepository");
    const fakeResult = {
      data: [{ _id: "1", mimeType: "image/jpeg" }],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
    MediaRepository.mediaRepository.findWithPagination = jest
      .fn()
      .mockResolvedValue(fakeResult);
    const { mediaService } = require("../services/mediaService");
    const res = await mediaService.findByType("image", 1, 20);
    expect(res).toEqual(fakeResult);
  });
});
