import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IArticleVersion extends Document {
  article: Types.ObjectId;
  version: number;
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  content: string;
  contentHtml?: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  canonicalUrl?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IArticleVersionModel extends Model<IArticleVersion> {
  findByArticle(articleId: Types.ObjectId): Promise<IArticleVersion[]>;
  findByArticleAndVersion(
    articleId: Types.ObjectId,
    version: number,
  ): Promise<IArticleVersion | null>;
}

const articleVersionSchema = new Schema<IArticleVersion, IArticleVersionModel>(
  {
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },
    version: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    subtitle: { type: String, trim: true },
    summary: { type: String, trim: true },
    content: { type: String, required: true },
    contentHtml: { type: String },
    excerpt: { type: String, trim: true },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords: [{ type: String, trim: true, lowercase: true }],
    canonicalUrl: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

articleVersionSchema.index({ article: 1, version: -1 }, { unique: true });

articleVersionSchema.statics.findByArticle = function (
  articleId: Types.ObjectId,
): Promise<IArticleVersion[]> {
  return this.find({ article: articleId }).sort({ version: -1 }).exec();
};

articleVersionSchema.statics.findByArticleAndVersion = function (
  articleId: Types.ObjectId,
  version: number,
): Promise<IArticleVersion | null> {
  return this.findOne({ article: articleId, version }).exec();
};

export const ArticleVersion = mongoose.model<
  IArticleVersion,
  IArticleVersionModel
>("ArticleVersion", articleVersionSchema);
