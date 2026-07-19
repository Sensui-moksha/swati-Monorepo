import { Types } from "mongoose";
import {
  AuthorRepository,
  authorRepository,
  AuthorFilter,
} from "../repositories/AuthorRepository";
import { IAuthor } from "../models/Author";
import { ApiError } from "../middleware/errorHandler";
import { PaginationOptions } from "../repositories/BaseRepository";

export class AuthorService {
  constructor(
    private readonly repository: AuthorRepository = authorRepository,
  ) {}

  async createAuthor(
    input: Partial<IAuthor>,
    userId?: string,
  ): Promise<IAuthor> {
    const data: Partial<IAuthor> = {
      ...input,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
    } as Partial<IAuthor>;

    return this.repository.create(data);
  }

  async getAuthorById(id: string): Promise<IAuthor> {
    const author = await this.repository.findById(id);
    if (!author || author.isDeleted) {
      throw new ApiError(404, "Author not found");
    }
    return author;
  }

  async getAuthorBySlug(slug: string): Promise<IAuthor> {
    const author = await this.repository.findBySlug(slug);
    if (!author || author.isDeleted) {
      throw new ApiError(404, "Author not found");
    }
    return author;
  }

  async listAuthors(
    filter: AuthorFilter = {},
    options: PaginationOptions = {},
  ) {
    return this.repository.findWithPagination(filter, options);
  }

  async updateAuthor(id: string, input: Partial<IAuthor>): Promise<IAuthor> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Author not found");
    }

    const updated = await this.repository.updateById(id, input);
    if (!updated) {
      throw new ApiError(500, "Failed to update author");
    }
    return updated;
  }

  async deleteAuthor(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Author not found");
    }

    await this.repository.softDelete(id);
  }

  async restoreAuthor(id: string): Promise<IAuthor> {
    const restored = await this.repository.restore(id);
    if (!restored) {
      throw new ApiError(404, "Author not found");
    }
    return restored;
  }

  async getFeaturedAuthors(limit = 8) {
    return this.repository.getFeatured(limit);
  }
}

export const authorService = new AuthorService();
