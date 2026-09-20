import { apiClient } from "../client";
import type { ApiResponse } from "../types";

export interface OCRToken {
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

export interface OCRReviewTaskItem {
  _id: string;
  documentId: string;
  documentType: "Book" | "Article" | "MagazineIssue";
  pageNumber: number;
  status: "pending" | "in_review" | "approved" | "rejected";
  confidenceScore: number;
  extractedText: string;
  correctedText?: string;
  tokens: OCRToken[];
  assignedReviewer?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OCRQueueResponse {
  tasks: OCRReviewTaskItem[];
  total: number;
  limit: number;
  offset: number;
}

export const ocrApi = {
  getQueue: (params?: {
    status?: string;
    documentId?: string;
    maxConfidence?: number;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.documentId) query.set("documentId", params.documentId);
    if (params?.maxConfidence !== undefined)
      query.set("maxConfidence", params.maxConfidence.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.offset) query.set("offset", params.offset.toString());

    return apiClient.get<ApiResponse<OCRQueueResponse>>(`/nlp/ocr/queue?${query.toString()}`);
  },

  createTask: (data: {
    documentId: string;
    documentType: "Book" | "Article" | "MagazineIssue";
    pageNumber: number;
    extractedText: string;
    tokens?: OCRToken[];
  }) => apiClient.post<ApiResponse<OCRReviewTaskItem>>("/nlp/ocr/tasks", data),

  applyCorrection: (
    taskId: string,
    data: {
      corrections: Array<{ tokenIndex: number; correctedWord: string }>;
      status?: "pending" | "in_review" | "approved" | "rejected";
      notes?: string;
    }
  ) => apiClient.post<ApiResponse<OCRReviewTaskItem>>(`/nlp/ocr/tasks/${taskId}/correct`, data),

  bulkApprove: (taskIds: string[]) =>
    apiClient.post<ApiResponse<{ approvedCount: number }>>("/nlp/ocr/bulk-approve", {
      taskIds,
    }),
};
