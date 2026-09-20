import crypto from "crypto";
import { Model, Types } from "mongoose";
import {
  EntityVersion,
  IEntityVersion,
  VersionableEntityType,
  IEntityVersionDiff,
} from "../models/EntityVersion";
import { Article } from "../models/Article";
import { Book } from "../models/Book";
import { MagazineIssue } from "../models/MagazineIssue";
import { Publication } from "../models/Publication";
import { Media } from "../models/Media";
import { Setting } from "../models/Setting";

export class VersionControlService {
  private static readonly MODEL_REGISTRY: Record<VersionableEntityType, Model<any>> = {
    Article,
    Book,
    MagazineIssue,
    Publication,
    Media,
    Setting,
  };

  /**
   * Get the Mongoose model for an entity type
   */
  private static getModel(entityType: VersionableEntityType): Model<any> {
    const model = this.MODEL_REGISTRY[entityType];
    if (!model) {
      throw new Error(`Unsupported entity type for version control: ${entityType}`);
    }
    return model;
  }

  /**
   * Normalize an object into a stable JSON string for SHA256 hashing
   */
  private static hashSnapshot(data: any): string {
    const canonical = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash("sha256").update(canonical).digest("hex");
  }

  /**
   * Calculate field-level diff between two snapshots
   */
  public static computeDiff(
    oldObj: Record<string, any> = {},
    newObj: Record<string, any> = {}
  ): IEntityVersionDiff {
    const added: Record<string, any> = {};
    const modified: Record<string, { from: any; to: any }> = {};
    const deleted: string[] = [];

    const oldKeys = new Set(Object.keys(oldObj));
    const newKeys = new Set(Object.keys(newObj));

    for (const key of newKeys) {
      if (key === "_id" || key === "__v" || key === "updatedAt" || key === "createdAt") {
        continue;
      }
      if (!oldKeys.has(key)) {
        added[key] = newObj[key];
      } else {
        const oldVal = JSON.stringify(oldObj[key]);
        const newVal = JSON.stringify(newObj[key]);
        if (oldVal !== newVal) {
          modified[key] = { from: oldObj[key], to: newObj[key] };
        }
      }
    }

    for (const key of oldKeys) {
      if (key === "_id" || key === "__v" || key === "updatedAt" || key === "createdAt") {
        continue;
      }
      if (!newKeys.has(key)) {
        deleted.push(key);
      }
    }

    return {
      ...(Object.keys(added).length > 0 && { added }),
      ...(Object.keys(modified).length > 0 && { modified }),
      ...(deleted.length > 0 && { deleted }),
    };
  }

  /**
   * Create an immutable snapshot of an entity
   */
  public static async createSnapshot(
    entityType: VersionableEntityType,
    entityId: string | Types.ObjectId,
    authorId?: string | Types.ObjectId,
    reason = "Snapshot captured"
  ): Promise<IEntityVersion> {
    const model = this.getModel(entityType);
    const targetObjectId = new Types.ObjectId(entityId);

    const doc = await model.findById(targetObjectId).lean().exec();
    if (!doc) {
      throw new Error(`${entityType} not found for ID: ${entityId}`);
    }

    // Clean snapshot representation
    const snapshot = JSON.parse(JSON.stringify(doc));
    const checksum = this.hashSnapshot(snapshot);

    // Find latest version
    const latest = await EntityVersion.findOne({
      entityType,
      entityId: targetObjectId,
    })
      .sort({ versionNumber: -1 })
      .exec();

    // Check if snapshot is identical to latest (avoid redundant versions)
    if (latest && latest.checksum === checksum) {
      return latest;
    }

    const nextVersion = (latest?.versionNumber || 0) + 1;
    const diff = latest ? this.computeDiff(latest.snapshot, snapshot) : undefined;

    const versionDoc = await EntityVersion.create({
      entityType,
      entityId: targetObjectId,
      versionNumber: nextVersion,
      snapshot,
      diff,
      author: authorId ? new Types.ObjectId(authorId) : undefined,
      reason,
      checksum,
    });

    return versionDoc;
  }

  /**
   * Retrieve version history for an entity
   */
  public static async getHistory(
    entityType: VersionableEntityType,
    entityId: string | Types.ObjectId,
    limit = 20,
    offset = 0
  ) {
    const targetObjectId = new Types.ObjectId(entityId);
    const [versions, total] = await Promise.all([
      EntityVersion.find({
        entityType,
        entityId: targetObjectId,
      })
        .select("-snapshot") // Exclude heavy snapshot in list view
        .populate("author", "name email role")
        .sort({ versionNumber: -1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      EntityVersion.countDocuments({
        entityType,
        entityId: targetObjectId,
      }),
    ]);

    return { versions, total, limit, offset };
  }

  /**
   * Retrieve a specific version by version number
   */
  public static async getVersion(
    entityType: VersionableEntityType,
    entityId: string | Types.ObjectId,
    versionNumber: number
  ): Promise<IEntityVersion | null> {
    const targetObjectId = new Types.ObjectId(entityId);
    return EntityVersion.findOne({
      entityType,
      entityId: targetObjectId,
      versionNumber,
    })
      .populate("author", "name email role")
      .exec();
  }

  /**
   * Get diff between two arbitrary versions
   */
  public static async getDiff(
    entityType: VersionableEntityType,
    entityId: string | Types.ObjectId,
    v1: number,
    v2: number
  ) {
    const [ver1, ver2] = await Promise.all([
      this.getVersion(entityType, entityId, v1),
      this.getVersion(entityType, entityId, v2),
    ]);

    if (!ver1 || !ver2) {
      throw new Error(`One or both versions (${v1}, ${v2}) not found for comparison`);
    }

    return {
      entityType,
      entityId,
      baseVersion: v1,
      targetVersion: v2,
      diff: this.computeDiff(ver1.snapshot, ver2.snapshot),
    };
  }

  /**
   * Rollback an entity to a target version number
   */
  public static async rollback(
    entityType: VersionableEntityType,
    entityId: string | Types.ObjectId,
    targetVersionNumber: number,
    authorId?: string | Types.ObjectId,
    reason?: string
  ): Promise<{ entity: any; newVersion: IEntityVersion }> {
    const model = this.getModel(entityType);
    const targetObjectId = new Types.ObjectId(entityId);

    const targetVersion = await this.getVersion(entityType, entityId, targetVersionNumber);
    if (!targetVersion) {
      throw new Error(`Target version ${targetVersionNumber} not found for rollback`);
    }

    // Capture pre-rollback state
    await this.createSnapshot(
      entityType,
      entityId,
      authorId,
      `Pre-rollback snapshot before restoring to v${targetVersionNumber}`
    );

    // Extract restorable fields from snapshot
    const { _id, __v, createdAt, updatedAt, ...restorableFields } = targetVersion.snapshot;

    const updatedDoc = await model
      .findByIdAndUpdate(
        targetObjectId,
        { $set: restorableFields },
        { new: true, runValidators: true }
      )
      .exec();

    if (!updatedDoc) {
      throw new Error(`${entityType} not found during rollback execution`);
    }

    // Capture post-rollback state as a new version
    const rollbackVersion = await this.createSnapshot(
      entityType,
      entityId,
      authorId,
      reason || `Rolled back to v${targetVersionNumber}`
    );

    return { entity: updatedDoc, newVersion: rollbackVersion };
  }

  /**
   * Prune old versions keeping the most recent N
   */
  public static async pruneVersions(
    entityType: VersionableEntityType,
    entityId: string | Types.ObjectId,
    keepCount = 30
  ): Promise<number> {
    const targetObjectId = new Types.ObjectId(entityId);
    const versions = await EntityVersion.find({
      entityType,
      entityId: targetObjectId,
    })
      .sort({ versionNumber: -1 })
      .select("_id versionNumber")
      .skip(keepCount)
      .exec();

    if (versions.length === 0) return 0;

    const idsToDelete = versions.map((v) => v._id);
    const result = await EntityVersion.deleteMany({ _id: { $in: idsToDelete } });
    return result.deletedCount || 0;
  }
}
