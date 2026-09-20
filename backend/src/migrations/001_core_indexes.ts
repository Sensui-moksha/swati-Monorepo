import { Migration, migrationRunner } from "./MigrationRunner";

export const coreIndexesMigration: Migration = {
  id: "20260920_001_core_indexes",
  name: "Create Core Compound Indexes for Publications, Orders, and Analytics",
  up: async (db) => {
    // 1. Publications & Books
    await db.collection("publications").createIndex({ type: 1, isActive: 1, publishedAt: -1 }, { background: true });
    await db.collection("books").createIndex({ publication: 1, isAvailable: 1 }, { background: true });

    // 2. Reading Progress (high frequency queries)
    await db.collection("readingprogresses").createIndex({ userId: 1, bookId: 1 }, { unique: true, background: true });

    // 3. Commerce Orders & Subscriptions
    await db.collection("commerceorders").createIndex({ user: 1, status: 1, createdAt: -1 }, { background: true });
    await db.collection("commercesubscriptions").createIndex({ user: 1, status: 1, endDate: -1 }, { background: true });
  },
  down: async (db) => {
    await db.collection("publications").dropIndex("type_1_isActive_1_publishedAt_-1").catch(() => null);
    await db.collection("books").dropIndex("publication_1_isAvailable_1").catch(() => null);
    await db.collection("readingprogresses").dropIndex("userId_1_bookId_1").catch(() => null);
    await db.collection("commerceorders").dropIndex("user_1_status_1_createdAt_-1").catch(() => null);
    await db.collection("commercesubscriptions").dropIndex("user_1_status_1_endDate_-1").catch(() => null);
  },
};

migrationRunner.register(coreIndexesMigration);
