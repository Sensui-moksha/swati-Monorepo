import {
  SignOptions,
  VerifyOptions,
  sign,
  verify,
  decode,
  JsonWebTokenError,
  TokenExpiredError,
} from "jsonwebtoken";
import { jwtConfig } from "../config/jwt";
import { ApiError } from "../middleware/errorHandler";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
  tokenType: "access" | "refresh";
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export interface JWTOptions extends SignOptions {
  tokenType?: "access" | "refresh";
}

const DEFAULT_ACCESS_OPTIONS: SignOptions = {
  expiresIn: jwtConfig.accessExpiry as SignOptions["expiresIn"],
  algorithm: "HS256",
};

const DEFAULT_REFRESH_OPTIONS: SignOptions = {
  expiresIn: jwtConfig.refreshExpiry as SignOptions["expiresIn"],
  algorithm: "HS256",
};

const DEFAULT_VERIFY_OPTIONS: VerifyOptions = {
  algorithms: ["HS256"],
};

/**
 * Generate a JWT access token
 */
export function generateAccessToken(
  payload: Omit<TokenPayload, "tokenType">,
  options?: JWTOptions,
): string {
  const tokenPayload: TokenPayload = {
    ...payload,
    tokenType: "access",
  };
  return sign(tokenPayload, jwtConfig.accessSecret, {
    ...DEFAULT_ACCESS_OPTIONS,
    ...options,
  });
}

/**
 * Generate a JWT refresh token
 */
export function generateRefreshToken(
  payload: Omit<TokenPayload, "tokenType">,
  options?: JWTOptions,
): string {
  const tokenPayload: TokenPayload = {
    ...payload,
    tokenType: "refresh",
  };
  return sign(tokenPayload, jwtConfig.refreshSecret, {
    ...DEFAULT_REFRESH_OPTIONS,
    ...options,
  });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: Omit<TokenPayload, "tokenType">): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verify an access token
 */
export function verifyAccessToken(
  token: string,
  options?: VerifyOptions,
): DecodedToken {
  try {
    return verify(token, jwtConfig.accessSecret, {
      ...DEFAULT_VERIFY_OPTIONS,
      ...options,
    }) as DecodedToken;
  } catch (error) {
    throw handleJWTError(error);
  }
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(
  token: string,
  options?: VerifyOptions,
): DecodedToken {
  try {
    return verify(token, jwtConfig.refreshSecret, {
      ...DEFAULT_VERIFY_OPTIONS,
      ...options,
    }) as DecodedToken;
  } catch (error) {
    throw handleJWTError(error);
  }
}

/**
 * Verify a token (auto-detect type)
 */
export function verifyToken(
  token: string,
  tokenType: "access" | "refresh" = "access",
): DecodedToken {
  if (tokenType === "access") {
    return verifyAccessToken(token);
  }
  return verifyRefreshToken(token);
}

/**
 * Decode a token without verification (for debugging/logging)
 */
export function decodeToken(token: string): DecodedToken | null {
  return decode(token) as DecodedToken | null;
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(
  authHeader: string | undefined,
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Extract token from cookie
 */
export function extractTokenFromCookie(
  cookies: Record<string, string>,
  cookieName: string,
): string | null {
  return cookies[cookieName] || null;
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  return new Date(decoded.exp * 1000);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return true;
  }
  return expiration < new Date();
}

/**
 * Get time until token expires (in milliseconds)
 */
export function getTimeUntilExpiry(token: string): number {
  const expiration = getTokenExpiration(token);
  if (!expiration) {
    return 0;
  }
  return Math.max(0, expiration.getTime() - Date.now());
}

/**
 * Handle JWT errors and convert to ApiError
 */
function handleJWTError(error: unknown): ApiError {
  if (error instanceof TokenExpiredError) {
    return ApiError.unauthorized("Token has expired");
  }
  if (error instanceof JsonWebTokenError) {
    return ApiError.unauthorized("Invalid token");
  }
  return ApiError.unauthorized("Token verification failed");
}

/**
 * Rotate refresh token - generate new pair and invalidate old refresh token
 * This should be used with a token blacklist or database invalidation
 */
export function rotateRefreshToken(
  oldRefreshToken: string,
  payload: Omit<TokenPayload, "tokenType">,
): { accessToken: string; refreshToken: string } {
  // Verify the old refresh token first
  verifyRefreshToken(oldRefreshToken);
  // Generate new token pair
  return generateTokenPair(payload);
}

/**
 * Create a token with custom claims and expiration
 */
export function createCustomToken(
  payload: Record<string, unknown>,
  secret: string,
  expiresIn: string | number,
): string {
  return sign(payload, secret, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
    algorithm: "HS256",
  });
}

/**
 * Verify a custom token
 */
export function verifyCustomToken<T extends Record<string, unknown>>(
  token: string,
  secret: string,
): T {
  return verify(token, secret, { algorithms: ["HS256"] }) as T;
}
