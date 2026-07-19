import { ApiError } from "../middleware/errorHandler";
import { createPaymentProvider } from "../factories/paymentProviderFactory";
import { commercePaymentRepository } from "../repositories/CommercePaymentRepository";
import { commerceOrderRepository } from "../repositories/CommerceOrderRepository";
import { commerceSubscriptionRepository } from "../repositories/CommerceSubscriptionRepository";
import { commerceInvoiceRepository } from "../repositories/CommerceInvoiceRepository";
import {
  generatePaymentReference,
  generateInvoiceNumber,
  safeJson,
} from "../utils/payment";
import { ICommercePayment } from "../models/CommercePayment";

export class PaymentService {
  private provider = createPaymentProvider();

  async createPayment(
    userId: string,
    input: {
      orderId: string;
      amount: number;
      currency: string;
      subscriptionId?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<ICommercePayment> {
    const order = await commerceOrderRepository.findById(input.orderId);
    if (!order) throw new ApiError(404, "Order not found");

    const providerResult = await this.provider.createPayment({
      orderId: input.orderId,
      amount: input.amount,
      currency: input.currency,
      metadata: input.metadata,
    });
    return commercePaymentRepository.create({
      paymentNumber: generatePaymentReference("txn"),
      order: input.orderId,
      user: userId,
      subscription: input.subscriptionId,
      providerName: providerResult.providerName,
      gatewayName: providerResult.providerName,
      referenceNumber: providerResult.referenceNumber,
      amount: input.amount,
      currency: input.currency,
      status: providerResult.status,
      providerPayload: safeJson(input.metadata || {}),
      providerResponse: safeJson(providerResult.raw || {}),
      attempts: [
        {
          attemptNumber: 1,
          providerName: providerResult.providerName,
          referenceNumber: providerResult.referenceNumber,
          status: providerResult.status,
          payload: input.metadata,
          response: providerResult.raw,
          at: new Date(),
        },
      ],
      auditTrail: [
        {
          event: "create_payment",
          message: "Payment created",
          metadata: providerResult.raw || {},
          at: new Date(),
        },
      ],
    } as any);
  }

  async verifyPayment(
    paymentId: string,
    payload?: Record<string, unknown>,
  ): Promise<ICommercePayment> {
    const payment = await commercePaymentRepository.findById(paymentId);
    if (!payment) throw new ApiError(404, "Payment not found");
    const verified = await this.provider.verifyPayment({
      referenceNumber: payment.referenceNumber,
      payload,
    });
    const updated = await commercePaymentRepository.updateById(paymentId, {
      status: verified ? "authorized" : "failed",
      providerResponse: safeJson(payload || {}),
      auditTrail: [
        ...payment.auditTrail,
        {
          event: "verify_payment",
          message: verified ? "Verified" : "Verification failed",
          metadata: payload || {},
          at: new Date(),
        },
      ],
    } as any);
    if (!updated) throw new ApiError(500, "Failed to verify payment");
    return updated;
  }

  async capturePayment(
    paymentId: string,
    amount?: number,
  ): Promise<ICommercePayment> {
    const payment = await commercePaymentRepository.findById(paymentId);
    if (!payment) throw new ApiError(404, "Payment not found");
    const captured = await this.provider.capturePayment({
      referenceNumber: payment.referenceNumber,
      amount,
    });
    const updated = await commercePaymentRepository.updateById(paymentId, {
      status: "captured",
      capturedAt: new Date(),
      providerResponse: safeJson(captured.raw || {}),
      auditTrail: [
        ...payment.auditTrail,
        {
          event: "capture_payment",
          message: "Captured",
          metadata: captured.raw || {},
          at: new Date(),
        },
      ],
    } as any);
    if (!updated) throw new ApiError(500, "Failed to capture payment");

    await commerceOrderRepository.updateById(payment.order, {
      status: "paid",
      payment: payment._id,
    } as any);
    if (payment.subscription) {
      await commerceSubscriptionRepository.updateById(payment.subscription, {
        status: "active",
        nextBillingAt: undefined,
      } as any);
    }
    await commerceInvoiceRepository.create({
      invoiceNumber: generateInvoiceNumber(),
      user: payment.user,
      order: payment.order,
      subscription: payment.subscription,
      payment: payment._id,
      subtotal: payment.amount,
      total: payment.amount,
      tax: 0,
      discount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      currency: payment.currency,
      status: "issued",
      issuedAt: new Date(),
      downloadUrl: `/api/v1/invoices/${payment._id}/download`,
      history: [
        {
          action: "issue",
          to: "issued",
          note: "Invoice generated after payment capture",
          at: new Date(),
        },
      ],
    } as any);

    return updated;
  }

  async cancelPayment(paymentId: string): Promise<ICommercePayment> {
    const payment = await commercePaymentRepository.findById(paymentId);
    if (!payment) throw new ApiError(404, "Payment not found");
    const cancelled = await this.provider.cancelPayment({
      referenceNumber: payment.referenceNumber,
    });
    const updated = await commercePaymentRepository.updateById(paymentId, {
      status: "cancelled",
      providerResponse: safeJson(cancelled.raw || {}),
      auditTrail: [
        ...payment.auditTrail,
        {
          event: "cancel_payment",
          message: "Cancelled",
          metadata: cancelled.raw || {},
          at: new Date(),
        },
      ],
    } as any);
    if (!updated) throw new ApiError(500, "Failed to cancel payment");
    return updated;
  }

  async refundPayment(
    paymentId: string,
    amount?: number,
  ): Promise<ICommercePayment> {
    const payment = await commercePaymentRepository.findById(paymentId);
    if (!payment) throw new ApiError(404, "Payment not found");
    const refunded = await this.provider.refundPayment({
      referenceNumber: payment.referenceNumber,
      amount,
    });
    const updated = await commercePaymentRepository.updateById(paymentId, {
      status: refunded.status,
      refundedAt: new Date(),
      providerResponse: safeJson(refunded.raw || {}),
      auditTrail: [
        ...payment.auditTrail,
        {
          event: "refund_payment",
          message: "Refund processed",
          metadata: refunded.raw || {},
          at: new Date(),
        },
      ],
    } as any);
    if (!updated) throw new ApiError(500, "Failed to refund payment");
    return updated;
  }

  async getPaymentStatus(paymentId: string): Promise<ICommercePayment> {
    const payment = await commercePaymentRepository.findById(paymentId);
    if (!payment) throw new ApiError(404, "Payment not found");
    await this.provider.getPaymentStatus({
      referenceNumber: payment.referenceNumber,
    });
    return payment;
  }

  async getById(paymentId: string): Promise<ICommercePayment> {
    const payment = await commercePaymentRepository.findById(paymentId);
    if (!payment) throw new ApiError(404, "Payment not found");
    return payment;
  }
  async getByReference(referenceNumber: string) {
    const payment =
      await commercePaymentRepository.findByReferenceNumber(referenceNumber);
    if (!payment) throw new ApiError(404, "Payment not found");
    return payment;
  }
  async listPayments(userId?: string, page = 1, limit = 20) {
    return userId
      ? commercePaymentRepository.findWithPagination({ user: userId } as any, {
          page,
          limit,
          sort: { createdAt: -1 },
        })
      : commercePaymentRepository.findWithPagination(
          {},
          { page, limit, sort: { createdAt: -1 } },
        );
  }
  async attempts(paymentId: string) {
    const payment = await this.getById(paymentId);
    return payment.attempts;
  }
  async auditTrail(paymentId: string) {
    const payment = await this.getById(paymentId);
    return payment.auditTrail;
  }
}

export const paymentService = new PaymentService();
