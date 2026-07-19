import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { ApiError } from "./errorHandler";

export const adminMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void => {
  // Check if user is authenticated
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  // Check if user has admin role
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    throw new ApiError(403, "Admin access required");
  }

  next();
};

export const superAdminMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void => {
  // Check if user is authenticated
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  // Check if user has superadmin role
  if (req.user.role !== "superadmin") {
    throw new ApiError(403, "Super admin access required");
  }

  next();
};
