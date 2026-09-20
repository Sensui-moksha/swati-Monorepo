import mongoose, { Schema, Document } from "mongoose";
import { logger } from "../utils/logger";

export interface IMigrationRecord extends Document {
  id: string;
  name: string;
  appliedAt: Date;
}

const MigrationSchema = new Schema<IMigrationRecord>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    appliedAt: { type: Date, default: Date.now },
  },
  { collection: "_migrations" }
);

export const MigrationRecord = mongoose.model<IMigrationRecord>("_Migration", MigrationSchema);

export interface Migration {
  id: string;
  name: string;
  up: (db: mongoose.Connection) => Promise<void>;
  down?: (db: mongoose.Connection) => Promise<void>;
}

export class MigrationRunner {
  private migrations: Migration[] = [];

  register(migration: Migration) {
    this.migrations.push(migration);
  }

  async runPending(): Promise<number> {
    const applied = await MigrationRecord.find().select("id").lean();
    const appliedIds = new Set(applied.map((m) => m.id));

    let count = 0;
    for (const m of this.migrations) {
      if (!appliedIds.has(m.id)) {
        logger.info(`Running migration [${m.id}] ${m.name}...`);
        await m.up(mongoose.connection);
        await MigrationRecord.create({ id: m.id, name: m.name, appliedAt: new Date() });
        logger.info(`✓ Migration [${m.id}] ${m.name} applied successfully.`);
        count++;
      }
    }

    return count;
  }
}

export const migrationRunner = new MigrationRunner();
