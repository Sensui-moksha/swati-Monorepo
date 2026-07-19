import { Types } from "mongoose";
import {
  PublicationRepository,
  publicationRepository,
  PublicationFilter,
} from "../repositories/PublicationRepository";
import { IPublication } from "../models/Publication";
import { ApiError } from "../middleware/errorHandler";
import { PaginationOptions } from "../repositories/BaseRepository";

export class PublicationService {
  constructor(
    private readonly repository: PublicationRepository = publicationRepository,
  ) {}

  async createPublication(
    input: Partial<IPublication>,
    userId?: string,
  ): Promise<IPublication> {
    const data: Partial<IPublication> = {
      ...input,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
    } as Partial<IPublication>;

    return this.repository.create(data);
  }

  async getPublicationById(id: string): Promise<IPublication> {
    const publication = await this.repository.findById(id);
    if (!publication || publication.isDeleted) {
      throw new ApiError(404, "Publication not found");
    }
    return publication;
  }

  async getPublicationBySlug(slug: string): Promise<IPublication> {
    const publication = await this.repository.findBySlug(slug);
    if (!publication || publication.isDeleted) {
      throw new ApiError(404, "Publication not found");
    }
    return publication;
  }

  async listPublications(
    filter: PublicationFilter = {},
    options: PaginationOptions = {},
  ) {
    return this.repository.findWithPagination(filter, options);
  }

  async updatePublication(
    id: string,
    input: Partial<IPublication>,
  ): Promise<IPublication> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Publication not found");
    }

    const updated = await this.repository.updateById(id, input);
    if (!updated) {
      throw new ApiError(500, "Failed to update publication");
    }
    return updated;
  }

  async deletePublication(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Publication not found");
    }

    await this.repository.deleteById(id);
  }

  async restorePublication(id: string): Promise<IPublication> {
    const restored = await this.repository.restore(id);
    if (!restored) {
      throw new ApiError(404, "Publication not found");
    }
    return restored;
  }

  async getLatestPublications(limit = 6) {
    return this.repository.getLatest(limit);
  }

  async getArchivedPublications(limit = 12) {
    return this.repository.getArchive(limit);
  }
}

export const publicationService = new PublicationService();
