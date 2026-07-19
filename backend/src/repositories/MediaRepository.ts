import { Types, FilterQuery, UpdateQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Media, IMedia } from "../models/Media";
import { Article } from "../models/Article";

export interface MediaFilter extends FilterQuery<IMedia> {
  search?: string;
  mimeType?: string;
  uploadedBy?: string | Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
}

export class MediaRepository extends BaseRepository<IMedia> {
  constructor() {
    super(Media);
  }

  async findByUrl(url: string): Promise<IMedia | null> {
    return this.model.findOne({ url });
  }

  async findByFolder(folder: string): Promise<IMedia[]> {
    return this.model.find({ folder }).sort({ createdAt: -1 });
  }

  async findWithPagination(
    filter: MediaFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IMedia>> {
    const { search, mimeType, uploadedBy, startDate, endDate, ...restFilter } =
      filter;
    const query: FilterQuery<IMedia> = { ...restFilter };

    if (search) {
      query.$or = [
        { filename: { $regex: search, $options: "i" } },
        { originalName: { $regex: search, $options: "i" } },
        { altText: { $regex: search, $options: "i" } },
      ];
    }

    if (mimeType) {
      query.mimeType = {
        $regex: `^${mimeType}`,
        $options: "i",
      } as FilterQuery<IMedia>["mimeType"];
    }

    if (uploadedBy) {
      query.uploadedBy =
        uploadedBy instanceof Types.ObjectId
          ? uploadedBy
          : new Types.ObjectId(uploadedBy);
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    return super.findWithPagination(query, {
      ...options,
      sort: options.sort || { createdAt: -1 },
    });
  }

  async findByUploadedBy(
    userId: string | Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IMedia>> {
    return this.findWithPagination(
      { uploadedBy: userId },
      { ...options, sort: options.sort || { createdAt: -1 } },
    );
  }

  async findByMimeType(
    mimeType: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IMedia>> {
    return this.findWithPagination(
      {
        mimeType: {
          $regex: `^${mimeType}`,
          $options: "i",
        } as FilterQuery<IMedia>["mimeType"],
      },
      { ...options, sort: options.sort || { createdAt: -1 } },
    );
  }

  async findImages(
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IMedia>> {
    return this.findByMimeType("image", options);
  }

  async findVideos(
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IMedia>> {
    return this.findByMimeType("video", options);
  }

  async findDocuments(
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IMedia>> {
    return this.findWithPagination(
      {
        mimeType: {
          $in: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ],
        },
      } as FilterQuery<IMedia>,
      { ...options, sort: options.sort || { createdAt: -1 } },
    );
  }

  async getTotalStorageUsed(): Promise<number> {
    const result = await this.model.aggregate([
      { $group: { _id: null, total: { $sum: "$size" } } },
    ]);
    return result[0]?.total || 0;
  }

  async getStorageUsedByUser(userId: string | Types.ObjectId): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          uploadedBy:
            userId instanceof Types.ObjectId
              ? userId
              : new Types.ObjectId(userId),
        },
      },
      { $group: { _id: null, total: { $sum: "$size" } } },
    ]);
    return result[0]?.total || 0;
  }

  async getStorageUsedByType(): Promise<
    { mimeType: string; totalSize: number; count: number }[]
  > {
    return this.model.aggregate([
      {
        $group: {
          _id: {
            $substr: ["$mimeType", 0, { $indexOfBytes: ["$mimeType", "/"] }],
          },
          totalSize: { $sum: "$size" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          mimeType: "$_id",
          totalSize: 1,
          count: 1,
        },
      },
      { $sort: { totalSize: -1 } },
    ]);
  }

  async getRecentUploads(limit: number = 10): Promise<IMedia[]> {
    return this.model.find().sort({ createdAt: -1 }).limit(limit);
  }

  async getMediaStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    byType: { mimeType: string; count: number; totalSize: number }[];
  }> {
    const [totalFiles, totalSize, byType] = await Promise.all([
      this.model.countDocuments(),
      this.getTotalStorageUsed(),
      this.getStorageUsedByType(),
    ]);

    return { totalFiles, totalSize, byType };
  }

  async updateAltText(
    mediaId: string | Types.ObjectId,
    altText: string,
  ): Promise<IMedia | null> {
    return this.updateById(mediaId, { altText } as UpdateQuery<IMedia>);
  }

  async updateThumbnail(
    mediaId: string | Types.ObjectId,
    thumbnailUrl: string,
  ): Promise<IMedia | null> {
    return this.updateById(mediaId, { thumbnailUrl } as UpdateQuery<IMedia>);
  }

  async deleteOldFiles(olderThan: Date): Promise<number> {
    const result = await this.model
      .deleteMany({ createdAt: { $lt: olderThan } })
      .exec();
    return result.deletedCount;
  }

  async findOrphanedMedia(): Promise<IMedia[]> {
    // This would need to be customized based on how media is referenced
    // For now, return media not referenced by any article
    const referencedMedia = await Article.distinct("featuredImage");
    const referencedThumbnails = await Article.distinct("thumbnail");
    const allReferenced = [
      ...new Set([...referencedMedia, ...referencedThumbnails]),
    ];

    return this.model
      .find({ url: { $nin: allReferenced } })
      .sort({ createdAt: -1 });
  }
}

export const mediaRepository = new MediaRepository();
