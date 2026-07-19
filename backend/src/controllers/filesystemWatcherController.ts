import { Request, Response, NextFunction } from "express";
import {
  filesystemWatcherService,
  FileChangeEvent,
  WatcherConfig,
} from "../services/FilesystemWatcherService";
import { ApiError } from "../middleware/errorHandler";

export class FilesystemWatcherController {
  // Watcher management
  async getStatus(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const status = filesystemWatcherService.getStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }

  async startWatching(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = req.body;

      if (!path) {
        throw new ApiError(400, "Path is required");
      }

      await filesystemWatcherService.watchPath(path);
      res.json({ success: true, message: `Started watching ${path}` });
    } catch (error) {
      next(error);
    }
  }

  async stopWatching(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = req.params;
      await filesystemWatcherService.unwatchPath(path as string);
      res.json({ success: true, message: `Stopped watching ${path}` });
    } catch (error) {
      next(error);
    }
  }

  async updateConfig(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const config: Partial<WatcherConfig> = req.body;

      // Note: This would require restarting watchers with new config
      // For now, return current config
      const status = filesystemWatcherService.getStatus();
      res.json({ success: true, data: { config, status } });
    } catch (error) {
      next(error);
    }
  }

  // Event handling
  async getRecentEvents(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // This would typically come from an event store
      // For now, return empty array
      res.json({ success: true, data: [] });
    } catch (error) {
      next(error);
    }
  }

  async forceSync(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { path } = req.body;

      if (!path) {
        throw new ApiError(400, "Path is required");
      }

      await filesystemWatcherService.forceSync(path);
      res.json({ success: true, message: `Force sync initiated for ${path}` });
    } catch (error) {
      next(error);
    }
  }

  // WebSocket event stream (for real-time updates)
  async getEventStream(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Set up Server-Sent Events
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // Send initial connection message
      res.write(
        `data: ${JSON.stringify({ type: "connected", timestamp: new Date() })}\n\n`,
      );

      // Listen for events
      const handleEvent = (event: FileChangeEvent) => {
        res.write(
          `data: ${JSON.stringify({ type: "event", data: event })}\n\n`,
        );
      };

      const handleError = (error: {
        event: FileChangeEvent;
        error: string;
      }) => {
        res.write(
          `data: ${JSON.stringify({ type: "error", data: error })}\n\n`,
        );
      };

      filesystemWatcherService.on("event:processed", handleEvent);
      filesystemWatcherService.on("event:error", handleError);

      // Handle client disconnect
      req.on("close", () => {
        filesystemWatcherService.off("event:processed", handleEvent);
        filesystemWatcherService.off("event:error", handleError);
        res.end();
      });
    } catch (error) {
      next(error);
    }
  }
}

export const filesystemWatcherController = new FilesystemWatcherController();
