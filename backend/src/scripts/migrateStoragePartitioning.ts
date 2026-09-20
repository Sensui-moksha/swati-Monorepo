import { connectDB, disconnectDB } from "../config/db";
import { Media } from "../models/Media";
import { StoragePath } from "../models/StoragePath";
import { isPartitionedPath, migrateFlatPath } from "../utils/storagePaths";
import { logger } from "../utils/logger";

/**
 * Migration Script: Partitions legacy flat storage paths into hierarchical YYYY/MM/UUID/ directories.
 * Idempotent: skips already partitioned records.
 */
export async function migrateStoragePartitioning(): Promise<{
  scanned: number;
  migrated: number;
  skipped: number;
}> {
  logger.info("[Storage Migration] Starting storage partitioning migration...");
  await connectDB();

  let scanned = 0;
  let migrated = 0;
  let skipped = 0;

  // 1. Migrate Media model records
  const legacyMedia = await Media.find({
    url: { $not: /^\/storage\/[a-zA-Z0-9_-]+\/\d{4}\/\d{2}\/[a-zA-Z0-9-]+\/.+$/ },
  });

  for (const media of legacyMedia) {
    scanned++;
    if (isPartitionedPath(media.url)) {
      skipped++;
      continue;
    }

    const newPath = migrateFlatPath(media.url, media.type === "document" ? "documents" : "media", media.createdAt);
    (media as any).storagePath = newPath;
    media.url = newPath;
    await media.save();
    migrated++;
  }

  // 2. Migrate StoragePath records
  const legacyStoragePaths = await StoragePath.find({
    path: { $not: /^\/storage\/[a-zA-Z0-9_-]+\/\d{4}\/\d{2}\/[a-zA-Z0-9-]+\/.+$/ },
  });

  for (const sp of legacyStoragePaths) {
    scanned++;
    if (isPartitionedPath(sp.path)) {
      skipped++;
      continue;
    }

    const newPath = migrateFlatPath(sp.path, "documents", sp.createdAt);
    sp.path = newPath;
    sp.relativePath = newPath.replace(/^\/storage\//, "");
    await sp.save();
    migrated++;
  }

  logger.info(`[Storage Migration] Completed: ${scanned} scanned, ${migrated} migrated, ${skipped} skipped.`);
  return { scanned, migrated, skipped };
}

if (require.main === module) {
  migrateStoragePartitioning()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error("[Storage Migration] Error during migration:", err);
      await disconnectDB();
      process.exit(1);
    });
}
