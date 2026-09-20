import crypto from "crypto";
import path from "path";

/**
 * Sanitize a filename to prevent directory traversal or malformed paths
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return `file_${Date.now()}`;
  // Strip null bytes and directory navigation
  const cleaned = filename
    .replace(/\0/g, "")
    .replace(/(\.\.[\/\\])+/g, "")
    .replace(/[\/\\]/g, "_")
    .trim();

  return path.basename(cleaned) || `file_${Date.now()}`;
}

/**
 * Generates an enterprise-grade partitioned storage path:
 * /storage/documents/YYYY/MM/UUID/filename
 */
export function getPartitionedStoragePath(
  category: string = "documents",
  filename: string,
  date: Date = new Date(),
  uuid: string = crypto.randomUUID()
): string {
  const sanitized = sanitizeFilename(filename);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  const cleanCategory = category.toLowerCase().replace(/[^a-z0-9_-]/g, "") || "documents";
  return `/storage/${cleanCategory}/${year}/${month}/${uuid}/${sanitized}`;
}

/**
 * Checks if a given path follows the partitioned structure
 */
export function isPartitionedPath(filePath: string): boolean {
  if (!filePath) return false;
  const normalized = filePath.replace(/\\/g, "/");
  const regex = /^\/storage\/[a-zA-Z0-9_-]+\/\d{4}\/\d{2}\/[a-zA-Z0-9-]+\/[^/]+$/;
  return regex.test(normalized);
}

/**
 * Computes a target partitioned path for migrating a legacy flat path
 */
export function migrateFlatPath(
  legacyPath: string,
  category: string = "documents",
  date: Date = new Date(),
  uuid: string = crypto.randomUUID()
): string {
  const basename = path.basename(legacyPath);
  return getPartitionedStoragePath(category, basename, date, uuid);
}
