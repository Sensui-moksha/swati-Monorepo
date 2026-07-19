import { commerceOrderRepository } from "../repositories/CommerceOrderRepository";
import { commerceSubscriptionRepository } from "../repositories/CommerceSubscriptionRepository";
import { commerceInvoiceRepository } from "../repositories/CommerceInvoiceRepository";
import { commerceCouponRepository } from "../repositories/CommerceCouponRepository";
import { commercePaymentRepository } from "../repositories/CommercePaymentRepository";
import { ReportWindow } from "../interfaces/commerce";

export class ReportingService {
  async revenueSummary(window: ReportWindow = {}) {
    const payments = await commercePaymentRepository.findWithPagination(
      {},
      { page: 1, limit: 100 },
    );
    const totalRevenue = payments.data
      .filter((payment) => payment.status === "captured")
      .reduce((sum, payment) => sum + payment.amount, 0);
    return { totalRevenue, count: payments.pagination.total, window };
  }

  async orders(_window: ReportWindow = {}) {
    return commerceOrderRepository.findWithPagination(
      {},
      { page: 1, limit: 100, sort: { createdAt: -1 } },
    );
  }
  async subscriptions(_window: ReportWindow = {}) {
    return commerceSubscriptionRepository.findWithPagination(
      {},
      { page: 1, limit: 100, sort: { createdAt: -1 } },
    );
  }
  async invoices(_window: ReportWindow = {}) {
    return commerceInvoiceRepository.findWithPagination(
      {},
      { page: 1, limit: 100, sort: { createdAt: -1 } },
    );
  }
  async coupons(_window: ReportWindow = {}) {
    return commerceCouponRepository.findWithPagination(
      {},
      { page: 1, limit: 100, sort: { updatedAt: -1 } },
    );
  }
  async transactions(_window: ReportWindow = {}) {
    return commercePaymentRepository.findWithPagination(
      {},
      { page: 1, limit: 100, sort: { createdAt: -1 } },
    );
  }
}

export const reportingService = new ReportingService();
