import { errorHandler, ApiError } from "../middleware/errorHandler";
import { authorize, AuthRequest } from "../middleware/auth";
import { Request, Response, NextFunction } from "express";

describe("Phase 3: Comprehensive API Layer Validation", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {}, query: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe("API Error Responses & Status Codes", () => {
    it("should format 400 Bad Request operational errors with field validation details", () => {
      const fieldErrors = [{ field: "email", message: "Email is invalid" }];
      const error = ApiError.badRequest("Validation failed", fieldErrors);

      errorHandler(error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Validation failed",
          errors: fieldErrors,
        })
      );
    });

    it("should format 401 Unauthorized for unauthenticated requests", () => {
      const error = ApiError.unauthorized("Authentication required");

      errorHandler(error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Authentication required",
        })
      );
    });

    it("should format 404 Not Found for missing resources", () => {
      const error = ApiError.notFound("Publication issue not found");

      errorHandler(error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Publication issue not found",
        })
      );
    });

    it("should mask unhandled internal errors with generic 500 in production", () => {
      const unexpectedError = new Error("Database connection timeout at 10.0.0.1:27017");

      errorHandler(unexpectedError, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Something went very wrong!",
        })
      );
    });
  });

  describe("RBAC Authorization & Permission Rejections", () => {
    it("should allow authorized roles to proceed", () => {
      req.user = { _id: "user1", role: "admin" };
      const middleware = authorize("admin", "editor");

      middleware(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith();
    });

    it("should reject unauthorized roles with 403 Forbidden", () => {
      req.user = { _id: "user2", role: "user" };
      const middleware = authorize("admin", "editor");

      middleware(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
        })
      );
    });

    it("should reject requests when no user is attached to request with 401", () => {
      req.user = undefined;
      const middleware = authorize("admin");

      middleware(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
        })
      );
    });
  });
});
