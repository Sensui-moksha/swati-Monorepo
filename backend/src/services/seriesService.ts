import { Types } from "mongoose";
import {
  SeriesRepository,
  seriesRepository,
  SeriesFilter,
} from "../repositories/SeriesRepository";
import { ISeries } from "../models/Series";
import { ApiError } from "../middleware/errorHandler";
import { PaginationOptions } from "../repositories/BaseRepository";

export class SeriesService {
  constructor(
    private readonly repository: SeriesRepository = seriesRepository,
  ) {}

  async createSeries(
    input: Partial<ISeries>,
    userId?: string,
  ): Promise<ISeries> {
    const data: Partial<ISeries> = {
      ...input,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
    } as Partial<ISeries>;

    return this.repository.create(data);
  }

  async getSeriesById(id: string): Promise<ISeries> {
    const series = await this.repository.findById(id);
    if (!series || series.isDeleted) {
      throw new ApiError(404, "Series not found");
    }
    return series;
  }

  async getSeriesBySlug(slug: string): Promise<ISeries> {
    const series = await this.repository.findBySlug(slug);
    if (!series || series.isDeleted) {
      throw new ApiError(404, "Series not found");
    }
    return series;
  }

  async listSeries(filter: SeriesFilter = {}, options: PaginationOptions = {}) {
    return this.repository.findWithPagination(filter, options);
  }

  async updateSeries(id: string, input: Partial<ISeries>): Promise<ISeries> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Series not found");
    }

    const updated = await this.repository.updateById(id, input);
    if (!updated) {
      throw new ApiError(500, "Failed to update series");
    }
    return updated;
  }

  async deleteSeries(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing || existing.isDeleted) {
      throw new ApiError(404, "Series not found");
    }

    await this.repository.deleteById(id);
  }

  async restoreSeries(id: string): Promise<ISeries> {
    const restored = await this.repository.restore(id);
    if (!restored) {
      throw new ApiError(404, "Series not found");
    }
    return restored;
  }
}

export const seriesService = new SeriesService();
