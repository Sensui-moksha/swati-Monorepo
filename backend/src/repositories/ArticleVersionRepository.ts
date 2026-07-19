import { Types } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { ArticleVersion, IArticleVersion } from "../models/ArticleVersion";

export class ArticleVersionRepository extends BaseRepository<IArticleVersion> {
  constructor() {
    super(ArticleVersion);
  }

  async findByArticle(articleId: Types.ObjectId): Promise<IArticleVersion[]> {
    return (this.model as typeof ArticleVersion).findByArticle(articleId);
  }

  async findByArticleAndVersion(
    articleId: Types.ObjectId,
    version: number,
  ): Promise<IArticleVersion | null> {
    return (this.model as typeof ArticleVersion).findByArticleAndVersion(
      articleId,
      version,
    );
  }
}

export const articleVersionRepository = new ArticleVersionRepository();
