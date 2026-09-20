import mongoose, { Document, Schema, Types } from "mongoose";

export type VersionableEntityType =
  | "Article"
  | "Book"
  | "MagazineIssue"
  | "Publication"
  | "Media"
  | "Setting";

export interface IEntityVersionDiff {
  added?: Record<string, any>;
  modified?: Record<string, { from: any; to: any }>;
  deleted?: string[];
}

export interface IEntityVersion extends Document {
  entityType: VersionableEntityType;
  entityId: Types.ObjectId;
  versionNumber: number;
  snapshot: Record<string, any>;
  diff?: IEntityVersionDiff;
  author?: Types.ObjectId;
  reason: string;
  checksum: string;
  createdAt: Date;
  updatedAt: Date;
}

const entityVersionSchema = new Schema<IEntityVersion>(
  {
    entityType: {
      type: String,
      required: true,
      enum: ["Article", "Book", "MagazineIssue", "Publication", "Media", "Setting"],
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    snapshot: {
      type: Schema.Types.Mixed,
      required: true,
    },
    diff: {
      added: { type: Schema.Types.Mixed },
      modified: { type: Schema.Types.Mixed },
      deleted: [{ type: String }],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      default: "Snapshot created",
    },
    checksum: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

entityVersionSchema.index(
  { entityType: 1, entityId: 1, versionNumber: -1 },
  { unique: true }
);
entityVersionSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const EntityVersion = mongoose.model<IEntityVersion>(
  "EntityVersion",
  entityVersionSchema
);
