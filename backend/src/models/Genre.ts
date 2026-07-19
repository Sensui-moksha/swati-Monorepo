import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IGenre extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGenreModel extends Model<IGenre> {
  findBySlug(slug: string): Promise<IGenre | null>;
  findActive(): Promise<IGenre[]>;
}

const genreSchema = new Schema<IGenre, IGenreModel>(
  {
    name: {
      type: String,
      required: [true, "Genre name is required"],
      trim: true,
      maxlength: [100, "Genre name cannot exceed 100 characters"],
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

genreSchema.index({ isActive: 1, sortOrder: 1 });

genreSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

genreSchema.statics.findBySlug = function (
  slug: string,
): Promise<IGenre | null> {
  return this.findOne({ slug, isDeleted: false }).exec();
};

genreSchema.statics.findActive = function (): Promise<IGenre[]> {
  return this.find({ isActive: true, isDeleted: false }).sort({
    sortOrder: 1,
    name: 1,
  });
};

export const Genre = mongoose.model<IGenre, IGenreModel>("Genre", genreSchema);
