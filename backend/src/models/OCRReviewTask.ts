import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOCRToken {
  word: string;
  confidence: number;
  bbox?: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  suggestedCorrection?: string;
  isCorrected?: boolean;
  correctedWord?: string;
}

export type OCRTaskStatus = "pending" | "in_review" | "approved" | "rejected";

export interface IOCRReviewTask extends Document {
  documentId: Types.ObjectId;
  documentType: "Book" | "Article" | "MagazineIssue";
  pageNumber: number;
  status: OCRTaskStatus;
  confidenceScore: number;
  extractedText: string;
  correctedText?: string;
  tokens: IOCRToken[];
  assignedReviewer?: Types.ObjectId;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ocrTokenSchema = new Schema<IOCRToken>(
  {
    word: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    bbox: {
      x0: { type: Number },
      y0: { type: Number },
      x1: { type: Number },
      y1: { type: Number },
    },
    suggestedCorrection: { type: String },
    isCorrected: { type: Boolean, default: false },
    correctedWord: { type: String },
  },
  { _id: false }
);

const ocrReviewTaskSchema = new Schema<IOCRReviewTask>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: ["Book", "Article", "MagazineIssue"],
      index: true,
    },
    pageNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "in_review", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      index: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    correctedText: {
      type: String,
    },
    tokens: [ocrTokenSchema],
    assignedReviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

ocrReviewTaskSchema.index(
  { documentId: 1, pageNumber: 1, documentType: 1 },
  { unique: true }
);
ocrReviewTaskSchema.index({ status: 1, confidenceScore: 1 });

export const OCRReviewTask = mongoose.model<IOCRReviewTask>(
  "OCRReviewTask",
  ocrReviewTaskSchema
);
