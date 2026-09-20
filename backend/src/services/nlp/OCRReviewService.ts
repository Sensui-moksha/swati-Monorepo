import { Types } from "mongoose";
import {
  OCRReviewTask,
  IOCRReviewTask,
  IOCRToken,
  OCRTaskStatus,
} from "../../models/OCRReviewTask";
import { spellCheckService } from "./SpellCheckService";

export interface CreateOCRTaskInput {
  documentId: string | Types.ObjectId;
  documentType: "Book" | "Article" | "MagazineIssue";
  pageNumber: number;
  extractedText: string;
  tokens?: IOCRToken[];
}

export interface ApplyCorrectionInput {
  taskId: string;
  reviewerId: string;
  corrections: Array<{ tokenIndex: number; correctedWord: string }>;
  status?: OCRTaskStatus;
  notes?: string;
}

export class OCRReviewService {
  /**
   * Create or ingest an OCR review task for a page
   */
  public async createTask(input: CreateOCRTaskInput): Promise<IOCRReviewTask> {
    const documentId = new Types.ObjectId(input.documentId);
    let tokens = input.tokens;

    // Auto-generate tokens and spell-check suggestions if not provided
    if (!tokens || tokens.length === 0) {
      const suggestions = spellCheckService.checkOcr(input.extractedText);
      const suggestionMap = new Map<string, string>();
      for (const s of suggestions) {
        suggestionMap.set(s.original.toLowerCase(), s.suggestion);
      }

      const words = input.extractedText.split(/\s+/).filter(Boolean);
      tokens = words.map((word) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const suggestion = suggestionMap.get(cleanWord);
        const confidence = suggestion ? 0.72 : 0.98;

        return {
          word,
          confidence,
          suggestedCorrection: suggestion,
          isCorrected: false,
        };
      });
    }

    // Calculate aggregate confidence score
    const totalConfidence = tokens.reduce((acc, t) => acc + t.confidence, 0);
    const confidenceScore = tokens.length > 0 ? totalConfidence / tokens.length : 1.0;

    const task = await OCRReviewTask.findOneAndUpdate(
      {
        documentId,
        pageNumber: input.pageNumber,
        documentType: input.documentType,
      },
      {
        $set: {
          confidenceScore,
          extractedText: input.extractedText,
          tokens,
          status: confidenceScore >= 0.95 ? "approved" : "pending",
        },
      },
      { upsert: true, new: true }
    );

    return task;
  }

  /**
   * Fetch review queue sorted by lowest confidence (highest human attention need)
   */
  public async getReviewQueue(
    filter: {
      status?: OCRTaskStatus;
      documentId?: string;
      maxConfidence?: number;
    } = {},
    limit = 20,
    offset = 0
  ) {
    const query: any = {};
    if (filter.status) query.status = filter.status;
    if (filter.documentId) query.documentId = new Types.ObjectId(filter.documentId);
    if (filter.maxConfidence !== undefined) {
      query.confidenceScore = { $lte: filter.maxConfidence };
    }

    const [tasks, total] = await Promise.all([
      OCRReviewTask.find(query)
        .populate("assignedReviewer", "name email")
        .populate("reviewedBy", "name email")
        .sort({ confidenceScore: 1, createdAt: 1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      OCRReviewTask.countDocuments(query),
    ]);

    return { tasks, total, limit, offset };
  }

  /**
   * Apply human corrections to tokens and finalize review status
   */
  public async applyCorrection(input: ApplyCorrectionInput): Promise<IOCRReviewTask> {
    const task = await OCRReviewTask.findById(input.taskId);
    if (!task) {
      throw new Error(`OCR Task ${input.taskId} not found`);
    }

    for (const c of input.corrections) {
      const token = task.tokens[c.tokenIndex];
      if (token) {
        token.correctedWord = c.correctedWord;
        token.isCorrected = true;
      }
    }


    // Reconstruct corrected text from tokens
    task.correctedText = task.tokens
      .map((t) => (t.isCorrected && t.correctedWord ? t.correctedWord : t.word))
      .join(" ");

    task.status = input.status || "approved";
    task.reviewedBy = new Types.ObjectId(input.reviewerId);
    task.reviewedAt = new Date();
    if (input.notes) task.notes = input.notes;

    await task.save();
    return task;
  }

  /**
   * Bulk approve high-confidence OCR pages
   */
  public async bulkApprove(
    taskIds: string[],
    reviewerId: string
  ): Promise<{ approvedCount: number }> {
    const objectIds = taskIds.map((id) => new Types.ObjectId(id));
    const result = await OCRReviewTask.updateMany(
      { _id: { $in: objectIds } },
      {
        $set: {
          status: "approved",
          reviewedBy: new Types.ObjectId(reviewerId),
          reviewedAt: new Date(),
        },
      }
    );

    return { approvedCount: result.modifiedCount || 0 };
  }
}

export const ocrReviewService = new OCRReviewService();
