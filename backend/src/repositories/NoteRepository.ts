import { Types } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Note, INote } from "../models/Note";

export class NoteRepository extends BaseRepository<INote> {
  constructor() {
    super(Note);
  }

  async findByUser(
    userId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<INote>> {
    return this.findWithPagination(
      { user: userId },
      { ...options, sort: { isPinned: -1, createdAt: -1 } },
    );
  }

  async findByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<INote>> {
    return this.findWithPagination(
      { user: userId, resourceId },
      { ...options, sort: { isPinned: -1, createdAt: -1 } },
    );
  }

  async findByUserAndTag(
    userId: Types.ObjectId,
    tag: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<INote>> {
    return this.findWithPagination(
      { user: userId, tags: tag.toLowerCase() },
      { ...options, sort: { createdAt: -1 } },
    );
  }

  async findPinnedByUser(userId: Types.ObjectId): Promise<INote[]> {
    return this.model
      .find({ user: userId, isPinned: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async search(
    userId: Types.ObjectId,
    query: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<INote>> {
    const searchRegex = new RegExp(query, "i");
    return this.findWithPagination(
      {
        user: userId,
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex },
        ],
      },
      { ...options, sort: { createdAt: -1 } },
    );
  }

  async countByUser(userId: Types.ObjectId): Promise<number> {
    return this.model.countDocuments({ user: userId });
  }

  async countByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<number> {
    return this.model.countDocuments({ user: userId, resourceId });
  }

  async togglePin(
    noteId: Types.ObjectId,
    isPinned: boolean,
  ): Promise<INote | null> {
    return this.updateById(noteId, { isPinned });
  }

  async deleteByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<any> {
    return this.model.deleteMany({ user: userId, resourceId }).exec();
  }

  async getAllTags(userId: Types.ObjectId): Promise<string[]> {
    const result = await this.model.distinct("tags", { user: userId });
    return result || [];
  }
}

export const noteRepository = new NoteRepository();
