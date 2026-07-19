import { analyticsService } from "../services/analyticsService";
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
import { Types } from "mongoose";

jest.mock("../repositories/UserRepository");
jest.mock("../repositories/ReadingHistoryRepository");
jest.mock("../repositories/ArticleRepository");
jest.mock("../repositories/BookRepository");
jest.mock("../repositories/PublicationRepository");
jest.mock("../repositories/MagazineIssueRepository");
jest.mock("../repositories/CommerceOrderRepository");
jest.mock("../repositories/CommercePaymentRepository");
jest.mock("../repositories/CommerceInvoiceRepository");
jest.mock("../repositories/CommerceSubscriptionRepository");
jest.mock("../repositories/CommerceCouponRepository");

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockReadingHistoryRepository = readingHistoryRepository as jest.Mocked<
  typeof readingHistoryRepository
>;
const mockArticleRepository = articleRepository as jest.Mocked<
  typeof articleRepository
>;
const mockBookRepository = bookRepository as jest.Mocked<typeof bookRepository>;
const mockPublicationRepository = publicationRepository as jest.Mocked<
  typeof publicationRepository
>;
const mockMagazineIssueRepository = magazineIssueRepository as jest.Mocked<
  typeof magazineIssueRepository
>;
const mockCommerceOrderRepository = commerceOrderRepository as jest.Mocked<
  typeof commerceOrderRepository
>;
const mockCommercePaymentRepository = commercePaymentRepository as jest.Mocked<
  typeof commercePaymentRepository
>;
const mockCommerceInvoiceRepository = commerceInvoiceRepository as jest.Mocked<
  typeof commerceInvoiceRepository
>;
const mockCommerceSubscriptionRepository =
  commerceSubscriptionRepository as jest.Mocked<
    typeof commerceSubscriptionRepository
  >;
const mockCommerceCouponRepository = commerceCouponRepository as jest.Mocked<
  typeof commerceCouponRepository
>;

describe("AnalyticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns overview analytics", async () => {
    mockUserRepository.getActiveUsersCount.mockResolvedValue(10);
    mockUserRepository.count.mockResolvedValue(100);
    mockUserRepository.getRecentUsers.mockResolvedValue([
      { _id: new Types.ObjectId(), email: "a@example.com" },
    ] as any);
    mockBookRepository.getTrending.mockResolvedValue([
      { _id: new Types.ObjectId(), title: "Top Book" },
    ] as any);
    mockArticleRepository.getTopViewed.mockResolvedValue([
      { _id: new Types.ObjectId(), title: "Top Article" },
    ] as any);
    mockCommercePaymentRepository.findWithPagination.mockResolvedValue({
      data: [{ status: "captured", amount: 150 }],
      pagination: {
        page: 1,
        limit: 100,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    } as any);
    mockCommerceOrderRepository.findWithPagination.mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        limit: 100,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    } as any);

    const overview = await analyticsService.getOverview({
      from: new Date("2026-01-01"),
      to: new Date("2026-01-31"),
    });

    expect(overview.users.activeCount).toBe(10);
    expect(overview.users.totalCount).toBe(100);
    expect(overview.content.popularBooks).toHaveLength(1);
    expect(overview.content.popularArticles).toHaveLength(1);
    expect(overview.commerce.revenue).toBe(150);
    expect(overview.commerce.orders).toBe(2);
  });

  it("returns users analytics with pagination and filters", async () => {
    mockUserRepository.findWithPagination.mockResolvedValue({
      data: [{ _id: new Types.ObjectId(), email: "user@example.com" }],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    } as any);
    mockUserRepository.getActiveUsersCount.mockResolvedValue(5);
    mockUserRepository.getVerifiedUsersCount.mockResolvedValue(4);

    const result = await analyticsService.getUsersAnalytics({
      page: 1,
      limit: 10,
      from: new Date("2026-01-01"),
      to: new Date("2026-01-31"),
    });

    expect(result.summary.totalCount).toBe(1);
    expect(result.summary.activeCount).toBe(5);
    expect(result.summary.verifiedCount).toBe(4);
    expect(result.users.data).toHaveLength(1);
  });

  it("returns commerce analytics summary", async () => {
    mockCommerceOrderRepository.findWithPagination.mockResolvedValue({
      data: [{ _id: new Types.ObjectId(), total: 200 }],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    } as any);
    mockCommercePaymentRepository.findWithPagination.mockResolvedValue({
      data: [{ status: "captured", amount: 200 }],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    } as any);
    mockCommerceInvoiceRepository.findWithPagination.mockResolvedValue({
      data: [{ _id: new Types.ObjectId() }],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    } as any);
    mockCommerceSubscriptionRepository.findWithPagination.mockResolvedValue({
      data: [{ _id: new Types.ObjectId() }],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    } as any);
    mockCommerceCouponRepository.findWithPagination.mockResolvedValue({
      data: [{ _id: new Types.ObjectId() }],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    } as any);

    const commerce = await analyticsService.getCommerceAnalytics({
      page: 1,
      limit: 20,
      from: new Date("2026-01-01"),
      to: new Date("2026-01-31"),
    });

    expect(commerce.summary.totalRevenue).toBe(200);
    expect(commerce.summary.totalOrders).toBe(1);
    expect(commerce.summary.totalSubscriptions).toBe(1);
    expect(commerce.orders.data).toHaveLength(1);
    expect(commerce.payments.data).toHaveLength(1);
  });

  it("exports overview analytics report", async () => {
    mockUserRepository.getActiveUsersCount.mockResolvedValue(5);
    mockUserRepository.count.mockResolvedValue(50);
    mockUserRepository.getRecentUsers.mockResolvedValue([] as any);
    mockBookRepository.getTrending.mockResolvedValue([] as any);
    mockArticleRepository.getTopViewed.mockResolvedValue([] as any);
    mockCommercePaymentRepository.findWithPagination.mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    } as any);
    mockCommerceOrderRepository.findWithPagination.mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    } as any);

    const exportResult = await analyticsService.exportAnalytics({
      type: "overview",
      exportFormat: "json",
    });

    expect(exportResult.type).toBe("overview");
    expect(exportResult.exportFormat).toBe("json");
    expect(exportResult.report).toHaveProperty("users");
  });
});
