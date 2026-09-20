import { Types } from "mongoose";

// Mock SpellCheckService to avoid ESM afinn-165 issue in Jest
jest.mock("../../services/nlp/SpellCheckService", () => ({
  spellCheckService: {
    checkOcr: jest.fn().mockReturnValue([
      { original: "swath1", suggestion: "swathi", distance: 90 },
    ]),
  },
}));

import { ocrReviewService } from "../../services/nlp/OCRReviewService";
import { OCRReviewTask } from "../../models/OCRReviewTask";

describe("E2E Journey 5: Human-in-the-Loop OCR Quality Control & Review Workbench", () => {
  const documentId = new Types.ObjectId().toString();
  const reviewerId = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should ingest an OCR scan, tokenize words, and identify errors", async () => {
    const scannedText = "swathi publication platform magazine technology";

    const mockSavedTask = {
      _id: new Types.ObjectId(),
      documentId: new Types.ObjectId(documentId),
      pageNumber: 1,
      documentType: "MagazineIssue",
      confidenceScore: 0.98,
      extractedText: scannedText,
      tokens: [
        { word: "swathi", confidence: 0.98, isCorrected: false },
        { word: "publication", confidence: 0.98, isCorrected: false },
      ],
      status: "approved",
    };

    jest.spyOn(OCRReviewTask, "findOneAndUpdate").mockResolvedValue(mockSavedTask as any);

    const task = await ocrReviewService.createTask({
      documentId,
      documentType: "MagazineIssue",
      pageNumber: 1,
      extractedText: scannedText,
    });

    expect(task.documentId.toString()).toBe(documentId);
    expect(task.pageNumber).toBe(1);
    expect(task.status).toBe("approved");
  });

  it("should apply human corrections to specific tokens and reassemble correctedText", async () => {
    const taskId = new Types.ObjectId().toString();

    const mockTaskDoc = {
      _id: taskId,
      tokens: [
        { word: "swath1", confidence: 0.7, isCorrected: false, correctedWord: undefined },
        { word: "magaz1ne", confidence: 0.7, isCorrected: false, correctedWord: undefined },
      ],
      correctedText: undefined as string | undefined,
      status: "pending",
      reviewedBy: undefined as any,
      reviewedAt: undefined as any,
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(OCRReviewTask, "findById").mockResolvedValue(mockTaskDoc as any);

    await ocrReviewService.applyCorrection({
      taskId,
      reviewerId,
      corrections: [
        { tokenIndex: 0, correctedWord: "swathi" },
        { tokenIndex: 1, correctedWord: "magazine" },
      ],
      status: "approved",
      notes: "Fixed OCR optical noise",
    });

    expect(mockTaskDoc.tokens[0].correctedWord).toBe("swathi");
    expect(mockTaskDoc.tokens[0].isCorrected).toBe(true);
    expect(mockTaskDoc.tokens[1].correctedWord).toBe("magazine");
    expect(mockTaskDoc.correctedText).toBe("swathi magazine");
    expect(mockTaskDoc.status).toBe("approved");
    expect(mockTaskDoc.save).toHaveBeenCalled();
  });

  it("should bulk approve high-confidence pages", async () => {
    const taskIds = [new Types.ObjectId().toString(), new Types.ObjectId().toString()];

    jest.spyOn(OCRReviewTask, "updateMany").mockResolvedValue({
      modifiedCount: 2,
    } as any);

    const result = await ocrReviewService.bulkApprove(taskIds, reviewerId);
    expect(result.approvedCount).toBe(2);
  });
});