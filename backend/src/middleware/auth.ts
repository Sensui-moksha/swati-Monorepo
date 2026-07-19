import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/index";
import { ApiError } from "./errorHandler";
import { User } from "../models/User";

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in cookies first
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    // Check for token in Authorization header
    else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new ApiError(
          "You are not logged in. Please log in to get access.",
          401,
        ),
      );
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      id: string;
      iat: number;
      exp: number;
    };

    // Check if user still exists
    const user = await User.findById(decoded.id).select("+password");
    if (!user) {
      return next(
        new ApiError("The user belonging to this token no longer exists.", 401),
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return next(
        new ApiError(
          "Your account has been deactivated. Please contact support.",
          401,
        ),
      );
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(
        new ApiError(
          "User recently changed password! Please log in again.",
          401,
        ),
      );
    }

    // Grant access to protected route
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError("Invalid token. Please log in again.", 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new ApiError("Your token has expired. Please log in again.", 401),
      );
    }
    next(error);
  }
};

export const protect = authenticate;
export const authMiddleware = authenticate;

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError("You are not logged in.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You do not have permission to perform this action.", 403),
      );
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        id: string;
      };
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

export const refreshTokenAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return next(new ApiError("Refresh token not provided.", 401));
    }

    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
      id: string;
    };

    const user = await User.findById(decoded.id).select("+password");
    if (!user || !user.isActive) {
      return next(new ApiError("Invalid refresh token.", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError("Invalid refresh token.", 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new ApiError("Refresh token expired. Please log in again.", 401),
      );
    }
    next(error);
  }
};
