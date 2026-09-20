import { drmService } from "../../services/DRMService";
import { Types } from "mongoose";

describe("E2E Journey 3: Enterprise DRM, Ephemeral Tokens & Dynamic Watermarks", () => {
  const testUserId = new Types.ObjectId().toString();
  const testBookId = new Types.ObjectId().toString();
  const clientIp = "203.0.113.195";
  const userEmail = "researcher@university.edu";

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("should generate an HMAC-SHA256 signed ephemeral token with watermark metadata", () => {
    const drmPayload = drmService.generateStreamingToken(
      testUserId,
      testBookId,
      clientIp,
      userEmail
    );

    expect(drmPayload.token).toBeDefined();
    expect(drmPayload.watermarkId).toBeDefined();
    expect(drmPayload.watermarkText).toContain(userEmail);
    expect(drmPayload.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("should successfully verify a valid ephemeral token with matching client IP", () => {
    const { token } = drmService.generateStreamingToken(
      testUserId,
      testBookId,
      clientIp,
      userEmail
    );

    const verified = drmService.verifyStreamingToken(token, clientIp);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(testUserId);
    expect(verified?.bookId).toBe(testBookId);
    expect(verified?.userEmail).toBe(userEmail);
  });

  it("should reject a token when accessed from a different IP address (anti-relay protection)", () => {
    const { token } = drmService.generateStreamingToken(
      testUserId,
      testBookId,
      clientIp,
      userEmail
    );

    const verified = drmService.verifyStreamingToken(token, "198.51.100.22"); // Mismatched IP
    expect(verified).toBeNull();
  });

  it("should reject a tampered token where payload was modified", () => {
    const { token } = drmService.generateStreamingToken(
      testUserId,
      testBookId,
      clientIp,
      userEmail
    );

    // Tamper with the base64 payload part
    const [serialized, signature] = token.split(".");
    const decoded = JSON.parse(Buffer.from(serialized, "base64url").toString("utf8"));
    decoded.userId = new Types.ObjectId().toString(); // change user id
    const tamperedSerialized = Buffer.from(JSON.stringify(decoded)).toString("base64url");
    const tamperedToken = `${tamperedSerialized}.${signature}`;

    const verified = drmService.verifyStreamingToken(tamperedToken, clientIp);
    expect(verified).toBeNull();
  });

  it("should reject an expired token", () => {
    const { token } = drmService.generateStreamingToken(
      testUserId,
      testBookId,
      clientIp,
      userEmail
    );

    // Fast-forward time beyond 60s expiration
    jest.spyOn(Date, "now").mockReturnValue(Date.now() + 120 * 1000);

    const verified = drmService.verifyStreamingToken(token, clientIp);
    expect(verified).toBeNull();
  });
});
