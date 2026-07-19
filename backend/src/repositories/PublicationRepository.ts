import { Types, FilterQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Publication, IPublication } from "../models/Publication";

export interface PublicationFilter extends FilterQuery<IPublication> {
  search?: string;
  status?: string;
  publisher?: string | Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
}

export class PublicationRepository extends BaseRepository<IPublication> {
  constructor() {
    super(Publication);
  }

  async findBySlug(slug: string): Promise<IPublication | null> {
    return this.model.findOne({ slug, isDeleted: false }).exec();
  }

  async findWithPagination(
    filter: PublicationFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IPublication>> {
    const { search, status, publisher, startDate, endDate, ...restFilter } =
      filter;
    const query: FilterQuery<IPublication> = {
      ...restFilter,
      isDeleted: false,
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (publisher) {
      query.publisher =
        publisher instanceof Types.ObjectId
          ? publisher
          : new Types.ObjectId(publisher);
    }

    if (startDate || endDate) {
      query.issueDate = {} as FilterQuery<IPublication>["issueDate"];
      if (startDate) {
        (query.issueDate as any).$gte = startDate;
      }
      if (endDate) {
        (query.issueDate as any).$lte = endDate;
      }
    }

    return super.findWithPagination(query, {
      ...options,
      sort: options.sort || { issueDate: -1, createdAt: -1 },
    });
  }

  async getLatest(limit: number = 6): Promise<IPublication[]> {
    return this.model
      .find({ status: "active", isDeleted: false })
      .sort({ issueDate: -1 })
      .limit(limit)
      .exec();
  }

  async getArchive(limit: number = 12): Promise<IPublication[]> {
    return this.model
      .find({ status: "archived", isDeleted: false })
      .sort({ issueDate: -1 })
      .limit(limit)
      .exec();
  }

  async restore(id: string | Types.ObjectId): Promise<IPublication | null> {
    return this.updateById(id, {
      isDeleted: false,
      deletedAt: undefined,
    } as Partial<IPublication>);
  }
}

export const publicationRepository = new PublicationRepository();
