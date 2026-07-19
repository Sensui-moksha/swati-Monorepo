import { Types } from "mongoose";
import { storageRepository } from "../repositories/StorageRepository";
import { IStoragePath, StorageType } from "../models/StoragePath";
import {
  StorageProvider,
  getStorageProvider,
  StorageFile,
  StorageFolder,
  StorageStats,
} from "../providers/storage";
import { ApiError } from "../middleware/errorHandler";

export interface ScanJob {
  id: string;
  type: "full" | "incremental" | "targeted" | "deep";
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  paths?: string[];
  startedAt?: Date;
  completedAt?: Date;
  progress: {
    total: number;
    processed: number;
    created: number;
    updated: number;
    deleted: number;
    errors: number;
  };
  result?: {
    created: number;
    updated: number;
    deleted: number;
    errors: Array<{ path: string; error: string }>;
    duration: number;
    scannedPaths: string[];
  };
  error?: string;
}

export interface ScanSchedule {
  id: string;
  name: string;
  type: "full" | "incremental" | "targeted" | "deep";
  cronExpression: string;
  paths?: string[];
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  failureCount: number;
  options?: {
    deepScan?: boolean;
    verifyChecksums?: boolean;
    updateMetadata?: boolean;
    detectDuplicates?: boolean;
  };
}

export interface ScanOptions {
  deepScan?: boolean;
  verifyChecksums?: boolean;
  updateMetadata?: boolean;
  detectDuplicates?: boolean;
  maxDepth?: number;
  followSymlinks?: boolean;
  includeHidden?: boolean;
}

export class FilesystemScannerService {
  private provider: StorageProvider;
  private jobs: Map<string, ScanJob> = new Map();
  private schedules: Map<string, ScanSchedule> = new Map();
  private isRunning = false;
  private currentJobId: string | null = null;

  constructor() {
    this.provider = getStorageProvider();
  }

  async initialize(): Promise<void> {
    await this.provider.initialize({});
    await this.loadSchedules();
  }

  private async loadSchedules(): Promise<void> {
    this.createDefaultSchedules();
  }

  private createDefaultSchedules(): void {
    const defaultSchedules: ScanSchedule[] = [
      {
        id: "full-scan-daily",
        name: "Full Scan Daily",
        type: "full",
        cronExpression: "0 1 * * *", // 1 AM daily
        enabled: true,
        runCount: 0,
        failureCount: 0,
        options: {
          deepScan: true,
          verifyChecksums: true,
          updateMetadata: true,
          detectDuplicates: true,
        },
      },
      {
        id: "incremental-scan-hourly",
        name: "Incremental Scan Hourly",
        type: "incremental",
        cronExpression: "0 * * * *", // Every hour
        enabled: true,
        runCount: 0,
        failureCount: 0,
        options: {
          deepScan: false,
          verifyChecksums: false,
          updateMetadata: true,
          detectDuplicates: false,
        },
      },
      {
        id: "deep-scan-weekly",
        name: "Deep Scan Weekly",
        type: "deep",
        cronExpression: "0 2 * * 0", // 2 AM Sunday
        enabled: true,
        runCount: 0,
        failureCount: 0,
        options: {
          deepScan: true,
          verifyChecksums: true,
          updateMetadata: true,
          detectDuplicates: true,
        },
      },
    ];

    for (const schedule of defaultSchedules) {
      this.schedules.set(schedule.id, schedule);
    }
  }

  async createJob(
    type: ScanJob["type"],
    paths?: string[],
    _options?: ScanOptions,
  ): Promise<ScanJob> {
    const jobId = `scan_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: ScanJob = {
      id: jobId,
      type,
      status: "pending",
      paths,
      progress: {
        total: 0,
        processed: 0,
        created: 0,
        updated: 0,
        deleted: 0,
        errors: 0,
      },
    };

    this.jobs.set(jobId, job);
    return job;
  }

  async getJob(jobId: string): Promise<ScanJob | null> {
    return this.jobs.get(jobId) || null;
  }

  async getAllJobs(): Promise<ScanJob[]> {
    return Array.from(this.jobs.values()).sort(
      (a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0),
    );
  }

  async getJobsByStatus(status: ScanJob["status"]): Promise<ScanJob[]> {
    return Array.from(this.jobs.values()).filter(
      (job) => job.status === status,
    );
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === "running" && job.id === this.currentJobId) {
      job.status = "cancelled";
      return true;
    }

    if (job.status === "pending") {
      job.status = "cancelled";
      return true;
    }

    return false;
  }

  async runFullScan(options?: ScanOptions): Promise<ScanJob> {
    const job = await this.createJob("full", undefined, options);
    return this.executeJob(job);
  }

  async runIncrementalScan(options?: ScanOptions): Promise<ScanJob> {
    const job = await this.createJob("incremental", undefined, options);
    return this.executeJob(job);
  }

  async runTargetedScan(
    paths: string[],
    options?: ScanOptions,
  ): Promise<ScanJob> {
    const job = await this.createJob("targeted", paths, options);
    return this.executeJob(job);
  }

  async runDeepScan(options?: ScanOptions): Promise<ScanJob> {
    const job = await this.createJob("deep", undefined, options);
    return this.executeJob(job);
  }

  private async executeJob(job: ScanJob): Promise<ScanJob> {
    if (this.isRunning) {
      throw new ApiError(409, "Another scan job is already running");
    }

    this.isRunning = true;
    this.currentJobId = job.id;
    job.status = "running";
    job.startedAt = new Date();

    try {
      let result;

      switch (job.type) {
        case "full":
          result = await this.executeFullScan(job);
          break;
        case "incremental":
          result = await this.executeIncrementalScan(job);
          break;
        case "targeted":
          result = await this.executeTargetedScan(job);
          break;
        case "deep":
          result = await this.executeDeepScan(job);
          break;
        default:
          throw new Error(`Unknown scan type: ${job.type}`);
      }

      job.status = "completed";
      job.completedAt = new Date();
      job.result = result;
      job.progress.processed = job.progress.total;
    } catch (error) {
      job.status = "failed";
      job.completedAt = new Date();
      job.error = error instanceof Error ? error.message : "Unknown error";
    } finally {
      this.isRunning = false;
      this.currentJobId = null;
    }

    return job;
  }

  private async executeFullScan(job: ScanJob): Promise<ScanJob["result"]> {
    const result: ScanJob["result"] = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      duration: 0,
      scannedPaths: [],
    };

    const startTime = Date.now();
    const options = job as any; // Access options from job

    try {
      const rootListing = await this.provider.list({
        path: "",
        recursive: false,
      });
      job.progress.total = rootListing.folders.length;

      for (const folder of rootListing.folders) {
        if (job.status === "cancelled") break;

        const subResult = await this.scanFolderRecursive(
          folder.path,
          this.inferTypeFromPath(folder.path),
          null,
          options,
        );

        result.created += subResult.created;
        result.updated += subResult.updated;
        result.deleted += subResult.deleted;
        result.errors.push(...subResult.errors);
        result.scannedPaths.push(folder.path);

        job.progress.processed++;
        job.progress.created = result.created;
        job.progress.updated = result.updated;
        job.progress.deleted = result.deleted;
        job.progress.errors = result.errors.length;
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

  private async executeIncrementalScan(
    job: ScanJob,
  ): Promise<ScanJob["result"]> {
    const result: ScanJob["result"] = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      duration: 0,
      scannedPaths: [],
    };

    const startTime = Date.now();
    const olderThan = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    const unscannedFolders =
      await storageRepository.getUnscannedFolders(olderThan);

    job.progress.total = unscannedFolders.length;

    for (const folder of unscannedFolders) {
      if (job.status === "cancelled") break;

      try {
        const exists = await this.provider.exists({ path: folder.path });

        if (!exists) {
          await storageRepository.updateById(folder._id, { status: "missing" });
          result.updated++;
        } else {
          const stats = await this.provider.getStats({ path: folder.path });
          const checksum = await this.provider.getChecksum({
            path: folder.path,
            algorithm: "md5",
          });

          await storageRepository.updateById(folder._id, {
            size: stats.totalSize,
            fileCount: stats.fileCount,
            folderCount: stats.folderCount,
            lastModified: new Date(),
            checksum,
            status: "active",
            lastScanned: new Date(),
          });
          result.updated++;
        }

        result.scannedPaths.push(folder.path);
        job.progress.processed++;
        job.progress.updated = result.updated;
      } catch (error) {
        result.errors.push({
          path: folder.path,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        job.progress.errors++;
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async executeTargetedScan(job: ScanJob): Promise<ScanJob["result"]> {
    const result: ScanJob["result"] = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      duration: 0,
      scannedPaths: [],
    };

    const startTime = Date.now();
    const paths = job.paths || [];
    job.progress.total = paths.length;

    for (const path of paths) {
      if (job.status === "cancelled") break;

      try {
        const type = this.inferTypeFromPath(path);
        const subResult = await this.scanFolderRecursive(
          path,
          type,
          null,
          job as any,
        );

        result.created += subResult.created;
        result.updated += subResult.updated;
        result.deleted += subResult.deleted;
        result.errors.push(...subResult.errors);
        result.scannedPaths.push(path);

        job.progress.processed++;
        job.progress.created = result.created;
        job.progress.updated = result.updated;
        job.progress.deleted = result.deleted;
        job.progress.errors = result.errors.length;
      } catch (error) {
        result.errors.push({
          path,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        job.progress.errors++;
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  private async executeDeepScan(job: ScanJob): Promise<ScanJob["result"]> {
    // Deep scan includes checksum verification and duplicate detection
    const result: ScanJob["result"] = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      duration: 0,
      scannedPaths: [],
    };

    const startTime = Date.now();

    try {
      // First do a full scan
      const fullScanResult = await this.executeFullScan(job);
      if (fullScanResult) {
        result.created = fullScanResult.created;
        result.updated = fullScanResult.updated;
        result.deleted = fullScanResult.deleted;
        result.errors.push(...fullScanResult.errors);
        result.scannedPaths.push(...fullScanResult.scannedPaths);
      }

      // Then verify checksums
      if (job.status !== "cancelled") {
        const verifyResult = await this.verifyAllChecksums(job);
        result.updated += verifyResult.updated;
        result.errors.push(...verifyResult.errors);
      }

      // Then detect duplicates
      if (job.status !== "cancelled") {
        const duplicateResult = await this.detectDuplicates(job);
        result.errors.push(...duplicateResult.errors);
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

  private async scanFolderRecursive(
    folderPath: string,
    type: StorageType,
    parentId: Types.ObjectId | null,
    options?: ScanOptions,
  ): Promise<{
    created: number;
    updated: number;
    deleted: number;
    errors: Array<{ path: string; error: string }>;
  }> {
    const result = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [] as Array<{ path: string; error: string }>,
    };

    try {
      const { files, folders } = await this.provider.list({
        path: folderPath,
        recursive: false,
      });

      // Process files
      for (const file of files) {
        try {
          const fileData: Partial<IStoragePath> = {
            path: file.path,
            relativePath: file.path,
            type,
            name: file.path.split("/").pop() || file.path,
            parentId: parentId || undefined,
            depth: parentId ? (await this.getDepth(parentId)) + 1 : 0,
            status: "active",
            size: file.size,
            fileCount: 1,
            folderCount: 0,
            lastModified: file.lastModified,
            lastScanned: new Date(),
            metadata: {
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

      // Process subfolders recursively
      for (const folder of folders) {
        try {
          const folderData: Partial<IStoragePath> = {
            path: folder.path,
            relativePath: folder.path,
            type,
            name: folder.name,
            parentId: parentId || undefined,
            depth: parentId ? (await this.getDepth(parentId)) + 1 : 0,
            status: "active",
            size: folder.size,
            fileCount: folder.fileCount,
            folderCount: folder.folderCount,
            lastModified: folder.lastModified,
            lastScanned: new Date(),
            metadata: {},
          };

          const existing = await storageRepository.findByRelativePath(
            folder.path,
          );
          let folderId: Types.ObjectId;

          if (existing) {
            await storageRepository.updateById(existing._id, folderData);
            folderId = existing._id;
            result.updated++;
          } else {
            const created = await storageRepository.create(folderData);
            folderId = created._id;
            result.created++;
          }

          // Recurse into subfolder
          const subResult = await this.scanFolderRecursive(
            folder.path,
            type,
            folderId,
            options,
          );
          result.created += subResult.created;
          result.updated += subResult.updated;
          result.deleted += subResult.deleted;
          result.errors.push(...subResult.errors);
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

    return result;
  }

  private async getDepth(parentId: Types.ObjectId): Promise<number> {
    const parent = await storageRepository.findById(parentId);
    return parent?.depth || 0;
  }

  private async verifyAllChecksums(job: ScanJob): Promise<{
    updated: number;
    errors: Array<{ path: string; error: string }>;
  }> {
    const result = {
      updated: 0,
      errors: [] as Array<{ path: string; error: string }>,
    };

    const allPaths = await storageRepository.find({
      isDeleted: false,
      checksum: { $exists: true, $ne: null },
    });

    job.progress.total = allPaths.length;
    job.progress.processed = 0;

    for (const path of allPaths) {
      if (job.status === "cancelled") break;

      try {
        if (!path.checksum) continue;

        const isValid = await this.provider.verifyChecksum({
          path: path.path,
          expectedChecksum: path.checksum,
        });

        if (!isValid) {
          await storageRepository.updateById(path._id, { status: "corrupted" });
          result.errors.push({
            path: path.path,
            error: "Checksum verification failed",
          });
        } else {
          await storageRepository.updateById(path._id, {
            status: "active",
            lastScanned: new Date(),
          });
        }
        result.updated++;

        job.progress.processed++;
        job.progress.updated = result.updated;
      } catch (error) {
        result.errors.push({
          path: path.path,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        job.progress.errors++;
      }
    }

    return result;
  }

  private async detectDuplicates(
    job: ScanJob,
  ): Promise<{ errors: Array<{ path: string; error: string }> }> {
    const result = { errors: [] as Array<{ path: string; error: string }> };

    try {
      const duplicates = await storageRepository.findDuplicates();

      for (const dup of duplicates) {
        if (job.status === "cancelled") break;

        const primaryPath = dup.paths[0];
        if (primaryPath) {
          // Mark all but the first as duplicates
          for (let i = 1; i < dup.paths.length; i++) {
            const pathStr = dup.paths[i];
            if (pathStr) {
              const dupPath =
                await storageRepository.findByRelativePath(pathStr);
              if (dupPath) {
                await storageRepository.updateById(dupPath._id, {
                  status: "corrupted",
                  metadata: {
                    ...dupPath.metadata,
                    duplicateOf: primaryPath,
                    duplicateChecksum: dup.checksum,
                  },
                });
              }
            }
          }
        }
      }
    } catch (error) {
      result.errors.push({
        path: "/",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return result;
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

  // Schedule management
  async createSchedule(
    schedule: Omit<ScanSchedule, "id" | "runCount" | "failureCount">,
  ): Promise<ScanSchedule> {
    const newSchedule: ScanSchedule = {
      ...schedule,
      id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      runCount: 0,
      failureCount: 0,
    };

    this.schedules.set(newSchedule.id, newSchedule);
    return newSchedule;
  }

  async getSchedule(scheduleId: string): Promise<ScanSchedule | null> {
    return this.schedules.get(scheduleId) || null;
  }

  async getAllSchedules(): Promise<ScanSchedule[]> {
    return Array.from(this.schedules.values());
  }

  async updateSchedule(
    scheduleId: string,
    updates: Partial<ScanSchedule>,
  ): Promise<ScanSchedule | null> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return null;

    const updated = { ...schedule, ...updates };
    this.schedules.set(scheduleId, updated);
    return updated;
  }

  async deleteSchedule(scheduleId: string): Promise<boolean> {
    return this.schedules.delete(scheduleId);
  }

  async enableSchedule(scheduleId: string): Promise<ScanSchedule | null> {
    return this.updateSchedule(scheduleId, { enabled: true });
  }

  async disableSchedule(scheduleId: string): Promise<ScanSchedule | null> {
    return this.updateSchedule(scheduleId, { enabled: false });
  }

  async runSchedule(scheduleId: string): Promise<ScanJob> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new ApiError(404, "Schedule not found");
    }

    let job: ScanJob;

    switch (schedule.type) {
      case "full":
        job = await this.runFullScan(schedule.options);
        break;
      case "incremental":
        job = await this.runIncrementalScan(schedule.options);
        break;
      case "targeted":
        job = await this.runTargetedScan(
          schedule.paths || [],
          schedule.options,
        );
        break;
      case "deep":
        job = await this.runDeepScan(schedule.options);
        break;
      default:
        throw new Error(`Unknown schedule type: ${schedule.type}`);
    }

    schedule.lastRun = new Date();
    schedule.runCount++;
    if (job.status === "failed") {
      schedule.failureCount++;
    }

    return job;
  }

  // Status and monitoring
  getStatus(): {
    isRunning: boolean;
    currentJob: ScanJob | null;
    queuedJobs: number;
    schedules: number;
  } {
    return {
      isRunning: this.isRunning,
      currentJob: this.currentJobId
        ? this.jobs.get(this.currentJobId) || null
        : null,
      queuedJobs: Array.from(this.jobs.values()).filter(
        (j) => j.status === "pending",
      ).length,
      schedules: this.schedules.size,
    };
  }

  async cleanupOldJobs(olderThanDays: number = 30): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    let deleted = 0;

    for (const [id, job] of this.jobs.entries()) {
      if (
        job.completedAt &&
        job.completedAt < cutoff &&
        job.status !== "running"
      ) {
        this.jobs.delete(id);
        deleted++;
      }
    }

    return deleted;
  }

  // Utility methods
  async getFolderStats(path: string): Promise<StorageStats> {
    return this.provider.getStats({ path });
  }

  async listFolder(
    path: string,
    recursive: boolean = false,
  ): Promise<{ files: StorageFile[]; folders: StorageFolder[] }> {
    return this.provider.list({ path, recursive });
  }

  async calculateChecksum(path: string, algorithm?: string): Promise<string> {
    return this.provider.getChecksum({
      path,
      algorithm: (algorithm || "md5") as any,
    });
  }

  async verifyChecksum(
    path: string,
    expectedChecksum: string,
    algorithm?: string,
  ): Promise<boolean> {
    return this.provider.verifyChecksum({ path, expectedChecksum, algorithm });
  }
}

export const filesystemScannerService = new FilesystemScannerService();
