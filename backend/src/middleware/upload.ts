import multer, { FileFilterCallback } from "multer";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../middleware/errorHandler";

// Configure multer for memory storage (files stored in memory as buffers)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  // Allow all file types for now, but you can restrict based on mimetype
  const allowedMimeTypes = [
    "application/pdf",
    "application/epub+zip",
    "application/x-mobipocket-ebook",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "audio/ogg",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "text/plain",
    "text/markdown",
    "application/json",
    "application/xml",
    "application/zip",
    "application/x-rar-compressed",
    "application/octet-stream",
  ];

  if (
    allowedMimeTypes.includes(file.mimetype) ||
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("audio/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type ${file.mimetype} is not allowed`));
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
    files: 10, // Max 10 files per request
  },
});

// Single file upload middleware
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Multiple files upload middleware
export const uploadMultiple = (fieldName: string, maxCount: number = 10) =>
  upload.array(fieldName, maxCount);

// Multiple fields upload middleware
export const uploadFields = (
  fields: Array<{ name: string; maxCount?: number }>,
) => upload.fields(fields);

// Error handling middleware for multer
export const handleMulterError = (
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return next(
          new ApiError(
            400,
            "File size exceeds the maximum allowed limit (500MB)",
          ),
        );
      case "LIMIT_FILE_COUNT":
        return next(new ApiError(400, "Too many files uploaded"));
      case "LIMIT_UNEXPECTED_FILE":
        return next(new ApiError(400, "Unexpected file field"));
      default:
        return next(new ApiError(400, `Upload error: ${err.message}`));
    }
  }

  if (err instanceof ApiError) {
    return next(err);
  }

  return next(new ApiError(500, `Upload failed: ${err.message}`));
};
