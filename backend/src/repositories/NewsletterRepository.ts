import { FilterQuery, UpdateQuery } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import { Newsletter, INewsletter } from "../models/Newsletter";

export interface NewsletterFilter extends FilterQuery<INewsletter> {
  search?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export class NewsletterRepository extends BaseRepository<INewsletter> {
  constructor() {
    super(Newsletter);
  }

  async findByEmail(email: string): Promise<INewsletter | null> {
    return this.model.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByToken(token: string): Promise<INewsletter | null> {
    return this.model.findOne({ token }).exec();
  }

  async findWithPagination(
    filter: NewsletterFilter = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<INewsletter>> {
    const { search, isActive, startDate, endDate, ...restFilter } = filter;
    const query: FilterQuery<INewsletter> = { ...restFilter };

    if (search) {
      query.$or = [{ email: { $regex: search, $options: "i" } }];
    }

    if (typeof isActive === "boolean") {
      query.isActive = isActive;
    }

    if (startDate || endDate) {
      query.subscribedAt = {};
      if (startDate) query.subscribedAt.$gte = startDate;
      if (endDate) query.subscribedAt.$lte = endDate;
    }

    return super.findWithPagination(query, {
      ...options,
      sort: options.sort || { subscribedAt: -1 },
    });
  }

  async subscribe(email: string): Promise<INewsletter> {
    const existing = await this.findByEmail(email);
    if (existing) {
      if (!existing.isActive) {
        return this.updateById(existing._id, {
          isActive: true,
          unsubscribedAt: null,
        } as UpdateQuery<INewsletter>) as Promise<INewsletter>;
      }
      return existing;
    }

    return this.create({ email: email.toLowerCase() });
  }

  async unsubscribe(email: string): Promise<INewsletter | null> {
    const subscription = await this.findByEmail(email);
    if (!subscription) return null;

    return this.updateById(subscription._id, {
      isActive: false,
      unsubscribedAt: new Date(),
    } as UpdateQuery<INewsletter>);
  }

  async unsubscribeByToken(token: string): Promise<INewsletter | null> {
    const subscription = await this.findByToken(token);
    if (!subscription) return null;

    return this.updateById(subscription._id, {
      isActive: false,
      unsubscribedAt: new Date(),
    } as UpdateQuery<INewsletter>);
  }

  async resubscribe(email: string): Promise<INewsletter | null> {
    const subscription = await this.findByEmail(email);
    if (!subscription) return null;

    return this.updateById(subscription._id, {
      isActive: true,
      unsubscribedAt: null,
    } as UpdateQuery<INewsletter>);
  }

  async getActiveSubscribersCount(): Promise<number> {
    return this.model.countDocuments({ isActive: true }).exec();
  }

  async getTotalSubscribersCount(): Promise<number> {
    return this.model.countDocuments().exec();
  }

  async getSubscribersByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<INewsletter[]> {
    return this.model
      .find({
        subscribedAt: { $gte: startDate, $lte: endDate },
      })
      .sort({ subscribedAt: -1 })
      .exec();
  }

  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    unsubscribed: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  }> {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, unsubscribed, today, thisWeek, thisMonth] =
      await Promise.all([
        this.model.countDocuments().exec(),
        this.model.countDocuments({ isActive: true }).exec(),
        this.model.countDocuments({ isActive: false }).exec(),
        this.model
          .countDocuments({ subscribedAt: { $gte: todayStart } })
          .exec(),
        this.model.countDocuments({ subscribedAt: { $gte: weekStart } }).exec(),
        this.model
          .countDocuments({ subscribedAt: { $gte: monthStart } })
          .exec(),
      ]);

    return { total, active, unsubscribed, today, thisWeek, thisMonth };
  }

  async getRecentSubscribers(limit: number = 10): Promise<INewsletter[]> {
    return this.model
      .find({ isActive: true })
      .sort({ subscribedAt: -1 })
      .limit(limit)
      .exec();
  }

  async getAllActiveEmails(): Promise<string[]> {
    const subscriptions = await this.model
      .find({ isActive: true })
      .select("email")
      .exec();
    return subscriptions.map((s) => s.email);
  }

  async deleteInactiveOlderThan(date: Date): Promise<number> {
    const result = await this.model
      .deleteMany({
        isActive: false,
        unsubscribedAt: { $lt: date },
      })
      .exec();
    return result.deletedCount;
  }
}

export const newsletterRepository = new NewsletterRepository();
