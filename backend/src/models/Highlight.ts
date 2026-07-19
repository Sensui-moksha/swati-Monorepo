import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IHighlight extends Document {
  user: Types.ObjectId;
  resourceId: Types.ObjectId;
  resourceType: "book" | "publication" | "magazine_issue" | "article";
  resourceTitle: string;
  text: string;
  startOffset?: number;
  endOffset?: number;
  page?: number;
  location?: string;
  color: "yellow" | "green" | "blue" | "pink" | "orange";
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHighlightModel extends Model<IHighlight> {
  findByUser(userId: Types.ObjectId): Promise<IHighlight[]>;
  findByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<IHighlight[]>;
  findByUserAndColor(
    userId: Types.ObjectId,
    color: string,
  ): Promise<IHighlight[]>;
  getColorCount(userId: Types.ObjectId): Promise<Record<string, number>>;
}

const highlightSchema = new Schema<IHighlight, IHighlightModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: [true, "Resource ID is required"],
      index: true,
    },
    resourceType: {
      type: String,
      enum: ["book", "publication", "magazine_issue", "article"],
      required: [true, "Resource type is required"],
    },
    resourceTitle: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    text: {
      type: String,
      required: [true, "Highlighted text is required"],
      maxlength: [2000, "Text cannot exceed 2000 characters"],
    },
    startOffset: {
      type: Number,
      min: 0,
    },
    endOffset: {
      type: Number,
      min: 0,
    },
    page: {
      type: Number,
      min: 0,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    color: {
      type: String,
      enum: ["yellow", "green", "blue", "pink", "orange"],
      default: "yellow",
      required: [true, "Highlight color is required"],
      index: true,
    },
    note: {
      type: String,
      maxlength: [1000, "Note cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
highlightSchema.index({ user: 1, resourceId: 1 });
highlightSchema.index({ user: 1, color: 1, createdAt: -1 });
highlightSchema.index({ user: 1, createdAt: -1 });

// Static methods
highlightSchema.statics.findByUser = function (
  userId: Types.ObjectId,
): Promise<IHighlight[]> {
  return this.find({ user: userId }).sort({ createdAt: -1 }).exec();
};

highlightSchema.statics.findByUserAndResource = function (
  userId: Types.ObjectId,
  resourceId: Types.ObjectId,
): Promise<IHighlight[]> {
  return this.find({ user: userId, resourceId })
    .sort({ page: 1, startOffset: 1 })
    .exec();
};

highlightSchema.statics.findByUserAndColor = function (
  userId: Types.ObjectId,
  color: string,
): Promise<IHighlight[]> {
  return this.find({ user: userId, color }).sort({ createdAt: -1 }).exec();
};

highlightSchema.statics.getColorCount = async function (
  userId: Types.ObjectId,
): Promise<Record<string, number>> {
  const result = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$color", count: { $sum: 1 } } },
  ]);

  const counts: Record<string, number> = {};
  for (const item of result) {
    counts[item._id] = item.count;
  }
  return counts;
};

export const Highlight = mongoose.model<IHighlight, IHighlightModel>(
  "Highlight",
  highlightSchema,
);
