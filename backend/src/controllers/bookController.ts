import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { bookService } from "../services/bookService";

export class BookController {
  async createBook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const book = await bookService.createBook(req.body, req.user?.id);
      res.status(201).json({ success: true, data: book });
    } catch (error) {
      next(error);
    }
  }

  async getBook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const book = await bookService.getBookById(req.params.id!);
      res.json({ success: true, data: book });
    } catch (error) {
      next(error);
    }
  }

  async getBookBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const book = await bookService.getBookBySlug(req.params.slug!);
      res.json({ success: true, data: book });
    } catch (error) {
      next(error);
    }
  }

  async listBooks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await bookService.listBooks(req.query as any, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        sort: req.query.sort as any,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateBook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const book = await bookService.updateBook(req.params.id!, req.body);
      res.json({ success: true, data: book });
    } catch (error) {
      next(error);
    }
  }

  async deleteBook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await bookService.deleteBook(req.params.id!);
      res.json({ success: true, message: "Book deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async restoreBook(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const book = await bookService.restoreBook(req.params.id!);
      res.json({ success: true, data: book });
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedBooks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const books = await bookService.getFeaturedBooks(
        Number(req.query.limit) || 8,
      );
      res.json({ success: true, data: books });
    } catch (error) {
      next(error);
    }
  }

  async getTrendingBooks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const books = await bookService.getTrendingBooks(
        Number(req.query.limit) || 8,
      );
      res.json({ success: true, data: books });
    } catch (error) {
      next(error);
    }
  }

  async getNewReleases(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const books = await bookService.getNewReleases(
        Number(req.query.limit) || 8,
      );
      res.json({ success: true, data: books });
    } catch (error) {
      next(error);
    }
  }

  async getPopularBooks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const books = await bookService.getPopularBooks(
        Number(req.query.limit) || 8,
      );
      res.json({ success: true, data: books });
    } catch (error) {
      next(error);
    }
  }

  async getBooksByCategory(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const books = await bookService.getBooksByCategory(
        req.params.categoryId!,
        Number(req.query.limit) || 8,
      );
      res.json({ success: true, data: books });
    } catch (error) {
      next(error);
    }
  }

  async getBooksByGenre(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const books = await bookService.getBooksByGenre(
        req.params.genreId!,
        Number(req.query.limit) || 8,
      );
      res.json({ success: true, data: books });
    } catch (error) {
      next(error);
    }
  }

  async getBooksByAuthor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const books = await bookService.getBooksByAuthor(
        req.params.authorId!,
        Number(req.query.limit) || 8,
      );
      res.json({ success: true, data: books });
    } catch (error) {
      next(error);
    }
  }

  async getBooksByPublisher(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const books = await bookService.getBooksByPublisher(
        req.params.publisherId!,
        Number(req.query.limit) || 8,
      );
      res.json({ success: true, data: books });
    } catch (error) {
      next(error);
    }
  }

  async getRelatedBooks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const books = await bookService.getRelatedBooks(
        req.params.bookId!,
        req.query.categoryId as string,
        Number(req.query.limit) || 6,
      );
      res.json({ success: true, data: books });
    } catch (error) {
      next(error);
    }
  }
}

export const bookController = new BookController();
