import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface ISeries extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  publisher?: Types.ObjectId;
  isActive: boolean;
  sortOrder: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISeriesModel extends Model<ISeries> {
  findBySlug(slug: string): Promise<ISeries | null>;
  findActive(): Promise<ISeries[]>;
}

const seriesSchema = new Schema<ISeries, ISeriesModel>(
  {
    name: {
      type: String,
      required: [true, "Series name is required"],
      trim: true,
      maxlength: [200, "Series name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    publisher: {
      type: Schema.Types.ObjectId,
      ref: "Publisher",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

seriesSchema.index({ isActive: 1, sortOrder: 1 });
seriesSchema.index({ publisher: 1 });

seriesSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

seriesSchema.statics.findBySlug = function (
  slug: string,
): Promise<ISeries | null> {
  return this.findOne({ slug, isDeleted: false }).exec();
};

seriesSchema.statics.findActive = function (): Promise<ISeries[]> {
  return this.find({ isActive: true, isDeleted: false }).sort({
    sortOrder: 1,
    name: 1,
  });
};

export const Series = mongoose.model<ISeries, ISeriesModel>(
  "Series",
  seriesSchema,
);
