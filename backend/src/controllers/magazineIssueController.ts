import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { magazineIssueService } from "../services/magazineIssueService";

export class MagazineIssueController {
  async createIssue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await magazineIssueService.createIssue(
        req.body,
        req.user?.id,
      );
      res.status(201).json({ success: true, data: issue });
    } catch (error) {
      next(error);
    }
  }

  async getIssue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await magazineIssueService.getIssueById(req.params.id!);
      res.json({ success: true, data: issue });
    } catch (error) {
      next(error);
    }
  }

  async getIssueBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await magazineIssueService.getIssueBySlug(req.params.slug!);
      res.json({ success: true, data: issue });
    } catch (error) {
      next(error);
    }
  }

  async listIssues(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await magazineIssueService.listIssues(req.query as any, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        sort: req.query.sort as any,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateIssue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await magazineIssueService.updateIssue(
        req.params.id!,
        req.body,
      );
      res.json({ success: true, data: issue });
    } catch (error) {
      next(error);
    }
  }

  async deleteIssue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await magazineIssueService.deleteIssue(req.params.id!);
      res.json({
        success: true,
        message: "Magazine issue deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreIssue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await magazineIssueService.restoreIssue(req.params.id!);
      res.json({ success: true, data: issue });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentIssues(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issues = await magazineIssueService.getCurrentIssues(
        Number(req.query.limit) || 6,
      );
      res.json({ success: true, data: issues });
    } catch (error) {
      next(error);
    }
  }

  async getArchivedIssues(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issues = await magazineIssueService.getArchivedIssues(
        Number(req.query.limit) || 12,
      );
      res.json({ success: true, data: issues });
    } catch (error) {
      next(error);
    }
  }
}

export const magazineIssueController = new MagazineIssueController();
