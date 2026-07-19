import { Types } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import {
  EditorialComment,
  IEditorialComment,
} from "../models/EditorialComment";

export class EditorialCommentRepository extends BaseRepository<IEditorialComment> {
  constructor() {
    super(EditorialComment);
  }

  async findByArticle(articleId: Types.ObjectId): Promise<IEditorialComment[]> {
    return (this.model as typeof EditorialComment).findByArticle(articleId);
  }

  async findPending(): Promise<IEditorialComment[]> {
    return (this.model as typeof EditorialComment).findPending();
  }
}

export const editorialCommentRepository = new EditorialCommentRepository();
