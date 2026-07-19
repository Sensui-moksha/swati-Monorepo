import { Types, FilterQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { MagazineIssue, IMagazineIssue } from "../models/MagazineIssue";

export interface MagazineIssueFilter extends FilterQuery<IMagazineIssue> {
  search?: string;
  status?: string;
  publication?: string | Types.ObjectId;
  issueType?: string;
  season?: string;
  startDate?: Date;
  endDate?: Date;
}

export class MagazineIssueRepository extends BaseRepository<IMagazineIssue> {
  constructor() {
    super(MagazineIssue);
  }

  async findBySlug(slug: string): Promise<IMagazineIssue | null> {
    return this.model.findOne({ slug, isDeleted: false }).exec();
  }

  async findWithPagination(
    filter: MagazineIssueFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IMagazineIssue>> {
    const {
      search,
      status,
      publication,
      issueType,
      season,
      startDate,
      endDate,
      ...restFilter
    } = filter;
    const query: FilterQuery<IMagazineIssue> = {
      ...restFilter,
      isDeleted: false,
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (publication) {
      query.publication =
        publication instanceof Types.ObjectId
          ? publication
          : new Types.ObjectId(publication);
    }

    if (issueType) {
      query.issueType = issueType;
    }

    if (season) {
      query.season = season;
    }

    if (startDate || endDate) {
      query.publishDate = {} as FilterQuery<IMagazineIssue>["publishDate"];
      if (startDate) {
        (query.publishDate as any).$gte = startDate;
      }
      if (endDate) {
        (query.publishDate as any).$lte = endDate;
      }
    }

    return super.findWithPagination(query, {
      ...options,
      sort: options.sort || { publishDate: -1, createdAt: -1 },
    });
  }

  async getCurrent(limit: number = 6): Promise<IMagazineIssue[]> {
    return this.model
      .find({ status: "published", isDeleted: false })
      .sort({ publishDate: -1 })
      .limit(limit)
      .exec();
  }

  async getArchives(limit: number = 12): Promise<IMagazineIssue[]> {
    return this.model
      .find({ status: "archived", isDeleted: false })
      .sort({ publishDate: -1 })
      .limit(limit)
      .exec();
  }

  async restore(id: string | Types.ObjectId): Promise<IMagazineIssue | null> {
    return this.updateById(id, {
      isDeleted: false,
      deletedAt: undefined,
    } as Partial<IMagazineIssue>);
  }
}

export const magazineIssueRepository = new MagazineIssueRepository();
