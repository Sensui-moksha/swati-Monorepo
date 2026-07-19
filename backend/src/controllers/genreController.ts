import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { genreService } from "../services/genreService";

export class GenreController {
  async createGenre(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const genre = await genreService.createGenre(req.body, req.user?.id);
      res.status(201).json({ success: true, data: genre });
    } catch (error) {
      next(error);
    }
  }

  async getGenre(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const genre = await genreService.getGenreById(req.params.id!);
      res.json({ success: true, data: genre });
    } catch (error) {
      next(error);
    }
  }

  async getGenreBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const genre = await genreService.getGenreBySlug(req.params.slug!);
      res.json({ success: true, data: genre });
    } catch (error) {
      next(error);
    }
  }

  async listGenres(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await genreService.listGenres(req.query as any, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        sort: req.query.sort as any,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateGenre(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const genre = await genreService.updateGenre(req.params.id!, req.body);
      res.json({ success: true, data: genre });
    } catch (error) {
      next(error);
    }
  }

  async deleteGenre(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await genreService.deleteGenre(req.params.id!);
      res.json({ success: true, message: "Genre deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async restoreGenre(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const genre = await genreService.restoreGenre(req.params.id!);
      res.json({ success: true, data: genre });
    } catch (error) {
      next(error);
    }
  }
}

export const genreController = new GenreController();
