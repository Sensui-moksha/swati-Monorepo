import { Response, NextFunction } from "express";
import { noteService } from "../services/NoteService";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { Types } from "mongoose";

export class NoteController {
  async createNote(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const note = await noteService.createNote(userId, req.body);
      res.status(201).json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  }

  async getNotes(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { resourceId, tag, search, page = 1, limit = 20 } = req.query;

      let result;
      if (resourceId && typeof resourceId === "string") {
        result = await noteService.getNotesByResource(
          userId,
          new Types.ObjectId(resourceId),
          Number(page),
          Number(limit),
        );
      } else if (tag && typeof tag === "string") {
        result = await noteService.getNotesByTag(
          userId,
          tag,
          Number(page),
          Number(limit),
        );
      } else if (search && typeof search === "string") {
        result = await noteService.searchNotes(
          userId,
          search,
          Number(page),
          Number(limit),
        );
      } else {
        result = await noteService.getNotes(
          userId,
          Number(page),
          Number(limit),
        );
      }

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getPinnedNotes(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const data = await noteService.getPinnedNotes(userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getNote(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { noteId } = req.params;

      if (!noteId) {
        throw new ApiError(400, "noteId is required");
      }

      const note = await noteService.getNote(
        new Types.ObjectId(noteId),
        userId,
      );
      res.json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  }

  async updateNote(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { noteId } = req.params;

      if (!noteId) {
        throw new ApiError(400, "noteId is required");
      }

      const note = await noteService.updateNote(
        new Types.ObjectId(noteId),
        userId,
        req.body,
      );
      res.json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  }

  async deleteNote(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { noteId } = req.params;

      if (!noteId) {
        throw new ApiError(400, "noteId is required");
      }

      await noteService.deleteNote(new Types.ObjectId(noteId), userId);
      res.json({ success: true, message: "Note deleted" });
    } catch (error) {
      next(error);
    }
  }

  async togglePin(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { noteId } = req.params;
      const { isPinned } = req.body;

      if (!noteId) {
        throw new ApiError(400, "noteId is required");
      }

      const note = await noteService.togglePin(
        new Types.ObjectId(noteId),
        userId,
        isPinned,
      );
      res.json({ success: true, data: note });
    } catch (error) {
      next(error);
    }
  }

  async getAllTags(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const tags = await noteService.getAllTags(userId);
      res.json({ success: true, data: { tags } });
    } catch (error) {
      next(error);
    }
  }

  async getNoteCount(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const count = await noteService.getNoteCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }
}

export const noteController = new NoteController();
