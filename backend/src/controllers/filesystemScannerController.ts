import { Request, Response, NextFunction } from "express";
import {
  filesystemScannerService,
  ScanJob,
  ScanOptions,
} from "../services/FilesystemScannerService";
import { ApiError } from "../middleware/errorHandler";

export class FilesystemScannerController {
  // Job management
  async createJob(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { type, paths, options } = req.body;

      if (!type) {
        throw new ApiError(400, "Job type is required");
      }

      const job = await filesystemScannerService.createJob(
        type,
        paths,
        options,
      );
      res.status(201).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  async getJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params as { jobId: string };
      const job = await filesystemScannerService.getJob(jobId);

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
        jobs = await filesystemScannerService.getJobsByStatus(
          status as ScanJob["status"],
        );
      } else {
        jobs = await filesystemScannerService.getAllJobs();
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
      const { jobId } = req.params as { jobId: string };
      const cancelled = await filesystemScannerService.cancelJob(jobId);

      if (!cancelled) {
        throw new ApiError(400, "Job cannot be cancelled");
      }

      res.json({ success: true, message: "Job cancelled successfully" });
    } catch (error) {
      next(error);
    }
  }

  // Manual scan operations
  async runFullScan(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const options: ScanOptions = req.body;
      const job = await filesystemScannerService.runFullScan(options);
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  async runIncrementalScan(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const options: ScanOptions = req.body;
      const job = await filesystemScannerService.runIncrementalScan(options);
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  async runTargetedScan(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { paths, options } = req.body;

      if (!paths || !Array.isArray(paths) || paths.length === 0) {
        throw new ApiError(400, "Paths array is required");
      }

      const job = await filesystemScannerService.runTargetedScan(
        paths,
        options,
      );
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  async runDeepScan(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const options: ScanOptions = req.body;
      const job = await filesystemScannerService.runDeepScan(options);
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
      const { name, type, cronExpression, paths, enabled, options } = req.body;

      if (!name || !type || !cronExpression) {
        throw new ApiError(400, "Name, type, and cronExpression are required");
      }

      const schedule = await filesystemScannerService.createSchedule({
        name,
        type,
        cronExpression,
        paths,
        enabled: enabled ?? true,
        options,
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
      const { scheduleId } = req.params as { scheduleId: string };
      const schedule = await filesystemScannerService.getSchedule(scheduleId);

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
      const schedules = await filesystemScannerService.getAllSchedules();
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
      const { scheduleId } = req.params as { scheduleId: string };
      const updates = req.body;

      const schedule = await filesystemScannerService.updateSchedule(
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
      const { scheduleId } = req.params as { scheduleId: string };
      const deleted = await filesystemScannerService.deleteSchedule(scheduleId);

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
      const { scheduleId } = req.params as { scheduleId: string };
      const schedule =
        await filesystemScannerService.enableSchedule(scheduleId);

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
      const { scheduleId } = req.params as { scheduleId: string };
      const schedule =
        await filesystemScannerService.disableSchedule(scheduleId);

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
      const { scheduleId } = req.params as { scheduleId: string };
      const job = await filesystemScannerService.runSchedule(scheduleId);
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
      const status = filesystemScannerService.getStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }

  async cleanupOldJobs(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { olderThanDays } = _req.query;
      const deleted = await filesystemScannerService.cleanupOldJobs(
        parseInt((olderThanDays as string) ?? "30") || 30,
      );
      res.json({ success: true, data: { deleted } });
    } catch (error) {
      next(error);
    }
  }

  // Utility methods
  async getFolderStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = req.params as { path: string };
      const stats = await filesystemScannerService.getFolderStats(path);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async listFolder(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = req.params as { path: string };
      const { recursive } = req.query;

      const result = await filesystemScannerService.listFolder(
        path,
        recursive === "true",
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async calculateChecksum(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = req.params as { path: string };
      const { algorithm } = req.query;

      const checksum = await filesystemScannerService.calculateChecksum(
        path,
        algorithm as string,
      );
      res.json({ success: true, data: { checksum } });
    } catch (error) {
      next(error);
    }
  }

  async verifyChecksum(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = req.params as { path: string };
      const { checksum, algorithm } = req.body;

      if (!checksum) {
        throw new ApiError(400, "Checksum is required");
      }

      const isValid = await filesystemScannerService.verifyChecksum(
        path,
        checksum,
        algorithm,
      );
      res.json({ success: true, data: { valid: isValid } });
    } catch (error) {
      next(error);
    }
  }
}

export const filesystemScannerController = new FilesystemScannerController();
