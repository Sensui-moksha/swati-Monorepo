import { Types } from "mongoose";
import {
  MagazineIssueRepository,
  magazineIssueRepository,
  MagazineIssueFilter,
} from "../repositories/MagazineIssueRepository";
import { IMagazineIssue } from "../models/MagazineIssue";
import { ApiError } from "../middleware/errorHandler";
import { PaginationOptions } from "../repositories/BaseRepository";

export class MagazineIssueService {
  constructor(
    private readonly repository: MagazineIssueRepository = magazineIssueRepository,
  ) {}

  async createIssue(
    input: Partial<IMagazineIssue>,
    userId?: string,
  ): Promise<IMagazineIssue> {
    const data: Partial<IMagazineIssue> = {
      ...input,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
    } as Partial<IMagazineIssue>;

    return this.repository.create(data);
  }

  async getIssueById(id: string): Promise<IMagazineIssue> {
    const issue = await this.repository.findById(id);
    if (!issue || issue.isDeleted) {
      throw new ApiError(404, "Magazine issue not found");
    }
    return issue;
  }

  async getIssueBySlug(slug: string): Promise<IMagazineIssue> {
    const issue = await this.repository.findBySlug(slug);
    if (!issue || issue.isDeleted) {
      throw new ApiError(404, "Magazine issue not found");
    }
    return issue;
  }

  async listIssues(
    filter: MagazineIssueFilter = {},
    options: PaginationOptions = {},
  ) {
    return this.repository.findWithPagination(filter, options);
  }

  async updateIssue(
    id: string,
    input: Partial<IMagazineIssue>,
  ): Promise<IMagazineIssue> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Magazine issue not found");
    }

    const updated = await this.repository.updateById(id, input);
    if (!updated) {
      throw new ApiError(500, "Failed to update magazine issue");
    }
    return updated;
  }

  async deleteIssue(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Magazine issue not found");
    }

    await this.repository.deleteById(id);
  }

  async restoreIssue(id: string): Promise<IMagazineIssue> {
    const restored = await this.repository.restore(id);
    if (!restored) {
      throw new ApiError(404, "Magazine issue not found");
    }
    return restored;
  }

  async getCurrentIssues(limit = 6) {
    return this.repository.getCurrent(limit);
  }

  async getArchivedIssues(limit = 12) {
    return this.repository.getArchives(limit);
  }
}

export const magazineIssueService = new MagazineIssueService();
