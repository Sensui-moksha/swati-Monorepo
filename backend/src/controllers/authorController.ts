import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { authorService } from "../services/authorService";

export class AuthorController {
  async createAuthor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const author = await authorService.createAuthor(req.body, req.user?.id);
      res.status(201).json({ success: true, data: author });
    } catch (error) {
      next(error);
    }
  }

  async getAuthor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const author = await authorService.getAuthorById(req.params.id!);
      res.json({ success: true, data: author });
    } catch (error) {
      next(error);
    }
  }

  async getAuthorBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const author = await authorService.getAuthorBySlug(req.params.slug!);
      res.json({ success: true, data: author });
    } catch (error) {
      next(error);
    }
  }

  async listAuthors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authorService.listAuthors(req.query as any, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        sort: req.query.sort as any,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateAuthor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const author = await authorService.updateAuthor(req.params.id!, req.body);
      res.json({ success: true, data: author });
    } catch (error) {
      next(error);
    }
  }

  async deleteAuthor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authorService.deleteAuthor(req.params.id!);
      res.json({ success: true, message: "Author deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async restoreAuthor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const author = await authorService.restoreAuthor(req.params.id!);
      res.json({ success: true, data: author });
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedAuthors(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const authors = await authorService.getFeaturedAuthors(
        Number(req.query.limit) || 8,
      );
      res.json({ success: true, data: authors });
    } catch (error) {
      next(error);
    }
  }
}

export const authorController = new AuthorController();
