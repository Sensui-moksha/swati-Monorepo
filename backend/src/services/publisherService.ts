import { Types } from "mongoose";
import {
  PublisherRepository,
  publisherRepository,
  PublisherFilter,
} from "../repositories/PublisherRepository";
import { IPublisher } from "../models/Publisher";
import { ApiError } from "../middleware/errorHandler";
import { PaginationOptions } from "../repositories/BaseRepository";

export class PublisherService {
  constructor(
    private readonly repository: PublisherRepository = publisherRepository,
  ) {}

  async createPublisher(
    input: Partial<IPublisher>,
    userId?: string,
  ): Promise<IPublisher> {
    const data: Partial<IPublisher> = {
      ...input,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
    } as Partial<IPublisher>;

    return this.repository.create(data);
  }

  async getPublisherById(id: string): Promise<IPublisher> {
    const publisher = await this.repository.findById(id);
    if (!publisher || publisher.isDeleted) {
      throw new ApiError(404, "Publisher not found");
    }
    return publisher;
  }

  async getPublisherBySlug(slug: string): Promise<IPublisher> {
    const publisher = await this.repository.findBySlug(slug);
    if (!publisher || publisher.isDeleted) {
      throw new ApiError(404, "Publisher not found");
    }
    return publisher;
  }

  async listPublishers(
    filter: PublisherFilter = {},
    options: PaginationOptions = {},
  ) {
    return this.repository.findWithPagination(filter, options);
  }

  async updatePublisher(
    id: string,
    input: Partial<IPublisher>,
  ): Promise<IPublisher> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Publisher not found");
    }

    const updated = await this.repository.updateById(id, input);
    if (!updated) {
      throw new ApiError(500, "Failed to update publisher");
    }
    return updated;
  }

  async deletePublisher(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Publisher not found");
    }

    await this.repository.deleteById(id);
  }

  async restorePublisher(id: string): Promise<IPublisher> {
    const restored = await this.repository.restore(id);
    if (!restored) {
      throw new ApiError(404, "Publisher not found");
    }
    return restored;
  }

  async getFeaturedPublishers(limit = 8) {
    return this.repository.getFeatured(limit);
  }
}

export const publisherService = new PublisherService();
