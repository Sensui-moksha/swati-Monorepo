import { Types } from "mongoose";
import { ApiError } from "../middleware/errorHandler";
import { noteRepository } from "../repositories/NoteRepository";
import { INote } from "../models/Note";

export class NoteService {
  async createNote(
    userId: Types.ObjectId,
    data: Partial<INote>,
  ): Promise<INote> {
    if (!data.content || !data.title || !data.resourceId) {
      throw new ApiError(400, "title, content, and resourceId are required");
    }

    return noteRepository.create({ ...data, user: userId });
  }

  async getNotes(userId: Types.ObjectId, page = 1, limit = 20) {
    return noteRepository.findByUser(userId, { page, limit });
  }

  async getNotesByResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
    page = 1,
    limit = 20,
  ) {
    return noteRepository.findByUserAndResource(userId, resourceId, {
      page,
      limit,
    });
  }

  async getNotesByTag(
    userId: Types.ObjectId,
    tag: string,
    page = 1,
    limit = 20,
  ) {
    return noteRepository.findByUserAndTag(userId, tag, { page, limit });
  }

  async getPinnedNotes(userId: Types.ObjectId): Promise<INote[]> {
    return noteRepository.findPinnedByUser(userId);
  }

  async searchNotes(
    userId: Types.ObjectId,
    query: string,
    page = 1,
    limit = 20,
  ) {
    return noteRepository.search(userId, query, { page, limit });
  }

  async getNote(
    noteId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<INote | null> {
    const note = await noteRepository.findById(noteId);
    if (!note || note.user.toString() !== userId.toString()) {
      throw new ApiError(404, "Note not found");
    }
    return note;
  }

  async updateNote(
    noteId: Types.ObjectId,
    userId: Types.ObjectId,
    data: Partial<INote>,
  ): Promise<INote | null> {
    const note = await noteRepository.findById(noteId);
    if (!note || note.user.toString() !== userId.toString()) {
      throw new ApiError(404, "Note not found");
    }

    return noteRepository.updateById(noteId, data);
  }

  async deleteNote(
    noteId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const note = await noteRepository.findById(noteId);
    if (!note || note.user.toString() !== userId.toString()) {
      throw new ApiError(404, "Note not found");
    }

    await noteRepository.deleteById(noteId);
  }

  async togglePin(
    noteId: Types.ObjectId,
    userId: Types.ObjectId,
    isPinned: boolean,
  ): Promise<INote | null> {
    const note = await noteRepository.findById(noteId);
    if (!note || note.user.toString() !== userId.toString()) {
      throw new ApiError(404, "Note not found");
    }

    return noteRepository.togglePin(noteId, isPinned);
  }

  async getNoteCount(userId: Types.ObjectId): Promise<number> {
    return noteRepository.countByUser(userId);
  }

  async getNoteCountByResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<number> {
    return noteRepository.countByUserAndResource(userId, resourceId);
  }

  async getAllTags(userId: Types.ObjectId): Promise<string[]> {
    return noteRepository.getAllTags(userId);
  }

  async deleteNotesByResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<void> {
    await noteRepository.deleteByUserAndResource(userId, resourceId);
  }
}

export const noteService = new NoteService();
