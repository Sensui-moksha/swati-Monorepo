import { Types, FilterQuery, UpdateQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Tag, ITag } from "../models/Tag";

export interface TagFilter extends FilterQuery<ITag> {
  search?: string;
}

export class TagRepository extends BaseRepository<ITag> {
  constructor() {
    super(Tag);
  }

  async findBySlug(slug: string): Promise<ITag | null> {
    return this.model.findOne({ slug }).exec();
  }

  async findByName(name: string): Promise<ITag | null> {
    return this.model
      .findOne({ name: { $regex: `^${name}$`, $options: "i" } })
      .exec();
  }

  async findWithPagination(
    filter: TagFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<ITag>> {
    const { search, ...restFilter } = filter;
    const query: FilterQuery<ITag> = { ...restFilter };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    return this.findWithPagination(query, {
      ...options,
      sort: options.sort || { usageCount: -1, name: 1 },
    });
  }

  async getPopularTags(limit: number = 20): Promise<ITag[]> {
    return this.model
      .find({ usageCount: { $gt: 0 } })
      .sort({ usageCount: -1, name: 1 })
      .limit(limit)
      .exec();
  }

  async getAllTagsSorted(): Promise<ITag[]> {
    return this.model.find().sort({ name: 1 }).exec();
  }

  async incrementUsageCount(
    tagId: string | Types.ObjectId,
  ): Promise<ITag | null> {
    return this.model
      .findByIdAndUpdate(tagId, { $inc: { usageCount: 1 } }, { new: true })
      .exec();
  }

  async decrementUsageCount(
    tagId: string | Types.ObjectId,
  ): Promise<ITag | null> {
    return this.model
      .findByIdAndUpdate(tagId, { $inc: { usageCount: -1 } }, { new: true })
      .exec();
  }

  async incrementUsageBySlug(slug: string): Promise<ITag | null> {
    return this.model
      .findOneAndUpdate({ slug }, { $inc: { usageCount: 1 } }, { new: true })
      .exec();
  }

  async decrementUsageBySlug(slug: string): Promise<ITag | null> {
    return this.model
      .findOneAndUpdate({ slug }, { $inc: { usageCount: -1 } }, { new: true })
      .exec();
  }

  async bulkIncrementUsage(slugs: string[]): Promise<number> {
    const result = await this.model
      .updateMany({ slug: { $in: slugs } }, { $inc: { usageCount: 1 } })
      .exec();
    return result.modifiedCount;
  }

  async bulkDecrementUsage(slugs: string[]): Promise<number> {
    const result = await this.model
      .updateMany({ slug: { $in: slugs } }, { $inc: { usageCount: -1 } })
      .exec();
    return result.modifiedCount;
  }

  async findOrCreate(name: string): Promise<ITag> {
    const existing = await this.findByName(name);
    if (existing) return existing;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return this.create({ name, slug });
  }

  async findOrCreateMany(names: string[]): Promise<ITag[]> {
    const tags: ITag[] = [];
    for (const name of names) {
      const tag = await this.findOrCreate(name);
      tags.push(tag);
    }
    return tags;
  }

  async getTagStats(): Promise<{
    total: number;
    used: number;
    unused: number;
    topTags: { name: string; slug: string; usageCount: number }[];
  }> {
    const [total, used, unused, topTags] = await Promise.all([
      this.model.countDocuments().exec(),
      this.model.countDocuments({ usageCount: { $gt: 0 } }).exec(),
      this.model.countDocuments({ usageCount: 0 }).exec(),
      this.model
        .find({ usageCount: { $gt: 0 } })
        .sort({ usageCount: -1 })
        .limit(10)
        .select("name slug usageCount")
        .exec(),
    ]);

    return { total, used, unused, topTags };
  }

  async cleanupUnusedTags(): Promise<number> {
    const result = await this.model.deleteMany({ usageCount: 0 }).exec();
    return result.deletedCount;
  }

  async updateTag(
    tagId: string | Types.ObjectId,
    data: Partial<ITag>,
  ): Promise<ITag | null> {
    return this.updateById(tagId, data as UpdateQuery<ITag>);
  }

  async mergeTags(
    sourceTagId: string | Types.ObjectId,
    targetTagId: string | Types.ObjectId,
  ): Promise<ITag | null> {
    const sourceTag = await this.findById(sourceTagId);
    const targetTag = await this.findById(targetTagId);

    if (!sourceTag || !targetTag) return null;

    // Add usage count from source to target
    await this.updateById(targetTagId, {
      usageCount: targetTag.usageCount + sourceTag.usageCount,
    } as UpdateQuery<ITag>);

    // Delete source tag
    await this.deleteById(sourceTagId);

    return this.findById(targetTagId);
  }
}

export const tagRepository = new TagRepository();
