import { Request, Response, NextFunction } from "express";
import { env } from "../config/index";

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  errors?: Array<{ field: string; message: string }>;
  code?: number;
  keyValue?: Record<string, unknown>;
  path?: string;
  value?: unknown;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;
  public readonly errors?: Array<{ field: string; message: string }>;

  constructor(
    messageOrStatusCode: string | number,
    statusCodeOrMessage: number | string = 500,
    errors?: Array<{ field: string; message: string }>,
  ) {
    const [message, statusCode] =
      typeof messageOrStatusCode === "number"
        ? [String(statusCodeOrMessage), messageOrStatusCode]
        : [messageOrStatusCode, Number(statusCodeOrMessage) || 500];

    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.errors = errors;

    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(
    message: string,
    errors?: Array<{ field: string; message: string }>,
  ) {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new ApiError(message, 401);
  }

  static forbidden(message: string = "Forbidden") {
    return new ApiError(message, 403);
  }

  static notFound(message: string = "Resource not found") {
    return new ApiError(message, 404);
  }

  static internal(message: string = "Internal server error") {
    return new ApiError(message, 500);
  }

  static conflict(message: string) {
    return new ApiError(message, 409);
  }

  static tooManyRequests(message: string = "Too many requests") {
    return new ApiError(message, 429);
  }
}

export const notFound = (
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const error = new ApiError(`Route ${_req.originalUrl} not found`, 404);
  next(error);
};

const handleCastErrorDB = (err: AppError): ApiError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(message, 400);
};

const handleDuplicateFieldsDB = (err: AppError): ApiError => {
  const keyValue = (err.keyValue || {}) as Record<string, unknown>;
  const keys = Object.keys(keyValue);
  const field = keys[0];
  const value = field ? keyValue[field] : "unknown";
  const message = `Duplicate field value: ${field} = ${value}. Please use another value.`;
  return new ApiError(message, 400);
};

const handleValidationErrorDB = (err: AppError): ApiError => {
  const errors = Object.values(err.errors || {}).map(
    (e: { path?: string; message: string }) => ({
      field: e.path || "",
      message: e.message,
    }),
  );
  const message = "Invalid input data";
  return new ApiError(message, 400, errors);
};

const handleJWTError = (): ApiError =>
  new ApiError("Invalid token. Please log in again.", 401);
const handleJWTExpiredError = (): ApiError =>
  new ApiError("Your token has expired. Please log in again.", 401);

const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  } else {
    console.error("ERROR 💥:", err);
    res.status(500).json({
      success: false,
      message: "Something went very wrong!",
    });
  }
};

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name } as AppError;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
