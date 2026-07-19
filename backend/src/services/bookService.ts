import { Types } from "mongoose";
import {
  BookRepository,
  bookRepository,
  BookFilter,
} from "../repositories/BookRepository";
import { IBook } from "../models/Book";
import { ApiError } from "../middleware/errorHandler";
import { PaginationOptions } from "../repositories/BaseRepository";

export class BookService {
  constructor(private readonly repository: BookRepository = bookRepository) {}

  async createBook(input: Partial<IBook>, userId?: string): Promise<IBook> {
    const data: Partial<IBook> = {
      ...input,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
    } as Partial<IBook>;

    return this.repository.create(data);
  }

  async getBookById(id: string): Promise<IBook> {
    const book = await this.repository.findById(id);
    if (!book || book.isDeleted) {
      throw new ApiError(404, "Book not found");
    }
    return book;
  }

  async getBookBySlug(slug: string): Promise<IBook> {
    const book = await this.repository.findBySlug(slug);
    if (!book || book.isDeleted) {
      throw new ApiError(404, "Book not found");
    }
    return book;
  }

  async listBooks(filter: BookFilter = {}, options: PaginationOptions = {}) {
    return this.repository.findWithPagination(filter, options);
  }

  async updateBook(id: string, input: Partial<IBook>): Promise<IBook> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Book not found");
    }

    const updated = await this.repository.updateById(id, input);
    if (!updated) {
      throw new ApiError(500, "Failed to update book");
    }
    return updated;
  }

  async deleteBook(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Book not found");
    }

    await this.repository.softDelete(id);
  }

  async restoreBook(id: string): Promise<IBook> {
    const restored = await this.repository.restore(id);
    if (!restored) {
      throw new ApiError(404, "Book not found");
    }
    return restored;
  }

  async getFeaturedBooks(limit = 8) {
    return this.repository.getFeatured(limit);
  }

  async getTrendingBooks(limit = 8) {
    return this.repository.getTrending(limit);
  }

  async getNewReleases(limit = 8) {
    return this.repository.getNewReleases(limit);
  }

  async getPopularBooks(limit = 8) {
    return this.repository.getPopular(limit);
  }

  async getBooksByCategory(categoryId: string, limit = 8) {
    return this.repository.getByCategory(categoryId, limit);
  }

  async getBooksByGenre(genreId: string, limit = 8) {
    return this.repository.getByGenre(genreId, limit);
  }

  async getBooksByAuthor(authorId: string, limit = 8) {
    return this.repository.getByAuthor(authorId, limit);
  }

  async getBooksByPublisher(publisherId: string, limit = 8) {
    return this.repository.getByPublisher(publisherId, limit);
  }

  async getRelatedBooks(currentBookId: string, categoryId?: string, limit = 6) {
    return this.repository.getRelated(currentBookId, categoryId, limit);
  }
}

export const bookService = new BookService();
