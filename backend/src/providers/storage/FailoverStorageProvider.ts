import { Readable } from "stream";
import {
  StorageProvider,
  StorageFile,
  StorageFolder,
  StorageStats,
  StorageUploadOptions,
  StorageDownloadOptions,
  StorageListOptions,
  StorageWatchOptions,
  StorageWatcher,
  StorageEvent,
  StoragePresignedUrlOptions,
  ExistsOptions,
  GetFileOptions,
  GetFolderOptions,
  GetStatsOptions,
  CreateFolderOptions,
  DeleteFolderOptions,
  RenameFolderOptions,
  MoveFolderOptions,
  CopyFolderOptions,
  DeleteFileOptions,
  RenameFileOptions,
  MoveFileOptions,
  CopyFileOptions,
  GetChecksumOptions,
  VerifyChecksumOptions,
  GetPublicUrlOptions,
} from "./StorageProvider";
import { logger } from "../../utils/logger";

export interface FailoverHealthStatus {
  activeProvider: string;
  primaryHealthy: boolean;
  consecutiveFailures: number;
  lastFailureTime: Date | null;
  primaryName: string;
  secondaryName: string;
}

export class FailoverStorageProvider implements StorageProvider {
  readonly name = "failover";
  readonly type: 'local' | 's3' | 'azure' | 'gcs' | 'r2';

  private primary: StorageProvider;
  private secondary: StorageProvider;
  private primaryHealthy = true;
  private consecutiveFailures = 0;
  private lastFailureTime: Date | null = null;
  private readonly failureThreshold = 3;
  private readonly cooldownMs = 30000; // 30s before retrying primary after tripping

  constructor(primary: StorageProvider, secondary: StorageProvider) {
    this.primary = primary;
    this.secondary = secondary;
    this.type = primary.type;
  }

  public getHealthStatus(): FailoverHealthStatus {
    return {
      activeProvider: this.shouldUsePrimary() ? this.primary.name : this.secondary.name,
      primaryHealthy: this.primaryHealthy,
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime,
      primaryName: this.primary.name,
      secondaryName: this.secondary.name,
    };
  }

  private shouldUsePrimary(): boolean {
    if (this.primaryHealthy) return true;
    if (this.lastFailureTime && Date.now() - this.lastFailureTime.getTime() > this.cooldownMs) {
      // Cooldown expired, probe primary again
      return true;
    }
    return false;
  }

  private recordSuccess(): void {
    if (!this.primaryHealthy) {
      logger.info(`[FailoverStorageProvider] Primary storage (${this.primary.name}) recovered.`);
    }
    this.primaryHealthy = true;
    this.consecutiveFailures = 0;
  }

  private recordFailure(error: any): void {
    this.consecutiveFailures++;
    this.lastFailureTime = new Date();
    if (this.consecutiveFailures >= this.failureThreshold) {
      this.primaryHealthy = false;
      logger.warn(
        `[FailoverStorageProvider] Primary storage tripped after ${this.consecutiveFailures} errors. Routing traffic to secondary (${this.secondary.name}). Reason: ${error?.message}`
      );
    }
  }

  private async executeWithFailover<T>(
    operationName: string,
    primaryOp: () => Promise<T>,
    secondaryOp: () => Promise<T>
  ): Promise<T> {
    if (this.shouldUsePrimary()) {
      try {
        const result = await primaryOp();
        this.recordSuccess();
        return result;
      } catch (err: any) {
        this.recordFailure(err);
        logger.warn(`[FailoverStorageProvider] ${operationName} failed on primary: ${err.message}. Failing over to secondary.`);
        return await secondaryOp();
      }
    } else {
      return await secondaryOp();
    }
  }

  async initialize(config: Record<string, any>): Promise<void> {
    await Promise.allSettled([
      this.primary.initialize(config),
      this.secondary.initialize(config),
    ]);
  }

  async healthCheck(): Promise<boolean> {
    const [prim, sec] = await Promise.allSettled([
      this.primary.healthCheck(),
      this.secondary.healthCheck(),
    ]);
    const primOk = prim.status === "fulfilled" && prim.value;
    this.primaryHealthy = primOk;
    return primOk || (sec.status === "fulfilled" && sec.value);
  }

  exists(options: ExistsOptions): Promise<boolean> {
    return this.executeWithFailover(
      "exists",
      () => this.primary.exists(options),
      () => this.secondary.exists(options)
    );
  }

  getFile(options: GetFileOptions): Promise<StorageFile | null> {
    return this.executeWithFailover(
      "getFile",
      () => this.primary.getFile(options),
      () => this.secondary.getFile(options)
    );
  }

  getFolder(options: GetFolderOptions): Promise<StorageFolder | null> {
    return this.executeWithFailover(
      "getFolder",
      () => this.primary.getFolder(options),
      () => this.secondary.getFolder(options)
    );
  }

  list(options: StorageListOptions): Promise<{ files: StorageFile[]; folders: StorageFolder[] }> {
    return this.executeWithFailover(
      "list",
      () => this.primary.list(options),
      () => this.secondary.list(options)
    );
  }

  getStats(options: GetStatsOptions): Promise<StorageStats> {
    return this.executeWithFailover(
      "getStats",
      () => this.primary.getStats(options),
      () => this.secondary.getStats(options)
    );
  }

  createFolder(options: CreateFolderOptions): Promise<void> {
    return this.executeWithFailover(
      "createFolder",
      () => this.primary.createFolder(options),
      () => this.secondary.createFolder(options)
    );
  }

  deleteFolder(options: DeleteFolderOptions): Promise<void> {
    return this.executeWithFailover(
      "deleteFolder",
      () => this.primary.deleteFolder(options),
      () => this.secondary.deleteFolder(options)
    );
  }

  renameFolder(options: RenameFolderOptions): Promise<void> {
    return this.executeWithFailover(
      "renameFolder",
      () => this.primary.renameFolder(options),
      () => this.secondary.renameFolder(options)
    );
  }

  moveFolder(options: MoveFolderOptions): Promise<void> {
    return this.executeWithFailover(
      "moveFolder",
      () => this.primary.moveFolder(options),
      () => this.secondary.moveFolder(options)
    );
  }

  copyFolder(options: CopyFolderOptions): Promise<void> {
    return this.executeWithFailover(
      "copyFolder",
      () => this.primary.copyFolder(options),
      () => this.secondary.copyFolder(options)
    );
  }

  upload(filePath: string, data: Buffer | Readable, options?: StorageUploadOptions): Promise<StorageFile> {
    return this.executeWithFailover(
      "upload",
      () => this.primary.upload(filePath, data, options),
      () => this.secondary.upload(filePath, data, options)
    );
  }

  download(filePath: string, options?: StorageDownloadOptions): Promise<Readable> {
    return this.executeWithFailover(
      "download",
      () => this.primary.download(filePath, options),
      () => this.secondary.download(filePath, options)
    );
  }

  stream(filePath: string, options?: StorageDownloadOptions): Promise<Readable> {
    return this.executeWithFailover(
      "stream",
      () => this.primary.stream(filePath, options),
      () => this.secondary.stream(filePath, options)
    );
  }

  delete(options: DeleteFileOptions): Promise<void> {
    return this.executeWithFailover(
      "delete",
      () => this.primary.delete(options),
      () => this.secondary.delete(options)
    );
  }

  rename(options: RenameFileOptions): Promise<void> {
    return this.executeWithFailover(
      "rename",
      () => this.primary.rename(options),
      () => this.secondary.rename(options)
    );
  }

  move(options: MoveFileOptions): Promise<void> {
    return this.executeWithFailover(
      "move",
      () => this.primary.move(options),
      () => this.secondary.move(options)
    );
  }

  copy(options: CopyFileOptions): Promise<void> {
    return this.executeWithFailover(
      "copy",
      () => this.primary.copy(options),
      () => this.secondary.copy(options)
    );
  }

  getChecksum(options: GetChecksumOptions): Promise<string> {
    return this.executeWithFailover(
      "getChecksum",
      () => this.primary.getChecksum(options),
      () => this.secondary.getChecksum(options)
    );
  }

  verifyChecksum(options: VerifyChecksumOptions): Promise<boolean> {
    return this.executeWithFailover(
      "verifyChecksum",
      () => this.primary.verifyChecksum(options),
      () => this.secondary.verifyChecksum(options)
    );
  }

  getPresignedUrl(options: StoragePresignedUrlOptions): Promise<string> {
    return this.executeWithFailover(
      "getPresignedUrl",
      () => this.primary.getPresignedUrl(options),
      () => this.secondary.getPresignedUrl(options)
    );
  }

  getPublicUrl(options: GetPublicUrlOptions): Promise<string> {
    return this.executeWithFailover(
      "getPublicUrl",
      () => this.primary.getPublicUrl(options),
      () => this.secondary.getPublicUrl(options)
    );
  }

  watch(path: string, options: StorageWatchOptions, callback: (event: StorageEvent) => void): Promise<StorageWatcher> {
    return this.primary.watch(path, options, callback);
  }

  unwatch(watcher: StorageWatcher): Promise<void> {
    return this.primary.unwatch(watcher);
  }
}
