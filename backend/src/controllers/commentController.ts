import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { commentService } from "../services/commentService";

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

export class CommentController {
  async createComment(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: await commentService.createComment(
          requireParam(req.body.articleId, "articleId"),
          requireUserId(req),
          req.body.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async listByArticle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await commentService.listByArticle(
          requireParam(req.params.articleId, "articleId"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async listPending(
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({ success: true, data: await commentService.listPending() });
    } catch (error) {
      next(error);
    }
  }
  async moderate(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await commentService.moderateComment(
          requireParam(req.params.id, "id"),
          req.body.status,
          requireUserId(req),
          req.body.moderationNotes,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async pin(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await commentService.pinComment(
          requireParam(req.params.id, "id"),
          true,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async unpin(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await commentService.pinComment(
          requireParam(req.params.id, "id"),
          false,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
