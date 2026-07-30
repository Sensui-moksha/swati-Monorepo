import fs from "fs";
import path from "path";
import os from "os";
import { HotCacheService } from "../services/HotCacheService";


// Override env for tests
jest.mock("../config/index", () => ({

  env: {
    PDF_SSD_CACHE_DIR: "",         // filled in beforeAll
    PDF_CACHE_MAX_SIZE_GB: 0.001,  // 1MB cap for testing
    PDF_CACHE_TTL_HOURS: 1,
    PDF_HOT_FILE_THRESHOLD: 10,
  },
}));

jest.mock("../repositories/StreamingRepository", () => ({

  streamingRepository: {
    findHotFiles: jest.fn().mockResolvedValue([]),
    updateCacheStatus: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("HotCacheService", () => {
  let tmpDir: string;
  let cacheDir: string;
  let svc: HotCacheService;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdf-cache-test-"));
    cacheDir = path.join(tmpDir, "cache");
    fs.mkdirSync(cacheDir, { recursive: true });

    // Point env to our temp dir
    const { env } = require("../config/index");

    env.PDF_SSD_CACHE_DIR = cacheDir;

    svc = new HotCacheService();
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const createTestPDF = (name: string, sizeKB = 10): string => {
    const p = path.join(tmpDir, name);
    fs.writeFileSync(p, Buffer.alloc(sizeKB * 1024, 0x25)); // filled with %
    return p;
  };

  it("returns cached: false for uncached file", async () => {
    const result = await svc.isCached("/storage/test/file.pdf");
    expect(result.cached).toBe(false);
    expect(result.cachePath).toBeNull();
  });

  it("warms a file into the cache", async () => {
    const srcPath = createTestPDF("source.pdf");
    const result = await svc.warmCache("507f1f77bcf86cd799439011", srcPath);
    expect(result.alreadyCached).toBe(false);
    expect(fs.existsSync(result.cachePath)).toBe(true);
  });

  it("returns cached: true for a warmed file", async () => {
    const srcPath = createTestPDF("cached.pdf");
    await svc.warmCache("507f1f77bcf86cd799439012", srcPath);
    const check = await svc.isCached(srcPath);
    expect(check.cached).toBe(true);
  });

  it("reports stats with file count and size", async () => {
    const stats = await svc.getStats();
    expect(stats.fileCount).toBeGreaterThan(0);
    expect(stats.totalSizeBytes).toBeGreaterThan(0);
    expect(stats.cacheDir).toBe(cacheDir);
  });
});
