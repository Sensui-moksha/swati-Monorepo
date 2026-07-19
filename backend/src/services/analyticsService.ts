import { Types } from "mongoose";
import { userRepository } from "../repositories/UserRepository";
import { readingHistoryRepository } from "../repositories/ReadingHistoryRepository";
import { articleRepository } from "../repositories/ArticleRepository";
import { bookRepository } from "../repositories/BookRepository";
import { publicationRepository } from "../repositories/PublicationRepository";
import { magazineIssueRepository } from "../repositories/MagazineIssueRepository";
import { commerceOrderRepository } from "../repositories/CommerceOrderRepository";
import { commercePaymentRepository } from "../repositories/CommercePaymentRepository";
import { commerceInvoiceRepository } from "../repositories/CommerceInvoiceRepository";
import { commerceSubscriptionRepository } from "../repositories/CommerceSubscriptionRepository";
import { commerceCouponRepository } from "../repositories/CommerceCouponRepository";

interface AnalyticsWindow {
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
  userId?: string;
  categoryId?: string;
  tagId?: string;
  type?: string;
  exportFormat?: string;
}

export class AnalyticsService {
  async getOverview(window: AnalyticsWindow = {}) {
    const [
      activeUsers,
      totalUsers,
      recentUsers,
      popularBooks,
      popularArticles,
      revenueSummary,
    ] = await Promise.all([
      userRepository.getActiveUsersCount(),
      userRepository.count(),
      userRepository.getRecentUsers(5),
      bookRepository.getTrending(5),
      articleRepository.getTopViewed(5),
      this.getRevenue(window),
    ]);

    return {
      users: {
        activeCount: activeUsers,
        totalCount: totalUsers,
        recentUsers,
      },
      content: {
        popularBooks,
        popularArticles,
      },
      commerce: {
        revenue: revenueSummary.totalRevenue,
        orders: revenueSummary.orders,
      },
      window: {
        from: window.from,
        to: window.to,
      },
    };
  }

  async getUsersAnalytics(window: AnalyticsWindow = {}) {
    const filter: any = {};
    if (window.userId) filter._id = new Types.ObjectId(window.userId);
    if (window.from || window.to) {
      filter.createdAt = {} as any;
      if (window.from) filter.createdAt.$gte = window.from;
      if (window.to) filter.createdAt.$lte = window.to;
    }

    const users = await userRepository.findWithPagination(filter, {
      page: window.page,
      limit: window.limit,
      sort: { createdAt: -1 },
    });
    const activeCount = await userRepository.getActiveUsersCount();
    const verifiedCount = await userRepository.getVerifiedUsersCount();

    return {
      summary: {
        activeCount,
        verifiedCount,
        totalCount: users.pagination.total,
      },
      users,
    };
  }

  async getReadingAnalytics(window: AnalyticsWindow = {}) {
    const filter: any = {};
    if (window.from || window.to) {
      filter.readAt = {} as any;
      if (window.from) filter.readAt.$gte = window.from;
      if (window.to) filter.readAt.$lte = window.to;
    }

    const readings = await readingHistoryRepository.findWithPagination(filter, {
      page: window.page,
      limit: window.limit,
      sort: { readAt: -1 },
    });
    const totalReadings = await readingHistoryRepository.count(filter);
    const uniqueUsers = await readingHistoryRepository.model
      .distinct("user", filter)
      .exec();
    const topContent = await this.getTopContentByReads(filter, 5);

    return {
      summary: {
        totalReadings,
        uniqueReaders: uniqueUsers.length,
      },
      topContent,
      readings,
    };
  }

  async getContentAnalytics(window: AnalyticsWindow = {}) {
    const filter: any = { status: "published" };
    if (window.categoryId)
      filter.category = new Types.ObjectId(window.categoryId);
    if (window.tagId) filter.tags = new Types.ObjectId(window.tagId);

    const books = await bookRepository.findWithPagination(filter, {
      page: window.page,
      limit: window.limit,
      sort: { viewCount: -1 },
    });
    const articles = await articleRepository.findWithPagination(filter, {
      page: window.page,
      limit: window.limit,
      sort: { viewCount: -1 },
    });
    const publications = await publicationRepository.findWithPagination(
      { status: "active" },
      { page: window.page, limit: window.limit, sort: { issueDate: -1 } },
    );
    const magazineIssues = await magazineIssueRepository.findWithPagination(
      { status: "published" },
      { page: window.page, limit: window.limit, sort: { publishDate: -1 } },
    );

    return {
      books,
      articles,
      publications,
      magazineIssues,
    };
  }

  async getCommerceAnalytics(window: AnalyticsWindow = {}) {
    const orders = await commerceOrderRepository.findWithPagination(
      { createdAt: { $gte: window.from, $lte: window.to } },
      { page: window.page, limit: window.limit, sort: { createdAt: -1 } },
    );
    const payments = await commercePaymentRepository.findWithPagination(
      { createdAt: { $gte: window.from, $lte: window.to } },
      { page: window.page, limit: window.limit, sort: { createdAt: -1 } },
    );
    const invoices = await commerceInvoiceRepository.findWithPagination(
      { createdAt: { $gte: window.from, $lte: window.to } },
      { page: window.page, limit: window.limit, sort: { createdAt: -1 } },
    );
    const subscriptions =
      await commerceSubscriptionRepository.findWithPagination(
        { createdAt: { $gte: window.from, $lte: window.to } },
        { page: window.page, limit: window.limit, sort: { createdAt: -1 } },
      );
    const coupons = await commerceCouponRepository.findWithPagination(
      { createdAt: { $gte: window.from, $lte: window.to } },
      { page: window.page, limit: window.limit, sort: { createdAt: -1 } },
    );

    const totalRevenue = payments.data
      .filter((payment) => payment.status === "captured")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalOrders = orders.pagination.total;
    const totalSubscriptions = subscriptions.pagination.total;

    return {
      summary: {
        totalRevenue,
        totalOrders,
        totalSubscriptions,
      },
      orders,
      payments,
      invoices,
      subscriptions,
      coupons,
    };
  }

  async exportAnalytics(window: AnalyticsWindow = {}) {
    const type = window.type || "overview";
    const report = await this.getReportByType(type, window);
    return { type, exportFormat: window.exportFormat || "json", report };
  }

  private async getReportByType(type: string, window: AnalyticsWindow) {
    switch (type) {
      case "users":
        return this.getUsersAnalytics(window);
      case "reading":
        return this.getReadingAnalytics(window);
      case "content":
        return this.getContentAnalytics(window);
      case "commerce":
        return this.getCommerceAnalytics(window);
      case "overview":
      default:
        return this.getOverview(window);
    }
  }

  private async getRevenue(window: AnalyticsWindow) {
    const payments = await commercePaymentRepository.findWithPagination(
      { createdAt: { $gte: window.from, $lte: window.to } },
      { page: 1, limit: 100 },
    );
    const totalRevenue = payments.data
      .filter((payment) => payment.status === "captured")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const orders = await commerceOrderRepository.findWithPagination(
      { createdAt: { $gte: window.from, $lte: window.to } },
      { page: 1, limit: 100, sort: { createdAt: -1 } },
    );

    return { totalRevenue, orders: orders.pagination.total };
  }

  private async getTopContentByReads(filter: any, limit = 5) {
    const pipeline = [
      { $match: filter },
      { $group: { _id: "$resourceId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ];

    const raw = await readingHistoryRepository.aggregate(pipeline);
    return raw.map((item: any) => ({
      resourceId: item._id,
      reads: item.count,
    }));
  }
}

export const analyticsService = new AnalyticsService();
