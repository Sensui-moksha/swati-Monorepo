import { storageRepository } from "../repositories/StorageRepository";
import { StorageProvider, getStorageProvider } from "../providers/storage";
import { ApiError } from "../middleware/errorHandler";
import { storageService } from "./StorageService";

export interface SyncJob {
  id: string;
  type: "full" | "partial" | "incremental" | "repair" | "verify";
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
  };
  error?: string;
}

export interface SyncSchedule {
  id: string;
  name: string;
  type: "full" | "partial" | "incremental" | "repair" | "verify";
  cronExpression: string;
  paths?: string[];
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  failureCount: number;
}

export class StorageSyncService {
  private provider: StorageProvider;
  private jobs: Map<string, SyncJob> = new Map();
  private schedules: Map<string, SyncSchedule> = new Map();
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
    // Load schedules from database or config
    // For now, create default schedules
    this.createDefaultSchedules();
  }

  private createDefaultSchedules(): void {
    const defaultSchedules: SyncSchedule[] = [
      {
        id: "full-sync-daily",
        name: "Full Sync Daily",
        type: "full",
        cronExpression: "0 2 * * *", // 2 AM daily
        enabled: true,
        runCount: 0,
        failureCount: 0,
      },
      {
        id: "incremental-sync-hourly",
        name: "Incremental Sync Hourly",
        type: "incremental",
        cronExpression: "0 * * * *", // Every hour
        enabled: true,
        runCount: 0,
        failureCount: 0,
      },
      {
        id: "verify-checksums-weekly",
        name: "Verify Checksums Weekly",
        type: "verify",
        cronExpression: "0 3 * * 0", // 3 AM Sunday
        enabled: true,
        runCount: 0,
        failureCount: 0,
      },
      {
        id: "repair-metadata-daily",
        name: "Repair Metadata Daily",
        type: "repair",
        cronExpression: "0 4 * * *", // 4 AM daily
        enabled: true,
        runCount: 0,
        failureCount: 0,
      },
    ];

    for (const schedule of defaultSchedules) {
      this.schedules.set(schedule.id, schedule);
    }
  }

  async createJob(type: SyncJob["type"], paths?: string[]): Promise<SyncJob> {
    const jobId = `sync_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: SyncJob = {
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

  async getJob(jobId: string): Promise<SyncJob | null> {
    return this.jobs.get(jobId) || null;
  }

  async getAllJobs(): Promise<SyncJob[]> {
    return Array.from(this.jobs.values()).sort(
      (a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0),
    );
  }

  async getJobsByStatus(status: SyncJob["status"]): Promise<SyncJob[]> {
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

  async runFullSync(): Promise<SyncJob> {
    const job = await this.createJob("full");
    return this.executeJob(job);
  }

  async runPartialSync(paths: string[]): Promise<SyncJob> {
    const job = await this.createJob("partial", paths);
    return this.executeJob(job);
  }

  async runIncrementalSync(): Promise<SyncJob> {
    const job = await this.createJob("incremental");
    return this.executeJob(job);
  }

  async runRepairSync(): Promise<SyncJob> {
    const job = await this.createJob("repair");
    return this.executeJob(job);
  }

  async runVerifySync(): Promise<SyncJob> {
    const job = await this.createJob("verify");
    return this.executeJob(job);
  }

  private async executeJob(job: SyncJob): Promise<SyncJob> {
    if (this.isRunning) {
      throw new ApiError(409, "Another sync job is already running");
    }

    this.isRunning = true;
    this.currentJobId = job.id;
    job.status = "running";
    job.startedAt = new Date();

    try {
      let result;

      switch (job.type) {
        case "full":
          result = await this.executeFullSync(job);
          break;
        case "partial":
          result = await this.executePartialSync(job);
          break;
        case "incremental":
          result = await this.executeIncrementalSync(job);
          break;
        case "repair":
          result = await this.executeRepairSync(job);
          break;
        case "verify":
          result = await this.executeVerifySync(job);
          break;
        default:
          throw new Error(`Unknown sync type: ${job.type}`);
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

  private async executeFullSync(job: SyncJob): Promise<SyncJob["result"]> {
    const result = await storageService.fullReindex();
    job.progress.total = result.created + result.updated + result.errors.length;
    job.progress.created = result.created;
    job.progress.updated = result.updated;
    job.progress.errors = result.errors.length;
    return result;
  }

  private async executePartialSync(job: SyncJob): Promise<SyncJob["result"]> {
    if (!job.paths || job.paths.length === 0) {
      throw new Error("No paths specified for partial sync");
    }

    const result = await storageService.partialReindex(job.paths);
    job.progress.total = result.created + result.updated + result.errors.length;
    job.progress.created = result.created;
    job.progress.updated = result.updated;
    job.progress.errors = result.errors.length;
    return result;
  }

  private async executeIncrementalSync(
    job: SyncJob,
  ): Promise<SyncJob["result"]> {
    const olderThan = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    const unscannedFolders =
      await storageRepository.getUnscannedFolders(olderThan);

    job.progress.total = unscannedFolders.length;

    const result: SyncJob["result"] = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      duration: 0,
    };

    const startTime = Date.now();

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

  private async executeRepairSync(job: SyncJob): Promise<SyncJob["result"]> {
    const result = await storageService.repairMetadata();
    job.progress.total = result.created + result.updated + result.errors.length;
    job.progress.created = result.created;
    job.progress.updated = result.updated;
    job.progress.errors = result.errors.length;
    return result;
  }

  private async executeVerifySync(job: SyncJob): Promise<SyncJob["result"]> {
    const allPaths = await storageRepository.find({
      isDeleted: false,
      checksum: { $exists: true, $ne: null },
    });

    job.progress.total = allPaths.length;

    const result: SyncJob["result"] = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: [],
      duration: 0,
    };

    const startTime = Date.now();

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
          result.updated++;
        } else {
          await storageRepository.updateById(path._id, {
            status: "active",
            lastScanned: new Date(),
          });
          result.updated++;
        }

        job.progress.processed++;
        job.progress.updated = result.updated;
        job.progress.errors = result.errors.length;
      } catch (error) {
        result.errors.push({
          path: path.path,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        job.progress.errors++;
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  // Schedule management
  async createSchedule(
    schedule: Omit<SyncSchedule, "id" | "runCount" | "failureCount">,
  ): Promise<SyncSchedule> {
    const newSchedule: SyncSchedule = {
      ...schedule,
      id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      runCount: 0,
      failureCount: 0,
    };

    this.schedules.set(newSchedule.id, newSchedule);
    return newSchedule;
  }

  async getSchedule(scheduleId: string): Promise<SyncSchedule | null> {
    return this.schedules.get(scheduleId) || null;
  }

  async getAllSchedules(): Promise<SyncSchedule[]> {
    return Array.from(this.schedules.values());
  }

  async updateSchedule(
    scheduleId: string,
    updates: Partial<SyncSchedule>,
  ): Promise<SyncSchedule | null> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return null;

    const updated = { ...schedule, ...updates };
    this.schedules.set(scheduleId, updated);
    return updated;
  }

  async deleteSchedule(scheduleId: string): Promise<boolean> {
    return this.schedules.delete(scheduleId);
  }

  async enableSchedule(scheduleId: string): Promise<SyncSchedule | null> {
    return this.updateSchedule(scheduleId, { enabled: true });
  }

  async disableSchedule(scheduleId: string): Promise<SyncSchedule | null> {
    return this.updateSchedule(scheduleId, { enabled: false });
  }

  async runSchedule(scheduleId: string): Promise<SyncJob> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new ApiError(404, "Schedule not found");
    }

    let job: SyncJob;

    switch (schedule.type) {
      case "full":
        job = await this.runFullSync();
        break;
      case "partial":
        job = await this.runPartialSync(schedule.paths || []);
        break;
      case "incremental":
        job = await this.runIncrementalSync();
        break;
      case "repair":
        job = await this.runRepairSync();
        break;
      case "verify":
        job = await this.runVerifySync();
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
    currentJob: SyncJob | null;
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
}

export const storageSyncService = new StorageSyncService();
