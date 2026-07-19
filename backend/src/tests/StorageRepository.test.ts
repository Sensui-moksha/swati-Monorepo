describe("StorageRepository", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("findByPath returns storage path when found", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePath = {
      _id: "507f1f77bcf86cd799439011",
      path: "/uploads/test.pdf",
      relativePath: "test.pdf",
    };
    StoragePath.StoragePath.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePath) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findByPath("/uploads/test.pdf");
    expect(res).toEqual(fakePath);
  });

  test("findByPath returns null when not found", async () => {
    const StoragePath = require("../models/StoragePath");
    StoragePath.StoragePath.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findByPath("/uploads/missing.pdf");
    expect(res).toBeNull();
  });

  test("findByRelativePath returns storage path when found", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePath = {
      _id: "507f1f77bcf86cd799439011",
      relativePath: "test.pdf",
    };
    StoragePath.StoragePath.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePath) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findByRelativePath("test.pdf");
    expect(res).toEqual(fakePath);
  });

  test("findByType returns paths by type", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [
      { _id: "507f1f77bcf86cd799439011", type: "file" },
      { _id: "507f1f77bcf86cd799439012", type: "file" },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
    });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findByType("file");
    expect(res).toEqual(fakePaths);
  });

  test("findByStatus returns paths by status", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [
      { _id: "507f1f77bcf86cd799439011", status: "active" },
      { _id: "507f1f77bcf86cd799439012", status: "active" },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
    });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findByStatus("active");
    expect(res).toEqual(fakePaths);
  });

  test("findByParent returns paths by parent", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [
      { _id: "507f1f77bcf86cd799439011", parent: "parent1" },
      { _id: "507f1f77bcf86cd799439012", parent: "parent1" },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
    });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findByParent("parent1");
    expect(res).toEqual(fakePaths);
  });

  test("findRootFolders returns root folders", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [
      { _id: "507f1f77bcf86cd799439011", parent: null, type: "folder" },
      { _id: "507f1f77bcf86cd799439012", parent: null, type: "folder" },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
    });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findRootFolders();
    expect(res).toEqual(fakePaths);
  });

  test("findMissingFiles returns missing files", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [
      { _id: "507f1f77bcf86cd799439011", status: "missing" },
      { _id: "507f1f77bcf86cd799439012", status: "missing" },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
    });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findMissingFiles();
    expect(res).toEqual(fakePaths);
  });

  test("findCorruptedFiles returns corrupted files", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [
      { _id: "507f1f77bcf86cd799439011", status: "corrupted" },
      { _id: "507f1f77bcf86cd799439012", status: "corrupted" },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
    });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findCorruptedFiles();
    expect(res).toEqual(fakePaths);
  });

  test("findProcessingFiles returns processing files", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [
      { _id: "507f1f77bcf86cd799439011", status: "processing" },
      { _id: "507f1f77bcf86cd799439012", status: "processing" },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
    });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findProcessingFiles();
    expect(res).toEqual(fakePaths);
  });

  test("findByChecksum returns path by checksum", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePath = { _id: "507f1f77bcf86cd799439011", checksum: "abc123" };
    StoragePath.StoragePath.find = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue([fakePath]) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findByChecksum("abc123");
    expect(res).toEqual([fakePath]);
  });

  test("findDuplicates returns duplicate files", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakeDuplicates = [
      { _id: "507f1f77bcf86cd799439011", checksum: "abc123", count: 2 },
      { _id: "507f1f77bcf86cd799439012", checksum: "def456", count: 3 },
    ];
    StoragePath.StoragePath.aggregate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeDuplicates) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findDuplicates();
    expect(res).toEqual(fakeDuplicates);
  });

  test("findByMetadata returns paths by metadata", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [
      { _id: "507f1f77bcf86cd799439011", metadata: { author: "John" } },
      { _id: "507f1f77bcf86cd799439012", metadata: { author: "John" } },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
    });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findByMetadata({ author: "John" });
    expect(res).toEqual(fakePaths);
  });

  test("findWithPagination returns paginated paths with filters", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [
      { _id: "1", type: "file" },
      { _id: "2", type: "file" },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
        }),
      }),
    });
    StoragePath.StoragePath.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(2) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findWithPagination(
      { type: "file" },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakePaths);
    expect(res.pagination.total).toBe(2);
    expect(res.pagination.totalPages).toBe(1);
  });

  test("findWithPagination filters by status", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [{ _id: "507f1f77bcf86cd799439011", status: "active" }];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
        }),
      }),
    });
    StoragePath.StoragePath.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findWithPagination(
      { status: "active" },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakePaths);
  });

  test("findWithPagination filters by parent", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [{ _id: "507f1f77bcf86cd799439011", parent: "parent1" }];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
        }),
      }),
    });
    StoragePath.StoragePath.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findWithPagination(
      { parent: "parent1" },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakePaths);
  });

  test("findWithPagination filters by checksum", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [{ _id: "507f1f77bcf86cd799439011", checksum: "abc123" }];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
        }),
      }),
    });
    StoragePath.StoragePath.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findWithPagination(
      { checksum: "abc123" },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakePaths);
  });

  test("findWithPagination filters by size range", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [{ _id: "507f1f77bcf86cd799439011", size: 1024 }];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
        }),
      }),
    });
    StoragePath.StoragePath.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findWithPagination(
      { minSize: 500, maxSize: 2000 },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakePaths);
  });

  test("findWithPagination filters by date range", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [
      { _id: "507f1f77bcf86cd799439011", createdAt: new Date("2024-01-15") },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
        }),
      }),
    });
    StoragePath.StoragePath.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findWithPagination(
      {
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
      },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakePaths);
  });

  test("findWithPagination filters by mime type", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [
      { _id: "507f1f77bcf86cd799439011", mimeType: "application/pdf" },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
        }),
      }),
    });
    StoragePath.StoragePath.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findWithPagination(
      { mimeType: "application/pdf" },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakePaths);
  });

  test("findWithPagination filters by isPublic", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [{ _id: "507f1f77bcf86cd799439011", isPublic: true }];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
        }),
      }),
    });
    StoragePath.StoragePath.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findWithPagination(
      { isPublic: true },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakePaths);
  });

  test("findWithPagination filters by tags", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [{ _id: "507f1f77bcf86cd799439011", tags: ["tag1"] }];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) }),
        }),
      }),
    });
    StoragePath.StoragePath.countDocuments = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findWithPagination(
      { tags: ["tag1"] },
      { page: 1, limit: 10 },
    );
    expect(res.data).toEqual(fakePaths);
  });

  test("getTree returns folder tree", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakeTree = [
      {
        _id: "507f1f77bcf86cd799439011",
        name: "Folder 1",
        children: [{ _id: "507f1f77bcf86cd799439012", name: "File 1" }],
      },
      { _id: "507f1f77bcf86cd799439013", name: "Folder 2", children: [] },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeTree) }),
    });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.getTree();
    expect(res).toEqual(fakeTree);
  });

  test("getFolderTree returns folder tree for specific folder", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakeTree = {
      _id: "507f1f77bcf86cd799439011",
      name: "Folder 1",
      children: [{ _id: "507f1f77bcf86cd799439012", name: "File 1" }],
    };
    StoragePath.StoragePath.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeTree) });
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.getFolderTree(
      "507f1f77bcf86cd799439011",
    );
    expect(res).toEqual(fakeTree);
  });

  test("getStorageStats returns storage statistics", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakeStats = {
      totalSize: 1024000,
      totalFiles: 100,
      totalFolders: 20,
      byType: [
        { type: "books", size: 512000, count: 50 },
        { type: "articles", size: 256000, count: 30 },
        { type: "media", size: 256000, count: 20 },
      ],
      byStatus: [{ status: "active", count: 120 }],
    };
    StoragePath.StoragePath.aggregate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue([fakeStats]) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.getStorageStats();
    expect(res).toEqual({
      totalSize: 1024000,
      totalFiles: 100,
      totalFolders: 20,
      byType: {
        weekly: { size: 0, count: 0 },
        monthly: { size: 0, count: 0 },
        books: { size: 512000, count: 50 },
        articles: { size: 256000, count: 30 },
        media: { size: 256000, count: 20 },
        other: { size: 0, count: 0 },
      },
      byStatus: {
        active: 120,
        archived: 0,
        missing: 0,
        corrupted: 0,
        processing: 0,
      },
    });
  });

  test("getFolderSize returns folder size", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakeFolder = { size: 512000, fileCount: 50, folderCount: 5 };
    StoragePath.StoragePath.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeFolder) });
    StoragePath.StoragePath.find = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.getFolderSize(
      "507f1f77bcf86cd799439011",
    );
    expect(res).toEqual({ size: 512000, fileCount: 50, folderCount: 5 });
  });

  test("updateScanInfo updates scan information", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePath = {
      _id: "507f1f77bcf86cd799439011",
      lastScanned: new Date(),
      scanStatus: "completed",
    };
    StoragePath.StoragePath.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePath) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.updateScanInfo(
      "507f1f77bcf86cd799439011",
      { scanStatus: "completed" },
    );
    expect(res).toEqual(fakePath);
  });

  test("bulkUpdateStatus updates status for multiple paths", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakeResult = { modifiedCount: 5 };
    StoragePath.StoragePath.updateMany = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeResult) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.bulkUpdateStatus(
      [
        "507f1f77bcf86cd799439011",
        "507f1f77bcf86cd799439012",
        "507f1f77bcf86cd799439013",
        "507f1f77bcf86cd799439014",
        "507f1f77bcf86cd799439015",
      ],
      "active",
    );
    expect(res).toEqual(5);
  });

  test("bulkUpdateParent updates parent for multiple paths", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakeResult = { modifiedCount: 3 };
    StoragePath.StoragePath.updateMany = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeResult) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.bulkUpdateParent(
      [
        "507f1f77bcf86cd799439011",
        "507f1f77bcf86cd799439012",
        "507f1f77bcf86cd799439013",
      ],
      "507f1f77bcf86cd799439014",
    );
    expect(res).toEqual(3);
  });

  test("findOrphanedFiles returns orphaned files", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePaths = [
      { _id: "507f1f77bcf86cd799439011", parent: "deleted" },
      { _id: "507f1f77bcf86cd799439012", parent: "deleted" },
    ];
    StoragePath.StoragePath.find = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePaths) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findOrphanedFiles();
    expect(res).toEqual(fakePaths);
  });

  test("getRecentScans returns recent scans", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakeScans = [
      { _id: "507f1f77bcf86cd799439011", lastScanned: new Date() },
      { _id: "507f1f77bcf86cd799439012", lastScanned: new Date() },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeScans) }),
      }),
    });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.getRecentScans(10);
    expect(res).toEqual(fakeScans);
  });

  test("getUnscannedFolders returns unscanned folders", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakeFolders = [
      { _id: "507f1f77bcf86cd799439011", type: "folder", lastScanned: null },
      { _id: "507f1f77bcf86cd799439012", type: "folder", lastScanned: null },
    ];
    StoragePath.StoragePath.find = jest.fn().mockReturnValue({
      sort: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeFolders) }),
    });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.getUnscannedFolders();
    expect(res).toEqual(fakeFolders);
  });

  test("inherits base repository methods", async () => {
    const StoragePath = require("../models/StoragePath");
    const fakePath = { _id: "507f1f77bcf86cd799439011", path: "/test.pdf" };
    StoragePath.StoragePath.findById = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(fakePath) });
    const { storageRepository } = require("../repositories/StorageRepository");
    const res = await storageRepository.findById("507f1f77bcf86cd799439011");
    expect(res).toEqual(fakePath);
  });
});
