import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type FavoriteType =
  "book" | "publication" | "magazine_issue" | "author" | "collection";

export interface IFavorite extends Document {
  user: Types.ObjectId;
  type: FavoriteType;
  resourceId: Types.ObjectId;
  resourceTitle: string;
  resourceImage?: string;
  addedAt: Date;
}

export interface IFavoriteModel extends Model<IFavorite> {
  findByUser(userId: Types.ObjectId): Promise<IFavorite[]>;
  findByUserAndType(
    userId: Types.ObjectId,
    type: FavoriteType,
  ): Promise<IFavorite[]>;
  findByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<IFavorite | null>;
  countByUser(userId: Types.ObjectId): Promise<number>;
}

const favoriteSchema = new Schema<IFavorite, IFavoriteModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["book", "publication", "magazine_issue", "author", "collection"],
      required: [true, "Favorite type is required"],
      index: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: [true, "Resource ID is required"],
      index: true,
    },
    resourceTitle: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    resourceImage: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Image must be a valid URL"],
    },
    addedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  },
);

// Compound index for uniqueness
favoriteSchema.index({ user: 1, resourceId: 1, type: 1 }, { unique: true });
favoriteSchema.index({ user: 1, type: 1, addedAt: -1 });

// Static methods
favoriteSchema.statics.findByUser = function (
  userId: Types.ObjectId,
): Promise<IFavorite[]> {
  return this.find({ user: userId }).sort({ addedAt: -1 }).exec();
};

favoriteSchema.statics.findByUserAndType = function (
  userId: Types.ObjectId,
  type: FavoriteType,
): Promise<IFavorite[]> {
  return this.find({ user: userId, type }).sort({ addedAt: -1 }).exec();
};

favoriteSchema.statics.findByUserAndResource = function (
  userId: Types.ObjectId,
  resourceId: Types.ObjectId,
): Promise<IFavorite | null> {
  return this.findOne({ user: userId, resourceId }).exec();
};

favoriteSchema.statics.countByUser = function (
  userId: Types.ObjectId,
): Promise<number> {
  return this.countDocuments({ user: userId });
};

export const Favorite = mongoose.model<IFavorite, IFavoriteModel>(
  "Favorite",
  favoriteSchema,
);
