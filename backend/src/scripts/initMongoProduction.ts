import { logger } from '../utils/logger';

/**
 * Production MongoDB initialization helper.
 * Validates replica set status, critical indexes, and connection pool health.
 * Run as a startup check or standalone script: `npx ts-node src/scripts/initMongoProduction.ts`
 */

interface IndexSpec {
  collection: string;
  index: Record<string, 1 | -1 | 'text'>;
  options?: { unique?: boolean; sparse?: boolean; name?: string };
}

/** Critical indexes required for production query performance */
const REQUIRED_INDEXES: IndexSpec[] = [
  { collection: 'articles', index: { publicationType: 1, status: 1, publishDate: -1 }, options: { name: 'articles_type_status_date' } },
  { collection: 'articles', index: { 'metadata.language': 1, category: 1 }, options: { name: 'articles_lang_category' } },
  { collection: 'books', index: { publicationType: 1, status: 1, publishDate: -1 }, options: { name: 'books_type_status_date' } },
  { collection: 'readingprogresses', index: { userId: 1, publicationId: 1 }, options: { unique: true, name: 'rp_user_pub' } },
  { collection: 'readingprogresses', index: { userId: 1, lastReadAt: -1 }, options: { name: 'rp_user_recent' } },
  { collection: 'commerceorders', index: { userId: 1, createdAt: -1 }, options: { name: 'orders_user_date' } },
  { collection: 'commerceorders', index: { status: 1, createdAt: -1 }, options: { name: 'orders_status_date' } },
  { collection: 'users', index: { email: 1 }, options: { unique: true, name: 'users_email' } },
  { collection: 'subscriptions', index: { userId: 1, status: 1 }, options: { name: 'subs_user_status' } },
  { collection: 'auditlogs', index: { timestamp: -1, action: 1 }, options: { name: 'audit_time_action' } },
  { collection: 'entityversions', index: { entityType: 1, entityId: 1, version: -1 }, options: { name: 'versions_entity_ver' } },
  { collection: 'drmsecurityevents', index: { userId: 1, createdAt: -1 }, options: { name: 'drm_user_date' } },
];

export async function validateMongoProduction(mongoose: typeof import('mongoose')): Promise<{
  replicaSet: boolean;
  indexesOk: boolean;
  missingIndexes: string[];
  connectionPool: { current: number; available: number };
}> {
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB not connected');

  const result = {
    replicaSet: false,
    indexesOk: true,
    missingIndexes: [] as string[],
    connectionPool: { current: 0, available: 0 },
  };

  // 1. Check replica set status
  try {
    const adminDb = db.admin();
    const replStatus = await adminDb.command({ replSetGetStatus: 1 });
    result.replicaSet = replStatus.ok === 1;
    logger.info(`[MongoDB] Replica set "${replStatus.set}" — ${replStatus.members?.length || 0} members`);
  } catch {
    logger.warn('[MongoDB] Not running in replica set mode. Transactions and change streams unavailable.');
  }

  // 2. Validate critical indexes exist
  for (const spec of REQUIRED_INDEXES) {
    try {
      const collection = db.collection(spec.collection);
      const existingIndexes = await collection.indexes();
      const indexKeys = Object.keys(spec.index);

      const found = existingIndexes.some((idx: any) => {
        const keys = Object.keys(idx.key);
        return indexKeys.length === keys.length && indexKeys.every((k, i) => keys[i] === k && idx.key[k] === spec.index[k]);
      });

      if (!found) {
        result.missingIndexes.push(`${spec.collection}: ${JSON.stringify(spec.index)}`);
        // Create missing index
        await collection.createIndex(spec.index as any, spec.options || {});
        logger.info(`[MongoDB] Created missing index on ${spec.collection}: ${spec.options?.name || JSON.stringify(spec.index)}`);
      }
    } catch (err: any) {
      logger.warn(`[MongoDB] Failed to check/create index on ${spec.collection}: ${err.message}`);
      result.missingIndexes.push(`${spec.collection}: ${JSON.stringify(spec.index)} (error)`);
    }
  }

  result.indexesOk = result.missingIndexes.length === 0;

  // 3. Connection pool info
  try {
    const serverStatus = await db.admin().command({ serverStatus: 1 });
    result.connectionPool = {
      current: serverStatus.connections?.current || 0,
      available: serverStatus.connections?.available || 0,
    };
  } catch {
    // Not critical — some Atlas tiers restrict serverStatus
  }

  logger.info(`[MongoDB] Production validation complete. ReplicaSet: ${result.replicaSet}, Indexes OK: ${result.indexesOk}, Missing: ${result.missingIndexes.length}`);
  return result;
}

// Standalone execution
if (require.main === module) {
  (async () => {
    const mongoose = await import('mongoose');
    const config = await import('../config/index.js');
    await mongoose.connect(config.env.MONGODB_URI);
    const result = await validateMongoProduction(mongoose);
    console.log(JSON.stringify(result, null, 2));
    await mongoose.disconnect();
    process.exit(result.indexesOk ? 0 : 1);
  })();
}
