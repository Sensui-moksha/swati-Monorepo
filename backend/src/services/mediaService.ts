import { Types } from "mongoose";
import { mediaRepository } from "../repositories/MediaRepository";
import { ApiError } from "../middleware/errorHandler";
import { IMedia } from "../models/Media";

export class MediaService {
  async listMedia(filter: Record<string, unknown> = {}, page = 1, limit = 20) {
    return mediaRepository.findWithPagination(filter as any, { page, limit });
  }

  async getMedia(id: string): Promise<IMedia> {
    const media = await mediaRepository.findById(id);
    if (!media) throw new ApiError(404, "Media not found");
    return media;
  }

  async getByFolder(folder: string) {
    return mediaRepository.findByFolder(folder);
  }
  async getRecent(limit = 10) {
    return mediaRepository.getRecentUploads(limit);
  }
  async getStats() {
    return mediaRepository.getMediaStats();
  }
  async getUsage(userId?: string) {
    return userId
      ? mediaRepository.getStorageUsedByUser(new Types.ObjectId(userId))
      : mediaRepository.getTotalStorageUsed();
  }

  async updateMetadata(id: string, input: Partial<IMedia>): Promise<IMedia> {
    const updated = await mediaRepository.updateById(id, input as any);
    if (!updated) throw new ApiError(404, "Media not found");
    return updated;
  }

  async deleteMedia(id: string): Promise<void> {
    const deleted = await mediaRepository.deleteById(id);
    if (!deleted) throw new ApiError(404, "Media not found");
  }

  async replaceMedia(id: string, input: Partial<IMedia>): Promise<IMedia> {
    return this.updateMetadata(id, input);
  }

  async findByType(
    type: "image" | "video" | "audio" | "document",
    page = 1,
    limit = 20,
  ) {
    return mediaRepository.findWithPagination({ type } as any, { page, limit });
  }
}

export const mediaService = new MediaService();
