import { Types } from "mongoose";
import { editorialCommentRepository } from "../repositories/EditorialCommentRepository";
import { ApiError } from "../middleware/errorHandler";

export class CommentService {
  async createComment(articleId: string, userId: string, body: string) {
    return editorialCommentRepository.create({
      article: new Types.ObjectId(articleId),
      author: new Types.ObjectId(userId),
      body,
    } as any);
  }

  async moderateComment(
    commentId: string,
    status: "approved" | "rejected" | "spam",
    moderatorId: string,
    moderationNotes?: string,
  ) {
    const updated = await editorialCommentRepository.updateById(commentId, {
      status,
      moderatedBy: new Types.ObjectId(moderatorId),
      moderatedAt: new Date(),
      moderationNotes,
    } as any);
    if (!updated) throw new ApiError(404, "Comment not found");
    return updated;
  }

  async pinComment(commentId: string, pinned = true) {
    const updated = await editorialCommentRepository.updateById(commentId, {
      isPinned: pinned,
    } as any);
    if (!updated) throw new ApiError(404, "Comment not found");
    return updated;
  }

  async listByArticle(articleId: string) {
    return editorialCommentRepository.findByArticle(
      new Types.ObjectId(articleId),
    );
  }
  async listPending() {
    return editorialCommentRepository.findPending();
  }
}

export const commentService = new CommentService();
