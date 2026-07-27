import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { mediaService } from "../services/mediaService";

function requireParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function requireUserId(req: AuthRequest): string {
  const userId = req.user?._id?.toString();
  if (!userId) {
    throw new Error("Authentication required");
  }

  return userId;
}

export class MediaController {
  async listMedia(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await mediaService.listMedia(
          req.query as any,
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async getMedia(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await mediaService.getMedia(requireParam(req.params.id, "id")),
      });
    } catch (error) {
      next(error);
    }
  }
  async getRecentUploads(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await mediaService.getRecent(Number(req.query.limit) || 10),
      });
    } catch (error) {
      next(error);
    }
  }
  async getFolders(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await mediaService.getByFolder(
          String(req.query.folder || "uploads"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async getStats(
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({ success: true, data: await mediaService.getStats() });
    } catch (error) {
      next(error);
    }
  }
  async getUsage(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await mediaService.getUsage(requireUserId(req)),
      });
    } catch (error) {
      next(error);
    }
  }
  async updateMedia(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await mediaService.updateMetadata(
          requireParam(req.params.id, "id"),
          req.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async replaceMedia(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await mediaService.replaceMedia(
          requireParam(req.params.id, "id"),
          req.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteMedia(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await mediaService.deleteMedia(requireParam(req.params.id, "id"));
      res.json({ success: true, message: "Media deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
  async previewMedia(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await mediaService.getMedia(requireParam(req.params.id, "id")),
      });
    } catch (error) {
      next(error);
    }
  }
  async uploadMedia(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const file = req.file;
      const userId = req.user?._id?.toString();
      const media = await mediaService.uploadMedia(file, userId, req.body);
      res.status(201).json({
        success: true,
        data: media,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const mediaController = new MediaController();
