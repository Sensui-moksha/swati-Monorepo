import { Types } from "mongoose";
import {
  GenreRepository,
  genreRepository,
  GenreFilter,
} from "../repositories/GenreRepository";
import { IGenre } from "../models/Genre";
import { ApiError } from "../middleware/errorHandler";
import { PaginationOptions } from "../repositories/BaseRepository";

export class GenreService {
  constructor(private readonly repository: GenreRepository = genreRepository) {}

  async createGenre(input: Partial<IGenre>, userId?: string): Promise<IGenre> {
    const data: Partial<IGenre> = {
      ...input,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
    } as Partial<IGenre>;

    return this.repository.create(data);
  }

  async getGenreById(id: string): Promise<IGenre> {
    const genre = await this.repository.findById(id);
    if (!genre || genre.isDeleted) {
      throw new ApiError(404, "Genre not found");
    }
    return genre;
  }

  async getGenreBySlug(slug: string): Promise<IGenre> {
    const genre = await this.repository.findBySlug(slug);
    if (!genre || genre.isDeleted) {
      throw new ApiError(404, "Genre not found");
    }
    return genre;
  }

  async listGenres(filter: GenreFilter = {}, options: PaginationOptions = {}) {
    return this.repository.findWithPagination(filter, options);
  }

  async updateGenre(id: string, input: Partial<IGenre>): Promise<IGenre> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Genre not found");
    }

    const updated = await this.repository.updateById(id, input);
    if (!updated) {
      throw new ApiError(500, "Failed to update genre");
    }
    return updated;
  }

  async deleteGenre(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Genre not found");
    }

    await this.repository.softDelete(id);
  }

  async restoreGenre(id: string): Promise<IGenre> {
    const restored = await this.repository.restore(id);
    if (!restored) {
      throw new ApiError(404, "Genre not found");
    }
    return restored;
  }
}

export const genreService = new GenreService();
