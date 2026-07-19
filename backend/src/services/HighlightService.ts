import { Types } from "mongoose";
import { ApiError } from "../middleware/errorHandler";
import { highlightRepository } from "../repositories/HighlightRepository";
import { IHighlight } from "../models/Highlight";

export class HighlightService {
  async createHighlight(
    userId: Types.ObjectId,
    data: Partial<IHighlight>,
  ): Promise<IHighlight> {
    if (!data.text || !data.resourceId || !data.color) {
      throw new ApiError(400, "text, resourceId, and color are required");
    }

    return highlightRepository.create({ ...data, user: userId });
  }

  async getHighlights(userId: Types.ObjectId, page = 1, limit = 20) {
    return highlightRepository.findByUser(userId, { page, limit });
  }

  async getHighlightsByResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
    page = 1,
    limit = 50,
  ) {
    return highlightRepository.findByUserAndResource(userId, resourceId, {
      page,
      limit,
    });
  }

  async getHighlightsByColor(
    userId: Types.ObjectId,
    color: string,
    page = 1,
    limit = 20,
  ) {
    return highlightRepository.findByUserAndColor(userId, color, {
      page,
      limit,
    });
  }

  async searchHighlights(
    userId: Types.ObjectId,
    query: string,
    page = 1,
    limit = 20,
  ) {
    return highlightRepository.search(userId, query, { page, limit });
  }

  async getHighlight(
    highlightId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<IHighlight | null> {
    const highlight = await highlightRepository.findById(highlightId);
    if (!highlight || highlight.user.toString() !== userId.toString()) {
      throw new ApiError(404, "Highlight not found");
    }
    return highlight;
  }

  async updateHighlight(
    highlightId: Types.ObjectId,
    userId: Types.ObjectId,
    data: Partial<IHighlight>,
  ): Promise<IHighlight | null> {
    const highlight = await highlightRepository.findById(highlightId);
    if (!highlight || highlight.user.toString() !== userId.toString()) {
      throw new ApiError(404, "Highlight not found");
    }

    return highlightRepository.updateById(highlightId, data);
  }

  async deleteHighlight(
    highlightId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const highlight = await highlightRepository.findById(highlightId);
    if (!highlight || highlight.user.toString() !== userId.toString()) {
      throw new ApiError(404, "Highlight not found");
    }

    await highlightRepository.deleteById(highlightId);
  }

  async getHighlightCount(userId: Types.ObjectId): Promise<number> {
    return highlightRepository.countByUser(userId);
  }

  async getHighlightCountByResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<number> {
    return highlightRepository.countByUserAndResource(userId, resourceId);
  }

  async getHighlightCountByColor(
    userId: Types.ObjectId,
    color: string,
  ): Promise<number> {
    return highlightRepository.countByUserAndColor(userId, color);
  }

  async getColorDistribution(
    userId: Types.ObjectId,
  ): Promise<Record<string, number>> {
    return highlightRepository.getColorDistribution(userId);
  }

  async deleteHighlightsByResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<void> {
    await highlightRepository.deleteByUserAndResource(userId, resourceId);
  }
}

export const highlightService = new HighlightService();
