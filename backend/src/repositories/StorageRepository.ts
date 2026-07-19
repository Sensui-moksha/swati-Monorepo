import { Types, FilterQuery, UpdateQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import {
  StoragePath,
  IStoragePath,
  StorageType,
  StorageStatus,
  IStoragePathModel,
} from "../models/StoragePath";

export interface StoragePathFilter extends FilterQuery<IStoragePath> {
  search?: string;
  type?: StorageType;
  status?: StorageStatus;
  parentId?: string | Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  hasChecksum?: boolean;
  metadata?: {
    publication?: string | Types.ObjectId;
    issue?: string | Types.ObjectId;
    book?: string | Types.ObjectId;
    author?: string | Types.ObjectId;
    publisher?: string | Types.ObjectId;
    category?: string | Types.ObjectId;
    genre?: string | Types.ObjectId;
    series?: string | Types.ObjectId;
    collection?: string | Types.ObjectId;
    language?: string;
    issueDate?: Date;
    isbn?: string;
  };
}

export class StorageRepository extends BaseRepository<IStoragePath> {
  constructor() {
    super(StoragePath);
  }

  async findByPath(path: string): Promise<IStoragePath | null> {
    return this.model.findOne({ path, isDeleted: false }).exec();
  }

  async findByRelativePath(relativePath: string): Promise<IStoragePath | null> {
    return this.model.findOne({ relativePath, isDeleted: false }).exec();
  }

  async findByType(type: StorageType): Promise<IStoragePath[]> {
    return this.model
      .find({ type, isDeleted: false })
      .sort({ relativePath: 1 })
      .exec();
  }

  async findByStatus(status: StorageStatus): Promise<IStoragePath[]> {
    return this.model
      .find({ status, isDeleted: false })
      .sort({ lastScanned: -1 })
      .exec();
  }

  async findByParent(
    parentId: string | Types.ObjectId,
  ): Promise<IStoragePath[]> {
    return this.model
      .find({ parentId, isDeleted: false })
      .sort({ name: 1 })
      .exec();
  }

  async findRootFolders(): Promise<IStoragePath[]> {
    return this.model
      .find({ parentId: { $exists: false }, isDeleted: false })
      .sort({ name: 1 })
      .exec();
  }

  async findMissingFiles(): Promise<IStoragePath[]> {
    return this.model
      .find({ status: "missing", isDeleted: false })
      .sort({ lastScanned: -1 })
      .exec();
  }

  async findCorruptedFiles(): Promise<IStoragePath[]> {
    return this.model
      .find({ status: "corrupted", isDeleted: false })
      .sort({ lastScanned: -1 })
      .exec();
  }

  async findProcessingFiles(): Promise<IStoragePath[]> {
    return this.model
      .find({ status: "processing", isDeleted: false })
      .sort({ lastScanned: -1 })
      .exec();
  }

  async findByChecksum(checksum: string): Promise<IStoragePath[]> {
    return this.model.find({ checksum, isDeleted: false }).exec();
  }

  async findDuplicates(): Promise<
    Array<{ checksum: string; count: number; paths: string[] }>
  > {
    return this.model
      .aggregate([
        {
          $match: { isDeleted: false, checksum: { $exists: true, $ne: null } },
        },
        {
          $group: {
            _id: "$checksum",
            count: { $sum: 1 },
            paths: { $push: "$relativePath" },
          },
        },
        { $match: { count: { $gt: 1 } } },
        { $project: { _id: 0, checksum: "$_id", count: 1, paths: 1 } },
      ])
      .exec();
  }

  async findByMetadata(
    metadataKey: keyof IStoragePath["metadata"],
    value: string | Types.ObjectId,
  ): Promise<IStoragePath[]> {
    const query: FilterQuery<IStoragePath> = {
      [`metadata.${metadataKey}`]:
        value instanceof Types.ObjectId ? value : new Types.ObjectId(value),
      isDeleted: false,
    };
    return this.model.find(query).sort({ relativePath: 1 }).exec();
  }

  async findWithPagination(
    filter: StoragePathFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    const {
      search,
      type,
      status,
      parentId,
      startDate,
      endDate,
      hasChecksum,
      metadata,
      ...restFilter
    } = filter;
    const query: FilterQuery<IStoragePath> = {
      ...restFilter,
      isDeleted: false,
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { relativePath: { $regex: search, $options: "i" } },
        { "metadata.description": { $regex: search, $options: "i" } },
        { "metadata.tags": { $regex: search, $options: "i" } },
        { "metadata.keywords": { $regex: search, $options: "i" } },
      ];
    }

    if (type) query.type = type;
    if (status) query.status = status;
    if (parentId)
      query.parentId =
        parentId instanceof Types.ObjectId
          ? parentId
          : new Types.ObjectId(parentId);
    if (hasChecksum !== undefined) {
      if (hasChecksum) {
        query.checksum = { $exists: true, $ne: null };
      } else {
        query.$or = [{ checksum: { $exists: false } }, { checksum: null }];
      }
    }

    if (startDate || endDate) {
      query.lastModified = {} as { $gte?: Date; $lte?: Date };
      if (startDate) query.lastModified.$gte = startDate;
      if (endDate) query.lastModified.$lte = endDate;
    }

    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        if (value !== undefined && value !== null) {
          if (value instanceof Types.ObjectId) {
            query[`metadata.${key}`] = value;
          } else if (
            typeof value === "string" &&
            Types.ObjectId.isValid(value)
          ) {
            query[`metadata.${key}`] = new Types.ObjectId(value);
          } else {
            query[`metadata.${key}`] = value;
          }
        }
      }
    }

    return super.findWithPagination(query, {
      ...options,
      sort: options.sort || { relativePath: 1 },
    });
  }

  async getTree(
    parentId?: string | Types.ObjectId,
    maxDepth: number = 10,
  ): Promise<IStoragePath[]> {
    const query: FilterQuery<IStoragePath> = { isDeleted: false };
    if (parentId) {
      query.parentId =
        parentId instanceof Types.ObjectId
          ? parentId
          : new Types.ObjectId(parentId);
    } else {
      query.parentId = { $exists: false };
    }
    query.depth = { $lte: maxDepth };
    return this.model.find(query).sort({ depth: 1, name: 1 }).exec();
  }

  async getFolderTree(rootPath?: string): Promise<IStoragePath | null> {
    let root: IStoragePath | null = null;

    if (rootPath) {
      root = await this.findByRelativePath(rootPath);
    } else {
      const roots = await this.findRootFolders();
      root = roots[0] || null;
    }

    if (!root) return null;

    return this.buildTree(root);
  }

  private async buildTree(node: IStoragePath): Promise<IStoragePath> {
    const children = await this.findByParent(node._id);
    (node as any).children = children;

    for (const child of children) {
      await this.buildTree(child);
    }

    return node;
  }

  async getStorageStats(): Promise<{
    totalSize: number;
    totalFiles: number;
    totalFolders: number;
    byType: Record<StorageType, { size: number; count: number }>;
    byStatus: Record<StorageStatus, number>;
  }> {
    return (this.model as IStoragePathModel).getStorageStats();
  }

  async getFolderSize(
    path: string,
  ): Promise<{ size: number; fileCount: number; folderCount: number }> {
    const folder = await this.findByRelativePath(path);
    if (!folder) {
      return { size: 0, fileCount: 0, folderCount: 0 };
    }
    return {
      size: folder.size,
      fileCount: folder.fileCount,
      folderCount: folder.folderCount,
    };
  }

  async updateScanInfo(
    id: string | Types.ObjectId,
    updates: {
      size?: number;
      fileCount?: number;
      folderCount?: number;
      lastModified?: Date;
      checksum?: string;
      status?: StorageStatus;
    },
  ): Promise<IStoragePath | null> {
    return this.updateById(id, {
      ...updates,
      lastScanned: new Date(),
    } as UpdateQuery<IStoragePath>);
  }

  async bulkUpdateStatus(
    ids: (string | Types.ObjectId)[],
    status: StorageStatus,
  ): Promise<number> {
    const result = await this.model
      .updateMany({ _id: { $in: ids } }, { status, lastScanned: new Date() })
      .exec();
    return result.modifiedCount;
  }

  async bulkUpdateParent(
    ids: (string | Types.ObjectId)[],
    parentId: string | Types.ObjectId | null,
  ): Promise<number> {
    const update: UpdateQuery<IStoragePath> = {
      parentId: parentId
        ? parentId instanceof Types.ObjectId
          ? parentId
          : new Types.ObjectId(parentId)
        : undefined,
      $unset: parentId ? {} : { parentId: 1 },
    };
    const result = await this.model
      .updateMany({ _id: { $in: ids } }, update)
      .exec();
    return result.modifiedCount;
  }

  async findOrphanedFiles(): Promise<IStoragePath[]> {
    return this.model
      .find({
        isDeleted: false,
        type: { $ne: "other" },
        $or: [
          { "metadata.publication": { $exists: false } },
          { "metadata.issue": { $exists: false } },
          { "metadata.book": { $exists: false } },
          { "metadata.article": { $exists: false } },
        ],
      })
      .exec();
  }

  async getRecentScans(limit: number = 100): Promise<IStoragePath[]> {
    return this.model
      .find({ isDeleted: false })
      .sort({ lastScanned: -1 })
      .limit(limit)
      .exec();
  }

  async getUnscannedFolders(olderThan: Date): Promise<IStoragePath[]> {
    return this.model
      .find({
        isDeleted: false,
        type: { $in: ["weekly", "monthly", "books", "articles", "media"] },
        lastScanned: { $lt: olderThan },
      })
      .sort({ lastScanned: 1 })
      .exec();
  }
}

export const storageRepository = new StorageRepository();
