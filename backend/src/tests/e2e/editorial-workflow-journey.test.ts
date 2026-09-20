import { workflowEngineService } from "../../services/WorkflowEngineService";
import { VersionControlService } from "../../services/VersionControlService";
import { Article } from "../../models/Article";
import { WorkflowTransition } from "../../models/WorkflowTransition";
import { Types } from "mongoose";

describe("E2E Journey 4: 8-Stage Editorial State Machine & Version Control Engine", () => {
  const authorId = new Types.ObjectId().toString();
  const editorId = new Types.ObjectId().toString();
  const articleId = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Editorial State Machine", () => {
    it("should allow a valid forward transition from draft to editor_review", async () => {
      const mockArticle = {
        _id: articleId,
        title: "Test Column",
        status: "draft",
        author: authorId,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Article, "findById").mockResolvedValue(mockArticle as any);
      jest.spyOn(WorkflowTransition, "create").mockResolvedValue({} as any);

      const updated = await workflowEngineService.transition(
        articleId,
        "submit_for_review",
        "editor_review",
        { id: authorId, role: "author", name: "Staff Writer" },
        { comments: "Article ready for editorial pass" }
      );

      expect(mockArticle.status).toBe("editor_review");
      expect(mockArticle.save).toHaveBeenCalled();
      expect(updated.status).toBe("editor_review");
    });

    it("should reject an invalid transition from draft directly to published", async () => {
      const mockArticle = {
        _id: articleId,
        title: "Test Column",
        status: "draft",
        author: authorId,
      };

      jest.spyOn(Article, "findById").mockResolvedValue(mockArticle as any);

      await expect(
        workflowEngineService.transition(
          articleId,
          "publish",
          "published",
          { id: authorId, role: "author" }
        )
      ).rejects.toThrow(/Invalid workflow transition/);
    });

    it("should enforce role authorization on privileged stages like legal_review", async () => {
      const mockArticle = {
        _id: articleId,
        title: "Test Column",
        status: "chief_editor_review",
        author: authorId,
      };

      jest.spyOn(Article, "findById").mockResolvedValue(mockArticle as any);

      // Standard editor role should not be allowed to transition to legal_review
      await expect(
        workflowEngineService.transition(
          articleId,
          "escalate_legal",
          "legal_review",
          { id: editorId, role: "editor" }
        )
      ).rejects.toThrow(/Only Chief Editor can escalate to Legal Review/);
    });
  });

  describe("Version Control & Diff Computation", () => {
    it("should accurately compute field-level delta diff between two snapshots", () => {
      const oldSnapshot = {
        title: "Original Title",
        content: "Draft content",
        tags: ["literature", "telugu"],
        status: "draft",
      };

      const newSnapshot = {
        title: "Revised Editorial Title",
        content: "Draft content", // unchanged
        tags: ["literature", "telugu", "spotlight"], // modified
        status: "editor_review", // modified
        newField: "editorial notes", // added
      };

      const diff = VersionControlService.computeDiff(oldSnapshot, newSnapshot);

      expect(diff.added).toHaveProperty("newField", "editorial notes");
      expect(diff.modified).toHaveProperty("title");
      expect(diff.modified?.title.from).toBe("Original Title");
      expect(diff.modified?.title.to).toBe("Revised Editorial Title");
      expect(diff.modified?.status.to).toBe("editor_review");
      expect(diff.deleted).toBeUndefined();
    });

    it("should detect deleted fields in delta diff", () => {
      const oldSnapshot = {
        title: "Title",
        temporaryNote: "delete me before publishing",
      };

      const newSnapshot = {
        title: "Title",
      };

      const diff = VersionControlService.computeDiff(oldSnapshot, newSnapshot);
      expect(diff.deleted).toContain("temporaryNote");
    });
  });
});
