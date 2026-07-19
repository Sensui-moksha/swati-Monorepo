import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { tagService } from "../services/tagService";

function requireParam(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export class TagController {
  async createTag(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res
        .status(201)
        .json({ success: true, data: await tagService.createTag(req.body) });
    } catch (error) {
      next(error);
    }
  }
  async updateTag(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await tagService.updateTag(
          requireParam(req.params.id, "id"),
          req.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteTag(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await tagService.deleteTag(requireParam(req.params.id, "id"));
      res.json({ success: true, message: "Tag deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
  async mergeTags(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await tagService.mergeTags(
          req.body.sourceTagId,
          req.body.targetTagId,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async listTags(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await tagService.listTags(
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async popularTags(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await tagService.popularTags(Number(req.query.limit) || 20),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const tagController = new TagController();
