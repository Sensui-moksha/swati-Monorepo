import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { articleService } from "../services/articleService";
import { workflowEngineService } from "../services/WorkflowEngineService";

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

export class EditorialController {
  async createArticle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: await articleService.createArticle(req.body, requireUserId(req)),
      });
    } catch (error) {
      next(error);
    }
  }
  async updateArticle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.updateArticle(
          requireParam(req.params.id, "id"),
          req.body,
          requireUserId(req),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteArticle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await articleService.deleteArticle(requireParam(req.params.id, "id"));
      res.json({ success: true, message: "Article deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
  async restoreArticle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.restoreArticle(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async publishArticle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.publishArticle(
          requireParam(req.params.id, "id"),
          requireUserId(req),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async unpublishArticle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.unpublishArticle(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async scheduleArticle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.schedulePublication(
          requireParam(req.params.id, "id"),
          new Date(req.body.scheduledAt),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async archiveArticle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.archiveArticle(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async duplicateArticle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: await articleService.duplicateArticle(
          requireParam(req.params.id, "id"),
          requireUserId(req),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async previewArticle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.previewArticle(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async submitForReview(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.submitForReview(
          requireParam(req.params.id, "id"),
          requireUserId(req),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async approveArticle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.approveArticle(
          requireParam(req.params.id, "id"),
          requireUserId(req),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async rejectArticle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.rejectArticle(
          requireParam(req.params.id, "id"),
          requireUserId(req),
          req.body.reason || "Rejected",
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async requestChanges(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.requestChanges(
          requireParam(req.params.id, "id"),
          requireUserId(req),
          req.body.notes || "Changes requested",
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async createVersion(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const article = await articleService.getArticleById(
        requireParam(req.params.id, "id"),
      );
      await articleService.createVersion(article._id.toString(), article);
      res.status(201).json({ success: true, message: "Version saved" });
    } catch (error) {
      next(error);
    }
  }
  async getVersions(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.getVersions(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async restoreVersion(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.restoreVersion(
          requireParam(req.params.id, "id"),
          Number(req.params.version),
          requireUserId(req),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async compareVersions(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.compareVersions(
          requireParam(req.params.id, "id"),
          Number(req.query.fromVersion),
          Number(req.query.toVersion),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async listArticles(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.listArticles(
          req.query as any,
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async createNews(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.status(201).json({
        success: true,
        data: await articleService.createNews(req.body, requireUserId(req)),
      });
    } catch (error) {
      next(error);
    }
  }
  async updateNews(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.updateNews(
          requireParam(req.params.id, "id"),
          req.body,
          requireUserId(req),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async listNews(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.listNews(
          req.query as any,
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteNews(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await articleService.deleteArticle(requireParam(req.params.id, "id"));
      res.json({ success: true, message: "News deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
  async publishNews(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.publishArticle(
          requireParam(req.params.id, "id"),
          requireUserId(req),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async archiveNews(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.archiveArticle(
          requireParam(req.params.id, "id"),
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async latestArticles(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.getLatestArticles(
          Number(req.query.limit) || 10,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async featuredArticles(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.getFeaturedArticles(
          Number(req.query.limit) || 10,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async editorsPicks(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.getEditorsPicks(
          Number(req.query.limit) || 10,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async trendingArticles(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.getTrendingArticles(
          Number(req.query.limit) || 10,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async relatedArticles(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const categoryId =
        typeof req.query.categoryId === "string" ? req.query.categoryId : "";
      const tags =
        typeof req.query.tags === "string" ? req.query.tags.split(",") : [];
      res.json({
        success: true,
        data: await articleService.getRelatedArticles(
          requireParam(req.params.id, "id"),
          categoryId,
          tags,
          Number(req.query.limit) || 5,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async searchArticles(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.searchArticles(
          String(req.query.q || ""),
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        ),
      });
    } catch (error) {
      next(error);
    }
  }
  async searchNews(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.json({
        success: true,
        data: await articleService.searchNews(
          String(req.query.q || ""),
          Number(req.query.page) || 1,
          Number(req.query.limit) || 20,
        ),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Advance article through editorial workflow pipeline.
   */
  async transitionWorkflow(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const articleId = requireParam(req.params.id, "id");
      const userId = requireUserId(req);
      const { action, targetStage, assigneeId, comments, scheduledAt } = req.body;

      if (!action || !targetStage) {
        throw new Error("action and targetStage are required");
      }

      const updated = await workflowEngineService.transition(
        articleId,
        action,
        targetStage,
        { id: userId, role: (req.user as any)?.role, name: (req.user as any)?.fullName },
        {
          assigneeId,
          comments,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        }
      );

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rollback article to a previous workflow stage.
   */
  async rollbackWorkflow(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const articleId = requireParam(req.params.id, "id");
      const userId = requireUserId(req);
      const { targetStage, comments } = req.body;

      if (!targetStage || !comments) {
        throw new Error("targetStage and comments (reason) are required for rollback");
      }

      const updated = await workflowEngineService.rollback(
        articleId,
        targetStage,
        { id: userId, role: (req.user as any)?.role, name: (req.user as any)?.fullName },
        comments
      );

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get complete approval and transition history for an article.
   */
  async getWorkflowHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const articleId = requireParam(req.params.id, "id");
      const history = await workflowEngineService.getTransitionHistory(articleId);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }
}

export const editorialController = new EditorialController();
