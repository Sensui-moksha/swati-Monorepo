import { RangeRequestService } from "../services/RangeRequestService";

describe("RangeRequestService", () => {
  const svc = new RangeRequestService();
  const FILE_SIZE = 10_000_000; // 10MB

  describe("parseRangeHeader", () => {
    it("returns null when no Range header", () => {
      expect(svc.parseRangeHeader(undefined, FILE_SIZE)).toBeNull();
    });

    it("parses standard range bytes=0-999", () => {
      const result = svc.parseRangeHeader("bytes=0-999", FILE_SIZE);
      expect(result).toEqual({ start: 0, end: 999, length: 1000 });
    });

    it("parses open-ended range bytes=5000000-", () => {
      const result = svc.parseRangeHeader("bytes=5000000-", FILE_SIZE);
      expect(result?.start).toBe(5_000_000);
      expect(result?.end).toBe(FILE_SIZE - 1);
    });

    it("parses suffix range bytes=-500", () => {
      const result = svc.parseRangeHeader("bytes=-500", FILE_SIZE);
      expect(result?.start).toBe(FILE_SIZE - 500);
      expect(result?.end).toBe(FILE_SIZE - 1);
      expect(result?.length).toBe(500);
    });

    it("clamps end to file size - 1", () => {
      const result = svc.parseRangeHeader(`bytes=0-${FILE_SIZE + 9999}`, FILE_SIZE);
      expect(result?.end).toBe(FILE_SIZE - 1);
    });

    it("throws 416 when start >= fileSize", () => {
      expect(() => svc.parseRangeHeader(`bytes=${FILE_SIZE}-${FILE_SIZE + 100}`, FILE_SIZE))
        .toThrow();
    });

    it("throws 416 when start > end", () => {
      expect(() => svc.parseRangeHeader("bytes=1000-500", FILE_SIZE)).toThrow();
    });

    it("throws 416 on malformed header", () => {
      expect(() => svc.parseRangeHeader("not-a-range", FILE_SIZE)).toThrow();
    });
  });

  describe("buildPartialHeaders", () => {
    it("builds correct 206 headers", () => {
      const range = { start: 0, end: 999, length: 1000 };
      const headers = svc.buildPartialHeaders(range, FILE_SIZE);
      expect(headers["Content-Range"]).toBe(`bytes 0-999/${FILE_SIZE}`);
      expect(headers["Content-Length"]).toBe(1000);
      expect(headers["Accept-Ranges"]).toBe("bytes");
    });
  });

  describe("sanitizePath", () => {
    it("allows normal paths", () => {
      expect(() => svc.sanitizePath("/storage/weekly/2024/issue.pdf")).not.toThrow();
    });

    it("blocks ../ traversal", () => {
      expect(() => svc.sanitizePath("../../../etc/passwd")).toThrow();
    });

    it("blocks null bytes", () => {
      expect(() => svc.sanitizePath("/storage/\0evil")).toThrow();
    });

    it("blocks /etc/ prefix", () => {
      expect(() => svc.sanitizePath("/etc/shadow")).toThrow();
    });
  });
});
