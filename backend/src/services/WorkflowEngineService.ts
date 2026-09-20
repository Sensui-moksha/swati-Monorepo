import mongoose from "mongoose";
import { Article, IArticle, ArticleStatus } from "../models/Article";
import { WorkflowTransition, WorkflowStage, WorkflowAction } from "../models/WorkflowTransition";
import { notificationService } from "./NotificationService";
import { ApiError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

// Allowed transition map: key is current stage, value is set of reachable next stages
const VALID_TRANSITIONS: Record<WorkflowStage, WorkflowStage[]> = {
  draft: ["assigned", "editor_review", "pending_review"],
  assigned: ["editor_review", "draft"],
  pending_review: ["editor_review", "senior_editor_review", "draft"],
  editor_review: ["senior_editor_review", "chief_editor_review", "draft", "rejected"],
  senior_editor_review: ["chief_editor_review", "editor_review", "draft", "rejected"],
  chief_editor_review: ["legal_review", "scheduled", "published", "senior_editor_review", "draft"],
  legal_review: ["scheduled", "published", "chief_editor_review", "draft", "rejected"],
  scheduled: ["published", "chief_editor_review", "draft"],
  published: ["archived", "draft"],
  archived: ["draft"],
  rejected: ["draft"],
};

export class WorkflowEngineService {
  /**
   * Advances an article through the editorial approval pipeline.
   */
  async transition(
    articleId: string,
    action: WorkflowAction,
    targetStage: WorkflowStage,
    actor: { id: string; role?: string; name?: string },
    options: {
      assigneeId?: string;
      comments?: string;
      scheduledAt?: Date;
    } = {}
  ): Promise<IArticle> {
    const article = await Article.findById(articleId);
    if (!article) throw new ApiError(404, "Article not found");

    const currentStage = (article.status as WorkflowStage) || "draft";

    // Validate transition
    const allowed = VALID_TRANSITIONS[currentStage];
    if (!allowed || !allowed.includes(targetStage)) {
      throw new ApiError(
        400,
        `Invalid workflow transition from "${currentStage}" to "${targetStage}" via action "${action}"`
      );
    }

    // Role verification guards
    this.assertRoleCanExecute(action, currentStage, targetStage, actor.role);

    // Apply updates to article
    article.status = targetStage as ArticleStatus;
    if (options.assigneeId) {
      article.assignedEditor = new mongoose.Types.ObjectId(options.assigneeId) as any;
    }
    if (targetStage === "published") {
      article.publishedAt = new Date();
      article.publishedBy = new mongoose.Types.ObjectId(actor.id) as any;
    }
    if (targetStage === "scheduled" && options.scheduledAt) {
      article.scheduledAt = options.scheduledAt;
    }
    if (action === "reject") {
      article.rejectedAt = new Date();
      article.rejectionReason = options.comments;
    }

    article.updatedBy = new mongoose.Types.ObjectId(actor.id) as any;
    await article.save();

    // Record immutable audit transition
    await WorkflowTransition.create({
      articleId: article._id,
      fromStage: currentStage,
      toStage: targetStage,
      action,
      actorId: new mongoose.Types.ObjectId(actor.id),
      assigneeId: options.assigneeId ? new mongoose.Types.ObjectId(options.assigneeId) : undefined,
      comments: options.comments,
      metadata: { actorRole: actor.role, scheduledAt: options.scheduledAt },
    });

    // Notify relevant parties
    this.notifyTransition(article, currentStage, targetStage, actor, options.comments);

    return article;
  }

  /**
   * Rolls back an article to a previous stage in its workflow history.
   */
  async rollback(
    articleId: string,
    targetStage: WorkflowStage,
    actor: { id: string; role?: string; name?: string },
    comments: string
  ): Promise<IArticle> {
    if (!comments) throw new ApiError(400, "Reason / comments required for rollback");

    return this.transition(articleId, "rollback", targetStage, actor, { comments });
  }

  /**
   * Retrieves complete approval history and remarks for an article.
   */
  async getTransitionHistory(articleId: string) {
    return WorkflowTransition.find({
      articleId: new mongoose.Types.ObjectId(articleId),
    })
      .populate("actorId", "fullName username email avatar role")
      .populate("assigneeId", "fullName username email avatar role")
      .sort({ createdAt: -1 })
      .lean();
  }

  private assertRoleCanExecute(
    _action: WorkflowAction,
    _currentStage: WorkflowStage,
    targetStage: WorkflowStage,
    role?: string
  ) {
    const userRole = (role || "").toLowerCase();
    const isSuperAdmin = userRole === "admin" || userRole === "superadmin";
    if (isSuperAdmin) return;

    if (targetStage === "chief_editor_review" && !["senior_editor", "chief_editor", "editor"].includes(userRole)) {
      throw new ApiError(403, "Only senior editors or chief editors can approve to Chief Editor Review");
    }

    if (targetStage === "legal_review" && !["chief_editor"].includes(userRole)) {
      throw new ApiError(403, "Only Chief Editor can escalate to Legal Review");
    }

    if ((targetStage === "published" || targetStage === "scheduled") && !["chief_editor", "legal_reviewer"].includes(userRole)) {
      throw new ApiError(403, "Only Chief Editor or Legal Reviewer can authorize publishing or scheduling");
    }
  }

  private async notifyTransition(
    article: IArticle,
    fromStage: WorkflowStage,
    toStage: WorkflowStage,
    actor: { id: string; name?: string },
    comments?: string
  ) {
    try {
      const recipientId = article.author ? article.author.toString() : null;
      if (recipientId && recipientId !== actor.id && mongoose.Types.ObjectId.isValid(recipientId)) {
        await notificationService.createNotification(
          new mongoose.Types.ObjectId(recipientId),
          {
            title: `Article moved to ${toStage.replace(/_/g, " ").toUpperCase()}`,
            message: `Article "${article.title}" transitioned from ${fromStage} to ${toStage}. ${comments ? `Note: ${comments}` : ""}`,
            type: "system",
            actionUrl: `/admin/articles`,
          }
        );
      }
    } catch (e) {
      logger.warn("Failed to dispatch workflow transition notification:", e);
    }
  }
}

export const workflowEngineService = new WorkflowEngineService();
