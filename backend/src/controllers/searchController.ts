import { Response, NextFunction } from "express";
import { noteService } from "../services/NoteService";
import { highlightService } from "../services/HighlightService";
import { bookmarkService } from "../services/BookmarkService";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";

export class SearchController {
  async search(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { q, type = "all", page = 1, limit = 20 } = req.query;

      if (!q || typeof q !== "string") {
        throw new ApiError(400, "Search query is required");
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const result: any = {
        notes: [],
        highlights: [],
        bookmarks: [],
        favorites: [],
      };

      if (type === "all" || type === "notes") {
        const notesResult = await noteService.searchNotes(
          userId,
          q,
          pageNum,
          limitNum,
        );
        result.notes = notesResult.data || [];
      }

      if (type === "all" || type === "highlights") {
        const highlightsResult = await highlightService.searchHighlights(
          userId,
          q,
          pageNum,
          limitNum,
        );
        result.highlights = highlightsResult.data || [];
      }

      if (type === "all" || type === "bookmarks") {
        const bookmarksResult = await bookmarkService.searchBookmarks(
          userId,
          q,
          pageNum,
          limitNum,
        );
        result.bookmarks = bookmarksResult.data || [];
      }

      if (type === "all" || type === "favorites") {
        result.favorites = []; // Favorites don't have full-text search like notes/highlights
      }

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async advancedSearch(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { query, filters = {}, page = 1, limit = 20 } = req.body;

      if (!query) {
        throw new ApiError(400, "Search query is required");
      }

      const results: any = [];

      // Search in notes
      if (!filters.type || filters.type === "notes") {
        const notesResult = await noteService.searchNotes(
          userId,
          query,
          page,
          limit,
        );
        results.push(
          ...(notesResult.data || []).map((item) => ({
            ...item,
            documentType: "note",
          })),
        );
      }

      // Search in highlights
      if (!filters.type || filters.type === "highlights") {
        const highlightsResult = await highlightService.searchHighlights(
          userId,
          query,
          page,
          limit,
        );
        results.push(
          ...(highlightsResult.data || []).map((item) => ({
            ...item,
            documentType: "highlight",
          })),
        );
      }

      // Search in bookmarks
      if (!filters.type || filters.type === "bookmarks") {
        const bookmarksResult = await bookmarkService.searchBookmarks(
          userId,
          query,
          page,
          limit,
        );
        results.push(
          ...(bookmarksResult.data || []).map((item) => ({
            ...item,
            documentType: "bookmark",
          })),
        );
      }

      // Sort by date
      results.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      res.json({
        success: true,
        data: {
          results,
          total: results.length,
          page,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
