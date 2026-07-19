import mongoose, { Document, Schema, Model } from "mongoose";

export type MediaType = "image" | "video" | "audio" | "document";

export interface IMedia extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  type: MediaType;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  alt?: string;
  caption?: string;
  uploadedBy: mongoose.Types.ObjectId;
  folder?: string;
  tags: string[];
  metadata: Record<string, any>;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMediaModel extends Model<IMedia> {
  findByType(type: MediaType): Promise<IMedia[]>;
  findByUploader(userId: mongoose.Types.ObjectId): Promise<IMedia[]>;
  findPublic(): Promise<IMedia[]>;
  findByFolder(folder: string): Promise<IMedia[]>;
}

const mediaSchema = new Schema<IMedia, IMediaModel>(
  {
    filename: {
      type: String,
      required: [true, "Filename is required"],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, "Original name is required"],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "audio", "document"],
      required: [true, "Media type is required"],
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
      min: [0, "File size cannot be negative"],
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
      match: [/^https?:\/\/.+/, "URL must be a valid HTTP/HTTPS URL"],
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Thumbnail URL must be a valid HTTP/HTTPS URL"],
    },
    width: {
      type: Number,
      min: [0, "Width cannot be negative"],
    },
    height: {
      type: Number,
      min: [0, "Height cannot be negative"],
    },
    duration: {
      type: Number,
      min: [0, "Duration cannot be negative"],
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [255, "Alt text cannot exceed 255 characters"],
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [500, "Caption cannot exceed 500 characters"],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader is required"],
    },
    folder: {
      type: String,
      trim: true,
      default: "uploads",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
mediaSchema.index({ uploadedBy: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ folder: 1 });
mediaSchema.index({ isPublic: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ createdAt: -1 });

// Virtual for uploader (populated)
mediaSchema.virtual("uploader", {
  ref: "User",
  localField: "uploadedBy",
  foreignField: "_id",
  justOne: true,
});

// Static method to find by type
mediaSchema.statics.findByType = function (type: MediaType): Promise<IMedia[]> {
  return this.find({ type }).sort({ createdAt: -1 });
};

// Static method to find by uploader
mediaSchema.statics.findByUploader = function (
  userId: mongoose.Types.ObjectId,
): Promise<IMedia[]> {
  return this.find({ uploadedBy: userId }).sort({ createdAt: -1 });
};

// Static method to find public media
mediaSchema.statics.findPublic = function (): Promise<IMedia[]> {
  return this.find({ isPublic: true }).sort({ createdAt: -1 });
};

// Static method to find by folder
mediaSchema.statics.findByFolder = function (
  folder: string,
): Promise<IMedia[]> {
  return this.find({ folder }).sort({ createdAt: -1 });
};

export const Media = mongoose.model<IMedia, IMediaModel>("Media", mediaSchema);
