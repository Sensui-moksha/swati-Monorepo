import { authenticate, AuthRequest } from "../middleware/auth";
import { hashPassword, comparePassword } from "../utils/password";
import { Response, NextFunction } from "express";

describe("Phase 7: Security & Zero-Trust Authentication Suite", () => {
  describe("Password Hashing & Cryptographic Safety", () => {
    it("should hash passwords using strong bcrypt salt and verify correctly", async () => {
      const rawPassword = "StrongEnterprisePassword#2026";
      const hash = await hashPassword(rawPassword);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(rawPassword);
      expect(hash.startsWith("$2")).toBe(true); // bcrypt signature

      const isValid = await comparePassword(rawPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword("WrongPassword123", hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe("Zero-Trust Authentication Boundary Enforcement", () => {
    it("should strictly reject unauthenticated requests with 401 in production mode", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const req: Partial<AuthRequest> = {
        headers: {},
        cookies: {},
      };
      const res: Partial<Response> = {};
      const next: NextFunction = jest.fn();

      try {
        await authenticate(req as AuthRequest, res as Response, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
          })
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it("should reject tampered or expired JWT tokens with 401", async () => {
      const req: Partial<AuthRequest> = {
        headers: { authorization: "Bearer invalid.tampered.token" },
        cookies: {},
      };
      const res: Partial<Response> = {};
      const next: NextFunction = jest.fn();

      await authenticate(req as AuthRequest, res as Response, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
        })
      );
    });
  });
});
