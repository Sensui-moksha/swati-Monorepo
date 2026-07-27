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

  async uploadMedia(file?: Express.Multer.File, userId?: string, metadata: any = {}) {
    const filename = file?.originalname || `document-${Date.now()}.pdf`;
    const mimeType = file?.mimetype || "application/pdf";
    const mediaType = mimeType.startsWith("image/")
      ? "image"
      : mimeType.startsWith("audio/")
      ? "audio"
      : mimeType.startsWith("video/")
      ? "video"
      : "document";

    const url = metadata.url || `/documents/${filename}`;

    return mediaRepository.create({
      filename,
      originalName: filename,
      mimeType,
      type: mediaType,
      size: file?.size || 1024000,
      url,
      path: url,
      uploadedBy: userId ? new Types.ObjectId(userId) : undefined,
      ...metadata,
    } as any);
  }
}

export const mediaService = new MediaService();
