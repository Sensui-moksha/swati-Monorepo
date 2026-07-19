import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type EditorialCommentStatus =
  "pending" | "approved" | "rejected" | "spam";

export interface IEditorialComment extends Document {
  article: Types.ObjectId;
  author: Types.ObjectId;
  body: string;
  status: EditorialCommentStatus;
  isPinned: boolean;
  moderationNotes?: string;
  moderatedBy?: Types.ObjectId;
  moderatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEditorialCommentModel extends Model<IEditorialComment> {
  findByArticle(articleId: Types.ObjectId): Promise<IEditorialComment[]>;
  findPending(): Promise<IEditorialComment[]>;
}

const editorialCommentSchema = new Schema<
  IEditorialComment,
  IEditorialCommentModel
>(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "spam"],
      default: "pending",
      index: true,
    },
    isPinned: { type: Boolean, default: false },
    moderationNotes: { type: String, trim: true, maxlength: 1000 },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderatedAt: { type: Date },
  },
  { timestamps: true },
);

editorialCommentSchema.index({ article: 1, status: 1, createdAt: -1 });

editorialCommentSchema.statics.findByArticle = function (
  articleId: Types.ObjectId,
): Promise<IEditorialComment[]> {
  return this.find({ article: articleId }).sort({ createdAt: -1 }).exec();
};

editorialCommentSchema.statics.findPending = function (): Promise<
  IEditorialComment[]
> {
  return this.find({ status: "pending" }).sort({ createdAt: -1 }).exec();
};

export const EditorialComment = mongoose.model<
  IEditorialComment,
  IEditorialCommentModel
>("EditorialComment", editorialCommentSchema);
