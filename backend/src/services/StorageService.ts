import { Types } from "mongoose";
import { storageRepository } from "../repositories/StorageRepository";
import { metadataRepository } from "../repositories/MetadataRepository";
import {
  IStoragePath,
  StorageType,
  StorageStatus,
} from "../models/StoragePath";
import {
  getStorageProvider,
  StorageProvider,
  StorageFile,
  StorageFolder,
  StorageStats,
  UploadOptions,
  StreamOptions,
} from "../providers/storage";
import { Readable } from "stream";
import { ApiError } from "../middleware/errorHandler";
import {
  PaginationOptions,
  PaginatedResult,
} from "../repositories/BaseRepository";
import { SearchFilter } from "../repositories/MetadataRepository";

export interface CreateFolderInput {
  path: string;
  name: string;
  type: StorageType;
  parentId?: string | Types.ObjectId;
  metadata?: Partial<IStoragePath["metadata"]>;
}

export interface UpdateFolderInput {
  name?: string;
  type?: StorageType;
  status?: StorageStatus;
  parentId?: string | Types.ObjectId | null;
  metadata?: Partial<IStoragePath["metadata"]>;
}

export interface ImportFolderInput {
  sourcePath: string;
  type: StorageType;
  parentId?: string | Types.ObjectId;
  metadata?: Partial<IStoragePath["metadata"]>;
  recursive?: boolean;
  overwrite?: boolean;
}

export interface SyncResult {
  created: number;
  updated: number;
  deleted: number;
  errors: Array<{ path: string; error: string }>;
  duration: number;
}

export class StorageService {
  private provider: StorageProvider;
  private isInitialized = false;

  constructor() {
    this.provider = getStorageProvider();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.provider.initialize({});
    this.isInitialized = true;
  }

  getProvider(): StorageProvider {
    return this.provider;
  }

  async createFolder(input: CreateFolderInput): Promise<IStoragePath> {
    await this.initialize();

    const { path, name, type, parentId, metadata } = input;

    const absolutePath = path;
    const exists = await this.provider.exists({ path: absolutePath });
    if (exists) {
      throw new ApiError(409, `Folder already exists at path: ${path}`);
    }

    await this.provider.createFolder({ path: absolutePath });

    const folderData: Partial<IStoragePath> = {
      path: absolutePath,
      relativePath: path,
      type,
      name,
      parentId: parentId ? new Types.ObjectId(parentId) : undefined,
      depth: parentId ? (await this.getDepth(parentId)) + 1 : 0,
      status: "active",
      metadata: metadata || {},
    };

    if (parentId) {
      const parent = await storageRepository.findById(parentId);
      if (parent) {
        folderData.depth = parent.depth + 1;
      }
    }

    const folder = await storageRepository.create(folderData);
    return folder;
  }

  private async getDepth(parentId: string | Types.ObjectId): Promise<number> {
    const parent = await storageRepository.findById(parentId);
    return parent?.depth || 0;
  }

  async updateFolder(
    id: string | Types.ObjectId,
    input: UpdateFolderInput,
  ): Promise<IStoragePath> {
    await this.initialize();

    const folder = await storageRepository.findByIdOrThrow(id);

    const { parentId, ...rest } = input;
    const updateData: Partial<IStoragePath> = { ...rest };

    if (parentId !== undefined) {
      if (parentId === null) {
        updateData.parentId = undefined;
        updateData.depth = 0;
      } else {
        updateData.parentId = new Types.ObjectId(parentId);
        updateData.depth = (await this.getDepth(parentId)) + 1;
      }
    }

    if (input.name && input.name !== folder.name) {
      const newRelativePath = this.buildRelativePath(folder, input.name);
      const newAbsolutePath = this.buildAbsolutePath(newRelativePath);

      await this.provider.renameFolder({
        sourcePath: folder.path,
        destinationPath: newAbsolutePath,
      });
      updateData.path = newAbsolutePath;
      updateData.relativePath = newRelativePath;
    }

    const updated = await storageRepository.updateById(id, updateData);
    if (!updated) throw new ApiError(500, "Failed to update folder");

    return updated;
  }

  private buildRelativePath(folder: IStoragePath, newName: string): string {
    const parts = folder.relativePath.split("/");
    parts[parts.length - 1] = newName;
    return parts.join("/");
  }

  private buildAbsolutePath(relativePath: string): string {
    return relativePath;
  }

  async deleteFolder(
    id: string | Types.ObjectId,
    recursive: boolean = true,
  ): Promise<void> {
    await this.initialize();

    const folder = await storageRepository.findByIdOrThrow(id);

    if (recursive) {
      await this.deleteFolderRecursive(folder);
    } else {
      const children = await storageRepository.findByParent(id);
      if (children.length > 0) {
        throw new ApiError(
          409,
          "Folder is not empty. Use recursive=true to delete with contents.",
        );
      }
      await this.provider.deleteFolder({ path: folder.path, recursive: false });
      await storageRepository.softDelete(id);
    }
  }

  private async deleteFolderRecursive(folder: IStoragePath): Promise<void> {
    const children = await storageRepository.findByParent(folder._id);

    for (const child of children) {
      await this.deleteFolderRecursive(child);
    }

    await this.provider.deleteFolder({ path: folder.path, recursive: true });
    await storageRepository.softDelete(folder._id);
  }

  async moveFolder(
    id: string | Types.ObjectId,
    destinationPath: string,
  ): Promise<IStoragePath> {
    await this.initialize();

    const folder = await storageRepository.findByIdOrThrow(id);
    const destFolder =
      await storageRepository.findByRelativePath(destinationPath);

    if (!destFolder) {
      throw new ApiError(
        404,
        `Destination folder not found: ${destinationPath}`,
      );
    }

    const newRelativePath = `${destinationPath}/${folder.name}`;
    const newAbsolutePath = newRelativePath;

    await this.provider.moveFolder({
      sourcePath: folder.path,
      destinationPath: newAbsolutePath,
    });

    const updated = await storageRepository.updateById(id, {
      path: newAbsolutePath,
      relativePath: newRelativePath,
      parentId: destFolder._id,
      depth: destFolder.depth + 1,
    });

    if (!updated) throw new ApiError(500, "Failed to move folder");

    await this.updateChildrenPaths(
      folder,
      newRelativePath,
      destFolder.depth + 1,
    );

    return updated;
  }

  private async updateChildrenPaths(
    parent: IStoragePath,
    newParentPath: string,
    newDepth: number,
  ): Promise<void> {
    const children = await storageRepository.findByParent(parent._id);

    for (const child of children) {
      const newRelativePath = `${newParentPath}/${child.name}`;
      const newAbsolutePath = newRelativePath;

      await storageRepository.updateById(child._id, {
        path: newAbsolutePath,
        relativePath: newRelativePath,
        depth: newDepth,
      });

      await this.updateChildrenPaths(child, newRelativePath, newDepth + 1);
    }
  }

  async renameFolder(
    id: string | Types.ObjectId,
    newName: string,
  ): Promise<IStoragePath> {
    return this.updateFolder(id, { name: newName });
  }

  async getFolderTree(rootPath?: string): Promise<IStoragePath | null> {
    return storageRepository.getFolderTree(rootPath);
  }

  async getFolder(id: string | Types.ObjectId): Promise<IStoragePath> {
    const folder = await storageRepository.findById(id);
    if (!folder) throw new ApiError(404, "Folder not found");
    return folder;
  }

  async getFolderByPath(path: string): Promise<IStoragePath | null> {
    return storageRepository.findByRelativePath(path);
  }

  async listFolderContents(
    path: string,
    options: {
      recursive?: boolean;
      includeFiles?: boolean;
      includeFolders?: boolean;
    } = {},
  ): Promise<{ files: StorageFile[]; folders: StorageFolder[] }> {
    await this.initialize();
    return this.provider.list({ path, ...options });
  }

  async getStorageStats(path?: string): Promise<StorageStats> {
    await this.initialize();
    return this.provider.getStats({ path });
  }

  async getFolderSize(
    path: string,
  ): Promise<{ size: number; fileCount: number; folderCount: number }> {
    return storageRepository.getFolderSize(path);
  }

  async browseStorage(
    filter: SearchFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    return metadataRepository.search(filter, options);
  }

  async searchStorage(
    query: string,
    filter: Omit<SearchFilter, "query"> = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IStoragePath>> {
    return metadataRepository.search({ ...filter, query }, options);
  }

  async getFacets(): Promise<any> {
    return metadataRepository.getFacets();
  }

  async getSuggestions(
    field: string,
    prefix: string,
    limit?: number,
  ): Promise<string[]> {
    return metadataRepository.getSuggestions(field, prefix, limit);
  }

  async importFolder(input: ImportFolderInput): Promise<SyncResult> {
    await this.initialize();

    const startTime = Date.now();
    const result: SyncResult = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      duration: 0,
    };

    try {
      const sourceExists = await this.provider.exists({
        path: input.sourcePath,
      });
      if (!sourceExists) {
        throw new ApiError(404, `Source path not found: ${input.sourcePath}`);
      }

      const sourceStats = await this.provider.getStats({
        path: input.sourcePath,
      });

      const folderData: Partial<IStoragePath> = {
        path: input.sourcePath,
        relativePath: input.sourcePath,
        type: input.type,
        name: input.sourcePath.split("/").pop() || input.sourcePath,
        parentId: input.parentId
          ? new Types.ObjectId(input.parentId)
          : undefined,
        depth: input.parentId ? (await this.getDepth(input.parentId)) + 1 : 0,
        status: "active",
        size: sourceStats.totalSize,
        fileCount: sourceStats.fileCount,
        folderCount: sourceStats.folderCount,
        metadata: input.metadata || {},
      };

      const existing = await storageRepository.findByRelativePath(
        input.sourcePath,
      );

      if (existing) {
        if (input.overwrite) {
          await storageRepository.updateById(existing._id, folderData);
          result.updated++;
        } else {
          throw new ApiError(409, `Folder already exists: ${input.sourcePath}`);
        }
      } else {
        await storageRepository.create(folderData);
        result.created++;
      }

      if (input.recursive) {
        const subResult = await this.syncFolderRecursive(
          input.sourcePath,
          input.type,
          folderData._id!,
          input.metadata,
        );
        result.created += subResult.created;
        result.updated += subResult.updated;
        result.errors.push(...subResult.errors);
      }
    } catch (error) {
      result.errors.push({
        path: input.sourcePath,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async syncFolderRecursive(
    folderPath: string,
    type: StorageType,
    parentId: Types.ObjectId,
    metadata?: Partial<IStoragePath["metadata"]>,
  ): Promise<SyncResult> {
    const result: SyncResult = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      duration: 0,
    };
    const startTime = Date.now();

    try {
      const { files, folders } = await this.provider.list({
        path: folderPath,
        recursive: false,
      });

      for (const file of files) {
        try {
          const fileData: Partial<IStoragePath> = {
            path: file.path,
            relativePath: file.path,
            type,
            name: file.path.split("/").pop() || file.path,
            parentId,
            depth: (await this.getDepth(parentId)) + 1,
            status: "active",
            size: file.size,
            fileCount: 1,
            folderCount: 0,
            lastModified: file.lastModified,
            metadata: {
              ...metadata,
              fileSize: file.size,
              checksum: file.checksum,
            },
          };

          const existing = await storageRepository.findByRelativePath(
            file.path,
          );
          if (existing) {
            await storageRepository.updateById(existing._id, fileData);
            result.updated++;
          } else {
            await storageRepository.create(fileData);
            result.created++;
          }
        } catch (error) {
          result.errors.push({
            path: file.path,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      for (const folder of folders) {
        try {
          const folderData: Partial<IStoragePath> = {
            path: folder.path,
            relativePath: folder.path,
            type,
            name: folder.name,
            parentId,
            depth: (await this.getDepth(parentId)) + 1,
            status: "active",
            size: folder.size,
            fileCount: folder.fileCount,
            folderCount: folder.folderCount,
            lastModified: folder.lastModified,
            metadata,
          };

          const existing = await storageRepository.findByRelativePath(
            folder.path,
          );
          if (existing) {
            await storageRepository.updateById(existing._id, folderData);
            result.updated++;
          } else {
            const created = await storageRepository.create(folderData);
            result.created++;

            const subResult = await this.syncFolderRecursive(
              folder.path,
              type,
              created._id,
              metadata,
            );
            result.created += subResult.created;
            result.updated += subResult.updated;
            result.errors.push(...subResult.errors);
          }
        } catch (error) {
          result.errors.push({
            path: folder.path,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    } catch (error) {
      result.errors.push({
        path: folderPath,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async fullReindex(): Promise<SyncResult> {
    await this.initialize();

    const result: SyncResult = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      duration: 0,
    };
    const startTime = Date.now();

    try {
      const rootFolders = await this.provider.list({
        path: "",
        recursive: false,
      });

      for (const folder of rootFolders.folders) {
        const type = this.inferTypeFromPath(folder.path);
        const subResult = await this.syncFolderRecursive(
          folder.path,
          type,
          null as any,
        );
        result.created += subResult.created;
        result.updated += subResult.updated;
        result.errors.push(...subResult.errors);
      }
    } catch (error) {
      result.errors.push({
        path: "/",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async partialReindex(paths: string[]): Promise<SyncResult> {
    await this.initialize();

    const result: SyncResult = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      duration: 0,
    };
    const startTime = Date.now();

    for (const path of paths) {
      try {
        const type = this.inferTypeFromPath(path);
        const subResult = await this.syncFolderRecursive(
          path,
          type,
          null as any,
        );
        result.created += subResult.created;
        result.updated += subResult.updated;
        result.errors.push(...subResult.errors);
      } catch (error) {
        result.errors.push({
          path,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async repairMetadata(): Promise<SyncResult> {
    const result: SyncResult = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      duration: 0,
    };
    const startTime = Date.now();

    try {
      const allPaths = await storageRepository.find({ isDeleted: false });

      for (const path of allPaths) {
        try {
          const exists = await this.provider.exists({ path: path.path });

          if (!exists) {
            await storageRepository.updateById(path._id, { status: "missing" });
            result.updated++;
            continue;
          }

          const stats = await this.provider.getStats({ path: path.path });
          const checksum = await this.provider.getChecksum({
            path: path.path,
            algorithm: "md5",
          });

          await storageRepository.updateById(path._id, {
            size: stats.totalSize,
            fileCount: stats.fileCount,
            folderCount: stats.folderCount,
            lastModified: new Date(),
            checksum,
            status: "active",
          });
          result.updated++;
        } catch (error) {
          result.errors.push({
            path: path.path,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    } catch (error) {
      result.errors.push({
        path: "/",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  async detectMissingFiles(): Promise<IStoragePath[]> {
    return storageRepository.findMissingFiles();
  }

  async detectDuplicateFiles(): Promise<
    Array<{ checksum: string; count: number; paths: string[] }>
  > {
    return storageRepository.findDuplicates();
  }

  async verifyChecksum(
    path: string,
    expectedChecksum: string,
    algorithm?: string,
  ): Promise<boolean> {
    await this.initialize();
    return this.provider.verifyChecksum({ path, expectedChecksum, algorithm });
  }

  async calculateChecksum(path: string, algorithm?: string): Promise<string> {
    await this.initialize();
    return this.provider.getChecksum({
      path,
      algorithm: (algorithm || "md5") as any,
    });
  }

  async streamFile(path: string, options?: StreamOptions) {
    await this.initialize();
    const downloadOptions =
      options && options.start !== undefined && options.end !== undefined
        ? { range: { start: options.start, end: options.end } }
        : undefined;
    return this.provider.stream(path, downloadOptions);
  }

  async downloadFile(path: string, options?: StreamOptions) {
    await this.initialize();
    const downloadOptions =
      options && options.start !== undefined && options.end !== undefined
        ? { range: { start: options.start, end: options.end } }
        : undefined;
    return this.provider.download(path, downloadOptions);
  }

  async uploadFile(file: Buffer | Readable, options: UploadOptions) {
    await this.initialize();
    const uploadOptions = {
      mimeType: options.contentType,
      metadata: options.metadata,
    };
    return this.provider.upload(options.path, file, uploadOptions);
  }

  async deleteFile(path: string) {
    await this.initialize();
    return this.provider.delete({ path });
  }

  async getPublicUrl(path: string): Promise<string> {
    await this.initialize();
    return this.provider.getPublicUrl({ path });
  }

  async generatePresignedUrl(
    path: string,
    expiresIn: number,
    method?: "GET" | "PUT",
  ): Promise<string> {
    await this.initialize();
    return this.provider.getPresignedUrl({ path, expiresIn, method });
  }

  private inferTypeFromPath(path: string): StorageType {
    const lowerPath = path.toLowerCase();
    if (lowerPath.includes("weekly")) return "weekly";
    if (lowerPath.includes("monthly")) return "monthly";
    if (lowerPath.includes("book")) return "books";
    if (lowerPath.includes("article")) return "articles";
    if (lowerPath.includes("media")) return "media";
    return "other";
  }
}

export const storageService = new StorageService();
