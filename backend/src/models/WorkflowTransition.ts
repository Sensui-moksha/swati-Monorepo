import mongoose, { Schema, Document, Types } from "mongoose";

export type WorkflowStage =
  | "draft"
  | "assigned"
  | "editor_review"
  | "senior_editor_review"
  | "chief_editor_review"
  | "legal_review"
  | "scheduled"
  | "published"
  | "archived"
  | "rejected"
  | "pending_review";

export type WorkflowAction =
  | "submit"
  | "assign"
  | "approve"
  | "reject"
  | "request_changes"
  | "schedule"
  | "publish"
  | "rollback"
  | "archive";

export interface IWorkflowTransition extends Document {
  articleId: Types.ObjectId;
  fromStage: WorkflowStage;
  toStage: WorkflowStage;
  action: WorkflowAction;
  actorId: Types.ObjectId;
  assigneeId?: Types.ObjectId;
  comments?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const WorkflowTransitionSchema = new Schema<IWorkflowTransition>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true, index: true },
    fromStage: { type: String, required: true },
    toStage: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: [
        "submit",
        "assign",
        "approve",
        "reject",
        "request_changes",
        "schedule",
        "publish",
        "rollback",
        "archive",
      ],
    },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
    comments: { type: String, trim: true, maxlength: 2000 },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

WorkflowTransitionSchema.index({ articleId: 1, createdAt: -1 });

export const WorkflowTransition = mongoose.model<IWorkflowTransition>(
  "WorkflowTransition",
  WorkflowTransitionSchema
);
