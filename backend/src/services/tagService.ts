import { Types } from "mongoose";
import { tagRepository } from "../repositories/TagRepository";
import { ApiError } from "../middleware/errorHandler";
import { ITag } from "../models/Tag";

export class TagService {
  async createTag(input: Partial<ITag>): Promise<ITag> {
    if (!input.name) throw new ApiError(400, "Tag name is required");
    return tagRepository.findOrCreate(input.name);
  }

  async updateTag(id: string, input: Partial<ITag>): Promise<ITag> {
    const updated = await tagRepository.updateTag(id, input);
    if (!updated) throw new ApiError(404, "Tag not found");
    return updated;
  }

  async deleteTag(id: string): Promise<void> {
    const deleted = await tagRepository.deleteById(id);
    if (!deleted) throw new ApiError(404, "Tag not found");
  }

  async mergeTags(
    sourceTagId: string,
    targetTagId: string,
  ): Promise<ITag | null> {
    return tagRepository.mergeTags(
      new Types.ObjectId(sourceTagId),
      new Types.ObjectId(targetTagId),
    );
  }

  async listTags(page = 1, limit = 20) {
    return tagRepository.findWithPagination({}, { page, limit });
  }
  async popularTags(limit = 20) {
    return tagRepository.getPopularTags(limit);
  }
}

export const tagService = new TagService();
