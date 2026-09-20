import path from "path";

describe("Phase 6: Storage Partitioning & Filesystem Validation", () => {
  describe("Directory Partitioning Contract (/storage/documents/YYYY/MM/UUID/)", () => {
    it("should generate standard hierarchical partitioned paths matching YYYY/MM/UUID/filename", () => {
      const { getPartitionedStoragePath, isPartitionedPath } = require("../utils/storagePaths");

      const fixedDate = new Date("2026-09-20T12:00:00Z");
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const filename = "swathi-weekly-42.pdf";

      const partitioned = getPartitionedStoragePath("documents", filename, fixedDate, uuid);
      expect(partitioned).toBe("/storage/documents/2026/09/550e8400-e29b-41d4-a716-446655440000/swathi-weekly-42.pdf");
      expect(isPartitionedPath(partitioned)).toBe(true);
    });

    it("should identify legacy flat paths and provide a safe migration target", () => {
      const { isPartitionedPath, migrateFlatPath } = require("../utils/storagePaths");

      const legacyPath = "/documents/old-issue.pdf";
      expect(isPartitionedPath(legacyPath)).toBe(false);

      const targetPath = migrateFlatPath(legacyPath);
      expect(isPartitionedPath(targetPath)).toBe(true);
      expect(targetPath.endsWith("old-issue.pdf")).toBe(true);
    });

    it("should sanitize unsafe filenames containing path traversal sequences", () => {
      const { sanitizeFilename } = require("../utils/storagePaths");

      const maliciousName = "../../etc/passwd";
      const sanitized = sanitizeFilename(maliciousName);
      expect(sanitized).not.toContain("..");
      expect(sanitized).not.toContain("/");
    });
  });
});
