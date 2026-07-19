import { Request, Response, NextFunction } from "express";
import { storageSyncService, SyncJob } from "../services/StorageSyncService";
import { ApiError } from "../middleware/errorHandler";

export class StorageSyncController {
  // Job management
  async createJob(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { type, paths } = req.body;

      if (!type) {
        throw new ApiError(400, "Job type is required");
      }

      const job = await storageSyncService.createJob(type, paths);
      res.status(201).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  async getJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      if (!jobId) throw new ApiError(400, "Job ID is required");
      const job = await storageSyncService.getJob(jobId);

      if (!job) {
        throw new ApiError(404, "Job not found");
      }

      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  async getAllJobs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { status } = req.query;
      let jobs;

      if (status) {
        jobs = await storageSyncService.getJobsByStatus(
          status as SyncJob["status"],
        );
      } else {
        jobs = await storageSyncService.getAllJobs();
      }

      res.json({ success: true, data: jobs });
    } catch (error) {
      next(error);
    }
  }

  async cancelJob(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { jobId } = req.params;
      if (!jobId) throw new ApiError(400, "Job ID is required");
      const cancelled = await storageSyncService.cancelJob(jobId);

      if (!cancelled) {
        throw new ApiError(400, "Job cannot be cancelled");
      }

      res.json({ success: true, message: "Job cancelled successfully" });
    } catch (error) {
      next(error);
    }
  }

  // Manual sync operations
  async runFullSync(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const job = await storageSyncService.runFullSync();
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  async runPartialSync(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { paths } = req.body;

      if (!paths || !Array.isArray(paths) || paths.length === 0) {
        throw new ApiError(400, "Paths array is required");
      }

      const job = await storageSyncService.runPartialSync(paths);
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  async runIncrementalSync(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const job = await storageSyncService.runIncrementalSync();
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  async runRepairSync(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const job = await storageSyncService.runRepairSync();
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  async runVerifySync(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const job = await storageSyncService.runVerifySync();
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  // Schedule management
  async createSchedule(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name, type, cronExpression, paths, enabled } = req.body;

      if (!name || !type || !cronExpression) {
        throw new ApiError(400, "Name, type, and cronExpression are required");
      }

      const schedule = await storageSyncService.createSchedule({
        name,
        type,
        cronExpression,
        paths,
        enabled: enabled ?? true,
      });

      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  }

  async getSchedule(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { scheduleId } = req.params;
      if (!scheduleId) throw new ApiError(400, "Schedule ID is required");
      const schedule = await storageSyncService.getSchedule(scheduleId);

      if (!schedule) {
        throw new ApiError(404, "Schedule not found");
      }

      res.json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  }

  async getAllSchedules(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const schedules = await storageSyncService.getAllSchedules();
      res.json({ success: true, data: schedules });
    } catch (error) {
      next(error);
    }
  }

  async updateSchedule(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { scheduleId } = req.params;
      if (!scheduleId) throw new ApiError(400, "Schedule ID is required");
      const updates = req.body;

      const schedule = await storageSyncService.updateSchedule(
        scheduleId,
        updates,
      );

      if (!schedule) {
        throw new ApiError(404, "Schedule not found");
      }

      res.json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  }

  async deleteSchedule(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { scheduleId } = req.params;
      if (!scheduleId) throw new ApiError(400, "Schedule ID is required");
      const deleted = await storageSyncService.deleteSchedule(scheduleId);

      if (!deleted) {
        throw new ApiError(404, "Schedule not found");
      }

      res.json({ success: true, message: "Schedule deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async enableSchedule(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { scheduleId } = req.params;
      if (!scheduleId) throw new ApiError(400, "Schedule ID is required");
      const schedule = await storageSyncService.enableSchedule(scheduleId);

      if (!schedule) {
        throw new ApiError(404, "Schedule not found");
      }

      res.json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  }

  async disableSchedule(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { scheduleId } = req.params;
      if (!scheduleId) throw new ApiError(400, "Schedule ID is required");
      const schedule = await storageSyncService.disableSchedule(scheduleId);

      if (!schedule) {
        throw new ApiError(404, "Schedule not found");
      }

      res.json({ success: true, data: schedule });
    } catch (error) {
      next(error);
    }
  }

  async runSchedule(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { scheduleId } = req.params;
      if (!scheduleId) throw new ApiError(400, "Schedule ID is required");
      const job = await storageSyncService.runSchedule(scheduleId);
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  // Status and monitoring
  async getStatus(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const status = storageSyncService.getStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }

  async cleanupOldJobs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { olderThanDays } = req.query;
      const deleted = await storageSyncService.cleanupOldJobs(
        parseInt(olderThanDays as string) || 30,
      );
      res.json({ success: true, data: { deleted } });
    } catch (error) {
      next(error);
    }
  }
}

export const storageSyncController = new StorageSyncController();
